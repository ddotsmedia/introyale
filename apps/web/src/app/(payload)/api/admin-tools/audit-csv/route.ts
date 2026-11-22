import { session } from '@/admin/session'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const cell = (v: unknown): string => {
  let s =
    typeof v === 'string'
      ? v
      : typeof v === 'number' || typeof v === 'boolean'
        ? String(v)
        : v == null
          ? ''
          : JSON.stringify(v)
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

/** Audit-log CSV. Administrators only; the export itself is audited. */
export async function GET(): Promise<Response> {
  try {
    const { payload, user } = await session('users.manage')
    const res = await payload.find({
      collection: 'audit-log',
      overrideAccess: true,
      depth: 0,
      limit: 10000,
      pagination: false,
      sort: '-at',
    })
    const cols = [
      'at',
      'actor',
      'action',
      'collection',
      'docId',
      'fromStatus',
      'toStatus',
      'diffSummary',
      'ip',
    ]
    const rows = (res.docs as unknown as Record<string, unknown>[]).map((d) =>
      cols.map((c) => cell(d[c])).join(','),
    )
    await writeAudit(payload, {
      actor: user.id,
      action: 'export.csv',
      collection: 'audit-log',
      docId: 'all',
      summary: `${String(rows.length)} rows`,
    })
    return new Response([cols.join(','), ...rows].join('\n'), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="audit-log.csv"',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}
