'use client'

import { useEffect } from 'react'

/** Loads the first-party tracker (about 1 KB gzip) once the page is idle, so it never competes with LCP. */
export function Analytics() {
  useEffect(() => {
    const load = () => {
      const s = document.createElement('script')
      s.src = '/a.js'
      s.async = true
      document.head.appendChild(s)
    }
    const start = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(load)
      else setTimeout(load, 2000)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
  }, [])
  return null
}
