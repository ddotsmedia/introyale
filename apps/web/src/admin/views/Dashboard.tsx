import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { Shell } from '../Shell'
import { dashboardData } from '../data'
import { Badge, Card, Donut, fmtDate, Funnel, HBars, Kpi, KpiGrid, LineChart, relTime } from '../ui'
import { backupInfo, health } from '../system'
import { umamiData } from '../umami'
import { tr } from '../labels'
import { can } from '../../lib/roles'

type Lead = { id: number; ref: string; name?: string; status?: string; followUpAt?: string }
type Act = {
  id: number
  action: string
  collection: string
  at: string
  actor?: { name?: string } | number | null
}
type Series = { label: string; value: number }[]
type Win = { cur: number; trend: number | null }
type D = {
  leadsAllowed: boolean
  d1: Win
  d7: Win
  d30: Win
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

const title = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export async function Dashboard(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell bare view={props} title={tr(lang, 'dashboard')} sub={tr(lang, 'dashboardSub')}>
      {async ({ payload, user }) => {
        const d = (await dashboardData(payload, user)) as unknown as D
        const isAdmin = can(user.role, 'system.view')
        const reviewer = can(user.role, 'workflow.approve') || can(user.role, 'workflow.publish')
        const [bk, hl, um] = await Promise.all([
          isAdmin ? backupInfo() : null,
          isAdmin ? health(payload) : null,
          umamiData(),
        ])
        return (
          <>
            <div className="ir-actions">
              {can(user.role, 'project.write') && (
                <Link className="ir-btn" href="/admin/collections/projects/create">
                  {tr(lang, 'newProject')}
                </Link>
              )}
              {can(user.role, 'content.write') && (
                <Link className="ir-btn" href="/admin/collections/journal-posts/create">
                  {tr(lang, 'newPost')}
                </Link>
              )}
              {can(user.role, 'media.write') && (
                <Link className="ir-btn ghost" href="/admin/collections/media/create">
                  {tr(lang, 'uploadMedia')}
                </Link>
              )}
              {d.leadsAllowed && (
                <Link className="ir-btn ghost" href="/admin/leads-board">
                  {tr(lang, 'openBoard')}
                </Link>
              )}
              <a className="ir-btn ghost" href="/" target="_blank" rel="noreferrer">
                {tr(lang, 'viewSite')}
                <span className="ir-sr"> (opens in a new tab)</span>
              </a>
            </div>

            {d.leadsAllowed && (
              <>
                <KpiGrid>
                  <Kpi
                    icon="inbox"
                    label={tr(lang, 'newToday')}
                    value={d.d1.cur}
                    trend={d.d1.trend}
                  />
                  <Kpi icon="inbox" label={tr(lang, 'new7')} value={d.d7.cur} trend={d.d7.trend} />
                  <Kpi
                    icon="inbox"
                    label={tr(lang, 'new30')}
                    value={d.d30.cur}
                    trend={d.d30.trend}
                  />
                  <Kpi icon="user" label={tr(lang, 'unassigned')} value={d.unassigned} />
                  <Kpi icon="clock" label={tr(lang, 'overdue')} value={d.overdue} />
                  <Kpi icon="trophy" label={tr(lang, 'wonMonth')} value={d.won} />
                </KpiGrid>
                <div className="ir-cols">
                  <Card title={tr(lang, 'weekly')}>
                    <LineChart data={d.weeks} name="Enquiries per week over the last 12 weeks" />
                  </Card>
                  <Card title={tr(lang, 'funnel')}>
                    <Funnel data={d.funnel} name="Pipeline funnel from new to won" />
                  </Card>
                  <Card title={tr(lang, 'bySector')}>
                    <Donut data={d.sectors} name="Enquiries by sector" />
                  </Card>
                  <Card title={tr(lang, 'bySource')}>
                    <HBars data={d.sources} name="Enquiries by source" />
                  </Card>
                </div>
              </>
            )}

            <KpiGrid>
              {reviewer && <Kpi icon="review" label={tr(lang, 'awaiting')} value={d.awaiting} />}
              <Kpi
                icon="folder"
                label={tr(lang, 'pubProjects')}
                value={d.published['projects'] ?? 0}
              />
              <Kpi
                icon="check"
                label={tr(lang, 'pubServices')}
                value={d.published['services'] ?? 0}
              />
              <Kpi
                icon="chart"
                label={tr(lang, 'pubPosts')}
                value={d.published['journal-posts'] ?? 0}
              />
              <Kpi icon="shield" label={tr(lang, 'unverified')} value={d.unverified} />
              <Kpi icon="flag" label={tr(lang, 'confirm')} value={d.confirm} />
              {bk?.at ? (
                <Kpi
                  icon="shield"
                  label={tr(lang, 'lastBackup')}
                  value={relTime(bk.at)}
                  note={fmtDate(bk.at)}
                />
              ) : null}
              {hl ? (
                <Kpi
                  icon="heart"
                  label={tr(lang, 'siteHealth')}
                  value={hl.db && hl.worker ? 'OK' : hl.db ? 'Worker Down' : 'DB Down'}
                />
              ) : null}
              {um ? (
                <Kpi
                  icon="users"
                  label={tr(lang, 'visitors')}
                  value={um.visitors}
                  note={`${String(um.pageviews)} page views`}
                />
              ) : null}
            </KpiGrid>

            {um && um.pages.length > 0 && (
              <div className="ir-cols">
                <Card title={tr(lang, 'topPages')}>
                  <HBars
                    data={um.pages.map((p) => ({ label: p.x, value: p.y }))}
                    name="Top pages"
                  />
                </Card>
              </div>
            )}

            <div className="ir-cols">
              {d.leadsAllowed && (
                <Card title={tr(lang, 'dueToday')}>
                  {d.due.length === 0 ? (
                    <p className="ir-muted ir-empty">Nothing due today.</p>
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
                <Card title={tr(lang, 'latest')}>
                  <ul className="ir-list">
                    {d.latest.map((l) => (
                      <li key={l.id}>
                        <Link href={`/admin/lead?id=${String(l.id)}`}>
                          {l.ref} {l.name}
                        </Link>
                        <Badge>{title(l.status ?? 'new')}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              <Card title={tr(lang, 'activity')}>
                {d.activity.length === 0 ? (
                  <p className="ir-muted ir-empty">No activity visible to your role.</p>
                ) : (
                  <ul className="ir-list">
                    {d.activity.map((a) => (
                      <li key={a.id}>
                        <span>
                          {typeof a.actor === 'object' && a.actor ? a.actor.name : 'System'} ·{' '}
                          {a.action} {a.collection}
                        </span>
                        <span className="ir-muted">{relTime(a.at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              {reviewer && (
                <Card title={tr(lang, 'reviewCard')}>
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
