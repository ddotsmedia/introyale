// One-time importer of the live introyale.com content for the local preview (NEXT-PROMPT part A).
// ENV=local only. Skips records that already exist, so admin edits are never overwritten. It also removes the
// old [DEMO] records. Images are read from IMPORT_DIR/images (downloaded read-only by the crawl step).
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import {
  ABOUT,
  BUSINESS_HOURS,
  CLIENT_LOGOS,
  CLIENTS_PAGE,
  CONTACT,
  FACTS,
  HOME,
  IMAGES,
  PROCESS_STEPS,
  SECTORS,
  SEO,
  SERVICES_INTRO,
  SITE,
  SOURCE,
  START,
  THANKS,
  WORK,
  CLOSING_CTA,
  CONSENT_TEXT,
} from './live-content'

if (
  process.env.ENV !== 'local' &&
  !(process.env.ENV === 'staging' && process.env.SEED_ADMIN_EMAIL)
) {
  console.error(
    'seed-live-content refused: ENV must be "local" (or "staging" with SEED_ADMIN_EMAIL)',
  )
  process.exit(1)
}

const IMPORT_DIR = process.env.IMPORT_DIR ?? '/import'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@introyale.local'
type Doc = { id: number | string; workflow?: { status?: string } & Record<string, unknown> }
const counts = { created: 0, skipped: 0, removed: 0 }

const payload: Payload = await getPayload({ config })
const system = { overrideAccess: true as const }

// ---- Admin user (kept if it exists) ----
let admin: Doc
const found = await payload.find({
  collection: 'users',
  where: { email: { equals: ADMIN_EMAIL } },
  limit: 1,
  ...system,
})
if (found.docs[0]) {
  admin = found.docs[0]
  await payload.update({
    collection: 'users',
    id: admin.id,
    data: { name: 'Administrator' },
    ...system,
  })
} else {
  const password = randomBytes(18).toString('base64url')
  admin = await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password, name: 'Administrator', role: 'administrator' },
    ...system,
  })
  console.log(`import: admin ${ADMIN_EMAIL} created`)
  console.log(`import: one-time password (shown once, not saved): ${password}`)
}
const write = { ...system, user: { ...admin, collection: 'users' } as never }

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`)

async function publish(collection: string, id: number | string): Promise<void> {
  for (const status of ['in_review', 'approved', 'published'] as const) {
    const current = (await payload.findByID({
      collection: collection as never,
      id,
      depth: 0,
      ...system,
    })) as Doc
    await payload.update({
      collection: collection as never,
      id,
      data: { workflow: { ...(current.workflow ?? {}), status } } as never,
      ...write,
    })
  }
}

async function findOne(collection: string, field: string, value: string): Promise<Doc | null> {
  const r = await payload.find({
    collection: collection as never,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    ...system,
  })
  return (r.docs[0] as Doc | undefined) ?? null
}

async function create(collection: string, data: Record<string, unknown>): Promise<Doc> {
  counts.created += 1
  return await payload.create({
    collection: collection as never,
    data: data as never,
    ...write,
  })
}

// ---- Remove the old demo records (only those marked [DEMO]) ----
for (const collection of [
  'journal-posts',
  'testimonials',
  'projects',
  'services',
  'team-members',
  'sectors',
  'property-types',
  'journal-categories',
  'faqs',
  'pages',
  'facts',
  'media',
]) {
  const all = await payload.find({
    collection: collection as never,
    limit: 1000,
    depth: 0,
    ...system,
  })
  for (const d of all.docs) {
    if (JSON.stringify(d).includes('[DEMO]')) {
      await payload.delete({ collection: collection as never, id: (d as Doc).id, ...write })
      counts.removed += 1
    }
  }
}

// ---- Media ----
const mediaIds = new Map<string, number | string>()
async function media(file: string, alt: string): Promise<number | string> {
  const cached = mediaIds.get(file)
  if (cached !== undefined) return cached
  const credit = `${SOURCE}/images/${file}`
  const existing = await findOne('media', 'credit', credit)
  if (existing) {
    counts.skipped += 1
    mediaIds.set(file, existing.id)
    return existing.id
  }
  const data = fs.readFileSync(path.join(IMPORT_DIR, 'images', file))
  const mimetype = file.endsWith('.png') ? 'image/png' : 'image/jpeg'
  counts.created += 1
  const doc = (await payload.create({
    collection: 'media',
    data: { alt, credit, usageApproved: true, confidential: false },
    file: { data, mimetype, name: file, size: data.length },
    ...write,
  })) as Doc
  mediaIds.set(file, doc.id)
  return doc.id
}
const altFor = (file: string) => IMAGES.find((i) => i.file === file)?.alt ?? ''
for (const img of IMAGES) await media(img.file, img.alt)
const img = (file: string) => {
  const id = mediaIds.get(file)
  if (id === undefined) throw new Error(`missing media ${file}`)
  return id
}

// ---- Facts (verified: owner instruction) ----
for (const [key, f] of Object.entries(FACTS)) {
  if (await findOne('facts', 'key', key)) {
    counts.skipped += 1
    continue
  }
  await create('facts', {
    key,
    value: f.value,
    displayText: f.value,
    source: SOURCE,
    evidence: `${f.note}. Verified on the owner's instruction.`,
    status: 'verified',
  })
}

