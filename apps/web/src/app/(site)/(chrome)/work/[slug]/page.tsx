import { notFound } from 'next/navigation'
import { BeforeAfter } from '@/components/BeforeAfter'
import { CtaBand, Breadcrumbs, Prose, Testimonial, TeamCard } from '@/components/Structure'
import { FactStrip } from '@/components/FactStrip'
import { Gallery } from '@/components/Gallery'
import { PlanHotspots } from '@/components/PlanHotspots'
import { Picture } from '@/components/Picture'
import { ProjectCard } from '@/components/ProjectCard'
import { getPageBySlug } from '@/lib/cms'

export const dynamic = 'force-dynamic'

// Written chapters, in the order of SPEC §4 (brief → concept → materials → technical → delivery → result).
const CHAPTERS = [
  ['brief', 'Brief'],
  ['constraints', 'Constraints'],
  ['concept', 'Concept'],
  ['spacePlanning', 'Space planning'],
  ['materials', 'Materials'],
  ['joinery', 'Joinery'],
  ['technicalMep', 'Technical and MEP'],
  ['deliveryModel', 'Delivery'],
  ['timelineLabel', 'Timeline'],
  ['outcome', 'Result'],
] as const

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPageBySlug('projects', slug)
  if (!p) notFound()

  const title = p.publicTitle ?? p.title
  const sector = typeof p.sector === 'object' ? p.sector : null
  const team = (p.team ?? []).filter((t) => typeof t === 'object')
  const related = (p.related ?? []).filter((r) => typeof r === 'object')
  const testimonial = typeof p.testimonial === 'object' ? p.testimonial : null
  const gallery = (p.gallery ?? []).map((m) => ({ media: m }))
  const plans = p.plans ?? []

  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/work' },
          { label: title },
        ]}
      />
      <h1
        className="font-display text-ink mt-6 text-4xl md:text-5xl"
        style={{ viewTransitionName: `project-${p.slug}` }}
      >
        {title}
      </h1>
      <div className="mt-8">
        <Picture media={p.hero} priority sizes="100vw" className="w-full object-cover" />
      </div>
      {/* Location is the district label only, never an exact address (SPEC §5.2). */}
      <div className="mt-6">
        <FactStrip
          items={[
            { label: 'Location', value: p.areaLabel },
            { label: 'Year', value: String(p.year) },
            { label: 'Area', value: p.approxAreaSqm ? `${String(p.approxAreaSqm)} m²` : null },
          ]}
        />
      </div>

      <div className="mt-10 space-y-10">
        {CHAPTERS.map(([key, label]) => {
          const text = p[key]
          if (!text) return null
          return (
            <section key={key} aria-labelledby={`ch-${key}`}>
              <h2 id={`ch-${key}`} className="font-display text-ink text-2xl">
                {label}
              </h2>
              <Prose>
                <p>{text}</p>
              </Prose>
            </section>
          )
        })}
      </div>

      {p.beforeAfter && p.beforeAfter.length > 0 && (
        <section aria-labelledby="ba" className="mt-12 grid gap-8 md:grid-cols-2">
          <h2 id="ba" className="sr-only">
            Before and after
          </h2>
          {p.beforeAfter.map((ba, i) => (
            <BeforeAfter key={i} before={ba.before} after={ba.after} caption={ba.caption} />
          ))}
        </section>
      )}

      {plans.length > 0 && (
        <section aria-labelledby="plans" className="mt-12 space-y-8">
          <h2 id="plans" className="font-display text-ink text-2xl">
            Plans
          </h2>
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
        </section>
      )}

      {gallery.length > 0 && (
        <section aria-labelledby="gallery" className="mt-12">
          <h2 id="gallery" className="font-display text-ink text-2xl">
            Result
          </h2>
          <div className="mt-4">
            <Gallery items={gallery} />
          </div>
        </section>
      )}

      {testimonial && testimonial.permission?.given === true && (
        <div className="mt-12">
          <Testimonial
            quote={testimonial.quote}
            name={testimonial.attributionName}
            role={testimonial.attributionRole}
          />
        </div>
      )}

      {team.length > 0 && (
        <section aria-labelledby="credits" className="mt-12">
          <h2 id="credits" className="font-display text-ink text-2xl">
            Credits
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
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
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-12">
          <h2 id="related" className="font-display text-ink text-2xl">
            Related projects
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <ProjectCard
                key={r.id}
                href={`/work/${r.slug}`}
                title={r.publicTitle ?? r.title}
                areaLabel={r.areaLabel}
                year={r.year}
                hero={r.hero}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <CtaBand
          heading="Planning something similar?"
          href={sector ? `/start?sector=${encodeURIComponent(sector.slug)}` : '/start'}
          label="Start a project"
        />
      </div>
    </article>
  )
}
