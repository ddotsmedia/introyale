import config from '@payload-config'
import { Bell as BellIcon } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import { markAllRead } from '../actions'
import { fmtDate } from '../ui'
import { ThemeToggle } from './ThemeToggle'

type MediaRef = { url?: string | null; alt?: string | null } | number | null | undefined

async function branding() {
  try {
    const payload = await getPayload({ config })
    const s = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      overrideAccess: true,
    })) as unknown as {
      name?: string
      logo?: MediaRef
      adminLoginImage?: MediaRef
    }
    const url = (m: MediaRef) => (m && typeof m === 'object' ? (m.url ?? null) : null)
    return { name: s.name ?? 'Introyale', logo: url(s.logo), login: url(s.adminLoginImage) }
  } catch {
    return { name: 'Introyale', logo: null, login: null }
  }
}

export async function Logo() {
  const b = await branding()
  return b.logo ? (
    <img src={b.logo} alt="Introyale Studio" style={{ maxWidth: 190, height: 'auto' }} />
  ) : (
    <strong>Introyale Studio</strong>
  )
}

export async function Icon() {
  const b = await branding()
  return b.logo ? (
    <img
      src={b.logo}
      alt="Introyale"
      style={{ height: 30, width: 120, objectFit: 'contain', display: 'block' }}
    />
  ) : (
    <strong>I</strong>
  )
}

/** Sign-in hero: CMS image and the real logo above the Payload login form. */
export async function BeforeLogin() {
  const b = await branding()
  return (
    <div className="ir-login">
      {b.login ? <img className="hero" src={b.login} alt="" /> : null}
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', margin: 0 }}>Introyale Studio</h1>
    </div>
  )
}

type Note = { id: number; text: string; link?: string | null; createdAt: string }

/** Bell in the admin header: native <details>, no client JS. Mark-read is a server action. */
export async function Bell({ user }: { user?: { id: number | string } | null }) {
  if (!user) return null
  let notes: Note[] = []
  let unread = 0
  try {
    const payload = await getPayload({ config })
    const r = await payload.find({
      collection: 'notifications',
      where: { and: [{ user: { equals: user.id } }, { read: { equals: false } }] },
      sort: '-createdAt',
      limit: 8,
      depth: 0,
      overrideAccess: true,
    })
    notes = r.docs
    unread = r.totalDocs
  } catch {
    /* notifications unavailable: show an empty bell */
  }
  return (
    <div className="ir" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 0 }}>
      <ThemeToggle />
      <details className="ir-bell">
        <summary aria-label={`Notifications, ${String(unread)} unread`}>
          <BellIcon size={18} aria-hidden="true" />
          {unread ? <span className="ir-count">{unread}</span> : null}
        </summary>
        <div>
          {notes.length === 0 ? (
            <p className="ir-muted">No new notifications.</p>
          ) : (
            <ul className="ir-list">
              {notes.map((n) => (
                <li key={n.id} style={{ display: 'block' }}>
                  {n.link ? <Link href={n.link}>{n.text}</Link> : n.text}
                  <br />
                  <small className="ir-muted">{fmtDate(n.createdAt)}</small>
                </li>
              ))}
            </ul>
          )}
          {unread > 0 && (
            <form action={markAllRead}>
              <button className="ir-btn ghost" type="submit">
                Mark all read
              </button>
            </form>
          )}
        </div>
      </details>
    </div>
  )
}
