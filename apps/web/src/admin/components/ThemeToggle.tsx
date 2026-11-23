'use client'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

/** Light/dark switch; writes the cookie Payload reads so the choice survives reloads. */
export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    typeof document === 'undefined' ? false : document.documentElement.dataset.theme === 'dark',
  )
  return (
    <button
      type="button"
      className="ir-icon-btn"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      onClick={() => {
        const next = dark ? 'light' : 'dark'
        document.documentElement.dataset.theme = next
        document.cookie = `payload-theme=${next}; path=/; max-age=31536000; samesite=lax`
        setDark(!dark)
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
