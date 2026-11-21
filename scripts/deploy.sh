#!/usr/bin/env bash
# Usage: scripts/deploy.sh <staging|production> <tag>. Rolls back to last good tag on failure.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; tag="${2:?tag}"
case "$env" in staging|production) ;; *) echo "env must be staging|production" >&2; exit 2 ;; esac
base="/opt/introyale/${env}"; last="$base/.last_good_tag"
export IMAGE_TAG="$tag" GH_OWNER="${GH_OWNER:?GH_OWNER}" WEB_IMAGE="ghcr.io/${GH_OWNER}/introyale-web:${tag}"
if [ "$env" = production ]; then dc "$env" exec -T backup /usr/local/bin/backup.sh; fi   # pre-deploy dump
dc "$env" pull migrate web worker
dc "$env" up -d db
dc "$env" up --no-deps --abort-on-container-exit --exit-code-from migrate migrate
dc "$env" up -d --no-deps web worker
if wait_healthy "introyale-${env}-web-1" 120 && "$(dirname "$0")/smoke.sh" "${SMOKE_BASE:-http://127.0.0.1:${WEB_PORT}}"; then
  mkdir -p "$base" && echo "$tag" > "$last"; echo "deployed $env $tag"
else
  echo "deploy FAILED, rolling back" >&2
  if [ -f "$last" ]; then "$(dirname "$0")/rollback.sh" "$env" "$(cat "$last")"; fi
  exit 1
fi
