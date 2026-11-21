/** Routes affected by a change to a document (SPEC M5: on-demand revalidation). */
export function pathsFor(collection: string, doc: Record<string, unknown>): string[] {
  const slug = typeof doc.slug === 'string' ? doc.slug : ''
  switch (collection) {
    case 'pages':
      return slug === 'home' ? ['/'] : slug ? [`/${slug}`] : []
    case 'projects':
      return ['/', '/work', ...(slug ? [`/work/${slug}`] : [])]
    case 'services':
      return ['/services', ...(slug ? [`/services/${slug}`] : [])]
    case 'sectors':
      return ['/', ...(slug ? [`/${slug}`] : [])]
    case 'team-members':
      return ['/studio', '/studio/team', ...(slug ? [`/studio/team/${slug}`] : [])]
    case 'testimonials':
    case 'facts':
    case 'contact-info':
      return ['/', '/contact']
    default:
      return []
  }
}

/**
 * Best-effort revalidation. Loaded lazily so the CLI, migrate and worker bundles never resolve
 * next/cache. A failure must not fail the save: the next request re-renders anyway.
 */
export async function revalidateFor(
  collection: string,
  doc: Record<string, unknown>,
): Promise<void> {
  const paths = pathsFor(collection, doc)
  if (paths.length === 0) return
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of paths) revalidatePath(p)
  } catch {
    // Outside a Next request context (CLI, worker): skip.
  }
}
