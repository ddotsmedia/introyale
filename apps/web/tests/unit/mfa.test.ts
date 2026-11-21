import { describe, expect, it } from 'vitest'
import { generateSecret, generateSync, verifySync } from 'otplib'
import {
  decryptTotpSecret,
  encryptTotpSecret,
  hashRecovery,
  newRecoveryCodes,
  readCookie,
  signMfaToken,
  verifyMfaToken,
} from '../../src/lib/mfa'

const KEY = 'test-payload-secret'

describe('MFA cookie', () => {
  it('accepts a fresh token for the same user', () => {
    const t = signMfaToken('42', KEY, 1_000)
    expect(verifyMfaToken(t, '42', KEY, 2_000)).toBe(true)
  })

  it('rejects an expired token', () => {
    const t = signMfaToken('42', KEY, 1_000)
    expect(verifyMfaToken(t, '42', KEY, 1_000 + 13 * 60 * 60 * 1000)).toBe(false)
  })

  it('rejects another user, a tampered signature, and a wrong key', () => {
    const t = signMfaToken('42', KEY, 1_000)
    expect(verifyMfaToken(t, '43', KEY, 2_000)).toBe(false)
    expect(verifyMfaToken(t.slice(0, -2) + 'AA', '42', KEY, 2_000)).toBe(false)
    expect(verifyMfaToken(t, '42', 'other-key', 2_000)).toBe(false)
  })

  it('rejects missing tokens', () => {
    expect(verifyMfaToken(undefined, '42', KEY)).toBe(false)
    expect(verifyMfaToken('garbage', '42', KEY)).toBe(false)
  })

  it('reads a cookie from a raw header', () => {
    expect(readCookie('a=1; introyale_mfa=abc.def.ghi; b=2', 'introyale_mfa')).toBe('abc.def.ghi')
    expect(readCookie(null, 'introyale_mfa')).toBeUndefined()
  })
})

describe('TOTP', () => {
  it('verifies a code generated from the same secret', () => {
    const secret = generateSecret()
    const code = generateSync({ secret })
    expect(verifySync({ secret, token: code }).valid).toBe(true)
    expect(verifySync({ secret, token: '000000' }).valid).toBe(false)
  })

  it('round-trips a TOTP secret through encryption and never stores it in plain text', () => {
    const plain = generateSecret()
    const stored = encryptTotpSecret(plain, KEY)
    expect(stored).not.toContain(plain)
    expect(decryptTotpSecret(stored, KEY)).toBe(plain)
  })

  it('fails to decrypt with the wrong key', () => {
    const stored = encryptTotpSecret(generateSecret(), KEY)
    expect(() => decryptTotpSecret(stored, 'wrong')).toThrow()
  })
})

describe('recovery codes', () => {
  it('issues ten codes and stores only hashes', () => {
    const { plain, hashes } = newRecoveryCodes()
    expect(plain).toHaveLength(10)
    expect(hashes).toHaveLength(10)
    expect(hashes[0]).toBe(hashRecovery(plain[0] ?? ''))
    expect(hashes.some((h) => plain.includes(h))).toBe(false)
  })

  it('normalises case and whitespace when hashing', () => {
    expect(hashRecovery(' ABC123 ')).toBe(hashRecovery('abc123'))
  })
})
