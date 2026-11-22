#!/usr/bin/env bash
# Usage: scripts/deploy.sh <staging|production> <tag>. Rolls back to last good tag on failure.
# DRY_RUN=1 runs the preflight and a compose dry-run only; nothing is pulled, started or changed.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; tag="${2:?tag}"
case "$env" in staging|production) ;; *) echo "env must be staging|production" >&2; exit 2 ;; esac
base="$(env_base "$env")"; last="$base/.last_good_tag"
[ -n "${GH_OWNER:-}" ] || GH_OWNER="$(. "$base/.env.compose" && echo "${GH_OWNER:-}")"   # per-host value
export IMAGE_TAG="$tag" GH_OWNER="${GH_OWNER:?GH_OWNER}" WEB_IMAGE="ghcr.io/${GH_OWNER}/introyale-web:${tag}"
if [ "${DRY_RUN:-0}" = 1 ]; then
  preflight "$env" "$(docker image ls -q --filter "reference=ghcr.io/${GH_OWNER}/introyale-web" | head -1)"
  dc "$env" config -q && dc "$env" ps -a >/dev/null && echo "dry-run ok: $env $tag (no changes made)"
  exit 0
fi
if [ "$env" = production ]; then dc "$env" exec -T backup /usr/local/bin/backup.sh; fi   # pre-deploy dump
dc "$env" pull migrate web worker
preflight "$env" "$WEB_IMAGE"
dc "$env" up -d db
dc "$env" up --no-deps --abort-on-container-exit --exit-code-from migrate migrate
dc "$env" up -d --no-deps web worker
# First deploy has no content yet: the home page check waits until the seed has run.
[ -f "$last" ] || export SMOKE_HEALTH_ONLY=1
if wait_healthy "introyale-${env}-web-1" 120 && "$(dirname "$0")/smoke.sh" "${SMOKE_BASE:-http://127.0.0.1:${WEB_PORT}}"; then
  mkdir -p "$base" && echo "$tag" > "$last"; echo "deployed $env $tag"
else
  echo "deploy FAILED, rolling back" >&2
  if [ -f "$last" ]; then "$(dirname "$0")/rollback.sh" "$env" "$(cat "$last")"; fi
  exit 1
fi
