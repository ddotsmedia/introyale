import { randomBytes, randomUUID } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import {
  browserOf,
  cleanPath,
  deviceType,
  EVENT_NAMES,
  osOf,
  refDomain,
  screenBucket,
  sourceLabel,
  templateOf,
  VITALS,
  type Collect,
} from './core'

// Storage for first-party analytics (tables from migration m16_analytics_tables). All SQL is parameterised.

type Rows<T> = { rows: T[] }
const run = async <T = Record<string, unknown>>(
  payload: Payload,
  q: ReturnType<typeof sql>,
): Promise<T[]> => ((await payload.db.drizzle.execute(q)) as unknown as Rows<T>).rows

export const SESSION_GAP_MIN = 30
const DUBAI_MS = 4 * 3_600_000

/** Dubai calendar day (YYYY-MM-DD) of an instant. */
export const dubaiDay = (d = new Date()): string =>
  new Date(d.getTime() + DUBAI_MS).toISOString().slice(0, 10)

const salts = new Map<string, string>()

/** The day's random salt. It lives only in this table; yesterday's salt is deleted, so ids cannot be re-linked. */
export async function saltFor(payload: Payload, day: string): Promise<string> {
  const hit = salts.get(day)
  if (hit) return hit
  await run(
    payload,
    sql`INSERT INTO analytics_salts ("day", "salt") VALUES (${day}::date, ${randomBytes(24).toString('hex')}) ON CONFLICT ("day") DO NOTHING`,
  )
  const rows = await run<{ salt: string }>(
    payload,
    sql`SELECT "salt" FROM analytics_salts WHERE "day" = ${day}::date`,
  )
  const salt = rows[0]?.salt ?? randomBytes(24).toString('hex')
  salts.clear() // keep at most one day in memory
  salts.set(day, salt)
  return salt
}

export type HitContext = { vid: string; ua: string; host: string; now?: Date }

/** Finds the visitor's live session (last activity within 30 min) or opens a new one for a pageview. */
async function sessionFor(
  payload: Payload,
  c: Collect,
  ctx: HitContext,
  path: string,
): Promise<string | null> {
  const live = await run<{ sid: string }>(
    payload,
    sql`SELECT "sid" FROM analytics_sessions WHERE "vid" = ${ctx.vid}
        AND "last_ts" > now() - (${SESSION_GAP_MIN} * interval '1 minute') ORDER BY "last_ts" DESC LIMIT 1`,
  )
  if (live[0]) return live[0].sid
  if (c.t === 'ev') return null // a click or scroll without a session is dropped (vitals may arrive just before the pageview)
  const sid = randomUUID().replace(/-/g, '').slice(0, 20)
  const domain = refDomain(c.r, ctx.host)
  await run(
    payload,
    sql`INSERT INTO analytics_sessions ("sid","vid","day","entry_path","exit_path","ref_domain","source","utm_medium","utm_campaign",
        "device","browser","os","screen","lang","region")
        VALUES (${sid}, ${ctx.vid}, ${dubaiDay(ctx.now)}::date, ${path}, ${path}, ${domain}, ${sourceLabel(c.us, domain)},
        ${c.um?.slice(0, 80) ?? null}, ${c.uc?.slice(0, 120) ?? null}, ${deviceType(ctx.ua, c.sw)}, ${browserOf(ctx.ua)},
        ${osOf(ctx.ua)}, ${screenBucket(c.sw)}, ${c.l?.slice(0, 16) ?? null}, ${c.tz?.slice(0, 48) ?? null})`,
  )
  return sid
}

