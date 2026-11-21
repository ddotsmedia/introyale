import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('projects explorer (M6)', () => {
  test('/work is accessible and indexable when unfiltered', async ({ page }) => {
    const res = await page.goto('/work')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    const robots = await page.locator('meta[name="robots"]').count()
    expect(robots).toBe(0)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('filtered views are noindex (SPEC §4)', async ({ page }) => {
    await page.goto('/work?year=2031')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('an unknown case study returns 404', async ({ page }) => {
    const res = await page.goto('/work/no-such-project')
    expect(res?.status()).toBe(404)
  })
})
