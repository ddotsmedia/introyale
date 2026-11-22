import { leadsCsv } from '@/lib/crm'
import { session } from '@/admin/session'

export const dynamic = 'force-dynamic'

/** CSV export of leads. Administrators only; the export is written to the audit log (SPEC §5.4). */
export async function GET(req: Request): Promise<Response> {
  try {
    const { payload, user } = await session('users.manage')
    const ids = new URL(req.url).searchParams
      .getAll('ids')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
    const csv = await leadsCsv(payload, user, ids)
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
