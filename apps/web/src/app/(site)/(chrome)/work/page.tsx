import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Structure'
import { FilterBar } from '@/components/FilterBar'
import { ProjectCard } from '@/components/ProjectCard'
import { cms } from '@/lib/cms'
import {
  PAGE_SIZE,
  isNoindexFilter,
  parseFilterParams,
  parsePage,
  projectWhere,
} from '@/lib/projectFilters'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const pickFilters = parseFilterParams

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const f = pickFilters(await searchParams)
  return {
    title: 'Projects',
    robots: isNoindexFilter(f) ? { index: false, follow: true } : undefined,
  }
}

export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const f = pickFilters(raw)
  const page = parsePage(f.page)
  const payload = await cms()

  const [result, sectors, types, services, allYears] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: projectWhere(f),
      limit: PAGE_SIZE,
      page,
      sort: '-year',
      depth: 2,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'sectors',
      where: { 'workflow.status': { equals: 'published' } },
      limit: 50,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({ collection: 'property-types', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'services',
      where: { 'workflow.status': { equals: 'published' } },
      limit: 100,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'projects',
      where: { 'workflow.status': { equals: 'published' } },
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
      label: 'Sector',
      options: sectors.docs.map((s) => ({ value: s.slug, label: s.title })),
    },
    {
      name: 'propertyType',
      label: 'Property type',
      options: types.docs.map((t) => ({ value: t.slug, label: t.title })),
    },
    {
      name: 'service',
      label: 'Service',
      options: services.docs.map((s) => ({ value: s.slug, label: s.title })),
    },
    {
      name: 'year',
      label: 'Year',
      options: years.map((y) => ({ value: String(y), label: String(y) })),
    },
  ].filter((f) => f.options.length > 0)

  const qs = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) if (v && k !== 'page') params.set(k, v)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/work?${s}` : '/work'
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">Projects</h1>
      <div className="mt-6">
        <FilterBar
          filters={filters}
          current={{
            sector: f.sector,
            propertyType: f.propertyType,
            service: f.service,
            year: f.year,
          }}
        />
      </div>
      {result.docs.length === 0 ? (
        <p className="text-taupe mt-10">No projects match these filters.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {result.docs.map((p) => (
            <ProjectCard
              key={p.id}
              href={`/work/${p.slug}`}
              title={p.publicTitle ?? p.title}
              areaLabel={p.areaLabel}
              year={p.year}
              hero={p.hero}
              viewTransitionName={`project-${p.slug}`}
            />
          ))}
        </div>
      )}
      <nav aria-label="Pagination" className="mt-10 flex gap-6">
        {result.hasPrevPage && (
          <Link href={qs(page - 1)} className="underline">
            Previous
          </Link>
        )}
        {result.hasNextPage && (
          <Link href={qs(page + 1)} className="underline">
            Next
          </Link>
        )}
      </nav>
    </section>
  )
}
