import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { transitionDoc } from '../actions'
import { PreviewLink } from '../components/PreviewLink'
import { WORKFLOW_COLLECTIONS } from '../data'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, fmtDate } from '../ui'
import { checkTransition, STATUSES, type Status } from '../../lib/workflow'

type Row = {
  id: number
  collection: string
  title: string
  status: Status
  updatedAt: string
  publishAt?: string | null
}

const COLUMN: Record<Status, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  published: 'Published',
}
const ACTION: Partial<Record<`${Status}>${Status}`, string>> = {
  'draft>in_review': 'Submit for review',
  'in_review>approved': 'Approve',
  'in_review>draft': 'Request changes',
  'approved>published': 'Publish',
  'approved>in_review': 'Return to review',
  'published>draft': 'Unpublish',
}

export async function Workflow(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="comment"
      title={tr(lang, 'workflow')}
      sub="Every document by stage. Buttons appear only for transitions your role may make."
    >
      {async ({ payload, user }) => {
        const rows: Row[] = []
        for (const c of WORKFLOW_COLLECTIONS) {
          const res = await payload.find({
            collection: c,
            limit: 200,
            pagination: false,
            depth: 0,
            overrideAccess: true,
            sort: '-updatedAt',
          })
          for (const d of res.docs as unknown as Record<string, any>[]) {
            rows.push({
              id: d.id as number,
              collection: c,
              title: String(d.title ?? d.name ?? d.attributionName ?? d.slug ?? d.id),
              status: (d.workflow?.status ?? 'draft') as Status,
              updatedAt: d.updatedAt as string,
              publishAt: d.workflow?.publishAt as string | null,
            })
          }
        }
        return (
          <div className="ir-board" style={{ gridAutoColumns: 'minmax(280px, 1fr)' }}>
            {STATUSES.map((s) => {
              const col = rows.filter((r) => r.status === s)
              return (
                <section
                  key={s}
                  className="ir-col"
                  aria-label={`${COLUMN[s]}, ${String(col.length)} documents`}
                >
                  <h3>
                    {COLUMN[s]} <span>{col.length}</span>
                  </h3>
                  {col.map((r) => {
                    const moves = STATUSES.filter(
                      (to) =>
                        to !== s && checkTransition(s, to, user.role).ok && ACTION[`${s}>${to}`],
                    )
                    return (
                      <article
                        key={`${r.collection}-${String(r.id)}`}
                        className="ir-lead"
                        style={{ cursor: 'default' }}
                      >
                        <Link href={`/admin/collections/${r.collection}/${String(r.id)}`}>
                          {r.title}
                        </Link>
                        <div className="ir-muted" style={{ fontSize: '0.8rem' }}>
                          {r.collection} · {fmtDate(r.updatedAt)}
                        </div>
                        {r.publishAt ? (
                          <Badge tone="warn">{`Scheduled ${fmtDate(r.publishAt)}`}</Badge>
                        ) : null}
                        {moves.length > 0 && (
                          <details style={{ marginTop: 6 }}>
                            <summary>Actions</summary>
                            <form action={transitionDoc} style={{ marginTop: 6 }}>
                              <input type="hidden" name="collection" value={r.collection} />
                              <input type="hidden" name="id" value={r.id} />
                              <label style={{ display: 'block', fontSize: '0.8rem' }}>
                                Comment
                                <input type="text" name="comment" style={{ width: '100%' }} />
                              </label>
                              {s === 'approved' && (
                                <label style={{ display: 'block', fontSize: '0.8rem' }}>
                                  Schedule for (optional)
                                  <input type="date" name="publishAt" />
                                </label>
                              )}
                              <div className="ir-actions" style={{ marginTop: 6, marginBottom: 0 }}>
                                {moves.map((to) => (
                                  <button
                                    key={to}
                                    className="ir-btn ghost"
                                    type="submit"
                                    name="to"
                                    value={to}
                                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                  >
                                    {ACTION[`${s}>${to}`]}
                                  </button>
                                ))}
                              </div>
                            </form>
                          </details>
                        )}
                        {(r.collection === 'pages' || r.collection === 'projects') &&
                          s !== 'published' && <PreviewLink collection={r.collection} id={r.id} />}
                      </article>
                    )
                  })}
                </section>
              )
            })}
          </div>
        )
      }}
    </Shell>
  )
}
