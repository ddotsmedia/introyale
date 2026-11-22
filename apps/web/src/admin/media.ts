import type { Field, Payload } from 'payload'

type Doc = Record<string, unknown>
export type MediaRef = { collection: string; id: string; label: string; path: string }

/** Walks a field tree and calls `visit` for every media upload/relationship value with its field path. */
function walk(
  fields: Field[],
  data: unknown,
  path: string,
  visit: (id: number, path: string) => void,
): void {
  if (!data || typeof data !== 'object') return
  const d = data as Doc
  for (const f of fields) {
    if (f.type === 'row' || f.type === 'collapsible') {
      walk(f.fields, d, path, visit)
      continue
    }
    if (f.type === 'tabs') {
      for (const t of f.tabs) walk(t.fields, 'name' in t && t.name ? d[t.name] : d, path, visit)
      continue
    }
    if (!('name' in f) || !f.name) continue
    const v = d[f.name]
    const here = path ? `${path}.${f.name}` : f.name
    if ((f.type === 'upload' || f.type === 'relationship') && f.relationTo === 'media') {
      for (const x of Array.isArray(v) ? v : [v]) {
        const id = x && typeof x === 'object' ? (x as { id?: number }).id : x
        if (typeof id === 'number') visit(id, here)
      }
    } else if (f.type === 'group') {
      walk(f.fields, v, here, visit)
    } else if (f.type === 'array' && Array.isArray(v)) {
      v.forEach((row, i) => walk(f.fields, row, `${here}.${String(i)}`, visit))
    } else if (f.type === 'blocks' && Array.isArray(v)) {
      v.forEach((row: Doc, i) => {
        const b = f.blocks.find((x) => x.slug === row.blockType)
        if (b) walk(b.fields, row, `${here}.${String(i)}`, visit)
      })
    }
  }
}

/** Index of every place that references a media file. Small sites only: reads all documents at depth 0. */
export async function mediaIndex(payload: Payload): Promise<Map<number, MediaRef[]>> {
  const idx = new Map<number, MediaRef[]>()
  const add = (mid: number, r: MediaRef) => idx.set(mid, [...(idx.get(mid) ?? []), r])
  for (const c of payload.config.collections) {
    if (
      [
        'media',
        'audit-log',
        'rate-limits',
        'login-history',
        'notifications',
        'enquiries',
        'not-found-log',
      ].includes(c.slug)
    )
      continue
    const res = await payload.find({
      collection: c.slug as 'pages',
      limit: 2000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    for (const doc of res.docs as unknown as Doc[]) {
      const label = String(doc.title ?? doc.name ?? doc.slug ?? doc.id)
      walk(c.fields, doc, '', (mid, path) =>
        add(mid, { collection: c.slug, id: String(doc.id), label, path }),
      )
    }
  }
  for (const g of payload.config.globals) {
    const doc = (await payload.findGlobal({
      slug: g.slug as 'site-settings',
      depth: 0,
      overrideAccess: true,
    })) as unknown as Doc
    walk(g.fields, doc, '', (mid, path) =>
      add(mid, { collection: `global:${g.slug}`, id: g.slug, label: g.slug, path }),
    )
  }
  return idx
}

export async function usedIn(payload: Payload, mediaId: number): Promise<MediaRef[]> {
  return (await mediaIndex(payload)).get(mediaId) ?? []
}

export { walk as walkMediaFields }
