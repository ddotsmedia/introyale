# Introyale Interiors website — Claude Code rules

## Mode

- 100% autonomous. Never ask questions. When unsure, apply docs/DECISIONS.md, then docs/SPEC.md, then the safest option; log the choice in docs/decisions-log.md.
- Hard stops (stop and report, do not ask): a required secret is missing; VPS capacity gate fails; any action would touch containers, volumes, networks, Nginx sites or databases not named `introyale*`.

## Token rules (every task)

- Concise commands, minimal output. No re-explaining, no summaries of unchanged code.
- Reuse existing patterns and files. Minimal diffs; never rewrite a whole file for a small change.
- Inline comments only where non-obvious; no long docs except files listed in docs/.
- Report at the end of each milestone only: files changed (list), tests run (pass/fail counts), acceptance criteria (✓/✗).

## Model

- Haiku: pages, components, content templates, tests, SEO, routine fixes.
- Sonnet: Docker/infra, security, auth/permissions, lead pipeline, VPS deploys, cryptic failures.
- State the model at the start of each milestone. When a Sonnet milestone ends, print "✅ Complex phase complete. Reverting to Haiku."

## Stack (fixed)

Next.js App Router + TypeScript strict · Payload CMS 3 (inside Next) · PostgreSQL 16 (pgvector image) · Tailwind CSS (tokens, logical properties) · next-intl (en default, ar reserved) · Zod · pino · Sentry SDK → GlitchTip · Umami · Vitest · Playwright · axe-core · Lighthouse CI · pnpm · Node 22 LTS.
Hosting: Hostinger VPS, Docker + Docker Compose only. Never Vercel/Netlify/shared hosting. Managed services (Cloudflare, R2, SaaS email/CRM/analytics) are optional adapters behind feature flags, default OFF.

## Safety (non-negotiable)

- Build and test locally first (Docker Desktop). VPS work only from milestone M11 onward.
- VPS: read-only diagnostics first (`df -h`, `free -m`, `docker ps`, `ss -ltn`, `ls /etc/nginx/sites-enabled`). Never: `docker system prune`, `docker volume prune`, `pm2 kill`, `rm -rf` outside /opt/introyale, `git reset --hard`, `git push --force`, global Nginx/service restarts (use `nginx -t && systemctl reload nginx` only).
- All compose commands use `-p introyale-<env>` explicitly.
- Never touch introyale.com (site, server, DNS, mail) — ever. The new website lives on introyale.online (production) and staging.introyale.online (staging). M14 production launch runs only with `LAUNCH_APPROVED=yes`.
- Never submit live forms on the current site.
- Never invent business facts. Unverified facts render nothing; mark content `[CONFIRM]` in CMS seed only.
- No secrets in git, images, client bundles or logs. Secrets via Docker secrets (`*_FILE`).
- Verify visually (Playwright screenshots) — never declare done from HTTP status alone.

## Definition of done (every milestone)

`pnpm lint && pnpm typecheck && pnpm test` green · relevant Playwright/axe tests green · acceptance criteria in docs/SPEC.md §7 met · docs updated · conventional commit.

## Content and design rules (owner, permanent)

- introyale.com (the client's own site) is the approved content source: use its real text, images, logos and contact details — never placeholder/demo content in previews. Read-only access only.
- Nothing hard-coded: every piece of site content (text, images, stats, contact, nav, footer, page sections, SEO) is stored in Payload and editable in /admin. Components render CMS data only.
- Visual quality must be premium (image-led, full-bleed, rich sections) — never ship a bare skeleton for review.
- Check port availability (Get-NetTCPConnection) before assigning any port; never stop another process to free one.
- Apply all instructions already given in CLAUDE.md, docs/ and docs/decisions-log.md; do not ask the owner to repeat them.
