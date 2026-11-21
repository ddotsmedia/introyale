// Pure URL-state helpers for the projects explorer (SPEC §4, M6). Filter state lives in the query string.

export type FilterState = Record<string, string | undefined>

/** Returns the query string for `next`, with empty values removed and keys sorted for stable URLs. */
export function buildFilterQuery(current: FilterState, name: string, value: string): string {
  const merged: FilterState = { ...current, [name]: value || undefined }
  const params = new URLSearchParams()
  for (const key of Object.keys(merged).sort()) {
    const v = merged[key]
    if (v) params.set(key, v)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Filtered views other than a single sector are noindex (SPEC §4). */
export function shouldNoindex(filters: FilterState): boolean {
  const active = Object.entries(filters).filter(([, v]) => !!v)
  if (active.length === 0) return false
  return !(active.length === 1 && active[0]?.[0] === 'sector')
}
