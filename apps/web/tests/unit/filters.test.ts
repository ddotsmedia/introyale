import { describe, expect, it } from 'vitest'
import { buildFilterQuery, shouldNoindex } from '../../src/lib/filters'

describe('buildFilterQuery', () => {
  it('sets a single filter', () => {
    expect(buildFilterQuery({}, 'sector', 'residential')).toBe('?sector=residential')
  })

  it('keeps other filters and sorts keys for stable URLs', () => {
    expect(buildFilterQuery({ year: '2025' }, 'sector', 'commercial')).toBe(
      '?sector=commercial&year=2025',
    )
  })

  it('removes a filter when set to empty', () => {
    expect(buildFilterQuery({ sector: 'residential', year: '2025' }, 'sector', '')).toBe(
      '?year=2025',
    )
    expect(buildFilterQuery({ sector: 'residential' }, 'sector', '')).toBe('')
  })
})

describe('shouldNoindex', () => {
  it('is indexable with no filters', () => {
    expect(shouldNoindex({})).toBe(false)
  })

  it('is indexable for a single sector view', () => {
    expect(shouldNoindex({ sector: 'residential' })).toBe(false)
  })

  it('is noindex for other filtered views', () => {
    expect(shouldNoindex({ sector: 'residential', year: '2025' })).toBe(true)
    expect(shouldNoindex({ propertyType: 'villa' })).toBe(true)
  })
})
