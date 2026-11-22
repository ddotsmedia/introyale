import type { Payload, PayloadRequest, Where } from 'payload'
import { can, type Role } from '../lib/roles'
import { LEAD_STATUSES, OPEN_STATUSES } from '../lib/leads'

export type U = { id: number; role: Role; name: string }
/** Request passed to local-API calls that enforce access, so the user and the MFA cookie are both seen. */
export type Req = Partial<PayloadRequest>
export const WORKFLOW_COLLECTIONS = [
  'projects',
  'services',
  'sectors',
  'pages',
  'journal-posts',
  'team-members',
  'testimonials',
] as const
const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString()

export const leadQuery = (payload: Payload, req: Req) => ({
  payload,
  req,
  overrideAccess: false as const,
})

async function countLeads(payload: Payload, req: Req, where: Where): Promise<number> {
  const r = await payload.count({ collection: 'enquiries', where, req, overrideAccess: false })
  return r.totalDocs
}

function trend(cur: number, prev: number): number | null {
  if (!prev) return cur ? 100 : null
  return Math.round(((cur - prev) / prev) * 100)
}

export async function dashboardData(payload: Payload, user: U, req: Req) {
  const now = Date.now()
  const leadsAllowed = can(user.role, 'enquiries.read')
  const out: Record<string, unknown> = { leadsAllowed }

  if (leadsAllowed) {
    const win = async (days: number) => {
      const cur = await countLeads(payload, req, {
        createdAt: { greater_than: iso(now - days * DAY) },
      })
      const prev = await countLeads(payload, req, {
        and: [
          { createdAt: { greater_than: iso(now - 2 * days * DAY) } },
          { createdAt: { less_than_equal: iso(now - days * DAY) } },
        ],
      })
      return { cur, trend: trend(cur, prev) }
    }
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const monthStart = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1)
    const [d1, d7, d30, unassigned, overdue, won] = await Promise.all([
      win(1),
      win(7),
      win(30),
      countLeads(payload, req, {
        and: [{ assignedTo: { exists: false } }, { status: { in: [...OPEN_STATUSES] } }],
      }),
      countLeads(payload, req, {
        and: [{ followUpAt: { less_than: iso(now) } }, { status: { in: [...OPEN_STATUSES] } }],
      }),
      countLeads(payload, req, {
        and: [
          { status: { equals: 'won' } },
          { updatedAt: { greater_than_equal: iso(monthStart.getTime()) } },
        ],
      }),
    ])
    Object.assign(out, { d1, d7, d30, unassigned, overdue, won })

    const recent = await payload.find({
      collection: 'enquiries',
      req,
      overrideAccess: false,
      depth: 0,
      limit: 2000,
      pagination: false,
      where: { createdAt: { greater_than: iso(now - 84 * DAY) } },
      select: { createdAt: true, sector: true, sourcePage: true, utm: true, status: true },
    })
    const weeks = Array.from({ length: 12 }, (_, i) => ({ label: `W${i + 1}`, value: 0 }))
    const sectors = new Map<string, number>()
    const sources = new Map<string, number>()
    const funnel = new Map<string, number>()
    for (const e of recent.docs as unknown as {
      createdAt: string
      sector?: string
      sourcePage?: string
      utm?: Record<string, string>
      status?: string
    }[]) {
      const age = Math.floor((now - new Date(e.createdAt).getTime()) / (7 * DAY))
      const w = weeks[11 - Math.min(age, 11)]
      if (w) w.value++
      const sec = e.sector || 'Unspecified'
      sectors.set(sec, (sectors.get(sec) ?? 0) + 1)
      const src = e.utm?.source ? `utm: ${e.utm.source}` : e.sourcePage || 'direct'
      sources.set(src, (sources.get(src) ?? 0) + 1)
      const st = e.status ?? 'new'
      funnel.set(st, (funnel.get(st) ?? 0) + 1)
    }
    // Cumulative funnel: a lead that reached a later stage counted at every earlier one.
    const order = ['new', 'contacted', 'site_visit', 'proposal_sent', 'won']
    const reached = order.map((s, i) => ({
      label: s.replace('_', ' '),
      value:
        order.slice(i).reduce((n, k) => n + (funnel.get(k) ?? 0), 0) +
        (s === 'new' ? (funnel.get('lost') ?? 0) : 0),
    }))
    const top = (m: Map<string, number>) =>
      [...m]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, value]) => ({ label, value }))
    Object.assign(out, { weeks, sectors: top(sectors), sources: top(sources), funnel: reached })

    const [due, latest] = await Promise.all([
      payload.find({
        collection: 'enquiries',
        req,
        overrideAccess: false,
        depth: 0,
        limit: 8,
        sort: 'followUpAt',
        where: {
          and: [
            { assignedTo: { equals: user.id } },
            { followUpAt: { less_than: iso(new Date().setHours(23, 59, 59, 999)) } },
            { status: { in: [...OPEN_STATUSES] } },
          ],
        },
      }),
      payload.find({
        collection: 'enquiries',
        req,
        overrideAccess: false,
        depth: 0,
        limit: 10,
        sort: '-createdAt',
      }),
    ])
    Object.assign(out, { due: due.docs, latest: latest.docs })
  }

  // Content widgets (every staff role).
  let awaiting = 0
  const published: Record<string, number> = {}
  for (const c of WORKFLOW_COLLECTIONS) {
    if (can(user.role, 'workflow.approve') || can(user.role, 'workflow.publish')) {
      const r = await payload.count({
        collection: c,
        where: { 'workflow.status': { equals: 'in_review' } },
        overrideAccess: true,
      })
      awaiting += r.totalDocs
    }
  }
  for (const c of ['projects', 'services', 'journal-posts'] as const) {
    published[c] = (
      await payload.count({
        collection: c,
        where: { 'workflow.status': { equals: 'published' } },
        overrideAccess: true,
      })
    ).totalDocs
  }
  const unverified = (
    await payload.count({
      collection: 'facts',
      where: { status: { not_equals: 'verified' } },
      overrideAccess: true,
    })
  ).totalDocs
  const confirmP = (
    await payload.count({
      collection: 'projects',
      where: { adminNote: { like: '[CONFIRM' } },
      overrideAccess: true,
    })
  ).totalDocs
  const confirmC = (
    await payload.count({
      collection: 'clients',
      where: { name: { like: '[CONFIRM' } },
      overrideAccess: true,
    })
  ).totalDocs
  Object.assign(out, { awaiting, published, unverified, confirm: confirmP + confirmC })

  const activity = await payload
    .find({ collection: 'audit-log', req, overrideAccess: false, depth: 1, limit: 8, sort: '-at' })
    .catch(() => ({ docs: [] }))
  out.activity = activity.docs
  return out
}

export { LEAD_STATUSES }
