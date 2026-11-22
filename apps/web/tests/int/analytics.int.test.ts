import { randomUUID } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { describe, expect, it } from 'vitest'
import { cms } from '../../src/lib/cms'
import { visitorId, type Collect } from '../../src/lib/analytics/core'
import {
  attributionFor,
  dubaiDay,
  nightly,
  recordHit,
  rollup,
  saltFor,
} from '../../src/lib/analytics/store'

// Storage, sessions, aggregation and retention against a real database (INT_DB=1). Clears the analytics tables first.
const enabled = process.env.INT_DB === '1'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const ctx = (vid: string) => ({ vid, ua: UA, host: 'introyale.online' })
const pv = (p: string, extra: Partial<Collect> = {}): Collect => ({ t: 'pv', p, ...extra })
const ev = (n: string, v?: number): Collect => ({ t: 'ev', p: '/start', n, v })

describe.runIf(enabled)('first-party analytics store', () => {
  it('opens sessions, drops invalid hits, aggregates and keeps attribution', async () => {
    const payload = await cms()
    const q = (s: ReturnType<typeof sql>) => payload.db.drizzle.execute(s)
    for (const t of ['events', 'sessions', 'daily', 'salts', 'meta']) {
      await q(sql.raw(`DELETE FROM analytics_${t}`))
    }
    const day = dubaiDay()
    const salt = await saltFor(payload, day)
    const a = visitorId(salt, '203.0.113.1', UA)
    const b = visitorId(salt, '203.0.113.2', UA)

    // Visitor A: google -> project -> /start, steps 1-3, submit.
    expect(
      await recordHit(payload, pv('/', { r: 'https://www.google.com/', sw: 1440 }), ctx(a)),
    ).toBe(true)
    await recordHit(payload, pv('/work/villa-one'), ctx(a))
    await recordHit(payload, pv('/start'), ctx(a))
    for (const n of [1, 2, 3]) await recordHit(payload, ev('step_reached', n), ctx(a))
    await recordHit(payload, ev('consult_submit'), ctx(a))
    await recordHit(payload, ev('scroll', 50), ctx(a))
    await recordHit(payload, { t: 'vt', p: '/', n: 'LCP', v: 1800 }, ctx(a))
    // Visitor B: utm campaign, a single pageview (bounce).
    await recordHit(payload, pv('/', { us: 'Newsletter', uc: 'spring', sw: 390 }), ctx(b))
    // Dropped: unknown event name, admin path, event without a session.
    expect(await recordHit(payload, ev('made_up'), ctx(a))).toBe(false)
    expect(await recordHit(payload, pv('/admin/leads'), ctx(a))).toBe(false)
    expect(
      await recordHit(payload, ev('scroll', 25), ctx(visitorId(salt, '203.0.113.99', UA))),
    ).toBe(false)

    await rollup(payload, day)
    const get = async (kind: string, key = '') =>
      (
        (await q(
          sql`SELECT * FROM analytics_daily WHERE "day" = ${day}::date AND "kind" = ${kind} AND "key" = ${key}`,
        )) as unknown as { rows: Record<string, number>[] }
      ).rows[0]
    const total = await get('total')
    expect(total).toMatchObject({ visitors: 2, sessions: 2, views: 4, extra: 1 }) // B bounced
    expect(await get('source', 'organic search')).toMatchObject({ sessions: 1 })
    expect(await get('source', 'newsletter')).toMatchObject({ sessions: 1 })
    expect(await get('campaign', 'spring')).toMatchObject({ sessions: 1 })
    expect(await get('page', '/')).toMatchObject({ views: 2, visitors: 2 })
    expect(await get('device', 'mobile')).toMatchObject({ sessions: 1 })
    expect(await get('event', 'step_reached')).toMatchObject({ views: 3 })
    expect(await get('vital', 'LCP|home')).toMatchObject({ views: 1, val: 1800 })
    const stage = async (k: string) => (await get('funnel', k))?.sessions
    expect([await stage('0 visit'), await stage('1 detail'), await stage('2 start')]).toEqual([
      2, 1, 1,
    ])
    expect([
      await stage('3 step1'),
      await stage('5 step3'),
      await stage('6 step4'),
      await stage('7 submitted'),
    ]).toEqual([1, 1, 0, 1])

    // Rolling up twice does not double count.
    await rollup(payload, day)
    expect((await get('total'))?.views).toBe(4)

    // Attribution: first and last touch, pages viewed before submit.
    const attr = await attributionFor(payload, a)
    expect(attr).toMatchObject({ source: 'organic search', device: 'desktop', sessions: 1 })
    expect(attr?.pages).toEqual(['/', '/work/villa-one', '/start'])
    expect(await attributionFor(payload, visitorId(salt, '198.51.100.7', UA))).toBeNull()
  })

  it('rotates the salt daily so a visitor id never links across days', async () => {
    const payload = await cms()
    const d1 = '2031-01-01'
    const d2 = '2031-01-02'
    const [s1, s2] = [await saltFor(payload, d1), await saltFor(payload, d2)]
    expect(s1).not.toBe(s2)
    expect(visitorId(s1, '203.0.113.1', UA)).not.toBe(visitorId(s2, '203.0.113.1', UA))
    expect(await saltFor(payload, d2)).toBe(s2)
    await payload.db.drizzle.execute(sql`DELETE FROM analytics_salts WHERE "day" >= '2031-01-01'`)
  })

  it('purges raw data after 90 days and aggregates after 25 months', async () => {
    const payload = await cms()
    const sid = randomUUID().slice(0, 12)
    const x = (s: ReturnType<typeof sql>) => payload.db.drizzle.execute(s)
    await x(
      sql`INSERT INTO analytics_sessions ("sid","vid","day","last_ts","entry_path","exit_path") VALUES (${sid}, 'v', '2020-01-01', now() - interval '91 days', '/', '/')`,
    )
    await x(
      sql`INSERT INTO analytics_events ("ts","day","sid","vid","type","path") VALUES (now() - interval '91 days', '2020-01-01', ${sid}, 'v', 'pv', '/')`,
    )
    await x(
      sql`INSERT INTO analytics_daily ("day","kind","key") VALUES ('2020-01-01', 'old', ${sid}), (current_date - 10, 'new', ${sid})`,
    )
    const r = await nightly(payload)
    expect(r.events).toBeGreaterThanOrEqual(1)
    const left = (await x(
      sql`SELECT (SELECT COUNT(*) FROM analytics_events WHERE "sid" = ${sid})::int AS e, (SELECT COUNT(*) FROM analytics_daily WHERE "key" = ${sid})::int AS a`,
    )) as unknown as { rows: { e: number; a: number }[] }
    expect(left.rows[0]).toEqual({ e: 0, a: 1 })
    await x(sql`DELETE FROM analytics_daily WHERE "key" = ${sid}`)
  })
})
