import Link from 'next/link'

const RANGES = [7, 30, 90]

/** Greeting band: Dubai date, one-line summary and the date-range selector (links, no client JS). */
export function Welcome({
  name,
  summary,
  range,
  showRange,
}: {
  name: string
  summary: string[]
  range: number
  showRange: boolean
}) {
  const now = new Date()
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Dubai',
    }).format(now),
  )
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const first = name.trim().split(/\s+/)[0] ?? ''
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dubai',
  })
  return (
    <section className="ir-welcome" aria-label="Welcome">
      <div>
        <p className="ir-eyebrow">{date}</p>
        <h1>
          {greet}
          {first ? `, ${first}` : ''}
        </h1>
        <p className="ir-welcome-sum">
          {summary.length ? `${summary.join(' · ')}.` : 'Everything is up to date.'}
        </p>
      </div>
      {showRange && (
        <nav className="ir-seg" aria-label="Date range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${String(r)}`}
              aria-current={r === range ? 'true' : undefined}
              className={r === range ? 'is-on' : ''}
            >
              {r} days
            </Link>
          ))}
        </nav>
      )}
    </section>
  )
}
