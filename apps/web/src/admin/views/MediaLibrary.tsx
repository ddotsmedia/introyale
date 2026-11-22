import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { bulkAlt, bulkMediaMeta, deleteMedia } from '../actions'
import { mediaIndex } from '../media'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, Card } from '../ui'
import { can } from '../../lib/roles'

type M = {
  id: number
  filename?: string
  alt?: string
  width?: number
  folder?: string
  tags?: string[]
  mimeType?: string
  sizes?: Record<string, { url?: string }>
  url?: string
}
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export async function MediaLibrary(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="comment"
      title={tr(lang, 'mediaLibrary')}
      sub="Find missing alt text and unused files, edit in bulk, and delete only what nothing uses."
    >
      {async ({ payload, user, sp }) => {
        const filter = one(sp.filter)
        const folder = one(sp.folder)
        const tag = one(sp.tag)
        const canWrite = can(user.role, 'media.write')
        const all = (
          await payload.find({
            collection: 'media',
            limit: 1000,
            pagination: false,
            depth: 0,
            overrideAccess: true,
            sort: '-createdAt',
          })
        ).docs as unknown as M[]
        const idx = await mediaIndex(payload)
        const folders = [...new Set(all.map((m) => m.folder).filter(Boolean))] as string[]
        const items = all.filter((m) => {
          if (filter === 'noalt' && m.alt?.trim()) return false
          if (filter === 'unused' && (idx.get(m.id)?.length ?? 0) > 0) return false
          if (folder && m.folder !== folder) return false
          if (tag && !m.tags?.includes(tag)) return false
          return true
        })
        const missing = items.filter((m) => !m.alt?.trim())
        return (
          <>
            <div className="ir-actions">
              {canWrite && (
                <Link className="ir-btn" href="/admin/collections/media/bulk-upload">
                  Bulk upload
                </Link>
              )}
              <Link className="ir-btn ghost" href="/admin/media-library">
                All ({all.length})
              </Link>
              <Link className="ir-btn ghost" href="/admin/media-library?filter=noalt">
                Missing alt text
              </Link>
              <Link className="ir-btn ghost" href="/admin/media-library?filter=unused">
                Unused
              </Link>
            </div>
            <form className="ir-filters" method="get">
              <label>
                Folder
                <select name="folder" defaultValue={folder}>
                  <option value="">All folders</option>
                  {folders.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label>
                Tag
                <input type="text" name="tag" defaultValue={tag} />
              </label>
              <input type="hidden" name="filter" value={filter} />
              <button className="ir-btn" type="submit">
                Apply
              </button>
            </form>

            {canWrite && missing.length > 0 && (
              <Card title={`Bulk alt text (${String(missing.length)} missing)`}>
                <form action={bulkAlt}>
                  {missing.slice(0, 20).map((m) => (
                    <label key={m.id} style={{ display: 'block', marginBlockEnd: 6 }}>
                      {m.filename}
                      <input type="text" name={`alt_${String(m.id)}`} style={{ width: '100%' }} />
                    </label>
                  ))}
                  <button className="ir-btn" type="submit">
                    Save alt text
                  </button>
                </form>
              </Card>
            )}

            <form action={bulkMediaMeta}>
              <div
                className="ir-grid"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
              >
                {items.slice(0, 120).map((m) => {
                  const refs = idx.get(m.id) ?? []
                  const thumb = m.sizes?.['w480']?.url ?? m.url
                  return (
                    <article key={m.id} className="ir-card">
                      {canWrite && (
                        <label className="ir-muted" style={{ fontSize: '0.8rem' }}>
                          <input type="checkbox" name="ids" value={m.id} /> Select {m.filename}
                        </label>
                      )}
                      {thumb && m.mimeType?.startsWith('image/') ? (
                        <img
                          src={thumb}
                          alt={m.alt ?? ''}
                          style={{
                            width: '100%',
                            height: 130,
                            objectFit: 'cover',
                            borderRadius: 6,
                          }}
                        />
                      ) : null}
                      <div style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{m.filename}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
                        {!m.alt?.trim() && <Badge tone="bad">No alt</Badge>}
                        {m.width && m.width < 1920 && (
                          <Badge tone="warn">{`Low resolution (${String(m.width)} px)`}</Badge>
                        )}
                        {refs.length === 0 ? (
                          <Badge>Unused</Badge>
                        ) : (
                          <Badge tone="ok">{`Used in ${String(refs.length)}`}</Badge>
                        )}
                        {m.folder ? <Badge>{m.folder}</Badge> : null}
                      </div>
                      {refs.length > 0 && (
                        <details>
                          <summary>Used in</summary>
                          <ul className="ir-list">
                            {refs.slice(0, 8).map((r, i) => (
                              <li key={i} style={{ fontSize: '0.8rem' }}>
                                {r.collection.startsWith('global:') ? (
                                  r.label
                                ) : (
                                  <Link href={`/admin/collections/${r.collection}/${r.id}`}>
                                    {r.collection}: {r.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                      <Link href={`/admin/collections/media/${String(m.id)}`}>
                        Edit, focal point
                      </Link>
                      {canWrite && refs.length === 0 && (
                        <button
                          className="ir-btn ghost"
                          type="submit"
                          formAction={deleteMedia}
                          name="id"
                          value={m.id}
                          style={{ marginInlineStart: 8, padding: '3px 8px' }}
                        >
                          Delete
                        </button>
                      )}
                    </article>
                  )
                })}
              </div>
              {canWrite && (
                <Card title="Apply to selected files">
                  <div className="ir-filters">
                    <label>
                      Folder
                      <input type="text" name="folder" placeholder="Residential/Villas" />
                    </label>
                    <label>
                      Tags (comma separated)
                      <input type="text" name="tags" />
                    </label>
                    <button className="ir-btn" type="submit">
                      Update selected
                    </button>
                  </div>
                </Card>
              )}
            </form>
          </>
        )
      }}
    </Shell>
  )
}
