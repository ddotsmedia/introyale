// Local-only demo data for the admin dashboard and leads board (admin v2). ENV=local only.
// Every record is marked TEST (isTest, ref IR-TEST-NNN, name prefix). Idempotent: existing refs are skipped.
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'

if (process.env.ENV !== 'local') {
  console.error('seed-test-leads refused: ENV must be "local"')
  process.exit(1)
}

const payload = await getPayload({ config })
const sys = { overrideAccess: true as const, depth: 0 }

// Role test users (local only). Passwords are random and printed once, never stored in the repo.
const roleUsers = [
  ['reviewer@introyale.local', 'Test Reviewer', 'marketing_reviewer'],
  ['editor@introyale.local', 'Test Editor', 'content_editor'],
  ['projects@introyale.local', 'Test Project Editor', 'project_editor'],
  ['publisher@introyale.local', 'Test Publisher', 'publisher'],
] as const
const userIds: Record<string, number> = {}
for (const [email, name, role] of roleUsers) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    ...sys,
  })
  if (found.docs[0]) {
    userIds[role] = found.docs[0].id
    continue
  }
  const password = randomBytes(18).toString('base64url')
  const u = await payload.create({
    collection: 'users',
    data: { email, password, name, role },
    ...sys,
  })
  userIds[role] = u.id
  console.log(`test user ${email} password ${password}`)
}
const admin = (
  await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@introyale.local' } },
    limit: 1,
    ...sys,
  })
).docs[0]
if (!admin) throw new Error('Run the live content importer first (admin user missing)')

// Admin sign-in hero: a CMS image, set only when empty (local demo).
const settings = (await payload.findGlobal({
  slug: 'site-settings',
  depth: 0,
  overrideAccess: true,
})) as { adminLoginImage?: unknown }
if (!settings.adminLoginImage) {
  const hero = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'scroll.jpg' } },
    limit: 1,
    ...sys,
  })
  if (hero.docs[0])
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { adminLoginImage: hero.docs[0].id },
      overrideAccess: true,
    })
}

const templates: [string, string, string][] = [
  [
    'Thank you, brief received',
    'Thank you, {{name}}: we have your brief',
    'Dear {{name}},\n\nThank you for contacting Introyale. We have received your enquiry (reference {{ref}}) and will be in touch shortly.\n\nIntroyale Interiors',
  ],
  [
    'Arrange a site visit',
    'Site visit for {{ref}}',
    'Dear {{name}},\n\nWe would like to arrange a site visit. Please reply with a day and time that suits you.\n\nIntroyale Interiors',
  ],
]
for (const [name, subject, body] of templates) {
  const found = await payload.count({
    collection: 'email-templates',
    where: { name: { equals: name } },
    overrideAccess: true,
  })
  if (!found.totalDocs)
    await payload.create({ collection: 'email-templates', data: { name, subject, body }, ...sys })
}

const statuses = [
  'new',
  'new',
  'new',
  'contacted',
  'contacted',
  'site_visit',
  'site_visit',
  'proposal_sent',
  'proposal_sent',
  'won',
  'won',
  'lost',
  'new',
  'contacted',
  'proposal_sent',
] as const
const sectors = ['Residential', 'Commercial', 'Hospitality & Leisure']
const sources = ['/', '/residential', '/contact', '/start', '/work']
const people = [
  'Aisha',
  'Omar',
  'Layla',
  'Yusuf',
  'Mariam',
  'Khalid',
  'Noor',
  'Hamad',
  'Sara',
  'Tariq',
  'Huda',
  'Rashid',
  'Dana',
  'Faisal',
  'Lina',
]
const owners = [
  admin.id,
  userIds['marketing_reviewer'] ?? admin.id,
  userIds['publisher'] ?? admin.id,
]
let created = 0
for (let i = 0; i < 15; i++) {
  const ref = `IR-TEST-${String(i + 1).padStart(3, '0')}`
  const exists = await payload.count({
    collection: 'enquiries',
    where: { ref: { equals: ref } },
    overrideAccess: true,
  })
  if (exists.totalDocs) continue
  const status = statuses[i] ?? 'new'
  const daysAgo = Math.round((i / 15) * 80) + 1
  const when = new Date(Date.now() - daysAgo * 86_400_000).toISOString()
  const assigned = i % 5 === 4 || status === 'new' ? undefined : owners[i % owners.length]
  const followUp = ['contacted', 'site_visit', 'proposal_sent'].includes(status)
    ? new Date(Date.now() + ((i % 4) - 1) * 86_400_000).toISOString()
    : undefined
  await payload.create({
    collection: 'enquiries',
    ...sys,
    data: {
      ref,
      type: i % 3 === 0 ? 'general' : 'consultation',
      name: `TEST ${people[i] ?? 'Client'}`,
      // Leads 14 and 15 share an email with an earlier lead to demonstrate duplicate linking.
      email:
        i >= 13
          ? 'test-lead-03@example.invalid'
          : `test-lead-${String(i + 1).padStart(2, '0')}@example.invalid`,
      phone: `+971 50 000 00${String(i + 10)}`,
      sector: sectors[i % sectors.length],
      location: ['Al Reem', 'Saadiyat', 'Yas Island', 'Khalifa City'][i % 4],
      budgetBand: ['', 'Under AED 500k', 'AED 500k - 1M', 'Over AED 1M'][i % 4] || undefined,
      brief: 'TEST enquiry created for local demo data. Not a real client.',
      sourcePage: sources[i % sources.length],
      consent: { given: true, textVersion: 'v1', at: when },
      status,
      priority: i % 4 === 0 ? 'high' : 'normal',
      lostReason: status === 'lost' ? 'Chose another studio' : undefined,
      estimatedValue: ['proposal_sent', 'won', 'site_visit'].includes(status)
        ? 150_000 + i * 35_000
        : undefined,
      followUpAt: followUp,
      assignedTo: assigned,
      isTest: true,
      createdAt: when,
      notes:
        i % 3 === 0
          ? [{ author: admin.id, text: 'TEST note: initial call booked.', at: when }]
          : [],
      activity:
        status === 'new'
          ? []
          : [
              {
                kind: 'status',
                text: `Status new → ${status.replace('_', ' ')}`,
                actor: admin.id,
                at: when,
              },
            ],
      deliveryStatus: { email: 'sent', crm: 'skipped:noop', attempts: 1 },
      retentionUntil: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    },
  })
  created++
}
console.log(`test leads created ${String(created)}`)
process.exit(0)
