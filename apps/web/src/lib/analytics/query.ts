import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { eachDay, type Range } from './range'
import { refreshToday } from './store'

// Read side of first-party analytics. Everything reads the small analytics_daily table (plus live raw rows for
// the realtime panel), so views stay fast with 90 days of raw data.

type Rows<T> = { rows: T[] }
const run = async <T = Record<string, unknown>>(
  payload: Payload,
  q: ReturnType<typeof sql>,
): Promise<T[]> => ((await payload.db.drizzle.execute(q)) as unknown as Rows<T>).rows

export type DayRow = {
  day: string
  visitors: number
  sessions: number
  views: number
  bounces: number
  duration: number
  enquiries: number
}

/** Brings today's aggregates up to date (at most once a minute). Call before reading a range that includes today. */
export const fresh = (payload: Payload) => refreshToday(payload)

const dayStr = (d: unknown): string =>
  typeof d === 'string' ? d.slice(0, 10) : new Date(d as Date).toISOString().slice(0, 10)

/** Enquiries per Dubai day (from the enquiries table, the system of record). */
export async function enquiriesPerDay(payload: Payload, r: Range): Promise<Map<string, number>> {
  const rows = await run<{ day: unknown; n: number }>(
    payload,
    sql`SELECT (created_at AT TIME ZONE 'Asia/Dubai')::date AS day, COUNT(*)::int AS n FROM enquiries
        WHERE (created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY 1`,
  )
  return new Map(rows.map((x) => [dayStr(x.day), x.n]))
}

/** One row per day of the range (zero-filled): visitors, sessions, pageviews, bounces, seconds, enquiries. */
export async function dailySeries(payload: Payload, r: Range): Promise<DayRow[]> {
  const rows = await run<{
    day: unknown
    visitors: number
    sessions: number
    views: number
    extra: number
    val: number
  }>(
    payload,
    sql`SELECT "day", "visitors", "sessions", "views", "extra", "val" FROM analytics_daily
        WHERE "kind" = 'total' AND "day" BETWEEN ${r.from}::date AND ${r.to}::date`,
  )
  const by = new Map(rows.map((x) => [dayStr(x.day), x]))
  const enq = await enquiriesPerDay(payload, r)
  return eachDay(r).map((day) => {
    const x = by.get(day)
    return {
      day,
      visitors: x?.visitors ?? 0,
      sessions: x?.sessions ?? 0,
      views: x?.views ?? 0,
      bounces: x?.extra ?? 0,
      duration: x?.val ?? 0,
      enquiries: enq.get(day) ?? 0,
    }
  })
}

export type Totals = {
  visitors: number
  sessions: number
  views: number
  bounceRate: number
  avgDuration: number
  enquiries: number
  conversion: number
}

export function totalsOf(days: DayRow[]): Totals {
  const sum = (k: keyof Omit<DayRow, 'day'>) => days.reduce((s, d) => s + d[k], 0)
  const sessions = sum('sessions')
  return {
    visitors: sum('visitors'), // sum of daily unique visitors: ids rotate daily by design
    sessions,
    views: sum('views'),
    bounceRate: sessions ? Math.round((sum('bounces') / sessions) * 100) : 0,
    avgDuration: sessions ? sum('duration') / sessions : 0,
    enquiries: sum('enquiries'),
    conversion: sessions ? Math.round((sum('enquiries') / sessions) * 1000) / 10 : 0,
  }
}

export type Top = { key: string; visitors: number; sessions: number; views: number }

/** Highest keys of one aggregate kind (page, source, device, referrer, ...) over a range. */
export async function topKeys(
  payload: Payload,
  kind: string,
  r: Range,
  limit = 10,
  by: 'views' | 'sessions' = 'sessions',
  like?: string,
): Promise<Top[]> {
  return run<Top>(
    payload,
    sql`SELECT "key", SUM("visitors")::int AS visitors, SUM("sessions")::int AS sessions, SUM("views")::int AS views
        FROM analytics_daily WHERE "kind" = ${kind} AND "day" BETWEEN ${r.from}::date AND ${r.to}::date
        AND (${like ?? null}::text IS NULL OR "key" LIKE ${like ?? ''})
        GROUP BY "key" ORDER BY ${sql.raw(by === 'views' ? 'views' : 'sessions')} DESC, "key" LIMIT ${limit}`,
  )
}

export type FunnelStage = { key: string; label: string; sessions: number }
const FUNNEL_LABELS: Record<string, string> = {
  '0 visit': 'Visit',
  '1 detail': 'Viewed a project or service',
  '2 start': 'Opened /start',
  '3 step1': 'Step 1 — Project',
  '4 step2': 'Step 2 — Space and timing',
  '5 step3': 'Step 3 — Contact',
  '6 step4': 'Step 4 — Review',
  '7 submitted': 'Submitted',
}

