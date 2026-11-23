import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// The developer credit comes from the footer global (migration defaults) and must be accessible.
test('the footer shows the developer credit as a safe external link', async ({ page }) => {
  await page.goto('/')
  const link = page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Ddotsmedia Technologies LLC' })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', 'https://ddotsmedia.com')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noopener/)
  await expect(page.getByRole('contentinfo')).toContainText('Built and managed by')
  const results = await new AxeBuilder({ page })
    .include('footer')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])
})
