import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { markAllRead } from '../actions'
import { can, type Role } from '../../lib/roles'
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

type NavProps = { user?: { role?: Role } | null }

const GROUPS: {
  name: string
  links: { href: string; label: string; need?: Parameters<typeof can>[1] }[]
}[] = [
  {
    name: 'Dashboard',
    links: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/analytics', label: 'Analytics', need: 'analytics.view' },
    ],
  },
  {
    name: 'Leads',
    links: [
      { href: '/admin/leads-board', label: 'Leads board', need: 'enquiries.read' },
      { href: '/admin/leads', label: 'Leads table', need: 'enquiries.read' },
      { href: '/admin/calendar', label: 'Calendar & tasks', need: 'enquiries.read' },
    ],
  },
  {
    name: 'Content',
    links: [
      { href: '/admin/workflow', label: 'Workflow board', need: 'comment' },
      { href: '/admin/content-health', label: 'Content health', need: 'content.health' },
    ],
  },
  {
    name: 'Media',
    links: [{ href: '/admin/media-library', label: 'Media library', need: 'comment' }],
  },
  {
    name: 'Site',
    links: [
      {
        href: '/admin/site-tools',
        label: 'Redirects, 404s, integrations',
        need: 'redirects.manage',
      },
    ],
  },
  {
    name: 'System',
    links: [
      { href: '/admin/system', label: 'System status', need: 'system.view' },
      { href: '/admin/security', label: 'Users & security', need: 'users.manage' },
      { href: '/admin/audit', label: 'Audit log', need: 'users.manage' },
    ],
  },
]

/** Custom views, grouped and collapsible, above Payload's own collection groups. */
export function NavLinks({ user }: NavProps) {
  const role = user?.role
  return (
    <nav aria-label="Studio" className="ir" style={{ padding: 0 }}>
      {GROUPS.map((g) => {
        const links = g.links.filter((l) => !l.need || can(role, l.need))
        if (!links.length) return null
        return (
          <details key={g.name} open style={{ marginBlockEnd: 8 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{g.name}</summary>
            <ul className="ir-list" style={{ paddingInlineStart: 12 }}>
              {links.map((l) => (
                <li key={l.href} style={{ border: 0, padding: '3px 0' }}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </details>
        )
      })}
    </nav>
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
          🔔{unread ? <span className="ir-count">{unread}</span> : null}
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
