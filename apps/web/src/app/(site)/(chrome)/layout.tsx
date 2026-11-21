import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { StickyActionBar } from '@/components/StickyActionBar'
import { WebVitals } from '@/components/WebVitals'
import { organization, website, localBusiness } from '@/lib/schema'
import { SITE_URL } from '@/lib/seo'
import { siteChrome } from '@/lib/site'

export const dynamic = 'force-dynamic'

/** Public chrome: header, footer and mobile action bar. Everything shown comes from the CMS or verified facts. */
export default async function ChromeLayout({ children }: { children: ReactNode }) {
  const c = await siteChrome()
  const digits = c.phone ? c.phone.replace(/[^\d+]/g, '') : null

  // Site-wide structured data. LocalBusiness is emitted only with verified address and phone (SPEC §5.2).
  const ld = [
    organization({ name: c.brand, url: SITE_URL, email: c.email, telephone: c.phone }),
    website({ name: c.brand, url: SITE_URL }),
    localBusiness({ name: c.brand, url: SITE_URL, telephone: c.phone, address: c.address }),
  ]

  return (
    <>
      <JsonLd data={ld} />
      <WebVitals />
      <Header
        brand={c.brand}
        logo={c.logo}
        logoLight={c.footerLogo}
        nav={c.nav}
        cta={c.cta}
        phone={c.phone}
        whatsappHref={c.whatsappHref}
      />
      <main id="main" className="pb-14 md:pb-0">
        {children}
      </main>
      <Footer
        brand={c.brand}
        logo={c.footerLogo}
        tagline={c.tagline}
        copy={c.footerCopy}
        columns={c.footerColumns}
        legal={c.legal}
        address={c.address}
        phone={c.phone}
        whatsappHref={c.whatsappHref}
        email={c.email}
        social={c.social}
      />
      <StickyActionBar
        callHref={digits ? `tel:${digits}` : null}
        whatsappHref={c.whatsappHref}
        cta={c.cta}
      />
    </>
  )
}
