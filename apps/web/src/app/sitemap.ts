import type { MetadataRoute } from 'next'
import { cms } from '@/lib/cms'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = [
  '/',
  '/work',
  '/services',
  '/studio',
  '/studio/team',
  '/process',
  '/contact',
  '/residential',
  '/commercial',
  '/hospitality-leisure',
]

/** Published content only (SPEC §4). Case studies carry their hero as an image entry. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await cms()
  const published = { 'workflow.status': { equals: 'published' } } as const
  const [projects, services, sectors, journal, team] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: published,
      limit: 1000,
      depth: 2,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'services',
      where: published,
      limit: 200,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'sectors',
      where: published,
      limit: 50,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'journal-posts',
      where: published,
      limit: 1000,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'team-members',
      where: { and: [published, { 'consent.given': { equals: true } }] },
      limit: 500,
      depth: 0,
      overrideAccess: false,
    }),
  ])
  const now = new Date()
  const entry = (path: string, changeFrequency: 'weekly' | 'monthly' = 'monthly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
  })

  const out: MetadataRoute.Sitemap = STATIC_PATHS.map((p) =>
    entry(p, p === '/' ? 'weekly' : 'monthly'),
  )
  for (const s of sectors.docs) out.push(entry(`/${s.slug}`))
  for (const s of services.docs) out.push(entry(`/services/${s.slug}`))
  for (const p of projects.docs) {
    const hero = typeof p.hero === 'object' ? p.hero : null
    out.push({
      ...entry(`/work/${p.slug}`),
      images: hero?.url ? [`${SITE_URL}${hero.url}`] : undefined,
    })
  }
  // The journal is hidden until three articles are published (SPEC C15).
  if (journal.totalDocs >= 3) for (const j of journal.docs) out.push(entry(`/journal/${j.slug}`))
  for (const t of team.docs) out.push(entry(`/studio/team/${t.slug}`))
  return out
}
