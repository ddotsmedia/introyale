import { Button } from '../Button'
import { Picture } from '../Picture'
import { container, paragraphs, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Two columns: an image and text, on either side. */
export function ImageText({ block }: { block: BlockOf<'imageText'> }) {
  const left = block.imageSide === 'left'
  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={`${container} grid items-center gap-6 md:grid-cols-12 md:gap-10`}>
        <div className={`reveal md:col-span-6 ${left ? 'md:order-1' : 'md:order-2'}`}>
          <div className="bg-sand aspect-[4/5] overflow-hidden">
            <Picture
              media={block.image}
              sizes="(min-width: 960px) 46vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className={`reveal md:col-span-6 ${left ? 'md:order-2' : 'md:order-1'}`}>
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          {paragraphs(block.body).map((p) => (
            <p key={p} className="mt-3 max-w-xl text-pretty opacity-85">
              {p}
            </p>
          ))}
          <Button cta={block.cta} tone="dark" className="mt-5" />
        </div>
      </div>
    </section>
  )
}
