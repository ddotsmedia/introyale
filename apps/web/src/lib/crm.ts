import type { Payload, PayloadRequest } from 'payload'
import { writeAudit, notify } from './audit'
import { DUPLICATE_DAYS, LEAD_STATUSES, normPhone, renderTemplate, type LeadStatus } from './leads'
import { can, type Role } from './roles'

export type Actor = { id: number; role: Role; name?: string }
type Activity = { kind: string; text: string; actor?: number | null; at: string }
export type Lead = {
  id: number
  ref: string
  name?: string | null
  email?: string | null
  phone?: string | null
  sector?: string | null
  status?: LeadStatus | null
  assignedTo?: number | { id: number } | null
  activity?: Activity[] | null
  notes?: { author?: number | null; text: string; at: string }[] | null
  related?: (number | { id: number })[] | null
  firstContactAt?: string | null
  tags?: string[] | null
  createdAt: string
}

const idOf = (v: number | { id: number } | null | undefined): number | null =>
  v == null ? null : typeof v === 'object' ? v.id : v

/** Administrators act on every lead; other roles only on leads assigned to them (SPEC §5.4). */
export function canTouchLead(actor: Actor, lead: Pick<Lead, 'assignedTo'>): boolean {
  if (actor.role === 'administrator') return true
  return can(actor.role, 'enquiries.read') && idOf(lead.assignedTo) === actor.id
}

async function load(payload: Payload, id: number): Promise<Lead> {
  return (await payload.findByID({
    collection: 'enquiries',
    id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Lead
}

async function patch(
  payload: Payload,
  lead: Lead,
  data: Record<string, unknown>,
  entry?: Activity,
  req?: PayloadRequest,
): Promise<void> {
  // The first status move away from "new" or the first email stops the response-time (SLA) clock.
  const contacted =
    (typeof data['status'] === 'string' && data['status'] !== 'new') || entry?.kind === 'email'
  await payload.update({
    collection: 'enquiries',
    id: lead.id,
    overrideAccess: true,
    req,
    data: {
      ...data,
      ...(contacted && !lead.firstContactAt ? { firstContactAt: new Date().toISOString() } : {}),
      ...(entry ? { activity: [...(lead.activity ?? []), entry] } : {}),
    },
  })
}

const entry = (kind: string, text: string, actor?: number | null): Activity => ({
  kind,
  text,
  actor: actor ?? null,
  at: new Date().toISOString(),
})

export async function changeStatus(
  payload: Payload,
  actor: Actor,
  id: number,
  status: string,
  lostReason?: string,
): Promise<void> {
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) throw new Error('Unknown status')
  const lead = await load(payload, id)
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  const from = lead.status ?? 'new'
  if (from === status) return
  if (status === 'lost' && !lostReason?.trim())
    throw new Error('A reason is required for lost leads')
  await patch(
    payload,
    lead,
    { status, lostReason: status === 'lost' ? lostReason : null },
    entry('status', `Status ${from.replace('_', ' ')} → ${status.replace('_', ' ')}`, actor.id),
  )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.status',
    collection: 'enquiries',
    docId: id,
    fromStatus: from,
    toStatus: status,
  })
}

export async function assignLead(
  payload: Payload,
  actor: Actor,
  id: number,
  userId: number | null,
): Promise<void> {
  if (actor.role !== 'administrator') throw new Error('Not permitted')
  const lead = await load(payload, id)
  await patch(
    payload,
    lead,
    { assignedTo: userId },
    entry('assign', userId ? `Assigned to user ${String(userId)}` : 'Unassigned', actor.id),
  )
  if (userId)
    await notify(
      payload,
      userId,
      'lead.assigned',
      `Lead ${lead.ref} was assigned to you`,
      `/admin/lead?id=${String(id)}`,
    )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.assign',
    collection: 'enquiries',
    docId: id,
    summary: `assignedTo=${String(userId)}`,
  })
}

export async function addNote(
  payload: Payload,
  actor: Actor,
  id: number,
  text: string,
): Promise<void> {
  const lead = await load(payload, id)
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  if (!text.trim()) throw new Error('Note is empty')
  await patch(
    payload,
    lead,
    {
      notes: [
        ...(lead.notes ?? []),
        { author: actor.id, text: text.trim(), at: new Date().toISOString() },
      ],
    },
    entry('note', 'Note added', actor.id),
  )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.note',
    collection: 'enquiries',
    docId: id,
  })
}

export type LeadPatch = {
  priority?: string
  followUpAt?: string | null
  estimatedValue?: number | null
  tags?: string[]
}

export async function updateLead(
  payload: Payload,
  actor: Actor,
  id: number,
  p: LeadPatch,
): Promise<void> {
  const lead = await load(payload, id)
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  const data: Record<string, unknown> = {}
  if (p.priority && ['low', 'normal', 'high'].includes(p.priority)) data.priority = p.priority
  if ('followUpAt' in p) data.followUpAt = p.followUpAt
  if ('estimatedValue' in p) data.estimatedValue = p.estimatedValue
  if (p.tags) data.tags = p.tags
  await patch(
    payload,
    lead,
    data,
    entry('update', `Updated ${Object.keys(data).join(', ')}`, actor.id),
  )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.update',
    collection: 'enquiries',
    docId: id,
    summary: Object.keys(data).join(','),
  })
}

