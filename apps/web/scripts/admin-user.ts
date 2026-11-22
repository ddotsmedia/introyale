// Temporary test administrators for the MFA regression check (CI stack and a one-off live check). Usage:
//   ADMIN_PW=<password> node admin-user.js create <email>   |   node admin-user.js delete <email>
// Only emails like tmp-*@introyale.* or e2e-*@introyale.* are accepted, so real accounts can never be created or deleted here.
// Production additionally needs TEMP_ADMIN=yes. The password comes from the environment and is never printed.
import config from '@payload-config'
import { getPayload } from 'payload'

const [cmd, email] = process.argv.slice(2)
if (
  !email ||
  !/^(tmp|e2e)-[a-z0-9-]+@introyale\.[a-z]+$/.test(email) ||
  !['create', 'delete'].includes(cmd ?? '')
) {
  console.error('usage: admin-user.js create|delete <tmp-*|e2e-*@introyale.local|online>')
  process.exit(1)
}
if (process.env.ENV === 'production' && process.env.TEMP_ADMIN !== 'yes') {
  console.error('admin-user refused in production without TEMP_ADMIN=yes')
  process.exit(1)
}
const payload = await getPayload({ config })
const sys = { overrideAccess: true as const, depth: 0 }
const found = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  ...sys,
})
// Preferences and document locks created by browsing the admin reference the user; remove them first.
async function removeUser(id: number | string): Promise<void> {
  await payload.delete({
    collection: 'payload-preferences',
    where: { 'user.value': { equals: id } },
    ...sys,
  })
  await payload.delete({
    collection: 'payload-locked-documents',
    where: { 'user.value': { equals: id } },
    ...sys,
  })
  for (const collection of ['notifications', 'saved-views', 'login-history'] as const) {
    await payload.delete({ collection, where: { user: { equals: id } }, ...sys })
  }
  await payload.delete({ collection: 'users', id, ...sys })
}
if (cmd === 'delete') {
  if (found.docs[0]) await removeUser(found.docs[0].id)
  console.log(`deleted ${email}: ${String(found.docs.length)}`)
} else {
  const password = process.env.ADMIN_PW
  if (!password || password.length < 16) throw new Error('ADMIN_PW (16+ chars) required')
  if (found.docs[0]) await removeUser(found.docs[0].id)
  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Temporary test admin', role: 'administrator' },
    ...sys,
  })
  console.log(`created ${email}`)
}
process.exit(0)
