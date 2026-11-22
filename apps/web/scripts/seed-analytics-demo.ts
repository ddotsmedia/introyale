// Local-only demo analytics: 60 days of realistic traffic so every admin chart has data. ENV=local only; never run on production.
// Idempotent: clears analytics tables, regenerates, and adds attribution + score to the TEST enquiries.
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import { scoreLead } from '../src/lib/score'
import { dubaiDay, rollup } from '../src/lib/analytics/store'

if (process.env.ENV !== 'local') {
  console.error('seed-analytics-demo refused: ENV must be "local"')
  process.exit(1)
}

const payload = await getPayload({ config })
const x = (q: ReturnType<typeof sql>) => payload.db.drizzle.execute(q)

// Deterministic pseudo-random so reruns look the same.
let seed = 20261122
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T>(items: readonly T[], weights?: number[]): T => {
  const w = weights ?? items.map(() => 1)
  let r = rnd() * w.reduce((a, b) => a + b, 0)
  for (let i = 0; i < items.length; i++) {
    r -= w[i] ?? 0
    if (r <= 0) return items[i] as T
  }
  return items[items.length - 1] as T
}

const projects = (
  await payload.find({ collection: 'projects', limit: 30, depth: 0, overrideAccess: true })
).docs.map((p) => `/work/${(p as unknown as { slug: string }).slug}`)
const detail = projects.length
  ? projects
  : ['/work/residential-interior-01', '/work/commercial-fit-out-01']
const sectors = ['/residential', '/commercial', '/hospitality-leisure']
const sourcesList = [
  { source: 'organic search', ref: 'google.com', w: 38 },
  { source: 'direct', ref: '', w: 26 },
  { source: 'social', ref: 'instagram.com', w: 14 },
  { source: 'referral', ref: 'propertyfinder.ae', w: 9 },
  { source: 'organic search', ref: 'bing.com', w: 4 },
  { source: 'newsletter', ref: '', w: 6, campaign: 'spring-showcase' },
  { source: 'google', ref: 'google.com', w: 8, campaign: 'villa-fitout-uae' },
]
const devices = [
  { device: 'mobile', ua: 'iPhone', browser: 'Safari', os: 'iOS', screen: '<640', w: 52 },
  { device: 'mobile', ua: 'Android', browser: 'Chrome', os: 'Android', screen: '<640', w: 14 },
  { device: 'desktop', ua: 'Win', browser: 'Chrome', os: 'Windows', screen: '1440+', w: 18 },
  { device: 'desktop', ua: 'Mac', browser: 'Safari', os: 'macOS', screen: '1024-1439', w: 8 },
  { device: 'desktop', ua: 'Edge', browser: 'Edge', os: 'Windows', screen: '1024-1439', w: 4 },
  { device: 'tablet', ua: 'iPad', browser: 'Safari', os: 'iOS', screen: '640-1023', w: 4 },
]
const regions = [
  'Asia/Dubai',
  'Asia/Dubai',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Europe/London',
  'Asia/Riyadh',
  'Asia/Karachi',
  'America/New_York',
]

await x(sql`DELETE FROM analytics_events`)
await x(sql`DELETE FROM analytics_sessions`)
await x(sql`DELETE FROM analytics_daily`)
await x(sql`DELETE FROM analytics_meta`)

