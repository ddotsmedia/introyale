import { describe, expect, it } from 'vitest'
import { appEnv, assertEnvPolicy, mfaEnforced } from '../../src/lib/envPolicy'

// CI guard (M-LOCAL): an MFA bypass must never be reachable outside local.
describe('environment policy', () => {
  it('MFA_ENFORCE=false is honoured only for ENV=local', () => {
    expect(mfaEnforced({ ENV: 'local', MFA_ENFORCE: 'false' })).toBe(false)
    expect(mfaEnforced({ ENV: 'local' })).toBe(true)
  })

  it.each(['staging', 'production', 'dev'])('ENV=%s cannot disable MFA', (env) => {
    expect(mfaEnforced({ ENV: env, MFA_ENFORCE: 'false' })).toBe(true)
    expect(() => {
      assertEnvPolicy({ ENV: env, MFA_ENFORCE: 'false' })
    }).toThrow(/not allowed/)
  })

  it('an unknown or missing ENV is treated as production', () => {
    expect(appEnv({})).toBe('production')
    expect(appEnv({ ENV: 'staging-typo' })).toBe('production')
    expect(mfaEnforced({ MFA_ENFORCE: 'false' })).toBe(true)
    expect(() => {
      assertEnvPolicy({ MFA_ENFORCE: 'false' })
    }).toThrow()
  })

  it('boot succeeds when no bypass is requested', () => {
    expect(() => {
      assertEnvPolicy({ ENV: 'production' })
    }).not.toThrow()
    expect(() => {
      assertEnvPolicy({ ENV: 'local', MFA_ENFORCE: 'false' })
    }).not.toThrow()
  })
})