// ---- Sectors (drafts first, so projects and services can point at them) ----
const sectorDocs = new Map<string, Doc>()
const serviceIds = new Map<string, (number | string)[]>()
const projectIds = new Map<string, (number | string)[]>()
const newSectors: string[] = []
for (const s of SECTORS) {
  const existing = await findOne('sectors', 'slug', s.slug)
  if (existing) {
    counts.skipped += 1
    sectorDocs.set(s.slug, existing)
    continue
  }
  sectorDocs.set(
    s.slug,
    await create('sectors', { title: s.title, slug: s.slug, intro: s.intro, hero: img(s.hero) }),
  )
  newSectors.push(s.slug)
}

// ---- Services (only those described on the live site) ----
const services: { sector: string; id: number | string; slug: string; isNew: boolean }[] = []
for (const s of SECTORS) {
  const sector = sectorDocs.get(s.slug)
  if (!sector) continue
  for (const svc of s.services) {
    const existing = await findOne('services', 'slug', svc.slug)
    if (existing) {
      counts.skipped += 1
      services.push({ sector: s.slug, id: existing.id, slug: svc.slug, isNew: false })
      continue
    }
    const doc = await create('services', {
      title: svc.title,
      slug: svc.slug,
      summary: svc.text,
      sector: sector.id,
      image: img(s.hero),
      confirmed: true,
      seo: {
        metaTitle: clip(`${svc.title} | Introyale Interiors`, 60),
        metaDescription: clip(svc.text, 160),
      },
    })
    services.push({ sector: s.slug, id: doc.id, slug: svc.slug, isNew: true })
  }
  serviceIds.set(
    s.slug,
    services.filter((x) => x.sector === s.slug).map((x) => x.id),
  )
}

// ---- Projects: one per visual gallery group, neutral titles, nothing invented ----
for (const s of SECTORS) {
  const sector = sectorDocs.get(s.slug)
  if (!sector) continue
  const first = s.title.split(' ')[0] ?? s.title
  const ids: (number | string)[] = []
  for (const [i, group] of s.projects.entries()) {
    const title = `${first} Interior ${String(i + 1).padStart(2, '0')}`
    const slug = `${s.slug.split('-')[0] ?? s.slug}-interior-${String(i + 1).padStart(2, '0')}`
    const existing = await findOne('projects', 'slug', slug)
    if (existing) {
      counts.skipped += 1
      ids.push(existing.id)
      continue
    }
    const [hero, ...rest] = group
    if (!hero) continue
    const doc = await create('projects', {
      title,
      publicTitle: title,
      slug,
      sector: sector.id,
      services: serviceIds.get(s.slug) ?? [],
      hero: img(hero),
      gallery: rest.map(img),
      adminNote:
        '[CONFIRM name/location/year] Grouped by visual similarity from the introyale.com gallery. No details were published on the live site.',
      clientApproval: {
        approved: true,
        approvedBy: 'Owner instruction',
        evidence: `Shown publicly on ${SOURCE}`,
      },
      seo: {
        metaTitle: clip(`${title} | Introyale Interiors`, 60),
        metaDescription: clip(
          `${s.title} interior design project by Introyale Interiors, ${hero ? altFor(hero) : ''}.`,
          160,
        ),
      },
    })
    await publish('projects', doc.id)
    ids.push(doc.id)
  }
  projectIds.set(s.slug, ids)
}

// ---- Layout blocks ----
type Block = Record<string, unknown> & { blockType: string }
const cta = (label: string, href: string) => ({ label, href })
const ctaBlock = (
  heading: string,
  text: string | undefined,
  label: string,
  href: string,
  image?: string,
): Block => ({
  blockType: 'ctaBand',
  heading,
  text,
  image: image ? img(image) : undefined,
  button: cta(label, href),
})

