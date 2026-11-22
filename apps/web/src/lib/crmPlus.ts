import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { writeAudit, notify } from './audit'
import { canTouchLead, changeStatus, type Actor, type Lead } from './crm'
import { businessHoursBetween, OPEN_STATUSES } from './leads'

// CRM extras (admin v3): response-time SLA, tasks and reminders, bulk actions, duplicate merge.

type Rows<T> = { rows: T[] }
const run = async <T = Record<string, unknown>>(
  payload: Payload,
  q: ReturnType<typeof sql>,
): Promise<T[]> => ((await payload.db.drizzle.execute(q)) as unknown as Rows<T>).rows

// ---- SLA ------------------------------------------------------------------------------------------------------

export type Sla = {
  state: 'met' | 'late' | 'ok' | 'due' | 'breached'
  /** Business hours between enquiry and first contact (or now, if not yet contacted). */
  hours: number
  limit: number
}

/** First-response SLA in Dubai business hours (Mon-Fri 09:00-18:00). "due" means over 75% of the allowance is used. */
export function slaFor(
  lead: { createdAt: string; firstContactAt?: string | null; status?: string | null },
  limitHours: number,
  now = new Date(),
): Sla {
  const created = new Date(lead.createdAt)
  if (lead.firstContactAt) {
    const hours = businessHoursBetween(created, new Date(lead.firstContactAt))
    return { state: hours <= limitHours ? 'met' : 'late', hours, limit: limitHours }
  }
  const closed = lead.status === 'won' || lead.status === 'lost'
  const hours = businessHoursBetween(created, closed ? created : now)
  const state = hours > limitHours ? 'breached' : hours >= limitHours * 0.75 ? 'due' : 'ok'
  return { state, hours, limit: limitHours }
}

export const SLA_LABEL: Record<Sla['state'], string> = {
  met: 'SLA met',
  late: 'Answered late',
  ok: 'Within SLA',
  due: 'SLA due soon',
  breached: 'SLA breached',
}

// ---- Tasks -----------------------------------------------------------------------------------------------------

export const TASK_KINDS = ['task', 'call', 'visit', 'reminder'] as const
export type TaskKind = (typeof TASK_KINDS)[number]
export type Task = {
  id: number
  enquiry_id: number
  kind: TaskKind
  title: string
  due_at: string
  assignee_id: number | null
  done_at: string | null
  ref?: string
  lead_name?: string
}

