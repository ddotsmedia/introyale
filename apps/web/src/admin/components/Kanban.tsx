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
}
const STATUSES = ['new', 'contacted', 'site_visit', 'proposal_sent', 'won', 'lost']
const label = (s: string) => s.replace('_', ' ')

/** Drag between columns, or use the "Move to" select on each card (keyboard and screen-reader path). */
export function Kanban({ initial }: { initial: Card[] }) {
  const [cards, setCards] = useState(initial)
  const [over, setOver] = useState<string | null>(null)
  const [lost, setLost] = useState<{ id: number; reason: string } | null>(null)
  const [msg, setMsg] = useState('')
  const [, start] = useTransition()

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
      } else setMsg(`Moved to ${label(status)}`)
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
            Mark lost
          </button>{' '}
          <button className="ir-btn ghost" type="button" onClick={() => setLost(null)}>
            Cancel
          </button>
        </form>
      ) : null}
      <div className="ir-board">
        {STATUSES.map((s) => {
          const col = cards.filter((c) => c.status === s)
          return (
            <section
              key={s}
              className={`ir-col${over === s ? ' over' : ''}`}
              aria-label={`${label(s)}, ${String(col.length)} leads`}
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
                {label(s)} <span>{col.length}</span>
              </h3>
              {col.map((c) => (
                <article
                  key={c.id}
                  className="ir-lead"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', String(c.id))}
                >
                  <Link href={`/admin/lead?id=${String(c.id)}`}>{c.ref}</Link> {c.name}
                  <div className="ir-muted" style={{ fontSize: '0.8rem' }}>
                    {c.sector || 'No sector'}
                    {c.priority === 'high' ? ' · high priority' : ''}
                    {c.value ? ` · AED ${c.value.toLocaleString('en-GB')}` : ''}
                    {c.due ? ` · due ${c.due}` : ''}
                  </div>
                  <select
                    aria-label={`Move ${c.ref} to`}
                    value={c.status}
                    onChange={(e) => move(c.id, e.target.value)}
                  >
                    {STATUSES.map((o) => (
                      <option key={o} value={o}>
                        {label(o)}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}
