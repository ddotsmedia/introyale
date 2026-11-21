'use client'

import { useEffect, useRef } from 'react'

/**
 * ALTCHA proof-of-work widget (D16). Created after mount so the custom element never reaches
 * server rendering, and its attributes are set before it connects so `name` and `auto` apply.
 */
export function AltchaWidget() {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let el: HTMLElement | null = null
    let cancelled = false
    // The widget library loads after mount, so it stays out of the initial bundle.
    void import('altcha').then(() => {
      if (cancelled) return
      el = document.createElement('altcha-widget')
      el.setAttribute('challenge', '/api/altcha/challenge')
      el.setAttribute('name', 'altcha')
      el.setAttribute('auto', 'onload')
      box.current?.appendChild(el)
    })
    return () => {
      cancelled = true
      el?.remove()
    }
  }, [])
  return <div ref={box} />
}
