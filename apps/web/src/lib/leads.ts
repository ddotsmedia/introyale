// Lead CRM vocabulary shared by collections, views, jobs and tests (admin v2).
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'site_visit',
  'proposal_sent',
  'won',
  'lost',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export const OPEN_STATUSES: readonly LeadStatus[] = [
  'new',
  'contacted',
  'site_visit',
  'proposal_sent',
]

/** Duplicate window: same email or phone within 90 days is linked as related. */
export const DUPLICATE_DAYS = 90

const HOUR = 60 * 60 * 1000

export function normPhone(p: string | null | undefined): string {
  return (p ?? '').replace(/\D/g, '')
}

/** Whole business hours (Dubai: Monday to Friday, 09:00 to 18:00, UTC+4, no DST) between two instants. */
export function businessHoursBetween(from: Date, to: Date): number {
  let hours = 0
  for (let t = from.getTime(); t < to.getTime(); t += HOUR) {
    const d = new Date(t + 4 * HOUR)
    const day = d.getUTCDay()
    const h = d.getUTCHours()
    if (day >= 1 && day <= 5 && h >= 9 && h < 18) hours++
  }
  return hours
}

/** Calendar parts of an instant in Dubai local time. */
export function dubaiParts(d: Date): { date: string; h: number; min: number } {
  const x = new Date(d.getTime() + 4 * HOUR)
  return { date: x.toISOString().slice(0, 10), h: x.getUTCHours(), min: x.getUTCMinutes() }
}

export function renderTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '')
}
