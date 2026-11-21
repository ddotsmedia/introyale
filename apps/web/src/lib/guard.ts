import { headers } from 'next/headers'
import { hitRateLimit, scopeKey } from './rateLimit'
import { readSecret } from './secrets'

/** Client IP behind the reverse proxy (Nginx sets X-Forwarded-For). Falls back to a fixed label. */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/** A proof-of-work solution may be used once. Replays inside the 10-minute window are refused. */
export async function altchaUnused(payload: unknown): Promise<boolean> {
  if (typeof payload !== 'string' || payload === '') return false
  const hit = await hitRateLimit(scopeKey('altcha', payload), 24 * 60 * 60 * 1000, 1)
  return hit.allowed
}

export const hmacKey = (): string => readSecret('ALTCHA_HMAC_KEY')
export const signingKey = (): string => readSecret('PAYLOAD_SECRET')

export const RATE_LIMITED_MESSAGE =
  'Too many requests from your connection. Please wait a few minutes and try again.'
