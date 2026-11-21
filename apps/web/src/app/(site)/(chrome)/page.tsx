import Link from 'next/link'
import { CtaBand, Testimonial } from '@/components/Structure'
import { FactStrip } from '@/components/FactStrip'
import { Picture } from '@/components/Picture'
import { ProjectCard } from '@/components/ProjectCard'
import { getPageBySlug, listPublished, verifiedFact } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [page, projects, sectors, testimonials, years, projectsDone, team, awards] =
    await Promise.all([
      getPageBySlug('pages', 'home'),
      listPublished('projects', 3),
      listPublished('sectors', 3),
      listPublished('testimonials', 2),
      verifiedFact('years_in_business'),
      verifiedFact('projects_completed'),
      verifiedFact('team_size'),
      verifiedFact('awards_count'),
    ])
  const featured = projects[0]

  return (
    <>
      <section className="relative">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-ink text-4xl md:text-5xl">{page?.title ?? ''}</h1>
            {page?.intro && <p className="text-ink/90 mt-4 max-w-prose text-lg">{page.intro}</p>}
            <Link
              href="/start"
              className="bg-ink text-ivory mt-8 inline-flex min-h-11 w-fit items-center px-6 py-3"
            >
              Start a project
            </Link>
          </div>
          <div className="bg-sand aspect-[4/5] overflow-hidden">
            <Picture
              media={page?.hero}
              priority
              sizes="(min-width: 960px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <FactStrip
        items={[
          { label: 'Years in business', value: years },
          { label: 'Projects completed', value: projectsDone },
          { label: 'Team', value: team },
          { label: 'Awards', value: awards },
        ]}
      />

      {projects.length > 0 && (
        <section aria-labelledby="work" className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
          <div className="flex items-end justify-between">
            <h2 id="work" className="font-display text-ink text-3xl">
              Selected work
            </h2>
            <Link href="/work" className="underline">
              All projects
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
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
        </section>
      )}

      {sectors.length > 0 && (
        <section aria-labelledby="sectors" className="bg-sand px-4 py-12 md:px-6">
          <div className="mx-auto max-w-[1440px]">
            <h2 id="sectors" className="font-display text-ink text-3xl">
              Sectors
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {sectors.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.slug}`}
                    className="border-bronze text-ink block border-s-2 ps-4 text-lg"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="process" className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
        <h2 id="process" className="font-display text-ink text-3xl">
          Our process
        </h2>
        <Link href="/process" className="mt-2 inline-block underline">
          See how a project runs
        </Link>
      </section>

      {featured && (
        <section aria-labelledby="featured" className="mx-auto max-w-[1440px] px-4 pb-12 md:px-6">
          <h2 id="featured" className="font-display text-ink text-3xl">
            Featured case
          </h2>
          <div className="mt-4 max-w-md">
            <ProjectCard
              href={`/work/${featured.slug}`}
              title={featured.publicTitle ?? featured.title}
              areaLabel={featured.areaLabel}
              year={featured.year}
              hero={featured.hero}
            />
          </div>
        </section>
      )}

      <section aria-labelledby="studio" className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
        <h2 id="studio" className="font-display text-ink text-3xl">
          The studio
        </h2>
        <Link href="/studio" className="mt-2 inline-block underline">
          Meet the studio
        </Link>
      </section>

      {testimonials.length > 0 && (
        <section
          aria-labelledby="testimonials"
          className="mx-auto max-w-[1440px] space-y-10 px-4 py-12 md:px-6"
        >
          <h2 id="testimonials" className="sr-only">
            Testimonials
          </h2>
          {testimonials.map((t) => (
            <Testimonial
              key={t.id}
              quote={t.quote}
              name={t.attributionName}
              role={t.attributionRole}
            />
          ))}
        </section>
      )}

      <CtaBand
        heading="Tell us about your space"
        text="A short brief is enough to begin."
        href="/start"
        label="Start a project"
      />
    </>
  )
}
