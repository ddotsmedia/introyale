import { createHmac, timingSafeEqual } from 'node:crypto'

// Shareable draft preview links: stateless HMAC tokens that expire (admin v2).
export type PreviewClaim = { c: 'pages' | 'projects' | 'home-page'; id: number; exp: number }

const b64 = (b: Buffer) => b.toString('base64url')

export function signPreview(claim: PreviewClaim, secret: string): string {
  const body = b64(Buffer.from(JSON.stringify(claim)))
  return `${body}.${b64(createHmac('sha256', secret).update(body).digest())}`
}

export function verifyPreview(
  token: string,
  secret: string,
  now = Date.now(),
): PreviewClaim | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const want = createHmac('sha256', secret).update(body).digest()
  const got = Buffer.from(sig, 'base64url')
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null
  try {
    const claim = JSON.parse(Buffer.from(body, 'base64url').toString()) as PreviewClaim
    if (!['pages', 'projects', 'home-page'].includes(claim.c) || typeof claim.id !== 'number')
      return null
    return claim.exp > now ? claim : null
  } catch {
    return null
  }
}
