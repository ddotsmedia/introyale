'use client'
import { useEffect, useRef } from 'react'

/** Animated number. The final value is in the server HTML; the count-up only runs when motion is allowed. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    const match = /^(\D*)([\d,]+)(.*)$/.exec(value)
    if (!el || !match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const [, prefix = '', digits = '', suffix = ''] = match
    const target = Number(digits.replace(/,/g, ''))
    if (!Number.isFinite(target)) return
    el.textContent = `${prefix}0${suffix}`
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1400)
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = `${prefix}${Math.round(target * eased).toLocaleString('en-US')}${suffix}`
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
    }
  }, [value])
  return <span ref={ref}>{value}</span>
}
