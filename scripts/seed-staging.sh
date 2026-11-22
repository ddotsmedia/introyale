#!/usr/bin/env bash
# Usage: SEED_ADMIN_EMAIL=<email> scripts/seed-staging.sh <image-tag> <import-dir>
# One-time live-site content import for staging (no test leads, no test accounts). Prints the admin's
# one-time password once; it is not stored. The admin must enrol MFA at first login.
source "$(dirname "$0")/_common.sh"
tag="${1:?image tag}"; imp="${2:?import dir (contains images/)}"; : "${SEED_ADMIN_EMAIL:?SEED_ADMIN_EMAIL}"
base="$(env_base staging)"; . "$base/.env.compose"
export IMAGE_TAG="$tag" GH_OWNER
dc staging run --rm --no-deps -T -e SEED_ADMIN_EMAIL -v "$imp:/import:ro" web node /app/cli/dist/seed-live-content.js
