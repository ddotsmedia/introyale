'use client'

import { useState } from 'react'
import { Picture, type MediaLike } from './Picture'

export type Hotspot = { x: number; y: number; label: string; media?: MediaLike }

/** Plan with keyboard-operable hotspots. The list below is the full, non-visual equivalent. */
export function PlanHotspots({ plan, hotspots }: { plan: MediaLike; hotspots: Hotspot[] }) {
  const [active, setActive] = useState<number | null>(null)
  const selected = active === null ? null : hotspots[active]
  return (
    <div>
      <div className="relative">
        <Picture media={plan} sizes="100vw" className="w-full" />
        {hotspots.map((h, i) => (
          <button
            key={`${h.label}-${String(i)}`}
            type="button"
            aria-pressed={active === i}
            aria-label={h.label}
            onClick={() => {
              setActive(i)
            }}
            className="bg-bronze-deep text-ivory absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs"
            style={{ left: `${String(h.x)}%`, top: `${String(h.y)}%` }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-2 min-h-6 text-sm">
        {selected ? selected.label : ''}
      </p>
      <ol className="mt-2 list-decimal ps-6 text-sm">
        {hotspots.map((h, i) => (
          <li key={`${h.label}-list-${String(i)}`}>{h.label}</li>
        ))}
      </ol>
    </div>
  )
}
