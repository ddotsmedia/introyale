'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ui } from '@/messages/en'
import type { NavItem } from './Header'
import { Picture, type MediaInput } from './Picture'

/** Full-screen mobile menu. Focus is trapped while open; Esc closes it and returns focus to the trigger. */
export function MobileNav({
  items,
  cta,
  phone,
  whatsappHref,
  images = [],
}: {
  items: NavItem[]
  cta: { label: string; href: string } | null
  phone: string | null
  whatsappHref: string | null
  images?: { href: string; media: MediaInput }[]
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      const first = list[0]
      const last = list[list.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
  }

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => {
          setOpen((v) => !v)
        }}
        className="min-h-5.5 px-1 text-sm font-semibold uppercase tracking-[0.14em]"
      >
        {ui.menu}
      </button>
      {open && (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ui.menu}
          className="menu-panel bg-night text-ivory on-dark fixed inset-0 z-50 flex flex-col overflow-y-auto px-3 py-2.5"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className="min-h-5.5 px-1 text-sm font-semibold uppercase tracking-[0.14em]"
            >
              {ui.close}
            </button>
          </div>
          {/* Background image crossfade: the hovered or focused link decides which image shows (CMS sector heroes). */}
          <div className="menu-bg" aria-hidden="true">
            {images
              .filter((i) => i.media)
              .map((i) => (
                <div key={i.href} data-on={active === i.href}>
                  <Picture media={i.media} sizes="100vw" className="h-full w-full object-cover" />
                </div>
              ))}
          </div>
          <ul className="menu-links relative mt-3 flex flex-col gap-0.5">
            {items.map((item, n) => (
              <li key={item.href} style={{ '--i': n } as React.CSSProperties}>
                <Link
                  href={item.href}
                  onClick={close}
                  onMouseEnter={() => {
                    setActive(item.href)
                  }}
                  onFocus={() => {
                    setActive(item.href)
                  }}
                  onTouchStart={() => {
                    setActive(item.href)
                  }}
                  className="font-display block py-1 text-[2rem] leading-tight tracking-tight"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-1.5 pt-5">
            {cta && (
              <Link
                href={cta.href}
                onClick={close}
                className="bg-bronze-deep inline-flex min-h-6 items-center justify-center px-3 text-sm font-semibold uppercase tracking-[0.14em] text-white"
              >
                {cta.label}
              </Link>
            )}
            <div className="text-ivory/80 flex flex-wrap gap-x-3 gap-y-1 text-base">
              {phone && <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>}
              {whatsappHref && <a href={whatsappHref}>{ui.whatsapp}</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
