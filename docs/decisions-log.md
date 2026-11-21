# Decisions log

| Date       | Milestone | Decision                                                                                                                                     | Basis                     |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 2026-11-21 | M0        | `residencial.php` mapped 301 → `/residential` even though live returns 404 (homepage links it)                                               | SPEC §4 legacy map        |
| 2026-11-21 | M0        | Facts seed holds live-site claims (phone, email, 10+/1050+/50+/10+) as `unverified`; nothing rendered until verified                         | SPEC C9, D13              |
| 2026-11-21 | M0        | Crawl limited to the 11 PHP URLs linked from the homepage (sitemap.xml absent: 404/empty); GET only                                          | CLAUDE.md read-only rule  |
| 2026-11-21 | M1        | Model conflict: BUILD-PROMPTS says Sonnet for M1, SPEC §7 says Haiku. Pending: will follow BUILD-PROMPTS (Sonnet) since it is the run script | BUILD-PROMPTS.md, SPEC §7 |
| 2026-11-21 | M0        | Root copies of SPEC/DECISIONS/CLAUDE are identical to docs/ copies; docs/ used as source                                                     | diff check                |
