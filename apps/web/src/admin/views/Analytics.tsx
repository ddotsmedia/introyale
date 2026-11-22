import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { redirectFrom404 } from '../actions'
import { Heatmap, Sparkline, SeriesChart, DataTable } from '../charts'
import { AutoRefresh, PrintButton } from '../components/AnalyticsClient'
import { Shell, type SP } from '../Shell'
import { Badge, Card, Donut, Funnel, HBars, Kpi, KpiGrid } from '../ui'
import {
  assisted,
  conversionByDevice,
  conversionBySource,
  dailySeries,
  engagement,
  enquiryHeatmap,
  fresh,
  funnel,
  rate,
  realtime,
  storageEstimate,
  topKeys,
  totalsOf,
  vitals,
  vitalSeries,
  type Top,
} from '../../lib/analytics/query'
import { delta, fmtDuration, resolveRange } from '../../lib/analytics/range'
import { dubaiDay } from '../../lib/analytics/store'
import { fmtBytes } from '../system'

const PRESET_LABELS: [string, string][] = [
  ['today', 'Today'],
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['12m', '12 months'],
]
const str = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)
const pts = (rows: Top[], by: 'sessions' | 'views' | 'visitors' = 'sessions') =>
  rows.map((r) => ({ label: r.key, value: r[by] }))
const pretty = (v: number, name: string) =>
  name === 'CLS' ? v.toFixed(3) : `${String(Math.round(v))} ms`
const SECTOR_PATH = /^\/services\/[^/]+$/

export async function Analytics(props: AdminViewServerProps) {
  return (
    <Shell
      view={props}
      action="analytics.view"
      title="Analytics"
      sub="First-party, cookieless. No raw IPs, no cross-day tracking; staff and bots are excluded."
    >
      {async ({ payload, sp }) => <AnalyticsBody payload={payload} sp={sp} />}
    </Shell>
  )
}

