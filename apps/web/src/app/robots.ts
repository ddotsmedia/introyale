import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/** Staging is fully disallowed (ROBOTS_NOINDEX=true, SPEC §2.3). Production allows crawling and lists the sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.ROBOTS_NOINDEX === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
