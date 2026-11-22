'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type Hit = { type: string; label: string; href: string }

/** Ctrl/⌘ + K command palette. Wraps the admin as a provider; results are fetched from a role-checked endpoint. */
export function CommandPalette({ children }: { children?: ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const show = useCallback(() => {
    setOpen(true)
    dialog.current?.showModal()
    setTimeout(() => input.current?.focus(), 0)
  }, [])
  const hide = useCallback(() => {
    setOpen(false)
    dialog.current?.close()
    setQ('')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (dialog.current?.open) hide()
        else show()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [show, hide])

  useEffect(() => {
    if (!open) return
    const ctl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/admin-tools/search?q=${encodeURIComponent(q)}`, { signal: ctl.signal })
        .then((r) => (r.ok ? (r.json() as Promise<{ hits: Hit[] }>) : { hits: [] }))
        .then((r) => {
          setHits(r.hits)
          setActive(0)
        })
        .catch(() => undefined)
    }, 120)
    return () => {
      clearTimeout(t)
      ctl.abort()
    }
  }, [q, open])

  const go = (h: Hit | undefined) => {
    if (!h) return
    hide()
    router.push(h.href)
  }

  return (
    <>
      {children}
      <dialog
        ref={dialog}
        className="ir-palette"
        aria-label="Command palette"
        onClose={() => {
          setOpen(false)
        }}
        onClick={(e) => {
          if (e.target === dialog.current) hide()
        }}
      >
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="ir-palette-list"
          aria-activedescendant={hits[active] ? `ir-pal-${String(active)}` : undefined}
          placeholder="Search leads, projects, pages, settings, or type an action…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(hits.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(hits[active])
            }
          }}
        />
        <ul id="ir-palette-list" role="listbox" aria-label="Results">
          {hits.map((h, i) => (
            <li
              key={`${h.href}-${String(i)}`}
              id={`ir-pal-${String(i)}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'on' : ''}
              onMouseEnter={() => {
                setActive(i)
              }}
              onClick={() => {
                go(h)
              }}
            >
              <small>{h.type}</small> {h.label}
            </li>
          ))}
          {hits.length === 0 ? <li className="none">No matches</li> : null}
        </ul>
        <p className="hint">↑ ↓ to move · Enter to open · Esc to close</p>
      </dialog>
    </>
  )
}
