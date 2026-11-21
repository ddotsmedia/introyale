import { createChallenge } from 'altcha-lib/v1'
import { readSecret } from '@/lib/secrets'

export const dynamic = 'force-dynamic'

/** ALTCHA proof-of-work challenge for the self-hosted widget (D16). Short-lived. */
export async function GET(): Promise<Response> {
  const hmacKey = readSecret('ALTCHA_HMAC_KEY')
  if (!hmacKey) return Response.json({ error: 'unavailable' }, { status: 503 })
  const challenge = await createChallenge({
    hmacKey,
    maxNumber: 100_000,
    expires: new Date(Date.now() + 10 * 60 * 1000),
  })
  return Response.json(challenge, { headers: { 'Cache-Control': 'no-store' } })
}
