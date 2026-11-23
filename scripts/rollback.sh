#!/usr/bin/env bash
# Usage: scripts/rollback.sh production <previous-tag>. Re-pulls that tag from ghcr.io (old images are not kept on the VPS),
# redeploys it, then drops the failed tag. Schema is expand/contract. DRY_RUN=1 checks disk, manifests and compose only.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; tag="${2:?tag}"
case "$env" in production) ;; *) echo "env must be production" >&2; exit 2 ;; esac
base="$(env_base "$env")"
[ -n "${GH_OWNER:-}" ] || GH_OWNER="$(. "$base/.env.compose" && echo "${GH_OWNER:-}")"
export IMAGE_TAG="$tag" GH_OWNER="${GH_OWNER:?GH_OWNER}" WEB_IMAGE="ghcr.io/${GH_OWNER}/introyale-web:${tag}"
check_disk "${MIN_FREE_GB:-5}"
check_disk_for "$GH_OWNER" "$tag"
if [ "${DRY_RUN:-0}" = 1 ]; then
  dc "$env" config -q && echo "dry-run ok: would pull $tag from ghcr.io, switch web+worker, then remove other introyale tags (no changes made)"
  exit 0
fi
failed="$(docker inspect -f '{{.Config.Image}}' "introyale-${env}-web-1" 2>/dev/null | sed 's/.*://')" || failed=""
dc "$env" pull web worker backup
dc "$env" up -d --no-deps web worker backup
wait_healthy "introyale-${env}-web-1" 120
[ -z "$failed" ] || [ "$failed" = "$tag" ] || prune_old_images "$GH_OWNER" "$tag" || true
echo "rolled back $env to $tag"
