import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import config from '@payload-config'
import { altchaUnused } from '../../src/lib/guard'

// M10.5 fixes, verified against the database. Enabled with INT_DB=1.
describe.runIf(process.env.INT_DB === '1')('security fixes (M10.5)', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('an ALTCHA solution can be used only once', async () => {
    const solution = `replay-${randomUUID()}`
    expect(await altchaUnused(solution)).toBe(true)
    expect(await altchaUnused(solution)).toBe(false)
  })

  it('a content editor cannot read another user record', async () => {
    const suffix = randomUUID().slice(0, 8)
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: `ed-${suffix}@test.invalid`,
        password: `pw-${randomUUID()}`,
        name: 'Ed',
        role: 'content_editor',
      },
      overrideAccess: true,
    })
    const other = await payload.create({
      collection: 'users',
      data: {
        email: `ot-${suffix}@test.invalid`,
        password: `pw-${randomUUID()}`,
        name: 'Ot',
        role: 'content_editor',
      },
      overrideAccess: true,
    })
    const res = await payload.find({
      collection: 'users',
      user: editor,
      overrideAccess: false,
      depth: 0,
    })
    expect(res.docs.map((d) => d.id)).toEqual([editor.id])
    expect(other.id).not.toBe(editor.id)
  })
})
