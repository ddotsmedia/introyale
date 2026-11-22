import { describe, expect, it } from 'vitest'
import { signMfaToken } from '../../src/lib/mfa'
import { needsMfaRedirect } from '../../src/lib/mfaGate'

process.env.PAYLOAD_SECRET = 'gate-test-secret'
const jwt = (claims: object) => `h.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.s`
const withTotp = `payload-token=${jwt({ id: 7, mfaOn: true })}`
const without = `payload-token=${jwt({ id: 7, mfaOn: false })}`

describe('2FA sign-in gate (opt-in)', () => {
  it('sends a user who enabled 2FA, without a verified session, to the code screen', () => {
    expect(needsMfaRedirect('/admin', withTotp)).toBe(true)
    expect(needsMfaRedirect('/admin/collections/pages', withTotp)).toBe(true)
  })
  it('never redirects a user who has not enabled 2FA, whatever the role', () => {
    expect(needsMfaRedirect('/admin', without)).toBe(false)
    expect(
      needsMfaRedirect('/admin', `payload-token=${jwt({ id: 7, role: 'administrator' })}`),
    ).toBe(false)
  })
  it('leaves sign-in, the code screen and logout reachable', () => {
    for (const p of ['/admin/mfa', '/admin/login', '/admin/logout', '/admin/forgot'])
      expect(needsMfaRedirect(p, withTotp)).toBe(false)
  })
  it('lets a verified session through and rejects a cookie issued to someone else', () => {
    expect(
      needsMfaRedirect(
        '/admin',
        `${withTotp}; introyale_mfa=${signMfaToken('7', 'gate-test-secret')}`,
      ),
    ).toBe(false)
    expect(
      needsMfaRedirect(
        '/admin',
        `${withTotp}; introyale_mfa=${signMfaToken('8', 'gate-test-secret')}`,
      ),
    ).toBe(true)
  })
  it('ignores anonymous requests and public pages', () => {
    expect(needsMfaRedirect('/admin', null)).toBe(false)
    expect(needsMfaRedirect('/work', withTotp)).toBe(false)
  })
})
