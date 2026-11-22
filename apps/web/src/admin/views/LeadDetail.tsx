import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import {
  addLeadNote,
  addLeadTask,
  mergeLeadAction,
  removeLeadTask,
  replyToLead,
  saveLead,
  toggleLeadTask,
} from '../actions'
import { crmSettings } from '../dashStats'
import { Shell } from '../Shell'
import { Badge, Card, fmtDate } from '../ui'
import { LEAD_STATUSES, normPhone } from '../../lib/leads'
import { SLA_LABEL, slaFor, tasksForLead } from '../../lib/crmPlus'

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
        const [tasks, settings] = await Promise.all([
          tasksForLead(payload, id),
          crmSettings(payload),
        ])
        const sla = slaFor(
          lead as { createdAt: string; firstContactAt?: string | null; status?: string | null },
          settings.slaHours,
        )
        const reasons = (lead.scoreReasons ?? []) as { label: string; points: number }[]
        const attr = lead.attribution as {
          source?: string
          device?: string
          first?: { landing?: string; referrer?: string; campaign?: string | null; source?: string }
          last?: { landing?: string; referrer?: string; campaign?: string | null; source?: string }
          pages?: string[]
        } | null
        const related = (
          (lead.related ?? []) as { id?: number; ref?: string; name?: string }[]
        ).filter((r) => typeof r === 'object' && r.id)
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
              <Card title="Lead score">
                {lead.score != null ? (
                  <>
                    <p style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
                      <span
                        className={`ir-chip ${Number(lead.score) >= 70 ? 'hot' : Number(lead.score) >= 40 ? 'warm' : ''}`}
                        title={reasons.map((r) => `+${String(r.points)} ${r.label}`).join('\n')}
                      >
                        {String(lead.score)}
                      </span>{' '}
                      <small className="ir-muted">
                        {Number(lead.score) >= 70
                          ? 'hot'
                          : Number(lead.score) >= 40
                            ? 'warm'
                            : 'cold'}{' '}
                        (0 to 100)
                      </small>
                    </p>
                    <ul className="ir-list">
                      {reasons.map((r) => (
                        <li key={r.label}>
                          {r.label} <b>+{r.points}</b>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="ir-muted">Not scored.</p>
                )}
              </Card>
              <Card title="Where this lead came from">
                {attr ? (
                  <table className="ir-table">
                    <tbody>
                      <tr>
                        <th scope="row">Source</th>
                        <td>{attr.source}</td>
                      </tr>
                      <tr>
                        <th scope="row">Device</th>
                        <td>{attr.device}</td>
                      </tr>
                      <tr>
                        <th scope="row">First touch</th>
                        <td>
                          {attr.first?.source}
                          {attr.first?.referrer ? ` (${attr.first.referrer})` : ''} →{' '}
                          {attr.first?.landing}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Last touch</th>
                        <td>
                          {attr.last?.source}
                          {attr.last?.campaign ? ` · ${attr.last.campaign}` : ''} →{' '}
                          {attr.last?.landing}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Pages viewed</th>
                        <td>{(attr.pages ?? []).join(' → ') || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="ir-muted">
                    No attribution (visitor opted out, or sent before analytics).
                  </p>
                )}
              </Card>
              <Card title="Response time">
                <p>
                  <Badge
                    tone={
                      sla.state === 'met' || sla.state === 'ok'
                        ? 'ok'
                        : sla.state === 'due'
                          ? 'warn'
                          : 'bad'
                    }
                  >
                    {SLA_LABEL[sla.state]}
                  </Badge>
                </p>
                <p className="ir-muted">
                  {lead.firstContactAt
                    ? `First contact ${fmtDate(lead.firstContactAt as string)}, ${String(sla.hours)} business hour(s) after the enquiry.`
                    : `Not contacted yet: ${String(sla.hours)} of ${String(sla.limit)} business hours used.`}
                </p>
              </Card>
            </div>
            <div className="ir-cols">
              <Card title="Tasks and reminders">
                <ul className="ir-list">
                  {tasks.map((t) => (
                    <li key={t.id}>
                      <form action={toggleLeadTask} style={{ display: 'inline' }}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <input type="hidden" name="done" value={t.done_at ? '0' : '1'} />
                        <button
                          className="ir-btn ghost"
                          type="submit"
                          aria-label={t.done_at ? 'Reopen task' : 'Mark task done'}
                        >
                          {t.done_at ? '↺' : '✓'}
                        </button>
                      </form>{' '}
                      <span style={t.done_at ? { textDecoration: 'line-through' } : undefined}>
                        {t.title}{' '}
                        <small className="ir-muted">
                          ({t.kind}, {fmtDate(t.due_at)})
                        </small>
                      </span>
                      <form action={removeLeadTask}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <button
                          className="ir-btn ghost"
                          type="submit"
                          aria-label={`Delete task ${t.title}`}
                        >
                          Delete
                        </button>
                      </form>
                    </li>
                  ))}
                  {tasks.length === 0 ? <li className="ir-muted">No tasks yet.</li> : null}
                </ul>
                <form action={addLeadTask} className="ir-filters">
                  <input type="hidden" name="id" value={id} />
                  <label>
                    Task
                    <input type="text" name="title" required maxLength={200} />
                  </label>
                  <label>
                    Type
                    <select name="kind">
                      <option value="task">Task</option>
                      <option value="call">Call</option>
                      <option value="visit">Site visit</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </label>
                  <label>
                    Due
                    <input type="datetime-local" name="dueAt" required />
                  </label>
                  <label>
                    Assign to
                    <select name="assignee" defaultValue={assigned}>
                      <option value="">Lead owner</option>
                      {(users.docs as unknown as Named[]).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="ir-btn" type="submit">
                    Add task
                  </button>
                </form>
              </Card>
              {related.length > 0 ? (
                <Card title="Possible duplicates">
                  <p className="ir-muted">
                    Same email or phone within 90 days. Merging moves notes, tags and tasks here and
                    closes the duplicate as lost. Nothing is deleted.
                  </p>
                  <form action={mergeLeadAction} className="ir-filters">
                    <input type="hidden" name="id" value={id} />
                    <label>
                      Merge this duplicate into this lead
                      <select name="duplicateId">
                        {related.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.ref} {r.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="ir-btn ghost" type="submit">
                      Merge
                    </button>
                  </form>
                </Card>
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
