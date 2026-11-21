import Link from 'next/link'
import { cms } from '@/lib/cms'
import { Picture } from '../Picture'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'
import type { Client } from '@/payload-types'

/** Logo wall: grayscale until hover. Logos only; client names never render (D13). */
export async function ClientWall({ block }: { block: BlockOf<'clientWall'> }) {
  const limit = block.limit ?? 12
  const picked = (block.clients ?? []).filter((c): c is Client => typeof c === 'object')
  let clients = picked.filter((c) => c.logoPermission === true)
  if (clients.length === 0) {
    const payload = await cms()
    const res = await payload.find({
      collection: 'clients',
      where: { logoPermission: { equals: true } },
      sort: 'order',
      limit,
      depth: 1,
      overrideAccess: false,
    })
    clients = res.docs
  }
  clients = clients.slice(0, limit)
  if (clients.length === 0) return null
  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={container}>
        <div className="reveal flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          {block.viewAll?.label && block.viewAll.href && (
            <Link href={block.viewAll.href} className="eyebrow border-b border-current pb-0.5">
              {block.viewAll.label}
            </Link>
          )}
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 md:gap-2 xl:grid-cols-6">
          {clients.map((c) => (
            <li
              key={c.id}
              className="logo-tile reveal border-travertine grid aspect-[7/3] place-items-center border bg-white p-2"
            >
              <Picture
                media={c.logo}
                sizes="(min-width: 1280px) 16vw, 45vw"
                className="max-h-full w-auto max-w-full object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
