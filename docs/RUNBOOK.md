# Runbook

Status: M2 complete (local). Ports and VPS details filled at M11.

## Local dev

```
bash scripts/gen-secrets.sh dev
docker compose -p introyale-dev -f compose.yaml -f compose.dev.yaml up -d --build
# web http://127.0.0.1:3000 · mailpit http://127.0.0.1:8025 · db 127.0.0.1:55432
```

Dev DB uses a host port on a non-internal network (Docker does not publish ports on internal networks).

## Deploy / rollback (VPS, M11+)

- `GH_OWNER=<owner> scripts/deploy.sh staging <sha>`; production adds a pre-deploy backup.
- Failed health or smoke → automatic rollback to `/opt/introyale/<env>/.last_good_tag`.
- Manual: `GH_OWNER=<owner> scripts/rollback.sh <env> <tag>`.

## Restore

- `scripts/restore.sh <env> <dump> ` restores into `introyale_restore` and verifies; `--promote` renames it live (previous kept as `introyale_pre_restore`).

## Safety

- Every compose call is `-p introyale-<env>`. No prune, no global restarts. Nginx: `nginx -t && systemctl reload nginx` only.

## Local preview (production build on localhost)

Not a deployment. Ports are fixed: web `3100`, Mailpit UI `8100`. Re-check both are free before `up`
(`Get-NetTCPConnection -State Listen -LocalPort 3100,8100`). Do not use 3110 (another process owns it).

- Public site: http://localhost:3100
- Admin: http://localhost:3100/admin (`admin@introyale.local`; the one-time password is printed by the seed run, not stored)
- Mailpit: http://127.0.0.1:8100
- Files: `.env.local` (ports, binds), `secrets/local/` (generated, gitignored), `.local-data/` (media, db, backups; gitignored)

Build and start:

```
docker build -f docker/web.Dockerfile -t introyale-web:local .
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local up -d web worker db mailpit
```

Migrate (runs automatically as a dependency; to run by hand): `docker compose ... run --rm --no-deps migrate`.

Import the live site content (one-time; refuses unless `ENV=local`; skips records that exist, so admin edits are never overwritten). The images come from `.local-data/import/`, downloaded read-only from introyale.com (see docs/import-manifest.csv):

```
pnpm -C apps/web build:seed-live
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local run --rm --no-deps -v "<abs path to apps/web/dist>:/app/cli/seed:ro" -v "<abs path to .local-data/import>:/import:ro" web node /app/cli/seed/seed-live-content.js
```

Demo leads and role users for the admin (local only; prints the role users' passwords once):

```
pnpm -C apps/web build:seed-test
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local run --rm --no-deps -v "<abs path to apps/web/dist>:/app/cli/seed:ro" web node /app/cli/seed/seed-test-leads.js
```

Stop: `docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local stop`
Remove the containers only (keeps `.local-data/`): `... down`

Local-only settings: `ENV=local`, `MFA_ENFORCE=false` (admin MFA bypass; refused by the app at boot in any other ENV, see `src/lib/envPolicy.ts`), `ROBOTS_NOINDEX=true`, `FEATURE_AR=false`. The database is not published to the host.

Facts are marked verified with source introyale.com on the owner's instruction. Project names, locations and years, and client names, were never published on the live site, so they are empty or marked `[CONFIRM]` in admin-only fields.
