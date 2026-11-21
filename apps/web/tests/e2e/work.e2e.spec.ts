import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('projects explorer (M6)', () => {
  test('/work is accessible and indexable when unfiltered', async ({ page }) => {
    const res = await page.goto('/work')
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    // Staging and local previews are noindex by design (SPEC §2.3).
    if (process.env.ROBOTS_NOINDEX !== 'true') {
      expect(await page.locator('meta[name="robots"]').count()).toBe(0)
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('filtered views are noindex (SPEC §4)', async ({ page }) => {
    await page.goto('/work?year=2031')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('filter chips are plain links that change the URL', async ({ page }) => {
    await page.goto('/work')
    const chips = page.getByRole('navigation', { name: 'Filter projects' }).getByRole('link')
    if ((await chips.count()) > 1) {
      await chips.nth(1).click()
      await expect(page).toHaveURL(/\/work\?/)
    }
  })

  test('an unknown case study returns 404', async ({ page }) => {
    const res = await page.goto('/work/no-such-project')
    expect(res?.status()).toBe(404)
  })
})