export async function addTask(
  payload: Payload,
  actor: Actor,
  leadId: number,
  t: { title: string; dueAt: string; kind?: string; assigneeId?: number | null },
): Promise<void> {
  const lead = (await payload.findByID({
    collection: 'enquiries',
    id: leadId,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Lead
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  const title = t.title.trim().slice(0, 200)
  const due = new Date(t.dueAt)
  if (!title) throw new Error('A task needs a title')
  if (Number.isNaN(due.getTime())) throw new Error('Choose a valid due date')
  const kind = (TASK_KINDS as readonly string[]).includes(t.kind ?? '') ? t.kind : 'task'
  const assignee =
    t.assigneeId ??
    (typeof lead.assignedTo === 'object' ? lead.assignedTo?.id : lead.assignedTo) ??
    actor.id
  await run(
    payload,
    sql`INSERT INTO lead_tasks ("enquiry_id","kind","title","due_at","assignee_id","created_by")
        VALUES (${leadId}, ${kind}, ${title}, ${due.toISOString()}, ${assignee}, ${actor.id})`,
  )
  if (assignee !== actor.id) {
    await notify(
      payload,
      assignee,
      'task.assigned',
      `Task for ${lead.ref}: ${title}`,
      `/admin/lead?id=${String(leadId)}`,
    )
  }
  await writeAudit(payload, {
    actor: actor.id,
    action: 'task.add',
    collection: 'enquiries',
    docId: leadId,
    summary: title,
  })
}

async function taskLead(
  payload: Payload,
  taskId: number,
): Promise<{ enquiry_id: number; assignee_id: number | null } | undefined> {
  return (
    await run<{ enquiry_id: number; assignee_id: number | null }>(
      payload,
      sql`SELECT "enquiry_id","assignee_id" FROM lead_tasks WHERE "id" = ${taskId}`,
    )
  )[0]
}

export async function setTaskDone(
  payload: Payload,
  actor: Actor,
  taskId: number,
  done: boolean,
): Promise<void> {
  const t = await taskLead(payload, taskId)
  if (!t) throw new Error('Task not found')
  const lead = (await payload.findByID({
    collection: 'enquiries',
    id: t.enquiry_id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Lead
  if (!canTouchLead(actor, lead) && t.assignee_id !== actor.id) throw new Error('Not permitted')
  await run(
    payload,
    sql`UPDATE lead_tasks SET "done_at" = ${done ? new Date().toISOString() : null} WHERE "id" = ${taskId}`,
  )
}

export async function deleteTask(payload: Payload, actor: Actor, taskId: number): Promise<void> {
  const t = await taskLead(payload, taskId)
  if (!t) return
  const lead = (await payload.findByID({
    collection: 'enquiries',
    id: t.enquiry_id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Lead
  if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
  await run(payload, sql`DELETE FROM lead_tasks WHERE "id" = ${taskId}`)
}

export async function tasksForLead(payload: Payload, leadId: number): Promise<Task[]> {
  return run<Task>(
    payload,
    sql`SELECT * FROM lead_tasks WHERE "enquiry_id" = ${leadId} ORDER BY "done_at" IS NOT NULL, "due_at"`,
  )
}

/** Open tasks due between two instants. Admins see all; others only their own (assignee). */
export async function tasksBetween(
  payload: Payload,
  actor: Actor,
  from: Date,
  to: Date,
  includeDone = false,
): Promise<Task[]> {
  const mine = actor.role === 'administrator' ? null : actor.id
  return run<Task>(
    payload,
    sql`SELECT t.*, e."ref", e."name" AS lead_name FROM lead_tasks t JOIN enquiries e ON e."id" = t."enquiry_id"
        WHERE t."due_at" BETWEEN ${from.toISOString()} AND ${to.toISOString()}
        AND (${includeDone}::boolean OR t."done_at" IS NULL)
        AND (${mine}::int IS NULL OR t."assignee_id" = ${mine})
        ORDER BY t."due_at" LIMIT 500`,
  )
}

/** Open tasks that are due by the end of today (including overdue) for one user. */
export async function myTasksDue(
  payload: Payload,
  userId: number,
  endOfDay: Date,
): Promise<Task[]> {
  return run<Task>(
    payload,
    sql`SELECT t.*, e."ref", e."name" AS lead_name FROM lead_tasks t JOIN enquiries e ON e."id" = t."enquiry_id"
        WHERE t."done_at" IS NULL AND t."assignee_id" = ${userId} AND t."due_at" <= ${endOfDay.toISOString()}
        ORDER BY t."due_at" LIMIT 12`,
  )
}

// ---- Bulk actions -----------------------------------------------------------------------------------------------

export type BulkOp = 'assign' | 'status' | 'tag'

/** Applies one operation to several leads. Each lead is permission-checked individually; returns how many changed. */
export async function bulkLeads(
  payload: Payload,
  actor: Actor,
  ids: number[],
  op: BulkOp,
  value: { assignee?: number | null; status?: string; lostReason?: string; tag?: string },
): Promise<{ changed: number; skipped: number }> {
  const unique = [...new Set(ids)].slice(0, 200)
  let changed = 0
  let skipped = 0
  for (const id of unique) {
    try {
      if (op === 'status') {
        await changeStatus(payload, actor, id, value.status ?? '', value.lostReason)
      } else if (op === 'assign') {
        if (actor.role !== 'administrator') throw new Error('Not permitted')
        const lead = (await payload.findByID({
          collection: 'enquiries',
          id,
          depth: 0,
          overrideAccess: true,
        })) as unknown as Lead
        await payload.update({
          collection: 'enquiries',
          id,
          overrideAccess: true,
          data: {
            assignedTo: value.assignee ?? null,
            activity: [
              ...(lead.activity ?? []),
              {
                kind: 'assign',
                text: value.assignee
                  ? `Assigned to user ${String(value.assignee)} (bulk)`
                  : 'Unassigned (bulk)',
                actor: actor.id,
                at: new Date().toISOString(),
              },
            ],
          },
        })
        if (value.assignee)
          await notify(
            payload,
            value.assignee,
            'lead.assigned',
            `Lead ${lead.ref} was assigned to you`,
            `/admin/lead?id=${String(id)}`,
          )
      } else {
        const tag = (value.tag ?? '').trim().slice(0, 40)
        if (!tag) throw new Error('Tag is empty')
        const lead = (await payload.findByID({
          collection: 'enquiries',
          id,
          depth: 0,
          overrideAccess: true,
        })) as unknown as Lead
        if (!canTouchLead(actor, lead)) throw new Error('Not permitted')
        const tags = [...new Set([...(lead.tags ?? []), tag])]
        await payload.update({ collection: 'enquiries', id, overrideAccess: true, data: { tags } })
      }
      changed++
    } catch {
      skipped++
    }
  }
  await writeAudit(payload, {
    actor: actor.id,
    action: `lead.bulk.${op}`,
    collection: 'enquiries',
    docId: 'bulk',
    summary: `${String(changed)} changed, ${String(skipped)} skipped`,
  })
  return { changed, skipped }
}

// ---- Duplicate merge ---------------------------------------------------------------------------------------------

/**
 * Folds a duplicate into the primary lead: notes, activity and tags move over, the duplicate is closed as lost
 * ("duplicate of IR-...") and linked, and every task moves to the primary. Nothing is deleted.
 */
export async function mergeLeads(
  payload: Payload,
  actor: Actor,
  primaryId: number,
  duplicateId: number,
): Promise<void> {
  if (primaryId === duplicateId) throw new Error('Choose a different lead')
  const [a, b] = (await Promise.all(
    [primaryId, duplicateId].map((id) =>
      payload.findByID({ collection: 'enquiries', id, depth: 0, overrideAccess: true }),
    ),
  )) as unknown as Lead[]
  if (!a || !b) throw new Error('Lead not found')
  if (!canTouchLead(actor, a) || !canTouchLead(actor, b)) throw new Error('Not permitted')
  const at = new Date().toISOString()
  const bNotes = (b.notes ?? []).map((n) => ({
    author: n.author,
    at: n.at,
    text: `[from ${b.ref}] ${n.text}`,
  }))
  await payload.update({
    collection: 'enquiries',
    id: a.id,
    overrideAccess: true,
    data: {
      notes: [...(a.notes ?? []), ...bNotes],
      tags: [...new Set([...(a.tags ?? []), ...(b.tags ?? [])])],
      activity: [
        ...(a.activity ?? []),
        { kind: 'merge', text: `Merged ${b.ref} into this lead`, actor: actor.id, at },
      ],
      related: [
        ...new Set([...(a.related ?? []).map((r) => (typeof r === 'object' ? r.id : r)), b.id]),
      ],
    },
  })
  await payload.update({
    collection: 'enquiries',
    id: b.id,
    overrideAccess: true,
    data: {
      status: 'lost',
      lostReason: `duplicate of ${a.ref}`,
      activity: [
        ...(b.activity ?? []),
        { kind: 'merge', text: `Merged into ${a.ref}`, actor: actor.id, at },
      ],
    },
  })
  await run(payload, sql`UPDATE lead_tasks SET "enquiry_id" = ${a.id} WHERE "enquiry_id" = ${b.id}`)
  await writeAudit(payload, {
    actor: actor.id,
    action: 'lead.merge',
    collection: 'enquiries',
    docId: a.id,
    summary: `${b.ref} -> ${a.ref}`,
  })
}

export const isOpen = (status: string | null | undefined): boolean =>
  (OPEN_STATUSES as readonly string[]).includes(status ?? 'new')
