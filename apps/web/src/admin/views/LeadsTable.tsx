import Link from 'next/link'
import type { AdminViewServerProps, Where } from 'payload'
import { deleteView, saveView } from '../actions'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, fmtDate } from '../ui'
import { LEAD_STATUSES } from '../../lib/leads'

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export async function LeadsTable(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell view={props} action="enquiries.read" title={tr(lang, 'leadsTable')}>
      {async ({ payload, user, req, sp }) => {
        const f = {
          status: one(sp.status),
          sector: one(sp.sector),
          assignee: one(sp.assignee),
          priority: one(sp.priority),
          from: one(sp.from),
          to: one(sp.to),
          q: one(sp.q),
        }
        const and: Where[] = []
        if (f.status) and.push({ status: { equals: f.status } })
        if (f.sector) and.push({ sector: { equals: f.sector } })
        if (f.assignee)
          and.push(
            f.assignee === 'none'
              ? { assignedTo: { exists: false } }
              : { assignedTo: { equals: Number(f.assignee) } },
          )
        if (f.priority) and.push({ priority: { equals: f.priority } })
        if (f.from) and.push({ createdAt: { greater_than_equal: new Date(f.from).toISOString() } })
        if (f.to)
          and.push({ createdAt: { less_than_equal: new Date(`${f.to}T23:59:59`).toISOString() } })
        if (f.q)
          and.push({
            or: [{ name: { like: f.q } }, { email: { like: f.q } }, { ref: { like: f.q } }],
          })
        const [res, users, views, sectors] = await Promise.all([
          payload.find({
            collection: 'enquiries',
            req,
            overrideAccess: false,
            depth: 1,
            limit: 50,
            sort: '-createdAt',
            where: { and },
          }),
          payload.find({
            collection: 'users',
            overrideAccess: true,
            depth: 0,
            limit: 100,
            select: { name: true },
          }),
          payload.find({
            collection: 'saved-views',
            req,
            overrideAccess: false,
            depth: 0,
            limit: 20,
          }),
          payload.find({
            collection: 'sectors',
            overrideAccess: true,
            depth: 0,
            limit: 20,
            select: { title: true },
          }),
        ])
        const query = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString()
        return (
          <>
            <form className="ir-filters" method="get" aria-label="Filter leads">
              <label>
                Search
                <input type="search" name="q" defaultValue={f.q} />
              </label>
              <label>
                Status
                <select name="status" defaultValue={f.status}>
                  <option value="">All</option>
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sector
                <select name="sector" defaultValue={f.sector}>
                  <option value="">All</option>
                  {(sectors.docs as unknown as { id: number; title: string }[]).map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Assignee
                <select name="assignee" defaultValue={f.assignee}>
                  <option value="">All</option>
                  <option value="none">Unassigned</option>
                  {(users.docs as unknown as { id: number; name: string }[]).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select name="priority" defaultValue={f.priority}>
                  <option value="">All</option>
                  <option>low</option>
                  <option>normal</option>
                  <option>high</option>
                </select>
              </label>
              <label>
                From
                <input type="date" name="from" defaultValue={f.from} />
              </label>
              <label>
                To
                <input type="date" name="to" defaultValue={f.to} />
              </label>
              <button className="ir-btn" type="submit">
                Filter
              </button>
              <Link className="ir-btn ghost" href="/admin/leads">
                Reset
              </Link>
              {user.role === 'administrator' && (
                <a className="ir-btn ghost" href="/api/admin-tools/leads-csv">
                  Export CSV
                </a>
              )}
            </form>
            <div className="ir-card" style={{ marginBlockEnd: 16 }}>
              <h2>Saved views</h2>
              <ul className="ir-list">
                {(views.docs as unknown as { id: number; name: string; query: string }[]).map(
                  (v) => (
                    <li key={v.id}>
                      <Link href={`/admin/leads?${v.query}`}>{v.name}</Link>
                      <form action={deleteView}>
                        <input type="hidden" name="id" value={v.id} />
                        <button className="ir-btn ghost" type="submit">
                          Delete
                        </button>
                      </form>
                    </li>
                  ),
                )}
              </ul>
              <form action={saveView} className="ir-filters">
                <input type="hidden" name="query" value={query} />
                <label>
                  Save current filters as
                  <input type="text" name="name" required />
                </label>
                <button className="ir-btn ghost" type="submit">
                  Save view
                </button>
              </form>
            </div>
            <table className="ir-table">
              <caption className="ir-sr">Leads</caption>
              <thead>
                <tr>
                  <th scope="col">Ref</th>
                  <th scope="col">Name</th>
                  <th scope="col">Sector</th>
                  <th scope="col">Status</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Assignee</th>
                  <th scope="col">Follow-up</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {(res.docs as unknown as Record<string, any>[]).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/admin/lead?id=${String(e.id)}`}>{e.ref}</Link>
                    </td>
                    <td>
                      {e.name}
                      {e.isTest ? (
                        <>
                          {' '}
                          <Badge>TEST</Badge>
                        </>
                      ) : null}
                    </td>
                    <td>{e.sector ?? '—'}</td>
                    <td>
                      <Badge>{String(e.status ?? 'new').replace('_', ' ')}</Badge>
                    </td>
                    <td>{e.priority}</td>
                    <td>
                      {typeof e.assignedTo === 'object' && e.assignedTo ? e.assignedTo.name : '—'}
                    </td>
                    <td>{fmtDate(e.followUpAt)}</td>
                    <td>{fmtDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ir-muted">
              {res.totalDocs} lead(s)
              {res.totalDocs > 50
                ? ', showing the latest 50. Narrow the filters to see others.'
                : ''}
            </p>
          </>
        )
      }}
    </Shell>
  )
}
