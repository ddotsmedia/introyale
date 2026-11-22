import { cms } from './cms'

const SKIP = /^\/(_next|api|admin)(\/|$)|\.[a-z0-9]{2,5}$/i

/** Record a missing path (count and last seen only; no visitor data). Never throws. */
export async function logNotFound(path: string | null | undefined): Promise<void> {
  if (!path || path.length > 300 || SKIP.test(path)) return
  try {
    const payload = await cms()
    const found = await payload.find({
      collection: 'not-found-log',
      where: { path: { equals: path } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const row = found.docs[0] as { id: number; count?: number | null } | undefined
    if (row) {
      await payload.update({
        collection: 'not-found-log',
        id: row.id,
        overrideAccess: true,
        data: { count: (row.count ?? 0) + 1, lastSeenAt: new Date().toISOString() },
      })
    } else {
      await payload.create({
        collection: 'not-found-log',
        overrideAccess: true,
        data: { path, count: 1, lastSeenAt: new Date().toISOString() },
      })
    }
  } catch {
    /* logging must never break the 404 page */
  }
}
