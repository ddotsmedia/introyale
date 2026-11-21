import { Button } from '../Button'
import { Picture } from '../Picture'
import { container, type BlockOf } from './shared'

/** Full-width call-to-action band over an image (or solid dark when there is no image). */
export function CtaBand({ block }: { block: BlockOf<'ctaBand'> }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white on-dark">
      {block.image && (
        <div className="absolute inset-0 -z-10">
          <Picture media={block.image} sizes="100vw" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className={`${container} reveal px-2 py-12 md:px-4 md:py-20`}>
        <h2 className="display max-w-[20ch] text-balance text-[clamp(2.25rem,5.2vw,4.5rem)]">
          {block.heading}
        </h2>
        {block.text && <p className="mt-3 max-w-xl text-lg text-white/85">{block.text}</p>}
        <Button cta={block.button} tone="primary" className="mt-5" />
      </div>
    </section>
  )
}
