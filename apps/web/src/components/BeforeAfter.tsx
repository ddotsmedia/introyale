'use client'

import { useId, useState } from 'react'
import { Picture, type MediaLike } from './Picture'

/** Before/after reveal driven by a native range input (keyboard: arrows, Home, End). */
export function BeforeAfter({
  before,
  after,
  caption,
}: {
  before: MediaLike
  after: MediaLike
  caption?: string | null
}) {
  const [pos, setPos] = useState(50)
  const id = useId()
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Picture
          media={before}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${String(100 - pos)}% 0 0)` }}
        >
          <Picture media={after} sizes="100vw" className="h-full w-full object-cover" />
        </div>
      </div>
      <label htmlFor={id} className="mt-2 block text-sm">
        Reveal before and after
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => {
          setPos(Number(e.target.value))
        }}
        className="w-full"
      />
      {caption && <figcaption className="text-taupe mt-2 text-sm">{caption}</figcaption>}
    </figure>
  )
}
