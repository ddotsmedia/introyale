import { MFA_COOKIE, readCookie, verifyMfaToken } from './mfa'
import { readSecret } from './secrets'

// Admin pages a signed-in user may open without a verified MFA session (sign-in, MFA verify, recovery).
const OPEN = ['/admin/mfa', '/admin/login', '/admin/logout', '/admin/forgot', '/admin/reset']

/** Reads the (unverified) id and MFA flag from the Payload JWT. Only used to route the request; Payload enforces access. */
function jwtClaims(token: string | undefined): { id?: string | number; mfaOn?: boolean } | null {
  const mid = token?.split('.')[1]
  if (!mid) return null
  try {
    return JSON.parse(Buffer.from(mid, 'base64url').toString('utf8')) as {
      id?: string | number
      mfaOn?: boolean
    }
  } catch {
    return null
  }
}

/**
 * True when a signed-in user who has enabled two-factor opens an admin page without a verified MFA session: the request
 * goes to /admin/mfa to enter the code. Users without 2FA are never redirected. access.admin still denies until verified.
 */
export function needsMfaRedirect(pathname: string, cookieHeader: string | null): boolean {
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return false
  if (OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false
  const claims = jwtClaims(readCookie(cookieHeader, 'payload-token'))
  if (!claims?.id || claims.mfaOn !== true) return false
  return !verifyMfaToken(
    readCookie(cookieHeader, MFA_COOKIE),
    String(claims.id),
    readSecret('PAYLOAD_SECRET'),
  )
}
