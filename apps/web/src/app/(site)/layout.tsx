import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../styles/globals.css'
import { fraunces, inter, plexArabic } from '../../lib/fonts'

export const metadata: Metadata = {
  title: { default: 'Introyale Interiors', template: '%s · Introyale Interiors' },
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
