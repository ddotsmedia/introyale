#!/bin/sh
# Nightly 02:30 Asia/Dubai (SPEC §2.8). Plain loop: busybox crond cannot switch users when the container runs as non-root, so it never fired.
while :; do
  if [ "$(date +%H%M)" = "0230" ]; then /usr/local/bin/backup.sh || echo "backup FAILED" >&2; sleep 90; fi
  sleep 20
done
