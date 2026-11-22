'use client'

import { useEffect } from 'react'

/** Sends Core Web Vitals (name, value, path) to the first-party collector. The library loads after the page is idle. */
export function WebVitals() {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
    if (nav.doNotTrack === '1' || nav.globalPrivacyControl || nav.webdriver) return
    const load = () => {
      void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        const send = (m: { name: string; value: number }) => {
          const body = JSON.stringify({
            t: 'vt',
            p: location.pathname,
            n: m.name,
            v: Math.round(m.value * 1000) / 1000,
            sw: innerWidth,
          })
          if (!navigator.sendBeacon('/api/a/collect', new Blob([body], { type: 'text/plain' }))) {
            void fetch('/api/a/collect', { method: 'POST', body, keepalive: true })
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
