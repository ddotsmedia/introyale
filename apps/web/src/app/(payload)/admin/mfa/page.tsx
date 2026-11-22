import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { MfaPanel } from '@/components/admin/MfaPanel'

export const dynamic = 'force-dynamic'

/** Two-factor code screen for users who turned 2FA on (opt-in, D10). Requires a signed-in account. */
export default async function AdminMfa() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  const totp = (user as { totp?: { enabled?: boolean | null } }).totp
  return (
    <main style={{ padding: 32 }}>
      <h1>Two-factor sign-in</h1>
      <MfaPanel mode="sign-in" enabled={totp?.enabled === true} />
    </main>
  )
}
