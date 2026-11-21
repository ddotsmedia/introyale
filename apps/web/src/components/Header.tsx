'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MobileNav } from './MobileNav'

export type NavItem = { label: string; href: string }

/** Sticky header that hides on scroll down and returns on scroll up (M4). */
export function Header({ brand, nav }: { brand: string; nav: NavItem[] }) {
  const [hidden, setHidden] = useState(false)

  // Hydration marker: lets tests (and assistive tech diagnostics) know client handlers are bound.
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y > 120 && y > last + 8) setHidden(true)
      else if (y < last - 8 || y < 120) setHidden(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable bg-ink text-ivory fixed start-2 top-2 z-50 px-4 py-2"
      >
        Skip to content
      </a>
      <header
        data-hidden={hidden}
        className={`bg-ivory border-travertine sticky top-0 z-40 border-b transition-transform duration-200 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="font-display text-ink text-xl">
            {brand}
          </Link>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex gap-6">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink hover:text-bronze-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <MobileNav items={nav} />
        </div>
      </header>
    </>
  )
}
