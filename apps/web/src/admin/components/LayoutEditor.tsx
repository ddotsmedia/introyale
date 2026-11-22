'use client'

import { useState } from 'react'

type Item = { id: string; title: string; visible: boolean }

/**
 * Dashboard layout editor. Reorder by dragging a row or with the Up/Down buttons (keyboard alternative),
 * show or hide each widget, then Save. The result is posted to a server action as JSON; Reset restores the role default.
 */
export function LayoutEditor({
  items: initial,
  save,
  reset,
}: {
  items: Item[]
  save: (fd: FormData) => Promise<void>
  reset: (fd: FormData) => Promise<void>
}) {
  const [items, setItems] = useState(initial)
  const [drag, setDrag] = useState<number | null>(null)
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [it] = next.splice(from, 1)
    if (it) next.splice(to, 0, it)
    setItems(next)
  }
  const json = JSON.stringify({
    order: items.map((i) => i.id),
    hidden: items.filter((i) => !i.visible).map((i) => i.id),
  })
  return (
    <details className="ir-card ir-noprint ir-layout">
      <summary>Customise this dashboard</summary>
      <p className="ir-muted">
        Drag to reorder, or use the arrow buttons. Untick a widget to hide it. Saved for your
        account only.
      </p>
      <ul className="ir-list" aria-label="Dashboard widgets">
        {items.map((it, i) => (
          <li
            key={it.id}
            draggable
            onDragStart={() => {
              setDrag(i)
            }}
            onDragOver={(e) => {
              e.preventDefault()
            }}
            onDrop={() => {
              if (drag !== null) move(drag, i)
              setDrag(null)
            }}
            style={{ opacity: drag === i ? 0.5 : 1 }}
          >
            <label>
              <input
                type="checkbox"
                checked={it.visible}
                onChange={(e) => {
                  setItems(items.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))
                }}
              />{' '}
              {it.title}
            </label>
            <span>
              <button
                type="button"
                className="ir-btn ghost"
                aria-label={`Move ${it.title} up`}
                disabled={i === 0}
                onClick={() => {
                  move(i, i - 1)
                }}
              >
                ↑
              </button>{' '}
              <button
                type="button"
                className="ir-btn ghost"
                aria-label={`Move ${it.title} down`}
                disabled={i === items.length - 1}
                onClick={() => {
                  move(i, i + 1)
                }}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>
      <div className="ir-actions">
        <form action={save}>
          <input type="hidden" name="layout" value={json} />
          <button className="ir-btn" type="submit">
            Save layout
          </button>
        </form>
        <form action={reset}>
          <button className="ir-btn ghost" type="submit">
            Reset to default
          </button>
        </form>
      </div>
    </details>
  )
}
