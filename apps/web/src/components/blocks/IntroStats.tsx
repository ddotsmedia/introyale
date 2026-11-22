import { verifiedFact } from '@/lib/cms'
import { Button } from '../Button'
import { CountUp } from './CountUp'
import { container, paragraphs, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Intro copy with count-up stats. Each number is a verified fact; unverified facts render nothing (D13). */
export async function IntroStats({ block }: { block: BlockOf<'introStats'> }) {
  const stats = (
    await Promise.all(
      (block.stats ?? []).map(async (s) => ({
        label: s.label ?? '',
        value: await verifiedFact(s.factKey),
      })),
    )
  ).filter((s): s is { label: string; value: string } => !!s.value)
  return (
    <section className={`${sectionPad} bg-sand`}>
      <div className={`${container} grid gap-7 md:grid-cols-12 md:gap-10`}>
        <div className="reveal md:col-span-5">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          {paragraphs(block.body).map((p) => (
            <p key={p} className="mt-3 max-w-xl text-pretty opacity-85">
              {p}
            </p>
          ))}
          <Button cta={block.cta} tone="dark" className="mt-5" />
        </div>
        {stats.length > 0 && (
          <dl className="reveal grid grid-cols-2 gap-x-4 gap-y-6 md:col-span-7 md:pt-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="border-ink/15 flex flex-col-reverse justify-end gap-2 border-t pt-3"
              >
                <dt className="eyebrow">{s.label}</dt>
                <dd className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-tight">
                  <CountUp value={s.value} />
                  <span className="stat-line" aria-hidden="true" />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