/** Stores one validated hit. Returns false when it was dropped (unknown name, admin path, no session). */
export async function recordHit(payload: Payload, c: Collect, ctx: HitContext): Promise<boolean> {
  const path = cleanPath(c.p)
  if (!path) return false
  if (c.t === 'ev' && !(c.n && EVENT_NAMES.has(c.n))) return false
  if (c.t === 'vt' && !(c.n && VITALS.has(c.n) && c.v !== undefined)) return false
  const sid = await sessionFor(payload, c, ctx, path)
  if (!sid) return false
  const day = dubaiDay(ctx.now)
  const value = c.v === undefined ? null : Math.max(-1e6, Math.min(1e9, c.v))
  await run(
    payload,
    sql`INSERT INTO analytics_events ("day","sid","vid","type","path","title","tpl","name","value")
        VALUES (${day}::date, ${sid}, ${ctx.vid}, ${c.t}, ${path}, ${c.t === 'pv' ? (c.ti?.slice(0, 160) ?? null) : null},
        ${templateOf(path)}, ${c.t === 'pv' ? (c.nf ? '404' : null) : (c.n ?? null)}, ${value})`,
  )
  if (c.t === 'pv') {
    await run(
      payload,
      sql`UPDATE analytics_sessions SET "last_ts" = now(), "exit_path" = ${path}, "pages" = "pages" + 1 WHERE "sid" = ${sid}`,
    )
  } else if (c.t === 'ev') {
    await run(
      payload,
      sql`UPDATE analytics_sessions SET "last_ts" = now(), "events" = "events" + 1 WHERE "sid" = ${sid}`,
    )
  }
  return true
}

export type Attribution = {
  sessionId: string
  source: string
  device: string
  first: { at: string; landing: string; referrer: string; source: string; campaign: string | null }
  last: { at: string; landing: string; referrer: string; source: string; campaign: string | null }
  pages: string[]
  sessions: number
}

type SessRow = {
  sid: string
  first_ts: Date | string
  entry_path: string
  ref_domain: string
  source: string
  utm_campaign: string | null
  device: string
}

/** First and last touch for a visitor today (the id rotates daily, so cross-day history is not kept by design). */
export async function attributionFor(
  payload: Payload,
  vid: string,
  now = new Date(),
): Promise<Attribution | null> {
  const sessions = await run<SessRow>(
    payload,
    sql`SELECT "sid","first_ts","entry_path","ref_domain","source","utm_campaign","device"
        FROM analytics_sessions WHERE "vid" = ${vid} AND "day" = ${dubaiDay(now)}::date ORDER BY "first_ts"`,
  )
  const first = sessions[0]
  const last = sessions[sessions.length - 1]
  if (!first || !last) return null
  const pages = await run<{ path: string }>(
    payload,
    sql`SELECT "path" FROM analytics_events WHERE "vid" = ${vid} AND "type" = 'pv' AND "day" = ${dubaiDay(now)}::date ORDER BY "ts" LIMIT 25`,
  )
  const touch = (s: SessRow) => ({
    at: new Date(s.first_ts).toISOString(),
    landing: s.entry_path,
    referrer: s.ref_domain,
    source: s.source,
    campaign: s.utm_campaign,
  })
  return {
    sessionId: last.sid,
    source: last.source,
    device: last.device,
    first: touch(first),
    last: touch(last),
    pages: pages.map((p) => p.path),
    sessions: sessions.length,
  }
}

// ---- Aggregation -------------------------------------------------------------------------------------------

const SESSION_DIMS: [kind: string, column: string][] = [
  ['device', 'device'],
  ['browser', 'browser'],
  ['os', 'os'],
  ['screen', 'screen'],
  ['lang', 'lang'],
  ['region', 'region'],
  ['source', 'source'],
  ['referrer', 'ref_domain'],
  ['campaign', 'utm_campaign'],
  ['entry', 'entry_path'],
  ['exit', 'exit_path'],
]

const DETAIL = String.raw`^/(work/[^/]+|(residential|commercial|hospitality-leisure)/[^/]+)$`

