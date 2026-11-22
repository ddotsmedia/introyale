import { sql } from '@payloadcms/db-postgres'
import { session } from '@/admin/session'
import { dubaiDay } from '@/lib/analytics/store'
import { addDays } from '@/lib/analytics/range'
import { seoIssues, seoScore, type SeoDoc } from '@/admin/seoIssues'

export const dynamic = 'force-dynamic'

const PATH: Record<string, (slug: string) => string> = {
  projects: (s) => `/work/${s}`,
  services: (s) => `/services/${s}`,
  pages: (s) => `/${s}`,
}

/** Sidebar insights for one document: views, time on page, attributed enquiries (30 days), SEO health. */
export async function GET(req: Request): Promise<Response> {
  try {
    const { payload, req: authReq } = await session('content.health')
    const q = new URL(req.url).searchParams
    const collection = q.get('collection') ?? ''
    const id = Number(q.get('id'))
    const pathOf = PATH[collection]
    if (!pathOf || !Number.isInteger(id)) return new Response('Bad request', { status: 400 })
    const doc = (await payload.findByID({
      collection: collection as 'projects' | 'services' | 'pages',
      id,
      req: authReq,
      overrideAccess: false,
      depth: 0,
    })) as unknown as SeoDoc
    const path = doc.slug ? pathOf(doc.slug) : null
    const to = dubaiDay()
    const from = addDays(to, -29)
    const run = async <T>(s: ReturnType<typeof sql>) =>
      ((await payload.db.drizzle.execute(s)) as unknown as { rows: T[] }).rows
    let views = 0
    let visitors = 0
    let avg = 0
    let enquiries = 0
    if (path) {
      const [v] = await run<{ views: number | null; visitors: number | null }>(
        sql`SELECT SUM("views")::int AS views, SUM("visitors")::int AS visitors FROM analytics_daily
            WHERE "kind" = 'page' AND "key" = ${path} AND "day" BETWEEN ${from}::date AND ${to}::date`,
      )
      views = v?.views ?? 0
      visitors = v?.visitors ?? 0
      const [t] = await run<{ n: number | null; s: number | null }>(
        sql`SELECT SUM("views")::int AS n, SUM("val") AS s FROM analytics_daily
            WHERE "kind" = 'time' AND "key" = ${path} AND "day" BETWEEN ${from}::date AND ${to}::date`,
      )
      avg = t?.n ? (t.s ?? 0) / t.n : 0
      const [e] = await run<{ n: number }>(
        sql`SELECT COUNT(*)::int AS n FROM enquiries
            WHERE (created_at AT TIME ZONE 'Asia/Dubai')::date BETWEEN ${from}::date AND ${to}::date
            AND attribution->'pages' ? ${path}`,
      )
      enquiries = e?.n ?? 0
    }
    const issues = seoIssues(doc)
    return Response.json(
      {
        path,
        views,
        visitors,
        avgSeconds: Math.round(avg),
        enquiries,
        seoScore: seoScore(issues),
        issues,
        updatedAt: doc.updatedAt ?? null,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}
