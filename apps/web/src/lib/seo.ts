import type { Metadata } from 'next'
import { seoDefaults } from './site'

export const SITE_URL = (process.env.PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export type SeoFields =
  | {
      metaTitle?: string | null
      metaDescription?: string | null
      canonicalOverride?: string | null
      noindex?: boolean | null
    }
  | null
  | undefined

/**
 * Page metadata from the CMS seo group, with fallbacks to the SEO defaults global (SPEC §5.1).
 * Titles are capped at 60 and descriptions at 160 characters by the collection schema.
 */
export async function pageMetadata(p: {
  seo?: SeoFields
  fallbackTitle: string
  fallbackDescription?: string | null
  path: string
  image?: string | null
}): Promise<Metadata> {
  const defaults = await seoDefaults()
  const canonical = p.seo?.canonicalOverride || `${SITE_URL}${p.path}`
  const description =
    p.seo?.metaDescription || p.fallbackDescription || defaults.description || undefined
  const title = p.seo?.metaTitle || p.fallbackTitle
  return {
    title,
    description,
    alternates: { canonical },
    // Staging (ROBOTS_NOINDEX=true) and CMS noindex both win. Omitted otherwise so the layout default applies.
    ...(p.seo?.noindex || process.env.ROBOTS_NOINDEX === 'true'
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      images: p.image ? [{ url: p.image }] : undefined,
    },
  }
}
