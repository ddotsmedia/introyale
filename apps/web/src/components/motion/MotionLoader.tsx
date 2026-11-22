'use client'
import { useEffect, useState, type ComponentType } from 'react'

/** Loads the motion runtime after first paint, off the critical path, so it never counts toward initial JS. */
export function MotionLoader() {
  const [Runtime, setRuntime] = useState<ComponentType | null>(null)
  useEffect(() => {
    const load = () => {
      void import('./MotionRuntime').then((m) => {
        setRuntime(() => m.MotionRuntime)
      })
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 2500 })
      return () => {
        window.cancelIdleCallback(id)
      }
    }
    const t = window.setTimeout(load, 900)
    return () => {
      window.clearTimeout(t)
    }
  }, [])
  return Runtime ? <Runtime /> : null
}
