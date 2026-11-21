import { container, paragraphs, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Heading with body paragraphs in one or two columns. */
export function TextSection({ block }: { block: BlockOf<'textSection'> }) {
  const body = paragraphs(block.body)
  const twoCol = block.columns === '2'
  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={`${container} reveal`}>
        <SectionHeading eyebrow={block.eyebrow} heading={block.heading} className="max-w-4xl" />
        {body.length > 0 && (
          <div className={`mt-5 gap-x-8 ${twoCol ? 'md:columns-2' : 'max-w-3xl'}`}>
            {body.map((p) => (
              <p key={p} className="mb-3 break-inside-avoid text-pretty opacity-85">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
