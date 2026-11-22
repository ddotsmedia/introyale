// Local-only helper to exercise the CRM jobs in the running worker (ENV=local only).
//   prepare  : create an approved, unscheduled test page "scheduled-publish-test" and reset today's digest marker
//   queue    : queue leadDigest, unassignedAlert and publishScheduled for the worker to run
import config from '@payload-config'
import { getPayload } from 'payload'
import { dubaiParts } from '../src/lib/leads'

if (process.env.ENV !== 'local') {
  console.error('jobs-trigger refused: ENV must be "local"')
  process.exit(1)
}
const mode = process.argv[2]
const payload = await getPayload({ config })
const sys = { overrideAccess: true as const, depth: 0 }

if (mode === 'prepare') {
  const admin = (
    await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@introyale.local' } },
      limit: 1,
      ...sys,
    })
  ).docs[0]
  if (!admin) throw new Error('admin missing')
  // Allow the digest to run again today: drop the marker the previous run wrote.
  await payload.delete({
    collection: 'audit-log',
    where: {
      and: [
        { action: { equals: 'digest.sent' } },
        { docId: { equals: dubaiParts(new Date()).date } },
      ],
    },
    ...sys,
  })
  // Two assigned leads with a follow-up due now, so the digest has something to send.
  const leads = await payload.find({
    collection: 'enquiries',
    where: { isTest: { equals: true }, status: { in: ['contacted', 'site_visit'] } },
    limit: 3,
    ...sys,
  })
  for (const l of leads.docs) {
    await payload.update({
      collection: 'enquiries',
      id: l.id,
      data: { assignedTo: admin.id, followUpAt: new Date(Date.now() - 3_600_000).toISOString() },
      ...sys,
    })
  }
  // Re-arm the unassigned alert for the test leads that qualify.
  await payload.update({
    collection: 'enquiries',
    where: { and: [{ isTest: { equals: true } }, { status: { equals: 'new' } }] },
    data: { unassignedAlertAt: null, assignedTo: null },
    ...sys,
  })
  const old = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'scheduled-publish-test' } },
    limit: 1,
    ...sys,
  })
  if (old.docs[0]) await payload.delete({ collection: 'pages', id: old.docs[0].id, ...sys })
  const page = await payload.create({
    collection: 'pages',
    user: admin,
    overrideAccess: false,
    data: {
      title: 'Scheduled publish test',
      slug: 'scheduled-publish-test',
      intro: 'Created by the local jobs check.',
      seo: {
        metaTitle: 'Scheduled publish test',
        metaDescription: 'Created by the local jobs check.',
      },
      workflow: { status: 'draft' },
    } as never,
  })
  for (const status of ['in_review', 'approved']) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      user: admin,
      overrideAccess: false,
      data: { workflow: { status } } as never,
    })
  }
  // An unpublished draft, for the shareable preview link check.
  const d = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'draft-preview-test' } },
    limit: 1,
    ...sys,
  })
  if (d.docs[0]) await payload.delete({ collection: 'pages', id: d.docs[0].id, ...sys })
  await payload.create({
    collection: 'pages',
    user: admin,
    overrideAccess: false,
    data: {
      title: 'Draft preview test',
      slug: 'draft-preview-test',
      intro: 'This draft is not public.',
      workflow: { status: 'draft' },
    } as never,
  })
  console.log(`prepared page ${String(page.id)} and ${String(leads.docs.length)} leads`)
} else if (mode === 'queue') {
  for (const task of ['leadDigest', 'unassignedAlert', 'publishScheduled'] as const) {
    await payload.jobs.queue({ task, input: {} })
  }
  console.log('queued 3 jobs')
}
process.exit(0)
