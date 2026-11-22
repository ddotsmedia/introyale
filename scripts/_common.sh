# Shared helpers. Every compose call is scoped to -p introyale-<env> (CLAUDE.md safety).
# INTROYALE_BASE is the parent of the per-env dirs (default /opt/introyale). The Snap build of Docker cannot
# bind-mount /opt, so the staging VPS sets it to /home/introyale-deploy/introyale (decisions-log).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_base() { local b="${INTROYALE_BASE:-/opt/introyale}/$1"; [ -d "$b" ] || b="$ROOT/.local/$1"; echo "$b"; }
dc() { # dc <env> [compose args...]; OVERLAY selects compose.<overlay>.yaml (default: env)
  local env="$1"; shift
  local base; base="$(env_base "$env")"   # local test envs fall back to .local/<env> (no VPS)
  set -a; [ -f "$base/.env.compose" ] && . "$base/.env.compose"; set +a
  export SECRETS_DIR="${SECRETS_DIR:-$base/secrets}" MEDIA_DIR="${MEDIA_DIR:-$base/media}"
  export DB_DIR="${DB_DIR:-$base/db}" BACKUP_DIR="${BACKUP_DIR:-$base/backups}"
  docker compose -p "introyale-${env}" -f "$ROOT/compose.yaml" -f "$ROOT/compose.${OVERLAY:-$env}.yaml" "${@}"
}
wait_healthy() { # wait_healthy <container> <seconds>
  local end=$((SECONDS + $2)); local s=""
  while [ $SECONDS -lt $end ]; do
    s="$(docker inspect -f '{{.State.Health.Status}}' "$1" 2>/dev/null || echo none)"
    [ "$s" = healthy ] && return 0
    sleep 3
  done
  echo "not healthy: $1 ($s)" >&2; return 1
}
# preflight <env> <image>: everything deploy needs, checked before any change. The mount probe uses the daemon's
# own view of the paths (catches Snap confinement and permission problems that `compose config` cannot).
preflight() {
  local env="$1" image="$2" base; base="$(env_base "$env")"; local bad=0
  for f in .env.compose; do [ -f "$base/$f" ] || { echo "preflight: missing $base/$f" >&2; bad=1; }; done
  for d in media db backups secrets; do [ -d "$base/$d" ] || { echo "preflight: missing dir $base/$d" >&2; bad=1; }; done
  for s in payload_secret database_url db_password umami_db_password umami_app_secret backup_db_password restic_password altcha_hmac_key sentry_dsn smtp_password backup_sftp_key; do
    [ -f "$base/secrets/$s.txt" ] || { echo "preflight: missing secret $s" >&2; bad=1; }
  done
  [ -f "$ROOT/docker/db/init-roles.sh" ] || { echo "preflight: repo checkout incomplete" >&2; bad=1; }
  [ "$bad" = 0 ] || return 1
  local p
  for p in "$base/secrets/db_password.txt" "$base/media" "$base/db" "$ROOT/docker/db/init-roles.sh"; do
    docker run --rm --entrypoint /bin/sh -v "$p:/probe:ro" "$image" -c 'test -e /probe' >/dev/null 2>&1 \
      || { echo "preflight: docker cannot mount $p (Snap Docker cannot read /opt: set INTROYALE_BASE to a home path)" >&2; return 1; }
  done
  dc "$env" config -q || return 1
  echo "preflight ok"
}
