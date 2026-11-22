'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Inside the admin live-preview frame: re-render when the editor changes or saves the document. */
export function LiveRefresh() {
  const router = useRouter()
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { type?: string } | null
      if (d?.type !== 'payload-live-preview') return
      clearTimeout(t)
      t = setTimeout(() => {
        router.refresh()
      }, 1500)
    }
    window.addEventListener('message', onMsg)
    return () => {
      window.removeEventListener('message', onMsg)
      clearTimeout(t)
    }
  }, [router])
  return null
}
