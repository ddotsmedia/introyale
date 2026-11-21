'use client'

import 'altcha'
import { useEffect, useRef } from 'react'

/**
 * ALTCHA proof-of-work widget (D16). Created after mount so the custom element never reaches
 * server rendering, and its attributes are set before it connects so `name` and `auto` apply.
 */
export function AltchaWidget() {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = document.createElement('altcha-widget')
    el.setAttribute('challenge', '/api/altcha/challenge')
    el.setAttribute('name', 'altcha')
    el.setAttribute('auto', 'onload')
    box.current?.appendChild(el)
    return () => {
      el.remove()
    }
  }, [])
  return <div ref={box} />
}