// Sector pages and their services
for (const s of SECTORS) {
  const sector = sectorDocs.get(s.slug)
  if (!sector || !newSectors.includes(s.slug)) continue
  await payload.update({
    collection: 'sectors',
    id: sector.id,
    data: {
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Our services',
          headline: s.title,
          subhead: s.intro,
          image: img(s.banner),
          size: 'banner',
          overlay: 50,
        },
        {
          blockType: 'textSection',
          eyebrow: undefined,
          heading: undefined,
          body: s.body.join('\n\n'),
          columns: '1',
        },
        {
          blockType: 'servicesList',
          eyebrow: 'We deal with',
          heading: 'What we offer',
          intro: s.dealIntro,
          services: serviceIds.get(s.slug) ?? [],
        },
        {
          blockType: 'featuredWork',
          eyebrow: 'Portfolio',
          heading: 'Our recent works',
          intro: s.recentIntro,
          projects: projectIds.get(s.slug) ?? [],
          limit: 6,
          viewAll: cta('View all projects', '/work'),
        },
        ctaBlock(
          'Get your free expert consultancy',
          undefined,
          'Contact now',
          '/contact',
          'servicebg.jpg',
        ),
      ],
      seo: { metaTitle: clip(s.seoTitle, 60), metaDescription: clip(s.intro, 160) },
    } as never,
    ...write,
  })
  await publish('sectors', sector.id)
}
for (const sv of services.filter((x) => x.isNew)) {
  const s = SECTORS.find((x) => x.slug === sv.sector)
  if (!s) continue
  await payload.update({
    collection: 'services',
    id: sv.id,
    data: {
      proofProjects: projectIds.get(sv.sector) ?? [],
      layout: [
        {
          blockType: 'featuredWork',
          eyebrow: 'Portfolio',
          heading: 'Our recent works',
          intro: s.recentIntro,
          projects: projectIds.get(sv.sector) ?? [],
          limit: 6,
          viewAll: cta('View all projects', '/work'),
        },
        ctaBlock(
          'Get your free expert consultancy',
          undefined,
          'Contact now',
          '/contact',
          'servicebg.jpg',
        ),
      ],
    } as never,
    ...write,
  })
  await publish('services', sv.id)
}

// ---- Clients: logos only, names admin-only and unconfirmed ----
const clientIds: (number | string)[] = []
for (const [i, file] of CLIENT_LOGOS.entries()) {
  const n = String(i + 1).padStart(2, '0')
  const name = `[CONFIRM] Client ${n}`
  const existing = await findOne('clients', 'name', name)
  if (existing) {
    counts.skipped += 1
    clientIds.push(existing.id)
    continue
  }
  const logo = await media(file, `Client logo ${n}`)
  const doc = await create('clients', { name, order: i, logo, logoPermission: true })
  clientIds.push(doc.id)
}

// ---- Pages ----
async function page(
  slug: string,
  title: string,
  seo: { title: string; description: string },
  layout: Block[],
): Promise<void> {
  if (await findOne('pages', 'slug', slug)) {
    counts.skipped += 1
    return
  }
  const doc = await create('pages', {
    title,
    slug,
    layout,
    seo: { metaTitle: clip(seo.title, 60), metaDescription: clip(seo.description, 160) },
  })
  await publish('pages', doc.id)
}
const banner = (
  eyebrow: string | undefined,
  headline: string,
  file: string,
  subhead?: string,
): Block => ({
  blockType: 'hero',
  eyebrow,
  headline,
  subhead,
  image: img(file),
  size: 'banner',
  overlay: 50,
})
const processBlock = (
  tone: 'dark' | 'light',
  heading = HOME.process.heading,
  eyebrow = HOME.process.eyebrow,
): Block => ({
  blockType: 'processSteps',
  eyebrow,
  heading,
  steps: PROCESS_STEPS,
  tone,
})

