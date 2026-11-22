import type { Payload } from 'payload'
import { writeAudit } from '../audit'
import { dubaiParts } from '../leads'
import { dailySeries, topKeys, totalsOf } from './query'
import { addDays, delta, fmtDuration } from './range'
import { dubaiDay, refreshToday } from './store'

export type Send = (m: { to: string; subject: string; html: string }) => Promise<void>
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${String(c.charCodeAt(0))};`)

/** Builds the weekly summary (last 7 full days against the 7 before) as plain HTML. */
export async function weeklySummary(payload: Payload, now = new Date()) {
  const today = dubaiDay(now)
  const cur = { from: addDays(today, -7), to: addDays(today, -1) }
  const prev = { from: addDays(today, -14), to: addDays(today, -8) }
  const [a, b, pages, sources] = await Promise.all([
    dailySeries(payload, cur),
    dailySeries(payload, prev),
    topKeys(payload, 'page', cur, 5, 'views'),
    topKeys(payload, 'source', cur, 5),
  ])
  const t = totalsOf(a)
  const p = totalsOf(b)
  const row = (label: string, v: string, d: number | null) =>
    `<tr><td>${label}</td><td><b>${v}</b></td><td>${d == null ? '' : `${d >= 0 ? '▲' : '▼'} ${String(Math.abs(d))}%`}</td></tr>`
  const html = `<h2>Introyale — week ${cur.from} to ${cur.to}</h2>
<table cellpadding="6">${row('Visitors', String(t.visitors), delta(t.visitors, p.visitors))}
${row('Sessions', String(t.sessions), delta(t.sessions, p.sessions))}
${row('Pageviews', String(t.views), delta(t.views, p.views))}
${row('Enquiries', String(t.enquiries), delta(t.enquiries, p.enquiries))}
${row('Avg. session', fmtDuration(t.avgDuration), null)}</table>
<h3>Top pages</h3><ol>${pages.map((x) => `<li>${esc(x.key)} — ${String(x.views)}</li>`).join('')}</ol>
<h3>Traffic sources</h3><ol>${sources.map((x) => `<li>${esc(x.key)} — ${String(x.sessions)} sessions</li>`).join('')}</ol>
<p><a href="${process.env.PUBLIC_URL ?? ''}/admin/analytics">Open analytics</a></p>`
  return {
    html,
    subject: `Weekly analytics: ${String(t.visitors)} visitors, ${String(t.enquiries)} enquiries`,
    week: cur.from,
  }
}

/** Mondays from 08:00 Dubai. Idempotent per week (audit log), so a worker restart cannot send it twice. */
export async function runWeeklyReport(
  payload: Payload,
  send: Send,
  now = new Date(),
): Promise<{ sent: number }> {
  const parts = dubaiParts(now)
  const isMonday = new Date(`${parts.date}T12:00:00Z`).getUTCDay() === 1
  if (!isMonday || parts.h < 8) return { sent: 0 }
  const key = `weekly-${parts.date}`
  const done = await payload.count({
    collection: 'audit-log',
    overrideAccess: true,
    where: { and: [{ action: { equals: 'analytics.weekly' } }, { docId: { equals: key } }] },
  })
  if (done.totalDocs > 0) return { sent: 0 }
  await refreshToday(payload, 0)
  const s = await weeklySummary(payload, now)
  const admins = await payload.find({
    collection: 'users',
    where: { role: { equals: 'administrator' } },
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  let sent = 0
  for (const u of admins.docs as unknown as { email: string }[]) {
    await send({ to: u.email, subject: s.subject, html: s.html })
    sent++
  }
  await writeAudit(payload, {
    action: 'analytics.weekly',
    collection: 'analytics',
    docId: key,
    summary: `${String(sent)} sent`,
  })
  return { sent }
}
