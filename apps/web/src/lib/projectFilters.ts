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
