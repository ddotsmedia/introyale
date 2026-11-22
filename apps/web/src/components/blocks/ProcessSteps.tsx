import { container, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Numbered steps, on a dark or light background. */
export function ProcessSteps({ block }: { block: BlockOf<'processSteps'> }) {
  const steps = block.steps ?? []
  if (steps.length === 0) return null
  const dark = (block.tone ?? 'dark') === 'dark'
  return (
    <section className={`${sectionPad} ${dark ? 'bg-night text-ivory on-dark' : 'bg-ivory'}`}>
      <div className={container}>
        <SectionHeading
          className="reveal"
          eyebrow={block.eyebrow}
          heading={block.heading}
          intro={block.intro}
        />
        <ol className="mt-8 grid gap-x-6 gap-y-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.id ?? s.title}
              className="step reveal border-current/20 relative border-t pt-4"
              style={{ borderColor: 'color-mix(in srgb, currentColor 22%, transparent)' }}
            >
              <svg
                className="step-line"
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line x1="0" y1="1" x2="100" y2="1" pathLength="1" />
              </svg>
              <span
                className={`step-n font-display block ${dark ? 'text-bronze-light' : 'text-bronze-deep'} text-6xl leading-none tracking-tight`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-3 text-2xl tracking-tight md:text-[1.75rem]">
                {s.title}
              </h3>
              {s.body && (
                <p className="mt-2 text-pretty text-base opacity-75 md:text-[1.0625rem]">
                  {s.body}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
