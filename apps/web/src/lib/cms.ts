import config from '@payload-config'
import { getPayload, type DataFromCollectionSlug, type Payload } from 'payload'
import { pickVerifiedFact, type FactRow } from './facts'

let cached: Promise<Payload> | undefined
/** Shared Payload client for server components and route handlers. */
export function cms(): Promise<Payload> {
  cached ??= getPayload({ config })
  return cached
}

/** Public reads: `published` only. Access rules in the collections enforce it too. */
const published = { 'workflow.status': { equals: 'published' } } as const

export async function getPageBySlug<
  T extends 'pages' | 'sectors' | 'services' | 'team-members' | 'projects',
>(collection: T, slug: string): Promise<DataFromCollectionSlug<T> | null> {
  const payload = await cms()
  const res = await payload.find({
    collection,
    where: { and: [{ slug: { equals: slug } }, published] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs[0] ?? null
}

export async function listPublished<
  T extends 'services' | 'projects' | 'team-members' | 'sectors' | 'testimonials',
>(collection: T, limit = 50): Promise<DataFromCollectionSlug<T>[]> {
  const payload = await cms()
  const isTeam = collection === 'team-members'
  const res = await payload.find({
    collection,
    where: isTeam ? { and: [published, { 'consent.given': { equals: true } }] } : published,
    sort: isTeam ? 'order' : '-updatedAt',
    limit,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs
}

/** Clients appear only with recorded logo permission (D13). */
export async function listClients(limit = 40) {
  const payload = await cms()
  const res = await payload.find({
    collection: 'clients',
    where: { logoPermission: { equals: true } },
    limit,
    depth: 0,
    overrideAccess: false,
  })
  return res.docs
}

/** Verified facts only. Unverified facts never reach a page (D13). */
export async function verifiedFact(key: string): Promise<string | null> {
  const payload = await cms()
  const res = await payload.find({
    collection: 'facts',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const rows: FactRow[] = res.docs.map((d) => ({
    key: d.key,
    status: d.status,
    value: d.value,
    displayText: d.displayText,
  }))
  return pickVerifiedFact(rows, key)
}

export async function globalDoc<
  T extends 'navigation' | 'contact-info' | 'footer' | 'site-settings',
>(slug: T) {
  const payload = await cms()
  return payload.findGlobal({ slug, depth: 1, overrideAccess: false })
}
