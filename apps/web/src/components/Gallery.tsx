'use client'

import { useRef, useState } from 'react'
import { Picture, type MediaLike } from './Picture'

export type GalleryItem = { media: MediaLike; caption?: string | null }

/** Thumbnail grid with a native modal <dialog> lightbox (Esc, focus trap and focus return built in). */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const current = items[index]
  if (items.length === 0) return null

  const step = (d: number) => {
    setIndex((i) => (i + d + items.length) % items.length)
  }
  const onKey = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              className="block w-full"
              aria-label={`Open image ${String(i + 1)} of ${String(items.length)}`}
              onClick={() => {
                setIndex(i)
                dialogRef.current?.showModal()
              }}
            >
              <Picture
                media={item.media}
                sizes="(min-width: 960px) 33vw, 50vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label="Image viewer"
        onKeyDown={onKey}
        className="bg-ink text-ivory m-auto max-h-[90vh] max-w-[95vw] p-4 backdrop:bg-black/80"
      >
        <div className="flex items-center justify-between gap-4 pb-2">
          <button
            type="button"
            onClick={() => {
              step(-1)
            }}
            className="px-3 py-1"
          >
            Previous
          </button>
          <span aria-live="polite" className="text-sm">
            {index + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={() => {
              step(1)
            }}
            className="px-3 py-1"
          >
            Next
          </button>
          <button type="button" onClick={() => dialogRef.current?.close()} className="px-3 py-1">
            Close
          </button>
        </div>
        {current && <Picture media={current.media} sizes="90vw" className="max-h-[70vh] w-auto" />}
        {current?.caption && <p className="pt-2 text-sm">{current.caption}</p>}
      </dialog>
    </>
  )
}
