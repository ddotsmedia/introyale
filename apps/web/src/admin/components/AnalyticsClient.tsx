'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Re-renders the server view every N seconds while the tab is visible (realtime panel). */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) router.refresh()
    }, seconds * 1000)
    return () => {
      clearInterval(id)
    }
  }, [router, seconds])
  return null
}

/** Opens the browser print dialog; the print stylesheet turns the page into a clean PDF report. */
export function PrintButton({ label = 'Print / save as PDF' }: { label?: string }) {
  return (
    <button
      type="button"
      className="ir-btn ghost ir-noprint"
      onClick={() => {
        // Open every "view as table" so the report carries the numbers behind each chart.
        document.querySelectorAll('details.ir-data').forEach((d) => d.setAttribute('open', ''))
        window.print()
      }}
    >
      {label}
    </button>
  )
}
