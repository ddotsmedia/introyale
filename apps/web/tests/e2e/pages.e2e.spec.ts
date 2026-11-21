import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
// Admin-only placeholders and demo text must never reach a public page.
const LEAKS = ['[CONFIRM]', '[DEMO]']

test.describe('core pages render only public CMS content', () => {
  for (const path of [
    '/',
    '/work',
    '/residential',
    '/services',
    '/studio',
    '/clients',
    '/contact',
  ]) {
    test(`${path} is accessible and leaks no admin-only text`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('h1')).toHaveCount(1)
      const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
      for (const leak of LEAKS) expect(text).not.toContain(leak)
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }

  test('unknown paths return the styled 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('an unknown sector slug is a 404, never invented content', async ({ page }) => {
    const res = await page.goto('/not-a-sector')
    expect(res?.status()).toBe(404)
  })

  test('the health endpoint reports the database', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toMatchObject({ status: 'ok', db: true })
  })
})
