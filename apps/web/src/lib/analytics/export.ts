import type { Payload } from 'payload'
import { assisted, conversionBySource, dailySeries, funnel, topKeys, vitals } from './query'
import type { Range } from './range'

export const EXPORT_TABLES = [
  'daily',
  'pages',
  'projects',
  'sources',
  'referrers',
  'campaigns',
  'devices',
  'browsers',
  'os',
  'regions',
  'languages',
  'entry',
  'exit',
  'events',
  'vitals',
  'funnel',
  'conversion',
  'assisted',
  'notfound',
] as const
export type ExportTable = (typeof EXPORT_TABLES)[number]

const KINDS: Partial<Record<ExportTable, string>> = {
  pages: 'page',
  sources: 'source',
  referrers: 'referrer',
  campaigns: 'campaign',
  devices: 'device',
  browsers: 'browser',
  os: 'os',
  regions: 'region',
  languages: 'lang',
  entry: 'entry',
  exit: 'exit',
  events: 'event',
  notfound: 'nf',
}

/** Rows for one CSV export. Same numbers as the screen: they come from the same queries. */
export async function exportTable(
  payload: Payload,
  table: ExportTable,
  r: Range,
): Promise<{ head: string[]; rows: (string | number)[][] }> {
  if (table === 'daily') {
    const d = await dailySeries(payload, r)
    return {
      head: [
        'day',
        'visitors',
        'sessions',
        'pageviews',
        'bounced_sessions',
        'seconds_total',
        'enquiries',
      ],
      rows: d.map((x) => [
        x.day,
        x.visitors,
        x.sessions,
        x.views,
        x.bounces,
        Math.round(x.duration),
        x.enquiries,
      ]),
    }
  }
  if (table === 'projects') {
    const t = await topKeys(payload, 'page', r, 500, 'views', '/work/%')
    return {
      head: ['path', 'visitors', 'pageviews'],
      rows: t.map((x) => [x.key, x.visitors, x.views]),
    }
  }
  if (table === 'vitals') {
    const v = await vitals(payload, r)
    return {
      head: ['metric', 'template', 'p75', 'samples'],
      rows: v.map((x) => [x.name, x.tpl, Math.round(x.p75 * 1000) / 1000, x.samples]),
    }
  }
  if (table === 'funnel') {
    const f = await funnel(payload, r)
    return { head: ['stage', 'sessions'], rows: f.map((x) => [x.label, x.sessions]) }
  }
  if (table === 'conversion') {
    const c = await conversionBySource(payload, r)
    return {
      head: ['source', 'sessions', 'enquiries', 'conversion_percent'],
      rows: c.map((x) => [x.source, x.sessions, x.enquiries, x.rate]),
    }
  }
  if (table === 'assisted') {
    const a = await assisted(payload, r, 200)
    return { head: ['path', 'enquiries_assisted'], rows: a.map((x) => [x.path, x.n]) }
  }
  const t = await topKeys(
    payload,
    KINDS[table] ?? 'page',
    r,
    1000,
    table === 'pages' || table === 'events' || table === 'notfound' ? 'views' : 'sessions',
  )
  return {
    head: ['key', 'visitors', 'sessions', 'views'],
    rows: t.map((x) => [x.key, x.visitors, x.sessions, x.views]),
  }
}

/** CSV cell with formula-injection protection (values starting = + - @ are quoted as text). */
export function csvCell(v: string | number): string {
  let s = String(v)
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
