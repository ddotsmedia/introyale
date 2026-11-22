import Link from 'next/link'
import { balancedProjects } from '@/lib/site'
import { ProjectCard } from '../ProjectCard'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'
import type { Project } from '@/payload-types'

const SPANS = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7']

/**
 * Asymmetric grid of picked projects (or a balanced latest set when none are picked). With display "horizontal" it is the
 * "recent works" gallery: on wide screens vertical scrolling pins the section and moves the cards sideways with a
 * progress bar; on phones it is a swipeable snap carousel; without the effect it is a plain scrollable row.
 */
export async function FeaturedWork({ block }: { block: BlockOf<'featuredWork'> }) {
  const limit = block.limit ?? 5
  const picked = (block.projects ?? []).filter((p): p is Project => typeof p === 'object')
  const projects = picked.length > 0 ? picked.slice(0, limit) : await balancedProjects(limit)
  if (projects.length === 0) return null
  const header = (
    <div className="reveal flex flex-wrap items-end justify-between gap-3">
      <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
      {block.viewAll?.label && block.viewAll.href && (
        <Link href={block.viewAll.href} className="eyebrow border-b border-current pb-0.5">
          {block.viewAll.label}
        </Link>
      )}
    </div>
  )
  const meta = (p: Project) => [
    typeof p.sector === 'object' ? p.sector?.title : null,
    p.areaLabel,
    p.year,
  ]

  if (block.display === 'horizontal') {
    return (
      <section
        className="hg bg-ivory"
        style={{ '--n': projects.length } as React.CSSProperties}
        aria-label={block.heading ?? undefined}
      >
        <div className={`hg__pin ${sectionPad}`}>
          <div className={container}>{header}</div>
          <div className="hg__track" tabIndex={0}>
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                className="hg__card"
                href={`/work/${p.slug}`}
                title={p.publicTitle ?? p.title}
                meta={meta(p)}
                hero={p.hero}
                frame="h-[24rem] md:h-[min(56vh,34rem)]"
                sizes="(min-width: 960px) 40vw, 82vw"
              />
            ))}
          </div>
          <div className="hg__bar" aria-hidden="true">
            <span />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={container}>
        {header}
        <div className="mt-7 grid gap-2.5 md:grid-cols-12 md:gap-3">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              className={`reveal ${projects.length === 5 && i === 4 ? 'md:col-span-12' : (SPANS[i % SPANS.length] ?? 'md:col-span-6')}`}
              href={`/work/${p.slug}`}
              title={p.publicTitle ?? p.title}
              meta={meta(p)}
              hero={p.hero}
              frame="h-[22rem] md:h-[34rem]"
              sizes="(min-width: 960px) 58vw, 100vw"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
