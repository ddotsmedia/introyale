#!/usr/bin/env bash
# Usage: scripts/smoke.sh <base-url>. Asserts status and key text; extended as pages land (SPEC §7).
set -euo pipefail
base="${1:?base url}"; fail=0
check() { # check <path> <expected-substring>
  local body code
  code="$(curl -s -o /tmp/smoke.$$ -w '%{http_code}' -m 20 "$base$1" || echo 000)"
  body="$(cat /tmp/smoke.$$ 2>/dev/null || true)"; rm -f /tmp/smoke.$$
  if [ "$code" = 200 ] && grep -q -- "$2" <<<"$body"; then echo "ok   $1"; else echo "FAIL $1 ($code)"; fail=1; fi
}
check /api/health '"db":true'
check / 'Introyale'
exit $fail
