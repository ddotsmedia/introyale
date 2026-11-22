import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import {
  addNote,
  assignLead,
  canTouchLead,
  changeStatus,
  leadsCsv,
  onNewEnquiry,
  sendReply,
  type Actor,
} from '../../src/lib/crm'
import { runDigest, runUnassignedAlert } from '../../src/lib/crmJobs'
import { businessHoursBetween } from '../../src/lib/leads'

type Row = Record<string, unknown> & { id: number }

/** Minimal in-memory stand-in for the Payload local API: enough for the CRM logic under test. */
function fakePayload(seed: Partial<Record<string, Row[]>> = {}) {
  const db: { enquiries: Row[]; 'audit-log': Row[]; [k: string]: Row[] } = {
    enquiries: [],
    'audit-log': [],
    notifications: [],
    users: [],
    'email-templates': [],
    ...(seed as Record<string, Row[]>),
  }
  let next = 1000
  const matches = (row: Row, where: Record<string, unknown> | undefined): boolean => {
    if (!where) return true
    return Object.entries(where).every(([k, cond]) => {
      if (k === 'and') return (cond as Record<string, unknown>[]).every((w) => matches(row, w))
      if (k === 'or') return (cond as Record<string, unknown>[]).some((w) => matches(row, w))
      const c = cond as Record<string, unknown>
      const v = row[k]
      if ('equals' in c) return v === c.equals
      if ('not_equals' in c) return v !== c.not_equals
      if ('exists' in c) return (v != null) === c.exists
      if ('in' in c) return (c.in as unknown[]).includes(v)
      if ('less_than_equal' in c) return String(v) <= String(c.less_than_equal)
      if ('less_than' in c) return String(v) < String(c.less_than)
      if ('greater_than' in c) return String(v) > String(c.greater_than)
      if ('like' in c) return (typeof v === 'string' ? v : '').includes(c.like as string)
      return true
    })
  }
  const p = {
    findByID: vi.fn(({ collection, id }: { collection: string; id: number }) => {
      const r = db[collection]?.find((x) => x.id === id)
      return r ? Promise.resolve({ ...r }) : Promise.reject(new Error('not found'))
    }),
    update: vi.fn(
      ({
        collection,
        id,
        data,
      }: {
        collection: string
        id: number
        data: Record<string, unknown>
      }) => {
        const r = db[collection]?.find((x) => x.id === id)
        if (!r) return Promise.reject(new Error('not found'))
        Object.assign(r, data)
        return Promise.resolve({ ...r })
      },
    ),
    create: vi.fn(({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
      const row = { id: next++, createdAt: new Date().toISOString(), ...data } as Row
      ;(db[collection] ??= []).push(row)
      return Promise.resolve(row)
    }),
    find: vi.fn(
      ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => {
        const docs = (db[collection] ?? []).filter((r) => matches(r, where))
        return Promise.resolve({ docs, totalDocs: docs.length })
      },
    ),
    count: vi.fn(({ collection, where }: { collection: string; where?: Record<string, unknown> }) =>
      Promise.resolve({
        totalDocs: (db[collection] ?? []).filter((r) => matches(r, where)).length,
      }),
    ),
    findGlobal: vi.fn(() => Promise.resolve({ routingRules: [] })),
  }
  return { payload: p as unknown as Payload, db }
}

const admin: Actor = { id: 1, role: 'administrator' }
const reviewer: Actor = { id: 2, role: 'marketing_reviewer' }
const editor: Actor = { id: 3, role: 'content_editor' }
const lead = (over: Partial<Row> = {}): Row => ({
  id: 10,
  ref: 'IR-2026-0010',
  name: 'Sara',
  email: 'sara@example.com',
  status: 'new',
  assignedTo: 2,
  createdAt: '2026-11-01T08:00:00.000Z',
  ...over,
})

describe('lead access (SPEC §5.4)', () => {
  it('administrators touch every lead; reviewers only their own; editors none', () => {
    expect(canTouchLead(admin, { assignedTo: 9 })).toBe(true)
    expect(canTouchLead(reviewer, { assignedTo: 2 })).toBe(true)
    expect(canTouchLead(reviewer, { assignedTo: 9 })).toBe(false)
    expect(canTouchLead(editor, { assignedTo: 3 })).toBe(false)
  })

  it('refuses a status change on a lead the actor does not own', async () => {
    const { payload } = fakePayload({ enquiries: [lead({ assignedTo: 9 })] })
    await expect(changeStatus(payload, reviewer, 10, 'contacted')).rejects.toThrow('Not permitted')
  })

  it('only administrators assign leads', async () => {
    const { payload } = fakePayload({ enquiries: [lead()] })
    await expect(assignLead(payload, reviewer, 10, 2)).rejects.toThrow('Not permitted')
    await expect(assignLead(payload, admin, 10, 2)).resolves.toBeUndefined()
  })
})

describe('kanban status change', () => {
  it('writes the lead timeline and the audit log', async () => {
    const { payload, db } = fakePayload({ enquiries: [lead()] })
    await changeStatus(payload, reviewer, 10, 'site_visit')
    const row = db.enquiries[0]
    expect(row?.status).toBe('site_visit')
    expect((row?.activity as { text: string }[])[0]?.text).toContain('new → site visit')
    const audit = db['audit-log'][0]
    expect(audit).toMatchObject({
      action: 'lead.status',
      collection: 'enquiries',
      fromStatus: 'new',
      toStatus: 'site_visit',
      actor: 2,
    })
  })

  it('requires a reason to mark a lead lost and rejects unknown statuses', async () => {
    const { payload } = fakePayload({ enquiries: [lead()] })
    await expect(changeStatus(payload, reviewer, 10, 'lost')).rejects.toThrow('reason')
    await expect(changeStatus(payload, reviewer, 10, 'bogus')).rejects.toThrow('Unknown status')
    await expect(changeStatus(payload, reviewer, 10, 'lost', 'Budget')).resolves.toBeUndefined()
  })

  it('notes and replies are logged on the timeline', async () => {
    const { payload, db } = fakePayload({
      enquiries: [lead()],
      'email-templates': [{ id: 5, subject: 'Hello {{name}}', body: 'Ref {{ref}}' }],
    })
    await addNote(payload, reviewer, 10, 'Called, no answer')
    const send = vi.fn(() => Promise.resolve())
    await sendReply(payload, reviewer, 10, { templateId: 5 }, send)
    expect(send).toHaveBeenCalledWith({
      to: 'sara@example.com',
      subject: 'Hello Sara',
      text: 'Ref IR-2026-0010',
    })
    const kinds = (db.enquiries[0]?.activity as { kind: string }[]).map((a) => a.kind)
    expect(kinds).toEqual(['note', 'email'])
    expect(db['audit-log'].map((a) => a.action)).toEqual(['lead.note', 'lead.email'])
  })
})

describe('CSV export', () => {
  it('is administrator only, audited, and neutralises spreadsheet formulas', async () => {
    const { payload, db } = fakePayload({ enquiries: [lead({ name: '=HYPERLINK("x")' })] })
    await expect(leadsCsv(payload, reviewer)).rejects.toThrow('Not permitted')
    await expect(leadsCsv(payload, editor)).rejects.toThrow('Not permitted')
    expect(db['audit-log']).toHaveLength(0)
    const csv = await leadsCsv(payload, admin)
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
    expect(db['audit-log'][0]).toMatchObject({ action: 'export.csv', collection: 'enquiries' })
  })
})

describe('duplicate detection and routing', () => {
  it('links a lead with the same email seen within 90 days', async () => {
    const older = lead({
      id: 7,
      ref: 'IR-OLD',
      createdAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    })
    const fresh = lead({
      id: 11,
      ref: 'IR-NEW',
      createdAt: new Date().toISOString(),
      assignedTo: undefined,
    })
    const { payload, db } = fakePayload({ enquiries: [older, fresh] })
    await onNewEnquiry(payload, fresh as never)
    expect(db.enquiries[1]?.related).toEqual([7])
    expect((db.enquiries[1]?.activity as { kind: string }[])[0]?.kind).toBe('duplicate')
  })

  it('does not link a lead older than 90 days', async () => {
    const old = lead({ id: 7, createdAt: new Date(Date.now() - 120 * 86_400_000).toISOString() })
    const fresh = lead({
      id: 11,
      ref: 'IR-NEW',
      assignedTo: undefined,
      createdAt: new Date().toISOString(),
    })
    const { payload, db } = fakePayload({ enquiries: [old, fresh] })
    await onNewEnquiry(payload, fresh as never)
    expect(db.enquiries[1]?.related).toBeUndefined()
  })
})

describe('jobs', () => {
  it('digest goes to each assignee once per Dubai day, via Mailpit-compatible send', async () => {
    const now = new Date('2026-11-23T04:35:00.000Z') // 08:35 Dubai, Monday
    const { payload } = fakePayload({
      users: [{ id: 2, email: 'rev@example.com', name: 'Rev' }],
      enquiries: [
        lead({ followUpAt: '2026-11-22T10:00:00.000Z' }),
        lead({ id: 12, ref: 'IR-B', status: 'won', followUpAt: '2026-11-22T10:00:00.000Z' }),
      ],
    })
    const send = vi.fn(() => Promise.resolve())
    expect(await runDigest(payload, send, now)).toEqual({ sent: 1 })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]).toBeDefined()
    expect(await runDigest(payload, send, now)).toEqual({ sent: 0 }) // idempotent for the day
  })

  it('alerts once when a lead is unassigned for 4 business hours', async () => {
    const created = '2026-11-23T05:00:00.000Z' // Monday 09:00 Dubai
    const { payload, db } = fakePayload({
      users: [{ id: 1, role: 'administrator', email: 'a@example.com' }],
      enquiries: [lead({ createdAt: created, assignedTo: undefined })],
    })
    const send = vi.fn(() => Promise.resolve())
    const early = new Date('2026-11-23T07:00:00.000Z') // 11:00 Dubai: 2 business hours
    expect((await runUnassignedAlert(payload, send, 'staff@example.com', early)).alerted).toBe(0)
    const late = new Date('2026-11-23T10:00:00.000Z') // 14:00 Dubai: 5 business hours
    expect((await runUnassignedAlert(payload, send, 'staff@example.com', late)).alerted).toBe(1)
    expect(send).toHaveBeenCalledTimes(1)
    expect(db.enquiries[0]?.unassignedAlertAt).toBeDefined()
    expect((await runUnassignedAlert(payload, send, 'staff@example.com', late)).alerted).toBe(0)
  })

  it('counts business hours in Dubai time, skipping Friday evening to Monday morning', () => {
    const fri = new Date('2026-11-27T13:00:00.000Z') // Friday 17:00 Dubai
    const mon = new Date('2026-11-30T05:00:00.000Z') // Monday 09:00 Dubai
    expect(businessHoursBetween(fri, mon)).toBe(1)
  })
})
