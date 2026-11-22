// Date ranges for the analytics views (Dubai calendar days, inclusive). Pure, so it is unit-tested.

export type Range = { from: string; to: string }
export const PRESETS = ['today', '7d', '30d', '90d', '12m', 'custom'] as const
export type Preset = (typeof PRESETS)[number]
export type Resolved = { preset: Preset; cur: Range; prev: Range; days: number }

const DAY = 86_400_000
const ms = (d: string) => Date.parse(`${d}T00:00:00Z`)
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10)
const ISO = /^\d{4}-\d{2}-\d{2}$/
const valid = (d: unknown): d is string =>
  typeof d === 'string' && ISO.test(d) && !Number.isNaN(ms(d))

export const addDays = (d: string, n: number): string => fmt(ms(d) + n * DAY)
export const daysBetween = (r: Range): number => Math.round((ms(r.to) - ms(r.from)) / DAY) + 1

/** Resolves a preset (or custom from/to) relative to `today`, with the equally long period right before it. */
export function resolveRange(
  today: string,
  preset: string | undefined,
  from?: string,
  to?: string,
): Resolved {
  let p: Preset = (PRESETS as readonly string[]).includes(preset ?? '') ? (preset as Preset) : '30d'
  let cur: Range
  if (p === 'custom' && valid(from) && valid(to)) {
    const [a, b] = ms(from) <= ms(to) ? [from, to] : [to, from]
    cur = { from: a, to: b > today ? today : b }
    if (daysBetween(cur) > 800) cur = { from: addDays(cur.to, -799), to: cur.to }
  } else {
    if (p === 'custom') p = '30d'
    const n = { today: 1, '7d': 7, '30d': 30, '90d': 90, '12m': 365 }[p]
    cur = { from: addDays(today, -(n - 1)), to: today }
  }
  const days = daysBetween(cur)
  return {
    preset: p,
    cur,
    days,
    prev: { from: addDays(cur.from, -days), to: addDays(cur.from, -1) },
  }
}

/** Percent change, or null when there is nothing to compare with. */
export function delta(cur: number, prev: number): number | null {
  if (!prev) return cur ? 100 : null
  return Math.round(((cur - prev) / prev) * 100)
}

/** Every day of a range, so charts show zero days instead of skipping them. */
export function eachDay(r: Range): string[] {
  const out: string[] = []
  for (let d = r.from; ms(d) <= ms(r.to); d = addDays(d, 1)) out.push(d)
  return out
}

export const fmtDuration = (s: number): string =>
  s >= 60
    ? `${String(Math.floor(s / 60))}m ${String(Math.round(s % 60)).padStart(2, '0')}s`
    : `${String(Math.round(s))}s`
