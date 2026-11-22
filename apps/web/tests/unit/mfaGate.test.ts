import { describe, expect, it } from 'vitest'
import { signMfaToken } from '../../src/lib/mfa'
import { needsMfaRedirect } from '../../src/lib/mfaGate'

process.env.PAYLOAD_SECRET = 'gate-test-secret'
const jwt = (claims: object) => `h.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.s`
const env = { ENV: 'production' }
const admin = `payload-token=${jwt({ id: 7, role: 'administrator' })}`

describe('admin MFA gate', () => {
  it('sends a signed-in administrator without MFA to enrol/verify', () => {
    expect(needsMfaRedirect('/admin', admin, env)).toBe(true)
    expect(needsMfaRedirect('/admin/collections/pages', admin, env)).toBe(true)
  })
  it('leaves sign-in, MFA and logout reachable', () => {
    for (const p of ['/admin/mfa', '/admin/login', '/admin/logout', '/admin/forgot'])
      expect(needsMfaRedirect(p, admin, env)).toBe(false)
  })
  it('lets a verified MFA session through', () => {
    const cookie = `${admin}; introyale_mfa=${signMfaToken('7', 'gate-test-secret')}`
    expect(needsMfaRedirect('/admin', cookie, env)).toBe(false)
  })
  it('rejects an MFA cookie issued to another user', () => {
    const cookie = `${admin}; introyale_mfa=${signMfaToken('8', 'gate-test-secret')}`
    expect(needsMfaRedirect('/admin', cookie, env)).toBe(true)
  })
  it('ignores anonymous requests, public pages and roles without MFA', () => {
    expect(needsMfaRedirect('/admin', null, env)).toBe(false)
    expect(needsMfaRedirect('/work', admin, env)).toBe(false)
    const editor = `payload-token=${jwt({ id: 9, role: 'content_editor' })}`
    expect(needsMfaRedirect('/admin', editor, env)).toBe(false)
  })
  it('is off only for local with MFA_ENFORCE=false', () => {
    expect(needsMfaRedirect('/admin', admin, { ENV: 'local', MFA_ENFORCE: 'false' })).toBe(false)
    expect(needsMfaRedirect('/admin', admin, { ENV: 'production', MFA_ENFORCE: 'false' })).toBe(
      true,
    )
  })
})

describe('mfaSatisfied for server-side local calls', () => {
  const user = { id: 7, role: 'administrator' }
  const run = async (req: object) => {
    process.env.ENV = 'production'
    process.env.PAYLOAD_SECRET = 'gate-test-secret'
    const { mfaSatisfied } = await import('../../src/lib/access')
    return mfaSatisfied(req as never)
  }
  it('trusts a local-API call that carries no request credentials', async () => {
    expect(await run({ user, payloadAPI: 'local', headers: new Headers() })).toBe(true)
  })
  it('still denies requests with a cookie but no MFA cookie, and REST calls', async () => {
    const h = new Headers({ cookie: 'payload-token=x' })
    expect(await run({ user, payloadAPI: 'local', headers: h })).toBe(false)
    expect(await run({ user, payloadAPI: 'REST', headers: new Headers() })).toBe(false)
  })
})
