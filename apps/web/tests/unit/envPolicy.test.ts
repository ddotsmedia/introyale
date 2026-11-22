import { describe, expect, it } from 'vitest'
import { appEnv } from '../../src/lib/envPolicy'

describe('environment policy', () => {
  it('reads ENV and treats an unknown or missing value as production', () => {
    expect(appEnv({ ENV: 'local' })).toBe('local')
    expect(appEnv({ ENV: 'staging' })).toBe('staging')
    expect(appEnv({})).toBe('production')
    expect(appEnv({ ENV: 'staging-typo' })).toBe('production')
  })
})