async function AnalyticsBody({ payload, sp }: { payload: Parameters<typeof fresh>[0]; sp: SP }) {
  await fresh(payload)
  const rg = resolveRange(dubaiDay(), str(sp['range']), str(sp['from']), str(sp['to']))
  const compare = str(sp['compare']) !== '0'
  const { cur, prev } = rg
  const qs = (o: Record<string, string>) =>
    new URLSearchParams({
      range: rg.preset,
      compare: compare ? '1' : '0',
      ...(rg.preset === 'custom' ? { from: cur.from, to: cur.to } : {}),
      ...o,
    }).toString()
  const [
    days,
    prevDays,
    pages,
    projectsTop,
    sources,
    referrers,
    campaigns,
    devices,
    browsers,
    oses,
    regions,
    langs,
    entries,
    exits,
    events,
    prevEvents,
    nf,
    fun,
    bySource,
    byDevice,
    eng,
    vit,
    lcpTrend,
    assist,
    heat,
    live,
    storage,
  ] = await Promise.all([
    dailySeries(payload, cur),
    compare ? dailySeries(payload, prev) : Promise.resolve([]),
    topKeys(payload, 'page', cur, 10, 'views'),
    topKeys(payload, 'page', cur, 8, 'views', '/work/%'),
    topKeys(payload, 'source', cur, 8),
    topKeys(payload, 'referrer', cur, 8),
    topKeys(payload, 'campaign', cur, 8),
    topKeys(payload, 'device', cur, 4),
    topKeys(payload, 'browser', cur, 6),
    topKeys(payload, 'os', cur, 6),
    topKeys(payload, 'region', cur, 8),
    topKeys(payload, 'lang', cur, 6),
    topKeys(payload, 'entry', cur, 8),
    topKeys(payload, 'exit', cur, 8),
    topKeys(payload, 'event', cur, 30, 'views'),
    compare ? topKeys(payload, 'event', prev, 30, 'views') : Promise.resolve([]),
    topKeys(payload, 'nf', cur, 12, 'views'),
    funnel(payload, cur),
    conversionBySource(payload, cur),
    conversionByDevice(payload, cur),
    engagement(payload, cur, 8),
    vitals(payload, cur),
    vitalSeries(payload, 'LCP', cur),
    assisted(payload, cur, 8),
    enquiryHeatmap(payload, cur),
    realtime(payload),
    storageEstimate(payload),
  ])
  const t = totalsOf(days)
  const p = totalsOf(prevDays)
  const spark = (k: 'visitors' | 'sessions' | 'views' | 'enquiries') => days.map((d) => d[k])
  const ev = (rows: Top[], names: string[]) =>
    rows.filter((r) => names.includes(r.key)).reduce((s, r) => s + r.views, 0)
  const contact = ev(events, ['whatsapp_click', 'phone_click'])
  const contactPrev = ev(prevEvents, ['whatsapp_click', 'phone_click'])
  const d = (a: number, b: number) => (compare ? delta(a, b) : null)
  const services = (await topKeys(payload, 'page', cur, 200, 'views'))
    .filter((x) => SECTOR_PATH.test(x.key))
    .slice(0, 8)
  const dayLabels = days.map((x) => x.day)

  return (
    <>
      <AutoRefresh seconds={30} />
      <div className="ir-range">
        <nav className="seg" aria-label="Date range">
          {PRESET_LABELS.map(([k, label]) => (
            <Link
              key={k}
              href={`/admin/analytics?${qs({ range: k })}`}
              aria-current={rg.preset === k}
            >
              {label}
            </Link>
          ))}
        </nav>
        <form
          method="get"
          action="/admin/analytics"
          aria-label="Custom range"
          className="ir-filters"
        >
          <input type="hidden" name="range" value="custom" />
          <label>
            From
            <input type="date" name="from" defaultValue={cur.from} max={dubaiDay()} />
          </label>
          <label>
            To
            <input type="date" name="to" defaultValue={cur.to} max={dubaiDay()} />
          </label>
          <label>
            <span className="ir-sr">Compare</span>
            <select name="compare" defaultValue={compare ? '1' : '0'}>
              <option value="1">Compare to previous period</option>
              <option value="0">No comparison</option>
            </select>
          </label>
          <button className="ir-btn" type="submit">
            Apply
          </button>
        </form>
        <PrintButton />
      </div>
      <p className="ir-muted">
        {cur.from} to {cur.to} (Dubai time)
        {compare ? `, compared with ${prev.from} to ${prev.to}` : ''}. Visitors are counted per day,
        so a person who returns on another day counts again.
      </p>

      <Card title="Realtime">
        <div className="ir-live" aria-live="polite">
          <div>
            <b className="big">
              <i className="pulse" />
              {live.visitors}
            </b>
            visitors in the last 30 minutes
            <br />
            <span className="ir-muted">
              {live.last5} in the last 5 minutes. Refreshes every 30 seconds.
            </span>
          </div>
          <div>
            {live.pages.length ? (
              <ul className="ir-list">
                {live.pages.map((x) => (
                  <li key={x.path}>
                    <code>{x.path}</code> <b>{x.n}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ir-muted">Nobody on the site right now.</span>
            )}
          </div>
        </div>
      </Card>

      <KpiGrid>
        <Kpi
          icon="users"
          label="Visitors"
          value={t.visitors.toLocaleString()}
          trend={d(t.visitors, p.visitors)}
          spark={<Sparkline values={spark('visitors')} />}
        />
        <Kpi
          icon="chart"
          label="Sessions"
          value={t.sessions.toLocaleString()}
          trend={d(t.sessions, p.sessions)}
          spark={<Sparkline values={spark('sessions')} />}
        />
        <Kpi
          icon="folder"
          label="Pageviews"
          value={t.views.toLocaleString()}
          trend={d(t.views, p.views)}
          spark={<Sparkline values={spark('views')} />}
        />
        <Kpi
          icon="clock"
          label="Avg. session"
          value={fmtDuration(t.avgDuration)}
          trend={d(Math.round(t.avgDuration), Math.round(p.avgDuration))}
        />
        <Kpi
          icon="flag"
          label="Bounce rate"
          value={`${String(t.bounceRate)}%`}
          trend={d(t.bounceRate, p.bounceRate)}
          invert
        />
        <Kpi
          icon="inbox"
          label="Enquiries"
          value={t.enquiries}
          trend={d(t.enquiries, p.enquiries)}
          spark={<Sparkline values={spark('enquiries')} />}
        />
        <Kpi
          icon="trophy"
          label="Conversion"
          value={`${String(t.conversion)}%`}
          note="enquiries / sessions"
          trend={d(t.conversion, p.conversion)}
        />
        <Kpi
          icon="heart"
          label="WhatsApp + call clicks"
          value={contact}
          trend={d(contact, contactPrev)}
        />
      </KpiGrid>

      <Card title="Visitors, sessions and enquiries" className="ir-wide">
        <SeriesChart
          days={dayLabels}
          name="Visitors, sessions and enquiries per day"
          series={[
            { label: 'Visitors', values: spark('visitors'), area: true },
            { label: 'Sessions', values: spark('sessions') },
            { label: 'Enquiries', values: spark('enquiries') },
          ]}
        />
      </Card>

      <div className="ir-cols">
        <Card title="Traffic sources">
          <Donut data={pts(sources)} name="Sessions by traffic source" unit="sessions" />
        </Card>
        <Card title="Referrers">
          <HBars data={pts(referrers)} name="Sessions by referring domain" />
        </Card>
        <Card title="Campaigns (UTM)">
          <HBars data={pts(campaigns)} name="Sessions by UTM campaign" />
        </Card>
        <Card title="Devices">
          <Donut data={pts(devices)} name="Sessions by device" unit="sessions" />
        </Card>
        <Card title="Top pages">
          <HBars data={pts(pages, 'views')} name="Pageviews by page" />
        </Card>
        <Card title="Top projects">
          <HBars data={pts(projectsTop, 'views')} name="Pageviews by project" />
        </Card>
        <Card title="Top services">
          <HBars data={pts(services, 'views')} name="Pageviews by service page" />
        </Card>
        <Card title="Browsers and systems">
          <HBars
            data={[...pts(browsers).slice(0, 4), ...pts(oses).slice(0, 4)]}
            name="Sessions by browser and operating system"
          />
        </Card>
        <Card title="Entry pages">
          <HBars data={pts(entries)} name="Sessions by entry page" />
        </Card>
        <Card title="Exit pages">
          <HBars data={pts(exits)} name="Sessions by exit page" />
        </Card>
        <Card title="Regions (visitor time zone)">
          <HBars data={pts(regions)} name="Sessions by visitor time zone" />
        </Card>
        <Card title="Languages">
          <HBars data={pts(langs)} name="Sessions by browser language" />
        </Card>
      </div>

      <div className="ir-cols">
        <Card title="Conversion funnel">
          <Funnel
            data={fun.map((f) => ({ label: f.label, value: f.sessions }))}
            name="Funnel from visit to submitted enquiry"
          />
          <p className="ir-muted">
            Drop-off is shown against the previous stage. Stages 4 to 7 need the consultation form
            events.
          </p>
        </Card>
        <Card title="Conversion by source and device">
          <table className="ir-table">
            <caption className="ir-sr">Conversion by source</caption>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Sessions</th>
                <th scope="col">Enquiries</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...bySource, ...byDevice.map((x) => ({ ...x, source: `device: ${x.device}` }))].map(
                (x) => (
                  <tr key={x.source}>
                    <td>{x.source}</td>
                    <td>{x.sessions}</td>
                    <td>{x.enquiries}</td>
                    <td>{x.rate}%</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="ir-cols">
        <Card title="Scroll depth by page">
          {eng.scroll.length ? (
            <table className="ir-table">
              <caption className="ir-sr">Visitors reaching each scroll depth</caption>
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col">25%</th>
                  <th scope="col">50%</th>
                  <th scope="col">75%</th>
                  <th scope="col">100%</th>
                </tr>
              </thead>
              <tbody>
                {eng.scroll.map((s) => (
                  <tr key={s.path}>
                    <td>{s.path}</td>
                    <td>{s.d25}</td>
                    <td>{s.d50}</td>
                    <td>{s.d75}</td>
                    <td>{s.d100}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="ir-muted ir-empty">No data for this period yet.</p>
          )}
        </Card>
        <Card title="Time on page and interactions">
          <HBars
            data={eng.time.map((x) => ({
              label: `${x.path} (${fmtDuration(x.avg)})`,
              value: Math.round(x.avg),
            }))}
            name="Average visible seconds per page"
          />
          <ul className="ir-list">
            {['gallery_open', 'before_after', 'cta_click', 'download', 'outbound'].map((k) => (
              <li key={k}>
                {k.replace('_', ' ')} <b>{ev(events, [k])}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Core Web Vitals (75th percentile, real visitors)">
        {vit.length ? (
          <>
            <div className="ir-vitals">
              {['LCP', 'INP', 'CLS'].map((m) => {
                const rows = vit.filter((x) => x.name === m)
                const n = rows.reduce((s, x) => s + x.samples, 0)
                const v = n ? rows.reduce((s, x) => s + x.p75 * x.samples, 0) / n : 0
                const r = rate(m, v)
                return (
                  <div key={m}>
                    {m}{' '}
                    <Badge tone={r === 'good' ? 'ok' : r === 'poor' ? 'bad' : 'warn'}>{r}</Badge>
                    <b>{pretty(v, m)}</b>
                    <small className="ir-muted">{n} samples</small>
                    {m === 'LCP' ? <Sparkline values={lcpTrend} /> : null}
                  </div>
                )
              })}
            </div>
            <table className="ir-table">
              <caption className="ir-sr">Web vitals by page template</caption>
              <thead>
                <tr>
                  <th scope="col">Template</th>
                  {['LCP', 'INP', 'CLS'].map((m) => (
                    <th key={m} scope="col">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...new Set(vit.map((x) => x.tpl))].sort().map((tpl) => (
                  <tr key={tpl}>
                    <td>{tpl}</td>
                    {['LCP', 'INP', 'CLS'].map((m) => {
                      const x = vit.find((y) => y.tpl === tpl && y.name === m)
                      return (
                        <td key={m}>
                          {x ? (
                            <>
                              {pretty(x.p75, m)}{' '}
                              <Badge
                                tone={
                                  rate(m, x.p75) === 'good'
                                    ? 'ok'
                                    : rate(m, x.p75) === 'poor'
                                      ? 'bad'
                                      : 'warn'
                                }
                              >
                                {rate(m, x.p75)}
                              </Badge>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="ir-muted ir-empty">No data for this period yet.</p>
        )}
      </Card>

      <div className="ir-cols">
        <Card title="Content that leads to enquiries">
          <HBars
            data={assist.map((a) => ({ label: a.path, value: a.n }))}
            name="Enquiries that viewed each page before sending"
          />
          <p className="ir-muted">
            Pages viewed by the same visitor, the same day, before they sent an enquiry.
          </p>
        </Card>
        <Card title="When enquiries arrive (Dubai time)">
          <Heatmap grid={heat} name="Enquiries by weekday and hour" unit="enquiries" />
        </Card>
      </div>

      <Card title="404 pages visitors hit">
        {nf.length ? (
          <table className="ir-table">
            <caption className="ir-sr">Pages not found</caption>
            <thead>
              <tr>
                <th scope="col">Path</th>
                <th scope="col">Hits</th>
                <th scope="col">Redirect to</th>
              </tr>
            </thead>
            <tbody>
              {nf.map((x) => (
                <tr key={x.key}>
                  <td>
                    <code>{x.key}</code>
                  </td>
                  <td>{x.views}</td>
                  <td>
                    <form action={redirectFrom404} className="ir-filters">
                      <input type="hidden" name="from" value={x.key} />
                      <label>
                        <span className="ir-sr">Redirect target for {x.key}</span>
                        <input type="text" name="to" placeholder="/work" required />
                      </label>
                      <button className="ir-btn ghost" type="submit">
                        Create 301
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="ir-muted ir-empty">No broken links in this period.</p>
        )}
      </Card>

      <Card title="Export and storage">
        <p>
          Download any table as CSV for this date range:{' '}
          {[
            'daily',
            'pages',
            'projects',
            'sources',
            'referrers',
            'campaigns',
            'devices',
            'events',
            'vitals',
            'funnel',
            'conversion',
            'assisted',
            'notfound',
          ].map((k) => (
            <a
              key={k}
              className="ir-btn ghost"
              href={`/api/admin-tools/analytics-csv?table=${k}&${qs({})}`}
            >
              {k}
            </a>
          ))}
        </p>
        <p className="ir-muted">
          Database use: {fmtBytes(storage.bytes)} for {storage.sessions.toLocaleString()} sessions
          and {storage.events.toLocaleString()} events. Estimated growth: about{' '}
          {fmtBytes(storage.per10k)} per 10,000 visits. Raw events are kept 90 days, daily
          aggregates 25 months.
        </p>
        <DataTable
          caption="Retention"
          head={['Data', 'Kept for']}
          rows={[
            ['Raw events and sessions', '90 days'],
            ['Daily aggregates', '25 months'],
            ['Daily salt', 'until the next day'],
          ]}
        />
      </Card>
    </>
  )
}
