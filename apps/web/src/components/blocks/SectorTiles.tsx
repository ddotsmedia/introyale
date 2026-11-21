import Link from 'next/link'
import { cms } from '@/lib/cms'
import { ui } from '@/messages/en'
import { Picture } from '../Picture'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'
import type { Sector } from '@/payload-types'

/** Tall sector tiles with a slow image zoom. Picked sectors, or every published sector when none are picked. */
export async function SectorTiles({ block }: { block: BlockOf<'sectorTiles'> }) {
  const picked = (block.sectors ?? []).filter((s): s is Sector => typeof s === 'object')
  let sectors = picked
  if (sectors.length === 0) {
    const payload = await cms()
    const res = await payload.find({
      collection: 'sectors',
      where: { 'workflow.status': { equals: 'published' } },
      sort: 'createdAt',
      limit: 12,
      depth: 1,
      overrideAccess: false,
    })
    sectors = res.docs
  }
  if (sectors.length === 0) return null
  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={container}>
        <SectionHeading
          className="reveal"
          eyebrow={block.eyebrow}
          heading={block.heading}
          intro={block.intro}
        />
        <ul className="mt-7 grid gap-2.5 md:grid-cols-3 md:gap-3">
          {sectors.map((s) => (
            <li key={s.id} className="reveal">
              <Link
                href={`/${s.slug}`}
                className="zoom group relative block overflow-hidden bg-night"
              >
                <div className="aspect-[3/4] w-full">
                  <Picture
                    media={s.hero}
                    sizes="(min-width: 960px) 33vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white md:p-4.5">
                  <h3 className="display text-[clamp(2rem,3vw,2.75rem)]">{s.title}</h3>
                  <p className="eyebrow !text-bronze-light mt-2">{ui.explore}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
