'use client'
import { useRef, useState } from 'react'
import { ui } from '@/messages/en'
import { fxOn, reduced, useMotionEffects } from './useMotionEffects'

/** The cross-page motion runtime plus the back-to-top button. Loaded lazily after first paint (MotionLoader). */
export function MotionRuntime() {
  const [showTop, setShowTop] = useState(false)
  const ring = useRef<SVGCircleElement>(null)
  useMotionEffects(ring, setShowTop)
  if (!fxOn('backToTop')) return null
  return (
    <button
      type="button"
      className="to-top"
      data-visible={showTop}
      aria-label={ui.backToTop}
      tabIndex={showTop ? 0 : -1}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' })
      }}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="19" className="to-top__track" />
        <circle
          ref={ring}
          cx="22"
          cy="22"
          r="19"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="to-top__ring"
        />
        <path d="M22 28V16m-6 6 6-6 6 6" className="to-top__arrow" />
      </svg>
    </button>
  )
}
