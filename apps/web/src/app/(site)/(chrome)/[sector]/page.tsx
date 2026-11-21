import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { Hero } from '@/components/blocks/Hero'
import { JsonLd } from '@/components/JsonLd'
import { getPageBySlug } from '@/lib/cms'
import * as schema from '@/lib/schema'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

// Dedicated routes (/work, /studio, ...) win over this one, so any other single segment is a sector
// only when a published sector with that slug exists in the CMS. Otherwise it is a 404.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sector: string }>
}): Promise<Metadata> {
  const { sector } = await params
  const doc = await getPageBySlug('sectors', sector)
  if (!doc) return {}
  return pageMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: doc.intro,
    path: `/${sector}`,
  })
}

export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params
  const doc = await getPageBySlug('sectors', sector)
  if (!doc) notFound()
  const ld = schema.breadcrumb([
    { name: ui.home, url: SITE_URL },
    { name: doc.title, url: `${SITE_URL}/${sector}` },
  ])
  return (
    <>
      <JsonLd data={ld} />
      {(doc.layout ?? []).length > 0 ? (
        <BlockRenderer layout={doc.layout} sector={sector} />
      ) : (
        <Hero
          block={{
            blockType: 'hero',
            headline: doc.title,
            subhead: doc.intro,
            image: doc.hero,
            size: 'banner',
          }}
        />
      )}
    </>
  )
}
