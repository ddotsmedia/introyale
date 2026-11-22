'use client'
import { useEffect, useRef, useState } from 'react'
import { ui } from '@/messages/en'

/**
 * Slideshow controls: dots and a pause/play button. The slides are server-rendered (.hero__slide); this island only
 * moves the data-active marker. No video, no autoplay under reduced motion (the controls are hidden by CSS too).
 */
export function HeroControls({ count, seconds }: { count: number; seconds: number }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const slides = ref.current?.closest('.hero')?.querySelectorAll('.hero__slide')
    slides?.forEach((s, i) => {
      s.setAttribute('data-active', String(i === index))
    })
  }, [index])

  // Extra slides do not download until the page has finished loading, so they never compete with the LCP image.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t = 0
    const warm = () => {
      t = window.setTimeout(() => {
        ref.current
          ?.closest('.hero')
          ?.querySelectorAll('.hero__slide')
          .forEach((s) => {
            s.setAttribute('data-warm', 'true')
          })
      }, 1500)
    }
    if (document.readyState === 'complete') warm()
    else window.addEventListener('load', warm, { once: true })
    return () => {
      window.removeEventListener('load', warm)
      window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => {
        if (document.hidden) return
        setIndex((i) => (i + 1) % count)
      },
      Math.max(4, seconds) * 1000,
    )
    return () => {
      window.clearInterval(id)
    }
  }, [playing, count, seconds])

  return (
    <div ref={ref} className="hero-ctrl">
      <button
        type="button"
        className="hero-ctrl__play"
        aria-label={playing ? ui.pause : ui.play}
        aria-pressed={!playing}
        onClick={() => {
          setPlaying((p) => !p)
        }}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14M16 5v14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5l11 7-11 7z" />
          </svg>
        )}
      </button>
      <div className="hero-ctrl__dots">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${ui.slide} ${String(i + 1)}`}
            aria-current={i === index}
            onClick={() => {
              setIndex(i)
            }}
          />
        ))}
      </div>
    </div>
  )
}
