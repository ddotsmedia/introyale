// One-time (idempotent) legal pages for the live site: Privacy, Terms, Cookies, Accessibility, plus the footer links.
// Existing pages and footer links are never overwritten, so admin edits stay. Needs SEED_ADMIN_EMAIL (an existing user).
import config from '@payload-config'
import { getPayload } from 'payload'
import { LEGAL, REVIEW_NOTE } from './legal-content'

const email = process.env.SEED_ADMIN_EMAIL
if (!email) {
  console.error('seed-legal refused: set SEED_ADMIN_EMAIL to an existing administrator')
  process.exit(1)
}
const payload = await getPayload({ config })
const system = { overrideAccess: true as const }
const admin = (
  await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    ...system,
  })
).docs[0]
if (!admin) throw new Error(`administrator ${email} not found`)
const write = { ...system, user: { ...admin, collection: 'users' } as never }
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`)

// RESEED_LEGAL=1 replaces the four legal pages with the current template text (use only before the owner has edited them).
const reseed = process.env.RESEED_LEGAL === '1'
let created = 0
for (const p of LEGAL) {
  const have = await payload.find({
    collection: 'pages',
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
    ...system,
  })
  if (have.docs[0] && !reseed) continue
  if (have.docs[0]) await payload.delete({ collection: 'pages', id: have.docs[0].id, ...write })
  const doc = await payload.create({
    collection: 'pages',
    data: {
      title: p.title,
      slug: p.slug,
      intro: p.description,
      body: p.body,
      seo: {
        metaTitle: clip(`${p.title} | Introyale Interiors`, 60),
        metaDescription: clip(p.description, 160),
      },
      workflow: { status: 'draft', reviewNotes: REVIEW_NOTE },
    } as never,
    ...write,
  })
  for (const status of ['in_review', 'approved', 'published'] as const) {
    const cur = (await payload.findByID({
      collection: 'pages',
      id: doc.id,
      depth: 0,
      ...system,
    })) as { workflow?: Record<string, unknown> }
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: { workflow: { ...(cur.workflow ?? {}), status } },
      ...write,
    })
  }
  created += 1
}

const footer = (await payload.findGlobal({ slug: 'footer', depth: 0, ...system })) as {
  links?: unknown[]
}
if (!footer.links?.length) {
  await payload.updateGlobal({
    slug: 'footer',
    data: { links: LEGAL.map((p) => ({ label: p.title, link: `/${p.slug}` })) },
    ...write,
  })
}
console.log(`legal pages created: ${String(created)}`)
process.exit(0)
