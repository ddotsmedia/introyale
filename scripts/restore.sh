#!/usr/bin/env bash
# Usage: scripts/restore.sh <env> <dump-file> [--promote]
# Restores into scratch DB introyale_restore, verifies, and promotes only with --promote.
source "$(dirname "$0")/_common.sh"
env="${1:?env}"; dump="${2:?dump file}"; promote="${3:-}"
[ -f "$dump" ] || { echo "no such dump" >&2; exit 2; }
db="$(dc "$env" ps -q db)"; [ -n "$db" ] || { echo "db not running for $env" >&2; exit 1; }
dc "$env" exec -T db dropdb -U introyale_app --if-exists introyale_restore
dc "$env" exec -T db createdb -U introyale_app introyale_restore
dc "$env" exec -T db pg_restore -U introyale_app -d introyale_restore --no-owner < "$dump"
for t in users payload_migrations; do
  n="$(dc "$env" exec -T db psql -U introyale_app -d introyale_restore -tAc "SELECT count(*) FROM ${t}")"
  echo "verify ${t}: ${n} rows"
done
if [ "$promote" = "--promote" ]; then
  dc "$env" exec -T db psql -U introyale_app -d postgres -c "ALTER DATABASE introyale RENAME TO introyale_pre_restore"
  dc "$env" exec -T db psql -U introyale_app -d postgres -c "ALTER DATABASE introyale_restore RENAME TO introyale"
  echo "promoted introyale_restore -> introyale (previous kept as introyale_pre_restore)"
else
  echo "restore verified in introyale_restore; re-run with --promote to switch"
fi
