'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { Picture, type MediaInput } from './Picture'

/**
 * Before/after reveal driven by a native range input (keyboard: arrows, Home, End). A visible handle follows the
 * position. On first view the handle sweeps once to show it can be moved (when the CMS switch is on and motion allowed).
 */
export function BeforeAfter({
  before,
  after,
  caption,
}: {
  before: MediaInput
  after: MediaInput
  caption?: string | null
}) {
  const [pos, setPos] = useState(50)
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const touched = useRef(false)

  useEffect(() => {
    const el = box.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fx = el.closest<HTMLElement>('.fx-root')?.dataset.fx ?? ''
    if (!fx.split(' ').includes('beforeAfterHint')) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          if (touched.current) return
          const t = Math.min(1, (now - start) / 1900)
          // 50 -> 30 -> 70 -> 50, eased.
          setPos(50 + Math.sin(t * Math.PI * 2) * 20 * (1 - t * 0.2))
          if (t < 1) requestAnimationFrame(tick)
          else setPos(50)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
    }
  }, [])

  return (
    <figure>
      <div ref={box} className="relative aspect-[4/3] overflow-hidden">
        <Picture
          media={before}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${String(100 - pos)}% 0 0)` }}
        >
          <Picture media={after} sizes="100vw" className="h-full w-full object-cover" />
        </div>
        <span className="ba-handle" style={{ left: `${String(pos)}%` }} aria-hidden="true" />
      </div>
      <label htmlFor={id} className="mt-1 block text-sm">
        Reveal before and after
      </label>
      <input
        id={id}
        data-track="before_after"
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => {
          touched.current = true
          setPos(Number(e.target.value))
        }}
        className="w-full"
      />
      {caption && <figcaption className="text-taupe mt-1 text-sm">{caption}</figcaption>}
    </figure>
  )
}
