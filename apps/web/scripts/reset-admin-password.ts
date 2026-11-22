// Local-only: reset login lockout and set a new random password (ENV=local only).
// Usage: node reset-admin-password.js <email> [email...]. The password is printed once, never written to a file.
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'

if (process.env.ENV !== 'local') {
  console.error('reset-admin-password refused: ENV must be "local"')
  process.exit(1)
}
const emails = process.argv.slice(2)
if (!emails.length) {
  console.error('usage: reset-admin-password.js <email> [email...]')
  process.exit(1)
}
const payload = await getPayload({ config })
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
for (const email of emails) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const u = found.docs[0]
  if (!u) {
    console.log(`${email}\tNOT FOUND`)
    continue
  }
  const pw = Array.from(randomBytes(20), (b) => ALPHA[b % ALPHA.length]).join('')
  await payload.update({
    collection: 'users',
    id: u.id,
    data: { password: pw, loginAttempts: 0, lockUntil: null },
    overrideAccess: true,
    depth: 0,
  })
  console.log(`${email}\t${pw}`)
}
process.exit(0)
