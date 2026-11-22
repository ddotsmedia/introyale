import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { Shell } from '../Shell'
import { Card } from '../ui'
import { tasksBetween } from '../../lib/crmPlus'
import { OPEN_STATUSES } from '../../lib/leads'
import { addDays } from '../../lib/analytics/range'
import { dubaiDay } from '../../lib/analytics/store'

type Item = { day: string; time: string; label: string; href: string; cls: string }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const ISO = /^\d{4}-\d{2}-\d{2}$/
const hhmm = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })
const dow = (day: string) => (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7 // Monday = 0
const startOfWeek = (day: string) => addDays(day, -dow(day))

export async function Calendar(props: AdminViewServerProps) {
  return (
    <Shell
      view={props}
      action="enquiries.read"
      title="Calendar & tasks"
      sub="Follow-ups, site visits, calls and reminders. Dubai time."
    >
      {async ({ payload, user, req, sp }) => {
        const today = dubaiDay()
        const view = one(sp['view']) === 'week' ? 'week' : 'month'
        const anchorRaw = one(sp['d'])
        const anchor = anchorRaw && ISO.test(anchorRaw) ? anchorRaw : today
        const first =
          view === 'week' ? startOfWeek(anchor) : startOfWeek(`${anchor.slice(0, 7)}-01`)
        const weeks = view === 'week' ? 1 : 6
        const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i))
        const last = days[days.length - 1] ?? first
        const from = new Date(`${first}T00:00:00+04:00`)
        const to = new Date(`${last}T23:59:59+04:00`)
        const [tasks, follow] = await Promise.all([
          tasksBetween(payload, user, from, to, true),
          payload.find({
            collection: 'enquiries',
            req,
            overrideAccess: false,
            depth: 0,
            limit: 300,
            where: {
              and: [
                { followUpAt: { greater_than_equal: from.toISOString() } },
                { followUpAt: { less_than_equal: to.toISOString() } },
                { status: { in: [...OPEN_STATUSES] } },
              ],
            },
            select: { ref: true, name: true, followUpAt: true },
          }),
        ])
        const items: Item[] = [
          ...tasks.map((t) => ({
            day: dubaiDay(new Date(t.due_at)),
            time: hhmm(new Date(t.due_at)),
            label: `${t.kind === 'visit' ? 'Visit' : t.kind === 'call' ? 'Call' : 'Task'}: ${t.title} (${t.ref ?? ''})`,
            href: `/admin/lead?id=${String(t.enquiry_id)}`,
            cls: `${t.kind === 'visit' ? 'visit' : ''} ${t.done_at ? 'done' : ''}`,
          })),
          ...(
            follow.docs as unknown as {
              id: number
              ref: string
              name?: string
              followUpAt: string
            }[]
          ).map((e) => ({
            day: dubaiDay(new Date(e.followUpAt)),
            time: hhmm(new Date(e.followUpAt)),
            label: `Follow up ${e.ref} ${e.name ?? ''}`,
            href: `/admin/lead?id=${String(e.id)}`,
            cls: 'follow',
          })),
        ].sort((a, b) => a.time.localeCompare(b.time))
        const by = new Map<string, Item[]>()
        for (const it of items) by.set(it.day, [...(by.get(it.day) ?? []), it])
        const step = view === 'week' ? 7 : 28
        const prev = addDays(anchor, -step)
        const next = addDays(anchor, step)
        const title = new Date(`${anchor}T12:00:00Z`).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })
        const nav = (d: string, v = view) => `/admin/calendar?view=${v}&d=${d}`
        return (
          <>
            <div className="ir-range">
              <nav className="seg" aria-label="Calendar navigation">
                <Link href={nav(prev)}>← Previous</Link>
                <Link href={nav(today)}>Today</Link>
                <Link href={nav(next)}>Next →</Link>
              </nav>
              <nav className="seg" aria-label="Calendar view">
                <Link href={nav(anchor, 'month')} aria-current={view === 'month'}>
                  Month
                </Link>
                <Link href={nav(anchor, 'week')} aria-current={view === 'week'}>
                  Week
                </Link>
              </nav>
              <strong>{view === 'week' ? `Week of ${first}` : title}</strong>
            </div>
            <Card>
              <div className={`ir-cal ${view}`}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="dow">
                    {d}
                  </div>
                ))}
                {days.map((day) => {
                  const list = by.get(day) ?? []
                  const out = view === 'month' && day.slice(0, 7) !== anchor.slice(0, 7)
                  return (
                    <div
                      key={day}

                      className={`day ${out ? 'out' : ''} ${day === today ? 'today' : ''}`}
                    >
                      <b>{Number(day.slice(8))}</b>
                      {list.slice(0, view === 'week' ? 20 : 4).map((it, i) => (
                        <Link
                          key={i}
                          href={it.href}
                          className={`item ${it.cls}`}
                          title={`${it.time} ${it.label}`}
                        >
                          {it.time} {it.label}
                        </Link>
                      ))}
                      {list.length > 4 && view === 'month' ? (
                        <small className="ir-muted">+{list.length - 4} more</small>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              <p className="ir-muted">
                <span className="ir-chip warm">Follow-up</span>{' '}
                <span className="ir-chip hot">Site visit</span> Tasks are added on each lead.
                Administrators see everyone; others see their own.
              </p>
            </Card>
          </>
        )
      }}
    </Shell>
  )
}
