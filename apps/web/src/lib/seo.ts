import type { Metadata } from 'next'

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
 * Page metadata from the CMS seo group, with fallbacks (SPEC §5.1, M9).
 * Titles are capped at 60 and descriptions at 160 characters by the collection schema.
 */
export function pageMetadata(p: {
  seo?: SeoFields
  fallbackTitle: string
  fallbackDescription?: string | null
  path: string
  image?: string | null
}): Metadata {
  const canonical = p.seo?.canonicalOverride || `${SITE_URL}${p.path}`
  const description = p.seo?.metaDescription || p.fallbackDescription || undefined
  const title = p.seo?.metaTitle || p.fallbackTitle
  return {
    title,
    description,
    alternates: { canonical },
    robots: p.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: p.image ? [{ url: p.image }] : undefined,
    },
  }
}
