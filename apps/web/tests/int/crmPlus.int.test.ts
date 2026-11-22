import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { cms } from '../../src/lib/cms'
import {
  addTask,
  bulkLeads,
  deleteTask,
  mergeLeads,
  setTaskDone,
  tasksForLead,
} from '../../src/lib/crmPlus'

// Tasks, bulk actions, first-contact tracking and duplicate merge against a real database (INT_DB=1).
const enabled = process.env.INT_DB === '1'
async function user(role: 'administrator' | 'marketing_reviewer') {
  const payload = await cms()
  const u = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: `${role}-${randomUUID().slice(0, 8)}@example.test`,
      password: randomUUID(),
      name: `Test ${role}`,
      role,
    },
  })
  return { id: u.id, role, name: `Test ${role}` }
}

async function lead(tag: string) {
  const payload = await cms()
  return (await payload.create({
    collection: 'enquiries',
    overrideAccess: true,
    data: {
      ref: `IR-T-${tag}-${randomUUID().slice(0, 6)}`,
      type: 'general',
      name: `Test ${tag}`,
      email: `${randomUUID().slice(0, 8)}@example.test`,
      isTest: true,
    },
  })) as unknown as { id: number; ref: string; notes?: unknown[] }
}

describe.runIf(enabled)('CRM tasks, bulk and merge', () => {
  it('adds, completes and deletes tasks, and refuses users who cannot touch the lead', async () => {
    const payload = await cms()
    const [admin, outsider] = [await user('administrator'), await user('marketing_reviewer')]
    const l = await lead('task')
    const due = new Date(Date.now() + 3_600_000).toISOString()
    await addTask(payload, admin, l.id, {
      title: 'Call the client',
      dueAt: due,
      kind: 'call',
      assigneeId: null,
    })
    const [t] = await tasksForLead(payload, l.id)
    expect(t).toMatchObject({ title: 'Call the client', kind: 'call', done_at: null })
    await expect(addTask(payload, outsider, l.id, { title: 'x', dueAt: due })).rejects.toThrow(
      'Not permitted',
    )
    await expect(addTask(payload, admin, l.id, { title: '  ', dueAt: due })).rejects.toThrow(
      'title',
    )
    await expect(
      addTask(payload, admin, l.id, { title: 'bad date', dueAt: 'nope' }),
    ).rejects.toThrow('valid due date')
    await setTaskDone(payload, admin, t?.id ?? 0, true)
    expect((await tasksForLead(payload, l.id))[0]?.done_at).not.toBeNull()
    await deleteTask(payload, admin, t?.id ?? 0)
    expect(await tasksForLead(payload, l.id)).toHaveLength(0)
  })

  it('bulk status change records the first contact once; unauthorised leads are skipped', async () => {
    const payload = await cms()
    const [admin, outsider] = [await user('administrator'), await user('marketing_reviewer')]
    const [a, b] = [await lead('bulk-a'), await lead('bulk-b')]
    const r = await bulkLeads(payload, admin, [a.id, b.id], 'status', { status: 'contacted' })
    expect(r).toEqual({ changed: 2, skipped: 0 })
    const doc = (await payload.findByID({
      collection: 'enquiries',
      id: a.id,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { status: string; firstContactAt?: string }
    expect(doc.status).toBe('contacted')
    const first = doc.firstContactAt
    expect(first).toBeTruthy()
    await bulkLeads(payload, admin, [a.id], 'status', { status: 'site_visit' })
    const again = (await payload.findByID({
      collection: 'enquiries',
      id: a.id,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { firstContactAt?: string }
    expect(again.firstContactAt).toBe(first) // the clock stopped at the first contact and does not move
    expect(await bulkLeads(payload, outsider, [a.id, b.id], 'status', { status: 'won' })).toEqual({
      changed: 0,
      skipped: 2,
    })
    expect(await bulkLeads(payload, outsider, [a.id], 'assign', { assignee: 2 })).toEqual({
      changed: 0,
      skipped: 1,
    })
    await bulkLeads(payload, admin, [a.id], 'tag', { tag: 'vip' })
    const tagged = (await payload.findByID({
      collection: 'enquiries',
      id: a.id,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { tags?: string[] }
    expect(tagged.tags).toContain('vip')
    expect(await bulkLeads(payload, admin, [a.id], 'status', { status: 'lost' })).toEqual({
      changed: 0,
      skipped: 1,
    }) // a reason is required
  })

  it('merges a duplicate: notes, tags and tasks move to the primary, the duplicate is closed, nothing is deleted', async () => {
    const payload = await cms()
    const admin = await user('administrator')
    const [p, d] = [await lead('merge-p'), await lead('merge-d')]
    await payload.update({
      collection: 'enquiries',
      id: d.id,
      overrideAccess: true,
      data: { notes: [{ text: 'Called twice', at: new Date().toISOString() }], tags: ['dupe'] },
    })
    await addTask(payload, admin, d.id, {
      title: 'Send brochure',
      dueAt: new Date(Date.now() + 86_400_000).toISOString(),
    })
    await expect(mergeLeads(payload, admin, p.id, p.id)).rejects.toThrow('different')
    await mergeLeads(payload, admin, p.id, d.id)
    const pd = (await payload.findByID({
      collection: 'enquiries',
      id: p.id,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { notes: { text: string }[]; tags: string[] }
    expect(pd.notes.map((n) => n.text)).toEqual([`[from ${d.ref}] Called twice`])
    expect(pd.tags).toContain('dupe')
    expect((await tasksForLead(payload, p.id)).map((t) => t.title)).toEqual(['Send brochure'])
    const dd = (await payload.findByID({
      collection: 'enquiries',
      id: d.id,
      overrideAccess: true,
      depth: 0,
    })) as unknown as { status: string; lostReason: string }
    expect(dd).toMatchObject({ status: 'lost', lostReason: `duplicate of ${p.ref}` })
  })
})
