#!/bin/sh
# pg_dump -Fc + restic snapshot of media. Writes /backups/last_success for the healthcheck.
set -eu
umask 077   # dumps hold personal data: owner-only
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
dump="/backups/dumps/introyale-${stamp}.dump"
mkdir -p /backups/dumps
# Remove a partial dump and fail loudly; last_success is only written on full success.
trap 'rm -f "$dump"; echo "backup FAILED" >&2' ERR
PGPASSWORD="$(cat "$PGPASSWORD_FILE")" pg_dump -Fc -f "$dump"
restic init -q 2>/dev/null || true
restic backup -q "$dump" /media
if [ -n "${BACKUP_SFTP_TARGET:-}" ] && [ -f /run/secrets/backup_sftp_key ]; then
  RESTIC_REPOSITORY="$BACKUP_SFTP_TARGET" restic init -q 2>/dev/null || true
  RESTIC_REPOSITORY="$BACKUP_SFTP_TARGET" restic backup -q "$dump" /media
fi
restic forget -q --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
find /backups/dumps -name '*.dump' -mtime +14 -delete
date +%s > /backups/last_success
echo "backup ok ${stamp}"
