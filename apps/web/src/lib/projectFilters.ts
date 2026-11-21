import type { Where } from 'payload'

// Projects explorer state lives in the URL (SPEC §4, M6). Pure so the rules are unit-tested.
export type ProjectFilterParams = {
  sector?: string
  propertyType?: string
  service?: string
  year?: string
  page?: string
}

export const PAGE_SIZE = 12

export function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Published projects matching every active filter. Unknown or malformed values are ignored. */
export function projectWhere(f: ProjectFilterParams): Where {
  const conds: Where[] = [{ 'workflow.status': { equals: 'published' } }]
  if (f.sector) conds.push({ 'sector.slug': { equals: f.sector } })
  if (f.propertyType) conds.push({ 'propertyType.slug': { equals: f.propertyType } })
  if (f.service) conds.push({ 'services.slug': { equals: f.service } })
  const year = f.year ? Number.parseInt(f.year, 10) : Number.NaN
  if (Number.isFinite(year)) conds.push({ year: { equals: year } })
  return { and: conds }
}

/** Only the sector-only view may be indexed; every other filter combination is noindex (SPEC §4). */
export function isNoindexFilter(f: ProjectFilterParams): boolean {
  const active = (['sector', 'propertyType', 'service', 'year'] as const).filter((k) => !!f[k])
  if (active.length === 0) return false
  return !(active.length === 1 && active[0] === 'sector')
}

/** Parses explorer query parameters. Slugs and digits only; anything else is dropped (M10.5). */
export function parseFilterParams(
  raw: Record<string, string | string[] | undefined>,
): ProjectFilterParams {
  const one = (k: string): string | undefined => {
    const v = raw[k]
    return typeof v === 'string' && v.length < 100 ? v : undefined
  }
  const slug = (k: string) => {
    const v = one(k)
    return v && /^[a-z0-9-]{1,80}$/.test(v) ? v : undefined
  }
  const digits = (k: string) => {
    const v = one(k)
    return v && /^\d{1,6}$/.test(v) ? v : undefined
  }
  return {
    sector: slug('sector'),
    propertyType: slug('propertyType'),
    service: slug('service'),
    year: digits('year'),
    page: digits('page'),
  }
}
