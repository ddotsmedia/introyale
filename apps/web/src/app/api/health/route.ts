import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

// Public and secret-free: reports DB reachability and version only (SPEC §2.1).
export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    await payload.db.drizzle.execute('SELECT 1')
    return Response.json({ status: 'ok', version: process.env.APP_VERSION ?? 'dev', db: true })
  } catch {
    return Response.json(
      { status: 'degraded', version: process.env.APP_VERSION ?? 'dev', db: false },
      { status: 503 },
    )
  }
}
