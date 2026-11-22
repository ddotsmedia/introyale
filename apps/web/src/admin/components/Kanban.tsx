'use client'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { moveLead } from '../actions'

export type Card = {
  id: number
  ref: string
  name: string
  sector: string
  priority: string
  value: number | null
  due: string | null
  status: string
  assignee: string
}
const STATUSES = ['new', 'contacted', 'site_visit', 'proposal_sent', 'won', 'lost']
const ACCENT: Record<string, string> = {
  new: '#7a5a36',
  contacted: '#a88b64',
  site_visit: '#5f7f8f',
  proposal_sent: '#8a6a9a',
  won: '#2f6b4f',
  lost: '#a23b2a',
}
const initialsOf = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? (p.at(-1)?.[0] ?? '') : '')).toUpperCase()
}
const aed = (n: number) => `AED ${n.toLocaleString('en-GB')}`

/** Drag between columns, or use the "Move to" select on each card (keyboard and screen-reader path). */
export function Kanban({ initial, labels }: { initial: Card[]; labels: Record<string, string> }) {
  const [cards, setCards] = useState(initial)
  const [over, setOver] = useState<string | null>(null)
  const [lost, setLost] = useState<{ id: number; reason: string } | null>(null)
  const [msg, setMsg] = useState('')
  const [, start] = useTransition()
  const today = new Date().toISOString().slice(0, 10)

  function move(id: number, status: string, reason?: string) {
    const prev = cards
    if (status === 'lost' && !reason) {
      setLost({ id, reason: '' })
      return
    }
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)))
    setLost(null)
    start(async () => {
      const r = await moveLead(id, status, reason)
      if (!r.ok) {
        setCards(prev)
        setMsg(r.message)
      } else setMsg(`Moved to ${labels[status] ?? status}`)
    })
  }

  return (
    <>
      <p role="status" className="ir-muted" aria-live="polite">
        {msg}
      </p>
      {lost ? (
        <form
          className="ir-card"
          style={{ marginBlockEnd: 12 }}
          onSubmit={(e) => {
            e.preventDefault()
            if (lost.reason.trim()) move(lost.id, 'lost', lost.reason.trim())
          }}
        >
          <label>
            Reason for losing this lead (required)
            <input
              type="text"
              value={lost.reason}
              onChange={(e) => setLost({ ...lost, reason: e.target.value })}
              required
              style={{ width: '100%' }}
            />
          </label>
          <button className="ir-btn" type="submit">
            Mark Lost
          </button>{' '}
          <button className="ir-btn ghost" type="button" onClick={() => setLost(null)}>
            Cancel
          </button>
        </form>
      ) : null}
      <div className="ir-board">
        {STATUSES.map((s) => {
          const col = cards.filter((c) => c.status === s)
          const sum = col.reduce((n, c) => n + (c.value ?? 0), 0)
          return (
            <section
              key={s}
              className={`ir-col${over === s ? ' over' : ''}`}
              style={{ ['--accent' as string]: ACCENT[s] }}
              aria-label={`${labels[s] ?? s}, ${String(col.length)} leads`}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(s)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault()
                setOver(null)
                const id = Number(e.dataTransfer.getData('text/plain'))
                if (id) move(id, s)
              }}
            >
              <h3>
                <span>
                  {labels[s] ?? s}
                  <span className="total">
                    {col.length} {col.length === 1 ? 'lead' : 'leads'} · {aed(sum)}
                  </span>
                </span>
              </h3>
              {col.map((c) => {
                const overdue = !!c.due && c.due < today && !['won', 'lost'].includes(c.status)
                return (
                  <article
                    key={c.id}
                    className="ir-lead"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(c.id))}
                  >
                    <Link href={`/admin/lead?id=${String(c.id)}`}>{c.ref}</Link> {c.name}
                    <div className="ir-muted" style={{ fontSize: '0.8rem' }}>
                      {c.sector || 'No sector'}
                    </div>
                    <div className="meta">
                      <span
                        className="ir-avatar"
                        title={c.assignee || 'Unassigned'}
                        aria-label={c.assignee ? `Assigned to ${c.assignee}` : 'Unassigned'}
                      >
                        {c.assignee ? initialsOf(c.assignee) : '–'}
                      </span>
                      <span
                        className={`ir-badge ${c.priority === 'high' ? 'bad' : c.priority === 'low' ? '' : 'warn'}`}
                      >
                        {c.priority.replace(/^./, (x) => x.toUpperCase())}
                      </span>
                      {c.value ? <span>{aed(c.value)}</span> : null}
                      {c.due ? (
                        <span className={overdue ? 'overdue' : ''}>
                          {overdue ? 'Overdue · ' : 'Due '}
                          {c.due}
                        </span>
                      ) : null}
                    </div>
                    <select
                      aria-label={`Move ${c.ref} to`}
                      value={c.status}
                      onChange={(e) => move(c.id, e.target.value)}
                    >
                      {STATUSES.map((o) => (
                        <option key={o} value={o}>
                          {labels[o] ?? o}
                        </option>
                      ))}
                    </select>
                  </article>
                )
              })}
            </section>
          )
        })}
      </div>
    </>
  )
}
