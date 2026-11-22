import type { ReactNode } from 'react'

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

export function Kpi({
  label,
  value,
  trend,
  note,
}: {
  label: string
  value: ReactNode
  trend?: number | null
  note?: string
}) {
  return (
    <div className="ir-card ir-kpi">
      <span>{label}</span>
      <b>{value}</b>
      {trend != null ? (
        <small className={trend >= 0 ? 'ir-up' : 'ir-down'}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs previous
        </small>
      ) : note ? (
        <small className="ir-muted">{note}</small>
      ) : null}
    </div>
  )
}

export function Badge({ tone, children }: { tone?: 'ok' | 'warn' | 'bad'; children: ReactNode }) {
  return <span className={`ir-badge ${tone ?? ''}`}>{children}</span>
}

type Point = { label: string; value: number }

/** Columns with a value on top; accessible name and a data table fallback via <title>. */
export function Columns({ data, name }: { data: Point[]; name: string }) {
  const w = 520
  const h = 150
  const max = Math.max(1, ...data.map((d) => d.value))
  const bw = w / Math.max(1, data.length)
  return (
    <svg
      className="ir-svg"
      viewBox={`0 0 ${w} ${h + 22}`}
      role="img"
      aria-label={name}
      width="100%"
    >
      <title>{name}</title>
      {data.map((d, i) => {
        const bh = (d.value / max) * (h - 18)
        return (
          <g key={d.label}>
            <rect className="bar" x={i * bw + 4} y={h - bh} width={bw - 8} height={bh} rx={3} />
            <text x={i * bw + bw / 2} y={h - bh - 4} textAnchor="middle">
              {d.value}
            </text>
            <text x={i * bw + bw / 2} y={h + 14} textAnchor="middle">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Horizontal bars for category breakdowns and the pipeline funnel. */
export function HBars({ data, name }: { data: Point[]; name: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return <p className="ir-muted">No data yet.</p>
  return (
    <svg
      className="ir-svg"
      viewBox={`0 0 520 ${data.length * 28 + 4}`}
      role="img"
      aria-label={name}
      width="100%"
    >
      <title>{name}</title>
      {data.map((d, i) => (
        <g key={d.label} transform={`translate(0 ${i * 28})`}>
          <text x={0} y={16}>
            {d.label.length > 22 ? `${d.label.slice(0, 21)}…` : d.label}
          </text>
          <rect
            className="bar"
            x={150}
            y={3}
            width={Math.max(2, (d.value / max) * 320)}
            height={18}
            rx={3}
          />
          <text x={150 + Math.max(2, (d.value / max) * 320) + 6} y={16}>
            {d.value}
          </text>
        </g>
      ))}
    </svg>
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
  if (mins < 60) return `${Math.max(mins, 0)} min ago`
  if (mins < 2880) return `${Math.round(mins / 60)} h ago`
  return `${Math.round(mins / 1440)} d ago`
}
