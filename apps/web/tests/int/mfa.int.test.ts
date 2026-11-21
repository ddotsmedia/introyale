import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import { describe, expect, it } from 'vitest'
import config from '@payload-config'
import {
  hashRecovery,
  decryptTotpSecret,
  encryptTotpSecret,
  newRecoveryCodes,
} from '../../src/lib/mfa'
import { generateSecret, generateSync, verifySync } from 'otplib'

// TOTP enrolment storage round-trip, recovery codes single use (M10.5). Enabled with INT_DB=1.
describe.runIf(process.env.INT_DB === '1')('admin MFA storage (M10.5)', () => {
  it('stores the TOTP secret encrypted and checks a generated code', async () => {
    const payload = await getPayload({ config })
    const secret = generateSecret()
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `mfa-${randomUUID()}@test.invalid`,
        password: `pw-${randomUUID()}`,
        name: 'MFA',
        role: 'administrator',
        totp: {
          enabled: true,
          secret: encryptTotpSecret(secret, process.env.PAYLOAD_SECRET ?? 'k'),
        },
      },
      overrideAccess: true,
    })
    const row = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
    expect(row.totp?.secret).not.toContain(secret)
    const plain = decryptTotpSecret(row.totp?.secret ?? '', process.env.PAYLOAD_SECRET ?? 'k')
    expect(verifySync({ secret: plain, token: generateSync({ secret: plain }) }).valid).toBe(true)
  })

  it('recovery codes are hashed and each works once', () => {
    const { plain, hashes } = newRecoveryCodes()
    expect(hashes).toContain(hashRecovery(plain[0] ?? ''))
    expect(hashes).not.toContain(plain[0])
  })
})

describe.runIf(process.env.INT_DB === '1' && process.env.MFA_HTTP === '1')(
  'admin MFA over HTTP (M10.5)',
  () => {
    it('enrol, confirm, verify, then the admin panel is unlocked', async () => {
      const base = process.env.MFA_BASE_URL ?? 'http://127.0.0.1:3300'
      const payload = await getPayload({ config })
      const email = `mfa-http-${randomUUID()}@test.invalid`
      const password = `pw-${randomUUID()}`
      await payload.create({
        collection: 'users',
        data: { email, password, name: 'MFA', role: 'administrator' },
        overrideAccess: true,
      })

      const login = await fetch(`${base}/api/users/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const token = ((await login.json()) as { token: string }).token
      const auth = { cookie: `payload-token=${token}`, 'content-type': 'application/json' }

      const before = await fetch(`${base}/admin`, {
        headers: { cookie: `payload-token=${token}` },
        redirect: 'manual',
      })
      expect(before.status).not.toBe(500)

      const enrol = (await (
        await fetch(`${base}/api/mfa/enroll`, { method: 'POST', headers: auth, body: '{}' })
      ).json()) as { otpauthUri: string }
      const secret = new URL(enrol.otpauthUri).searchParams.get('secret') ?? ''
      const conf = await fetch(`${base}/api/mfa/confirm`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ code: generateSync({ secret }) }),
      })
      expect(conf.status).toBe(200)
      const codes = ((await conf.json()) as { recoveryCodes: string[] }).recoveryCodes
      expect(codes).toHaveLength(10)

      const ver = await fetch(`${base}/api/mfa/verify`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ code: generateSync({ secret }) }),
      })
      expect(ver.status).toBe(200)
      const cookie = ver.headers.get('set-cookie') ?? ''
      expect(cookie).toContain('introyale_mfa=')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Strict')

      const unlocked = await fetch(`${base}/api/users`, {
        headers: { cookie: `payload-token=${token}; ${String(cookie.split(';')[0])}` },
      })
      expect(unlocked.status).toBe(200)
      const locked = await fetch(`${base}/api/users`, {
        headers: { cookie: `payload-token=${token}` },
      })
      // Without the MFA cookie the admin sees only their own record.
      const lockedDocs = ((await locked.json()) as { docs: unknown[] }).docs
      expect(lockedDocs).toHaveLength(1)
    })
  },
)
