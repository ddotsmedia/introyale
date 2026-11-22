import { session } from '@/admin/session'
import { writeAudit } from '@/lib/audit'
import { csvCell, EXPORT_TABLES, exportTable, type ExportTable } from '@/lib/analytics/export'
import { resolveRange } from '@/lib/analytics/range'
import { dubaiDay } from '@/lib/analytics/store'

export const dynamic = 'force-dynamic'

/** Analytics CSV: ?table=pages&range=30d (or range=custom&from=&to=). Roles with analytics.view; every export is audited. */
export async function GET(req: Request): Promise<Response> {
  try {
    const { payload, user } = await session('analytics.view')
    const q = new URL(req.url).searchParams
    const table = (q.get('table') ?? 'daily') as ExportTable
    if (!EXPORT_TABLES.includes(table)) return new Response('Unknown table', { status: 400 })
    const r = resolveRange(
      dubaiDay(),
      q.get('range') ?? undefined,
      q.get('from') ?? undefined,
      q.get('to') ?? undefined,
    )
    const { head, rows } = await exportTable(payload, table, r.cur)
    await writeAudit(payload, {
      actor: user.id,
      action: 'export.csv',
      collection: 'analytics',
      docId: table,
      summary: `${table} ${r.cur.from}..${r.cur.to}, ${String(rows.length)} rows`,
    })
    const body = [head.join(','), ...rows.map((row) => row.map(csvCell).join(','))].join('\n')
    return new Response(body, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="analytics-${table}-${r.cur.from}_${r.cur.to}.csv"`,
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}
