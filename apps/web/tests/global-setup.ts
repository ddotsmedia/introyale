import type { FullConfig } from '@playwright/test'

// Warm the dev server once so the first test does not race the route compile (Turbopack).
export default async function globalSetup(config: FullConfig): Promise<void> {
  const base =
    config.projects[0]?.use.baseURL ?? process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3200'
  for (const path of [
    '/',
    '/work',
    '/services',
    '/studio',
    '/contact',
    '/start',
    '/dev/components',
  ]) {
    await fetch(new URL(path, base), { signal: AbortSignal.timeout(240_000) }).catch(
      () => undefined,
    )
  }
}