const DAYS = 60
const today = dubaiDay()
let sessionsTotal = 0
for (let back = DAYS - 1; back >= 0; back--) {
  const day = dubaiDay(new Date(Date.now() - back * 86_400_000))
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay()
  const growth = 1 + (DAYS - back) / DAYS // traffic grows over the period
  const base = (dow === 5 || dow === 6 ? 22 : 34) * growth
  const n = Math.round(base * (0.8 + rnd() * 0.4)) + (back === 0 ? 6 : 0)
  for (let i = 0; i < n; i++) {
    const src = pick(
      sourcesList,
      sourcesList.map((s) => s.w),
    )
    const dev = pick(
      devices,
      devices.map((d) => d.w),
    )
    const vid = `demo${day.replaceAll('-', '')}${String(i).padStart(4, '0')}`
    const sid = `${vid}s`
    const hour = pick(
      [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22],
      [3, 6, 8, 8, 6, 5, 6, 6, 5, 5, 7, 8, 7, 4],
    )
    const t0 =
      new Date(`${day}T00:00:00+04:00`).getTime() + (hour * 60 + Math.floor(rnd() * 60)) * 60_000
    const entry = pick(
      ['/', '/work', ...detail.slice(0, 6), ...sectors, '/studio', '/journal'],
      [30, 12, 3, 3, 3, 3, 3, 3, 6, 6, 6, 4, 3],
    )
    const pages = [entry]
    const depth = pick([0, 1, 2, 3, 5], [38, 24, 18, 12, 8])
    for (let p = 0; p < depth; p++)
      pages.push(
        pick(
          ['/work', ...detail, ...sectors, '/studio', '/clients', '/contact', '/start'],
          [10, ...detail.map(() => 3), 5, 5, 5, 4, 3, 5, 6],
        ),
      )
    const startsForm = pages.includes('/start')
    const reached = startsForm ? pick([1, 2, 3, 4], [20, 12, 8, 7]) : 0
    const submits = startsForm && reached === 4 && rnd() < 0.55
    const evs: { name: string; value: number | null; path: string; at: number }[] = []
    let at = t0
    for (const p of pages) {
      at += 20_000 + Math.floor(rnd() * 90_000)
      if (rnd() < 0.7) evs.push({ name: 'scroll', value: 25, path: p, at })
      if (rnd() < 0.45) evs.push({ name: 'scroll', value: 50, path: p, at: at + 5000 })
      if (rnd() < 0.25) evs.push({ name: 'scroll', value: 75, path: p, at: at + 9000 })
      if (rnd() < 0.12) evs.push({ name: 'scroll', value: 100, path: p, at: at + 14000 })
      if (/^\/work\//.test(p) && rnd() < 0.35)
        evs.push({ name: 'gallery_open', value: null, path: p, at: at + 3000 })
      if (/^\/work\//.test(p) && rnd() < 0.12)
        evs.push({ name: 'before_after', value: null, path: p, at: at + 4000 })
      if (rnd() < 0.1) evs.push({ name: 'cta_click', value: null, path: p, at: at + 2000 })
      if (rnd() < 0.05) evs.push({ name: 'whatsapp_click', value: null, path: p, at: at + 2500 })
      if (rnd() < 0.03) evs.push({ name: 'phone_click', value: null, path: p, at: at + 2600 })
      evs.push({ name: 'time', value: 15 + Math.floor(rnd() * 140), path: p, at: at + 20_000 })
    }
    for (let s = 1; s <= reached; s++)
      evs.push({ name: 'step_reached', value: s, path: '/start', at: at + s * 20_000 })
    if (submits) evs.push({ name: 'consult_submit', value: null, path: '/start', at: at + 110_000 })
    const last = Math.max(at, ...evs.map((e) => e.at))
    await x(
      sql`INSERT INTO analytics_sessions ("sid","vid","day","first_ts","last_ts","entry_path","exit_path","pages","events","ref_domain","source","utm_medium","utm_campaign","device","browser","os","screen","lang","region")
          VALUES (${sid}, ${vid}, ${day}::date, ${new Date(t0).toISOString()}, ${new Date(last).toISOString()}, ${entry}, ${pages[pages.length - 1] ?? entry}, ${pages.length}, ${evs.length},
          ${src.ref}, ${src.source}, ${src.campaign ? 'campaign' : null}, ${src.campaign ?? null}, ${dev.device}, ${dev.browser}, ${dev.os}, ${dev.screen}, 'en', ${pick(regions)})`,
    )
    let pt = t0
    for (const p of pages) {
      pt += 15_000
      await x(
        sql`INSERT INTO analytics_events ("ts","day","sid","vid","type","path","tpl","title") VALUES (${new Date(pt).toISOString()}, ${day}::date, ${sid}, ${vid}, 'pv', ${p}, ${p === '/' ? 'home' : p.startsWith('/work/') ? 'case study' : 'other'}, ${p})`,
      )
    }
    for (const e of evs) {
      await x(
        sql`INSERT INTO analytics_events ("ts","day","sid","vid","type","path","name","value") VALUES (${new Date(e.at).toISOString()}, ${day}::date, ${sid}, ${vid}, 'ev', ${e.path}, ${e.name}, ${e.value})`,
      )
    }
    // Core Web Vitals samples for about half of the sessions, slightly worse on mobile.
    if (rnd() < 0.5) {
      const tpl = entry === '/' ? 'home' : entry.startsWith('/work/') ? 'case study' : 'other'
      const slow = dev.device === 'mobile' ? 1.35 : 1
      const samples: [string, number][] = [
        ['LCP', Math.round((1500 + rnd() * 1300) * slow)],
        ['INP', Math.round((70 + rnd() * 160) * slow)],
        ['CLS', Math.round(rnd() * 80) / 1000],
        ['FCP', Math.round(900 + rnd() * 700)],
        ['TTFB', Math.round(180 + rnd() * 400)],
      ]
      for (const [name, value] of samples) {
        await x(
          sql`INSERT INTO analytics_events ("ts","day","sid","vid","type","path","tpl","name","value") VALUES (${new Date(t0 + 4000).toISOString()}, ${day}::date, ${sid}, ${vid}, 'vt', ${entry}, ${tpl}, ${name}, ${value})`,
        )
      }
    }
    sessionsTotal++
  }
  await rollup(payload, day)
}

// Attribution and scores on the existing TEST enquiries, spread over the same 60 days.
const tests = await payload.find({
  collection: 'enquiries',
  where: { isTest: { equals: true } },
  limit: 200,
  depth: 0,
  overrideAccess: true,
})
let k = 0
for (const e of tests.docs as unknown as Record<string, unknown>[]) {
  const src = pick(
    sourcesList,
    sourcesList.map((s) => s.w),
  )
  const pages = ['/', pick(sectors), pick(detail), pick(detail), '/start'].slice(
    0,
    2 + Math.floor(rnd() * 4),
  )
  const device = pick(['mobile', 'desktop', 'tablet'], [50, 42, 8])
  const attribution = {
    sessionId: `demo-enq-${String(k++)}`,
    source: src.source,
    device,
    first: {
      at: new Date().toISOString(),
      landing: pages[0] ?? '/',
      referrer: src.ref,
      source: src.source,
      campaign: src.campaign ?? null,
    },
    last: {
      at: new Date().toISOString(),
      landing: pages[0] ?? '/',
      referrer: src.ref,
      source: src.source,
      campaign: src.campaign ?? null,
    },
    pages,
    sessions: rnd() < 0.25 ? 2 : 1,
  }
  const s = scoreLead({
    type: e['type'] as string,
    sector: e['sector'] as string,
    budgetBand: e['budgetBand'] as string,
    approxArea: e['approxArea'] as string,
    stage: e['stage'] as string,
    targetStart: e['targetStart'] as string,
    brief: e['brief'] as string,
    plansLink: e['plansLink'] as string,
    source: attribution.source,
    pages,
    sessions: attribution.sessions,
  })
  await payload.update({
    collection: 'enquiries',
    id: e['id'] as number,
    overrideAccess: true,
    data: {
      attribution,
      utm: { source: src.source, campaign: src.campaign },
      score: s.score,
      scoreReasons: s.reasons,
    },
  })
}
await rollup(payload, today)
console.log(
  `demo analytics: ${String(sessionsTotal)} sessions over ${String(DAYS)} days; ${String(tests.docs.length)} test enquiries scored`,
)
process.exit(0)