export async function funnel(payload: Payload, r: Range): Promise<FunnelStage[]> {
  const rows = await run<{ key: string; n: number }>(
    payload,
    sql`SELECT "key", SUM("sessions")::int AS n FROM analytics_daily WHERE "kind" = 'funnel'
        AND "day" BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY "key" ORDER BY "key"`,
  )
  const by = new Map(rows.map((x) => [x.key, x.n]))
  return Object.keys(FUNNEL_LABELS).map((key) => ({
    key,
    label: FUNNEL_LABELS[key] ?? key,
    sessions: by.get(key) ?? 0,
  }))
}

export type Vital = { name: string; tpl: string; p75: number; samples: number }

/** p75 per metric and template, weighted by sample count across the days of the range. */
export async function vitals(payload: Payload, r: Range): Promise<Vital[]> {
  const rows = await run<{ key: string; v: number | null; n: number }>(
    payload,
    sql`SELECT "key", (SUM("val" * "views") / NULLIF(SUM("views"), 0)) AS v, SUM("views")::int AS n
        FROM analytics_daily WHERE "kind" = 'vital' AND "day" BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY "key"`,
  )
  return rows.map((x) => {
    const [name = '', tpl = ''] = x.key.split('|')
    return { name, tpl, p75: x.v ?? 0, samples: x.n }
  })
}

/** Daily p75 of one metric across templates (for the trend line). */
export async function vitalSeries(payload: Payload, name: string, r: Range): Promise<number[]> {
  const rows = await run<{ day: unknown; v: number | null }>(
    payload,
    sql`SELECT "day", (SUM("val" * "views") / NULLIF(SUM("views"), 0)) AS v FROM analytics_daily
        WHERE "kind" = 'vital' AND "key" LIKE ${name + '|%'} AND "day" BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY "day"`,
  )
  const by = new Map(rows.map((x) => [dayStr(x.day), x.v ?? 0]))
  return eachDay(r).map((d) => by.get(d) ?? 0)
}

export type Rating = 'good' | 'needs improvement' | 'poor'
const LIMITS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
}
/** web.dev thresholds for good / needs improvement / poor. */
export function rate(name: string, v: number): Rating {
  const [good, poor] = LIMITS[name] ?? [Infinity, Infinity]
  return v <= good ? 'good' : v <= poor ? 'needs improvement' : 'poor'
}

/** Average visible seconds per page, and scroll-depth reach per page, for the engagement panel. */
export async function engagement(payload: Payload, r: Range, limit = 10) {
  const time = await run<{ key: string; views: number; val: number }>(
    payload,
    sql`SELECT "key", SUM("views")::int AS views, SUM("val") AS val FROM analytics_daily WHERE "kind" = 'time'
        AND "day" BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY "key" ORDER BY SUM("views") DESC LIMIT ${limit}`,
  )
  const scroll = await run<{ key: string; n: number }>(
    payload,
    sql`SELECT "key", SUM("views")::int AS n FROM analytics_daily WHERE "kind" = 'scroll'
        AND "day" BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY "key"`,
  )
  const pages = new Map<string, Record<number, number>>()
  for (const s of scroll) {
    const i = s.key.lastIndexOf('|')
    const path = s.key.slice(0, i)
    pages.set(path, { ...(pages.get(path) ?? {}), [Number(s.key.slice(i + 1))]: s.n })
  }
  return {
    time: time.map((t) => ({ path: t.key, views: t.views, avg: t.views ? t.val / t.views : 0 })),
    scroll: [...pages.entries()]
      .map(([path, d]) => ({
        path,
        d25: d[25] ?? 0,
        d50: d[50] ?? 0,
        d75: d[75] ?? 0,
        d100: d[100] ?? 0,
      }))
      .sort((a, b) => b.d25 - a.d25)
      .slice(0, limit),
  }
}

/** Live view: visitors active in the last 30 minutes and the pages they are on. Reads raw sessions. */
export async function realtime(payload: Payload) {
  const [v] = await run<{ visitors: number; sessions: number }>(
    payload,
    sql`SELECT COUNT(DISTINCT "vid")::int AS visitors, COUNT(*)::int AS sessions FROM analytics_sessions
        WHERE "last_ts" > now() - interval '30 minutes'`,
  )
  const pages = await run<{ path: string; n: number }>(
    payload,
    sql`SELECT "exit_path" AS path, COUNT(*)::int AS n FROM analytics_sessions
        WHERE "last_ts" > now() - interval '30 minutes' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 8`,
  )
  const [now5] = await run<{ n: number }>(
    payload,
    sql`SELECT COUNT(DISTINCT "vid")::int AS n FROM analytics_sessions WHERE "last_ts" > now() - interval '5 minutes'`,
  )
  return { visitors: v?.visitors ?? 0, sessions: v?.sessions ?? 0, last5: now5?.n ?? 0, pages }
}

