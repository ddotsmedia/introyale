import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { Shell } from '../Shell'
import { dashboardData } from '../data'
import { Badge, Card, Columns, fmtDate, HBars, Kpi, relTime } from '../ui'
import { backupInfo, health } from '../system'
import { tr } from '../labels'
import { can } from '../../lib/roles'

type Lead = {
  id: number
  ref: string
  name?: string
  status?: string
  followUpAt?: string
}
type Act = {
  id: number
  action: string
  collection: string
  at: string
  actor?: { name?: string } | number | null
}
type Series = { label: string; value: number }[]
type D = {
  leadsAllowed: boolean
  d1: { cur: number; trend: number | null }
  d7: { cur: number; trend: number | null }
  d30: { cur: number; trend: number | null }
  unassigned: number
  overdue: number
  won: number
  weeks: Series
  funnel: Series
  sectors: Series
  sources: Series
  due: Lead[]
  latest: Lead[]
  awaiting: number
  published: Record<string, number>
  unverified: number
  confirm: number
  activity: Act[]
}

export async function Dashboard(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell bare view={props} title={tr(lang, 'dashboard')} sub="What needs attention today.">
      {async ({ payload, user }) => {
        const d = (await dashboardData(payload, user)) as unknown as D
        const isAdmin = can(user.role, 'system.view')
        const reviewer = can(user.role, 'workflow.approve') || can(user.role, 'workflow.publish')
        const [bk, hl] = await Promise.all([
          isAdmin ? backupInfo() : null,
          isAdmin ? health(payload) : null,
        ])
        const umami = Boolean(process.env.UMAMI_URL && process.env.UMAMI_WEBSITE_ID)
        return (
          <>
            <div className="ir-actions">
              {can(user.role, 'project.write') && (
                <Link className="ir-btn" href="/admin/collections/projects/create">
                  New project
                </Link>
              )}
              {can(user.role, 'content.write') && (
                <Link className="ir-btn" href="/admin/collections/journal-posts/create">
                  New journal post
                </Link>
              )}
              {can(user.role, 'media.write') && (
                <Link className="ir-btn ghost" href="/admin/collections/media/create">
                  Upload media
                </Link>
              )}
              {d.leadsAllowed && (
                <Link className="ir-btn ghost" href="/admin/leads-board">
                  Open leads board
                </Link>
              )}
              <a className="ir-btn ghost" href="/" target="_blank" rel="noreferrer">
                View site<span className="ir-sr"> (opens in a new tab)</span>
              </a>
            </div>

            {d.leadsAllowed && (
              <>
                <div className="ir-grid">
                  <Kpi
                    label={`${tr(lang, 'newEnquiries')} · today`}
                    value={d.d1.cur}
                    trend={d.d1.trend}
                  />
                  <Kpi
                    label={`${tr(lang, 'newEnquiries')} · 7 days`}
                    value={d.d7.cur}
                    trend={d.d7.trend}
                  />
                  <Kpi
                    label={`${tr(lang, 'newEnquiries')} · 30 days`}
                    value={d.d30.cur}
                    trend={d.d30.trend}
                  />
                  <Kpi label={tr(lang, 'unassigned')} value={d.unassigned} />
                  <Kpi label={tr(lang, 'overdue')} value={d.overdue} />
                  <Kpi label={tr(lang, 'wonMonth')} value={d.won} />
                </div>
                <div className="ir-cols">
                  <Card title="Enquiries per week (12 weeks)">
                    <Columns data={d.weeks} name="Enquiries per week over the last 12 weeks" />
                  </Card>
                  <Card title="Pipeline funnel">
                    <HBars data={d.funnel} name="Pipeline funnel from new to won" />
                  </Card>
                  <Card title="By sector">
                    <HBars data={d.sectors} name="Enquiries by sector" />
                  </Card>
                  <Card title="By source page or UTM">
                    <HBars data={d.sources} name="Enquiries by source" />
                  </Card>
                </div>
              </>
            )}

            <div className="ir-grid">
              {reviewer && <Kpi label={tr(lang, 'awaiting')} value={d.awaiting} />}
              <Kpi label="Published projects" value={d.published['projects'] ?? 0} />
              <Kpi label="Published services" value={d.published['services'] ?? 0} />
              <Kpi label="Published posts" value={d.published['journal-posts'] ?? 0} />
              <Kpi label="Unverified facts" value={d.unverified} />
              <Kpi label="[CONFIRM] items" value={d.confirm} />
              {isAdmin && (
                <Kpi
                  label="Last backup"
                  value={bk?.at ? relTime(bk.at) : 'unknown'}
                  note={bk?.at ? undefined : 'No backup status file mounted'}
                />
              )}
              {isAdmin && hl && (
                <Kpi
                  label="Site health"
                  value={hl.db && hl.worker ? 'OK' : hl.db ? 'Worker down' : 'DB down'}
                />
              )}
              {umami ? (
                <Kpi label="Visitors (Umami)" value="Configured" note="Open Umami for detail" />
              ) : null}
            </div>

            <div className="ir-cols">
              {d.leadsAllowed && (
                <Card title="My leads due today">
                  {d.due.length === 0 ? (
                    <p className="ir-muted">Nothing due.</p>
                  ) : (
                    <ul className="ir-list">
                      {d.due.map((l) => (
                        <li key={l.id}>
                          <Link href={`/admin/lead?id=${String(l.id)}`}>
                            {l.ref} {l.name}
                          </Link>
                          <span>{fmtDate(l.followUpAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}
              {d.leadsAllowed && (
                <Card title="Latest enquiries">
                  <ul className="ir-list">
                    {d.latest.map((l) => (
                      <li key={l.id}>
                        <Link href={`/admin/lead?id=${String(l.id)}`}>
                          {l.ref} {l.name}
                        </Link>
                        <Badge>{(l.status ?? 'new').replace('_', ' ')}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              <Card title="Recent activity">
                {d.activity.length === 0 ? (
                  <p className="ir-muted">No activity visible to your role.</p>
                ) : (
                  <ul className="ir-list">
                    {d.activity.map((a) => (
                      <li key={a.id}>
                        <span>
                          {typeof a.actor === 'object' && a.actor ? a.actor.name : 'system'} ·{' '}
                          {a.action} {a.collection}
                        </span>
                        <span className="ir-muted">{relTime(a.at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              {reviewer && (
                <Card title="Content awaiting review">
                  <p>
                    <Link href="/admin/workflow">Open the workflow board</Link>: {d.awaiting}{' '}
                    item(s) in review.
                  </p>
                </Card>
              )}
            </div>
          </>
        )
      }}
    </Shell>
  )
}
