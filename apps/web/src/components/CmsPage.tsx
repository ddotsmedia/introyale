import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'
import { BlockRenderer } from './blocks/BlockRenderer'
import { paragraphs } from './blocks/shared'
import { Breadcrumbs } from './Structure'
import { ui } from '@/messages/en'

/** Metadata for a CMS page, from its seo group. */
export async function cmsPageMetadata(slug: string, path: string): Promise<Metadata> {
  const page = await getPageBySlug('pages', slug)
  if (!page) return {}
  return pageMetadata({
    seo: page.seo,
    fallbackTitle: page.title,
    fallbackDescription: page.intro,
    path,
  })
}

/**
 * A page made of CMS blocks. Pages without blocks (such as legal text) fall back to a plain title and body.
 * No published document gives a 404, never placeholder text.
 */
export async function CmsPage({ slug, sector }: { slug: string; sector?: string }) {
  const page = await getPageBySlug('pages', slug)
  if (!page) notFound()
  if ((page.layout ?? []).length > 0) return <BlockRenderer layout={page.layout} sector={sector} />
  return (
    <article className="mx-auto max-w-[1100px] px-2 py-8 md:px-4 md:py-14">
      <Breadcrumbs items={[{ label: ui.home, href: '/' }, { label: page.title }]} />
      <h1 className="display mt-4 text-[clamp(2.5rem,5vw,4rem)]">{page.title}</h1>
      <div className="mt-5 max-w-3xl space-y-3 text-pretty opacity-90">
        {paragraphs(page.body).map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </article>
  )
}
