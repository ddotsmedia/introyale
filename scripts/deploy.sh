#!/usr/bin/env bash
# Usage: scripts/deploy.sh production <tag>. Rolls back to last good tag on failure.
# DRY_RUN=1 runs the preflight and a compose dry-run only; nothing is pulled, started or changed.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; tag="${2:?tag}"
case "$env" in production) ;; *) echo "env must be production" >&2; exit 2 ;; esac
base="$(env_base "$env")"; last="$base/.last_good_tag"
[ -n "${GH_OWNER:-}" ] || GH_OWNER="$(. "$base/.env.compose" && echo "${GH_OWNER:-}")"   # per-host value
export IMAGE_TAG="$tag" GH_OWNER="${GH_OWNER:?GH_OWNER}" WEB_IMAGE="ghcr.io/${GH_OWNER}/introyale-web:${tag}"
if [ "${DRY_RUN:-0}" = 1 ]; then
  check_disk "${MIN_FREE_GB:-5}"
  preflight "$env" "$(docker image ls -q --filter "reference=ghcr.io/${GH_OWNER}/introyale-web" | head -1)"
  dc "$env" config -q && dc "$env" ps -a >/dev/null && echo "dry-run ok: $env $tag (no changes made)"
  exit 0
fi
check_disk "${MIN_FREE_GB:-5}"
dc "$env" pull migrate web worker backup
preflight "$env" "$WEB_IMAGE"
# Pre-deploy dump (pg_dump + restic) must succeed before anything changes.
dc "$env" up -d db backup
dc "$env" exec -T backup /usr/local/bin/backup.sh
dc "$env" up -d db
dc "$env" up --no-deps --abort-on-container-exit --exit-code-from migrate migrate
dc "$env" up -d --no-deps web worker
# First deploy has no content yet: the home page check waits until the seed has run.
[ -f "$last" ] || export SMOKE_HEALTH_ONLY=1
if wait_healthy "introyale-${env}-web-1" 120 && "$(dirname "$0")/smoke.sh" "${SMOKE_BASE:-http://127.0.0.1:${WEB_PORT}}"; then
  mkdir -p "$base" && echo "$tag" > "$last"; echo "deployed $env $tag"
  prune_old_images "$GH_OWNER" "$tag" "$(cat "$last")" || true
else
  echo "deploy FAILED, rolling back" >&2
  if [ -f "$last" ]; then "$(dirname "$0")/rollback.sh" "$env" "$(cat "$last")"; fi
  exit 1
fi
