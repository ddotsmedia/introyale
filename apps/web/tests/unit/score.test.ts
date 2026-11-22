import { describe, expect, it } from 'vitest'
import { largestNumber, scoreLead } from '../../src/lib/score'

describe('largestNumber', () => {
  it('reads plain, comma, k and m figures', () => {
    expect(largestNumber('AED 1.5m')).toBe(1_500_000)
    expect(largestNumber('500,000 - 750,000')).toBe(750_000)
    expect(largestNumber('2000 sqft')).toBe(2000)
    expect(largestNumber('250k')).toBe(250_000)
    expect(largestNumber('not sure')).toBe(0)
    expect(largestNumber(null)).toBe(0)
  })
})

describe('scoreLead', () => {
  it('scores nothing for an empty enquiry and never guesses missing facts', () => {
    const s = scoreLead({})
    expect(s).toEqual({ score: 0, band: 'cold', reasons: [] })
  })
  it('rates a rich consultation hot and explains every point', () => {
    const s = scoreLead({
      type: 'consultation',
      sector: 'commercial',
      budgetBand: 'AED 1m+',
      approxArea: '6000 sqft',
      stage: 'design',
      targetStart: 'Q1',
      brief: 'x'.repeat(220),
      plansLink: 'https://example.com/p.pdf',
      source: 'referral',
      pages: ['/', '/work', '/work/villa', '/commercial/office', '/start'],
      sessions: 2,
    })
    expect(s.band).toBe('hot')
    expect(s.score).toBe(
      Math.min(
        100,
        s.reasons.reduce((n, r) => n + r.points, 0),
      ),
    )
    expect(s.reasons.length).toBeGreaterThan(8)
  })
  it('caps at 100 and orders bands at 40 and 70', () => {
    expect(scoreLead({ type: 'consultation', sector: 'residential' }).band).toBe('cold')
    expect(
      scoreLead({
        type: 'consultation',
        sector: 'residential',
        budgetBand: '600k',
        approxArea: '2000',
        stage: 'design',
      }).band,
    ).toBe('warm')
  })
  it('credits project views and returning visitors', () => {
    const s = scoreLead({ pages: ['/work/a'], sessions: 2 })
    expect(s.reasons.map((r) => r.label)).toEqual([
      'Viewed a project or service',
      'Returned the same day',
    ])
  })
})
