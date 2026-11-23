'use client'

import { useNav } from '@payloadcms/ui'
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  Gauge,
  HeartPulse,
  History,
  Home,
  Image as ImageIcon,
  KanbanSquare,
  Layers,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plug,
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Table2,
  Users,
  UserSquare,
  Wand2,
  HelpCircle,
  Navigation,
  Server,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export type NavItem = { href: string; label: string; icon: string; badge?: number; exact?: boolean }
export type NavGroup = { name: string; items: NavItem[] }
type Props = {
  groups: NavGroup[]
  user: { name: string; role: string }
  logo: string | null
}

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  board: KanbanSquare,
  table: Table2,
  calendar: CalendarDays,
  pages: FileText,
  home: Home,
  projects: FolderKanban,
  services: Layers,
  sectors: Building2,
  journal: BookOpen,
  team: UserSquare,
  testimonials: MessageSquareQuote,
  clients: Users,
  faq: HelpCircle,
  media: ImageIcon,
  workflow: ClipboardList,
  health: HeartPulse,
  site: Settings,
  navigation: Navigation,
  footer: Menu,
  contact: Phone,
  social: Share2,
  seo: Search,
  consultation: Mail,
  legal: Scale,
  motion: Wand2,
  integrations: Plug,
  redirects: Link2,
  system: Server,
  security: ShieldCheck,
  audit: History,
}

const initialsOf = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

const LS = 'ir-nav'

/** One grouped sidebar: icons, active pill, collapsible groups (remembered), icon-rail toggle, user card. */
export function Sidebar({ groups, user, logo }: Props) {
  const path = usePathname()
  const { navOpen, setNavOpen, navRef } = useNav()
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const [rail, setRail] = useState(false)
  const [wide, setWide] = useState(true)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS) ?? '{}') as {
        closed?: Record<string, boolean>
        rail?: boolean
      }
      setClosed(s.closed ?? {})
      setRail(!!s.rail)
    } catch {
      /* storage unavailable: defaults */
    }
  }, [])
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const on = () => {
      setWide(mq.matches)
    }
    on()
    mq.addEventListener('change', on)
    return () => {
      mq.removeEventListener('change', on)
    }
  }, [])
  useEffect(() => {
    document.documentElement.toggleAttribute('data-ir-rail', rail)
  }, [rail])
  const save = (c: Record<string, boolean>, r: boolean) => {
    try {
      localStorage.setItem(LS, JSON.stringify({ closed: c, rail: r }))
    } catch {
      /* ignore */
    }
  }
  const active = (i: NavItem) => {
    const p = path.replace(/\/$/, '')
    return i.exact ? p === i.href : p === i.href || p.startsWith(`${i.href}/`)
  }
  // Close the mobile drawer after a navigation.
  useEffect(() => {
    if (window.innerWidth < 768) setNavOpen(false)
  }, [path, setNavOpen])

  return (
    <aside
      className={`nav ir-nav nav--nav-hydrated nav--nav-animate${navOpen || wide ? ' nav--nav-open' : ''}`}
      inert={navOpen || wide ? undefined : true}
    >
      <div className="nav__scroll ir-nav-scroll" ref={navRef}>
        <div className="ir-nav-head">
          <Link href="/admin" aria-label="Introyale Studio dashboard">
            {logo ? (
              <img className="ir-nav-logo" src={logo} alt="Introyale" />
            ) : (
              <strong>Introyale</strong>
            )}
            <span className="ir-nav-mono" aria-hidden="true">
              I
            </span>
          </Link>
          <button
            type="button"
            className="ir-icon-btn ir-rail-toggle"
            aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={rail}
            onClick={() => {
              setRail(!rail)
              save(closed, !rail)
            }}
          >
            {rail ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <nav aria-label="Studio" className="ir-nav-groups">
          {groups.map((g) => {
            const isClosed = !!closed[g.name] && !g.items.some(active)
            return (
              <div className="ir-nav-group" key={g.name}>
                <button
                  type="button"
                  className="ir-nav-group-h"
                  aria-expanded={!isClosed}
                  onClick={() => {
                    const c = { ...closed, [g.name]: !closed[g.name] }
                    setClosed(c)
                    save(c, rail)
                  }}
                >
                  <span>{g.name}</span>
                  <ChevronDown size={14} className={isClosed ? 'is-shut' : ''} />
                </button>
                {!isClosed && (
                  <ul>
                    {g.items.map((i) => {
                      const Icon = ICONS[i.icon] ?? Gauge
                      const on = active(i)
                      return (
                        <li key={i.href}>
                          <Link
                            href={i.href}
                            className={`ir-nav-link${on ? ' is-active' : ''}`}
                            aria-current={on ? 'page' : undefined}
                            title={rail ? i.label : undefined}
                          >
                            <Icon size={18} aria-hidden="true" />
                            <span className="ir-nav-label">{i.label}</span>
                            {i.badge ? (
                              <span className="ir-nav-badge" aria-label={`${String(i.badge)} new`}>
                                {i.badge > 99 ? '99+' : i.badge}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
        <div className="ir-usercard">
          <Link href="/admin/account" className="ir-usercard-who" title="Account and 2FA">
            <span className="ir-avatar">{initialsOf(user.name)}</span>
            <span className="ir-nav-label">
              <b>{user.name}</b>
              <small>{user.role.replace(/_/g, ' ')}</small>
            </span>
          </Link>
          <Link
            href="/admin/logout"
            className="ir-icon-btn ir-nav-label"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
