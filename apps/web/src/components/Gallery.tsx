'use client'
import { useRef, useState } from 'react'
import { ui } from '@/messages/en'
import { Picture, type MediaInput } from './Picture'

export type GalleryItem = { media: MediaInput; caption?: string | null }

/** Large image grid with a native modal <dialog> lightbox (Esc, focus trap and focus return built in). */
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
      <ul className="grid grid-cols-2 gap-1.5 md:gap-2.5">
        {items.map((item, i) => (
          <li key={i} className={i === 0 || items.length === 1 ? 'col-span-2' : ''}>
            <button
              type="button"
              className="zoom block w-full overflow-hidden"
              aria-label={`${ui.gallery.open} ${String(i + 1)} ${ui.gallery.of} ${String(items.length)}`}
              onClick={() => {
                setIndex(i)
                dialogRef.current?.showModal()
              }}
            >
              <Picture
                media={item.media}
                sizes={i === 0 ? '100vw' : '(min-width: 960px) 50vw, 100vw'}
                className={`w-full object-cover ${i === 0 || items.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label={ui.gallery.viewer}
        onKeyDown={onKey}
        className="bg-night text-ivory m-auto max-h-[94vh] max-w-[96vw] p-2 backdrop:bg-black/85"
      >
        <div className="flex items-center justify-between gap-2 pb-1.5 text-sm font-semibold uppercase tracking-[0.12em]">
          <button
            type="button"
            onClick={() => {
              step(-1)
            }}
            className="px-1.5 py-1"
          >
            {ui.gallery.previous}
          </button>
          <span aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={() => {
              step(1)
            }}
            className="px-1.5 py-1"
          >
            {ui.gallery.next}
          </button>
          <button type="button" onClick={() => dialogRef.current?.close()} className="px-1.5 py-1">
            {ui.gallery.close}
          </button>
        </div>
        {current && <Picture media={current.media} sizes="94vw" className="max-h-[78vh] w-auto" />}
        {current?.caption && <p className="pt-1.5 text-sm">{current.caption}</p>}
      </dialog>
    </>
  )
}
