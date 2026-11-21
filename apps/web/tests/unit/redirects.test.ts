import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LEGACY_REDIRECTS } from '../../src/lib/legacyRedirects'

// Every row of the M0 map (docs/redirects.csv) must be covered by the legacy rules (SPEC §4, M9).
const csv = readFileSync(
  path.resolve(import.meta.dirname, '../../../../docs/redirects.csv'),
  'utf8',
)
const rows = csv
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => line.split(','))

describe('legacy redirect coverage', () => {
  it('the M0 crawl file lists the SPEC §4 legacy URLs', () => {
    expect(rows.length).toBeGreaterThanOrEqual(11)
  })

  for (const [from, to, type] of rows) {
    it(`${String(from)} → ${String(to)} (${String(type)})`, () => {
      const rule = LEGACY_REDIRECTS[from ?? '']
      expect(rule).toBeDefined()
      expect(rule?.to).toBe(to)
      expect(rule?.type).toBe(Number(type))
    })
  }
})
