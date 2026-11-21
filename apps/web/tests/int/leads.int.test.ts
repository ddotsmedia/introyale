import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { IP_LIMIT, hitRateLimit, scopeKey } from '../../src/lib/rateLimit'

// Rate limit at the database (SPEC §7 M8): the 11th submission from one IP in 10 minutes is blocked.
const enabled = process.env.INT_DB === '1'

describe.runIf(enabled)('lead rate limits (M8)', () => {
  it('blocks the 11th submission from one IP inside the window', async () => {
    const key = scopeKey('ip', `test-${randomUUID()}`)
    const now = Date.now()
    const results: boolean[] = []
    for (let i = 0; i < 11; i++) {
      results.push((await hitRateLimit(key, IP_LIMIT.windowMs, IP_LIMIT.max, now)).allowed)
    }
    expect(results.slice(0, 10).every(Boolean)).toBe(true)
    expect(results[10]).toBe(false)
  })
})
