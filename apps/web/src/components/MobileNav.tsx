'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { NavItem } from './Header'

/** Mobile navigation: focus is trapped while open; Esc closes and returns focus to the trigger. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
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
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => {
          setOpen((v) => !v)
        }}
        className="text-ink px-2 py-1"
      >
        Menu
      </button>
      {open && (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="bg-ivory fixed inset-0 z-50 p-6"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false)
            }}
            className="text-ink mb-6 px-2 py-1"
          >
            Close
          </button>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setOpen(false)
                  }}
                  className="font-display text-2xl"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
