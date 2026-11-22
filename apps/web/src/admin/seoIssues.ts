export type SeoDoc = {
  slug?: string
  updatedAt?: string
  title?: string
  seo?: { metaTitle?: string; metaDescription?: string; focusKeyword?: string; ogImage?: unknown }
}

/** Lightweight SEO checklist for the sidebar card (the full audit is the Content health view). */
export function seoIssues(d: SeoDoc): string[] {
  const out: string[] = []
  const t = d.seo?.metaTitle ?? ''
  const m = d.seo?.metaDescription ?? ''
  if (!t) out.push('Missing SEO title')
  else if (t.length > 60) out.push('SEO title is over 60 characters')
  if (!m) out.push('Missing SEO description')
  else if (m.length < 70 || m.length > 160)
    out.push('SEO description should be 70 to 160 characters')
  if (!d.seo?.ogImage) out.push('No social image')
  const kw = (d.seo?.focusKeyword ?? '').toLowerCase().trim()
  if (kw && !`${t} ${d.title ?? ''}`.toLowerCase().includes(kw))
    out.push('Focus keyword is not in the title')
  return out
}

export const seoScore = (issues: string[]): number => Math.max(0, 100 - issues.length * 20)
