import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { MfaPanel } from '@/components/admin/MfaPanel'
import { requiresMfa, type Role } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** Admin MFA setup and verification page (M10.5). Requires a signed-in account. */
export default async function AdminMfa() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  const role = (user as { role?: Role }).role
  const totp = (user as { totp?: { enabled?: boolean | null } }).totp
  return (
    <main style={{ padding: 32 }}>
      <h1>Two-factor sign-in</h1>
      <MfaPanel requiresMfa={requiresMfa(role)} enabled={totp?.enabled === true} />
    </main>
  )
}
