import { leadsCsv } from '@/lib/crm'
import { session } from '@/admin/session'

export const dynamic = 'force-dynamic'

/** CSV export of leads. Administrators only; the export is written to the audit log (SPEC §5.4). */
export async function GET(): Promise<Response> {
  try {
    const { payload, user } = await session('users.manage')
    const csv = await leadsCsv(payload, user)
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="leads.csv"',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}