await page('studio', 'About us', SEO.studio, [
  banner('About us', 'Bringing interiors to life', 'banner4.jpg'),
  {
    blockType: 'imageText',
    eyebrow: 'Introyale Interiors',
    heading: ABOUT.heading,
    body: ABOUT.paragraphs.join('\n\n'),
    image: img('slider1.jpg'),
    imageSide: 'right',
  },
  {
    blockType: 'imageText',
    eyebrow: ABOUT.quality.eyebrow,
    heading: ABOUT.quality.heading,
    body: ABOUT.quality.body,
    image: img('p2.jpg'),
    imageSide: 'left',
  },
  {
    blockType: 'imageText',
    eyebrow: ABOUT.customers.eyebrow,
    heading: ABOUT.customers.heading,
    body: ABOUT.customers.body,
    image: img('slider3.jpg'),
    imageSide: 'right',
  },
  {
    blockType: 'textSection',
    eyebrow: ABOUT.vision.eyebrow,
    heading: ABOUT.vision.heading,
    body: ABOUT.vision.body.join('\n\n'),
    columns: '2',
  },
  ctaBlock(
    HOME.cta.heading,
    HOME.cta.text,
    HOME.cta.button.label,
    HOME.cta.button.href,
    'servicebg.jpg',
  ),
])
await page('process', 'Our process', SEO.process, [
  banner('Process', 'How a project runs', 'banner3.jpg'),
  processBlock('light', 'From the first brief to the final delivery', 'Plan of action'),
  ctaBlock(
    'Get your free expert consultancy',
    undefined,
    'Contact now',
    '/contact',
    'servicebg.jpg',
  ),
])
await page('clients', 'Clients', SEO.clients, [
  banner('Clients', CLIENTS_PAGE.heading, 'banner3.jpg', CLIENTS_PAGE.intro),
  { blockType: 'clientWall', heading: undefined, intro: undefined, clients: [], limit: 60 },
  ctaBlock(
    HOME.cta.heading,
    HOME.cta.text,
    HOME.cta.button.label,
    HOME.cta.button.href,
    'servicebg.jpg',
  ),
])
await page('contact', 'Contact', SEO.contact, [
  banner('Contact us', CONTACT.banner, 'banner4.jpg'),
  { blockType: 'contactInfo', heading: CONTACT.heading, intro: CONTACT.intro, showHours: true },
  {
    blockType: 'enquiryForm',
    heading: CONTACT.formHeading,
    intro: CONTACT.formIntro,
    form: 'contact',
  },
])
await page('work', 'Projects', SEO.work, [banner(WORK.eyebrow, WORK.headline, 'banner2.jpg')])
await page('thank-you', 'Thank you', SEO.thanks, [
  banner(undefined, THANKS.heading, 'banner4.jpg', THANKS.text),
])
await page('start', 'Start a project', SEO.start, [
  banner('Consultation', START.heading, 'bookbg.jpg', START.intro),
  { blockType: 'enquiryForm', heading: undefined, intro: undefined, form: 'consultation' },
])

// ---- Globals (only filled when empty or still carrying demo text) ----
async function globalIsFree(
  slug: string,
  probe: (g: Record<string, unknown>) => boolean,
): Promise<boolean> {
  const g = (await payload.findGlobal({ slug: slug as never, depth: 0, ...system })) as Record<
    string,
    unknown
  >
  return !probe(g) || JSON.stringify(g).includes('[DEMO]')
}
async function setGlobal(
  slug: string,
  probe: (g: Record<string, unknown>) => boolean,
  data: Record<string, unknown>,
) {
  if (await globalIsFree(slug, probe)) {
    await payload.updateGlobal({ slug: slug as never, data: data as never, ...write })
    counts.created += 1
  } else counts.skipped += 1
}
const sectorNav = SECTORS.map((s) => ({ label: s.title, link: `/${s.slug}` }))
await setGlobal('site-settings', (g) => typeof g.name === 'string' && g.name !== '', {
  name: SITE.name,
  tagline: SITE.tagline,
  logo: img('logo-gold.png'),
  footerLogo: img('logo-white.png'),
  ctaLabel: SITE.ctaLabel,
  ctaLink: SITE.ctaLink,
})
// Closing call-to-action (end of case studies): backfilled when empty, never overwritten.
{
  const current = (await payload.findGlobal({ slug: 'site-settings', depth: 0, ...system })) as {
    closingCta?: { heading?: string | null }
  }
  if (!current.closingCta?.heading) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        closingCta: {
          heading: CLOSING_CTA.heading,
          image: img('servicebg.jpg'),
          buttonLabel: CLOSING_CTA.buttonLabel,
          buttonHref: CLOSING_CTA.buttonHref,
        },
      } as never,
      ...write,
    })
    counts.created += 1
  }
}
await setGlobal('navigation', (g) => Array.isArray(g.items) && g.items.length > 0, {
  items: [
    { label: 'Studio', link: '/studio' },
    ...sectorNav,
    { label: 'Work', link: '/work' },
    { label: 'Clients', link: '/clients' },
    { label: 'Contact', link: '/contact' },
  ],
})
await setGlobal('footer', (g) => typeof g.copy === 'string' && g.copy !== '', {
  copy: SITE.footerCopy,
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Studio', link: '/studio' },
        { label: 'Work', link: '/work' },
        { label: 'Process', link: '/process' },
        { label: 'Clients', link: '/clients' },
        { label: 'Contact', link: '/contact' },
      ],
    },
    { title: 'Services', links: sectorNav },
  ],
  links: [],
})
await setGlobal(
  'contact-info',
  (g) =>
    typeof g.addressFactKey === 'string' &&
    g.addressFactKey !== '' &&
    typeof g.hours === 'string' &&
    !g.hours.includes('[DEMO]'),
  {
    addressFactKey: 'address',
    phoneFactKey: 'phone',
    whatsappFactKey: 'whatsapp',
    emailFactKey: 'email',
    salesEmailFactKey: 'sales_email',
    hours: BUSINESS_HOURS,
  },
)
await setGlobal('social-profiles', (g) => Array.isArray(g.items) && g.items.length > 0, {
  items: [{ platform: 'Facebook', url: SITE.facebook }],
})
await setGlobal(
  'seo-defaults',
  (g) => typeof g.titleTemplate === 'string' && g.titleTemplate !== '',
  {
    titleTemplate: SITE.seoTitleTemplate,
    description: SITE.seoDescription,
    ogImage: img('banner3.jpg'),
  },
)