/** Enquiries by last-touch source, for the conversion table (joined with sessions per source). */
export async function conversionBySource(payload: Payload, r: Range) {
  const enq = await run<{ source: string; n: number }>(
    payload,
    sql`SELECT COALESCE(attribution->>'source', 'unknown') AS source, COUNT(*)::int AS n FROM enquiries
        WHERE (created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY 1`,
  )
  const sessions = new Map(
    (await topKeys(payload, 'source', r, 50)).map((s) => [s.key, s.sessions]),
  )
  const sources = new Set([...enq.map((e) => e.source), ...sessions.keys()])
  return [...sources]
    .map((source) => {
      const enquiries = enq.find((e) => e.source === source)?.n ?? 0
      const s = sessions.get(source) ?? 0
      return {
        source,
        sessions: s,
        enquiries,
        rate: s ? Math.round((enquiries / s) * 1000) / 10 : 0,
      }
    })
    .sort((a, b) => b.enquiries - a.enquiries || b.sessions - a.sessions)
    .slice(0, 12)
}

export async function conversionByDevice(payload: Payload, r: Range) {
  const enq = await run<{ device: string; n: number }>(
    payload,
    sql`SELECT COALESCE(attribution->>'device', 'unknown') AS device, COUNT(*)::int AS n FROM enquiries
        WHERE (created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY 1`,
  )
  const sessions = new Map(
    (await topKeys(payload, 'device', r, 10)).map((s) => [s.key, s.sessions]),
  )
  return ['desktop', 'mobile', 'tablet'].map((device) => {
    const enquiries = enq.find((e) => e.device === device)?.n ?? 0
    const s = sessions.get(device) ?? 0
    return { device, sessions: s, enquiries, rate: s ? Math.round((enquiries / s) * 1000) / 10 : 0 }
  })
}

/** Pages and projects viewed before an enquiry was sent (assisted conversions), most frequent first. */
export async function assisted(payload: Payload, r: Range, limit = 10) {
  return run<{ path: string; n: number }>(
    payload,
    sql`SELECT p AS path, COUNT(DISTINCT e.id)::int AS n FROM enquiries e, jsonb_array_elements_text(e.attribution->'pages') AS p
        WHERE (e.created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${r.from}::date AND ${r.to}::date
        AND p NOT IN ('/start', '/contact', '/') GROUP BY p ORDER BY n DESC, p LIMIT ${limit}`,
  )
}

/** Weekday x hour (Dubai) heatmap of enquiries: 7 rows (Mon..Sun) of 24 counts. */
export async function enquiryHeatmap(payload: Payload, r: Range): Promise<number[][]> {
  const rows = await run<{ dow: number; h: number; n: number }>(
    payload,
    sql`SELECT (EXTRACT(ISODOW FROM created_at AT TIME ZONE 'Asia/Dubai')::int - 1) AS dow,
               EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Dubai')::int AS h, COUNT(*)::int AS n FROM enquiries
        WHERE (created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${r.from}::date AND ${r.to}::date GROUP BY 1, 2`,
  )
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  for (const x of rows) {
    const row = grid[x.dow]
    if (row) row[x.h] = x.n
  }
  return grid
}

/** Approximate storage growth: bytes per raw event and per 10,000 visits (visit = session of about 4 pageviews and 6 events). */
export async function storageEstimate(payload: Payload) {
  const [s] = await run<{ events: number; sessions: number; bytes: number | string; days: number }>(
    payload,
    sql`SELECT (SELECT COUNT(*) FROM analytics_events)::int AS events, (SELECT COUNT(*) FROM analytics_sessions)::int AS sessions,
        (pg_total_relation_size('analytics_events') + pg_total_relation_size('analytics_sessions') + pg_total_relation_size('analytics_daily'))::bigint AS bytes,
        (SELECT COUNT(DISTINCT "day") FROM analytics_events)::int AS days`,
  )
  const sessions = Math.max(1, s?.sessions ?? 0)
  const perVisit = Number(s?.bytes ?? 0) / sessions
  return {
    bytes: Number(s?.bytes ?? 0),
    events: s?.events ?? 0,
    sessions: s?.sessions ?? 0,
    perVisit,
    per10k: perVisit * 10_000,
  }
}
