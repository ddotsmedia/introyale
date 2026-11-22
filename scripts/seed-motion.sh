#!/usr/bin/env bash
# Usage: SEED_ADMIN_EMAIL=<existing admin> scripts/seed-motion.sh <image-tag>   (production)
# Idempotent: blur-up placeholders for existing media, hero slideshow images, new home sections. Never overwrites edits.
source "$(dirname "$0")/_common.sh"
tag="${1:?image tag}"; : "${SEED_ADMIN_EMAIL:?SEED_ADMIN_EMAIL}"
base="$(env_base production)"; . "$base/.env.compose"
export IMAGE_TAG="$tag" GH_OWNER
dc production run --rm --no-deps -T -e SEED_ADMIN_EMAIL -e MEDIA_DIR=/media -v "$MEDIA_DIR:/media" worker node /app/cli/dist/seed-motion.js
