# Security controls (as built, M10)

| Control                                                                                     | Where                               | Verified                                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| CSP with per-request nonce, `strict-dynamic`, no inline or eval scripts (eval in dev only)  | src/lib/csp.ts, src/proxy.ts        | unit tests; prod pages hydrate with zero violations |
| Frame denial, form-action self, object-src none, base-uri self                              | src/lib/csp.ts                      | unit tests; curl on prod build                      |
| HSTS (production only), nosniff, Referrer-Policy, Permissions-Policy, COOP, X-Frame-Options | src/lib/csp.ts                      | curl on prod build                                  |
| Rate limits (IP 10/10 min, email 3/h) at the database                                       | src/lib/rateLimit.ts                | integration test                                    |
| Honeypot, signed 3 s timing token, ALTCHA proof of work                                     | src/lib/bot.ts                      | unit tests; browser flow                            |
| Admin and publisher MFA (TOTP, encrypted secret, hashed recovery codes, lockout)            | src/lib/mfa.ts, src/app/api/mfa     | unit tests                                          |
| Account lockout 5 failures / 10 min                                                         | collections/Users.ts                | integration test                                    |
| Log redaction for personal fields                                                           | src/lib/logger.ts                   | unit test                                           |
| Error scrubbing before send (no body, cookies, user, extra)                                 | src/lib/sentryScrub.ts              | unit test                                           |
| Secrets as Docker secrets (`*_FILE`), never in the client bundle                            | src/lib/secrets.ts, compose.yaml    | compose config                                      |
| Image: non-root uid 10001, read-only rootfs, cap_drop ALL                                   | docker/web.Dockerfile, compose.yaml | local prodtest stack                                |
| Image scan: Trivy HIGH/CRITICAL fixable must be zero                                        | CI image job                        | local run: 0 findings                               |

Open items: ZAP baseline (needs the running stack, M11); GlitchTip, Loki and Uptime Kuma alert checks (need the ops stack running); Umami forwarding (not configured; UMAMI_ORIGIN ready); client-side Sentry is off (a DSN cannot ship in the browser).
