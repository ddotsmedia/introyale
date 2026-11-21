import type { Metadata } from 'next'

export const SITE_DESCRIPTION =
  'Introyale Interiors is an interior design studio. Browse our projects and start a conversation.'

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
  const description = p.seo?.metaDescription || p.fallbackDescription || SITE_DESCRIPTION
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
