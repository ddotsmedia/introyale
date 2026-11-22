import { Children, type ReactNode } from 'react'

export function Card({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`ir-card ${className ?? ''}`}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  )
}

const ICONS: Record<string, string> = {
  inbox: 'M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  trophy: 'M8 4h8v5a4 4 0 01-8 0zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 13v4M8 21h8',
  review: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
  folder: 'M3 6h6l2 2h10v11H3z',
  check: 'M4 12l5 5L20 6',
  flag: 'M5 21V4h12l-2 4 2 4H5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z',
  users:
    'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-5 7-5s7 1.5 7 5M17 4a3.5 3.5 0 010 7M18 15c2.5.5 4 2 4 5',
  chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
}

export function Ico({ name }: { name: string }) {
  return (
    <svg
      className="ir-ico"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] ?? ICONS['chart']} />
    </svg>
  )
}

export function Kpi({
  label,
  value,
  trend,
  note,
  icon,
}: {
  label: string
  value: ReactNode
  trend?: number | null
  note?: string
  icon?: string
}) {
  return (
    <div className="ir-card ir-kpi">
      <div className="ir-kpi-head">
        <span>{label}</span>
        {icon ? <Ico name={icon} /> : null}
      </div>
      <b>{value}</b>
      {trend != null ? (
        <small className={trend >= 0 ? 'ir-up' : 'ir-down'}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs previous period
        </small>
      ) : (
        <small className="ir-muted">{note ?? ' '}</small>
      )}
    </div>
  )
}

/** Even KPI grid: picks a column count that divides the cards, or lets the last card span the remainder (no orphan). */
export function KpiGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean)
  const n = items.length
  const cols = [4, 3, 5, 6, 2].find((c) => n % c === 0) ?? (n > 6 ? 4 : Math.min(n, 3))
  const span = cols - ((n - 1) % cols)
  return (
    <div className="ir-kpis" style={{ gridTemplateColumns: `repeat(${String(cols)}, 1fr)` }}>
      {items.map((c, i) => (
        <div
          key={i}
          style={i === n - 1 && span > 1 ? { gridColumn: `span ${String(span)}` } : undefined}
        >
          {c}
        </div>
      ))}
    </div>
  )
}

export function Badge({ tone, children }: { tone?: 'ok' | 'warn' | 'bad'; children: ReactNode }) {
  return <span className={`ir-badge ${tone ?? ''}`}>{children}</span>
}

type Point = { label: string; value: number }
const EMPTY = <p className="ir-muted ir-empty">No data yet. It will appear as enquiries arrive.</p>

/** Weekly line chart with area fill, grid, and a native hover tooltip on every point. */
export function LineChart({ data, name }: { data: Point[]; name: string }) {
  if (data.every((d) => d.value === 0)) return EMPTY
  const w = 560
  const h = 170
  const pad = { l: 28, r: 10, t: 14, b: 26 }
  const max = Math.max(2, ...data.map((d) => d.value))
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, data.length - 1)
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b)
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
  const ticks = [0, Math.round(max / 2), max]
  return (
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
      <polygon
        className="area"
        points={`${String(pad.l)},${String(h - pad.b)} ${pts.join(' ')} ${String(w - pad.r)},${String(h - pad.b)}`}
      />
      <polyline className="line" points={pts.join(' ')} />
      {data.map((d, i) => (
        <g key={d.label} className="pt">
          <circle cx={x(i)} cy={y(d.value)} r={4.5} />
          <title>{`${d.label}: ${String(d.value)} enquiries`}</title>
          {i % 2 === 0 ? (
            <text x={x(i)} y={h - 8} textAnchor="middle">
              {d.label}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

/** Funnel with conversion % from the previous stage and from the first. */
export function Funnel({ data, name }: { data: Point[]; name: string }) {
  const first = data[0]?.value ?? 0
  if (first === 0) return EMPTY
  return (
    <ol className="ir-funnel" aria-label={name}>
      {data.map((d, i) => {
        const prev = i === 0 ? d.value : (data[i - 1]?.value ?? 0)
        const step = prev ? Math.round((d.value / prev) * 100) : 0
        const total = Math.round((d.value / first) * 100)
        return (
          <li
            key={d.label}
            title={`${d.label}: ${String(d.value)} (${String(total)}% of all enquiries)`}
          >
            <span className="stage">{d.label}</span>
            <span
              className="bar"
              style={{ width: `${String(Math.max(6, total))}%`, opacity: 1 - i * 0.14 }}
            />
            <span className="num">
              {d.value}
              {i > 0 ? <small> · {step}% of previous</small> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

const SLICES = [
  'var(--ir-c1)',
  'var(--ir-c2)',
  'var(--ir-c3)',
  'var(--ir-c4)',
  'var(--ir-c5)',
  'var(--ir-c6)',
]

/** Donut with a legend; each slice has a hover tooltip. */
export function Donut({ data, name }: { data: Point[]; name: string }) {
  const total = data.reduce((n, d) => n + d.value, 0)
  if (total === 0) return EMPTY
  const r = 52
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="ir-donut">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={name}>
        <title>{name}</title>
        <g transform="rotate(-90 70 70)">
          {data.map((d, i) => {
            const len = (d.value / total) * c
            const el = (
              <circle
                key={d.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={SLICES[i % SLICES.length]}
                strokeWidth="22"
                strokeDasharray={`${String(len)} ${String(c - len)}`}
                strokeDashoffset={-offset}
              >
                <title>{`${d.label}: ${String(d.value)} (${String(Math.round((d.value / total) * 100))}%)`}</title>
              </circle>
            )
            offset += len
            return el
          })}
        </g>
        <text x="70" y="68" textAnchor="middle" className="big">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle">
          enquiries
        </text>
      </svg>
      <ul>
        {data.map((d, i) => (
          <li key={d.label}>
            <i style={{ background: SLICES[i % SLICES.length] }} />
            {d.label} <b>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Horizontal bars for category breakdowns. */
export function HBars({ data, name }: { data: Point[]; name: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return EMPTY
  return (
    <ul className="ir-hbars" aria-label={name}>
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${String(d.value)}`}>
          <span>{d.label}</span>
          <span className="track">
            <span style={{ width: `${String((d.value / max) * 100)}%` }} />
          </span>
          <b>{d.value}</b>
        </li>
      ))}
    </ul>
  )
}

export function fmtDate(v: string | Date | null | undefined): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dubai',
  })
}

export function relTime(v: string | Date | null | undefined): string {
  if (!v) return 'never'
  const mins = Math.round((Date.now() - new Date(v).getTime()) / 60000)
  if (mins < 60) return `${String(Math.max(mins, 0))} min ago`
  if (mins < 2880) return `${String(Math.round(mins / 60))} h ago`
  return `${String(Math.round(mins / 1440))} d ago`
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return (
    ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase() ||
    '?'
  )
}
