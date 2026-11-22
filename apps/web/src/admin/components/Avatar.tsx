'use client'
import { useAuth } from '@payloadcms/ui'

/** Initials avatar: no external image (Gravatar), so nothing leaves the site and nothing breaks offline. */
export function Avatar() {
  const { user } = useAuth()
  const name = (user as { name?: string } | null)?.name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const text =
    ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase() ||
    '?'
  return (
    <span className="ir-avatar" role="img" aria-label={name || 'Account'}>
      {text}
    </span>
  )
}
