import type { Payload } from 'payload'
import {
  dailySeries,
  enquiryHeatmap,
  fresh,
  topKeys,
  totalsOf,
  vitals,
} from '../lib/analytics/query'
import { addDays } from '../lib/analytics/range'
import { dubaiDay } from '../lib/analytics/store'
import { slaFor } from '../lib/crmPlus'
import { businessHoursBetween, OPEN_STATUSES } from '../lib/leads'
import { can } from '../lib/roles'
import type { Req, U } from './data'

// Numbers behind the executive dashboard widgets. Lead queries run with the user's own access (non-admins see
// only the leads assigned to them), so every figure respects the role matrix.

export type CrmSettings = {
  goal: number
  slaHours: number
  prob: Record<string, number>
}

export async function crmSettings(payload: Payload): Promise<CrmSettings> {
  const g = (await payload
    .findGlobal({ slug: 'consultation-settings', depth: 0, overrideAccess: true })
    .catch(() => null)) as unknown as {
    crm?: {
      monthlyLeadGoal?: number | null
      slaHours?: number | null
      probNew?: number | null
      probContacted?: number | null
      probSiteVisit?: number | null
      probProposal?: number | null
    }
  } | null
  const c = g?.crm ?? {}
  return {
    goal: c.monthlyLeadGoal ?? 0,
    slaHours: c.slaHours ?? 4,
    prob: {
      new: c.probNew ?? 10,
      contacted: c.probContacted ?? 25,
      site_visit: c.probSiteVisit ?? 50,
      proposal_sent: c.probProposal ?? 70,
    },
  }
}

type L = {
  id: number
  createdAt: string
  updatedAt: string
  status?: string | null
  estimatedValue?: number | null
  firstContactAt?: string | null
  sector?: string | null
  assignedTo?: number | { id: number; name?: string } | null
  attribution?: { source?: string } | null
  utm?: { source?: string } | null
}

export type Exec = {
  settings: CrmSettings
  monthCount: number
  pipelineValue: number
  weighted: number
  openCount: number
  withValue: number
  winRate: number | null
  avgResponseHours: number | null
  slaBreaches: number
  bySource: { label: string; value: number }[]
  bySector: { sector: string; leads: number; won: number; rate: number }[]
  leaderboard: { name: string; leads: number; won: number; avgHours: number | null }[]
}

const monthStartDubai = (now: Date): Date => {
  const d = dubaiDay(now)
  return new Date(`${d.slice(0, 7)}-01T00:00:00+04:00`)
}

export async function execStats(payload: Payload, user: U, req: Req): Promise<Exec> {
  const now = new Date()
  const settings = await crmSettings(payload)
  const since = new Date(now.getTime() - 180 * 86_400_000).toISOString()
  const res = await payload.find({
    collection: 'enquiries',
    req,
    overrideAccess: false,
    depth: 1,
    limit: 3000,
    pagination: false,
    where: { createdAt: { greater_than: since } },
    select: {
      createdAt: true,
      updatedAt: true,
      status: true,
      estimatedValue: true,
      firstContactAt: true,
      sector: true,
      assignedTo: true,
      attribution: true,
      utm: true,
    },
  })
  const leads = res.docs as unknown as L[]
  const month = monthStartDubai(now).getTime()
  let pipelineValue = 0
  let weighted = 0
  let openCount = 0
  let withValue = 0
  let won = 0
  let lost = 0
  let breaches = 0
  const resp: number[] = []
  const sources = new Map<string, number>()
  const sectors = new Map<string, { leads: number; won: number }>()
  const people = new Map<string, { leads: number; won: number; resp: number[] }>()
  for (const l of leads) {
    const open = (OPEN_STATUSES as readonly string[]).includes(l.status ?? 'new')
    if (open) {
      openCount++
      const v = l.estimatedValue ?? 0
      if (v) withValue++
      pipelineValue += v
      weighted += (v * (settings.prob[l.status ?? 'new'] ?? 0)) / 100
    }
    if (l.status === 'won') won++
    if (l.status === 'lost') lost++
    const s = slaFor(
      { createdAt: l.createdAt, firstContactAt: l.firstContactAt, status: l.status },
      settings.slaHours,
      now,
    )
    if (s.state === 'breached' || s.state === 'late') breaches++
    if (l.firstContactAt)
      resp.push(businessHoursBetween(new Date(l.createdAt), new Date(l.firstContactAt)))
    const src = l.attribution?.source ?? l.utm?.source ?? 'unknown'
    if (new Date(l.createdAt).getTime() >= Date.now() - 90 * 86_400_000)
      sources.set(src, (sources.get(src) ?? 0) + 1)
    const sec = l.sector ?? 'unspecified'
    const sv = sectors.get(sec) ?? { leads: 0, won: 0 }
    sv.leads++
    if (l.status === 'won') sv.won++
    sectors.set(sec, sv)
    const who =
      typeof l.assignedTo === 'object' && l.assignedTo
        ? (l.assignedTo.name ?? `User ${String(l.assignedTo.id)}`)
        : 'Unassigned'
    const pv = people.get(who) ?? { leads: 0, won: 0, resp: [] }
    pv.leads++
    if (l.status === 'won') pv.won++
    if (l.firstContactAt)
      pv.resp.push(businessHoursBetween(new Date(l.createdAt), new Date(l.firstContactAt)))
    people.set(who, pv)
  }
  const avg = (a: number[]) =>
    a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : null
  return {
    settings,
    monthCount: leads.filter((l) => new Date(l.createdAt).getTime() >= month).length,
    pipelineValue,
    weighted: Math.round(weighted),
    openCount,
    withValue,
    winRate: won + lost ? Math.round((won / (won + lost)) * 100) : null,
    avgResponseHours: avg(resp),
    slaBreaches: breaches,
    bySource: [...sources]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value })),
    bySector: [...sectors]
      .map(([sector, v]) => ({
        sector,
        ...v,
        rate: v.leads ? Math.round((v.won / v.leads) * 100) : 0,
      }))
      .sort((a, b) => b.leads - a.leads),
    leaderboard: can(user.role, 'users.manage')
      ? [...people]
          .map(([name, v]) => ({ name, leads: v.leads, won: v.won, avgHours: avg(v.resp) }))
          .sort((a, b) => b.won - a.won || b.leads - a.leads)
          .slice(0, 8)
      : [],
  }
}

/** Visitors and enquiries per day for the chosen window (analytics roles only), plus totals, top pages and web vitals. */
export async function trafficStats(payload: Payload, windowDays = 30) {
  await fresh(payload)
  const to = dubaiDay()
  const cur = { from: addDays(to, -(windowDays - 1)), to }
  const prev = { from: addDays(to, -(2 * windowDays - 1)), to: addDays(to, -windowDays) }
  const [days, prevDays, heat, pages, projects, vit] = await Promise.all([
    dailySeries(payload, cur),
    dailySeries(payload, prev),
    enquiryHeatmap(payload, { from: addDays(to, -89), to }),
    topKeys(payload, 'page', cur, 6, 'views'),
    topKeys(payload, 'page', cur, 6, 'views', '/work/%'),
    vitals(payload, cur).catch(() => []),
  ])
  return {
    days,
    totals: totalsOf(days),
    prev: totalsOf(prevDays),
    heat,
    pages,
    projects,
    vitals: vit,
  }
}
