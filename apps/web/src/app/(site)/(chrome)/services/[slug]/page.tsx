import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { Hero } from '@/components/blocks/Hero'
import { container, sectionPad } from '@/components/blocks/shared'
import { JsonLd } from '@/components/JsonLd'
import { Accordion } from '@/components/Structure'
import { getPageBySlug } from '@/lib/cms'
import * as schema from '@/lib/schema'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import { seoDefaults } from '@/lib/site'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = await getPageBySlug('services', slug)
  if (!doc) return {}
  return pageMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: doc.summary,
    path: `/services/${slug}`,
  })
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [doc, defaults] = await Promise.all([getPageBySlug('services', slug), seoDefaults()])
  if (!doc) notFound()
  const faqs = (doc.faqs ?? []).filter((f) => typeof f === 'object')
  const sector = typeof doc.sector === 'object' ? doc.sector : null
  const ld = [
    schema.service({
      name: doc.title,
      description: doc.summary ?? null,
      url: `${SITE_URL}/services/${slug}`,
      providerName: defaults.siteName,
    }),
    schema.breadcrumb([
      { name: ui.home, url: SITE_URL },
      { name: ui.services, url: `${SITE_URL}/services` },
      { name: doc.title, url: `${SITE_URL}/services/${slug}` },
    ]),
    schema.faqPage(
      faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        eligible: f.eligibleForSchema === true,
      })),
    ),
  ]
  return (
    <>
      <JsonLd data={ld} />
      <Hero
        block={{
          blockType: 'hero',
          eyebrow: sector?.title,
          headline: doc.title,
          subhead: doc.summary,
          image: doc.image ?? sector?.hero,
          size: 'banner',
          overlay: 50,
        }}
      />
      {faqs.length > 0 && (
        <section className={`${sectionPad} bg-ivory`}>
          <div className={`${container} max-w-4xl`}>
            <h2 className="display text-[clamp(2rem,4vw,3rem)]">{ui.faq}</h2>
            <div className="mt-5">
              <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
            </div>
          </div>
        </section>
      )}
      <BlockRenderer layout={doc.layout} />
    </>
  )
}
