import { cms } from './cms'
import { LEGACY_REDIRECTS, type RedirectRule } from './legacyRedirects'

export type { RedirectRule }

let cache: { at: number; map: Map<string, RedirectRule> } | undefined
const TTL_MS = 60_000

/** Legacy rules, overlaid by active CMS redirects. Cached for a minute and dropped on every change. */
export async function getRedirectMap(now = Date.now()): Promise<Map<string, RedirectRule>> {
  if (cache && now - cache.at < TTL_MS) return cache.map
  const map = new Map<string, RedirectRule>(Object.entries(LEGACY_REDIRECTS))
  try {
    const payload = await cms()
    const res = await payload.find({
      collection: 'redirects',
      where: { active: { equals: true } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    for (const r of res.docs) {
      const type = Number(r.type) === 410 ? 410 : Number(r.type) === 302 ? 302 : 301
      map.set(r.from, { to: r.to ?? '/', type })
    }
  } catch {
    // Database unreachable: legacy rules still apply.
  }
  cache = { at: now, map }
  return map
}

/** Called by the redirects collection hook so edits apply on the next request. */
export function invalidateRedirects(): void {
  cache = undefined
}
