import type { ReactNode } from 'react'

// Admin charts: server-rendered SVG with the Introyale palette (CSS variables, so dark mode follows the theme).
// No chart library: nothing is added to any bundle, every chart has a data-table alternative, and there is no
// client JS to hydrate. Public pages never import this file.

const SERIES = ['var(--ir-c1)', 'var(--ir-c2)', 'var(--ir-c3)', 'var(--ir-c4)']

/** Table alternative for a chart (also what screen readers and the print view use). */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string
  head: string[]
  rows: (string | number)[][]
}) {
  return (
    <details className="ir-data">
      <summary>View as table</summary>
      <table className="ir-table">
        <caption className="ir-sr">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

/** Tiny trend line for a KPI tile. Decorative: the tile's number carries the meaning. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((v) => v === 0)) return <span className="ir-spark" />
  const w = 120
  const h = 28
  const max = Math.max(...values)
  const x = (i: number) => (i * w) / (values.length - 1)
  const y = (v: number) => h - 2 - (v / (max || 1)) * (h - 4)
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg
      className="ir-spark"
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,${String(h)} ${pts} ${String(w)},${String(h)}`} className="fill" />
      <polyline points={pts} className="stroke" />
    </svg>
  )
}

export type Series = { label: string; values: number[]; area?: boolean }

const short = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

/** Multi-series line chart over days, with grid, date ticks, a hover tooltip per point and a table alternative. */
export function SeriesChart({
  days,
  series,
  name,
}: {
  days: string[]
  series: Series[]
  name: string
}) {
  const all = series.flatMap((s) => s.values)
  if (!all.length || all.every((v) => v === 0)) {
    return <p className="ir-muted ir-empty">No data for this period yet.</p>
  }
  const w = 760
  const h = 220
  const pad = { l: 34, r: 12, t: 16, b: 28 }
  const max = Math.max(4, ...all)
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, days.length - 1)
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b)
  const ticks = [0, Math.round(max / 2), max]
  const step = Math.max(1, Math.ceil(days.length / 8))
  return (
    <figure className="ir-fig">
      <svg
        className="ir-svg"
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        role="img"
        aria-label={name}
        width="100%"
      >
        <title>{name}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % step === 0 ? (
            <text key={d} x={x(i)} y={h - 8} textAnchor="middle">
              {short(d)}
            </text>
          ) : null,
        )}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
          const color = SERIES[si % SERIES.length]
          return (
            <g key={s.label}>
              {s.area ? (
                <polygon
                  points={`${String(pad.l)},${String(h - pad.b)} ${pts} ${String(w - pad.r)},${String(h - pad.b)}`}
                  fill={color}
                  opacity="0.14"
                />
              ) : null}
              <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r={days.length > 45 ? 2.2 : 3.6}
                  fill={color}
                  opacity={days.length > 45 ? 0 : 1}
                >
                  <title>{`${s.label}, ${short(days[i] ?? '')}: ${String(v)}`}</title>
                </circle>
              ))}
              {days.length > 45
                ? s.values.map((v, i) => (
                    <rect
                      key={`h${String(i)}`}
                      x={x(i) - 4}
                      y={pad.t}
                      width="8"
                      height={h - pad.t - pad.b}
                      fill="transparent"
                    >
                      <title>{`${s.label}, ${short(days[i] ?? '')}: ${String(v)}`}</title>
                    </rect>
                  ))
                : null}
            </g>
          )
        })}
      </svg>
      <figcaption className="ir-legend">
        {series.map((s, i) => (
          <span key={s.label}>
            <i style={{ background: SERIES[i % SERIES.length] }} />
            {s.label}
          </span>
        ))}
      </figcaption>
      <DataTable
        caption={name}
        head={['Day', ...series.map((s) => s.label)]}
        rows={days.map((d, i) => [d, ...series.map((s) => s.values[i] ?? 0)])}
      />
    </figure>
  )
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Weekday x hour heatmap (cell opacity = count) with a table alternative. */
export function Heatmap({ grid, name, unit }: { grid: number[][]; name: string; unit: string }) {
  const max = Math.max(0, ...grid.flat())
  if (max === 0) return <p className="ir-muted ir-empty">No data for this period yet.</p>
  return (
    <figure className="ir-fig">
      <div className="ir-heat" role="img" aria-label={name}>
        <div className="corner" />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="hh" aria-hidden="true">
            {h % 3 === 0 ? String(h) : ''}
          </span>
        ))}
        {grid.map((row, d) => (
          <div key={WEEKDAYS[d]} className="row">
            <span className="dd" aria-hidden="true">
              {WEEKDAYS[d]}
            </span>
            {row.map((n, h) => (
              <span
                key={h}
                className="cell"
                style={{ opacity: n ? 0.18 + (n / max) * 0.82 : 0.06 }}
                title={`${WEEKDAYS[d] ?? ''} ${String(h).padStart(2, '0')}:00 — ${String(n)} ${unit}`}
              />
            ))}
          </div>
        ))}
      </div>
      <DataTable
        caption={name}
        head={['Day', 'Busiest hour', unit]}
        rows={grid.map((row, d) => {
          const best = Math.max(...row)
          return [
            WEEKDAYS[d] ?? '',
            best ? `${String(row.indexOf(best)).padStart(2, '0')}:00` : '—',
            row.reduce((a, b) => a + b, 0),
          ]
        })}
      />
    </figure>
  )
}

/** Progress ring (goal tracking). */
export function Ring({ value, goal, label }: { value: number; goal: number; label: ReactNode }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <div className="ir-ring">
      <svg
        viewBox="0 0 110 110"
        width="120"
        height="120"
        role="img"
        aria-label={`${String(value)} of ${String(goal)}`}
      >
        <circle cx="55" cy="55" r={r} fill="none" className="track" strokeWidth="11" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          className="bar"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${String(c * pct)} ${String(c)}`}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="53" textAnchor="middle" className="big">
          {Math.round(pct * 100)}%
        </text>
        <text x="55" y="70" textAnchor="middle">
          {value} / {goal}
        </text>
      </svg>
      <div>{label}</div>
    </div>
  )
}
