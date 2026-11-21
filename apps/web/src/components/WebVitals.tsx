'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/** Sends Core Web Vitals (name and value only) to /api/vitals with a beacon (SPEC §2.9). */
export function WebVitals() {
  useEffect(() => {
    const send = (m: Metric) => {
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
  }, [])
  return null
}
