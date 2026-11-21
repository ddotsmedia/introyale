// Content Security Policy and security headers (SPEC §2.7, M10). Built per request with a nonce.
// Analytics (Umami) origin is added only when configured (UMAMI_ORIGIN).

export function buildCsp(
  nonce: string,
  opts: { dev: boolean; umamiOrigin?: string | null },
): string {
  const scriptSrc = [`'self'`, `'nonce-${nonce}'`, `'strict-dynamic'`]
  if (opts.dev) scriptSrc.push(`'unsafe-eval'`) // Next dev runtime only
  const connectSrc = [`'self'`]
  if (opts.umamiOrigin) connectSrc.push(opts.umamiOrigin)
  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    // Styles: React style props and the Payload admin use inline style attributes. Browsers still apply
    // style-src to those (verified), so unsafe-inline stays for styles. Scripts remain nonce-only.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src ${connectSrc.join(' ')}`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ')
}

/** Headers that do not depend on the request. HSTS only in production (preload after stability). */
export function staticSecurityHeaders(production: boolean): Record<string, string> {
  const h: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
  }
  if (production) h['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains'
  return h
}

/** A base64 nonce, unique per request. */
export function newNonce(): string {
  return btoa(crypto.randomUUID())
}
