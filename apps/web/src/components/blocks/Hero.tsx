import { getMotion } from '@/lib/motion'
import { Button } from '../Button'
import { HeroControls } from '../motion/HeroControls'
import { Picture } from '../Picture'
import { Split } from '../Split'
import { container, type BlockOf } from './shared'

/**
 * Full-bleed hero: image (or a slow slideshow on the home hero), dark overlay, large serif headline, subtext and up to
 * two calls to action. The first image is the LCP element and is visible immediately: only the text animates.
 */
export async function Hero({
  block,
  transitionHero = false,
}: {
  block: BlockOf<'hero'>
  /** Case-study hero: the project card image morphs into this one (View Transitions). */
  transitionHero?: boolean
}) {
  const full = (block.size ?? 'full') === 'full'
  const shade = Math.min(80, Math.max(0, block.overlay ?? 45)) / 100
  const motion = full ? await getMotion() : null
  const slideshow = !!motion?.fx.includes('heroSlideshow')
  const extra = slideshow ? (motion?.slides ?? []) : []
  const count = block.image && typeof block.image === 'object' ? 1 + extra.length : 0
  return (
    <section
      data-hero={full ? 'full' : 'banner'}
      className={`hero ${full ? 'hero--full' : 'hero--banner'}`}
      style={{ '--shade': String(shade) } as React.CSSProperties}
    >
      <div className="hero__media" data-vt-hero={transitionHero ? '' : undefined}>
        <div className="hero__slide" data-active="true">
          <Picture media={block.image} priority sizes="100vw" />
        </div>
        {extra.map((m) => (
          <div key={m.id} className="hero__slide" data-active="false">
            <Picture media={m} sizes="100vw" />
          </div>
        ))}
      </div>
      <div className="hero__shade" />
      <div className={`${container} w-full px-2 pb-11 pt-16 md:px-4 md:pb-12`}>
        {block.eyebrow && (
          <p className="eyebrow rise" style={{ '--d': 0 } as React.CSSProperties}>
            {block.eyebrow}
          </p>
        )}
        <h1
          className={`display hero-split mt-2.5 max-w-[18ch] text-balance ${
            full ? 'text-[clamp(2.75rem,7.4vw,6rem)]' : 'text-[clamp(2.5rem,6vw,4.75rem)]'
          }`}
        >
          <Split text={block.headline} />
        </h1>
        {block.subhead && (
          <p
            className="rise mt-3.5 max-w-2xl text-pretty text-lg text-white/85 md:text-xl"
            style={{ '--d': 650 } as React.CSSProperties}
          >
            {block.subhead}
          </p>
        )}
        {(block.primaryCta?.label || block.secondaryCta?.label) && (
          <div
            className="rise mt-5 flex flex-wrap gap-2"
            style={{ '--d': 850 } as React.CSSProperties}
          >
            <Button cta={block.primaryCta} tone="primary" />
            <Button cta={block.secondaryCta} tone="outline" />
          </div>
        )}
      </div>
      {full && <span className="scroll-cue" aria-hidden="true" />}
      {count > 1 && motion && <HeroControls count={count} seconds={motion.slideSeconds} />}
    </section>
  )
}
