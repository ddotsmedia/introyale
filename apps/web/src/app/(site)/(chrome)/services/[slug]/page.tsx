import { notFound } from 'next/navigation'
import { Accordion, Breadcrumbs, CtaBand, ProcessTimeline, Prose } from '@/components/Structure'
import { ProjectCard } from '@/components/ProjectCard'
import { getPageBySlug } from '@/lib/cms'

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import * as schema from '@/lib/schema'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = await getPageBySlug('services', slug)
  if (!doc) return {}
  return pageMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: doc.summary,
    path: `/services/${slug}`,
  })
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getPageBySlug('services', slug)
  if (!doc) notFound()
  const faqs = (doc.faqs ?? []).filter((f) => typeof f === 'object')
  const proof = (doc.proofProjects ?? []).filter((p) => typeof p === 'object')

  const ld = [
    schema.service({
      name: doc.title,
      description: doc.summary ?? null,
      url: `${SITE_URL}/services/${slug}`,
      providerName: 'Introyale Interiors',
    }),
    schema.breadcrumb([
      { name: 'Home', url: SITE_URL },
      { name: 'Services', url: `${SITE_URL}/services` },
      { name: doc.title, url: `${SITE_URL}/services/${slug}` },
    ]),
    schema.faqPage(
      faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        eligible: f.eligibleForSchema === true,
      })),
    ),
  ]
  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <JsonLd data={ld} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: doc.title },
        ]}
      />
      <h1 className="font-display text-ink mt-6 text-4xl">{doc.title}</h1>
      {doc.summary && (
        <Prose>
          <p>{doc.summary}</p>
        </Prose>
      )}
      {(doc.processSteps ?? []).length > 0 && (
        <div className="mt-10">
          <ProcessTimeline steps={(doc.processSteps ?? []).map((s) => ({ title: s.step }))} />
        </div>
      )}
      {faqs.length > 0 && (
        <div className="mt-10">
          <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
        </div>
      )}
      {proof.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {proof.map((p) => (
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
        <CtaBand heading="Discuss this service" href="/start" label="Start a project" />
      </div>
    </article>
  )
}
