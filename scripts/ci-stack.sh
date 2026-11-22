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
    pnpm -C apps/web build:seed-live; pnpm -C apps/web build:seed-test
    seed() { dcx run --rm --no-deps -e PLACEHOLDER_IMAGES=1 -v "$PWD/apps/web/dist:/app/cli/seed:ro" web node "/app/cli/seed/$1.js" >/dev/null; }
    seed seed-live-content
    seed seed-test-leads
    ;;
  down) dcx down -v --remove-orphans || true ;;
esac
