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

- There is no staging environment (owner decision). CI deploys **production** on every push to main, after verify, image scan (Trivy), browser (Playwright + axe) and publish pass: `deploy-production` over SSH as `introyale-deploy`. By hand: `INTROYALE_BASE=<base> scripts/deploy.sh production <tag>`; `DRY_RUN=1` runs the preflight and config check only. Host dir owners: `media/` uid 10001, `backups/` uid 10002 (backup container). Every deploy first takes a pre-deploy backup (pg_dump + restic); if it fails, nothing changes.
- Images: `introyale-web` (Next standalone only, ~470 MB) runs the site; `introyale-cli` (Payload runtime: migrate, worker, seed scripts) runs `migrate`/`worker`; `introyale-backup`. Deploy aborts before pulling if free disk < 5 GB (`MIN_FREE_GB`), and after a healthy deploy removes every other tag of these three images by exact ref (never prune, never -f; images in use are kept), leaving only the running tag (= `.last_good_tag`).
- Failed health or smoke → automatic rollback to `<base>/<env>/.last_good_tag` (base = `/opt/introyale`; on the VPS `/home/introyale-deploy/introyale`, because Snap Docker cannot bind-mount `/opt`).
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
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local run --rm --no-deps -e MEDIA_DIR=/media -v "<abs path to media>:/media" -v "<abs path to apps/web/dist>:/app/cli/seed:ro" -v "<abs path to .local-data/import>:/import:ro" worker node /app/cli/seed/seed-live-content.js
```

Demo leads and role users for the admin (local only; prints the role users' passwords once):

```
pnpm -C apps/web build:seed-test
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local run --rm --no-deps -e MEDIA_DIR=/media -v "<abs path to media>:/media" -v "<abs path to apps/web/dist>:/app/cli/seed:ro" worker node /app/cli/seed/seed-test-leads.js
```

Locked out or forgotten admin password (local only; clears the lockout, prints a new random password once, stores nothing):

```
pnpm -C apps/web build:reset-admin-password
docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local run --rm --no-deps -e MEDIA_DIR=/media -v "<abs path to media>:/media" -v "<abs path to apps/web/dist>:/app/cli/seed:ro" worker node /app/cli/seed/reset-admin-password.js admin@introyale.local
```

Stop: `docker compose -p introyale-local -f compose.yaml -f compose.local.yaml --env-file .env.local stop`
Remove the containers only (keeps `.local-data/`): `... down`

Local-only settings: `ENV=local`, `ROBOTS_NOINDEX=true`, `FEATURE_AR=false`. The database is not published to the host.

Facts are marked verified with source introyale.com on the owner's instruction. Project names, locations and years, and client names, were never published on the live site, so they are empty or marked `[CONFIRM]` in admin-only fields.

## Production (introyale.online)

- Host Nginx (`/etc/nginx/sites-available/introyale-online`, repo copies `docker/nginx/introyale-online.conf`) → `127.0.0.1:3140`. HSTS on, indexable (no basic auth, `ROBOTS_NOINDEX=false`). `www.introyale.online` returns 301 to `https://introyale.online`. Certificates: certbot webroot (`certbot certonly --webroot -w /var/www/html -d introyale.online -d www.introyale.online`).
- Per-host config: `<base>/production/.env.compose` (GH_OWNER, WEB_PORT, FEATURE_EMAIL). Secrets: `<base>/production/secrets/` (`scripts/gen-secrets.sh`). SMTP: add `secrets/smtp.env` (SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM, STAFF_EMAIL) and the password in `smtp_password.txt`, then set `FEATURE_EMAIL=true`. Until then leads are stored and email jobs are paused.
- The stack was promoted from the former staging stack on 2026-11-22: the data directories were moved (not copied) to `<base>/production` after a pg_dump and a media archive (kept in `<base>/production/backups/pre-production-*`).
- Legal pages (Privacy, Terms, Cookies, Accessibility) are CMS pages with an admin-only review note. Create or restore them with `SEED_ADMIN_EMAIL=<admin> scripts/seed-legal.sh <tag>` (never overwrites edits; `RESEED_LEGAL=1` replaces them with the template text, only before the owner has edited them).

### Registry access and CI (private repo)

