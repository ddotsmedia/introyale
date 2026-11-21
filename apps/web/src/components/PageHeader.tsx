import { Picture, type MediaInput } from './Picture'
import { container } from './blocks/shared'

/** Compact dark page header for index and utility pages. The header bar stays transparent over it. */
export function PageHeader({
  title,
  eyebrow,
  intro,
  image,
}: {
  title: string
  eyebrow?: string | null
  intro?: string | null
  image?: MediaInput
}) {
  return (
    <section
      data-hero="compact"
      className="hero hero--compact"
      style={{ '--shade': '0.55' } as React.CSSProperties}
    >
      {image && (
        <div className="hero__media">
          <Picture media={image} priority sizes="100vw" />
        </div>
      )}
      <div className="hero__shade" />
      <div className={`${container} w-full px-2 pb-6 pt-16 md:px-4 md:pb-8`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display mt-2 max-w-[20ch] text-balance text-[clamp(2.25rem,5vw,4rem)]">
          {title}
        </h1>
        {intro && <p className="mt-2.5 max-w-2xl text-pretty text-lg text-white/85">{intro}</p>}
      </div>
    </section>
  )
}
