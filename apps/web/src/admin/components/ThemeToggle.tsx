'use client'
import { useState } from 'react'

/** Light/dark switch; writes the cookie Payload reads so the choice survives reloads. */
export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    typeof document === 'undefined' ? false : document.documentElement.dataset.theme === 'dark',
  )
  return (
    <button
      type="button"
      className="ir-btn ghost"
      aria-pressed={dark}
      onClick={() => {
        const next = dark ? 'light' : 'dark'
        document.documentElement.dataset.theme = next
        document.cookie = `payload-theme=${next}; path=/; max-age=31536000; samesite=lax`
        setDark(!dark)
      }}
    >
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
