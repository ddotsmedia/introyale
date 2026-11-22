import Link from 'next/link'
import { ui } from '@/messages/en'
import { Picture, type MediaInput } from './Picture'

/** Image-led project card: the title sits on the image, with a slow hover zoom. Meta parts render only when known. */
export function ProjectCard({
  href,
  title,
  meta,
  hero,
  frame = 'aspect-[4/3]',
  sizes = '(min-width: 960px) 33vw, 100vw',
  viewTransitionName,
  className = '',
}: {
  href: string
  title: string
  meta?: (string | number | null | undefined)[]
  hero?: MediaInput
  /** Aspect or height classes for the image frame. */
  frame?: string
  sizes?: string
  /** Shared element name for the card to case study View Transition (M4). */
  viewTransitionName?: string
  className?: string
}) {
  const metaText = (meta ?? []).filter((m) => m !== null && m !== undefined && m !== '').join(' · ')
  return (
    <article className={className}>
      <Link
        href={href}
        data-cursor={ui.view}
        className="zoom group card-fx relative block overflow-hidden bg-sand"
      >
        <div className={`${frame} img-reveal w-full overflow-hidden`} data-vt-image>
          <Picture media={hero} sizes={sizes} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="card-text absolute inset-x-0 bottom-0 p-2.5 text-white md:p-3.5">
          {metaText && <p className="eyebrow !text-bronze-light">{metaText}</p>}
          <h3
            className="font-display mt-1 text-2xl leading-tight tracking-tight md:text-3xl"
            style={viewTransitionName ? { viewTransitionName } : undefined}
          >
            {title}
          </h3>
        </div>
      </Link>
    </article>
  )
}
