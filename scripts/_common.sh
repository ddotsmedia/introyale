# Shared helpers. Every compose call is scoped to -p introyale-<env> (CLAUDE.md safety).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dc() { # dc <env> [compose args...]; OVERLAY selects compose.<overlay>.yaml (default: env)
  local env="$1"; shift
  local base="/opt/introyale/${env}"
  [ -d "$base" ] || base="$ROOT/.local/${env}"   # local test envs (no VPS)
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
