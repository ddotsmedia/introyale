import Link from 'next/link'
import { buildFilterQuery, type FilterState } from '../lib/filters'
import { ui } from '@/messages/en'

export type FilterDef = { name: string; label: string; options: { value: string; label: string }[] }

const chip =
  'inline-flex min-h-5 items-center border px-2 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] transition-colors'

/**
 * Sticky filter bar built from plain links: the first group shows as chips, the others as disclosure menus.
 * No client JavaScript; the state lives in the URL.
 */
export function FilterBar({
  filters,
  current,
  basePath,
}: {
  filters: FilterDef[]
  current: FilterState
  basePath: string
}) {
  const [primary, ...menus] = filters
  const active = Object.values(current).some(Boolean)
  const href = (name: string, value: string) =>
    `${basePath}${buildFilterQuery(current, name, value)}`
  return (
    <nav
      aria-label={ui.filter.label}
      className="border-travertine bg-ivory/95 sticky top-[4.5rem] z-30 border-b backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-1.5 overflow-x-auto px-2 py-1.5 md:px-4">
        {primary && (
          <ul className="flex shrink-0 items-center gap-1">
            <li>
              <Link
                href={href(primary.name, '')}
                aria-current={!current[primary.name] ? 'true' : undefined}
                className={`${chip} ${!current[primary.name] ? 'bg-ink text-ivory border-ink' : 'border-travertine hover:border-ink'}`}
              >
                {ui.filter.all}
              </Link>
            </li>
            {primary.options.map((o) => (
              <li key={o.value}>
                <Link
                  href={href(primary.name, o.value)}
                  aria-current={current[primary.name] === o.value ? 'true' : undefined}
                  className={`${chip} ${current[primary.name] === o.value ? 'bg-ink text-ivory border-ink' : 'border-travertine hover:border-ink'}`}
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {menus.map((f) => {
          const selected = f.options.find((o) => o.value === current[f.name])
          return (
            <details key={f.name} className="group relative shrink-0">
              <summary
                className={`${chip} cursor-pointer list-none ${selected ? 'bg-ink text-ivory border-ink' : 'border-travertine hover:border-ink'}`}
              >
                {selected ? selected.label : f.label}
              </summary>
              <ul className="bg-ivory border-travertine absolute start-0 top-full z-40 mt-0.5 max-h-36 min-w-28 overflow-y-auto border p-1 shadow-lg">
                <li>
                  <Link href={href(f.name, '')} className="block px-1.5 py-1 text-sm hover:bg-sand">
                    {ui.filter.all}
                  </Link>
                </li>
                {f.options.map((o) => (
                  <li key={o.value}>
                    <Link
                      href={href(f.name, o.value)}
                      className="block px-1.5 py-1 text-sm hover:bg-sand"
                    >
                      {o.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )
        })}
        {active && (
          <Link
            href={basePath}
            className="eyebrow ms-auto shrink-0 border-b border-current pb-0.25"
          >
            {ui.filter.clear}
          </Link>
        )}
      </div>
    </nav>
  )
}
