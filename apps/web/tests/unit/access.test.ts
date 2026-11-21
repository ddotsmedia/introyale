import { describe, expect, it, vi } from 'vitest'
import { allow, enquiriesRead, mfaSatisfied, publicReadPublished } from '../../src/lib/access'
import { MFA_COOKIE, signMfaToken } from '../../src/lib/mfa'
import type { Role } from '../../src/lib/roles'

// Stub PAYLOAD_SECRET so mfaSatisfied can verify tokens signed with the same key.
vi.stubEnv('PAYLOAD_SECRET', 'test-secret')

type FakeUser = { id: number; role: Role } | null
const req = (user: FakeUser, cookie?: string) =>
  ({ user, headers: new Headers(cookie ? { cookie } : {}) }) as never

const withMfa = (user: { id: number; role: Role }) =>
  `${MFA_COOKIE}=${signMfaToken(String(user.id), 'test-secret')}`

const ctx = (user: FakeUser, cookie?: string) => ({ req: req(user, cookie) }) as never

describe('MFA gate', () => {
  it('requires a valid cookie for administrators', () => {
    const admin = { id: 1, role: 'administrator' as const }
    expect(mfaSatisfied(req(admin))).toBe(false)
    expect(mfaSatisfied(req(admin, withMfa(admin)))).toBe(true)
  })

  it('requires a valid cookie for publishers', () => {
    const pub = { id: 2, role: 'publisher' as const }
    expect(mfaSatisfied(req(pub))).toBe(false)
  })

  it('does not require MFA for content editors', () => {
    expect(mfaSatisfied(req({ id: 3, role: 'content_editor' }))).toBe(true)
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

  it('denies an administrator without an MFA cookie', () => {
    expect(check(ctx({ id: 1, role: 'administrator' }))).toBe(false)
  })

  it('allows an administrator with a valid MFA cookie', () => {
    const admin = { id: 1, role: 'administrator' as const }
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
