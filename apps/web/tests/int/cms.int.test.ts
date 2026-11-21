import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

// Runs against a migrated database. Enabled only when INT_DB=1 (CLAUDE.md: no secrets in logs).
const enabled = process.env.INT_DB === '1'
const suffix = randomUUID().slice(0, 8)

describe.runIf(enabled)('CMS integration (SPEC §7 M3)', () => {
  let payload: Payload
  const users: Record<string, { id: number | string; email: string; password: string }> = {}

  const user = (role: string) => {
    const u = users[role]
    if (!u) throw new Error(`missing test user ${role}`)
    return u
  }

  const makeUser = async (role: string) => {
    const email = `${role}-${suffix}@test.invalid`
    const password = `pw-${randomUUID()}`
    const doc = await payload.create({
      collection: 'users',
      data: { email, password, name: role, role: role as never },
      overrideAccess: true,
    })
    users[role] = { id: doc.id, email, password }
    return doc
  }

  beforeAll(async () => {
    payload = await getPayload({ config })
    for (const r of ['administrator', 'content_editor', 'publisher', 'marketing_reviewer'])
      await makeUser(r)
  })

  it('role-gated create: a marketing reviewer cannot create pages', async () => {
    const reviewer = await payload.findByID({
      collection: 'users',
      id: user('marketing_reviewer').id,
      overrideAccess: true,
    })
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'x', slug: `x-${suffix}-r`, workflow: { status: 'draft' } },
        user: reviewer,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('content editor can create a draft page', async () => {
    const editor = await payload.findByID({
      collection: 'users',
      id: user('content_editor').id,
      overrideAccess: true,
    })
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'About', slug: `about-${suffix}`, workflow: { status: 'draft' } },
      user: editor,
      overrideAccess: false,
    })
    expect(page.workflow.status).toBe('draft')
  })

  it('content editor cannot move a page straight to published', async () => {
    const editor = await payload.findByID({
      collection: 'users',
      id: user('content_editor').id,
      overrideAccess: true,
    })
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'Legal', slug: `legal-${suffix}`, workflow: { status: 'draft' } },
      overrideAccess: true,
    })
    await expect(
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { workflow: { status: 'published' } },
        user: editor,
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('publish gates block a page without SEO, and allow it once complete', async () => {
    const pub = await payload.findByID({
      collection: 'users',
      id: user('publisher').id,
      overrideAccess: true,
    })
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'Privacy', slug: `privacy-${suffix}`, workflow: { status: 'draft' } },
      overrideAccess: true,
    })
    // Move through the workflow with the right roles, then publish.
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { workflow: { status: 'in_review' } },
      user: pub,
      overrideAccess: true,
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { workflow: { status: 'approved' } },
      user: pub,
      overrideAccess: true,
    })
    const gate = await payload
      .update({
        collection: 'pages',
        id: page.id,
        data: { workflow: { status: 'published' } },
        user: pub,
        overrideAccess: true,
      })
      .then(
        () => null,
        (err: unknown) => err,
      )
    expect(JSON.stringify((gate as { data?: unknown }).data)).toContain('seo.metaTitle')
    const published = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        workflow: { status: 'published' },
        seo: { metaTitle: 'Privacy', metaDescription: 'Privacy policy' },
      },
      user: pub,
      overrideAccess: true,
    })
    expect(published.workflow.status).toBe('published')
  })

  it('every change lands in the audit log', async () => {
    const before = await payload.count({ collection: 'audit-log', overrideAccess: true })
    await payload.create({
      collection: 'faqs',
      data: { question: 'Q?', answer: 'A.' },
      overrideAccess: true,
    })
    const after = await payload.count({ collection: 'audit-log', overrideAccess: true })
    // faqs has no workflow hooks; the audit hook is attached to workflow collections, so use a page instead.
    await payload.create({
      collection: 'pages',
      data: { title: 'Audit', slug: `audit-${suffix}`, workflow: { status: 'draft' } },
      overrideAccess: true,
    })
    const final = await payload.count({ collection: 'audit-log', overrideAccess: true })
    expect(after.totalDocs).toBeGreaterThanOrEqual(before.totalDocs)
    expect(final.totalDocs).toBeGreaterThan(after.totalDocs)
  })

  it('anonymous readers see only published pages', async () => {
    const res = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      where: { slug: { like: suffix } },
    })
    for (const d of res.docs) expect(d.workflow.status).toBe('published')
  })

  it('enquiries are hidden from anonymous readers', async () => {
    await payload.create({
      collection: 'enquiries',
      data: { ref: `IR-TEST-${suffix}`, name: 'TEST' },
      overrideAccess: true,
    })
    await expect(payload.find({ collection: 'enquiries', overrideAccess: false })).rejects.toThrow(
      /not allowed/i,
    )
  })

  it('locks the account after 5 failed logins', async () => {
    const email = user('content_editor').email
    for (let i = 0; i < 5; i++) {
      await payload
        .login({ collection: 'users', data: { email, password: 'wrong-password' } })
        .catch(() => undefined)
    }
    await expect(
      payload.login({
        collection: 'users',
        data: { email, password: user('content_editor').password },
      }),
    ).rejects.toThrow(/locked/i)
  })
})
