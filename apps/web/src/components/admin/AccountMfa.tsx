'use client'

import { useAuth, useDocumentInfo } from '@payloadcms/ui'
import { MfaPanel } from './MfaPanel'

/** "Two-factor authentication" section on a user's own account page (opt-in, D10). Hidden on other people's records. */
export function AccountMfa() {
  const { user } = useAuth<{ id: number | string; totp?: { enabled?: boolean | null } }>()
  const { id } = useDocumentInfo()
  if (!user || String(user.id) !== String(id)) return null
  return (
    <section aria-labelledby="mfa-title" style={{ marginBottom: 24 }}>
      <h2 id="mfa-title">Two-factor authentication</h2>
      <MfaPanel mode="account" enabled={user.totp?.enabled === true} />
    </section>
  )
}
