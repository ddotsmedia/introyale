import type { Metadata } from 'next'
import Link from 'next/link'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { container, sectionPad } from '@/components/blocks/shared'
import { FilterBar } from '@/components/FilterBar'
import { ProjectCard } from '@/components/ProjectCard'
import { cms, getPageBySlug } from '@/lib/cms'
import {
  PAGE_SIZE,
  isNoindexFilter,
  parseFilterParams,
  parsePage,
  projectWhere,
} from '@/lib/projectFilters'
import { pageMetadata } from '@/lib/seo'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const frames = [
  'aspect-[4/3]',
  'aspect-[4/5]',
  'aspect-square',
  'aspect-[4/3]',
  'aspect-[5/6]',
  'aspect-[3/2]',
]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const f = parseFilterParams(await searchParams)
  const page = await getPageBySlug('pages', 'work')
  const base = await pageMetadata({
    seo: page?.seo,
    fallbackTitle: page?.title ?? ui.projects,
    path: '/work',
  })
  return { ...base, robots: isNoindexFilter(f) ? { index: false, follow: true } : base.robots }
}

export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const f = parseFilterParams(await searchParams)
  const page = parsePage(f.page)
  const payload = await cms()
  const published = { 'workflow.status': { equals: 'published' } } as const

  const [intro, result, sectors, types, services, allYears] = await Promise.all([
    getPageBySlug('pages', 'work'),
    payload.find({
      collection: 'projects',
      where: projectWhere(f),
      limit: PAGE_SIZE,
      page,
      sort: 'createdAt',
      depth: 2,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'sectors',
      where: published,
      sort: 'createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({ collection: 'property-types', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'services',
      where: published,
      sort: 'createdAt',
      limit: 100,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'projects',
      where: published,
      limit: 500,
      depth: 0,
      select: { year: true },
      overrideAccess: false,
    }),
  ])

  const years = [
    ...new Set(allYears.docs.flatMap((p) => (typeof p.year === 'number' ? [p.year] : []))),
  ].sort((a, b) => b - a)
  const filters = [
    {
      name: 'sector',
      label: ui.filter.sector,
      options: sectors.docs.map((s) => ({ value: s.slug, label: s.title })),
    },
    {
      name: 'propertyType',
      label: ui.filter.propertyType,
      options: types.docs.map((t) => ({ value: t.slug, label: t.title })),
    },
    {
      name: 'service',
      label: ui.filter.service,
      options: services.docs.map((s) => ({ value: s.slug, label: s.title })),
    },
    {
      name: 'year',
      label: ui.filter.year,
      options: years.map((y) => ({ value: String(y), label: String(y) })),
    },
  ].filter((x) => x.options.length > 0)

  const qs = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) if (v && k !== 'page') params.set(k, v)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/work?${s}` : '/work'
  }

  return (
    <>
      {intro && <BlockRenderer layout={intro.layout} />}
      <FilterBar
        filters={filters}
        current={{
          sector: f.sector,
          propertyType: f.propertyType,
          service: f.service,
          year: f.year,
        }}
        basePath="/work"
      />
      <section className={`${sectionPad} bg-ivory`}>
        <div className={container}>
          {!intro?.layout?.length && (
            <h1 className="display mb-6 text-[clamp(2.5rem,5vw,4rem)]">{ui.projects}</h1>
          )}
          {result.docs.length === 0 ? (
            <p className="opacity-70">{ui.noProjects}</p>
          ) : (
            <div className="masonry">
              {result.docs.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  className="reveal"
                  href={`/work/${p.slug}`}
                  title={p.publicTitle ?? p.title}
                  meta={[
                    typeof p.sector === 'object' ? p.sector?.title : null,
                    p.areaLabel,
                    p.year,
                  ]}
                  hero={p.hero}
                  frame={frames[i % frames.length]}
                  viewTransitionName={`project-${p.slug}`}
                />
              ))}
            </div>
          )}
          <nav aria-label={ui.pagination.label} className="mt-6 flex gap-4">
            {result.hasPrevPage && (
              <Link href={qs(page - 1)} className="eyebrow border-b border-current pb-0.5">
                {ui.pagination.previous}
              </Link>
            )}
            {result.hasNextPage && (
              <Link href={qs(page + 1)} className="eyebrow border-b border-current pb-0.5">
                {ui.pagination.next}
              </Link>
            )}
          </nav>
        </div>
      </section>
    </>
  )
}