/** Rebuilds the aggregate rows for one Dubai day from raw events. Idempotent: safe to run any number of times. */
export async function rollup(payload: Payload, day: string): Promise<void> {
  await run(payload, sql`DELETE FROM analytics_daily WHERE "day" = ${day}::date`)
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views","extra","val")
        SELECT ${day}::date, 'total', '', COUNT(DISTINCT "vid"), COUNT(*), COALESCE(SUM("pages"),0),
               COUNT(*) FILTER (WHERE "pages" <= 1 AND "events" = 0),
               COALESCE(SUM(EXTRACT(EPOCH FROM ("last_ts" - "first_ts"))),0)
        FROM analytics_sessions WHERE "day" = ${day}::date`,
  )
  for (const [kind, col] of SESSION_DIMS) {
    await run(
      payload,
      sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions")
          SELECT ${day}::date, ${kind}, ${sql.raw(`"${col}"`)}, COUNT(DISTINCT "vid"), COUNT(*)
          FROM analytics_sessions WHERE "day" = ${day}::date AND ${sql.raw(`"${col}"`)} IS NOT NULL AND ${sql.raw(`"${col}"`)} <> ''
          GROUP BY 3`,
    )
  }
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views")
        SELECT ${day}::date, 'page', "path", COUNT(DISTINCT "vid"), COUNT(DISTINCT "sid"), COUNT(*)
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'pv' GROUP BY "path"`,
  )
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views")
        SELECT ${day}::date, 'nf', "path", COUNT(DISTINCT "vid"), COUNT(DISTINCT "sid"), COUNT(*)
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'pv' AND "name" = '404' GROUP BY "path"`,
  )
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views")
        SELECT ${day}::date, 'event', "name", COUNT(DISTINCT "vid"), COUNT(DISTINCT "sid"), COUNT(*)
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'ev' AND "name" NOT IN ('scroll','time') GROUP BY "name"`,
  )
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views")
        SELECT ${day}::date, 'scroll', "path" || '|' || ("value")::int, COUNT(DISTINCT "vid"), COUNT(DISTINCT "sid"), COUNT(*)
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'ev' AND "name" = 'scroll' AND "value" IS NOT NULL GROUP BY 3`,
  )
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","sessions","views","val")
        SELECT ${day}::date, 'time', "path", COUNT(DISTINCT "vid"), COUNT(DISTINCT "sid"), COUNT(*), SUM(LEAST("value", 1800))
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'ev' AND "name" = 'time' AND "value" IS NOT NULL GROUP BY "path"`,
  )
  await run(
    payload,
    sql`INSERT INTO analytics_daily ("day","kind","key","visitors","views","val")
        SELECT ${day}::date, 'vital', "name" || '|' || "tpl", COUNT(DISTINCT "vid"), COUNT(*),
               percentile_cont(0.75) WITHIN GROUP (ORDER BY "value")
        FROM analytics_events WHERE "day" = ${day}::date AND "type" = 'vt' AND "value" IS NOT NULL GROUP BY "name", "tpl"`,
  )
  // Funnel: sessions that reached each stage (visit -> detail view -> /start -> steps 1-4 -> submitted).
  await run(
    payload,
    sql`WITH st AS (
          SELECT s."sid",
                 bool_or(e."type" = 'pv' AND e."path" ~ ${DETAIL}) AS detail,
                 bool_or(e."type" = 'pv' AND e."path" LIKE '/start%') AS started,
                 bool_or(e."type" = 'ev' AND e."name" = 'step_reached' AND e."value" >= 1) AS s1,
                 bool_or(e."type" = 'ev' AND e."name" = 'step_reached' AND e."value" >= 2) AS s2,
                 bool_or(e."type" = 'ev' AND e."name" = 'step_reached' AND e."value" >= 3) AS s3,
                 bool_or(e."type" = 'ev' AND e."name" = 'step_reached' AND e."value" >= 4) AS s4,
                 bool_or(e."type" = 'ev' AND e."name" = 'consult_submit') AS submitted
          FROM analytics_sessions s LEFT JOIN analytics_events e ON e."sid" = s."sid"
          WHERE s."day" = ${day}::date GROUP BY s."sid")
        INSERT INTO analytics_daily ("day","kind","key","sessions")
        SELECT ${day}::date, 'funnel', k, n FROM (
          SELECT '0 visit' AS k, COUNT(*)::int AS n FROM st
          UNION ALL SELECT '1 detail', COUNT(*) FILTER (WHERE detail) FROM st
          UNION ALL SELECT '2 start', COUNT(*) FILTER (WHERE started) FROM st
          UNION ALL SELECT '3 step1', COUNT(*) FILTER (WHERE s1) FROM st
          UNION ALL SELECT '4 step2', COUNT(*) FILTER (WHERE s2) FROM st
          UNION ALL SELECT '5 step3', COUNT(*) FILTER (WHERE s3) FROM st
          UNION ALL SELECT '6 step4', COUNT(*) FILTER (WHERE s4) FROM st
          UNION ALL SELECT '7 submitted', COUNT(*) FILTER (WHERE submitted) FROM st) f`,
  )
}

/** Keeps today's aggregates fresh (at most once a minute) and finalises yesterday once. */
export async function refreshToday(payload: Payload, maxAgeMs = 60_000): Promise<void> {
  const today = dubaiDay()
  const meta = await run<{ v: string }>(
    payload,
    sql`SELECT "v" FROM analytics_meta WHERE "k" = 'rollup_today'`,
  )
  const at = Number(meta[0]?.v ?? 0)
  if (Date.now() - at < maxAgeMs) return
  await run(
    payload,
    sql`INSERT INTO analytics_meta ("k","v") VALUES ('rollup_today', ${String(Date.now())})
        ON CONFLICT ("k") DO UPDATE SET "v" = EXCLUDED."v"`,
  )
  await rollup(payload, today)
  const yesterday = dubaiDay(new Date(Date.now() - 86_400_000))
  const done = await run(
    payload,
    sql`SELECT 1 FROM analytics_meta WHERE "k" = ${'final_' + yesterday}`,
  )
  if (!done[0]) {
    await rollup(payload, yesterday)
    await run(
      payload,
      sql`INSERT INTO analytics_meta ("k","v") VALUES (${'final_' + yesterday}, '1') ON CONFLICT ("k") DO NOTHING`,
    )
  }
}

export const RAW_RETENTION_DAYS = 90
export const AGG_RETENTION_MONTHS = 25

/** Nightly job body: aggregate yesterday and today, then purge by the retention rules. Returns rows removed. */
export async function nightly(payload: Payload): Promise<{ events: number; aggregates: number }> {
  await refreshToday(payload, 0)
  const ev = await run<{ n: number }>(
    payload,
    sql`WITH d AS (DELETE FROM analytics_events WHERE "ts" < now() - (${RAW_RETENTION_DAYS} * interval '1 day') RETURNING 1)
        SELECT COUNT(*)::int AS n FROM d`,
  )
  await run(
    payload,
    sql`DELETE FROM analytics_sessions WHERE "last_ts" < now() - (${RAW_RETENTION_DAYS} * interval '1 day')`,
  )
  const ag = await run<{ n: number }>(
    payload,
    sql`WITH d AS (DELETE FROM analytics_daily WHERE "day" < (now() - (${AGG_RETENTION_MONTHS} * interval '1 month'))::date RETURNING 1)
        SELECT COUNT(*)::int AS n FROM d`,
  )
  await run(payload, sql`DELETE FROM analytics_salts WHERE "day" < ${dubaiDay()}::date`)
  await run(
    payload,
    sql`DELETE FROM analytics_meta WHERE "k" LIKE 'final_%' AND "k" < ${'final_' + dubaiDay(new Date(Date.now() - 40 * 86_400_000))}`,
  )
  return { events: ev[0]?.n ?? 0, aggregates: ag[0]?.n ?? 0 }
}
