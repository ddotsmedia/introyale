'use client'

import { useAuth } from '@payloadcms/ui'
import {
  ChevronDown,
  ExternalLink,
  FileText,
  FolderKanban,
  BookOpen,
  Inbox,
  Plus,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { can, type Role } from '../../lib/roles'

/** Top bar actions: search (opens the Ctrl/⌘K palette), "+ New" menu, "View site". Bell and theme follow. */
export function TopActions() {
  const { user } = useAuth()
  const role = (user as { role?: Role } | null)?.role
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const close = (e: Event) => {
      const m = menu.current
      if (!m?.open) return
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !m.contains(e.target as Node))
        m.open = false
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', close)
    }
  }, [])
  const items = [
    can(role, 'project.write') && {
      href: '/admin/collections/projects/create',
      label: 'Project',
      Icon: FolderKanban,
    },
    can(role, 'content.write') && {
      href: '/admin/collections/journal-posts/create',
      label: 'Journal post',
      Icon: BookOpen,
    },
    can(role, 'content.write') && {
      href: '/admin/collections/pages/create',
      label: 'Page',
      Icon: FileText,
    },
    can(role, 'enquiries.read') && {
      href: '/admin/collections/enquiries/create',
      label: 'Lead',
      Icon: Inbox,
    },
  ].filter((x): x is { href: string; label: string; Icon: typeof Inbox } => !!x)
  return (
    <div className="ir-topbar">
      <button
        type="button"
        className="ir-search"
        aria-label="Search leads, projects, pages (Ctrl K)"
        onClick={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
        }}
      >
        <Search size={16} aria-hidden="true" />
        <span>Search leads, projects, pages</span>
        <kbd>Ctrl K</kbd>
      </button>
      {items.length > 0 && (
        <details className="ir-menu" ref={menu}>
          <summary className="ir-btn">
            <Plus size={16} aria-hidden="true" /> <span className="ir-newlabel">New</span>{' '}
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <ul>
            {items.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href}>
                  <Icon size={16} aria-hidden="true" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
      <a className="ir-btn ghost ir-viewsite" href="/" target="_blank" rel="noreferrer">
        <ExternalLink size={15} aria-hidden="true" /> <span>View site</span>
        <span className="ir-sr"> (opens in a new tab)</span>
      </a>
    </div>
  )
}
