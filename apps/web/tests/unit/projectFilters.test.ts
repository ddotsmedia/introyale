import { describe, expect, it } from 'vitest'
import { isNoindexFilter, parsePage, projectWhere } from '../../src/lib/projectFilters'

const conds = (w: ReturnType<typeof projectWhere>) => (w as { and: unknown[] }).and

describe('projectWhere', () => {
  it('always requires published status', () => {
    expect(conds(projectWhere({}))).toEqual([{ 'workflow.status': { equals: 'published' } }])
  })

  it('adds one condition per active filter', () => {
    const c = conds(
      projectWhere({
        sector: 'residential',
        propertyType: 'villa',
        service: 'interiors',
        year: '2025',
      }),
    )
    expect(c).toHaveLength(5)
    expect(c).toContainEqual({ 'sector.slug': { equals: 'residential' } })
    expect(c).toContainEqual({ year: { equals: 2025 } })
  })

  it('ignores a malformed year instead of filtering on NaN', () => {
    expect(conds(projectWhere({ year: 'abc' }))).toHaveLength(1)
  })
})

describe('parsePage', () => {
  it('defaults to page 1 and rejects nonsense', () => {
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage('3')).toBe(3)
    expect(parsePage('-2')).toBe(1)
    expect(parsePage('x')).toBe(1)
  })
})

describe('isNoindexFilter', () => {
  it('indexes the unfiltered list and the single-sector view', () => {
    expect(isNoindexFilter({})).toBe(false)
    expect(isNoindexFilter({ sector: 'commercial' })).toBe(false)
  })

  it('noindexes any other filtered view', () => {
    expect(isNoindexFilter({ year: '2025' })).toBe(true)
    expect(isNoindexFilter({ sector: 'commercial', service: 'interiors' })).toBe(true)
  })
})
