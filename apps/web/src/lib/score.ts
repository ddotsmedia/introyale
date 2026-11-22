// Automatic lead score (0-100) with an explanation per factor. Pure and deterministic; weights are in code on
// purpose so every score can be explained (shown as a tooltip in the admin). Missing facts score 0, never a guess.

export type ScoreInput = {
  type?: string | null
  sector?: string | null
  budgetBand?: string | null
  approxArea?: string | null
  stage?: string | null
  targetStart?: string | null
  brief?: string | null
  plansLink?: string | null
  source?: string | null
  pages?: string[] | null
  sessions?: number | null
}
export type Reason = { label: string; points: number }
export type Score = { score: number; band: 'hot' | 'warm' | 'cold'; reasons: Reason[] }

/** Largest number in a text such as "AED 1.5m", "500,000 - 750,000" or "2000 sqft", expanding k/m suffixes. */
export function largestNumber(text: string | null | undefined): number {
  const found = (text ?? '').toLowerCase().matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k|m|million)?/g)
  let best = 0
  for (const m of found) {
    let n = Number((m[1] ?? '0').replace(/,/g, ''))
    if (m[2] === 'k') n *= 1_000
    if (m[2] === 'm' || m[2] === 'million') n *= 1_000_000
    if (Number.isFinite(n) && n > best) best = n
  }
  return best
}

const SECTOR: Record<string, number> = {
  commercial: 15,
  'hospitality-leisure': 15,
  residential: 10,
}
const STAGE: Record<string, number> = {
  delivery: 10,
  design: 10,
  refurbishment: 8,
  concept: 6,
  'not-sure': 2,
}
const SOURCE: Record<string, number> = {
  referral: 10,
  'organic search': 8,
  direct: 6,
  email: 6,
  newsletter: 6,
  social: 5,
}
const DETAIL_PAGE = /^\/(work\/[^/]+|(residential|commercial|hospitality-leisure)\/[^/]+)$/

export function scoreLead(i: ScoreInput): Score {
  const reasons: Reason[] = []
  const add = (label: string, points: number) => {
    if (points > 0) reasons.push({ label, points })
  }
  if (i.type === 'consultation') add('Full consultation request', 10)
  add(`Sector: ${i.sector ?? ''}`, SECTOR[i.sector ?? ''] ?? 0)
  const budget = largestNumber(i.budgetBand)
  if (i.budgetBand) {
    add(
      `Budget band: ${i.budgetBand}`,
      budget >= 1_000_000 ? 25 : budget >= 500_000 ? 18 : budget >= 200_000 ? 12 : 6,
    )
  }
  const area = largestNumber(i.approxArea)
  if (area > 0)
    add(`Area: ${i.approxArea ?? ''}`, area >= 5000 ? 15 : area >= 1500 ? 10 : area >= 500 ? 5 : 2)
  add(`Stage: ${i.stage ?? ''}`, STAGE[i.stage ?? ''] ?? 0)
  if (i.targetStart) add('Start date given', 5)
  if ((i.brief ?? '').length >= 200) add('Detailed brief', 5)
  if (i.plansLink) add('Plans shared', 5)
  if (i.source) add(`Source: ${i.source}`, SOURCE[i.source] ?? 4)
  const pages = i.pages ?? []
  add(
    `${String(pages.length)} pages viewed before sending`,
    pages.length >= 5 ? 10 : pages.length >= 3 ? 6 : 0,
  )
  if (pages.some((p) => DETAIL_PAGE.test(p))) add('Viewed a project or service', 4)
  if ((i.sessions ?? 0) > 1) add('Returned the same day', 3)
  const score = Math.min(
    100,
    reasons.reduce((s, r) => s + r.points, 0),
  )
  return { score, band: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold', reasons }
}
