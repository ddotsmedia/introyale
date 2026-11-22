---
title: 'Introyale Interiors: Pre-Build Specification'
subtitle: 'Hostinger VPS + Docker architecture, launch scope, models and implementation sequence'
date: '21 November 2026 · v1.0 · for approval before production code'
---

# 0. Status and ground rules

- **Purpose:** the required first response before any production code. It reconciles the Development Brief (authority for architecture, performance, security, accessibility, CMS governance, SEO/redirects, testing, migration, deployment and launch criteria) with the Website Blueprint (authority for vision, sitemap, page experience, visual design, components and roadmap).
- **Hosting:** Hostinger VPS only. The full production system runs on Docker and Docker Compose. No Vercel, Netlify, shared hosting or other platform.
- **Build:** the whole site is built through Claude Code. No external agency is assumed.
- **Old site:** introyale.com is never modified. The new website launches on introyale.online.
- **Facts:** nothing is invented. Every business fact is marked **[CONFIRM]** until it is verified in the Facts Register.
- **Managed services** (Cloudflare, R2, SaaS email, CRM, analytics, booking): these are optional adapters. The site runs fully without any of them.

# 1. Assumptions and contradictions

## 1.1 Contradictions resolved

| #   | Conflict                                                                                                           | Source(s)                                     | Resolution                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Vercel hosting, Vercel Firewall, Vercel Analytics and Speed Insights, preview deployments                          | Brief §1, §12; earlier plans                  | **Replaced.** Hostinger VPS + Docker Compose. Edge protection comes from the reverse proxy and the app. Analytics is self-hosted Umami. Previews are replaced by local Docker and a staging stack. Rollback is by image tag.                                                                                           |
| C2  | Cloudflare WAF, CDN and R2 listed as required                                                                      | Brief §1, §11                                 | **Optional.** Baseline security (rate limits, headers, bot protection) works without Cloudflare. Media lives on a persistent VPS volume. Cloudflare and R2 are adapters, enabled only if approved.                                                                                                                     |
| C3  | Resend/Postmark, HubSpot/Zoho required for leads                                                                   | Brief §1, §10                                 | **Optional adapters.** The `Enquiries` collection is the system of record. Email goes through any SMTP server. A CRM adapter is enabled when the CRM is approved. A lead is never lost if email or CRM is down (outbox + retries + alert).                                                                             |
| C4  | Compose must include a reverse proxy with Let's Encrypt, but the shared VPS already has host Nginx on ports 80/443 | Instruction §3 vs current VPS                 | **Two supported modes** (decision D2). _Mode A (shared VPS, default):_ host Nginx vhost + certbot auto-renewal; the stack exposes `web` on `127.0.0.1:<port>` only. _Mode B (dedicated VPS):_ Caddy service in the `edge` Compose profile with automatic Let's Encrypt. The same images and config work in both modes. |
| C5  | Blueprint home hero is an autoplay film                                                                            | Blueprint §3.1 vs Brief §4/§8, Instruction §7 | **Still image hero at launch.** Film only below the fold, click-to-play, or after approval and a passed performance budget.                                                                                                                                                                                            |
| C6  | 5 roles + Draft/In Review/Approved/Published + audit trail, vs Blueprint's 4 roles                                 | Brief §6 (authority) vs Blueprint §7          | **Brief wins.** Administrator, Content Editor, Project Editor, Marketing Reviewer, Publisher. Four-state workflow with an `AuditLog` collection, implemented with Payload hooks, so no paid feature is needed.                                                                                                         |
| C7  | Blueprint URLs (`/work`, `/studio`, `/start`) vs Brief IA labels (Projects, About, Contact)                        | Blueprint (sitemap authority)                 | **Blueprint URLs**, using the Brief's content requirements per page.                                                                                                                                                                                                                                                   |
| C8  | Blueprint offers 10 services and many sector sub-pages; the live site shows 3 sectors only                         | Blueprint §2 vs live site                     | Services are CMS-driven. Only services with **[CONFIRM]** status and at least one evidenced project are published. Sector sub-pages are deferred until ≥ 2 matching projects exist.                                                                                                                                    |
| C9  | Home claims 10+ years, 1050+ projects, 50+ team, 10+ awards; the About page gives no figures                       | Live site                                     | Figures are held in the Facts Register. They render only when verified, otherwise the block is hidden.                                                                                                                                                                                                                 |
| C10 | Consultation flow attaches a mood board / style result; instant booking                                            | Blueprint §3.14                               | Mood board, Style Finder and booking are **later phases**. The launch flow is the Brief's 4 steps + review. Booking is replaced by a "preferred contact time" field.                                                                                                                                                   |
| C11 | Brief allows "optional plans" uploads; Instruction requires restricted uploads                                     | Brief §10, Instruction §8                     | **Launch: no public file uploads** (link field instead). CMS uploads are restricted by MIME, size and role. Public uploads come later with a quarantine volume + ClamAV (decision D9).                                                                                                                                 |
| C12 | Image pipeline: Payload variants vs Next Image optimisation                                                        | Brief §1                                      | **One pipeline.** Payload + Sharp generate AVIF/WebP variants with focal-point crops at upload. The frontend renders `<picture>`/`srcset` from those variants. Next runtime image optimisation is disabled to save VPS CPU.                                                                                            |
| C13 | Earlier proposal: purge CMS lead data after 90 days                                                                | Earlier plan                                  | Superseded. Until a CRM is approved the CMS _is_ the lead system. Retention follows the approved privacy schedule (decision D11), and the purge job is configurable.                                                                                                                                                   |
| C14 | Brief's `Locations` collection                                                                                     | Brief §6                                      | Deferred. Abu Dhabi is site-wide LocalBusiness data.                                                                                                                                                                                                                                                                   |
| C15 | Journal at launch needs content capacity                                                                           | Instruction §5                                | Journal templates ship at launch. Navigation hides the section automatically until ≥ 3 approved articles exist.                                                                                                                                                                                                        |
| C16 | Brief §15 team of 10 specialists, 12–16 weeks                                                                      | Brief §14–15                                  | Code is built by Claude Code with Ddotsmedia as lead. Content, photography and approvals remain the critical path.                                                                                                                                                                                                     |
| C17 | Recorded VPS state (Oct 2026): ~90% disk, unstable containers                                                      | Ops records                                   | **Capacity gate** before the first deploy: verify disk, RAM and CPU headroom read-only, or place the stack on the newer Hostinger VPS (decision D1).                                                                                                                                                                   |

