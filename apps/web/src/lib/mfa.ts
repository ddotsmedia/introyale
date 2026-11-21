import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'

// Cookie proving a recent TOTP check. HMAC-signed with PAYLOAD_SECRET, 12h TTL.
export const MFA_COOKIE = 'introyale_mfa'
const TTL_MS = 12 * 60 * 60 * 1000

export function signMfaToken(userId: string, secret: string, now = Date.now()): string {
  const body = `${userId}.${String(now + TTL_MS)}`
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}

export function verifyMfaToken(
  token: string | undefined,
  userId: string,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token || !secret) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [uid = '', exp = '', sig = ''] = parts
  const expected = createHmac('sha256', secret).update(`${uid}.${exp}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  return uid === userId && Number(exp) > now
}

/** Reads one cookie from a raw Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k = '', ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return undefined
}

// TOTP secret at rest: AES-256-GCM, key derived from PAYLOAD_SECRET.
function aesKey(secret: string): Buffer {
  return createHash('sha256').update(`totp:${secret}`).digest()
}

export function encryptTotpSecret(plain: string, secret: string): string {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', aesKey(secret), iv)
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64url')).join('.')
}

export function decryptTotpSecret(stored: string, secret: string): string {
  const [iv = '', tag = '', enc = ''] = stored.split('.')
  const d = createDecipheriv('aes-256-gcm', aesKey(secret), Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(enc, 'base64url')), d.final()]).toString('utf8')
}

/** Ten one-time recovery codes; only SHA-256 hashes are stored. */
export function newRecoveryCodes(): { plain: string[]; hashes: string[] } {
  const plain = Array.from({ length: 10 }, () => randomBytes(5).toString('hex'))
  return { plain, hashes: plain.map(hashRecovery) }
}

export function hashRecovery(code: string): string {
  return createHash('sha256').update(code.trim().toLowerCase()).digest('hex')
}
