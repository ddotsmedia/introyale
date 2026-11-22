'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Data = {
  path: string | null
  views: number
  visitors: number
  avgSeconds: number
  enquiries: number
  seoScore: number
  issues: string[]
  updatedAt: string | null
}

/** Sidebar card in the edit view: 30-day performance of this page and its SEO health. */
export function Insights() {
  const { id, collectionSlug } = useDocumentInfo()
  const [d, setD] = useState<Data | null>(null)
  useEffect(() => {
    if (!id || !collectionSlug) return
    let live = true
    fetch(`/api/admin-tools/insights?collection=${collectionSlug}&id=${String(id)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Data>) : null))
      .then((x) => {
        if (live) setD(x)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [id, collectionSlug])
  if (!id) return null
  return (
    <section className="ir ir-card ir-insight" aria-label="Insights">
      <h2 style={{ fontSize: '1rem' }}>Insights · last 30 days</h2>
      {d ? (
        <>
          <dl>
            <dt>Views</dt>
            <dd>{d.views.toLocaleString()}</dd>
            <dt>Visitors</dt>
            <dd>{d.visitors.toLocaleString()}</dd>
            <dt>Avg. time on page</dt>
            <dd>{d.avgSeconds}s</dd>
            <dt>Enquiries after viewing</dt>
            <dd>{d.enquiries}</dd>
            <dt>SEO health</dt>
            <dd>{d.seoScore}/100</dd>
            <dt>Last updated</dt>
            <dd>{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('en-GB') : '—'}</dd>
          </dl>
          {d.issues.length ? (
            <ul className="ir-muted">
              {d.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="ir-muted">No SEO issues found.</p>
          )}
          <a className="ir-btn ghost" href="/admin/analytics">
            Open full analytics
          </a>
        </>
      ) : (
        <div className="ir-skel" aria-busy="true" />
      )}
    </section>
  )
}
