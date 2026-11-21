import { expect, test } from '@playwright/test'

test.describe('journal (M7)', () => {
  // The section is hidden until at least three articles are published (SPEC §3.1, C15).
  test('/journal returns 404 while fewer than three articles are published', async ({ page }) => {
    const res = await page.goto('/journal')
    expect(res?.status()).toBe(404)
    const nav = await page.getByRole('navigation', { name: 'Primary' }).count()
    if (nav > 0) await expect(page.getByRole('link', { name: 'Journal' })).toHaveCount(0)
  })
})
