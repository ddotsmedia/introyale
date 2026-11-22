import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BeforeAfter } from '@/components/BeforeAfter'
import { CtaBand } from '@/components/blocks/CtaBand'
import { Hero } from '@/components/blocks/Hero'
import { container, paragraphs, sectionPad } from '@/components/blocks/shared'
import { FactStrip } from '@/components/FactStrip'
import { Gallery } from '@/components/Gallery'
import { JsonLd } from '@/components/JsonLd'
import { PlanHotspots } from '@/components/PlanHotspots'
import { ProjectCard } from '@/components/ProjectCard'
import { Breadcrumbs, Testimonial, TeamCard } from '@/components/Structure'
import { cms, getPageBySlug } from '@/lib/cms'
import * as schema from '@/lib/schema'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import { closingCta } from '@/lib/site'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await getPageBySlug('projects', slug)
  if (!p) return {}
  const hero = typeof p.hero === 'object' ? p.hero : null
  return pageMetadata({
    seo: p.seo,
    fallbackTitle: p.publicTitle ?? p.title,
    fallbackDescription: p.outcome ?? null,
    path: `/work/${slug}`,
    image: hero?.url ? `${SITE_URL}${hero.url}` : null,
  })
}

// Written chapters, in the order of SPEC §4 (brief, concept, materials, technical, delivery, result).
const CHAPTERS = [
  'brief',
  'constraints',
  'concept',
  'spacePlanning',
  'materials',
  'joinery',
  'technicalMep',
  'deliveryModel',
  'timelineLabel',
  'outcome',
] as const

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPageBySlug('projects', slug)
  if (!p) notFound()
  const payload = await cms()
  const title = p.publicTitle ?? p.title
  const sector = typeof p.sector === 'object' ? p.sector : null
  const team = (p.team ?? []).filter((t) => typeof t === 'object')
  const testimonial = typeof p.testimonial === 'object' ? p.testimonial : null
  const gallery = (p.gallery ?? []).map((m) => ({ media: m }))
  const plans = p.plans ?? []
  const cta = await closingCta()

  // Related: the ones picked in the CMS, otherwise other projects in the same sector.
  let related = (p.related ?? []).filter((r) => typeof r === 'object')
  if (related.length === 0 && sector) {
    const res = await payload.find({
      collection: 'projects',
      where: {
        and: [
          { 'workflow.status': { equals: 'published' } },
          { sector: { equals: sector.id } },
          { id: { not_equals: p.id } },
        ],
      },
      sort: 'createdAt',
      limit: 3,
      depth: 2,
      overrideAccess: false,
    })
    related = res.docs
  }

  const ld = schema.breadcrumb([
    { name: ui.home, url: SITE_URL },
    { name: ui.projects, url: `${SITE_URL}/work` },
    { name: title, url: `${SITE_URL}/work/${slug}` },
  ])
  return (
    <article>
      <JsonLd data={ld} />
      <Hero
        transitionHero
        block={{
          blockType: 'hero',
          eyebrow: sector?.title,
          headline: title,
          image: p.hero,
          size: 'banner',
          overlay: 40,
        }}
      />
      <div className="mx-auto max-w-[1600px] px-2 pt-4 md:px-4">
        <Breadcrumbs
          items={[
            { label: ui.home, href: '/' },
            { label: ui.projects, href: '/work' },
            { label: title },
          ]}
        />
      </div>
      {/* Location is the district label only, never an exact address (SPEC §5.2). */}
      <div className="mt-4">
        <FactStrip
          items={[
            { label: ui.filter.sector, value: sector?.title },
            { label: ui.case.location, value: p.areaLabel },
            { label: ui.case.year, value: p.year ? String(p.year) : null },
            {
              label: ui.case.area,
              value: p.approxAreaSqm ? `${String(p.approxAreaSqm)} m²` : null,
            },
          ]}
        />
      </div>

      {CHAPTERS.some((k) => p[k]) && (
        <section className={`${sectionPad} bg-ivory`}>
          <div className={`${container} max-w-4xl space-y-7`}>
            {CHAPTERS.map((key) => {
              const text = p[key]
              if (!text) return null
              return (
                <div key={key} className="reveal">
                  <h2 className="eyebrow">{ui.case.chapters[key]}</h2>
                  {paragraphs(text).map((para) => (
                    <p key={para} className="mt-2 text-pretty text-lg opacity-85 md:text-xl">
                      {para}
                    </p>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {p.beforeAfter && p.beforeAfter.length > 0 && (
        <section className={`${sectionPad} bg-sand`}>
          <div className={`${container} grid gap-4 md:grid-cols-2`}>
            <h2 className="sr-only">{ui.case.beforeAfter}</h2>
            {p.beforeAfter.map((ba, i) => (
              <BeforeAfter key={i} before={ba.before} after={ba.after} caption={ba.caption} />
            ))}
          </div>
        </section>
      )}

      {plans.length > 0 && (
        <section className={`${sectionPad} bg-ivory`}>
          <div className={`${container} space-y-5`}>
            <h2 className="eyebrow">{ui.case.plans}</h2>
            {plans.map((plan, i) => (
              <PlanHotspots
                key={i}
                plan={plan.image}
                hotspots={(plan.hotspots ?? []).map((h) => ({
                  x: h.x,
                  y: h.y,
                  label: h.label,
                  media: h.media,
                }))}
              />
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="bg-ivory px-2 pb-10 pt-5 md:px-4 md:pb-16">
          <div className={container}>
            <h2 className="sr-only">{ui.case.gallery}</h2>
            <Gallery items={gallery} />
          </div>
        </section>
      )}

      {testimonial && testimonial.permission?.given === true && (
        <section className={`${sectionPad} bg-sand`}>
          <div className={container}>
            <Testimonial
              quote={testimonial.quote}
              name={testimonial.attributionName}
              role={testimonial.attributionRole}
            />
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className={`${sectionPad} bg-ivory`}>
          <div className={container}>
            <h2 className="eyebrow">{ui.case.credits}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {team.map((t) => (
                <TeamCard
                  key={t.id}
                  name={t.name}
                  role={t.role}
                  photo={t.photo}
                  consentGiven={t.consent?.given === true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className={`${sectionPad} bg-sand`}>
          <div className={container}>
            <h2 className="eyebrow">{ui.case.related}</h2>
            <div className="mt-4 grid gap-2.5 md:grid-cols-3 md:gap-3">
              {related.map((r) => (
                <ProjectCard
                  key={r.id}
                  href={`/work/${r.slug}`}
                  title={r.publicTitle ?? r.title}
                  meta={[
                    typeof r.sector === 'object' ? r.sector?.title : null,
                    r.areaLabel,
                    r.year,
                  ]}
                  hero={r.hero}
                  frame="aspect-[4/3]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {cta && <CtaBand block={cta} />}
    </article>
  )
}
