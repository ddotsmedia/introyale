/* The content scanner reads generic calls like JSX, so DOM lookups use casts here. */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, type RefObject } from 'react'
import { ui } from '@/messages/en'

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
export const fxOn = (k: string) => {
  const r = document.querySelector('.fx-root') as HTMLElement | null
  return !!r && (r.dataset.fx ?? '').split(' ').includes(k)
}
const setHero = (name: string) => {
  ;(document.querySelectorAll('[data-vt-hero]') as NodeListOf<HTMLElement>).forEach((el) => {
    el.style.viewTransitionName = name
  })
}

/**
 * One small client island for the cross-page effects: transitions, magnetic buttons, cursor bubble, floating
 * service image, blur-up, footer curtain and the back-to-top ring. Every effect checks the CMS switches live.
 */
export function useMotionEffects(
  ring: RefObject<SVGCircleElement | null>,
  setShowTop: (visible: boolean) => void,
) {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef<(() => void) | null>(null)

  // A navigation finished: let the View Transition capture the new page.
  useEffect(() => {
    pending.current?.()
    pending.current = null
  }, [pathname])

  // Save-data: heavy effects switch off through CSS (html[data-save-data]).
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (c?.saveData) document.documentElement.dataset.saveData = 'true'
  }, [])

  // Page transitions: cross-fade, and the clicked project image morphs into the case-study hero.
  useEffect(() => {
    if (typeof document.startViewTransition !== 'function' || reduced()) return
    const onClick = (e: MouseEvent) => {
      if (!fxOn('pageTransitions') || e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || /^\/(admin|api)(\/|$)/.test(url.pathname)) return
      if (url.pathname === location.pathname) return
      e.preventDefault()
      e.stopPropagation()
      const img = a.querySelector('[data-vt-image]') as HTMLElement | null
      if (img) {
        setHero('none')
        img.style.viewTransitionName = 'project-hero'
      }
      const t = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pending.current = resolve
            router.push(url.pathname + url.search + url.hash)
            window.setTimeout(resolve, 2500)
          }),
      )
      void t.finished.finally(() => {
        if (img) img.style.viewTransitionName = ''
        setHero('')
      })
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [router])

  // Magnetic buttons, cursor "View" bubble and the services floating image (desktop pointers only).
  useEffect(() => {
    if (reduced() || !finePointer()) return
    const bubble = document.createElement('div')
    bubble.className = 'cursor-bubble'
    bubble.setAttribute('aria-hidden', 'true')
    const float = document.createElement('img')
    float.className = 'float-img'
    float.alt = ''
    float.setAttribute('aria-hidden', 'true')
    document.body.append(bubble, float)
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let fx = 0
    let fy = 0
    let raf = 0
    let bubbleOn = false
    let floatOn = false
    const loop = () => {
      cx += (tx - cx) * 0.2
      cy += (ty - cy) * 0.2
      fx += (tx - fx) * 0.12
      fy += (ty - fy) * 0.12
      bubble.style.transform = `translate3d(${String(cx)}px, ${String(cy)}px, 0) translate(-50%, -50%) scale(${bubbleOn ? '1' : '0.4'})`
      float.style.transform = `translate3d(${String(fx + 24)}px, ${String(fy - 120)}px, 0) scale(${floatOn ? '1' : '0.92'})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    let magnet: HTMLElement | null = null
    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      const t = e.target as Element
      const card = fxOn('cards') ? (t.closest('[data-cursor]') as HTMLElement | null) : null
      bubbleOn = !!card
      if (card) bubble.textContent = card.dataset.cursor ?? ui.view
      bubble.classList.toggle('on', bubbleOn)
      const row = fxOn('servicesFloat')
        ? (t.closest('[data-float-src]') as HTMLElement | null)
        : null
      floatOn = !!row
      if (row && float.dataset.src !== row.dataset.floatSrc) {
        float.dataset.src = row.dataset.floatSrc
        float.src = row.dataset.floatSrc ?? ''
      }
      float.classList.toggle('on', floatOn)
      const m = fxOn('magnetic') ? (t.closest('[data-magnetic]') as HTMLElement | null) : null
      if (magnet && magnet !== m) {
        magnet.style.setProperty('--mx', '0px')
        magnet.style.setProperty('--my', '0px')
      }
      magnet = m
      if (m) {
        const r = m.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3
        m.style.setProperty('--mx', `${String(Math.max(-9, Math.min(9, dx)))}px`)
        m.style.setProperty('--my', `${String(Math.max(-7, Math.min(7, dy)))}px`)
      }
    }
    // Scrolling moves content under a still pointer: drop the bubble and floating image until it moves again.
    const onScroll = () => {
      bubbleOn = false
      floatOn = false
      bubble.classList.remove('on')
      float.classList.remove('on')
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      bubble.remove()
      float.remove()
    }
  }, [])

  // Blur-up: images with a placeholder start blurred and sharpen when loaded. Without JS they simply stay visible.
  useEffect(() => {
    const arm = () => {
      ;(
        document.querySelectorAll(
          'img[data-lqip]:not([data-lqip-armed])',
        ) as NodeListOf<HTMLImageElement>
      ).forEach((img) => {
        img.dataset.lqipArmed = ''
        if (img.complete) return
        img.dataset.pending = ''
        const done = () => {
          delete img.dataset.pending
        }
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      })
    }
    arm()
    const mo = new MutationObserver(arm)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
    }
  }, [pathname])

  // Footer curtain: the footer sits fixed beneath the page, which slides up to uncover it (wide screens, short footers).
  useEffect(() => {
    const el = document.documentElement
    const footer = document.querySelector('footer')
    if (!footer) return
    const apply = () => {
      const h = footer.getBoundingClientRect().height
      const ok =
        fxOn('curtain') &&
        !reduced() &&
        window.innerWidth >= 960 &&
        h < window.innerHeight * 0.85 &&
        !el.dataset.saveData
      if (ok) {
        el.style.setProperty('--footer-h', `${String(Math.round(h))}px`)
        el.dataset.curtain = 'true'
      } else delete el.dataset.curtain
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(footer)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      delete el.dataset.curtain
    }
  }, [pathname])

  // Back-to-top with a scroll-progress ring.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      ring.current?.style.setProperty('stroke-dashoffset', String(100 - p * 100))
      setShowTop(window.scrollY > 700)
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [pathname])
}
