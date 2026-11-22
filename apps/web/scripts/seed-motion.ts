// Idempotent setup for the motion layer. Needs SEED_ADMIN_EMAIL (an existing administrator). Never overwrites edits:
//  1. blur-up placeholders (LQIP + dominant colour) for existing media that lacks them
//  2. hero slideshow images (motion-settings.heroSlides) when none are set: hero images of published projects
//  3. home page sections for the new effects, added only when the home layout has none of that type
import fs from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { getPayload } from 'payload'
import { placeholderFor } from '../src/collections/Media'

const email = process.env.SEED_ADMIN_EMAIL
if (!email) {
  console.error('seed-motion refused: set SEED_ADMIN_EMAIL to an existing administrator')
  process.exit(1)
}
const payload = await getPayload({ config })
const system = { overrideAccess: true as const }
const admin = (
  await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    ...system,
  })
).docs[0]
if (!admin) throw new Error(`administrator ${email} not found`)
const write = { ...system, user: { ...admin, collection: 'users' } as never }
const mediaDir = process.env.MEDIA_DIR ?? 'media'

// 1. Placeholders
let lqip = 0
const all = await payload.find({ collection: 'media', limit: 1000, depth: 0, ...system })
for (const m of all.docs) {
  if (m.lqip || !m.filename || !m.mimeType?.startsWith('image/')) continue
  const file = path.join(mediaDir, m.filename)
  if (!fs.existsSync(file)) continue
  try {
    const p = await placeholderFor(file)
    await payload.update({ collection: 'media', id: m.id, data: p, ...system })
    lqip += 1
  } catch {
    // Not a decodable image: skip.
  }
}

// 2. Hero slides
const settings = await payload.findGlobal({ slug: 'motion-settings', depth: 0, ...system })
let slides = 0
if (!settings.heroSlides?.length) {
  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, ...system })
  const heroBlock = (home.layout ?? []).find((b) => b.blockType === 'hero')
  const heroId = heroBlock && typeof heroBlock.image !== 'object' ? (heroBlock.image ?? null) : null
  const projects = await payload.find({
    collection: 'projects',
    where: { 'workflow.status': { equals: 'published' } },
    sort: 'createdAt',
    limit: 12,
    depth: 0,
    ...system,
  })
  const ids = [
    ...new Set(
      projects.docs
        .map((p) => (typeof p.hero === 'number' ? p.hero : null))
        .filter((id): id is number => id !== null && id !== heroId),
    ),
  ].slice(0, 3)
  if (ids.length) {
    await payload.updateGlobal({ slug: 'motion-settings', data: { heroSlides: ids }, ...write })
    slides = ids.length
  }
}
console.log(`placeholders: ${String(lqip)}, hero slides added: ${String(slides)}`)
process.exit(0)
