import { notFound } from 'next/navigation'
import {
  Breadcrumbs,
  CtaBand,
  Accordion,
  Prose,
  ProcessTimeline,
  Stepper,
  Testimonial,
  TeamCard,
} from '../../../../components/Structure'
import { BeforeAfter } from '../../../../components/BeforeAfter'
import { FactStrip } from '../../../../components/FactStrip'
import { FilterBar } from '../../../../components/FilterBar'
import { Gallery } from '../../../../components/Gallery'
import { Header } from '../../../../components/Header'
import { PlanHotspots } from '../../../../components/PlanHotspots'
import { ProjectCard } from '../../../../components/ProjectCard'
import { StickyActionBar } from '../../../../components/StickyActionBar'
import type { MediaLike } from '../../../../components/Picture'

// Neutral placeholder art (no business content). Used only in this dev-only showcase.
const swatch = (fill: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" font-size="48" text-anchor="middle" fill="#1F1D1A">${label}</text></svg>`,
  )}`

const img = (fill: string, label: string): MediaLike => ({
  url: swatch(fill, label),
  alt: `${label} placeholder`,
  width: 1200,
  height: 900,
})

const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Studio', href: '/studio' },
  { label: 'Start', href: '/start' },
]

function Showcase({ p }: { p: string }) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-2 py-5 md:px-3">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work' }, { label: 'Villa' }]}
      />
      <section aria-labelledby={`${p}-h-fact`}>
        <h2 id={`${p}-h-fact`} className="font-display text-3xl">
          Fact strip
        </h2>
        <FactStrip
          items={[
            { label: 'Area', value: 'Saadiyat' },
            { label: 'Year', value: '2025' },
            { label: 'Unverified', value: null },
          ]}
        />
      </section>
      <section aria-labelledby={`${p}-h-cards`}>
        <h2 id={`${p}-h-cards`} className="font-display text-3xl">
          Project card
        </h2>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <ProjectCard
            href="/work/sample"
            title="Sample project"
            meta={['District', 2025]}
            hero={img('#D9D2C7', 'Hero')}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-filter`}>
        <h2 id={`${p}-h-filter`} className="font-display text-3xl">
          Filter bar
        </h2>
        <div className="mt-2">
          <FilterBar
            basePath="/dev/components"
            current={{}}
            filters={[
              {
                name: 'sector',
                label: 'Sector',
                options: [
                  { value: 'residential', label: 'Residential' },
                  { value: 'commercial', label: 'Commercial' },
                ],
              },
            ]}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-gallery`}>
        <h2 id={`${p}-h-gallery`} className="font-display text-3xl">
          Gallery and lightbox
        </h2>
        <div className="mt-2">
          <Gallery
            items={[
              { media: img('#EFE8DD', 'One') },
              { media: img('#D9D2C7', 'Two') },
              { media: img('#EFE8DD', 'Three') },
            ]}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-ba`}>
        <h2 id={`${p}-h-ba`} className="font-display text-3xl">
          Before and after
        </h2>
        <div className="mt-2 max-w-3xl">
          <BeforeAfter
            before={img('#D9D2C7', 'Before')}
            after={img('#EFE8DD', 'After')}
            caption="Kitchen"
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-plan`}>
        <h2 id={`${p}-h-plan`} className="font-display text-3xl">
          Plan hotspots
        </h2>
        <div className="mt-2 max-w-3xl">
          <PlanHotspots
            plan={img('#EFE8DD', 'Plan')}
            hotspots={[
              { x: 30, y: 40, label: 'Entrance' },
              { x: 70, y: 60, label: 'Living room' },
            ]}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-acc`}>
        <h2 id={`${p}-h-acc`} className="font-display text-3xl">
          Accordion
        </h2>
        <div className="mt-2">
          <Accordion
            items={[
              {
                question: 'How long does a project take?',
                answer: 'Timelines are agreed per project.',
              },
            ]}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-step`}>
        <h2 id={`${p}-h-step`} className="font-display text-3xl">
          Stepper
        </h2>
        <div className="mt-2">
          <Stepper steps={['Project', 'Space', 'Budget', 'Contact']} current={1} />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-team`}>
        <h2 id={`${p}-h-team`} className="font-display text-3xl">
          Team card and testimonial
        </h2>
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <TeamCard
            name="Team member"
            role="Designer"
            photo={img('#D9D2C7', 'Photo')}
            consentGiven
          />
          <Testimonial quote="A calm, precise process." name="Client" role="Homeowner" />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-process`}>
        <h2 id={`${p}-h-process`} className="font-display text-3xl">
          Process timeline
        </h2>
        <div className="mt-2">
          <ProcessTimeline
            steps={[
              { title: 'Brief', text: 'We listen first.' },
              { title: 'Concept', text: 'Ideas on paper.' },
            ]}
          />
        </div>
      </section>
      <section aria-labelledby={`${p}-h-prose`}>
        <h2 id={`${p}-h-prose`} className="font-display text-3xl">
          Prose
        </h2>
        <Prose>
          <h2>Heading in prose</h2>
          <p>Body text sits on ivory with ink for contrast well above 4.5 to 1.</p>
        </Prose>
      </section>
      <CtaBand
        heading="Start a conversation"
        text="Tell us about your space."
        href="/start"
        label="Start a project"
      />
    </div>
  )
}

export default function ComponentsShowcase() {
  // Dev showcase: hidden in every deployed build; visible in the local/CI stack (ENV=local is never deployed).
  if (process.env.NODE_ENV === 'production' && process.env.ENV !== 'local') notFound()
  return (
    <main id="main">
      <Header brand="Introyale Interiors" nav={nav} />
      <h1 className="sr-only">Component showcase</h1>
      <section aria-labelledby="ltr-title">
        <h2 id="ltr-title" className="sr-only">
          Left to right
        </h2>
        <div dir="ltr" lang="en">
          <Showcase p="ltr" />
        </div>
      </section>
      <section aria-labelledby="rtl-title">
        <h2 id="rtl-title" className="sr-only">
          Right to left
        </h2>
        <div dir="rtl" lang="ar">
          <Showcase p="rtl" />
        </div>
      </section>
      <StickyActionBar
        callHref="tel:0"
        whatsappHref="https://wa.me/0"
        cta={{ label: 'Start', href: '/start' }}
      />
    </main>
  )
}
