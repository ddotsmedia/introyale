import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
// Unverified claims from the live site (SPEC C9). They must never render until verified.
const UNVERIFIED_CLAIMS = ['1050', '1,050', '50+', '10+ years']

test.describe('core pages render only CMS content (M5)', () => {
  for (const path of ['/', '/services', '/studio', '/contact']) {
    test(`${path} is accessible and shows no unverified claims`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('main')).toBeVisible()
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
      for (const claim of UNVERIFIED_CLAIMS) expect(text).not.toContain(claim)
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }

  test('unknown paths return the styled 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('sector pages 404 until a sector is published (never invented content)', async ({
    page,
  }) => {
    const res = await page.goto('/residential')
    expect(res?.status()).toBe(404)
  })

  test('the health endpoint reports the database', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toMatchObject({ status: 'ok', db: true })
  })
})