const homeLayout: Block[] = [
  {
    blockType: 'hero',
    eyebrow: HOME.hero.eyebrow,
    headline: HOME.hero.headline,
    subhead: HOME.hero.subhead,
    image: img('scroll.jpg'),
    overlay: 50,
    size: 'full',
    primaryCta: cta(HOME.hero.primary.label, HOME.hero.primary.href),
    secondaryCta: cta(HOME.hero.secondary.label, HOME.hero.secondary.href),
  },
  {
    blockType: 'imageText',
    eyebrow: 'Introyale Interiors',
    heading: ABOUT.heading,
    body: ABOUT.paragraphs.join('\n\n'),
    image: img('slider1.jpg'),
    imageSide: 'right',
    cta: cta('About us', '/studio'),
  },
  {
    blockType: 'introStats',
    eyebrow: HOME.achievements.eyebrow,
    heading: HOME.achievements.heading,
    body: HOME.achievements.body,
    stats: Object.entries(HOME.achievements.labels).map(([factKey, label]) => ({ factKey, label })),
  },
  {
    blockType: 'featuredWork',
    eyebrow: HOME.work.eyebrow,
    heading: HOME.work.heading,
    projects: [],
    limit: 5,
    viewAll: cta(HOME.work.viewAll, '/work'),
  },
  {
    blockType: 'sectorTiles',
    eyebrow: HOME.sectors.eyebrow,
    heading: HOME.sectors.heading,
    intro: SERVICES_INTRO,
    sectors: [],
  },
  {
    blockType: 'servicesList',
    eyebrow: HOME.services.eyebrow,
    heading: HOME.services.heading,
    services: [],
  },
  processBlock('dark'),
  {
    blockType: 'clientWall',
    eyebrow: HOME.clients.eyebrow,
    heading: HOME.clients.heading,
    intro: HOME.clients.intro,
    clients: [],
    limit: 12,
    viewAll: cta(HOME.clients.viewAll, '/clients'),
  },
  ctaBlock(
    HOME.cta.heading,
    HOME.cta.text,
    HOME.cta.button.label,
    HOME.cta.button.href,
    'servicebg.jpg',
  ),
]
await setGlobal('home-page', (g) => Array.isArray(g.layout) && g.layout.length > 0, {
  layout: homeLayout,
  seo: { metaTitle: clip(SEO.home.title, 60), metaDescription: clip(SEO.home.description, 160) },
})

// Backfill: consent checkbox label for the forms (never overwritten once set).
{
  const cs = (await payload.findGlobal({ slug: 'consultation-settings', depth: 0, ...system })) as {
    consentText?: string | null
  }
  if (!cs.consentText) {
    await payload.updateGlobal({
      slug: 'consultation-settings',
      data: { consentText: CONSENT_TEXT },
      ...write,
    })
  }
}

// Backfill: a see-all link on the home services preview (only where none is set).
{
  const home = (await payload.findGlobal({ slug: 'home-page', depth: 0, ...system })) as {
    layout?: Block[]
  }
  const current = home.layout ?? []
  const layout = current.map((b) => {
    const link = b.viewAll as { href?: string } | undefined
    return b.blockType === 'servicesList' && !link?.href
      ? { ...b, viewAll: cta(HOME.services.viewAll, '/services') }
      : b
  })
  if (layout.some((b, i) => b !== current[i])) {
    await payload.updateGlobal({ slug: 'home-page', data: { layout } as never, ...write })
  }
}

console.log(
  `import: done. created ${String(counts.created)}, skipped ${String(counts.skipped)}, demo records removed ${String(counts.removed)}`,
)
process.exit(0)
