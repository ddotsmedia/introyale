import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { StickyActionBar } from '@/components/StickyActionBar'
import { WebVitals } from '@/components/WebVitals'
import { Analytics } from '@/components/Analytics'
import { organization, website, localBusiness } from '@/lib/schema'
import { SITE_URL } from '@/lib/seo'
import { cms } from '@/lib/cms'
import { getMotion } from '@/lib/motion'
import { siteChrome } from '@/lib/site'
import { mediaSrc } from '@/components/Picture'
import { MotionLoader } from '@/components/motion/MotionLoader'

export const dynamic = 'force-dynamic'

/** Background image per menu link (sector heroes, the latest project for Work), for the mobile menu crossfade. */
async function menuImages(nav: { href: string }[]) {
  const payload = await cms()
  const [sectors, work] = await Promise.all([
    payload.find({
      collection: 'sectors',
      where: { 'workflow.status': { equals: 'published' } },
      limit: 12,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'projects',
      where: { 'workflow.status': { equals: 'published' } },
      limit: 1,
      depth: 1,
      overrideAccess: false,
    }),
  ])
  const bySlug = new Map(sectors.docs.map((s) => [`/${s.slug}`, s.hero]))
  const first = work.docs[0]?.hero
  return nav.map((n) => ({
    href: n.href,
    // Plain URLs only: passing whole media objects to the client menu would bloat every page's HTML.
    src: mediaSrc(bySlug.get(n.href) ?? (n.href === '/work' ? first : null), 768),
  }))
}

/** Public chrome: header, footer and mobile action bar. Everything shown comes from the CMS or verified facts. */
export default async function ChromeLayout({ children }: { children: ReactNode }) {
  const c = await siteChrome()
  const motion = await getMotion()
  const navImages = await menuImages(c.nav)
  const digits = c.phone ? c.phone.replace(/[^\d+]/g, '') : null

  // Site-wide structured data. LocalBusiness is emitted only with verified address and phone (SPEC §5.2).
  const ld = [
    organization({ name: c.brand, url: SITE_URL, email: c.email, telephone: c.phone }),
    website({ name: c.brand, url: SITE_URL }),
    localBusiness({ name: c.brand, url: SITE_URL, telephone: c.phone, address: c.address }),
  ]

  return (
    <div
      className="fx-root"
      data-fx={motion.fx.join(' ')}
      data-intensity={motion.intensity}
      data-motion={motion.on ? 'on' : 'off'}
    >
      <JsonLd data={ld} />
      <MotionLoader />
      <WebVitals />
      <Analytics />
      {c.banner ? (
        <div
          role="status"
          className={`px-2 py-1 text-center text-xs ${c.banner.tone === 'maintenance' ? 'bg-bronze-deep text-ivory' : 'bg-sand text-ink'}`}
        >
          {c.banner.message}
        </div>
      ) : null}
      <Header
        brand={c.brand}
        logo={c.logo}
        logoLight={c.footerLogo}
        nav={c.nav}
        cta={c.cta}
        phone={c.phone}
        whatsappHref={c.whatsappHref}
        menuImages={navImages}
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
        credit={c.credit}
      />
      <StickyActionBar
        callHref={digits ? `tel:${digits}` : null}
        whatsappHref={c.whatsappHref}
        cta={c.cta}
      />
    </div>
  )
}
