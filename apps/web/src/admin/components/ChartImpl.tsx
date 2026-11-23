'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type Row = Record<string, string | number>
export type Series = { key: string; label: string; color: string }
export type ChartProps = {
  kind: 'area' | 'donut' | 'bar'
  data: Row[]
  series?: Series[]
  xKey?: string
  name: string
  height?: number
}

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const TIP = {
  contentStyle: {
    background: 'var(--ir-card)',
    border: '1px solid var(--ir-line)',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(31,29,26,.14)',
    fontSize: 13,
    color: 'var(--ir-ink)',
  },
  labelStyle: { color: 'var(--ir-muted)', marginBottom: 4 },
  itemStyle: { color: 'var(--ir-ink)', padding: 0 },
}

/** Palette used by every admin chart; the variables switch with light/dark. */
export const PALETTE = [
  'var(--ir-c1)',
  'var(--ir-c2)',
  'var(--ir-c3)',
  'var(--ir-c4)',
  'var(--ir-c5)',
  'var(--ir-c6)',
]

/** SVG attributes cannot use var(); resolve the theme variables to concrete colours (and follow light/dark). */
function useResolve() {
  const [, bump] = useState(0)
  useEffect(() => {
    const mo = new MutationObserver(() => {
      bump((n) => n + 1)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    bump((n) => n + 1)
    return () => {
      mo.disconnect()
    }
  }, [])
  return (v: string): string => {
    const m = /^var\((--[\w-]+)\)$/.exec(v)
    if (!m || typeof document === 'undefined') return v
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(m[1] ?? '')
        .trim() || '#7a5a36'
    )
  }
}

export default function ChartImpl({
  kind,
  data,
  series = [],
  xKey = 'x',
  name,
  height = 260,
}: ChartProps) {
  const anim = !reduced()
  const R = useResolve()
  const AXIS = { fontSize: 12, fill: R('var(--ir-muted)') }
  if (kind === 'donut') {
    const total = data.reduce((n, r) => n + Number(r['value'] ?? 0), 0)
    return (
      <div className="ir-donut" role="img" aria-label={name}>
        <div className="ir-donut-chart" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map((r, i) => ({ ...r, fill: R(PALETTE[i % PALETTE.length] ?? '') }))}
                dataKey="value"
                nameKey="label"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                cornerRadius={5}
                stroke={R('var(--ir-card)')}
                isAnimationActive={anim}
              ></Pie>
              <Tooltip {...TIP} cursor={{ stroke: R('var(--ir-line)') }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="ir-donut-total">
            <b>{total.toLocaleString('en-US')}</b>
            <small>total</small>
          </div>
        </div>
        <ul className="ir-legend">
          {data.map((r, i) => (
            <li key={String(r['label'])}>
              <i style={{ background: PALETTE[i % PALETTE.length] }} />
              <span>{String(r['label'])}</span>
              <b>{total ? Math.round((Number(r['value']) / total) * 100) : 0}%</b>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div style={{ height }} role="img" aria-label={name}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'area' ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: R(s.color), stopOpacity: 0.32 }} />
                  <stop offset="100%" style={{ stopColor: R(s.color), stopOpacity: 0.02 }} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke={R('var(--ir-line)')} strokeDasharray="3 4" />
            <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
            <Tooltip {...TIP} cursor={{ stroke: R('var(--ir-line)') }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={R(s.color)}
                strokeWidth={2.2}
                fill={`url(#g-${s.key})`}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={anim}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={R('var(--ir-line)')} strokeDasharray="3 4" />
            <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
            <Tooltip {...TIP} cursor={{ fill: R('var(--ir-sand)'), opacity: 0.5 }} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={R(s.color)}
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
                isAnimationActive={anim}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
