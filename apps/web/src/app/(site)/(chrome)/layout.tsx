import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header, type NavItem } from '@/components/Header'
import { StickyActionBar } from '@/components/StickyActionBar'
import { globalDoc, verifiedFact } from '@/lib/cms'
import { publishedPostCount } from '@/lib/journal'
import { JsonLd } from '@/components/JsonLd'
import { WebVitals } from '@/components/WebVitals'
import { organization, website, localBusiness } from '@/lib/schema'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

function displayName(value: unknown): string {
  return typeof value === 'string' && value.trim() !== '' ? value : 'Introyale Interiors'
}

/** Public chrome: header, footer and mobile action bar. Everything shown comes from the CMS or verified facts. */
export default async function ChromeLayout({ children }: { children: ReactNode }) {
  const [nav, settings, footer, address, phone, email, journalCount] = await Promise.all([
    globalDoc('navigation'),
    globalDoc('site-settings'),
    globalDoc('footer'),
    verifiedFact('address'),
    verifiedFact('phone'),
    verifiedFact('email'),
    publishedPostCount(),
  ])
  // Journal stays out of navigation until three articles are published (SPEC C15).
  const items: NavItem[] = (nav.items ?? [])
    .filter((i) => i.label && i.link)
    .filter((i) => journalCount >= 3 || !i.link.startsWith('/journal'))
    .map((i) => ({ label: i.label, href: i.link }))
  // The global may be unsaved, so its name can be missing at runtime.
  const brand = displayName(settings.name)
  const digits = phone ? phone.replace(/[^\d]/g, '') : null

  // Site-wide structured data. LocalBusiness is emitted only with verified address and phone (SPEC §5.2).
  const ld = [
    organization({ name: brand, url: SITE_URL, email, telephone: phone }),
    website({ name: brand, url: SITE_URL }),
    localBusiness({ name: brand, url: SITE_URL, telephone: phone, address }),
  ]

  return (
    <>
      <JsonLd data={ld} />
      <WebVitals />
      <Header brand={brand} nav={items} />
      <main id="main" className="pb-16 md:pb-0">
        {children}
      </main>
      <Footer
        brand={brand}
        copy={footer.copy ?? null}
        links={(footer.links ?? []).flatMap((l) =>
          l.label && l.link ? [{ label: l.label, href: l.link }] : [],
        )}
        address={address}
        phone={phone}
        email={email}
      />
      <StickyActionBar
        callHref={phone ? `tel:${phone.replace(/\s/g, '')}` : null}
        whatsappHref={digits ? `https://wa.me/${digits}` : null}
        startHref="/start"
      />
    </>
  )
}
