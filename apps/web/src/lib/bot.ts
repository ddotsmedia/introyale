import { createHmac, timingSafeEqual } from 'node:crypto'
import { verifySolution } from 'altcha-lib/v1'

/** Minimum time between form render and submit (SPEC §7 M8). */
export const MIN_ELAPSED_MS = 3000

/** Honeypot: a hidden field real visitors leave empty. Bots tend to fill it. */
export function honeypotTripped(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

/** Signs a render timestamp so the client cannot forge an earlier start. */
export function signStartedAt(startedAt: number, key: string): string {
  return `${String(startedAt)}.${createHmac('sha256', key).update(String(startedAt)).digest('base64url')}`
}

/** True when the signed timestamp is genuine and at least MIN_ELAPSED_MS old. */
export function elapsedEnough(token: unknown, key: string, now = Date.now()): boolean {
  if (typeof token !== 'string') return false
  const [ts = '', sig = ''] = token.split('.')
  const startedAt = Number(ts)
  if (!Number.isFinite(startedAt)) return false
  const expected = createHmac('sha256', key).update(ts).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  return now - startedAt >= MIN_ELAPSED_MS
}

/** Verifies an ALTCHA proof-of-work payload against the server HMAC key (D16). */
export async function altchaPasses(payload: unknown, hmacKey: string): Promise<boolean> {
  if (typeof payload !== 'string' || payload === '' || hmacKey === '') return false
  try {
    return await verifySolution(payload, hmacKey, true)
  } catch {
    return false
  }
}
