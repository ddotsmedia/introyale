import { headers } from 'next/headers'
import { readSecret } from './secrets'

/** Client IP behind the reverse proxy (Nginx sets X-Forwarded-For). Falls back to a fixed label. */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

export const hmacKey = (): string => readSecret('ALTCHA_HMAC_KEY')
export const signingKey = (): string => readSecret('PAYLOAD_SECRET')

export const RATE_LIMITED_MESSAGE =
  'Too many requests from your connection. Please wait a few minutes and try again.'
