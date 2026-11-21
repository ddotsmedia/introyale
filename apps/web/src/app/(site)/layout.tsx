import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../styles/globals.css'
import { fraunces, inter, plexArabic } from '../../lib/fonts'
import { SITE_DESCRIPTION } from '../../lib/seo'

export const metadata: Metadata = {
  title: { default: 'Introyale Interiors', template: '%s · Introyale Interiors' },
  description: SITE_DESCRIPTION,
  // Staging is fully noindex (SPEC §2.3): robots.txt, X-Robots-Tag and this meta all agree.
  robots: process.env.ROBOTS_NOINDEX === 'true' ? { index: false, follow: false } : undefined,
}

// Locale and direction come from the route (M5). English is the only live locale at launch (D15).
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${fraunces.variable} ${inter.variable} ${plexArabic.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