## 1.2 Assumptions requiring confirmation

- **A1:** Hostinger VPS (srv988590 or the newer VPS) has capacity for the production stack (there is no staging). Estimated footprint: about 3 GB RAM and 20 GB disk to start, plus media growth.
- **A2:** DNS for introyale.com can be pointed at the VPS at cutover. The registrar or DNS host is **[CONFIRM]**.
- **A3:** An SMTP mailbox is available for transactional email (e.g. Hostinger mail or the existing introyale.com mail), with SPF/DKIM/DMARC configurable.
- **A4:** WhatsApp handoff uses a click-to-chat link to **[CONFIRM +971 52 77 54 585]**. No WhatsApp API is used at launch.
- **A5:** English launch. Arabic architecture (RTL, `/ar`, localised fields) is built in, with Arabic content released later.
- **A6:** Photography exists for at least 8 publishable projects, with client approval **[CONFIRM]**.
- **A7:** One Next.js + Payload container is enough for expected traffic (a portfolio site); horizontal scaling is not required.
- **A8:** Off-site backup target is a second Hostinger VPS via SFTP/restic (or another approved target).

# 2. Hostinger VPS + Docker architecture

## 2.1 Service map (Compose project `introyale-<env>`)

| Service                                 | Image                                                                                           | Role                                                                                                                          | Network                     | Ports                                                         | Health check                                     | Restart          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------ | ---------------- |
| `web`                                   | `ghcr.io/<org>/introyale-web:<sha>` (multi-stage, Node 22 LTS slim, non-root, read-only rootfs) | Next.js App Router + Payload admin/API                                                                                        | `edge`, `internal`          | Mode A: `127.0.0.1:<PORT>:3000` · Mode B: none (behind Caddy) | `GET /api/health` (DB ping + version) every 30 s | `unless-stopped` |
| `worker`                                | same image, `node dist/worker.js`                                                               | Payload Jobs Queue: lead delivery (SMTP/CRM), retries, scheduled publish, retention purge, sitemap ping, revalidation retries | `internal`                  | none                                                          | heartbeat file / `GET :3001/health`              | `unless-stopped` |
| `migrate`                               | same image, `payload migrate`                                                                   | One-shot DB migrations before `web` and `worker` start                                                                        | `internal`                  | none                                                          | exit code 0                                      | `no`             |
| `db`                                    | `pgvector/pgvector:pg16` (pinned digest)                                                        | PostgreSQL for Payload; separate `umami` database                                                                             | `internal` (internal: true) | none                                                          | `pg_isready`                                     | `unless-stopped` |
| `backup`                                | `ghcr.io/<org>/introyale-backup` (alpine + pg_dump + restic + cron)                             | Nightly DB dump + media snapshot, local + off-site, retention 7d/4w/6m                                                        | `internal`                  | none                                                          | last-success timestamp < 26 h                    | `unless-stopped` |
| `umami`                                 | `ghcr.io/umami-software/umami:postgresql-<ver>`                                                 | Cookieless self-hosted analytics                                                                                              | `edge`, `internal`          | via proxy `/a/` path or `stats.` subdomain                    | `/api/heartbeat`                                 | `unless-stopped` |
| `proxy` _(profile `edge`, Mode B only)_ | `caddy:2`                                                                                       | TLS (Let's Encrypt auto-renew), HTTP/3, headers, rate limits, static media                                                    | `edge`                      | 80, 443                                                       | `/healthz`                                       | `unless-stopped` |
| `clamav` _(profile `uploads`, later)_   | `clamav/clamav`                                                                                 | Scan public uploads                                                                                                           | `internal`                  | none                                                          | clamd ping                                       | `unless-stopped` |

**Ops stack** (separate Compose project `ddots-ops`, decision D7): shared monitoring that can later serve other sites, kept separate so Introyale never depends on it to run.

| Service                                               | Role                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `glitchtip` (web + worker + redis + its own postgres) | Sentry-compatible error tracking; the app uses the Sentry SDK, so a later move to Sentry SaaS changes only the DSN |
| `loki` + `promtail` + `grafana`                       | Centralised logs (JSON logs from all containers), dashboards, alerts                                               |
| `uptime-kuma`                                         | External uptime and SSL-expiry checks, alerts to email/WhatsApp                                                    |

## 2.2 Networks, volumes and paths

- **Networks:** `introyale-<env>_internal` (internal, no egress except `worker`/`backup` through `egress`), `introyale-<env>_edge`.
- **Bind mounts under `/opt/introyale/<env>/`:**
  - `media/`: Payload uploads. In Mode A, host Nginx serves `/media/*` directly with `Cache-Control: public, max-age=31536000, immutable`.
  - `db/`: Postgres data (or a named volume `pgdata`).
  - `backups/`: local backup repository.
  - `secrets/` (mode 700, files 600): Docker secrets.
- **Logs:** Docker `json-file` driver with `max-size: 10m`, `max-file: 5` on every service. Promtail ships them to Loki. Logs never contain secrets or enquiry field values.

## 2.3 Environments

| | Development |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| Where | Local Windows machine, Docker Desktop | Hostinger VPS, `introyale.online` |
| Compose files | `compose.yaml` + `compose.dev.yaml` (hot reload, Mailpit, seeded data) | `compose.yaml` + `compose.production.yaml` |
| Access | localhost | Public; `/admin` rate-limited, optional IP allowlist |
| Email | Mailpit (captures all mail) | Production SMTP |
| CRM | Stub adapter | Approved CRM or none |
| Data | Seed fixtures (clearly fake, publish-blocked) | Approved content |

## 2.4 Secrets and configuration

- `.env.example` is committed with names only. Real `.env` files and the `secrets/` directory are never committed (`.gitignore` + gitleaks pre-commit and CI).
- **Docker secrets** (`/run/secrets/*`) hold: `PAYLOAD_SECRET`, `DATABASE_URL`, `SMTP_PASSWORD`, `CRM_TOKEN`, `RESTIC_PASSWORD`, `BACKUP_SFTP_KEY`, `SENTRY_DSN`, `ALTCHA_HMAC_KEY`, `UMAMI_APP_SECRET`. The app reads `*_FILE` variants.
- Only non-secret values use the `NEXT_PUBLIC_*` prefix. Build-time checks fail if a secret name appears in client bundles.
- Images contain no secrets or `.env` files (`.dockerignore`, and Trivy secret scan in CI).
- GitHub Actions secrets: `GHCR_TOKEN`, `VPS_SSH_KEY`, `VPS_HOST`, `VPS_KNOWN_HOSTS` only.

## 2.5 Dockerfile (web): secure multi-stage

1. `deps`: `node:22-slim`, `pnpm install --frozen-lockfile`.
2. `build`: `next build` with `output: 'standalone'`; Payload `generate:types` and `generate:importmap`; no secrets (build uses placeholder env, validated at runtime).
3. `runtime`: `node:22-slim` (or distroless node), non-root `uid 10001`, copies `.next/standalone`, `.next/static`, `public`, `migrations` and the Sharp binaries. `HEALTHCHECK`, `USER 10001`. Compose sets a read-only root filesystem and `tmpfs:/tmp`, `cap_drop: [ALL]`, `security_opt: no-new-privileges`, plus memory/CPU limits (`web` 1 GB, `worker` 512 MB, `db` 1 GB).

## 2.6 Delivery pipeline (GitHub Actions)

1. **PR / push:** typecheck, lint, Vitest, `next build`, Playwright (against a Compose stack in CI), axe, Lighthouse CI budgets, link check, structured-data and redirect tests, `pnpm audit`/OSV, gitleaks.
2. **Main branch:** build the image → Trivy scan (fail on HIGH/CRITICAL fixable) → push `ghcr.io/...:<git-sha>`.
3. **Deploy production:** the `deploy-production` job: SSH (restricted deploy user) → `scripts/deploy.sh production <sha>`: disk preflight (≥ 5 GB free), pre-deploy DB backup, pull, `migrate`, `up -d web worker`, health, smoke, then automatic image retention (running + last-good tags only).
4. **Rollback:** `scripts/rollback.sh production <previous-sha>` redeploys the previous image. If a migration is not backward compatible, restore the pre-deploy dump (procedure in RUNBOOK). Migrations are written expand/contract so rollback rarely needs a restore.

All deploy scripts act only on the `introyale-<env>` Compose project. There are no server-wide commands (no prune, no global restarts). Old Introyale images are removed by explicit tag only, keeping the last 5.

### 2.6.1 Deviations on the shared VPS (Snap Docker), binding for all deploys

**No staging environment (owner decision, 2026-11-22):** CI deploys straight to production on push to main, gated by verify, Trivy, the browser job and the pre-deploy backup, with automatic rollback. References to staging elsewhere in this spec are superseded.

The VPS runs the **Snap build of Docker**. Deploys must follow these deviations:

- **Paths:** Snap Docker cannot bind-mount anything under `/opt`. The production base is `/home/introyale-deploy/introyale/production` (set with `INTROYALE_BASE=/home/introyale-deploy/introyale`; scripts default to `/opt/introyale` elsewhere). The home directory is mode 711 so Nginx can serve `media/`.
- **`no-new-privileges` is dropped on this host** (`security_opt: !reset []` in `compose.production.yaml`): Snap's AppArmor profile makes every exec fail when it is set. Compensating controls stay: `cap_drop: ALL`, read-only root, non-root user 10001, internal-only DB network. Local and CI keep it on.
- **Deploy user:** `introyale-deploy` (docker group, no sudo). The repo is private; the VPS clones over SSH with a read-only GitHub deploy key (`~/.ssh/repo_deploy`). Images are private on GHCR; CI pipes the run's `GITHUB_TOKEN` to `docker login` on each deploy and logs out afterwards, so no registry token is stored on the VPS.
- **First deploy** checks health only (empty site); later deploys run the full smoke test.
- **CI gates:** the `browser` job (Playwright + axe against a compose stack: db, migrate, web, worker, Mailpit, seeded via `scripts/ci-stack.sh`) must pass before `publish` and `deploy-production`.

## 2.7 Reverse proxy, TLS and headers

- **TLS:** Mode A uses host Nginx + certbot (auto-renew timer, verified with `certbot renew --dry-run` in the runbook). Mode B uses Caddy with automatic Let's Encrypt and renewal. HSTS `max-age=63072000; includeSubDomains` (preload after a stability period).
- **Headers** (set in Next middleware so they are identical in both modes):
  - CSP with per-request nonce: `default-src 'self'`; `img-src 'self' data:`; `script-src 'self' 'nonce-…' 'strict-dynamic'`; `frame-ancestors 'none'`; `form-action 'self'`; adapters add their origins only when enabled.
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `Cross-Origin-Opener-Policy: same-origin`.
- **Rate limits:** at the proxy (`limit_req` / Caddy rate-limit) for `/api/enquiries`, `/admin/login`, `/api/users/login`. Also in the app (Postgres-backed sliding window per IP and per email).

## 2.8 Backups and restoration

- **Nightly 02:30 Dubai:** `pg_dump -Fc` and a restic snapshot of `media/` go to the local repository and the off-site repository (D8). Retention is 7 daily, 4 weekly and 6 monthly; `restic check` runs weekly.
- **Pre-deploy:** an extra dump is taken before every production migration.
- **Restore procedure** (`docs/RUNBOOK.md#restore`) is scripted in `scripts/restore.sh <snapshot>`. It restores into a scratch DB, verifies row counts and a page render, then promotes.
- **Restore tests:** a quarterly restore drill is recorded in `docs/restore-log.md`. A restore must also pass before launch.

## 2.9 Monitoring, logs, error tracking

- Structured JSON logging (pino) with a request ID; PII and form values are redacted.
- Sentry SDK points at GlitchTip for server and client errors, with source maps uploaded privately.
- Uptime Kuma checks home, a case study, `/api/health` and SSL expiry.
- Grafana alerts on 5xx rate, health failures, job-queue failures (lead not delivered after 3 retries → immediate email alert to staff), backup age and disk usage.
- Real-user Core Web Vitals use the `web-vitals` library, beaconed to Umami custom events. Lab checks use Lighthouse CI.

# 3. Final launch scope and phased backlog

## 3.1 Launch (Release 1)

- Home, Studio, Team, Design process.
- Services index and confirmed service pages.
- Sector landings: Residential, Commercial, Hospitality & Leisure.
- Project explorer with filters (sector, property type, service, year), plus detailed case studies with before/after and plan hotspots when approved.
- Journal (index, article, category), auto-hidden until ≥ 3 articles.
- Contact and guided consultation flow; leads stored in the CMS, emailed via SMTP, CRM adapter (enabled on approval), WhatsApp click-to-chat handoff.
- Legal pages: Privacy, Cookies, Terms, Accessibility statement.
- CMS editorial workflow, roles, MFA, audit log, publish gates, Facts Register.
- Technical SEO: metadata, structured data, sitemaps, robots, canonicals, legacy redirects.
- Umami analytics, GlitchTip, Loki/Grafana, Uptime Kuma, backups, security hardening.
- Arabic-ready architecture: `/ar` routes reserved, localised fields, logical CSS, RTL-tested components.

## 3.2 Phased backlog (each needs separate approval)

| Phase                    | Items                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2 Engage                | Arabic content release, online booking (self-hosted Cal.com or adapter), video testimonials, projects map (MapLibre, self-hosted tiles or approved provider), public file uploads with ClamAV |
| P3 Discover              | Style Finder, mood boards, materials library, cost guide and project planner (only with Introyale-approved ranges)                                                                            |
| P4 Intelligence          | Semantic search (pgvector), AI concierge (Claude API, retrieval-only, guardrails), AI editor assistant (alt text, meta, Arabic drafts with approval)                                          |
| P5 Immersive and clients | 3D material viewer, 360° tours, client portal, AI room visualiser, personalisation, marketing automation, WhatsApp Business API                                                               |

# 4. Final sitemap (launch)

| Page                  | URL                                                        | Notes                                                                                                                |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Home                  | `/`                                                        | Still hero, selected work, sector pathways, verified reasons, process, featured case, studio, testimonials, CTA, NAP |
| Projects explorer     | `/work`                                                    | Filters in URL query; filtered views `noindex` except sector views                                                   |
| Case study            | `/work/[slug]`                                             | Publish gates enforced                                                                                               |
| Residential           | `/residential`                                             | Sector landing                                                                                                       |
| Commercial            | `/commercial`                                              | Sector landing                                                                                                       |
| Hospitality & Leisure | `/hospitality-leisure`                                     | Sector landing                                                                                                       |
| Services              | `/services`                                                | Index                                                                                                                |
| Service               | `/services/[slug]`                                         | Confirmed services only                                                                                              |
| Studio                | `/studio`                                                  | Story, values, credentials, clients (approved logos)                                                                 |
| Team                  | `/studio/team`                                             | Profiles shown only with consent; `/studio/team/[slug]` when bio and credentials exist                               |
| Design process        | `/process`                                                 | Design-to-handover stages                                                                                            |
| Journal               | `/journal`, `/journal/[slug]`, `/journal/category/[slug]`  | Hidden until ≥ 3 articles                                                                                            |
| Start a project       | `/start` → `/start/thank-you`                              | 4 steps + review                                                                                                     |
| Contact               | `/contact`                                                 | NAP, WhatsApp, phone, general form, map image (static)                                                               |
| Legal                 | `/privacy`, `/cookies`, `/terms`, `/accessibility`         | Approved text **[CONFIRM legal review]**                                                                             |
| System                | `/sitemap.xml`, `/robots.txt`, `404`, `500`, `/api/health` |                                                                                                                      |
| CMS                   | `/admin`                                                   | optional 2FA, rate-limited                                                                                           |
| Arabic (reserved)     | `/ar/*`                                                    | Not indexed or linked until Arabic is released                                                                       |

**Legacy redirects (301):**

| Legacy URL                                                           | New URL                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `/index.php`                                                         | `/`                                                        |
| `/aboutus.php`                                                       | `/studio`                                                  |
| `/ourclients.php`                                                    | `/studio#clients`                                          |
| `/contactus.php`                                                     | `/contact`                                                 |
| `/hospitality-leisure.php`, `/hospitality-portfolio.php`             | `/hospitality-leisure`, `/work?sector=hospitality-leisure` |
| `/commercial.php`, `/commercial-portfolio.php`                       | `/commercial`, `/work?sector=commercial`                   |
| `/residential.php`, `/residencial.php`, `/residential-portfolio.php` | `/residential`, `/work?sector=residential`                 |

The full crawl in M0 confirms there are no other indexed URLs.

# 5. CMS and database models

## 5.1 Shared field groups

- **`workflow`:** `status` (draft · in_review · approved · published), `submittedBy`, `reviewedBy`, `approvedBy`, `publishedBy`, `reviewNotes`. Transitions are enforced by role in a `beforeChange` hook. Every transition writes an `AuditLog` entry.
- **`seo`:** `metaTitle` (≤ 60), `metaDescription` (≤ 160), `ogImage`, `canonicalOverride`, `noindex`.
- **Localisation:** Payload `localization: { locales: ['en','ar'], defaultLocale: 'en', fallback: false }`. Text and richText fields are `localized: true`.
- **Versions:** `drafts: { autosave: true, schedulePublish: true }`, `maxPerDoc: 50`.

## 5.2 Collections

| Collection           | Key fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Rules                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`              | name, email, role (administrator · content_editor · project_editor · marketing_reviewer · publisher), `totp` (secret, enabled, recoveryCodes hashed), lastLoginAt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | auth with lockout (5 attempts / 10 min); 2FA is optional for every role, opt-in on the account page, and required at sign-in once enabled; disabling needs the current password and a code (D10) |
| `media`              | file, alt (localised, required), caption, credit, focalPoint, `usageApproved` (bool + approvedBy), `confidential`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | upload restrictions: image/jpeg, png, webp, avif, svg (sanitised, admins only), application/pdf; max 25 MB; Sharp sizes 480/768/1080/1440/1920/2560 in AVIF + WebP; EXIF stripped                |
| `projects`           | title, `publicTitle` (confidentiality-safe), slug, sector → `sectors`, propertyType → `property-types`, `areaLabel` (district only, never exact address), year, `approxAreaSqm`, services → `services`[], stage, brief, constraints, concept, spacePlanning, materials, joinery, technicalMep, deliveryModel, timelineLabel, outcome, testimonial → `testimonials`, hero → `media` (required), gallery[] → `media`, beforeAfter[] {before, after, caption}, plans[] {image, hotspots[] {x, y, label, media}}, team → `team-members`[], related (auto + manual), featured, `clientApproval` {approved, approvedBy, date, evidence}, seo, workflow | **publish gate**: required facts + approved hero + alt on every image + seo + clientApproval.approved                                                                                            |
| `services`           | title, slug, summary, audience, scope[], deliverables[], processSteps[], faqs → `faqs`, proofProjects → `projects` (min 1), `confirmed` (Facts link), seo, workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | publish gate: confirmed + ≥ 1 published proof project                                                                                                                                            |
| `sectors`            | title, slug, intro, hero, featuredProjects, faqs, seo, workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                                  |
| `property-types`     | title, slug, sector                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | filter taxonomy                                                                                                                                                                                  |
| `team-members`       | name, role, bio, credentials[], photo, `consent` {given, date, evidence}, order, seo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | not rendered without consent                                                                                                                                                                     |
| `testimonials`       | quote, attributionName, attributionRole, project, `permission` {given, evidence}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | not rendered without permission                                                                                                                                                                  |
| `clients`            | name, logo, sector, `logoPermission`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                                                                                                                                  |
| `awards`             | name, issuer, year, evidenceUrl/evidenceFile, project                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | must have evidence                                                                                                                                                                               |
| `journal-posts`      | title, slug, excerpt, body (lexical), author → `team-members`, categories, heroImage, reviewedAt, citations[], relatedProjects, relatedServices, seo, workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                  |
| `journal-categories` | title, slug, description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                  |
| `faqs`               | question, answer, topic, eligibleForSchema                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                                                                                                                                                                                                  |
| `pages`              | title, slug, layout blocks (legal and simple pages), seo, workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                  |
| `facts`              | key (e.g. `years_in_business`, `projects_completed`, `trade_licence_no`), value, displayText, source, evidence (file/url), verifiedBy, verifiedAt, status (unverified · verified · retired)                                                                                                                                                                                                                                                                                                                                                                                                                                                      | blocks render only verified facts                                                                                                                                                                |
| `enquiries`          | ref (IR-YYYY-NNNN), type (consultation/general), projectType, sector, location, propertyType, approxArea, services[], stage, targetStart, budgetBand, brief, plansLink, name, email, phone, preferredMethod, preferredTime, consent {given, textVersion, at}, source page, utm, `assignedTo`, `deliveryStatus` {email, crm, attempts, lastError}, `retentionUntil`                                                                                                                                                                                                                                                                               | access: administrator + assigned staff; never exposed via public API; field values excluded from logs and analytics                                                                              |
| `redirects`          | from, to, type (301/302/410), notes, active                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | compiled into a middleware lookup map at startup and refreshed on change; CI tests every entry                                                                                                   |
| `audit-log`          | actor, action, collection, docId, fromStatus, toStatus, diff summary, ip, at                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | append-only; admins read-only                                                                                                                                                                    |

## 5.3 Globals

`site-settings` (name, logo, default OG), `navigation` (auto-hide empty sections), `footer`, `contact-info` (address, phone, WhatsApp, email, hours, geo; all linked to `facts`), `social-profiles`, `seo-defaults`, `consultation-settings` (budget bands **[CONFIRM]**, property types, routing rules: sector → assignee, SLA text), `legal-entity` (legal name, licence number, issuing authority **[CONFIRM]**), `integrations` (feature flags: crm, cloudflare, umami, booking; credentials referenced by secret name, never stored in the DB).

## 5.4 Roles and permissions

| Action                                  | Administrator | Content Editor | Project Editor | Marketing Reviewer | Publisher       |
| --------------------------------------- | ------------- | -------------- | -------------- | ------------------ | --------------- |
| Create/edit pages, journal, FAQs        | ✓             | ✓              | –              | comment            | ✓               |
| Create/edit projects, media             | ✓             | –              | ✓              | comment            | ✓               |
| Submit for review                       | ✓             | ✓              | ✓              | –                  | ✓               |
| Approve (SEO, claims, brand)            | ✓             | –              | –              | ✓                  | ✓               |
| Publish / unpublish                     | ✓             | –              | –              | –                  | ✓               |
| Facts Register verify                   | ✓             | –              | –              | –                  | ✓               |
| Enquiries                               | ✓             | –              | –              | read (assigned)    | read (assigned) |
| Users, redirects, globals, integrations | ✓             | –              | –              | redirects          | –               |

## 5.5 Database notes

- PostgreSQL 16 through `@payloadcms/db-postgres` (Drizzle). Migrations are generated with `payload migrate:create`, committed, reviewed and run by the `migrate` service. `push` mode is never used outside dev.
- Extra indexes: `projects(sector_id, property_type_id, year, featured, _status)`, `enquiries(created_at, delivery_status)`, unique `(slug, locale)`.
- `pgvector` is installed in the image but not enabled until P4.
- Separate DB users: `introyale_app` (owner of the app DB), `umami` (own DB), `backup` (read-only).

# 6. Integrations and pending decisions

## 6.1 Integrations

| Integration                    | Launch status                      | Default (no dependency)                                                                              |
| ------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SMTP email                     | Required (any provider)            | Hostinger/introyale.com mailbox; Mailpit in dev                                                      |
| CRM                            | Optional adapter                   | Leads in CMS + email notification                                                                    |
| WhatsApp                       | Click-to-chat link                 | No API                                                                                               |
| Bot protection                 | Built in                           | ALTCHA (self-hosted proof-of-work) + honeypot + time trap; Turnstile adapter optional                |
| Analytics                      | Self-hosted                        | Umami (cookieless; no consent banner needed unless GA4 is approved)                                  |
| Error tracking / logs / uptime | Self-hosted ops stack              | GlitchTip, Loki/Grafana, Uptime Kuma                                                                 |
| CDN / WAF                      | Optional                           | Cloudflare proxy if approved; otherwise proxy cache + app headers                                    |
| Object storage                 | Optional                           | VPS media volume; R2 adapter (S3-compatible) later                                                   |
| Admin MFA                      | Optional, opt-in (D10, 2026-11-22) | Vet `payload-totp` plugin for Payload 3; fall back to in-house TOTP (otplib) + hashed recovery codes |

## 6.2 Pending client and owner decisions

| ID  | Decision                                                                | Default if not decided                                            |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| D1  | Which Hostinger VPS (srv988590 vs newer VPS) after capacity check       | Newer VPS if srv988590 lacks 3 GB RAM / 30 GB disk headroom       |
| D2  | Proxy mode A (host Nginx + certbot) or B (Caddy in Compose)             | A on shared VPS; B on a dedicated VPS                             |
| D3  | DNS host and cutover access; Cloudflare yes/no                          | DNS-only change at cutover; Cloudflare off                        |
| D4  | SMTP provider and sender addresses                                      | Existing introyale.com mailbox                                    |
| D5  | CRM (none, HubSpot, Zoho, other)                                        | None at launch                                                    |
| D6  | Confirmed services, sectors, property types                             | 3 sectors only                                                    |
| D7  | Ops stack placement (shared `ddots-ops` vs per-project)                 | Shared `ddots-ops`                                                |
| D8  | Off-site backup target                                                  | restic over SFTP to the second Hostinger VPS                      |
| D9  | Public plan uploads                                                     | Not at launch                                                     |
| D10 | Editors and roles list (names)                                          | 1 Administrator, 1 Publisher, 1 Content/Project Editor            |
| D11 | Privacy review, retention period, consent wording                       | Retain leads 24 months, then purge **[CONFIRM legal]**            |
| D12 | Budget bands, project minimums, assignment rules                        | Bands hidden until supplied                                       |
| D13 | Publishable projects, client names, photos, testimonials, team consents | Only items with recorded approval render                          |
| D14 | Brand assets and typeface licences                                      | Open-licence fonts (e.g. Fraunces + Inter + IBM Plex Sans Arabic) |
| D15 | Arabic release timing                                                   | Architecture now, content in P2                                   |

# 7. Implementation sequence and acceptance criteria

All work is done in Claude Code: built and tested locally first, then deployed to production (introyale.online); there is no staging.

| #   | Milestone                                                                                                                                                                                                                                                                                         | Model                                | Acceptance criteria                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | **Discovery inputs:** read-only crawl of introyale.com, URL inventory, Facts Register seeded with **[CONFIRM]** items, project fact-sheet template                                                                                                                                                | Haiku                                | Inventory CSV committed; redirect map covers 100% of crawled URLs                                                                                                                                                                                                 |
| M1  | **Repository and tooling:** Next.js + Payload + TS strict, pnpm, ESLint, Prettier, Vitest, Playwright, Husky + gitleaks, `docs/` (ARCHITECTURE, RUNBOOK, SECURITY, PRIVACY)                                                                                                                       | Haiku                                | `pnpm test`, `pnpm lint`, `pnpm typecheck` green; CI passes on an empty feature                                                                                                                                                                                   |
| M2  | **Docker platform:** multi-stage Dockerfile, compose base/dev/local/production, health checks, restart policies, secrets, `migrate` and `worker` services, log rotation, `backup` service, deploy/rollback/restore scripts                                                                        | Sonnet (infrastructure and security) | Fresh clone → `docker compose up` runs locally; killing `web` → auto-restart; image runs as non-root with read-only rootfs; Trivy has no fixable HIGH/CRITICAL; backup produces dump + media snapshot; restore script recreates a working site in a scratch stack |
| M3  | **CMS core:** all collections, globals, roles matrix, four-state workflow, audit log, publish gates, Facts Register rendering rules, MFA, login lockout, upload restrictions                                                                                                                      | Sonnet (permission model)            | Role-matrix tests pass (each role allowed/denied as in §5.4); a project missing alt text/approval/SEO cannot be published; every status change appears in the audit log; admin login requires TOTP                                                                |
| M4  | **Design system:** tokens, typography, grid, logical CSS, components (header, mobile nav, cards, fact strip, gallery/lightbox, before/after, plan hotspots, filters, accordion, stepper, CTA), reduced motion, RTL showcase page                                                                  | Haiku                                | axe: 0 violations on the component showcase in LTR and RTL; keyboard operation of every interactive component; contrast ≥ 4.5:1 for body text                                                                                                                     |
| M5  | **Core pages:** Home, sectors, services, studio, team, process, legal, 404/500                                                                                                                                                                                                                    | Haiku                                | Pages render only CMS content (no hard-coded claims); Lighthouse mobile ≥ 90/95/95; JS per page < 150 KB gzip                                                                                                                                                     |
| M6  | **Projects:** explorer (server-rendered + URL filters) and case study template                                                                                                                                                                                                                    | Haiku                                | Filter results correct (unit + E2E tests); LCP < 2.5 s on throttled mobile in lab; images served as AVIF/WebP with width/height                                                                                                                                   |
| M7  | **Journal:** index, article, categories, author, related content                                                                                                                                                                                                                                  | Haiku                                | Section auto-hidden with < 3 approved posts; Article schema validates                                                                                                                                                                                             |
| M8  | **Leads:** consultation flow (4 steps + review), contact form, server validation (Zod), sanitisation, ALTCHA + honeypot + rate limits, outbox via the Jobs Queue (SMTP, CRM adapter), staff alert on failure, confirmation email, thank-you page, WhatsApp handoff, conversion events without PII | Sonnet (security and reliability)    | E2E: submission stored, staff email and confirmation received in Mailpit; SMTP down → lead kept, retried, alert after 3 failures; 11th submission in 10 min from one IP blocked; no field values in logs or analytics                                             |
| M9  | **SEO:** metadata API, OG images, JSON-LD (Organization, LocalBusiness, WebSite, BreadcrumbList, Service, Person, ImageObject, Article, FAQPage), sitemaps, robots per env, canonicals, hreflang scaffold, redirects                                                                              | Haiku                                | Structured data validates in CI; every legacy URL returns the mapped 301; staging is fully noindex                                                                                                                                                                |
| M10 | **Security and observability:** CSP nonces, headers, cookie flags (Secure, HttpOnly, SameSite=Lax), Umami, Sentry SDK → GlitchTip, pino → Loki, Uptime Kuma, Grafana alerts                                                                                                                       | Sonnet                               | securityheaders-style scan grade A; OWASP ZAP baseline with no high findings; a test error appears in GlitchTip; a test log line appears in Loki; alert fires on a simulated health failure                                                                       |
| M11 | **First deploy on Hostinger VPS (production only):** capacity check (read-only), port allocation, Mode A vhost or Mode B, GitHub Actions deploy, content entry begins                                                                                                                             | Sonnet (VPS)                         | Deploy and rollback demonstrated on staging; other sites on the VPS unaffected (before/after health of their endpoints recorded)                                                                                                                                  |
| M12 | **Content and UAT:** case studies, copy, media, facts verified, legal text, training of editors                                                                                                                                                                                                   | Haiku                                | All launch pages pass publish gates; zero **[CONFIRM]** markers rendered; editors publish unaided                                                                                                                                                                 |
| M13 | **Launch readiness:** manual WCAG 2.2 AA (keyboard, NVDA/VoiceOver, zoom 200%/400% reflow, touch targets, form errors, mobile), performance budgets, restore drill, runbook review                                                                                                                | Haiku                                | Brief §16 checklist 100%; restore drill logged; sign-off from Introyale                                                                                                                                                                                           |
| M14 | **Cutover (approval-gated):** lower DNS TTL, final backup, deploy production, switch DNS, smoke tests, Search Console + Bing sitemaps, 30-day monitoring                                                                                                                                          | Sonnet (production change)           | Live checks of real pages, forms and redirects (not just HTTP status); old site kept intact as rollback for 30 days                                                                                                                                               |

After M14 the work moves back to Haiku for routine content and maintenance. P2–P5 start only after separate approval.

# 8. Repository layout (planned)

```
introyale/
  apps/web/                 # Next.js + Payload (src/app/(site), src/app/(payload), src/collections, src/globals, src/hooks, src/jobs, src/lib)
  docker/web.Dockerfile  docker/backup.Dockerfile  docker/caddy/Caddyfile  docker/nginx/introyale.conf (Mode A template)
  compose.yaml  compose.dev.yaml  compose.local.yaml  compose.production.yaml  .env.example
  scripts/deploy.sh  rollback.sh  backup.sh  restore.sh  smoke.sh
  migrations/               # Payload migrations
  tests/unit  tests/e2e  tests/a11y  lighthouserc.json
  .github/workflows/ci.yml  deploy.yml
  docs/ARCHITECTURE.md  RUNBOOK.md  SECURITY.md  PRIVACY.md  CONTENT-GUIDE.md  restore-log.md  decisions.md
```

# 9. Approval needed to start

1. Approve this architecture (§2), launch scope (§3), sitemap (§4) and models (§5).
2. Decide D1–D5 (everything else can default and is changeable later).
3. On approval, M1–M10 are built and tested locally through Claude Code. VPS work starts at M11 only after the capacity check.
