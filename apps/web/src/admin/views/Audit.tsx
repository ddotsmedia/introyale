import type { AdminViewServerProps, Where } from 'payload'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, fmtDate } from '../ui'

type A = {
  id: number
  action: string
  collection: string
  docId: string
  fromStatus?: string
  toStatus?: string
  diffSummary?: string
  ip?: string
  at: string
  actor?: { name?: string } | number | null
}
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export async function Audit(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="users.manage"
      title={tr(lang, 'auditViewer')}
      sub="Append-only record of state changes."
    >
      {async ({ payload, sp }) => {
        const f = {
          actor: one(sp.actor),
          collection: one(sp.collection),
          action: one(sp.action),
          from: one(sp.from),
          to: one(sp.to),
        }
        const and: Where[] = []
        if (f.actor) and.push({ actor: { equals: Number(f.actor) } })
        if (f.collection) and.push({ collection: { equals: f.collection } })
        if (f.action) and.push({ action: { like: f.action } })
        if (f.from) and.push({ at: { greater_than_equal: new Date(f.from).toISOString() } })
        if (f.to) and.push({ at: { less_than_equal: new Date(`${f.to}T23:59:59`).toISOString() } })
        const [res, users] = await Promise.all([
          payload.find({
            collection: 'audit-log',
            overrideAccess: true,
            depth: 1,
            limit: 100,
            sort: '-at',
            where: { and },
          }),
          payload.find({
            collection: 'users',
            overrideAccess: true,
            depth: 0,
            limit: 100,
            select: { name: true },
          }),
        ])
        return (
          <>
            <form className="ir-filters" method="get" aria-label="Filter audit log">
              <label>
                Actor
                <select name="actor" defaultValue={f.actor}>
                  <option value="">Anyone</option>
                  {(users.docs as unknown as { id: number; name: string }[]).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Collection
                <input type="text" name="collection" defaultValue={f.collection} />
              </label>
              <label>
                Action
                <input type="text" name="action" defaultValue={f.action} />
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
              <a className="ir-btn ghost" href="/api/admin-tools/audit-csv">
                Export CSV
              </a>
            </form>
            <table className="ir-table">
              <caption className="ir-sr">Audit log</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Target</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {(res.docs as unknown as A[]).map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDate(a.at)}</td>
                    <td>{typeof a.actor === 'object' && a.actor ? a.actor.name : 'system'}</td>
                    <td>
                      <Badge>{a.action}</Badge>
                    </td>
                    <td>
                      {a.collection} #{a.docId}
                    </td>
                    <td>
                      <details>
                        <summary>
                          {a.fromStatus || a.toStatus
                            ? `${a.fromStatus ?? '∅'} → ${a.toStatus ?? '∅'}`
                            : (a.diffSummary ?? 'details')}
                        </summary>
                        <dl>
                          <dt>Summary</dt>
                          <dd>{a.diffSummary ?? '—'}</dd>
                          <dt>From</dt>
                          <dd>{a.fromStatus ?? '—'}</dd>
                          <dt>To</dt>
                          <dd>{a.toStatus ?? '—'}</dd>
                          <dt>IP</dt>
                          <dd>{a.ip ?? '—'}</dd>
                        </dl>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      }}
    </Shell>
  )
}
