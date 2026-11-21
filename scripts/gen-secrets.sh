#!/usr/bin/env bash
# Usage: scripts/gen-secrets.sh <dev|staging|production> [--rotate]
# Writes secrets/<env>/*.txt with no trailing newline (Postgres reads password files raw). Never prints values.
set -euo pipefail
env_name="${1:?env required}"
rotate="${2:-}"
case "$env_name" in dev|staging|production) ;; *) echo "bad env" >&2; exit 2 ;; esac
dir="secrets/$env_name"
mkdir -p "$dir" && chmod 700 "$dir"
gen() {
  if [ "$rotate" = "--rotate" ] || [ ! -s "$dir/$1.txt" ]; then
    openssl rand -hex 32 | tr -d '\r\n' > "$dir/$1.txt"
    chmod 600 "$dir/$1.txt"
  fi
}
for n in payload_secret db_password umami_db_password umami_app_secret backup_db_password restic_password altcha_hmac_key; do gen "$n"; done
for n in smtp_password backup_sftp_key sentry_dsn; do [ -e "$dir/$n.txt" ] || { : > "$dir/$n.txt"; chmod 600 "$dir/$n.txt"; }; done
printf 'postgres://introyale_app:%s@db:5432/introyale' "$(cat "$dir/db_password.txt")" > "$dir/database_url.txt"
chmod 600 "$dir/database_url.txt"
echo "secrets ready: $dir (values not shown)"
