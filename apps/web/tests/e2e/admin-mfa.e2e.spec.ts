import { expect, test } from '@playwright/test'

// Admin MFA page (M10.5): anonymous visitors are sent to sign-in, never shown the setup.
test('/admin/mfa requires a signed-in account', async ({ page }) => {
  await page.goto('/admin/mfa')
  await expect(page).toHaveURL(/\/admin\/login/)
})
