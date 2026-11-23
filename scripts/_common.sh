# Shared helpers. Every compose call is scoped to -p introyale-<env> (CLAUDE.md safety).
# INTROYALE_BASE is the parent of the per-env dirs (default /opt/introyale). The Snap build of Docker cannot
# bind-mount /opt, so the VPS sets it to <deploy-home>/introyale (decisions-log).
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
# stale_tags <keep-tag>...: reads image tags on stdin, prints those NOT in the keep list (never the running or last-good tag).
stale_tags() {
  local t k keep
  while IFS= read -r t || [ -n "$t" ]; do
    [ -n "$t" ] && [ "$t" != "<none>" ] || continue
    keep=0; for k in "$@"; do [ -n "$k" ] && [ "$t" = "$k" ] && keep=1; done
    [ "$keep" = 1 ] || echo "$t"
  done
}
# prune_old_images <owner> <running-tag>: keeps ONLY the running tag of each introyale image (rollback re-pulls from ghcr.io).
# Removes by exact ref (no prune, no -f: images in use stay), then dangling layers carrying our source label.
prune_old_images() {
  local owner="$1" run="$2" repo t id
  for repo in introyale-web introyale-cli introyale-backup; do
    docker image ls --format '{{.Tag}}' "ghcr.io/${owner}/${repo}" | stale_tags "$run" | while IFS= read -r t; do
      docker rmi "ghcr.io/${owner}/${repo}:${t}" >/dev/null 2>&1 && echo "removed ${repo}:${t}" || echo "kept ${repo}:${t} (in use)"
    done
  done
  for id in $(docker image ls -q --filter dangling=true --filter "label=org.opencontainers.image.source=${IMAGE_SOURCE}"); do
    docker rmi "$id" >/dev/null 2>&1 && echo "removed dangling $id" || true
  done
}
IMAGE_SOURCE="https://github.com/ddotsmedia/introyale"
# image_bytes <ref>: registry manifest size (config + layers, compressed) via `docker manifest inspect`; 0 if unavailable.
image_bytes() {
  docker manifest inspect "$1" 2>/dev/null | grep -o '"size": *[0-9]*' | tr -dc '0-9
' | awk '{s+=$1} END{print s+0}' || true   # unauthenticated/unreachable registry => 0, never abort
}
# check_disk_for <GH_OWNER> <tag>: abort before pulling unless free disk >= unpacked size of the new images (2x compressed manifest) + 3 GB.
check_disk_for() {
  local owner="$1" tag="$2" r b total=0 need free
  for r in introyale-web introyale-cli introyale-backup; do b="$(image_bytes "ghcr.io/${owner}/${r}:${tag}")"; total=$((total + b)); done
  [ "$total" -gt 0 ] || total=$((750 * 1024 * 1024))   # manifest unreadable: assume the 1.5 GB image budget unpacked
  need=$(( (total * 2 + 3 * 1024 * 1024 * 1024 + 1073741823) / 1073741824 ))
  free="$(df -BG --output=avail / | tail -1 | tr -dc '0-9')"
  [ "${free:-0}" -ge "$need" ] || { echo "deploy aborted: ${free}G free on /, need ${need}G (new images ~$((total * 2 / 1048576)) MB + 3 GB headroom)" >&2; return 1; }
  echo "disk ok: ${free}G free, need ${need}G"
}
# check_disk <min-GB> [path]: abort a deploy before pulling if free space is too low.
check_disk() {
  local min="$1" free; free="$(df -BG --output=avail "${2:-/}" | tail -1 | tr -dc '0-9')"
  [ "${free:-0}" -ge "$min" ] || { echo "deploy aborted: only ${free}G free on ${2:-/}, need ${min}G" >&2; return 1; }
}
