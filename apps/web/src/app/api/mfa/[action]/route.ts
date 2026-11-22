import config from '@payload-config'
import { generateSecret, generateURI, verifySync } from 'otplib'
import { getPayload, type Payload } from 'payload'
import { writeAudit } from '../../../../lib/audit'
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
type Body = { code?: string; recoveryCode?: string; password?: string }

const mfaCookie = (userId: string | number, secret: string): string =>
  [
    `${MFA_COOKIE}=${signMfaToken(String(userId), secret)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=43200',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')

/** Checks a TOTP code or a recovery code with the 5-failures / 10-minute lockout. Consumes a used recovery code. */
async function secondFactor(
  payload: Payload,
  id: string | number,
  totp: TotpState,
  body: Body,
  secret: string,
): Promise<{ ok: true } | { ok: false; status: 400 | 429 }> {
  if (totp.lockedUntil && new Date(totp.lockedUntil).getTime() > Date.now()) {
    return { ok: false, status: 429 }
  }
  const plain = decryptTotpSecret(totp.secret ?? '', secret)
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
    const lock = failed >= MAX_FAILURES
    await payload.update({
      collection: 'users',
      id,
      overrideAccess: true,
      data: {
        totp: {
          failedAttempts: lock ? 0 : failed,
          lockedUntil: lock ? new Date(Date.now() + LOCK_MS).toISOString() : null,
        },
      },
    })
    if (lock) {
      await writeAudit(payload, { actor: id, action: 'mfa.locked', collection: 'users', docId: id })
    }
    return { ok: false, status: 400 }
  }
  await payload.update({
    collection: 'users',
    id,
    overrideAccess: true,
    data: { totp: { failedAttempts: 0, lockedUntil: null, recoveryCodes: remaining } },
  })
  return { ok: true }
}

/**
 * Two-factor endpoints (D18, in-house TOTP). 2FA is opt-in for every role (D10):
 * enroll -> confirm (turns it on) | verify (sign-in code) | disable (needs current password and a code).
 * verify, confirm and disable set the signed introyale_mfa cookie that a user with 2FA enabled needs.
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
  const body = (await req.json().catch(() => ({}))) as Body

  const record = await payload.findByID({ collection: 'users', id, overrideAccess: true, depth: 0 })
  const totp: TotpState = (record as { totp?: TotpState }).totp ?? {}

  if (action === 'enroll') {
    if (totp.enabled) return json({ error: 'two-factor is already on; turn it off first' }, 409)
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
    return json({
      otpauthUri: generateURI({ issuer: 'Introyale', label: user.email, secret: plain }),
    })
  }

  if (action === 'confirm') {
    if (totp.enabled) return json({ error: 'already on' }, 409)
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
    await writeAudit(payload, { actor: id, action: 'mfa.enabled', collection: 'users', docId: id })
    // The code was just proven, so this session counts as verified. Recovery codes are shown once.
    return json({ recoveryCodes: codes }, 200, { 'Set-Cookie': mfaCookie(id, secret) })
  }

  if (action === 'verify') {
    if (!totp.enabled || !totp.secret) return json({ error: 'mfa not enabled' }, 409)
    const r = await secondFactor(payload, id, totp, body, secret)
    if (!r.ok)
      return json(
        { error: r.status === 429 ? 'too many attempts, try later' : 'invalid code' },
        r.status,
      )
    return json({ ok: true }, 200, { 'Set-Cookie': mfaCookie(id, secret) })
  }

  if (action === 'disable') {
    if (!totp.enabled || !totp.secret) return json({ error: 'two-factor is not on' }, 409)
    if (!body.password) return json({ error: 'password required' }, 400)
    // payload.login applies the account lockout (5 failures / 10 minutes) and never reveals which part was wrong.
    try {
      await payload.login({
        collection: 'users',
        data: { email: user.email, password: body.password },
      })
    } catch {
      return json({ error: 'invalid password' }, 401)
    }
    const r = await secondFactor(payload, id, totp, body, secret)
    if (!r.ok)
      return json(
        { error: r.status === 429 ? 'too many attempts, try later' : 'invalid code' },
        r.status,
      )
    await payload.update({
      collection: 'users',
      id,
      overrideAccess: true,
      data: {
        totp: {
          enabled: false,
          secret: null,
          recoveryCodes: [],
          failedAttempts: 0,
          lockedUntil: null,
        },
      },
    })
    await writeAudit(payload, { actor: id, action: 'mfa.disabled', collection: 'users', docId: id })
    return json({ ok: true }, 200, { 'Set-Cookie': mfaCookie(id, secret) })
  }

  return json({ error: 'not found' }, 404)
}
