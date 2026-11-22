'use client'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ui } from '@/messages/en'
import { Picture, type MediaInput } from './Picture'

export type GalleryItem = { media: MediaInput; caption?: string | null }

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const MAX_ZOOM = 4

/**
 * Masonry gallery with a native modal <dialog> lightbox: Esc, focus trap and focus return are built in. The viewer zooms
 * out of the clicked thumbnail, zooms with the wheel, double click, pinch or +/-, pans by dragging, swipes between
 * images, shows captions and a counter, and has a full-screen mode.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imgBox = useRef<HTMLDivElement>(null)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  const view = useRef({ s: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ dist: 0, scale: 1, startX: 0, startY: 0, moved: false, swipe: 0 })
  const [zoomed, setZoomed] = useState(false)
  const current = items[index]

  const apply = () => {
    const { s, x, y } = view.current
    if (imgBox.current)
      imgBox.current.style.transform = `translate3d(${String(x)}px, ${String(y)}px, 0) scale(${String(s)})`
    setZoomed(s > 1.01)
  }
  const reset = () => {
    view.current = { s: 1, x: 0, y: 0 }
    apply()
  }
  const step = (d: number) => {
    setIndex((i) => (i + d + items.length) % items.length)
    reset()
  }
  const zoomTo = (next: number, cx = 0, cy = 0) => {
    const v = view.current
    const s = Math.min(MAX_ZOOM, Math.max(1, next))
    const k = s / v.s
    // Keep the point under the cursor fixed while zooming.
    v.x = s === 1 ? 0 : cx - (cx - v.x) * k
    v.y = s === 1 ? 0 : cy - (cy - v.y) * k
    v.s = s
    apply()
  }
  const open = (i: number) => {
    flushSync(() => {
      setIndex(i)
    })
    reset()
    const dlg = dialogRef.current
    if (!dlg) return
    dlg.showModal()
    // Zoom out of the thumbnail: animate from its rectangle to the final position (FLIP).
    const thumb = thumbs.current[i]?.querySelector('img')
    const target = imgBox.current?.querySelector('img')
    if (!thumb || !target || reduced()) return
    const from = thumb.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (!to.width) return
    imgBox.current?.animate(
      [
        {
          transform: `translate(${String(from.left + from.width / 2 - (to.left + to.width / 2))}px, ${String(from.top + from.height / 2 - (to.top + to.height / 2))}px) scale(${String(from.width / to.width)})`,
        },
        { transform: 'none' },
      ],
      { duration: 480, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    )
  }

  // Keyboard: arrows move, +/- zoom, 0 resets (Esc is handled by the dialog).
  const onKey = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === '+' || e.key === '=') zoomTo(view.current.s * 1.4)
    else if (e.key === '-') zoomTo(view.current.s / 1.4)
    else if (e.key === '0') reset()
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = stage.getBoundingClientRect()
      zoomTo(
        view.current.s * (e.deltaY < 0 ? 1.18 : 1 / 1.18),
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2),
      )
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      stage.removeEventListener('wheel', onWheel)
    }
    // zoomTo reads refs only.
  }, [])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    g.moved = false
    g.swipe = 0
    g.startX = e.clientX
    g.startY = e.clientY
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ]
      g.dist = Math.hypot(a.x - b.x, a.y - b.y)
      g.scale = view.current.s
    }
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointers.current.get(e.pointerId)
    if (!p) return
    const g = gesture.current
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ]
      zoomTo((g.scale * Math.hypot(a.x - b.x, a.y - b.y)) / (g.dist || 1))
      g.moved = true
      return
    }
    if (view.current.s > 1.01) {
      view.current.x += dx
      view.current.y += dy
      apply()
      g.moved = true
    } else {
      g.swipe = e.clientX - g.startX
      if (Math.abs(g.swipe) > 6) g.moved = true
      if (imgBox.current) imgBox.current.style.transform = `translate3d(${String(g.swipe)}px, 0, 0)`
    }
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (pointers.current.size > 0) return
    if (view.current.s <= 1.01) {
      if (Math.abs(g.swipe) > 70) step(g.swipe < 0 ? 1 : -1)
      else apply()
    }
  }

  const fullscreen = () => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void dlg.requestFullscreen().catch(() => undefined)
  }

  if (items.length === 0) return null
  return (
    <>
      <ul className="masonry">
        {items.map((item, i) => (
          <li key={i} style={{ '--i': i % 6 } as React.CSSProperties}>
            <button
              type="button"
              ref={(el) => {
                thumbs.current[i] = el
              }}
              className="zoom block w-full overflow-hidden"
              data-track="gallery_open"
              aria-label={`${ui.gallery.open} ${String(i + 1)} ${ui.gallery.of} ${String(items.length)}`}
              onClick={() => {
                open(i)
              }}
            >
              <Picture
                media={item.media}
                sizes="(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dialogRef} aria-label={ui.gallery.viewer} onKeyDown={onKey} className="lb">
        <div className="lb__bar">
          <span aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <span className="flex">
            <button type="button" onClick={fullscreen}>
              {ui.gallery.fullscreen}
            </button>
            <button
              type="button"
              onClick={() => {
                dialogRef.current?.close()
              }}
            >
              {ui.gallery.close}
            </button>
          </span>
        </div>
        <button
          type="button"
          className="lb__nav"
          data-side="prev"
          aria-label={ui.gallery.previous}
          onClick={() => {
            step(-1)
          }}
        >
          ‹
        </button>
        <div
          ref={stageRef}
          className="lb__stage"
          data-zoomed={zoomed}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={() => {
            zoomTo(view.current.s > 1.01 ? 1 : 2.4)
          }}
        >
          <div ref={imgBox} className="lb__imgbox">
            {current && <Picture media={current.media} sizes="96vw" className="lb__img" />}
          </div>
        </div>
        <button
          type="button"
          className="lb__nav"
          data-side="next"
          aria-label={ui.gallery.next}
          onClick={() => {
            step(1)
          }}
        >
          ›
        </button>
        <p className="lb__cap">{current?.caption}</p>
      </dialog>
    </>
  )
}
