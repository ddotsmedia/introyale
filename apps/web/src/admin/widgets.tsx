import Link from 'next/link'
import type { ReactNode } from 'react'
import { Heatmap, Ring, SeriesChart, Sparkline } from './charts'
import type { Exec } from './dashStats'
import type { Task } from '../lib/crmPlus'
import { can, type Role } from '../lib/roles'
import { delta, fmtDuration } from '../lib/analytics/range'
import type { DayRow, Totals } from '../lib/analytics/query'
import { fmtBytes } from './system'
import { Badge, Card, Donut, fmtDate, Funnel, HBars, Kpi, KpiGrid, LineChart, relTime } from './ui'
import { tr } from './labels'

// Dashboard widget registry (admin v3). Each widget is a server-rendered card group; the layout (order and
// visibility) is saved per user and falls back to a role-aware default.

type Series = { label: string; value: number }[]
type Win = { cur: number; trend: number | null }
type Lead = {
  id: number
  ref: string
  name?: string
  status?: string
  followUpAt?: string
  score?: number | null
}
type Act = {
  id: number
  action: string
  collection: string
  at: string
  actor?: { name?: string } | number | null
}
export type D = {
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
export type Ctx = {
  lang: string
  role: Role
  d: D
  ex: Exec | null
  traffic: { days: DayRow[]; totals: Totals; prev: Totals; heat: number[][] } | null
  tasks: Task[]
  health: { db: boolean; worker: boolean } | null
  backup: { at: Date | null } | null
  disk: { free: number; total: number } | null
  dbBytes: number | null
  mediaBytes: number | null
  version: string
}

const title = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`

export type Widget = {
  id: string
  title: string
  size: 'full' | 'half'
  show: (role: Role) => boolean
  render: (c: Ctx) => ReactNode
}

const leads = (r: Role) => can(r, 'enquiries.read')
const analytics = (r: Role) => can(r, 'analytics.view')
const admin = (r: Role) => can(r, 'system.view')
const reviewer = (r: Role) => can(r, 'workflow.approve') || can(r, 'workflow.publish')

export const WIDGETS: Widget[] = [
  {
    id: 'exec',
    title: 'Executive overview',
    size: 'full',
    show: leads,
    render: ({ ex }) =>
      ex ? (
        <KpiGrid>
          <div className="ir-card">
            <Ring
              value={ex.monthCount}
              goal={ex.settings.goal}
              label={
                ex.settings.goal ? (
                  <>
                    <b>Monthly lead goal</b>
                    <br />
                    <small className="ir-muted">enquiries this month</small>
                  </>
                ) : (
                  <small className="ir-muted">
                    Set a monthly goal in Consultation settings to track progress. {ex.monthCount}{' '}
                    enquiries this month.
                  </small>
                )
              }
            />
          </div>
          <Kpi
            icon="trophy"
            label="Pipeline value"
            value={aed(ex.pipelineValue)}
            note={`${String(ex.withValue)} of ${String(ex.openCount)} open leads have a value`}
          />
          <Kpi
            icon="chart"
            label="Weighted forecast"
            value={aed(ex.weighted)}
            note="value x stage probability"
          />
          <Kpi
            icon="check"
            label="Win rate (180 days)"
            value={ex.winRate == null ? '—' : `${String(ex.winRate)}%`}
            note="won / (won + lost)"
          />
          <Kpi
            icon="clock"
            label="Avg. first response"
            value={ex.avgResponseHours == null ? '—' : `${String(ex.avgResponseHours)} h`}
            note="business hours"
            invert
          />
          <Kpi
            icon="flag"
            label="SLA breaches"
            value={ex.slaBreaches}
            note={`target ${String(ex.settings.slaHours)} business hours`}
          />
        </KpiGrid>
      ) : null,
  },
  {
    id: 'kpi',
    title: 'Enquiries at a glance',
    size: 'full',
    show: leads,
    render: ({ d, lang, traffic }) => {
      const spark = traffic ? traffic.days.slice(-14).map((x) => x.enquiries) : []
      return (
        <KpiGrid>
          <Kpi icon="inbox" label={tr(lang, 'newToday')} value={d.d1.cur} trend={d.d1.trend} />
          <Kpi
            icon="inbox"
            label={tr(lang, 'new7')}
            value={d.d7.cur}
            trend={d.d7.trend}
            spark={spark.length ? <Sparkline values={spark} /> : undefined}
          />
          <Kpi icon="inbox" label={tr(lang, 'new30')} value={d.d30.cur} trend={d.d30.trend} />
          <Kpi icon="user" label={tr(lang, 'unassigned')} value={d.unassigned} />
          <Kpi icon="clock" label={tr(lang, 'overdue')} value={d.overdue} />
          <Kpi icon="trophy" label={tr(lang, 'wonMonth')} value={d.won} />
        </KpiGrid>
      )
    },
  },
  {
    id: 'traffic',
    title: 'Website traffic',
    size: 'full',
    show: analytics,
    render: ({ traffic }) =>
      traffic ? (
        <KpiGrid>
          <Kpi
            icon="users"
            label="Visitors (30 days)"
            value={traffic.totals.visitors.toLocaleString()}
            trend={delta(traffic.totals.visitors, traffic.prev.visitors)}
            spark={<Sparkline values={traffic.days.map((x) => x.visitors)} />}
          />
          <Kpi
            icon="chart"
            label="Sessions"
            value={traffic.totals.sessions.toLocaleString()}
            trend={delta(traffic.totals.sessions, traffic.prev.sessions)}
            spark={<Sparkline values={traffic.days.map((x) => x.sessions)} />}
          />
          <Kpi
            icon="folder"
            label="Pageviews"
            value={traffic.totals.views.toLocaleString()}
            trend={delta(traffic.totals.views, traffic.prev.views)}
            spark={<Sparkline values={traffic.days.map((x) => x.views)} />}
          />
          <Kpi
            icon="trophy"
            label="Conversion"
            value={`${String(traffic.totals.conversion)}%`}
            note={`avg. session ${fmtDuration(traffic.totals.avgDuration)}`}
            trend={delta(traffic.totals.conversion, traffic.prev.conversion)}
          />
        </KpiGrid>
      ) : null,
  },
  {
    id: 'trend',
    title: 'Enquiries vs visitors',
    size: 'full',
    show: analytics,
    render: ({ traffic }) =>
      traffic ? (
        <Card title="Enquiries vs visitors (30 days)">
          <SeriesChart
            days={traffic.days.map((x) => x.day)}
            name="Visitors and enquiries per day, last 30 days"
            series={[
              { label: 'Visitors', values: traffic.days.map((x) => x.visitors), area: true },
              { label: 'Enquiries', values: traffic.days.map((x) => x.enquiries) },
            ]}
          />
          <p>
            <Link className="ir-btn ghost" href="/admin/analytics">
              Open full analytics
            </Link>
          </p>
        </Card>
      ) : null,
  },
  {
    id: 'weekly',
    title: 'Enquiries per week',
    size: 'half',
    show: leads,
    render: ({ d, lang }) => (
      <Card title={tr(lang, 'weekly')}>
        <LineChart data={d.weeks} name="Enquiries per week over the last 12 weeks" />
      </Card>
    ),
  },
  {
    id: 'funnel',
    title: 'Pipeline funnel',
    size: 'half',
    show: leads,
    render: ({ d, lang }) => (
      <Card title={tr(lang, 'funnel')}>
        <Funnel data={d.funnel} name="Pipeline funnel from new to won" />
      </Card>
    ),
  },
  {
    id: 'sectors',
    title: 'Sector performance',
    size: 'half',
    show: leads,
    render: ({ d, ex, lang }) => (
      <Card title="Sector performance">
        <Donut data={d.sectors} name={tr(lang, 'bySector')} />
        {ex && ex.bySector.length ? (
          <table className="ir-table">
            <caption className="ir-sr">Win rate by sector</caption>
            <thead>
              <tr>
                <th scope="col">Sector</th>
                <th scope="col">Leads</th>
                <th scope="col">Won</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {ex.bySector.map((s) => (
                <tr key={s.sector}>
                  <td>{s.sector}</td>
                  <td>{s.leads}</td>
                  <td>{s.won}</td>
                  <td>{s.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Card>
    ),
  },
  {
    id: 'sources',
    title: 'Leads by source',
    size: 'half',
    show: leads,
    render: ({ ex }) => (
      <Card title="Leads by source (90 days)">
        <HBars data={ex?.bySource ?? []} name="Enquiries by traffic source" />
      </Card>
    ),
  },
  {
    id: 'heatmap',
    title: 'Enquiry activity heatmap',
    size: 'half',
    show: analytics,
    render: ({ traffic }) =>
      traffic ? (
        <Card title="When enquiries arrive (90 days, Dubai time)">
          <Heatmap grid={traffic.heat} name="Enquiries by weekday and hour" unit="enquiries" />
        </Card>
      ) : null,
  },
  {
    id: 'leaderboard',
    title: 'Assignee leaderboard',
    size: 'half',
    show: admin,
    render: ({ ex }) => (
      <Card title="Assignee leaderboard (180 days)">
        {ex && ex.leaderboard.length ? (
          <table className="ir-table">
            <caption className="ir-sr">Leads, wins and response time by assignee</caption>
            <thead>
              <tr>
                <th scope="col">Assignee</th>
                <th scope="col">Leads</th>
                <th scope="col">Won</th>
                <th scope="col">Avg. response</th>
              </tr>
            </thead>
            <tbody>
              {ex.leaderboard.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>{p.leads}</td>
                  <td>{p.won}</td>
                  <td>{p.avgHours == null ? '—' : `${String(p.avgHours)} h`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="ir-muted ir-empty">No assigned leads yet.</p>
        )}
      </Card>
    ),
  },
  {
    id: 'tasks',
    title: 'My tasks and follow-ups',
    size: 'half',
    show: leads,
    render: ({ d, tasks, lang }) => (
      <Card title={`${tr(lang, 'dueToday')} · tasks`}>
        {d.due.length + tasks.length === 0 ? (
          <p className="ir-muted ir-empty">Nothing due today.</p>
        ) : (
          <ul className="ir-list">
            {tasks.map((t) => (
              <li key={`t${String(t.id)}`}>
                <Link href={`/admin/lead?id=${String(t.enquiry_id)}`}>
                  {t.title} · {t.ref}
                </Link>
                <span>{fmtDate(t.due_at)}</span>
              </li>
            ))}
            {d.due.map((l) => (
              <li key={`f${String(l.id)}`}>
                <Link href={`/admin/lead?id=${String(l.id)}`}>
                  Follow up {l.ref} {l.name}
                </Link>
                <span>{fmtDate(l.followUpAt)}</span>
              </li>
            ))}
          </ul>
        )}
        <p>
          <Link className="ir-btn ghost" href="/admin/calendar">
            Open the calendar
          </Link>
        </p>
      </Card>
    ),
  },
  {
    id: 'latest',
    title: 'Latest enquiries',
    size: 'half',
    show: leads,
    render: ({ d, lang }) => (
      <Card title={tr(lang, 'latest')}>
        <ul className="ir-list">
          {d.latest.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/lead?id=${String(l.id)}`}>
                {l.ref} {l.name}
              </Link>
              <span>
                {l.score != null ? (
                  <Badge tone={l.score >= 70 ? 'ok' : l.score >= 40 ? 'warn' : undefined}>
                    {l.score}
                  </Badge>
                ) : null}{' '}
                <Badge>{title(l.status ?? 'new')}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    ),
  },
  {
    id: 'review',
    title: 'Content awaiting review',
    size: 'half',
    show: reviewer,
    render: ({ d, lang }) => (
      <Card title={tr(lang, 'reviewCard')}>
        <p>
          <Link href="/admin/workflow">Open the workflow board</Link>: {d.awaiting} item(s) in
          review.
        </p>
      </Card>
    ),
  },
  {
    id: 'content',
    title: 'Content status',
    size: 'full',
    show: () => true,
    render: ({ d, lang, role }) => (
      <KpiGrid>
        {reviewer(role) && <Kpi icon="review" label={tr(lang, 'awaiting')} value={d.awaiting} />}
        <Kpi icon="folder" label={tr(lang, 'pubProjects')} value={d.published['projects'] ?? 0} />
        <Kpi icon="check" label={tr(lang, 'pubServices')} value={d.published['services'] ?? 0} />
        <Kpi icon="chart" label={tr(lang, 'pubPosts')} value={d.published['journal-posts'] ?? 0} />
        <Kpi icon="shield" label={tr(lang, 'unverified')} value={d.unverified} />
        <Kpi icon="flag" label={tr(lang, 'confirm')} value={d.confirm} />
      </KpiGrid>
    ),
  },
  {
    id: 'health',
    title: 'Site health',
    size: 'half',
    show: admin,
    render: ({ health, backup, disk, dbBytes, mediaBytes, version }) => (
      <Card title="Site health">
        <ul className="ir-list">
          <li>
            Website and database{' '}
            <Badge tone={health?.db ? 'ok' : 'bad'}>{health?.db ? 'Up' : 'Down'}</Badge>
          </li>
          <li>
            Background worker{' '}
            <Badge tone={health?.worker ? 'ok' : 'bad'}>{health?.worker ? 'Up' : 'Down'}</Badge>
          </li>
          <li>
            Last backup{' '}
            {backup?.at ? (
              <span>
                {relTime(backup.at)} <small className="ir-muted">({fmtDate(backup.at)})</small>
              </span>
            ) : (
              <Badge tone="warn">Not reported</Badge>
            )}
          </li>
          <li>
            Disk free{' '}
            {disk ? (
              <Badge
                tone={
                  disk.free / disk.total < 0.1
                    ? 'bad'
                    : disk.free / disk.total < 0.2
                      ? 'warn'
                      : 'ok'
                }
              >
                {fmtBytes(disk.free)} of {fmtBytes(disk.total)}
              </Badge>
            ) : (
              'n/a'
            )}
          </li>
          <li>
            Database {fmtBytes(dbBytes)} · media {fmtBytes(mediaBytes)}
          </li>
          <li>Version {version}</li>
        </ul>
        <p>
          <Link className="ir-btn ghost" href="/admin/system">
            Open system status
          </Link>
        </p>
      </Card>
    ),
  },
  {
    id: 'activity',
    title: 'Recent activity',
    size: 'half',
    show: () => true,
    render: ({ d, lang }) => (
      <Card title={tr(lang, 'activity')}>
        {d.activity.length === 0 ? (
          <p className="ir-muted ir-empty">No activity visible to your role.</p>
        ) : (
          <ul className="ir-list">
            {d.activity.map((a) => (
              <li key={a.id}>
                <span>
                  {typeof a.actor === 'object' && a.actor ? a.actor.name : 'System'} · {a.action}{' '}
                  {a.collection}
                </span>
                <span className="ir-muted">{relTime(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    ),
  },
]

const DEFAULTS: Record<'sales' | 'editor' | 'admin', string[]> = {
  admin: [
    'exec',
    'kpi',
    'traffic',
    'trend',
    'funnel',
    'sectors',
    'sources',
    'heatmap',
    'leaderboard',
    'tasks',
    'latest',
    'review',
    'health',
    'activity',
    'content',
    'weekly',
  ],
  sales: [
    'exec',
    'kpi',
    'tasks',
    'latest',
    'funnel',
    'sources',
    'review',
    'activity',
    'content',
    'traffic',
  ],
  editor: ['content', 'review', 'activity'],
}

export type Layout = { order: string[]; hidden: string[] }

/** Defaults by role: administrators see everything, lead roles see sales widgets, editors see content widgets. */
export function defaultLayout(role: Role): Layout {
  const base =
    role === 'administrator'
      ? DEFAULTS.admin
      : can(role, 'enquiries.read')
        ? DEFAULTS.sales
        : DEFAULTS.editor
  return { order: base.filter((id) => WIDGETS.find((w) => w.id === id)?.show(role)), hidden: [] }
}

/** Saved layout merged with what the role may see: unknown or forbidden ids are dropped, new widgets are appended hidden-free. */
export function resolveLayout(saved: unknown, role: Role): Layout {
  const allowed = WIDGETS.filter((w) => w.show(role)).map((w) => w.id)
  const def = defaultLayout(role)
  const s = saved as Partial<Layout> | null
  if (!s || !Array.isArray(s.order)) return def
  const order = s.order.filter((id): id is string => typeof id === 'string' && allowed.includes(id))
  for (const id of def.order)
    if (!order.includes(id) && !(s.hidden ?? []).includes(id)) order.push(id)
  const hidden = (Array.isArray(s.hidden) ? s.hidden : []).filter(
    (id): id is string => typeof id === 'string' && allowed.includes(id),
  )
  return { order: [...new Set(order)], hidden: [...new Set(hidden)] }
}
