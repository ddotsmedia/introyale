'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ui } from '@/messages/en'
import { MobileNav } from './MobileNav'
import { Picture, type MediaInput } from './Picture'

export type NavItem = { label: string; href: string }
export type HeaderProps = {
  brand: string
  logo?: MediaInput
  logoLight?: MediaInput
  nav: NavItem[]
  cta?: { label: string; href: string } | null
  phone?: string | null
  whatsappHref?: string | null
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-2.5 w-2.5 fill-current">
    <path d={d} />
  </svg>
)
const PHONE =
  'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z'
const WHATSAPP =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.46-.72-1.7-.8-.22-.08-.4-.12-.56.13-.16.24-.64.8-.78.96-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.42-.56-.42h-.48c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.1 3.64 1.5.65 2.1.7 2.86.6.46-.07 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28z'

/** Fixed header: transparent over a hero, solid once the page scrolls. Content comes from CMS props. */
export function Header({ brand, logo, logoLight, nav, cta, phone, whatsappHref }: HeaderProps) {
  const [top, setTop] = useState(true)
  const pathname = usePathname()

  // Hydration marker: lets tests and assistive diagnostics know client handlers are bound.
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])
  useEffect(() => {
    const onScroll = () => {
      setTop(window.scrollY < 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable bg-ink text-ivory fixed start-1 top-1 z-50 px-2 py-1"
      >
        {ui.skip}
      </a>
      <header className="site-header" data-top={top}>
        <div className="mx-auto flex h-[4.5rem] max-w-[1600px] items-center justify-between gap-3 px-2 md:px-4">
          <Link href="/" aria-label={brand} className="flex shrink-0 items-center">
            {logo ? (
              <>
                <Picture media={logo} sizes="160px" className="logo-gold h-5.5 w-auto" />
                <Picture
                  media={logoLight ?? logo}
                  sizes="160px"
                  className="logo-white h-5.5 w-auto"
                />
              </>
            ) : (
              <span className="font-display text-xl">{brand}</span>
            )}
          </Link>
          <nav aria-label={ui.primaryNav} className="hidden lg:block">
            <ul className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.1em]">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav-link"
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                aria-label={`${ui.call} ${phone}`}
                className="flex items-center gap-1 text-sm font-semibold"
              >
                <Icon d={PHONE} />
                <span className="hidden xl:inline">{phone}</span>
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} aria-label={ui.whatsapp} className="flex items-center">
                <Icon d={WHATSAPP} />
              </a>
            )}
            {cta && (
              <Link
                href={cta.href}
                className="bg-bronze-deep hover:bg-ink inline-flex min-h-5.5 items-center px-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors"
              >
                {cta.label}
              </Link>
            )}
          </div>
          <MobileNav
            items={nav}
            cta={cta ?? null}
            phone={phone ?? null}
            whatsappHref={whatsappHref ?? null}
          />
        </div>
      </header>
    </>
  )
}
