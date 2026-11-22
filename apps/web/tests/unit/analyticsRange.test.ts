import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  delta,
  eachDay,
  fmtDuration,
  resolveRange,
} from '../../src/lib/analytics/range'
import { rate } from '../../src/lib/analytics/query'

describe('resolveRange', () => {
  it('builds presets that end today, with an equally long previous period', () => {
    const r = resolveRange('2026-11-22', '7d')
    expect(r.cur).toEqual({ from: '2026-11-16', to: '2026-11-22' })
    expect(r.prev).toEqual({ from: '2026-11-09', to: '2026-11-15' })
    expect(resolveRange('2026-11-22', 'today').cur).toEqual({
      from: '2026-11-22',
      to: '2026-11-22',
    })
    expect(resolveRange('2026-11-22', '12m').days).toBe(365)
  })
  it('defaults to 30 days for unknown input', () => {
    expect(resolveRange('2026-11-22', 'nonsense').days).toBe(30)
    expect(resolveRange('2026-11-22', undefined).preset).toBe('30d')
  })
  it('accepts a custom range in either order, never beyond today, and ignores bad dates', () => {
    expect(resolveRange('2026-11-22', 'custom', '2026-11-10', '2026-11-05').cur).toEqual({
      from: '2026-11-05',
      to: '2026-11-10',
    })
    expect(resolveRange('2026-11-22', 'custom', '2026-11-20', '2027-01-01').cur.to).toBe(
      '2026-11-22',
    )
    expect(resolveRange('2026-11-22', 'custom', 'x', 'y').preset).toBe('30d')
  })
  it('crosses month and year boundaries', () => {
    expect(resolveRange('2027-01-03', '7d').cur.from).toBe('2026-12-28')
    expect(eachDay({ from: '2026-02-27', to: '2026-03-02' })).toHaveLength(4)
    expect(daysBetween({ from: '2026-11-01', to: '2026-11-30' })).toBe(30)
  })
})

describe('delta and formatting', () => {
  it('computes percent change and handles a zero baseline', () => {
    expect(delta(150, 100)).toBe(50)
    expect(delta(50, 100)).toBe(-50)
    expect(delta(5, 0)).toBe(100)
    expect(delta(0, 0)).toBeNull()
  })
  it('formats durations', () => {
    expect(fmtDuration(45)).toBe('45s')
    expect(fmtDuration(125)).toBe('2m 05s')
  })
})

describe('web vitals ratings (web.dev thresholds)', () => {
  it('classifies LCP, INP and CLS', () => {
    expect(rate('LCP', 2400)).toBe('good')
    expect(rate('LCP', 3200)).toBe('needs improvement')
    expect(rate('LCP', 4500)).toBe('poor')
    expect(rate('INP', 150)).toBe('good')
    expect(rate('CLS', 0.3)).toBe('poor')
  })
})
