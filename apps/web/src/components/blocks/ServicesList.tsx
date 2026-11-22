import Link from 'next/link'
import { cms } from '@/lib/cms'
import { mediaSrc, Picture } from '../Picture'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'
import type { Service } from '@/payload-types'

/** Numbered services list. On wide screens the hovered row swaps the preview image (CSS only). */
export async function ServicesList({ block }: { block: BlockOf<'servicesList'> }) {
  const picked = (block.services ?? []).filter((s): s is Service => typeof s === 'object')
  let services = picked
  if (services.length === 0) {
    const payload = await cms()
    const res = await payload.find({
      collection: 'services',
      where: { 'workflow.status': { equals: 'published' } },
      sort: 'createdAt',
      limit: block.viewAll?.href ? 8 : 40, // a "see all" link means this is a short preview
      depth: 1,
      overrideAccess: false,
    })
    services = res.docs
  }
  if (services.length === 0) return null
  return (
    <section className={`${sectionPad} bg-sand`}>
      <div className={container}>
        <div className="reveal flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          {block.viewAll?.label && block.viewAll.href && (
            <Link href={block.viewAll.href} className="eyebrow border-b border-current pb-0.5">
              {block.viewAll.label}
            </Link>
          )}
        </div>
        <div className="svc mt-7 grid gap-6 md:grid-cols-12 md:gap-8">
          <ol className="md:col-span-7">
            {services.map((s, i) => (
              <li
                key={s.id}
                data-float-src={mediaSrc(s.image, 480) ?? undefined}
                className="border-ink/15 border-t first:border-t-0 md:first:border-t"
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid grid-cols-[3rem_1fr] items-baseline gap-2 py-3 transition-colors hover:text-bronze-deep md:py-3.5"
                >
                  <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="font-display block text-2xl leading-tight tracking-tight md:text-[2rem]">
                      {s.title}
                    </span>
                    {s.summary && (
                      <span className="mt-1 line-clamp-2 block max-w-xl text-base opacity-70">
                        {s.summary}
                      </span>
                    )}
                    {/* Phones: an inline thumbnail instead of the hover preview. */}
                    <span
                      className="mt-2 block h-14 w-24 overflow-hidden md:hidden"
                      aria-hidden="true"
                    >
                      <Picture
                        media={s.image}
                        sizes="96px"
                        className="h-full w-full object-cover"
                      />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="relative hidden md:col-span-5 md:block" aria-hidden="true">
            <div className="svc-panel bg-night sticky top-14 aspect-[4/5] overflow-hidden">
              {services.map((s) => (
                <div key={s.id}>
                  <Picture media={s.image} sizes="40vw" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