- The GitHub repo and the GHCR packages are private. The VPS reads the repo with a read-only deploy key (`introyale-vps-read`, private key in `~introyale-deploy/.ssh/repo_deploy`, remote `git@github.com:ddotsmedia/introyale.git`). Rotate: create a new key on the VPS, add it with `gh repo deploy-key add`, delete the old one.
- Image pulls use the CI run's `GITHUB_TOKEN` (piped over SSH, logged out on exit). Nothing is stored on the VPS. To deploy by hand from the VPS, `docker login ghcr.io` with a classic token that has `read:packages` and log out afterwards.
- Package visibility has no API: GitHub → profile → Packages → `introyale-web` / `introyale-backup` → Package settings → Change visibility → Private.
- CI `browser` job: `scripts/ci-stack.sh up` builds the image and starts a throwaway stack with random secrets (ENV=local, placeholder images), runs the whole Playwright suite, then `down`. Run it locally on free ports: `CI_WEB_PORT=3190 CI_MAILPIT_PORT=8190 RUNNER_TEMP=<abs tmp> scripts/ci-stack.sh up`.
- Two-factor authentication is optional for every role. A user turns it on or off under Account → Two-factor authentication (QR or key, confirm a code, save the recovery codes; turning it off needs the current password and a code). Once on, sign-in goes to `/admin/mfa` for the code. A locked-out user can be reset by an administrator (Security view → reset MFA). Temporary test admins: `ADMIN_PW=<16+ chars> node /app/cli/dist/admin-user.js create tmp-<name>@introyale.online` (production also needs `TEMP_ADMIN=yes`), then `delete` the same email. Only `tmp-*` and `e2e-*` emails are accepted.

## Motion layer (public site)

- **Switches (CMS):** Admin → Globals → _Motion settings_: master on/off, intensity (subtle, standard, expressive), 26 per-effect switches, the extra hero slideshow images and the slide time. Read on every request, so a change shows without a rebuild. Master off (or reduced motion, or save-data) shows the static site with all content visible.
- **Home sections:** _Statement_, _Before/after spotlight_, plus display options on existing blocks (_Featured work_: grid or pinned horizontal gallery; _Client logos_: grid or two-row marquee). All reorderable and hideable in the home page editor.
- **One-time setup on an existing site** (idempotent, never overwrites edits): `SEED_ADMIN_EMAIL=<admin> scripts/seed-motion.sh <tag>` creates blur-up placeholders for existing images, picks hero slideshow images, adds the Statement section and chooses the horizontal gallery and marquee on first run. `REGEN_LQIP=1` rebuilds placeholders; `FORCE_HOME=1` re-applies the display styles.
- **Where the code is:** `apps/web/src/styles/motion.css` and `motion-2.css` (CSS first: scroll-driven animations, View Transitions, transforms and opacity only), `components/motion/` (hero controls and one lazily loaded runtime for transitions, magnetic buttons, cursor bubble, floating image, blur-up, footer curtain and back-to-top), `lib/motionFx.ts` (the effect list).
- **Budgets checked in CI:** initial JS under 150 KB gzip with the runtime as a separate lazy chunk, reduced-motion static version, keyboard access, axe on every page.

## Analytics, dashboard and CRM extras (admin v3)

- **First-party, cookieless analytics** in the existing Postgres (no extra container). Tracker `public/a.js` (built from `apps/web/src/tracker/a.ts` by `pnpm build:tracker`, under 1 KB gzip) loads after the page is idle and posts to `/api/a/collect`. It is skipped for Do Not Track, Global Privacy Control and automated browsers; the server also drops bots, signed-in staff (`payload-token` cookie), invalid or oversized (> 2 KB) payloads, and rate-limits 120 hits per IP per minute.
- **Visitor id** = hash(daily random salt + IP + user agent). The salt lives in `analytics_salts` and is deleted the next day, so ids never link across days and no raw IP is stored. Visitors are therefore counted per day.
- **Tables** (migration `m16_analytics_tables`): `analytics_sessions`, `analytics_events` (raw, 90 days), `analytics_daily` (aggregates, 25 months), `analytics_salts`, `analytics_meta`, `lead_tasks`. Days are Dubai calendar days. The worker runs `analyticsNightly` (rollup + purge) shortly after midnight Dubai; the admin views also refresh today's aggregates at most once a minute. `analyticsWeeklyReport` emails administrators on Mondays from 08:00 (only when `FEATURE_EMAIL` is not `false`).
- **Enquiries** store `attribution` (first and last touch, pages viewed that day), `score` with reasons, and `firstContactAt` (SLA clock). Settings (monthly goal, SLA hours, stage probabilities) are in Consultation settings, group CRM.
- **Admin**: `/admin/analytics` (range picker, compare, realtime, funnel, vitals, CSV per table, print to PDF), the dashboard (per-user layout, reset to the role default), `/admin/calendar`, bulk actions and merge on leads, Ctrl/Cmd+K palette, Insights card on project, service and page edit views.
- **Export**: any table as CSV from Analytics > Export (`/api/admin-tools/analytics-csv?table=pages&range=30d`), audited. Lead CSV (administrators) accepts `ids`.
- **Storage**: about 3.7 KB per visit (measured on 60 days of demo data); the card at the bottom of Analytics shows live numbers and growth per 10,000 visits.
- **Demo data (local only)**: `pnpm -C apps/web build:seed-analytics-demo` then run `dist/seed-analytics-demo.js` on the worker service with `ENV=local`. It refuses to run elsewhere and clears the analytics tables first. Never run it on production.
- **Privacy pages**: Privacy and Cookie Policy text describes this analytics. Existing production pages are not overwritten by `seed-legal.sh`; update them in the admin (they carry an owner-review note).
