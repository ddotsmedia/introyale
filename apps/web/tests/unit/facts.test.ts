import { describe, expect, it } from 'vitest'
import { pickVerifiedFact } from '../../src/lib/facts'

const rows = [
  { key: 'phone', status: 'verified' as const, value: '+971 52 77 54 585', displayText: null },
  { key: 'years_in_business', status: 'unverified' as const, value: '10+', displayText: null },
  { key: 'projects_completed', status: 'retired' as const, value: '1050+', displayText: null },
  { key: 'team_size', status: 'verified' as const, value: '50', displayText: '50+ specialists' },
]

describe('Facts Register rendering', () => {
  it('renders verified facts', () => {
    expect(pickVerifiedFact(rows, 'phone')).toBe('+971 52 77 54 585')
  })

  it('prefers displayText when set', () => {
    expect(pickVerifiedFact(rows, 'team_size')).toBe('50+ specialists')
  })

  it('returns null for unverified and retired facts', () => {
    expect(pickVerifiedFact(rows, 'years_in_business')).toBeNull()
    expect(pickVerifiedFact(rows, 'projects_completed')).toBeNull()
  })

  it('returns null for unknown keys', () => {
    expect(pickVerifiedFact(rows, 'awards_count')).toBeNull()
  })
})
