import type { Payload } from 'payload'
import { notify, writeAudit } from './audit'
import { businessHoursBetween, dubaiParts, OPEN_STATUSES } from './leads'

export type Send = (m: { to: string; subject: string; html: string }) => Promise<void>
type L = {
  id: number
  ref: string
  name?: string | null
  followUpAt?: string | null
  createdAt: string
  assignedTo?: number | { id: number } | null
}
type U = { id: number; email: string; name: string }

const idOf = (v: L['assignedTo']): number | null =>
  v == null ? null : typeof v === 'object' ? v.id : v
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${String(c.charCodeAt(0))};`)

/**
 * Daily 08:30 Dubai digest: each assignee gets their due and overdue follow-ups.
 * Idempotent per Dubai day (checked in the audit log), so a worker restart cannot send it twice.
 */
export async function runDigest(
  payload: Payload,
  send: Send,
  now = new Date(),
): Promise<{ sent: number }> {
  const today = dubaiParts(now).date
  const done = await payload.count({
    collection: 'audit-log',
    overrideAccess: true,
    where: { and: [{ action: { equals: 'digest.sent' } }, { docId: { equals: today } }] },
  })
  if (done.totalDocs > 0) return { sent: 0 }
  const endOfDubaiDay = new Date(`${today}T23:59:59+04:00`).toISOString()
  const due = await payload.find({
    collection: 'enquiries',
    overrideAccess: true,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      and: [
        { followUpAt: { less_than_equal: endOfDubaiDay } },
        { status: { in: [...OPEN_STATUSES] } },
        { assignedTo: { exists: true } },
      ],
    },
  })
  const byUser = new Map<number, L[]>()
  for (const l of due.docs as unknown as L[]) {
    const u = idOf(l.assignedTo)
    if (u) byUser.set(u, [...(byUser.get(u) ?? []), l])
  }
  let sent = 0
  for (const [uid, leads] of byUser) {
    const u = (await payload.findByID({
      collection: 'users',
      id: uid,
      overrideAccess: true,
      depth: 0,
    })) as unknown as U
    const rows = leads
      .map(
        (l) =>
          `<li>${esc(l.ref)} ${esc(l.name ?? '')} — ${new Date(l.followUpAt ?? now).getTime() < now.getTime() - 86_400_000 ? 'overdue' : 'due today'}</li>`,
      )
      .join('')
    await send({
      to: u.email,
      subject: `Your follow-ups for ${today} (${String(leads.length)})`,
      html: `<p>Hello ${esc(u.name)},</p><ul>${rows}</ul><p><a href="${process.env.PUBLIC_URL ?? ''}/admin/leads-board">Open the leads board</a></p>`,
    })
    sent++
  }
  await writeAudit(payload, {
    action: 'digest.sent',
    collection: 'enquiries',
    docId: today,
    summary: `${String(sent)} digests`,
  })
  return { sent }
}

/** Alerts staff once when a new lead stays unassigned for more than 4 business hours. */
export async function runUnassignedAlert(
  payload: Payload,
  send: Send,
  to: string,
  now = new Date(),
): Promise<{ alerted: number }> {
  const res = await payload.find({
    collection: 'enquiries',
    overrideAccess: true,
    depth: 0,
    limit: 200,
    where: {
      and: [
        { status: { equals: 'new' } },
        { assignedTo: { exists: false } },
        { unassignedAlertAt: { exists: false } },
      ],
    },
  })
  const late = (res.docs as unknown as L[]).filter(
    (l) => businessHoursBetween(new Date(l.createdAt), now) >= 4,
  )
  if (late.length === 0) return { alerted: 0 }
  await send({
    to,
    subject: `[Introyale] ${String(late.length)} lead(s) unassigned for over 4 business hours`,
    html: `<ul>${late.map((l) => `<li>${esc(l.ref)}</li>`).join('')}</ul><p><a href="${process.env.PUBLIC_URL ?? ''}/admin/leads-board">Open the leads board</a></p>`,
  })
  const admins = await payload.find({
    collection: 'users',
    where: { role: { equals: 'administrator' } },
    overrideAccess: true,
    depth: 0,
    limit: 20,
  })
  for (const l of late) {
    await payload.update({
      collection: 'enquiries',
      id: l.id,
      overrideAccess: true,
      data: { unassignedAlertAt: now.toISOString() },
    })
    for (const a of admins.docs)
      await notify(
        payload,
        a.id,
        'lead.unassigned',
        `Lead ${l.ref} has been unassigned for over 4 business hours`,
        `/admin/lead?id=${String(l.id)}`,
      )
  }
  return { alerted: late.length }
}

/** Publishes approved documents whose scheduled time has passed, acting as the user who scheduled them. */
export async function runScheduledPublish(
  payload: Payload,
  now = new Date(),
): Promise<{ published: number }> {
  let published = 0
  for (const c of [
    'projects',
    'services',
    'sectors',
    'pages',
    'journal-posts',
    'team-members',
    'testimonials',
  ] as const) {
    const res = await payload.find({
      collection: c,
      overrideAccess: true,
      depth: 0,
      limit: 50,
      where: {
        and: [
          { 'workflow.status': { equals: 'approved' } },
          { 'workflow.publishAt': { less_than_equal: now.toISOString() } },
        ],
      },
    })
    for (const d of res.docs as unknown as {
      id: number
      workflow?: { scheduledBy?: number | { id: number } | null }
    }[]) {
      const by = idOf(d.workflow?.scheduledBy)
      if (!by) continue
      const user = await payload.findByID({
        collection: 'users',
        id: by,
        overrideAccess: true,
        depth: 0,
      })
      try {
        await payload.update({
          collection: c,
          id: d.id,
          user,
          overrideAccess: false,
          data: { workflow: { status: 'published', publishAt: null } } as never,
        })
        await writeAudit(payload, {
          actor: by,
          action: 'workflow.scheduled-publish',
          collection: c,
          docId: d.id,
          fromStatus: 'approved',
          toStatus: 'published',
        })
        published++
      } catch {
        await notify(
          payload,
          by,
          'schedule.failed',
          `Scheduled publish of ${c} #${String(d.id)} failed (publish gates?)`,
          `/admin/collections/${c}/${String(d.id)}`,
        )
      }
    }
  }
  return { published }
}
