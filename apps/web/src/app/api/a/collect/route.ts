import { NextResponse } from 'next/server'
import { cms } from '@/lib/cms'
import { hitRateLimit, scopeKey } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'
import { clientIp, collectSchema, isBot, MAX_BODY, optedOut, visitorId } from '@/lib/analytics/core'
import { dubaiDay, recordHit, saltFor } from '@/lib/analytics/store'

export const dynamic = 'force-dynamic'

const RATE = { windowMs: 60_000, max: 120 } // per IP per minute, far above a real visit

const done = () => new NextResponse(null, { status: 204 })

/**
 * First-party analytics collector. Always answers 204 so it reveals nothing; hits are silently dropped for
 * Do Not Track / Global Privacy Control, bots and headless browsers, signed-in admin users and invalid payloads.
 */
export async function POST(req: Request): Promise<Response> {
  const h = req.headers
  if (optedOut(h)) return done()
  const ua = h.get('user-agent') ?? ''
  if (isBot(ua)) return done()
  if (/(^|;\s*)payload-token=/.test(h.get('cookie') ?? '')) return done() // signed-in staff are never counted
  if (Number(h.get('content-length') ?? 0) > MAX_BODY) {
    return new NextResponse(null, { status: 413 })
  }
  const raw = await req.text()
  if (raw.length > MAX_BODY) return new NextResponse(null, { status: 413 })
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return done()
  }
  const parsed = collectSchema.safeParse(json)
  if (!parsed.success) return done()

  const ip = clientIp(h)
  try {
    const limit = await hitRateLimit(scopeKey('collect', ip), RATE.windowMs, RATE.max)
    if (!limit.allowed) return new NextResponse(null, { status: 429 })
    const payload = await cms()
    const salt = await saltFor(payload, dubaiDay())
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
    await recordHit(payload, parsed.data, { vid: visitorId(salt, ip, ua), ua, host })
  } catch (err) {
    logger.warn({
      msg: 'analytics collect failed',
      err: err instanceof Error ? err.name : 'unknown',
    })
  }
  return done()
}
