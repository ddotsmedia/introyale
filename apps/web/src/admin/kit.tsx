import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  FileCheck2,
  Flag,
  FolderKanban,
  Inbox,
  Percent,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { initials } from './ui'

// Presentation kit for the admin v4 design system: KPI tile, empty state, avatar chip, status pill, sparkline.

const TILE_ICONS: Record<string, LucideIcon> = {
  users: Users,
  review: FileCheck2,
  folder: FolderKanban,
  post: BookOpen,
  shield: ShieldCheck,
  flag: Flag,
  inbox: Inbox,
  percent: Percent,
  wallet: Wallet,
  trophy: Trophy,
  clock: Clock,
}

/** Smooth sparkline with a soft gradient (server-rendered SVG, decorative). */
export function Spark({ values, id }: { values: number[]; id: string }) {
  if (values.length < 2 || values.every((v) => v === 0)) return <span className="ir-spark-empty" />
  const w = 96
  const h = 32
  const max = Math.max(...values, 1)
  const x = (i: number) => (i * w) / (values.length - 1)
  const y = (v: number) => h - 3 - (v / max) * (h - 8)
  const pts = values.map((v, i) => [x(i), y(v)] as const)
  const line = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ')
  return (
    <svg className="ir-spark" viewBox={`0 0 ${String(w)} ${String(h)}`} aria-hidden="true">
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${String(w)},${String(h)} L0,${String(h)}Z`} fill={`url(#sp-${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export function Tile({
  id,
  icon,
  label,
  value,
  delta,
  invert,
  note,
  spark,
  href,
}: {
  id: string
  icon: keyof typeof TILE_ICONS
  label: string
  value: ReactNode
  delta?: number | null
  invert?: boolean
  note?: string
  spark?: number[]
  href?: string
}) {
  const Icon = TILE_ICONS[icon] ?? Inbox
  const good = delta == null ? true : invert ? delta <= 0 : delta >= 0
  const body = (
    <>
      <div className="ir-tile-top">
        <span className="ir-tile-ico">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="ir-tile-label">{label}</span>
      </div>
      <div className="ir-tile-main">
        <b className="ir-num">{value}</b>
        {spark ? <Spark values={spark} id={id} /> : null}
      </div>
      <div className="ir-tile-foot">
        {delta != null ? (
          <span className={`ir-chip ${good ? 'up' : 'down'}`}>
            {delta >= 0 ? (
              <ArrowUpRight size={13} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={13} aria-hidden="true" />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
        <small>{delta != null ? 'vs previous period' : (note ?? '')}</small>
      </div>
    </>
  )
  return href ? (
    <Link href={href} className="ir-tile">
      {body}
    </Link>
  ) : (
    <div className="ir-tile">{body}</div>
  )
}

/** Friendly empty state: icon, one sentence, one call to action. */
export function Empty({
  icon: Icon,
  text,
  cta,
  href,
}: {
  icon: LucideIcon
  text: string
  cta?: string
  href?: string
}) {
  return (
    <div className="ir-empty-state">
      <span className="ir-empty-ico">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p>{text}</p>
      {cta && href ? (
        <Link className="ir-btn ghost" href={href}>
          {cta}
        </Link>
      ) : null}
    </div>
  )
}

export function Av({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span className="ir-avatar sm" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  )
}

const STATUS_TONE: Record<string, string> = {
  new: 'info',
  contacted: 'warn',
  site_visit: 'warn',
  proposal_sent: 'olive',
  won: 'ok',
  lost: 'bad',
}
export function Pill({ status }: { status?: string }) {
  const s = status ?? 'new'
  return (
    <span className={`ir-pill ${STATUS_TONE[s] ?? 'info'}`}>
      {s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  )
}

/** Compact horizontal bar rows (top pages, leaderboard) with a proportional rounded bar. */
export function BarRows({
  rows,
  unit,
}: {
  rows: { label: ReactNode; value: number; sub?: string }[]
  unit?: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="ir-bar-rows">
      {rows.map((r, i) => (
        <li key={i}>
          <div className="ir-bar-top">
            <span className="ir-bar-label">{r.label}</span>
            <b className="ir-num">
              {r.value.toLocaleString('en-US')}
              {unit ? <small> {unit}</small> : null}
            </b>
          </div>
          <div className="ir-bar-track">
            <i style={{ width: `${String(Math.max(3, (r.value / max) * 100))}%` }} />
          </div>
          {r.sub ? <small className="ir-muted">{r.sub}</small> : null}
        </li>
      ))}
    </ul>
  )
}

/** Card with a title row and an optional action link on the right. */
export function Panel({
  title,
  action,
  href,
  children,
  className,
}: {
  title: string
  action?: string
  href?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`ir-card ir-panel ${className ?? ''}`}>
      <header className="ir-card-h">
        <h2>{title}</h2>
        {action && href ? (
          <Link className="ir-link" href={href}>
            {action}
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  )
}
