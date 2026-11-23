import {
  CalendarCheck,
  FileEdit,
  Inbox,
  LogIn,
  PlusCircle,
  Trash2,
  Users as UsersIcon,
  BarChart3,
  Target,
  Eye,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Heatmap, Ring } from './charts'
import type { Exec } from './dashStats'
import { LazyChart } from './components/LazyChart'
import { PALETTE } from './components/ChartImpl'
import type { Task } from '../lib/crmPlus'
import { can, type Role } from '../lib/roles'
import { delta, fmtDuration } from '../lib/analytics/range'
import { rate, type DayRow, type Top, type Totals, type Vital } from '../lib/analytics/query'
import { fmtBytes } from './system'
import { fmtDate, relTime } from './ui'
import { Av, BarRows, Empty, Panel, Pill, Tile } from './kit'
import { tr } from './labels'

// Dashboard widget registry (admin v4). Each widget is a server-rendered card on a 12-column grid; the layout
// (order and visibility) is saved per user and falls back to a role-aware default.

type Series = { label: string; value: number }[]
type Win = { cur: number; trend: number | null }
type Lead = {
  id: number
  ref: string
  name?: string
  status?: string
  followUpAt?: string
  score?: number | null
  sector?: string | null
  estimatedValue?: number | null
  createdAt?: string
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
export type Traffic = {
  days: DayRow[]
  totals: Totals
  prev: Totals
  heat: number[][]
  pages: Top[]
  projects: Top[]
  vitals: Vital[]
}
export type Ctx = {
  lang: string
  role: Role
  d: D
  ex: Exec | null
  traffic: Traffic | null
  tasks: Task[]
  health: { db: boolean; worker: boolean } | null
  backup: { at: Date | null } | null
  disk: { free: number; total: number } | null
  dbBytes: number | null
  mediaBytes: number | null
  version: string
  rangeDays: number
}

const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`
const short = (d: string) => d.slice(5).replace('-', '/')

export type Widget = {
  id: string
  title: string
  /** Columns of the 12-column grid on wide screens (narrower screens stack or pair). */
  span: 4 | 6 | 8 | 12
  show: (role: Role) => boolean
  render: (c: Ctx) => ReactNode
}

const leads = (r: Role) => can(r, 'enquiries.read')
const analytics = (r: Role) => can(r, 'analytics.view')
const admin = (r: Role) => can(r, 'system.view')
const reviewer = (r: Role) => can(r, 'workflow.approve') || can(r, 'workflow.publish')

const ACT_ICON: [RegExp, LucideIcon][] = [
  [/create|add|new/i, PlusCircle],
  [/delete|remove/i, Trash2],
  [/login|sign/i, LogIn],
  [/lead|enquir|assign|status/i, Inbox],
]
const actIcon = (a: string): LucideIcon => ACT_ICON.find(([re]) => re.test(a))?.[1] ?? FileEdit

export const WIDGETS: Widget[] = [
  {
    id: 'kpi',
    title: 'Key numbers',
    span: 12,
    show: (r) => leads(r) || analytics(r),
    render: ({ d, ex, traffic, lang, rangeDays }) => {
      const t = traffic
      return (
        <div className="ir-tiles">
          {t && (
            <Tile
              id="vis"
              icon="users"
              label="Visitors"
              value={t.totals.visitors.toLocaleString('en-US')}
              delta={delta(t.totals.visitors, t.prev.visitors)}
              spark={t.days.map((x) => x.visitors)}
              note={`last ${String(rangeDays)} days`}
              href="/admin/analytics"
            />
          )}
          {d.leadsAllowed && (
            <Tile
              id="enq"
              icon="inbox"
              label="Enquiries"
              value={t ? t.totals.enquiries.toLocaleString('en-US') : d.d30.cur}
              delta={t ? delta(t.totals.enquiries, t.prev.enquiries) : d.d30.trend}
              spark={t?.days.map((x) => x.enquiries)}
              note={tr(lang, 'new30')}
              href="/admin/leads"
            />
          )}
          {t && (
            <Tile
              id="conv"
              icon="percent"
              label="Conversion rate"
              value={`${String(t.totals.conversion)}%`}
              delta={delta(t.totals.conversion, t.prev.conversion)}
              note={`avg. session ${fmtDuration(t.totals.avgDuration)}`}
            />
          )}
          {ex && (
            <Tile
              id="pipe"
              icon="wallet"
              label="Pipeline value"
              value={aed(ex.pipelineValue)}
              note={
                ex.withValue
                  ? `${String(ex.withValue)} of ${String(ex.openCount)} open leads valued`
                  : 'Add estimated values to leads'
              }
              href="/admin/leads-board"
            />
          )}
          {d.leadsAllowed && (
            <Tile
              id="won"
              icon="trophy"
              label="Won this month"
              value={d.won}
              note={d.won ? 'closed deals' : 'Your first win appears here'}
            />
          )}
          {ex && (
            <Tile
              id="resp"
              icon="clock"
              label="Avg. first response"
              value={ex.avgResponseHours == null ? 'No data' : `${String(ex.avgResponseHours)} h`}
              note={ex.avgResponseHours == null ? 'Shows after your first reply' : 'business hours'}
            />
          )}
        </div>
      )
    },
  },
  {
    id: 'trend',
    title: 'Visitors vs enquiries',
    span: 8,
    show: analytics,
    render: ({ traffic, rangeDays }) => (
      <Panel title="Visitors vs enquiries" action="Full analytics" href="/admin/analytics">
        {traffic && traffic.totals.visitors + traffic.totals.enquiries > 0 ? (
          <LazyChart
            kind="area"
            name={`Visitors and enquiries per day, last ${String(rangeDays)} days`}
            xKey="day"
            xLabel="Day"
            data={traffic.days.map((x) => ({
              day: short(x.day),
              visitors: x.visitors,
              enquiries: x.enquiries,
            }))}
            series={[
              { key: 'visitors', label: 'Visitors', color: PALETTE[0] ?? '' },
              { key: 'enquiries', label: 'Enquiries', color: PALETTE[1] ?? '' },
            ]}
          />
        ) : (
          <Empty
            icon={BarChart3}
            text="Visitors will appear here once people start browsing the site."
            cta="Open the site"
            href="/"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'sources',
    title: 'Traffic sources',
    span: 4,
    show: leads,
    render: ({ ex }) => (
      <Panel title="Traffic sources" action="Details" href="/admin/analytics">
        {ex && ex.bySource.length ? (
          <LazyChart
            kind="donut"
            name="Enquiries by traffic source, last 90 days"
            xLabel="Source"
            height={190}
            data={ex.bySource.map((s) => ({ label: s.label, value: s.value }))}
          />
        ) : (
          <Empty
            icon={Eye}
            text="Share your site to see where enquiries come from."
            cta="View site"
            href="/"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'funnel',
    title: 'Pipeline funnel',
    span: 6,
    show: leads,
    render: ({ d }) => {
      const top = d.funnel[0]?.value ?? 0
      return (
        <Panel title="Pipeline funnel" action="Open board" href="/admin/leads-board">
          {top === 0 ? (
            <Empty
              icon={Inbox}
              text="No enquiries yet. They will flow through these stages."
              cta="View the consultation page"
              href="/contact"
            />
          ) : (
            <ol className="ir-fn">
              {d.funnel.map((s, i) => {
                const prev = d.funnel[i - 1]?.value
                return (
                  <li key={s.label}>
                    {prev != null && (
                      <span className="ir-fn-conv">
                        {prev ? Math.round((s.value / prev) * 100) : 0}% continue
                      </span>
                    )}
                    <div className="ir-fn-row">
                      <span>{s.label}</span>
                      <div className="ir-bar-track">
                        <i style={{ width: `${String(Math.max(4, (s.value / top) * 100))}%` }} />
                      </div>
                      <b className="ir-num">{s.value}</b>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>
      )
    },
  },
  {
    id: 'goal',
    title: 'Monthly goal',
    span: 6,
    show: leads,
    render: ({ ex }) => (
      <Panel title="Monthly goal" action="Settings" href="/admin/globals/consultation-settings">
        {ex && ex.settings.goal ? (
          <div className="ir-goal">
            <Ring
              value={ex.monthCount}
              goal={ex.settings.goal}
              label={
                <>
                  <b>Enquiries this month</b>
                  <br />
                  <small className="ir-muted">goal {ex.settings.goal}</small>
                </>
              }
            />
            <dl className="ir-stats">
              <div>
                <dt>Win rate (180 days)</dt>
                <dd className="ir-num">
                  {ex.winRate == null ? 'No data' : `${String(ex.winRate)}%`}
                </dd>
              </div>
              <div>
                <dt>SLA ({String(ex.settings.slaHours)} business h)</dt>
                <dd>
                  <span className={`ir-pill ${ex.slaBreaches ? 'bad' : 'ok'}`}>
                    {ex.slaBreaches ? `${String(ex.slaBreaches)} breached` : 'On track'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Weighted forecast</dt>
                <dd className="ir-num">{aed(ex.weighted)}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <Empty
            icon={Target}
            text={`Set a monthly enquiry goal to track progress${ex ? ` (${String(ex.monthCount)} so far this month)` : ''}.`}
            cta="Set monthly goal"
            href="/admin/globals/consultation-settings"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'latest',
    title: 'Latest enquiries',
    span: 8,
    show: leads,
    render: ({ d }) => (
      <Panel title="Latest enquiries" action="View all" href="/admin/leads">
        {d.latest.length === 0 ? (
          <Empty
            icon={Inbox}
            text="No enquiries yet. Visitors reach you from the consultation page."
            cta="View the consultation page"
            href="/contact"
          />
        ) : (
          <div className="ir-scroll-x">
            <table className="ir-table ir-compact">
              <caption className="ir-sr">Latest enquiries</caption>
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Sector</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="num">
                    Value
                  </th>
                  <th scope="col" className="num">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.latest.slice(0, 7).map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link className="ir-who" href={`/admin/lead?id=${String(l.id)}`}>
                        <Av name={l.name ?? l.ref} />
                        <span>
                          <b>{l.name ?? l.ref}</b>
                          <small>{l.ref}</small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      {l.sector ? (
                        <span className="ir-chip-tag">{l.sector.replace(/[_-]/g, ' ')}</span>
                      ) : (
                        <span className="ir-muted">Unspecified</span>
                      )}
                    </td>
                    <td>
                      <Pill status={l.status} />
                    </td>
                    <td className="num ir-num">
                      {l.estimatedValue ? (
                        aed(l.estimatedValue)
                      ) : (
                        <span className="ir-muted">Not set</span>
                      )}
                    </td>
                    <td className="num ir-muted">{relTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    ),
  },
  {
    id: 'activity',
    title: 'Recent activity',
    span: 4,
    show: () => true,
    render: ({ d, lang }) => (
      <Panel title={tr(lang, 'activity')}>
        {d.activity.length === 0 ? (
          <Empty icon={CalendarCheck} text="No activity visible to your role yet." />
        ) : (
          <ul className="ir-feed">
            {d.activity.map((a) => {
              const Icon = actIcon(a.action)
              const who =
                typeof a.actor === 'object' && a.actor ? (a.actor.name ?? 'Staff') : 'System'
              return (
                <li key={a.id}>
                  <span className="ir-feed-ico">
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="ir-feed-text">
                    <b>{who}</b> {a.action.replace(/[._]/g, ' ')}{' '}
                    <span className="ir-muted">{a.collection.replace(/-/g, ' ')}</span>
                  </span>
                  <small className="ir-muted">{relTime(a.at)}</small>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    ),
  },
  {
    id: 'heatmap',
    title: 'Enquiry activity heatmap',
    span: 6,
    show: analytics,
    render: ({ traffic }) => (
      <Panel title="When enquiries arrive" action="Dubai time, 90 days" href="/admin/analytics">
        {traffic && traffic.heat.flat().some(Boolean) ? (
          <Heatmap grid={traffic.heat} name="Enquiries by weekday and hour" unit="enquiries" />
        ) : (
          <Empty
            icon={CalendarCheck}
            text="The busiest weekdays and hours appear after your first enquiries."
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'leaderboard',
    title: 'Team leaderboard',
    span: 6,
    show: admin,
    render: ({ ex }) => (
      <Panel title="Team leaderboard" action="180 days" href="/admin/leads">
        {ex && ex.leaderboard.length ? (
          <ul className="ir-lb">
            {ex.leaderboard.map((p, i) => (
              <li key={p.name}>
                <span className="ir-rank">{i + 1}</span>
                <Av name={p.name} size={30} />
                <div className="ir-lb-main">
                  <div className="ir-bar-top">
                    <b>{p.name}</b>
                    <span className="ir-num">
                      {p.won} won <small className="ir-muted">of {p.leads}</small>
                    </span>
                  </div>
                  <div className="ir-bar-track">
                    <i
                      style={{
                        width: `${String(Math.max(4, p.leads ? (p.won / p.leads) * 100 : 0))}%`,
                      }}
                    />
                  </div>
                  <small className="ir-muted">
                    {p.avgHours == null
                      ? 'No replies yet'
                      : `avg. response ${String(p.avgHours)} h`}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty
            icon={UserCheck}
            text="Assign enquiries to team members to see who closes the most."
            cta="Open the board"
            href="/admin/leads-board"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'pages',
    title: 'Top pages and projects',
    span: 6,
    show: analytics,
    render: ({ traffic }) => (
      <Panel title="Top pages and projects" action="Analytics" href="/admin/analytics">
        {traffic && (traffic.pages.length || traffic.projects.length) ? (
          <div className="ir-two">
            <div>
              <h3>Pages</h3>
              <BarRows
                unit="views"
                rows={traffic.pages.slice(0, 5).map((p) => ({ label: p.key, value: p.views }))}
              />
            </div>
            <div>
              <h3>Projects</h3>
              {traffic.projects.length ? (
                <BarRows
                  unit="views"
                  rows={traffic.projects.slice(0, 5).map((p) => ({
                    label: p.key.replace('/work/', ''),
                    value: p.views,
                  }))}
                />
              ) : (
                <p className="ir-muted">No project views yet.</p>
              )}
            </div>
          </div>
        ) : (
          <Empty
            icon={Eye}
            text="Page views appear once visitors browse the site."
            cta="View site"
            href="/"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'health',
    title: 'Site health',
    span: 6,
    show: admin,
    render: ({ health, backup, disk, dbBytes, mediaBytes, version, traffic }) => {
      const vit = ['LCP', 'INP', 'CLS'].flatMap((n) => {
        const rows = (traffic?.vitals ?? []).filter((v) => v.name === n && v.samples > 0)
        const samples = rows.reduce((a, b) => a + b.samples, 0)
        if (!samples) return []
        const p75 = rows.reduce((a, b) => a + b.p75 * b.samples, 0) / samples
        return [{ n, p75, r: rate(n, p75) }]
      })
      const used = disk ? 1 - disk.free / disk.total : 0
      const up = health?.db && health.worker
      return (
        <Panel title="Site health" action="System status" href="/admin/system">
          <ul className="ir-health">
            <li>
              <span>Uptime</span>
              <span className={`ir-pill ${up ? 'ok' : 'bad'}`}>
                {up ? 'All systems up' : 'Check system'}
              </span>
            </li>
            <li>
              <span>Last backup</span>
              {backup?.at ? (
                <b title={fmtDate(backup.at)}>{relTime(backup.at)}</b>
              ) : (
                <span className="ir-pill warn">Not reported</span>
              )}
            </li>
            <li className="ir-health-disk">
              <span>Disk</span>
              {disk ? (
                <>
                  <div className="ir-bar-track">
                    <i
                      className={used > 0.9 ? 'bad' : used > 0.8 ? 'warn' : ''}
                      style={{ width: `${String(Math.round(used * 100))}%` }}
                    />
                  </div>
                  <small className="ir-muted">
                    {fmtBytes(disk.free)} free of {fmtBytes(disk.total)}
                  </small>
                </>
              ) : (
                <span className="ir-muted">n/a</span>
              )}
            </li>
            <li>
              <span>Core Web Vitals</span>
              <span className="ir-vitals">
                {vit.length ? (
                  vit.map((v) => (
                    <span
                      key={v.n}
                      className={`ir-pill ${v.r === 'good' ? 'ok' : v.r === 'poor' ? 'bad' : 'warn'}`}
                      title={`p75 ${v.p75.toFixed(v.n === 'CLS' ? 2 : 0)}`}
                    >
                      {v.n} {v.r === 'needs improvement' ? 'ok-ish' : v.r}
                    </span>
                  ))
                ) : (
                  <span className="ir-muted">Collecting data</span>
                )}
              </span>
            </li>
            <li>
              <span>Storage</span>
              <span className="ir-muted">
                database {fmtBytes(dbBytes)} · media {fmtBytes(mediaBytes)} · v{version}
              </span>
            </li>
          </ul>
        </Panel>
      )
    },
  },
  {
    id: 'tasks',
    title: 'My tasks and follow-ups',
    span: 6,
    show: leads,
    render: ({ d, tasks, lang }) => (
      <Panel title={`${tr(lang, 'dueToday')} · tasks`} action="Calendar" href="/admin/calendar">
        {d.due.length + tasks.length === 0 ? (
          <Empty icon={CalendarCheck} text="Nothing due today. Enjoy the quiet." />
        ) : (
          <ul className="ir-feed">
            {tasks.map((t) => (
              <li key={`t${String(t.id)}`}>
                <span className="ir-feed-ico">
                  <CalendarCheck size={15} aria-hidden="true" />
                </span>
                <Link className="ir-feed-text" href={`/admin/lead?id=${String(t.enquiry_id)}`}>
                  {t.title} · {t.ref}
                </Link>
                <small className="ir-muted">{fmtDate(t.due_at)}</small>
              </li>
            ))}
            {d.due.map((l) => (
              <li key={`f${String(l.id)}`}>
                <span className="ir-feed-ico">
                  <UsersIcon size={15} aria-hidden="true" />
                </span>
                <Link className="ir-feed-text" href={`/admin/lead?id=${String(l.id)}`}>
                  Follow up {l.ref} {l.name}
                </Link>
                <small className="ir-muted">{fmtDate(l.followUpAt)}</small>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    ),
  },
  {
    id: 'review',
    title: 'Content awaiting review',
    span: 6,
    show: reviewer,
    render: ({ d, lang }) => (
      <Panel title={tr(lang, 'reviewCard')} action="Workflow board" href="/admin/workflow">
        {d.awaiting ? (
          <p className="ir-bignote">
            <b className="ir-num">{d.awaiting}</b> item{d.awaiting === 1 ? '' : 's'} waiting for
            review.
          </p>
        ) : (
          <Empty
            icon={FileEdit}
            text="Nothing is waiting for review."
            cta="Open the workflow board"
            href="/admin/workflow"
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'content',
    title: 'Content status',
    span: 12,
    show: () => true,
    render: ({ d, lang, role }) => (
      <div className="ir-tiles ir-tiles-sm">
        {reviewer(role) && (
          <Tile
            id="aw"
            icon="review"
            label={tr(lang, 'awaiting')}
            value={d.awaiting}
            href="/admin/workflow"
          />
        )}
        <Tile
          id="pp"
          icon="folder"
          label={tr(lang, 'pubProjects')}
          value={d.published['projects'] ?? 0}
        />
        <Tile
          id="ps"
          icon="review"
          label={tr(lang, 'pubServices')}
          value={d.published['services'] ?? 0}
        />
        <Tile
          id="pj"
          icon="post"
          label={tr(lang, 'pubPosts')}
          value={d.published['journal-posts'] ?? 0}
        />
        <Tile id="uv" icon="shield" label={tr(lang, 'unverified')} value={d.unverified} />
        <Tile id="cf" icon="flag" label={tr(lang, 'confirm')} value={d.confirm} />
      </div>
    ),
  },
  {
    id: 'weekly',
    title: 'Enquiries per week',
    span: 6,
    show: leads,
    render: ({ d, lang }) => (
      <Panel title={tr(lang, 'weekly')}>
        {d.weeks.every((w) => w.value === 0) ? (
          <Empty
            icon={BarChart3}
            text="Weekly enquiry volume appears after your first enquiries."
          />
        ) : (
          <LazyChart
            kind="bar"
            name="Enquiries per week over the last 12 weeks"
            xKey="week"
            xLabel="Week"
            height={220}
            data={d.weeks.map((w) => ({ week: w.label, enquiries: w.value }))}
            series={[{ key: 'enquiries', label: 'Enquiries', color: PALETTE[0] ?? '' }]}
          />
        )}
      </Panel>
    ),
  },
  {
    id: 'sectors',
    title: 'Sector performance',
    span: 6,
    show: leads,
    render: ({ d, ex, lang }) => (
      <Panel title="Sector performance">
        {d.sectors.length ? (
          <LazyChart
            kind="donut"
            name={tr(lang, 'bySector')}
            xLabel="Sector"
            height={190}
            data={d.sectors.map((s) => ({ label: s.label, value: s.value }))}
          />
        ) : (
          <Empty icon={Inbox} text="Sector performance appears after your first enquiries." />
        )}
        {ex && ex.bySector.length ? (
          <table className="ir-table ir-compact">
            <caption className="ir-sr">Win rate by sector</caption>
            <thead>
              <tr>
                <th scope="col">Sector</th>
                <th scope="col" className="num">
                  Leads
                </th>
                <th scope="col" className="num">
                  Won
                </th>
                <th scope="col" className="num">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {ex.bySector.map((s) => (
                <tr key={s.sector}>
                  <td>{s.sector}</td>
                  <td className="num">{s.leads}</td>
                  <td className="num">{s.won}</td>
                  <td className="num">{s.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    ),
  },
]

const DEFAULTS: Record<'sales' | 'editor' | 'admin', string[]> = {
  admin: [
    'kpi',
    'trend',
    'sources',
    'funnel',
    'goal',
    'latest',
    'activity',
    'heatmap',
    'leaderboard',
    'pages',
    'health',
    'tasks',
    'review',
    'content',
    'weekly',
    'sectors',
  ],
  sales: [
    'kpi',
    'trend',
    'sources',
    'funnel',
    'goal',
    'latest',
    'activity',
    'tasks',
    'review',
    'pages',
    'heatmap',
    'content',
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
