#!/usr/bin/env bash
# CI only: throwaway compose stack (db + migrate + web + mailpit), seeded, for Playwright + axe (SPEC 2.6).
# Usage: scripts/ci-stack.sh up | down. Secrets are random and live only in the runner's temp dir.
set -euo pipefail
cd "$(dirname "$0")/.."
T="${RUNNER_TEMP:-/tmp}/introyale-ci"
dcx() { docker compose -p introyale-ci -f compose.yaml -f compose.local.yaml --env-file "$T/.env" "$@"; }
case "${1:?up|down}" in
  up)
    mkdir -p "$T/secrets" "$T/media" "$T/db" "$T/backups"; chmod 777 "$T/media" "$T/backups"
    r() { head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32; }
    dbp="$(r)"
    for f in payload_secret altcha_hmac_key umami_db_password umami_app_secret backup_db_password restic_password; do r > "$T/secrets/$f.txt"; done
    printf '%s' "$dbp" > "$T/secrets/db_password.txt"; : > "$T/secrets/sentry_dsn.txt"; : > "$T/secrets/smtp_password.txt"; : > "$T/secrets/backup_sftp_key.txt"
    printf 'postgres://introyale_app:%s@db:5432/introyale' "$dbp" > "$T/secrets/database_url.txt"
    chmod 644 "$T"/secrets/*.txt; chmod 755 "$T/secrets"
    printf 'WEB_PORT=%s\nMAILPIT_PORT=%s\nSECRETS_DIR=%s/secrets\nMEDIA_DIR=%s/media\nDB_DIR=%s/db\nBACKUP_DIR=%s/backups\n' "${CI_WEB_PORT:-3100}" "${CI_MAILPIT_PORT:-8100}" "$T" "$T" "$T" "$T" > "$T/.env"
    docker build -q -f docker/web.Dockerfile -t introyale-web:local .
    dcx up -d --wait web worker db mailpit
    pnpm -C apps/web build:seed-live; pnpm -C apps/web build:seed-test; pnpm -C apps/web build:seed-motion; pnpm -C apps/web build:admin-user
    seed() { dcx run --rm --no-deps -e PLACEHOLDER_IMAGES=1 -e SEED_ADMIN_EMAIL=admin@introyale.local -v "$PWD/apps/web/dist:/app/cli/seed:ro" web node "/app/cli/seed/$1.js" >/dev/null; }
    seed seed-live-content
    seed seed-test-leads
    seed seed-motion
    # Fresh administrator (no MFA yet) for the MFA regression test; the password comes from the caller's environment.
    if [ -n "${E2E_ADMIN_PW:-}" ]; then
      # One user per test file: concurrent logins of one account race on its session list.
      for u in e2e-admin e2e-api e2e-motion; do
        dcx run --rm --no-deps -e ADMIN_PW="$E2E_ADMIN_PW" -v "$PWD/apps/web/dist:/app/cli/seed:ro" web node /app/cli/seed/admin-user.js create "$u@introyale.local" >/dev/null
      done
    fi
    ;;
  down) dcx down -v --remove-orphans || true ;;
esac
