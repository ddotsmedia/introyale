import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import { mfaSatisfied } from '../lib/access'
import { can, type Action, type Role } from '../lib/roles'

export type Session = {
  payload: Payload
  user: { id: number; role: Role; name: string; email: string }
  /** The real request (cookie included). Pass it to local-API calls that enforce access so MFA is seen. */
  req: Parameters<typeof mfaSatisfied>[0]
}

/** Authenticates a server action or view from the request cookie and enforces role + MFA (SPEC §5.4). */
export async function session(action?: Action): Promise<Session> {
  const payload = await getPayload({ config })
  const h = await headers()
  const { user } = await payload.auth({ headers: h })
  const u = user as unknown as Session['user'] | null
  const req = { user, headers: h } as unknown as Parameters<typeof mfaSatisfied>[0]
  if (!u || !mfaSatisfied(req)) throw new Error('Not signed in')
  if (action && !can(u.role, action)) throw new Error('Not permitted')
  return { payload, user: u, req }
}
