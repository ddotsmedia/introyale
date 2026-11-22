import { describe, expect, it, vi } from 'vitest'
import { allow, enquiriesRead, mfaSatisfied, publicReadPublished } from '../../src/lib/access'
import { MFA_COOKIE, signMfaToken } from '../../src/lib/mfa'
import type { Role } from '../../src/lib/roles'

// Stub PAYLOAD_SECRET so mfaSatisfied can verify tokens signed with the same key.
vi.stubEnv('PAYLOAD_SECRET', 'test-secret')

type FakeUser = { id: number; role: Role; totp?: { enabled: boolean } } | null
const req = (user: FakeUser, cookie?: string) =>
  ({ user, headers: new Headers(cookie ? { cookie } : {}) }) as never

const withMfa = (user: { id: number; role: Role }) =>
  `${MFA_COOKIE}=${signMfaToken(String(user.id), 'test-secret')}`

const ctx = (user: FakeUser, cookie?: string) => ({ req: req(user, cookie) }) as never

describe('MFA gate (opt-in, D10)', () => {
  it('lets every signed-in role through while 2FA is off', () => {
    for (const role of ['administrator', 'publisher', 'content_editor'] as const)
      expect(mfaSatisfied(req({ id: 1, role }))).toBe(true)
    expect(mfaSatisfied(req({ id: 1, role: 'administrator', totp: { enabled: false } }))).toBe(true)
    expect(mfaSatisfied(req(null))).toBe(false)
  })

  it('requires the signed cookie once a user has enabled 2FA', () => {
    const u = { id: 1, role: 'administrator' as const, totp: { enabled: true } }
    expect(mfaSatisfied(req(u))).toBe(false)
    expect(mfaSatisfied(req(u, withMfa(u)))).toBe(true)
    expect(mfaSatisfied(req(u, withMfa({ ...u, id: 2 })))).toBe(false)
  })

  it('has no trust shortcut: a local-API call without the cookie is denied for a 2FA user', () => {
    const u = { id: 1, role: 'administrator' as const, totp: { enabled: true } }
    const local = { user: u, payloadAPI: 'local', headers: new Headers() } as never
    expect(mfaSatisfied(local)).toBe(false)
  })
})

describe('allow(action)', () => {
  const check = allow('content.write')

  it('denies anonymous users', () => {
    expect(check(ctx(null))).toBe(false)
  })

  it('allows a content editor who has the action', () => {
    expect(check(ctx({ id: 3, role: 'content_editor' }))).toBe(true)
  })

  it('denies a project editor who lacks the action', () => {
    expect(check(ctx({ id: 4, role: 'project_editor' }))).toBe(false)
  })

  it('allows an administrator who has not enabled 2FA', () => {
    expect(check(ctx({ id: 1, role: 'administrator' }))).toBe(true)
  })

  it('denies a 2FA administrator without the MFA cookie', () => {
    expect(check(ctx({ id: 1, role: 'administrator', totp: { enabled: true } }))).toBe(false)
  })

  it('allows an administrator with a valid MFA cookie', () => {
    const admin = { id: 1, role: 'administrator' as const, totp: { enabled: true } }
    expect(check(ctx(admin, withMfa(admin)))).toBe(true)
  })
})

describe('public read rules', () => {
  it('limits anonymous reads to published documents', () => {
    expect(publicReadPublished(ctx(null))).toEqual({ 'workflow.status': { equals: 'published' } })
  })

  it('lets a signed-in content editor read everything', () => {
    expect(publicReadPublished(ctx({ id: 3, role: 'content_editor' }))).toBe(true)
  })
})

describe('enquiries', () => {
  it('denies anonymous readers', () => {
    expect(enquiriesRead(ctx(null))).toBe(false)
  })

  it('lets administrators read all enquiries', () => {
    const admin = { id: 1, role: 'administrator' as const }
    expect(enquiriesRead(ctx(admin, withMfa(admin)))).toBe(true)
  })

  it('limits marketing reviewers to enquiries assigned to them', () => {
    expect(enquiriesRead(ctx({ id: 7, role: 'marketing_reviewer' }))).toEqual({
      assignedTo: { equals: 7 },
    })
  })

  it('denies content editors', () => {
    expect(enquiriesRead(ctx({ id: 3, role: 'content_editor' }))).toBe(false)
  })
})
