import { describe, expect, it } from 'vitest'
import { readSecret } from '../../src/lib/secrets'

describe('readSecret', () => {
  it('reads NAME_FILE before NAME', () => {
    process.env.TEST_SECRET = 'env-value'
    expect(readSecret('TEST_SECRET')).toBe('env-value')
    delete process.env.TEST_SECRET
  })
  it('returns empty string when unset', () => {
    expect(readSecret('NOT_SET_ANYWHERE_123')).toBe('')
  })
})
