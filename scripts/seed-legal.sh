#!/usr/bin/env bash
# Usage: SEED_ADMIN_EMAIL=<existing admin> scripts/seed-legal.sh <image-tag>
# Idempotent: creates the Privacy, Terms, Cookies and Accessibility pages and the footer links if missing.
source "$(dirname "$0")/_common.sh"
tag="${1:?image tag}"; : "${SEED_ADMIN_EMAIL:?SEED_ADMIN_EMAIL}"
base="$(env_base production)"; . "$base/.env.compose"
export IMAGE_TAG="$tag" GH_OWNER
dc production run --rm --no-deps -T -e SEED_ADMIN_EMAIL -e RESEED_LEGAL web node /app/cli/dist/seed-legal.js
