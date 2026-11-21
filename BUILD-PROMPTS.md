# Introyale — Claude Code build prompts

**How to run:**

1. Copy this pack into `D:\Websites\introyale`.
2. Open Claude Code in that folder and paste **PROMPT 1 (MASTER BUILD)**. It runs M0–M13 end to end with no questions.
3. Paste **PROMPT 2 (CUTOVER)** only when Introyale approves go-live.

Every prompt applies CLAUDE.md (token rules, safety, model selection).

---

## PROMPT 1 — MASTER BUILD (M0–M13)

```
Model: start Sonnet (M1–M3 infra/security), switch to Haiku for M4–M7/M9/M12–M13, Sonnet for M8, M10, M11. Announce each switch.
TOKEN RULES: concise commands, minimal output, reuse existing patterns, no re-explaining, minimal diffs, inline comments only, report only at milestone end (files changed / tests / acceptance ✓✗).
AUTONOMY: never ask questions. Resolve ambiguity with docs/DECISIONS.md → docs/SPEC.md → safest option; log choices in docs/decisions-log.md. Hard stops per CLAUDE.md only.

Read CLAUDE.md, docs/DECISIONS.md, docs/SPEC.md fully before writing code. Then execute milestones in order; do not start the next until the current one's acceptance criteria (SPEC §7) pass. Commit after each milestone: "feat(mX): <summary>".

M0 DISCOVERY (Haiku)
- Read-only crawl of https://www.introyale.com (fetch pages only; never POST, never submit forms). Save docs/content-inventory.csv (url, title, h1, type, word_count, images).
- docs/redirects.csv from crawl; must include SPEC §4 legacy map (index.php, aboutus.php, ourclients.php, contactus.php, hospitality-leisure.php, commercial.php, residential.php, residencial.php, *-portfolio.php).
- Seed file seed/facts.json with every fact from SPEC Appendix/live site as status "unverified" (address, phone, email, 10+ years, 1050+ projects, 50+ team, 10+ awards).

M1 REPO + TOOLING (Sonnet)
- `pnpm dlx create-payload-app@latest` blank template, Postgres adapter, into apps/web; TypeScript strict; Next `output:'standalone'`, `images.unoptimized=true` (Payload generates variants).
- Workspace: pnpm-workspace.yaml, root scripts: dev, build, lint, typecheck, test, test:e2e, test:a11y, lhci.
- ESLint + Prettier, Vitest, Playwright (+ @axe-core/playwright), Lighthouse CI (lighthouserc.json budgets: perf≥0.9, a11y/seo/bp≥0.95, LCP<2500, CLS<0.1, total JS<150KB/page).
- Husky pre-commit: lint-staged + gitleaks. .gitignore: .env*, secrets/, media/, backups/.
- docs/: ARCHITECTURE.md, RUNBOOK.md, SECURITY.md, PRIVACY.md, CONTENT-GUIDE.md, decisions-log.md, restore-log.md (skeletons, filled as you go).
- .github/workflows/ci.yml: install → lint → typecheck → unit → build → compose-up test stack → playwright+axe → lhci → osv-scanner → gitleaks.

M2 DOCKER PLATFORM (Sonnet) — implement SPEC §2 exactly
- docker/web.Dockerfile: stages deps → build → runtime (node:22-slim, USER 10001, copy .next/standalone, .next/static, public, migrations, sharp). HEALTHCHECK curl-less: `node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"`.
- apps/web/src/app/api/health/route.ts: returns {status, version, db:true} after `SELECT 1`; 503 on failure; no secrets.
- apps/web/src/worker.ts: Payload jobs runner loop (autoRun) + tiny http health on :3001.
- compose.yaml (base) services: migrate (command `pnpm payload migrate`, restart:no), web, worker, db (pgvector/pgvector:pg16, pg_isready healthcheck, no ports), backup, umami; profiles: edge→proxy(caddy:2), uploads→clamav.
  All: restart unless-stopped (except migrate), logging json-file max-size 10m max-file 5, cap_drop [ALL], security_opt no-new-privileges, read_only true + tmpfs /tmp for web/worker, mem limits web 1g worker 512m db 1g backup 256m umami 512m.
  depends_on: web/worker → migrate: service_completed_successfully; migrate → db: service_healthy.
  networks: internal (internal:true) + edge; egress network only for worker, backup.
  secrets: payload_secret, database_url, smtp_password, altcha_hmac_key, umami_app_secret, restic_password, backup_sftp_key, sentry_dsn — files from ./secrets/<env>/*.
- compose.dev.yaml: bind src for hot reload, mailpit (8025), db port 5432 localhost only, seed on start.
- compose.staging.yaml / compose.prod.yaml: image ghcr.io/${GH_OWNER}/introyale-web:${IMAGE_TAG}; web ports "127.0.0.1:${WEB_PORT}:3000"; media bind /opt/introyale/${ENV}/media; db bind /opt/introyale/${ENV}/db; backups bind /opt/introyale/${ENV}/backups.
- docker/backup.Dockerfile: alpine + postgresql16-client + restic + busybox crond; backup.sh: pg_dump -Fc → restic backup (dump + media) local repo + SFTP repo if set; forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6; weekly restic check; writes /backups/last_success; healthcheck age < 26h. Cron 02:30 Asia/Dubai.
- scripts/deploy.sh <env> <tag>: assert env∈{staging,production}; `docker compose -p introyale-$env -f compose.yaml -f compose.$env.yaml` only; production: run backup now first; pull → up migrate → up -d web worker → wait health 120s → scripts/smoke.sh → on failure auto-run rollback.sh with previous tag (stored in /opt/introyale/$env/.last_good_tag).
- scripts/rollback.sh <env> <tag>, scripts/restore.sh <env> <snapshot> (restore into scratch db introyale_restore, verify counts, render /api/health against it, promote only with --promote), scripts/smoke.sh (home, /work, one case study, /start, /sitemap.xml, /api/health; assert 200 + key text).
- docker/nginx/introyale.conf.template (Mode A): server_name, proxy_pass 127.0.0.1:${WEB_PORT}, location /media/ alias /opt/introyale/${ENV}/media/ with 1y immutable cache, limit_req zones for /api/enquiries and /admin, client_max_body_size 25m, staging basic auth + X-Robots-Tag noindex.
- docker/caddy/Caddyfile (Mode B) equivalent.
- Acceptance SPEC §7 M2 incl. local restore drill logged in docs/restore-log.md.

M3 CMS CORE (Sonnet) — SPEC §5 exactly
- Collections: users, media, projects, services, sectors, property-types, team-members, testimonials, clients, awards, journal-posts, journal-categories, faqs, pages, facts, enquiries, redirects, audit-log. Globals: site-settings, navigation, footer, contact-info, social-profiles, seo-defaults, consultation-settings, legal-entity, integrations.
- localization en/ar (fallback false); drafts autosave + schedulePublish; maxPerDoc 50.
- src/fields/workflow.ts (status draft|in_review|approved|published + actors) and src/hooks/workflowGuard.ts: allowed transitions by role per SPEC §5.4; publisher/administrator only may set published; every transition → audit-log entry (actor, from, to, ip).
- src/hooks/publishGates.ts: block `published` when: required fields empty; hero.usageApproved false; any media without alt; seo.metaTitle/metaDescription empty; projects.clientApproval.approved false; services without ≥1 published proof project; team/testimonial without consent/permission. Return field-level error messages.
- media: mimeTypes per SPEC, 25MB, imageSizes 480/768/1080/1440/1920/2560 webp+avif, focalPoint, strip EXIF.
- users: lockout 5/10min; MFA per D18 (required for administrator, publisher); cookies Secure, HttpOnly, SameSite=Lax.
- enquiries: access admin + assigned; excluded from public API and GraphQL; hidden fields in logs.
- facts: helper `getVerifiedFact(key)` returns null unless verified; components render nothing on null.
- Migrations: `pnpm payload migrate:create init`; commit.
- Tests: role matrix (each role × action allow/deny), publish gates, audit log, MFA required, lockout.

M4 DESIGN SYSTEM (Haiku) — Blueprint §5 "Crafted Calm"
- Tokens (tailwind.config + CSS vars): ink #1F1D1A, ivory #FBF9F6, sand #EFE8DD, travertine #D9D2C7, taupe #6B655C, bronze #9A7349, bronze-deep #7A5A36, success #2F6B4F, error #A23B2A; 8px spacing scale; 12-col grid max 1440; radius 0–2px; breakpoints 360/640/960/1280/1600.
- Fonts self-hosted via next/font/local subsets: Fraunces, Inter, IBM Plex Sans Arabic; metric fallbacks.
- Only logical properties (ms-/me-/ps-/pe-, start/end). dir from locale.
- Components (src/components): Header (hide on scroll down), MobileNav (focus trap), StickyActionBar (Call·WhatsApp·Start), ProjectCard, FactStrip, Gallery+Lightbox (keyboard, Esc, arrows), BeforeAfter (range input based, keyboard), PlanHotspots (buttons + list fallback), FilterBar (URL state), Accordion, Stepper, CTABand, Testimonial, TeamCard, ProcessTimeline, Picture (srcset from Payload sizes, width/height, lazy except LCP), Breadcrumbs, Prose.
- Motion: CSS only + View Transitions for card→case study; all disabled under prefers-reduced-motion.
- /dev/components showcase (dev only) in LTR and RTL; axe tests on both.

M5 CORE PAGES (Haiku) — SPEC §4 routes, Brief §4 home order
- src/app/(site)/[locale]/... with next-intl localePrefix 'as-needed' (en no prefix; /ar gated by FEATURE_AR).
- Home: still hero (LCP image priority), selected work (featured projects), sector pathways, verified reasons (facts only), process, featured case, studio+team, testimonials, consultation CTA, NAP block (contact-info).
- Sector pages /residential /commercial /hospitality-leisure; /services, /services/[slug]; /studio, /studio/team(/[slug]); /process; legal from pages collection; not-found.tsx, error.tsx.
- Navigation auto-hides empty sections. No hard-coded claims anywhere.
- On-demand revalidation: Payload afterChange/afterDelete hooks → revalidatePath/revalidateTag for affected routes.

M6 PROJECTS (Haiku)
- /work: server-rendered list, filters sector/propertyType/service/year via searchParams, client FilterBar updates URL; pagination 12; filtered URLs noindex except single-sector.
- /work/[slug]: hero, FactStrip (location = areaLabel only), chapters (brief, concept+plans, materials/joinery, technical/MEP, delivery, result gallery), BeforeAfter, testimonial, team credits, related projects, sector-prefilled CTA (/start?sector=..).
- Tests: filter correctness unit + e2e; LCP lab check.

M7 JOURNAL (Haiku)
- /journal, /journal/[slug], /journal/category/[slug]; author → team-members; reading time; ToC; related; Article JSON-LD; nav hidden if < 3 published posts.

M8 LEADS (Sonnet)
- /start: 4 steps + review (SPEC brief §10 fields; budget bands from consultation-settings, hidden if empty), progress, save-and-resume in sessionStorage (try/catch), prefill from query. /contact general form. Server Actions only; Zod schemas in src/lib/validation/enquiry.ts; sanitize text (strip HTML), length limits.
- Bot: ALTCHA widget + server verify (altcha-lib, HMAC from secret), honeypot field, min elapsed 3s.
- Rate limit: Postgres table rate_limits (key, window_start, count) sliding window: 5/10min per IP, 3/hour per email; 429 friendly message.
- On submit: create enquiry (ref IR-YYYY-NNNN) → queue jobs `deliverStaffEmail`, `sendConfirmation`, `deliverCrm` (if FEATURE_CRM). Retries 3 with backoff; after final failure → alert email to ALERT_EMAIL + error to Sentry. Staff email contains link to admin, not full PII if SMTP not TLS.
- Email templates (React Email) branded; nodemailer SMTP (TLS required in prod).
- WhatsApp handoff: wa.me/<number from contact-info> with prefilled text including page title (no PII).
- Umami events: start_step_n, enquiry_submitted (no field values).
- Thank-you page with next steps + relevant projects.
- Retention job: monthly, anonymise enquiries past retentionUntil.
- Tests per SPEC §7 M8 (Mailpit API asserts).

M9 SEO (Haiku)
- generateMetadata everywhere from seo fields + seo-defaults; canonical; OG image route (next/og) per project/article.
- JSON-LD components: Organization, LocalBusiness (only verified NAP/licence), WebSite, BreadcrumbList, Service, Person (consented), ImageObject, Article, FAQPage (eligible).
- sitemap.ts (pages, projects, services, journal; image entries), robots.ts (staging disallow all).
- Redirects: middleware reads active redirects (cached map, refreshed via revalidateTag on change) + seed from docs/redirects.csv; 301/410. CI test hits every legacy URL.
- hreflang scaffold (ar only when FEATURE_AR).

M10 SECURITY + OBSERVABILITY (Sonnet)
- middleware.ts: CSP with per-request nonce (script-src 'self' 'nonce-x' 'strict-dynamic'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' only if required by Payload admin — scope admin separately; frame-ancestors 'none'; form-action 'self'; connect-src self + umami path), HSTS (prod), nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, COOP same-origin.
- pino logger with redaction (password, token, email, phone, name, brief, *.secret); request-id.
- Sentry SDK (server+client) DSN from secret → GlitchTip; tracesSampleRate 0.1; no PII.
- web-vitals → Umami event.
- ops/ (separate project ddots-ops): compose with glitchtip(+redis+postgres), loki, promtail (docker logs), grafana (provisioned dashboards: 5xx, health, job failures, backup age, disk), uptime-kuma. Not started by introyale stacks.
- CI: Trivy image scan (fail HIGH/CRITICAL fixable), osv-scanner, gitleaks, ZAP baseline against CI stack.

M11 STAGING ON VPS (Sonnet) — follow CLAUDE.md VPS safety
1. Read-only: df -h, free -m, nproc, docker ps --format, ss -ltn, ls /etc/nginx/sites-enabled, certbot certificates. Record "before" health of all other sites (curl -sI each server_name). If D1 gate fails → STOP and report.
2. Pick ports per D19; write to docs/RUNBOOK.md.
3. Create /opt/introyale/staging/{media,db,backups,secrets} (chmod 700 secrets); generate secrets with openssl rand into files (never echo).
4. Install Nginx vhost from template for staging.introyale.com, htpasswd, `nginx -t && systemctl reload nginx`; certbot --nginx -d staging.introyale.com (only after DNS A record for staging exists; if not, use self-signed + note in report).
5. .github/workflows/deploy.yml: on push main → build/scan/push images (:sha, :staging) → SSH (deploy user, known_hosts pinned) → scripts/deploy.sh staging <sha>. Production job: workflow_dispatch + environment "production" protection.
6. Deploy, run smoke + Playwright against staging, screenshot key pages. Record "after" health of other sites; must equal "before".
7. Start ops stack ddots-ops if not running (separate project, own ports localhost-only).

M12 CONTENT LOAD (Haiku)
- Import seed: facts (unverified), sectors, property types, legal page drafts, nav, contact-info from facts; project shells from inventory (status draft, `[CONFIRM]` placeholders, unpublished). Write docs/CONTENT-GUIDE.md (how editors complete projects, approvals, publish gates).
- Create editor accounts placeholders only via env list; no real passwords in repo.

M13 LAUNCH READINESS (Haiku)
- Run full CI on staging; Playwright keyboard-only journeys, zoom 200/400% reflow, touch target ≥ 24px checks, form error announcements; Lighthouse on home/work/case/service/start (mobile).
- Restore drill on staging; log in docs/restore-log.md.
- docs/LAUNCH-CHECKLIST.md from Brief §16 with ✓/✗ and evidence links. Do NOT deploy production.
- Final report: checklist status, open [CONFIRM] items list (from facts + CMS), ports, image tag ready for production.
```

---

## PROMPT 2 — PRODUCTION CUTOVER (M14, run only after Introyale approval)

```
Model: Sonnet (production change).
TOKEN RULES: concise commands, minimal output, no re-explaining, report only at end.
AUTONOMY: no questions. CUTOVER_APPROVED=yes. Follow CLAUDE.md VPS safety strictly.

1. Precheck read-only: staging green on latest tag; docs/LAUNCH-CHECKLIST.md all ✓ except DNS; no [CONFIRM] rendered on staging (crawl staging, grep "[CONFIRM]"). If any fails → STOP, report.
2. Record "before" health of all other VPS sites.
3. Create /opt/introyale/production/{media,db,backups,secrets}; generate secrets; copy approved content: pg_dump staging DB → restore to production DB; rsync staging media → production media.
4. Nginx vhost introyale.com + www (www→apex 301) from template; nginx -t && reload.
5. Run GitHub workflow production deploy for the staging-verified tag (scripts/deploy.sh production <tag>).
6. Pre-DNS verification via `curl --resolve introyale.com:443:127.0.0.1` / hosts override: smoke + legacy redirects + Playwright screenshots.
7. DNS: if a DNS API token exists in secrets/dns → set TTL 300, wait 1h, update A records (apex + www); else output the exact records to change and stop (owner changes DNS, then re-run from step 8).
8. After DNS propagates: certbot --nginx -d introyale.com -d www.introyale.com; enable HSTS; submit sitemap ping; verify real pages, forms (one test enquiry with name "TEST"; verify staff email received, then delete the test enquiry), redirects, Umami events.
9. Record "after" health of other sites = "before". Keep old site files untouched for 30 days (rollback = DNS back).
10. Report: live checks with screenshots, tag deployed, rollback command, monitoring links.
```
