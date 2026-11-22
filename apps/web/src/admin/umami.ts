import { readSecret } from '../lib/secrets'

export type UmamiData = { visitors: number; pageviews: number; pages: { x: string; y: number }[] }

/** Real Umami numbers (30 days) when UMAMI_URL, UMAMI_WEBSITE_ID and a token are set and reachable; otherwise null so the card is hidden. */
export async function umamiData(): Promise<UmamiData | null> {
  const base = process.env.UMAMI_URL
  const id = process.env.UMAMI_WEBSITE_ID
  const token = readSecret('UMAMI_API_TOKEN')
  if (!base || !id || !token) return null
  const end = Date.now()
  const q = `startAt=${String(end - 30 * 86_400_000)}&endAt=${String(end)}`
  const headers = { authorization: `Bearer ${token}` }
  try {
    const [s, m] = await Promise.all([
      fetch(`${base}/api/websites/${id}/stats?${q}`, {
        headers,
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${base}/api/websites/${id}/metrics?type=path&limit=5&${q}`, {
        headers,
        signal: AbortSignal.timeout(3000),
      }),
    ])
    if (!s.ok || !m.ok) return null
    const stats = (await s.json()) as {
      visitors?: { value?: number } | number
      pageviews?: { value?: number } | number
    }
    const num = (v: { value?: number } | number | undefined) =>
      typeof v === 'number' ? v : (v?.value ?? 0)
    return {
      visitors: num(stats.visitors),
      pageviews: num(stats.pageviews),
      pages: (await m.json()) as UmamiData['pages'],
    }
  } catch {
    return null
  }
}
