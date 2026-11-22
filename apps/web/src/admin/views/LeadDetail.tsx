import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { addLeadNote, replyToLead, saveLead } from '../actions'
import { Shell } from '../Shell'
import { Badge, Card, fmtDate } from '../ui'
import { LEAD_STATUSES, normPhone } from '../../lib/leads'

type L = Record<string, any>
type Named = { id: number; name: string }
const nameOf = (u: unknown): string =>
  u && typeof u === 'object' ? ((u as { name?: string }).name ?? '') : ''

export async function LeadDetail(props: AdminViewServerProps) {
  return (
    <Shell view={props} action="enquiries.read" title="Lead">
      {async ({ payload, user, req, sp }) => {
        const id = Number(Array.isArray(sp.id) ? sp.id[0] : sp.id)
        let lead: L | null = null
        try {
          lead = await payload.findByID({
            collection: 'enquiries',
            id,
            req,
            overrideAccess: false,
            depth: 1,
          })
        } catch {
          lead = null
        }
        if (!lead) {
          return (
            <div className="ir-card" role="alert">
              Lead not found, or not assigned to you.
            </div>
          )
        }
        const [users, templates] = await Promise.all([
          payload.find({
            collection: 'users',
            overrideAccess: true,
            depth: 0,
            limit: 100,
            select: { name: true },
          }),
          payload.find({
            collection: 'email-templates',
            req,
            overrideAccess: false,
            depth: 0,
            limit: 50,
          }),
        ])
        const timeline = [
          ...((lead.activity ?? []) as { text: string; actor?: unknown; at: string }[]).map(
            (a) => ({
              at: a.at,
              text: a.text,
              who: nameOf(a.actor),
            }),
          ),
          { at: lead.createdAt as string, text: 'Enquiry received', who: '' },
        ].sort((a, b) => +new Date(b.at) - +new Date(a.at))
        const wa = normPhone(lead.phone as string | undefined)
        const details: [string, unknown][] = [
          ['Email', lead.email],
          ['Phone', lead.phone],
          ['Sector', lead.sector],
          ['Location', lead.location],
          ['Property', lead.propertyType],
          ['Budget band', lead.budgetBand],
          ['Source', lead.sourcePage],
          ['Received', fmtDate(lead.createdAt as string)],
        ]
        const assigned =
          typeof lead.assignedTo === 'object' && lead.assignedTo ? String(lead.assignedTo.id) : ''
        return (
          <>
            <p className="sub">
              <Link href="/admin/leads-board">Board</Link> · <Link href="/admin/leads">Table</Link>
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>
              {lead.ref} · {lead.name}{' '}
              <Badge>{String(lead.status ?? 'new').replace('_', ' ')}</Badge>{' '}
              {lead.isTest ? <Badge>TEST</Badge> : null}
            </p>
            <div className="ir-actions">
              {lead.phone ? (
                <a className="ir-btn" href={`tel:${String(lead.phone).replace(/\s/g, '')}`}>
                  Call
                </a>
              ) : null}
              {wa ? (
                <a
                  className="ir-btn ghost"
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp<span className="ir-sr"> (opens in a new tab)</span>
                </a>
              ) : null}
              {lead.email ? (
                <a className="ir-btn ghost" href={`mailto:${String(lead.email)}`}>
                  Email
                </a>
              ) : null}
            </div>
            <div className="ir-cols">
              <Card title="Enquiry">
                <table className="ir-table">
                  <tbody>
                    {details.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{String(v ?? '—')}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">Brief</th>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{String(lead.brief ?? '—')}</td>
                    </tr>
                  </tbody>
                </table>
                {Array.isArray(lead.related) && lead.related.length > 0 ? (
                  <p>
                    Possible duplicates:{' '}
                    {(lead.related as L[]).map((r) => (
                      <Link key={String(r.id)} href={`/admin/lead?id=${String(r.id)}`}>
                        {String(r.ref)}{' '}
                      </Link>
                    ))}
                  </p>
                ) : null}
              </Card>
              <Card title="Manage">
                <form action={saveLead}>
                  <input type="hidden" name="id" value={id} />
                  <div className="ir-filters">
                    <label>
                      Status
                      <select name="status" defaultValue={String(lead.status ?? 'new')}>
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Reason if lost
                      <input
                        type="text"
                        name="lostReason"
                        defaultValue={String(lead.lostReason ?? '')}
                      />
                    </label>
                    <label>
                      Priority
                      <select name="priority" defaultValue={String(lead.priority ?? 'normal')}>
                        <option>low</option>
                        <option>normal</option>
                        <option>high</option>
                      </select>
                    </label>
                    {user.role === 'administrator' ? (
                      <label>
                        Assigned to
                        <select name="assignedTo" defaultValue={assigned}>
                          <option value="">Unassigned</option>
                          {(users.docs as unknown as Named[]).map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <label>
                      Follow-up
                      <input
                        type="date"
                        name="followUpAt"
                        defaultValue={lead.followUpAt ? String(lead.followUpAt).slice(0, 10) : ''}
                      />
                    </label>
                    <label>
                      Value (AED)
                      <input
                        type="number"
                        name="estimatedValue"
                        defaultValue={String(lead.estimatedValue ?? '')}
                      />
                    </label>
                    <label>
                      Tags (comma separated)
                      <input
                        type="text"
                        name="tags"
                        defaultValue={Array.isArray(lead.tags) ? lead.tags.join(', ') : ''}
                      />
                    </label>
                  </div>
                  <button className="ir-btn" type="submit">
                    Save changes
                  </button>
                </form>
              </Card>
            </div>
            <div className="ir-cols">
              <Card title="Notes">
                <ul className="ir-list">
                  {((lead.notes ?? []) as { author?: unknown; text: string; at: string }[]).map(
                    (n, i) => (
                      <li key={i} style={{ display: 'block' }}>
                        {n.text}
                        <br />
                        <small className="ir-muted">
                          {nameOf(n.author)} · {fmtDate(n.at)}
                        </small>
                      </li>
                    ),
                  )}
                </ul>
                <form action={addLeadNote}>
                  <input type="hidden" name="id" value={id} />
                  <label>
                    Add a note
                    <textarea name="text" required />
                  </label>
                  <button className="ir-btn ghost" type="submit">
                    Add note
                  </button>
                </form>
              </Card>
              <Card title="Reply by email">
                <form action={replyToLead}>
                  <input type="hidden" name="id" value={id} />
                  <label>
                    Template
                    <select name="templateId" defaultValue="">
                      <option value="">Write my own</option>
                      {(templates.docs as unknown as { id: number; name: string }[]).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Subject (own message)
                    <input type="text" name="subject" style={{ width: '100%' }} />
                  </label>
                  <label>
                    Message
                    <textarea name="body" />
                  </label>
                  <button className="ir-btn" type="submit" disabled={!lead.email}>
                    Send
                  </button>
                </form>
              </Card>
            </div>
            <Card title="Timeline">
              <ol className="ir-timeline">
                {timeline.map((t, i) => (
                  <li key={i}>
                    {t.text}
                    <br />
                    <small className="ir-muted">
                      {t.who ? `${t.who} · ` : ''}
                      {fmtDate(t.at)}
                    </small>
                  </li>
                ))}
              </ol>
            </Card>
          </>
        )
      }}
    </Shell>
  )
}
