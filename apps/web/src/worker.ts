import config from '@payload-config'
import { createServer } from 'node:http'
import { getPayload } from 'payload'

const TICK_MS = 5_000
const STALE_MS = 60_000
let lastTick = Date.now()

// Health on WORKER_HEALTH_PORT (default 3001, SPEC §2.1). Returns 503 if the loop has stalled.
createServer((req, res) => {
  if (req.url !== '/health') {
    res.writeHead(404).end()
    return
  }
  const ok = Date.now() - lastTick < STALE_MS
  res.writeHead(ok ? 200 : 503, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ status: ok ? 'ok' : 'stalled' }))
}).listen(Number(process.env.WORKER_HEALTH_PORT ?? 3001), '0.0.0.0')

const payload = await getPayload({ config })

async function tick(): Promise<void> {
  try {
    const result = await payload.jobs.run({ limit: 20 })
    // Counts only (no payloads): useful for operations, and PII-free.
    payload.logger.info({ msg: 'job tick', ...(result as unknown as Record<string, unknown>) })
  } catch (err) {
    // Log the error type only: job payloads can contain PII.
    payload.logger.error({
      msg: 'job run failed',
      err: err instanceof Error ? err.name : 'unknown',
    })
  } finally {
    lastTick = Date.now()
  }
}

setInterval(() => void tick(), TICK_MS)
void tick()

// Retention purge (D11): queued once a day. The task itself is idempotent.
const DAY_MS = 24 * 60 * 60 * 1000
setInterval(() => {
  payload.jobs.queue({ task: 'purgeEnquiries', input: {} }).catch(() => {
    payload.logger.error({ msg: 'could not queue retention purge' })
  })
}, DAY_MS)
