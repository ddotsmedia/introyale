import { notFound } from 'next/navigation'
import { Breadcrumbs, CtaBand, Prose } from '@/components/Structure'
import { ProjectCard } from '@/components/ProjectCard'
import { getPageBySlug } from '@/lib/cms'

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import * as schema from '@/lib/schema'

const SECTOR_SLUGS = ['residential', 'commercial', 'hospitality-leisure']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sector: string }>
}): Promise<Metadata> {
  const { sector } = await params
  if (!SECTOR_SLUGS.includes(sector)) return {}
  const doc = await getPageBySlug('sectors', sector)
  if (!doc) return {}
  return pageMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: doc.intro,
    path: `/${sector}`,
  })
}

/** Launch sectors only (D6). Any other single-segment path is a 404. */
const SECTORS = ['residential', 'commercial', 'hospitality-leisure'] as const

export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params
  if (!(SECTORS as readonly string[]).includes(sector)) notFound()
  const doc = await getPageBySlug('sectors', sector)
  if (!doc) notFound()
  const projects = (doc.featuredProjects ?? []).filter((p) => typeof p === 'object')

  const ld = schema.breadcrumb([
    { name: 'Home', url: SITE_URL },
    { name: doc.title, url: `${SITE_URL}/${sector}` },
  ])
  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: doc.title }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">{doc.title}</h1>
      {doc.intro && (
        <Prose>
          <p>{doc.intro}</p>
        </Prose>
      )}
      {projects.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              href={`/work/${p.slug}`}
              title={p.publicTitle ?? p.title}
              areaLabel={p.areaLabel}
              year={p.year}
              hero={p.hero}
            />
          ))}
        </div>
      )}
      <div className="mt-12">
        <CtaBand
          heading={`Planning a ${doc.title.toLowerCase()} project?`}
          href="/start"
          label="Start a project"
        />
      </div>
    </article>
  )
}
