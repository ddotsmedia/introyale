'use client'
import { useState, useTransition } from 'react'
import { createPreviewLink } from '../actions'

/** Creates an expiring (7 days) shareable draft preview link and shows it for copying. */
export function PreviewLink({ collection, id }: { collection: string; id: number }) {
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  return (
    <div>
      <button
        type="button"
        className="ir-btn ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await createPreviewLink(collection, id)
            setUrl(r.data ?? '')
            setMsg(r.ok ? 'Link valid for 7 days' : r.message)
          })
        }
      >
        Preview link
      </button>
      {url ? (
        <label style={{ display: 'block', fontSize: '0.8rem' }}>
          Shareable link
          <input
            type="text"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            style={{ width: '100%' }}
          />
        </label>
      ) : null}
      <span role="status" className="ir-muted" style={{ fontSize: '0.8rem' }}>
        {msg}
      </span>
    </div>
  )
}
