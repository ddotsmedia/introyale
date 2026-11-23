'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { ChartProps } from './ChartImpl'

// The chart library loads on demand, only inside the admin, never in the public bundle.
const Impl = dynamic(() => import('./ChartImpl'), {
  ssr: false,
  loading: () => <div className="ir-skel ir-skel-chart" aria-hidden="true" />,
})

/** A chart with a "view as table" switch (accessible alternative that shows the same numbers). */
export function LazyChart(props: ChartProps & { xLabel?: string }) {
  const [table, setTable] = useState(false)
  const cols =
    props.kind === 'donut'
      ? ['label', 'value']
      : [props.xKey ?? 'x', ...(props.series ?? []).map((s) => s.key)]
  const heads =
    props.kind === 'donut'
      ? [props.xLabel ?? 'Item', 'Count']
      : [props.xLabel ?? 'Day', ...(props.series ?? []).map((s) => s.label)]
  return (
    <div className="ir-chart" style={{ minHeight: props.height ?? 260 }}>
      {table ? (
        <div className="ir-chart-table" style={{ maxHeight: props.height ?? 260 }}>
          <table className="ir-table">
            <caption className="ir-sr">{props.name}</caption>
            <thead>
              <tr>
                {heads.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.data.map((r, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c}>{r[c]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Impl {...props} />
      )}
      <button
        type="button"
        className="ir-link-btn ir-chart-toggle"
        aria-pressed={table}
        onClick={() => {
          setTable(!table)
        }}
      >
        {table ? 'View as chart' : 'View as table'}
      </button>
    </div>
  )
}
