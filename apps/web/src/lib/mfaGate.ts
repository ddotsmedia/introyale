import { mfaEnforced } from './envPolicy'
import { MFA_COOKIE, readCookie, verifyMfaToken } from './mfa'
import { requiresMfa, type Role } from './roles'
import { readSecret } from './secrets'

// Admin pages a signed-in user may open without a verified MFA session (sign-in, MFA enrol/verify, recovery).
const OPEN = ['/admin/mfa', '/admin/login', '/admin/logout', '/admin/forgot', '/admin/reset']

/** Reads the (unverified) id and role from the Payload JWT. Only used to route the request; access control stays in Payload. */
function jwtClaims(token: string | undefined): { id?: string | number; role?: Role } | null {
  const mid = token?.split('.')[1]
  if (!mid) return null
  try {
    return JSON.parse(Buffer.from(mid, 'base64url').toString('utf8')) as {
      id?: string | number
      role?: Role
    }
  } catch {
    return null
  }
}

/**
 * True when a signed-in user who needs MFA opens an admin page without a verified MFA session: the request is sent to
 * /admin/mfa (enrol or verify) instead of Payload's "Unauthorized". access.admin still denies until MFA is verified.
 */
export function needsMfaRedirect(
  pathname: string,
  cookieHeader: string | null,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return false
  if (OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false
  if (!mfaEnforced(env)) return false
  const claims = jwtClaims(readCookie(cookieHeader, 'payload-token'))
  if (!claims?.id || !requiresMfa(claims.role)) return false
  return !verifyMfaToken(
    readCookie(cookieHeader, MFA_COOKIE),
    String(claims.id),
    readSecret('PAYLOAD_SECRET'),
  )
}
