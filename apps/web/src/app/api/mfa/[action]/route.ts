import config from '@payload-config'
import { generateSecret, generateURI, verifySync } from 'otplib'
import { getPayload } from 'payload'
import {
  MFA_COOKIE,
  decryptTotpSecret,
  encryptTotpSecret,
  hashRecovery,
  newRecoveryCodes,
  signMfaToken,
} from '../../../../lib/mfa'
import { readSecret } from '../../../../lib/secrets'

export const dynamic = 'force-dynamic'

const MAX_FAILURES = 5
const LOCK_MS = 10 * 60 * 1000
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers })

type TotpState = {
  enabled?: boolean | null
  secret?: string | null
  recoveryCodes?: { hash: string }[] | null
  failedAttempts?: number | null
  lockedUntil?: string | null
}

/**
 * MFA endpoints (D18, in-house TOTP): enroll → confirm → verify.
 * verify sets the signed introyale_mfa cookie that the admin panel requires.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ action: string }> },
): Promise<Response> {
  const { action } = await ctx.params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return json({ error: 'unauthorised' }, 401)
  const id = user.id
  const secret = readSecret('PAYLOAD_SECRET')
  const body = (await req.json().catch(() => ({}))) as { code?: string; recoveryCode?: string }

  const record = await payload.findByID({ collection: 'users', id, overrideAccess: true, depth: 0 })
  const totp: TotpState = (record as { totp?: TotpState }).totp ?? {}

  if (action === 'enroll') {
    const plain = generateSecret()
    await payload.update({
      collection: 'users',
      id,
      overrideAccess: true,
      data: {
        totp: {
          enabled: false,
          secret: encryptTotpSecret(plain, secret),
          failedAttempts: 0,
          lockedUntil: null,
        },
      },
    })
    const uri = generateURI({ issuer: 'Introyale', label: user.email, secret: plain })
    return json({ otpauthUri: uri })
  }

  if (action === 'confirm') {
    if (!totp.secret) return json({ error: 'enrol first' }, 409)
    const plain = decryptTotpSecret(totp.secret, secret)
    if (!verifySync({ secret: plain, token: body.code ?? '' }).valid)
      return json({ error: 'invalid code' }, 400)
    const { plain: codes, hashes } = newRecoveryCodes()
    await payload.update({
      collection: 'users',
      id,
      overrideAccess: true,
      data: {
        totp: {
          enabled: true,
          failedAttempts: 0,
          lockedUntil: null,
          recoveryCodes: hashes.map((h) => ({ hash: h })),
        },
      },
    })
    // Recovery codes are shown once and never stored in plain text.
    return json({ recoveryCodes: codes })
  }

  if (action === 'verify') {
    if (!totp.enabled || !totp.secret) return json({ error: 'mfa not enabled' }, 409)
    if (totp.lockedUntil && new Date(totp.lockedUntil).getTime() > Date.now()) {
      return json({ error: 'too many attempts, try later' }, 429)
    }
    const plain = decryptTotpSecret(totp.secret, secret)
    let ok = !!body.code && verifySync({ secret: plain, token: body.code }).valid
    let remaining = totp.recoveryCodes ?? []
    if (!ok && body.recoveryCode) {
      const h = hashRecovery(body.recoveryCode)
      if (remaining.some((c) => c.hash === h)) {
        ok = true
        remaining = remaining.filter((c) => c.hash !== h)
      }
    }
    if (!ok) {
      const failed = (totp.failedAttempts ?? 0) + 1
      await payload.update({
        collection: 'users',
        id,
        overrideAccess: true,
        data: {
          totp: {
            failedAttempts: failed >= MAX_FAILURES ? 0 : failed,
            lockedUntil:
              failed >= MAX_FAILURES ? new Date(Date.now() + LOCK_MS).toISOString() : null,
          },
        },
      })
      return json({ error: 'invalid code' }, 400)
    }
    await payload.update({
      collection: 'users',
      id,
      overrideAccess: true,
      data: {
        totp: { failedAttempts: 0, lockedUntil: null, recoveryCodes: remaining },
      },
    })
    const token = signMfaToken(String(id), secret)
    const cookie = [
      `${MFA_COOKIE}=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Max-Age=43200',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ')
    return json({ ok: true }, 200, { 'Set-Cookie': cookie })
  }

  return json({ error: 'not found' }, 404)
}
