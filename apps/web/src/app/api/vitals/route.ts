import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const METRICS = new Set(['LCP', 'CLS', 'INP', 'FCP', 'TTFB'])

/**
 * Real-user Core Web Vitals beacon (SPEC §2.9). Accepts only metric name and value, logs them without
 * the page URL or any identifier, and returns 204. Umami forwarding is added once Umami is configured.
 */
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { name?: unknown; value?: unknown } | null
  if (
    body &&
    typeof body.name === 'string' &&
    METRICS.has(body.name) &&
    typeof body.value === 'number' &&
    Number.isFinite(body.value)
  ) {
    logger.info({
      msg: 'web-vital',
      metric: body.name,
      value: Math.round(body.value * 1000) / 1000,
    })
  }
  return new Response(null, { status: 204 })
}
