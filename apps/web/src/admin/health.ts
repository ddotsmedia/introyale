import type { Payload } from 'payload'
import { WORKFLOW_COLLECTIONS } from './data'

export type Issue = { kind: string; message: string; href: string }
export type DocHealth = {
  collection: string
  id: string
  label: string
  score: number
  issues: Issue[]
}
type Doc = Record<string, unknown>

const STATIC_ROUTES = new Set([
  '/',
  '/work',
  '/services',
  '/studio',
  '/process',
  '/clients',
  '/contact',
  '/start',
  '/journal',
  '/thank-you',
])
const LINK_KEYS = new Set(['href', 'link', 'ctaLink', 'buttonHref', 'url', 'seeAllHref'])

/** Pure checks on one document. `routes` is the set of known internal paths. */
export function checkDoc(
  collection: string,
  doc: Doc,
  ctx: { routes: Set<string>; media: Map<number, { width?: number; alt?: string }> },
): Issue[] {
  const id = String(doc.id)
  const base = `/admin/collections/${collection}/${id}`
  const issues: Issue[] = []
  const seo: { metaTitle?: string; metaDescription?: string } =
    (doc.seo as object | undefined) ?? {}
  if (collection !== 'testimonials' && collection !== 'team-members' && 'seo' in doc) {
    if (!seo.metaTitle)
      issues.push({
        kind: 'seo',
        message: 'Missing SEO title',
        href: `${base}#field-seo__metaTitle`,
      })
    if (!seo.metaDescription)
      issues.push({
        kind: 'seo',
        message: 'Missing SEO description',
        href: `${base}#field-seo__metaDescription`,
      })
  }
  const text = JSON.stringify(doc)
  if (text.includes('[CONFIRM'))
    issues.push({ kind: 'confirm', message: 'Contains a [CONFIRM] placeholder', href: base })
  for (const key of ['hero', 'heroImage']) {
    const mid = doc[key]
    const m = typeof mid === 'number' ? ctx.media.get(mid) : undefined
    if (m?.width && m.width < 1920)
      issues.push({
        kind: 'lowres',
        message: `Hero image is ${String(m.width)} px wide (below 1920)`,
        href: `${base}#field-${key}`,
      })
  }
  if (collection === 'projects') {
    const wf = doc.workflow as { status?: string; approvedBy?: unknown } | undefined
    if (wf?.status && wf.status !== 'draft' && !wf.approvedBy)
      issues.push({
        kind: 'approval',
        message: 'Project has no recorded approval',
        href: `${base}#field-workflow__status`,
      })
  }
  const layout = doc.layout
  if (Array.isArray(layout)) {
    layout.forEach((b: Doc, i) => {
      if (b.hidden) return
      const filled = Object.entries(b).some(
        ([k, v]) =>
          !['id', 'blockType', 'blockName', 'hidden'].includes(k) &&
          v != null &&
          v !== '' &&
          !(Array.isArray(v) && v.length === 0),
      )
      if (!filled)
        issues.push({
          kind: 'empty',
          message: `Section ${String(i + 1)} (${String(b.blockType)}) is empty`,
          href: `${base}#field-layout__${String(i)}`,
        })
    })
  }
  const visit = (v: unknown, key = ''): void => {
    if (typeof v === 'string') {
      if (LINK_KEYS.has(key) && v.startsWith('/') && !v.startsWith('//')) {
        const p = v.split(/[?#]/)[0] ?? ''
        if (p && !ctx.routes.has(p) && !ctx.routes.has(p.replace(/\/$/, '')))
          issues.push({ kind: 'link', message: `Broken internal link ${v}`, href: base })
      }
    } else if (Array.isArray(v)) v.forEach((x) => visit(x, key))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, k)
  }
  visit(doc)
  return issues
}

export const scoreFor = (issues: Issue[]): number => Math.max(0, 100 - issues.length * 20)

export async function contentHealth(
  payload: Payload,
): Promise<{ docs: DocHealth[]; overall: number; media: Issue[]; facts: Issue[] }> {
  const slugs = async (c: 'pages' | 'sectors' | 'services' | 'projects') =>
    (
      await payload.find({
        collection: c,
        limit: 1000,
        pagination: false,
        depth: 0,
        overrideAccess: true,
        select: { slug: true },
      })
    ).docs.map((d) => String((d as { slug?: string }).slug))
  const [pages, sectors, services, projects] = await Promise.all([
    slugs('pages'),
    slugs('sectors'),
    slugs('services'),
    slugs('projects'),
  ])
  const routes = new Set<string>(STATIC_ROUTES)
  pages.forEach((s) => routes.add(`/${s}`))
  sectors.forEach((s) => routes.add(`/${s}`))
  services.forEach((s) => routes.add(`/services/${s}`))
  projects.forEach((s) => routes.add(`/work/${s}`))
  const redirects = await payload.find({
    collection: 'redirects',
    limit: 1000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  redirects.docs.forEach((r) => routes.add(String((r as { from?: string }).from)))

  const mediaRes = await payload.find({
    collection: 'media',
    limit: 5000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const media = new Map<number, { width?: number; alt?: string }>()
  const mediaIssues: Issue[] = []
  for (const m of mediaRes.docs as unknown as {
    id: number
    width?: number
    alt?: string
    filename?: string
  }[]) {
    media.set(m.id, { width: m.width, alt: m.alt })
    if (!m.alt?.trim())
      mediaIssues.push({
        kind: 'alt',
        message: `Missing alt text: ${m.filename ?? String(m.id)}`,
        href: `/admin/collections/media/${String(m.id)}`,
      })
  }

  const docs: DocHealth[] = []
  for (const c of [...WORKFLOW_COLLECTIONS]) {
    const res = await payload.find({
      collection: c,
      limit: 1000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    for (const d of res.docs as unknown as Doc[]) {
      const issues = checkDoc(c, d, { routes, media })
      docs.push({
        collection: c,
        id: String(d.id),
        label: String(d.title ?? d.name ?? d.slug ?? d.attributionName ?? d.id),
        score: scoreFor(issues),
        issues,
      })
    }
  }
  for (const g of ['home-page', 'site-settings'] as const) {
    const d = (await payload.findGlobal({
      slug: g,
      depth: 0,
      overrideAccess: true,
    })) as unknown as Doc
    const issues = checkDoc(g, { ...d, id: g }, { routes, media }).map((i) => ({
      ...i,
      href: `/admin/globals/${g}`,
    }))
    docs.push({ collection: `global:${g}`, id: g, label: g, score: scoreFor(issues), issues })
  }
  const facts = (
    await payload.find({
      collection: 'facts',
      where: { status: { not_equals: 'verified' } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })
  ).docs.map((f) => ({
    kind: 'fact',
    message: `Unverified fact: ${String((f as { key?: string }).key)}`,
    href: `/admin/collections/facts/${String(f.id)}`,
  }))
  const all = docs.map((d) => d.score)
  const overall = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 100
  return { docs, overall, media: mediaIssues, facts }
}
