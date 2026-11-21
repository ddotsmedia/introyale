import pino from 'pino'
import { describe, expect, it } from 'vitest'
import { buildCsp, newNonce, staticSecurityHeaders } from '../../src/lib/csp'
import { REDACT_PATHS, logger } from '../../src/lib/logger'
import { scrubEvent } from '../../src/lib/sentryScrub'

describe('Content Security Policy', () => {
  const prod = buildCsp('abc123', { dev: false })
  const directives: Record<string, string> = Object.fromEntries(
    prod.split('; ').map((d) => [d.split(' ')[0] ?? '', d]),
  )

  it('uses a nonce and strict-dynamic for scripts, with no inline or eval scripts', () => {
    expect(directives['script-src']).toContain(`'nonce-abc123'`)
    expect(directives['script-src']).toContain(`'strict-dynamic'`)
    expect(directives['script-src']).not.toContain(`'unsafe-inline'`)
    expect(directives['script-src']).not.toContain(`'unsafe-eval'`)
  })

  it('blocks framing, plugins and foreign form posts', () => {
    expect(prod).toContain(`frame-ancestors 'none'`)
    expect(prod).toContain(`object-src 'none'`)
    expect(prod).toContain(`form-action 'self'`)
  })

  it('allows only the configured analytics origin in connect-src', () => {
    expect(buildCsp('n', { dev: false })).toContain(`connect-src 'self';`)
    expect(buildCsp('n', { dev: false, umamiOrigin: 'https://stats.example.test' })).toContain(
      `connect-src 'self' https://stats.example.test`,
    )
  })

  it('adds unsafe-eval only for the development runtime', () => {
    expect(buildCsp('n', { dev: true })).toContain(`'unsafe-eval'`)
  })

  it('issues a new nonce per request', () => {
    expect(newNonce()).not.toBe(newNonce())
  })
})

describe('security headers', () => {
  it('sets HSTS only in production', () => {
    expect(staticSecurityHeaders(true)['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains',
    )
    expect(staticSecurityHeaders(false)['Strict-Transport-Security']).toBeUndefined()
  })

  it('sets nosniff, referrer, permissions, COOP and frame denial', () => {
    const h = staticSecurityHeaders(true)
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(h['Cross-Origin-Opener-Policy']).toBe('same-origin')
    expect(h['X-Frame-Options']).toBe('DENY')
    expect(h['Permissions-Policy']).toContain('camera=()')
  })
})

describe('log redaction (SPEC §2.9)', () => {
  it('redacts personal fields at the top level and one level down', () => {
    for (const p of ['email', 'phone', 'name', 'brief', 'password', 'token']) {
      expect(REDACT_PATHS).toContain(p)
      expect(REDACT_PATHS).toContain(`*.${p}`)
    }
  })

  it('writes redacted values, not the originals', () => {
    const lines: string[] = []
    const dest = { write: (s: string) => lines.push(s) }
    // Same options as the app logger, pointed at a capture stream.
    const testLog = pino({ redact: { paths: REDACT_PATHS, censor: '[redacted]' } }, dest as never)
    testLog.info({ email: 'lead@example.test', nested: { phone: '+971000' }, msg: 'created' })
    const out = lines.join('')
    expect(out).not.toContain('lead@example.test')
    expect(out).not.toContain('+971000')
    expect(out).toContain('[redacted]')
    expect(out).toContain('created')
    expect(logger).toBeDefined()
  })
})

describe('error scrubbing', () => {
  it('removes request bodies, cookies, users, extra data and sensitive headers', () => {
    const event = scrubEvent({
      request: {
        data: { email: 'a@b.test' },
        cookies: { session: 'x' },
        query_string: 'q=1',
        headers: { cookie: 'x', authorization: 'y', 'user-agent': 'ua' },
      },
      user: { email: 'a@b.test' },
      breadcrumbs: [{ message: 'click', data: { name: 'Test' } }],
      extra: { brief: 'private' },
    })
    expect(event.request.data).toBeUndefined()
    expect(event.request.cookies).toBeUndefined()
    expect(event.request.headers.cookie).toBeUndefined()
    expect(event.request.headers['user-agent']).toBe('ua')
    expect(event.user).toBeUndefined()
    expect(event.breadcrumbs[0]?.data).toBeUndefined()
    expect(event.extra).toBeUndefined()
  })
})
