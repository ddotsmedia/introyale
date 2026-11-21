'use client'

import { useEffect } from 'react'

/** Sends Core Web Vitals (name and value only) to /api/vitals. The library loads after the page is idle, off the critical path. */
export function WebVitals() {
  useEffect(() => {
    const load = () => {
      void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        const send = (m: { name: string; value: number }) => {
          const body = JSON.stringify({ name: m.name, value: m.value })
          if (!navigator.sendBeacon('/api/vitals', body)) {
            void fetch('/api/vitals', {
              method: 'POST',
              body,
              keepalive: true,
              headers: { 'content-type': 'application/json' },
            })
          }
        }
        onCLS(send)
        onFCP(send)
        onINP(send)
        onLCP(send)
        onTTFB(send)
      })
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(load)
    else setTimeout(load, 2000)
  }, [])
  return null
}
