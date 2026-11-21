'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useId } from 'react'
import { buildFilterQuery, type FilterState } from '../lib/filters'

export type FilterDef = { name: string; label: string; options: { value: string; label: string }[] }

/** Selects that write their state to the URL (router.replace keeps history clean). */
export function FilterBar({ filters, current }: { filters: FilterDef[]; current: FilterState }) {
  const router = useRouter()
  const pathname = usePathname()
  const baseId = useId()

  return (
    <form
      role="search"
      aria-label="Filter projects"
      className="flex flex-wrap gap-4"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      {filters.map((f) => {
        const id = `${baseId}-${f.name}`
        return (
          <div key={f.name} className="flex flex-col">
            <label htmlFor={id} className="text-taupe text-sm">
              {f.label}
            </label>
            <select
              id={id}
              name={f.name}
              value={current[f.name] ?? ''}
              onChange={(e) => {
                router.replace(`${pathname}${buildFilterQuery(current, f.name, e.target.value)}`, {
                  scroll: false,
                })
              }}
              className="border-travertine bg-ivory min-h-11 border px-3"
            >
              <option value="">All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </form>
  )
}
