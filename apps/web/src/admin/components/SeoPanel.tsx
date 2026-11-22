'use client'
import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

const TITLE_MAX = 60
const DESC_MAX = 160

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** SEO panel: Google snippet and social card previews, character counters, focus keyword checks. Reads live form values. */
export function SeoPanel() {
  const f = useFormFields(([fields]) => ({
    title: fields['seo.metaTitle']?.value,
    desc: fields['seo.metaDescription']?.value,
    og: fields['seo.ogImage']?.value,
    kw: fields['seo.focusKeyword']?.value,
    docTitle: fields['title']?.value ?? fields['publicTitle']?.value,
    slug: fields['slug']?.value,
  }))
  const title = str(f.title) || str(f.docTitle)
  const desc = str(f.desc)
  const kw = str(f.kw).trim().toLowerCase()
  const slug = str(f.slug)
  const [img, setImg] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const ogId = typeof f.og === 'object' && f.og ? (f.og as { id?: number }).id : f.og

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])
  useEffect(() => {
    if (!ogId) {
      setImg(null)
      return
    }
    let live = true
    fetch(`/api/media/${String(ogId)}?depth=0`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { sizes?: Record<string, { url?: string }>; url?: string } | null) => {
        if (live) setImg(m?.sizes?.['w768']?.url ?? m?.url ?? null)
      })
      .catch(() => {
        if (live) setImg(null)
      })
    return () => {
      live = false
    }
  }, [ogId])

  const host = origin.replace(/^https?:\/\//, '')
  const has = (s: string) => !!kw && s.toLowerCase().includes(kw)
  const checks: [string, boolean][] = kw
    ? [
        ['Keyword in the SEO title', has(title)],
        ['Keyword in the meta description', has(desc)],
        ['Keyword in the URL slug', has(slug.replace(/-/g, ' '))],
        ['Keyword in the page title', has(str(f.docTitle))],
      ]
    : []
  const tl = title.length
  const dl = desc.length

  return (
    <div className="ir ir-seo" aria-label="SEO panel">
      <h2>Search and social preview</h2>
      <div className="serp" aria-label="Google result preview">
        <div className="url">
          {host || 'yoursite'} › {slug || '…'}
        </div>
        <div className="t">{title.slice(0, 70) || 'Page title appears here'}</div>
        <div className="d">
          {desc.slice(0, 170) ||
            'The meta description appears here. Aim for 120 to 160 characters.'}
        </div>
      </div>
      <p>
        <span className={`count${tl > TITLE_MAX || tl === 0 ? ' bad' : ''}`}>
          Title: {tl}/{TITLE_MAX}
        </span>
        {' · '}
        <span className={`count${dl > DESC_MAX || dl === 0 ? ' bad' : ''}`}>
          Description: {dl}/{DESC_MAX}
        </span>
      </p>
      <div className="og" aria-label="Social card preview">
        <div className="img" style={img ? { backgroundImage: `url(${img})` } : undefined}>
          {img ? null : 'No social image set'}
        </div>
        <div className="txt">
          <small>{host.toUpperCase()}</small>
          <div>
            <strong>{title || 'Page title'}</strong>
          </div>
          <small>{desc.slice(0, 110)}</small>
        </div>
      </div>
      {checks.length > 0 ? (
        <ul className="checks" aria-label="Focus keyword checks">
          {checks.map(([label, ok]) => (
            <li key={label}>
              {ok ? '✓' : '✗'} {label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="ir-muted">
          Set a focus keyword below to check it against the title, description and URL.
        </p>
      )}
    </div>
  )
}
