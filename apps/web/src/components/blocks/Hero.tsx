import { Button } from '../Button'
import { Picture } from '../Picture'
import { container, type BlockOf } from './shared'

/** Full-bleed hero: image, dark overlay, large serif headline and up to two calls to action. */
export function Hero({ block }: { block: BlockOf<'hero'> }) {
  const full = (block.size ?? 'full') === 'full'
  const shade = Math.min(80, Math.max(0, block.overlay ?? 45)) / 100
  return (
    <section
      data-hero={full ? 'full' : 'banner'}
      className={`hero ${full ? 'hero--full' : 'hero--banner'}`}
      style={{ '--shade': String(shade) } as React.CSSProperties}
    >
      <div className="hero__media">
        <Picture media={block.image} priority sizes="100vw" />
      </div>
      <div className="hero__shade" />
      <div className={`${container} w-full px-2 pb-11 pt-16 md:px-4 md:pb-12`}>
        {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
        <h1
          className={`display mt-2.5 max-w-[18ch] text-balance ${
            full ? 'text-[clamp(2.75rem,7.4vw,6rem)]' : 'text-[clamp(2.5rem,6vw,4.75rem)]'
          }`}
        >
          {block.headline}
        </h1>
        {block.subhead && (
          <p className="mt-3.5 max-w-2xl text-pretty text-lg text-white/85 md:text-xl">
            {block.subhead}
          </p>
        )}
        {(block.primaryCta?.label || block.secondaryCta?.label) && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button cta={block.primaryCta} tone="primary" />
            <Button cta={block.secondaryCta} tone="outline" />
          </div>
        )}
      </div>
    </section>
  )
}