/** Sends a reply through SMTP and logs it on the timeline. `send` is injected so tests need no mail server. */
export async function sendReply(
  payload: Payload,
  actor: Actor,
  id: number,
  input: { templateId?: number; subject?: string; body?: string },
  send: (m: { to: string; subject: string; text: string }) => Promise<void>,
): Promise<void> {
  const lead = await load(payload, id)
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  if (!lead.email) throw new Error('Lead has no email')
  let { subject, body } = input
  if (input.templateId) {
    const t = (await payload.findByID({
      collection: 'email-templates',
      id: input.templateId,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { subject: string; body: string }
    subject = t.subject
    body = t.body
  }
  if (!subject?.trim() || !body?.trim()) throw new Error('Subject and body are required')
  const vars = { name: lead.name ?? '', ref: lead.ref }
  await send({
    to: lead.email,
    subject: renderTemplate(subject, vars),
    text: renderTemplate(body, vars),
  })
  await patch(
    payload,
    lead,
    {},
    entry('email', `Email sent: ${renderTemplate(subject, vars)}`, actor.id),
  )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.email',
    collection: 'enquiries',
    docId: id,
  })
}

/** CSV export: administrators only, always audited. Cells are escaped and formula-prefixed values neutralised. */
export async function leadsCsv(payload: Payload, actor: Actor, ids?: number[]): Promise<string> {
  if (actor.role !== 'administrator') throw new Error('Not permitted')
  const res = await payload.find({
    collection: 'enquiries',
    overrideAccess: true,
    depth: 0,
    limit: 5000,
    pagination: false,
    sort: '-createdAt',
    ...(ids?.length ? { where: { id: { in: ids } } } : {}),
  })
  const cols = [
    'ref',
    'score',
    'createdAt',
    'status',
    'priority',
    'name',
    'email',
    'phone',
    'sector',
    'location',
    'budgetBand',
    'sourcePage',
    'estimatedValue',
    'followUpAt',
  ]
  const cell = (v: unknown): string => {
    let s =
      typeof v === 'string'
        ? v
        : typeof v === 'number' || typeof v === 'boolean'
          ? String(v)
          : v == null
            ? ''
            : JSON.stringify(v)
    if (/^[=+\-@]/.test(s)) s = `'${s}`
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows = (res.docs as unknown as Record<string, unknown>[]).map((d) =>
    cols.map((c) => cell(d[c])).join(','),
  )
  await writeAudit(payload, {
    actor: actor.id,
    action: 'export.csv',
    collection: 'enquiries',
    docId: 'all',
    summary: `${String(rows.length)} rows`,
  })
  return [cols.join(','), ...rows].join('\n')
}

/** On a new enquiry: route by sector, link duplicates (same email or phone within 90 days), notify the assignee. */
export async function onNewEnquiry(
  payload: Payload,
  doc: Lead,
  req?: PayloadRequest,
): Promise<void> {
  const lead = doc
  const data: Record<string, unknown> = {}
  const acts: Activity[] = [...(lead.activity ?? [])]

  if (!idOf(lead.assignedTo)) {
    const settings = (await payload.findGlobal({
      slug: 'consultation-settings',
      depth: 1,
      overrideAccess: true,
    })) as unknown as {
      routingRules?: {
        sector?: { title?: string; slug?: string; id?: number } | number | null
        assignee?: { id: number } | number | null
      }[]
    }
    const rule = settings.routingRules?.find((r) => {
      const s = r.sector
      if (!s || typeof s !== 'object' || !lead.sector) return false
      const norm = (x?: string) => (x ?? '').toLowerCase().replace(/[^a-z]/g, '')
      return norm(s.slug) === norm(lead.sector) || norm(s.title) === norm(lead.sector)
    })
    const to = idOf(rule?.assignee)
    if (to) {
      data.assignedTo = to
      acts.push(entry('assign', `Auto-assigned by sector routing to user ${String(to)}`))
      await notify(
        payload,
        to,
        'lead.assigned',
        `New lead ${lead.ref} was assigned to you`,
        `/admin/lead?id=${String(lead.id)}`,
      )
    }
  }

  const since = new Date(Date.now() - DUPLICATE_DAYS * 86_400_000).toISOString()
  const or: { email?: { equals: string }; phone?: { like: string } }[] = []
  if (lead.email) or.push({ email: { equals: lead.email } })
  const ph = normPhone(lead.phone)
  if (ph.length >= 7) or.push({ phone: { like: ph.slice(-7) } })
  if (or.length) {
    const found = await payload.find({
      collection: 'enquiries',
      overrideAccess: true,
      depth: 0,
      limit: 10,
      where: {
        and: [{ id: { not_equals: lead.id } }, { createdAt: { greater_than: since } }, { or }],
      },
    })
    const dups = (found.docs as unknown as Lead[]).filter(
      (d) => d.email === lead.email || (ph.length >= 7 && normPhone(d.phone) === ph),
    )
    if (dups.length) {
      data.related = dups.map((d) => d.id)
      acts.push(entry('duplicate', `Possible duplicate of ${dups.map((d) => d.ref).join(', ')}`))
    }
  }
  if (Object.keys(data).length) {
    await payload.update({
      collection: 'enquiries',
      id: lead.id,
      overrideAccess: true,
      req,
      data: { ...data, activity: acts },
    })
  }
}
