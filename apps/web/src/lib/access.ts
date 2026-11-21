import type { Access, PayloadRequest } from 'payload'
import { can, requiresMfa, type Action, type Role } from './roles'
import { MFA_COOKIE, readCookie, verifyMfaToken } from './mfa'
import { readSecret } from './secrets'
import { mfaEnforced } from './envPolicy'

type AuthUser = { id: number | string; role?: Role } | null | undefined

/** True when the role needs no MFA, or a valid signed MFA cookie is present (D10). */
export function mfaSatisfied(req: PayloadRequest): boolean {
  const u = req.user as AuthUser
  if (!u) return false
  if (!requiresMfa(u.role)) return true
  if (!mfaEnforced()) return true // local preview only; see envPolicy.ts
  return verifyMfaToken(
    readCookie(req.headers.get('cookie'), MFA_COOKIE),
    String(u.id),
    readSecret('PAYLOAD_SECRET'),
  )
}

/** Field-level check with the same rule as allow(): role grants action and MFA is satisfied. */
export function actionAllowed(req: PayloadRequest, action: Action): boolean {
  const u = req.user as AuthUser
  return !!u && can(u.role, action) && mfaSatisfied(req)
}

/** Allows authenticated users whose role grants `action` and who have satisfied MFA. */
export function allow(action: Action): Access {
  return ({ req }) => {
    const u = req.user as AuthUser
    return !!u && can(u.role, action) && mfaSatisfied(req)
  }
}

/** Public reads see only published docs; signed-in staff (with MFA where required) see all. */
export const publicReadPublished: Access = ({ req }) => {
  if (req.user && mfaSatisfied(req)) return true
  return { 'workflow.status': { equals: 'published' } }
}

/** Enquiries: admins read all; others read only the enquiries assigned to them. */
export const enquiriesRead: Access = ({ req }) => {
  const u = req.user as AuthUser
  if (!u || !mfaSatisfied(req)) return false
  if (u.role === 'administrator') return true
  if (!can(u.role, 'enquiries.read')) return false
  return { assignedTo: { equals: u.id } }
}
