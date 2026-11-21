import Link from 'next/link'
import { Picture, type MediaInput } from './Picture'

export function ProjectCard({
  href,
  title,
  areaLabel,
  year,
  hero,
  viewTransitionName,
}: {
  href: string
  title: string
  areaLabel?: string | null
  year?: number | null
  hero?: MediaInput
  /** Shared element name for the card → case study View Transition (M4). */
  viewTransitionName?: string
}) {
  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="bg-sand aspect-[4/3] overflow-hidden">
          <Picture
            media={hero}
            sizes="(min-width: 960px) 33vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <h3
          className="font-display text-ink mt-2 text-xl"
          style={viewTransitionName ? { viewTransitionName } : undefined}
        >
          {title}
        </h3>
        <p className="text-taupe text-sm">{[areaLabel, year].filter(Boolean).join(' · ')}</p>
      </Link>
    </article>
  )
}
