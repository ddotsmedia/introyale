#!/usr/bin/env bash
# Usage: scripts/rollback.sh production <previous-tag>. Redeploys the image; schema is expand/contract.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; tag="${2:?tag}"
case "$env" in production) ;; *) echo "env must be production" >&2; exit 2 ;; esac
export IMAGE_TAG="$tag" GH_OWNER="${GH_OWNER:?GH_OWNER}" WEB_IMAGE="ghcr.io/${GH_OWNER}/introyale-web:${tag}"
dc "$env" up -d --no-deps web worker
wait_healthy "introyale-${env}-web-1" 120
echo "rolled back $env to $tag"
