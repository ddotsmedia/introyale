import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { pageMetadata } from '@/lib/seo'
import { globalBySlug, seoDefaults } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const [home, defaults] = await Promise.all([globalBySlug('home-page', 0), seoDefaults()])
  return pageMetadata({ seo: home.seo, fallbackTitle: defaults.siteName, path: '/' })
}

/** The home page is the `home-page` global: reorderable, hideable blocks edited in /admin. */
export default async function Home() {
  const home = await globalBySlug('home-page', 2)
  return <BlockRenderer layout={home.layout} />
}
