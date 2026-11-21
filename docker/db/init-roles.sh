#!/bin/sh
# Runs once on first DB init. Creates umami DB and least-privilege roles (SPEC §5.5).
set -eu
umami_pw="$(cat /run/secrets/umami_db_password)"
backup_pw="$(cat /run/secrets/backup_db_password)"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE umami LOGIN PASSWORD '${umami_pw}';
CREATE DATABASE umami OWNER umami;
CREATE ROLE backup LOGIN PASSWORD '${backup_pw}';
GRANT CONNECT ON DATABASE introyale TO backup;
GRANT USAGE ON SCHEMA public TO backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO backup;
CREATE EXTENSION IF NOT EXISTS vector;
SQL
