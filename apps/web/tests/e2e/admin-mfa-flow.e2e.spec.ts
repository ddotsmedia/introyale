import { expect, test } from '@playwright/test'
import { generateSync } from 'otplib'

// Regression (production launch): a fresh administrator with MFA enforced must land on MFA enrolment, not on
// "Unauthorized". Flow: sign in -> enrol -> confirm with a TOTP computed from the shown key -> verify -> dashboard.
// Needs a stack with MFA_ENFORCE=true and a fresh administrator (scripts/ci-stack.sh creates one from E2E_ADMIN_PW).
const email = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@introyale.local'
const password = process.env.E2E_ADMIN_PW

test('fresh administrator: sign in, enrol MFA, reach the dashboard', async ({ page }) => {
  test.skip(!password, 'E2E_ADMIN_PW not set (needs the MFA-enforced CI stack)')
  test.setTimeout(90_000)
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password ?? '')
  await page.locator('button[type="submit"]').click()

  // Not denied: sent to the MFA screen.
  await expect(page).toHaveURL(/\/admin\/mfa/, { timeout: 30_000 })
  await expect(page.getByText('does not have access')).toHaveCount(0)
  await page.getByRole('button', { name: 'Set up authenticator app' }).click()
  const key = (await page.locator('section[aria-labelledby="scan"] code').innerText()).trim()
  expect(key.length).toBeGreaterThan(10)

  await page.locator('#c1').fill(generateSync({ secret: key }))
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('heading', { name: 'Recovery codes' })).toBeVisible()

  await page.locator('#c2').fill(generateSync({ secret: key }))
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('does not have access')).toHaveCount(0)

  // The MFA session persists: another admin page opens without bouncing back to /admin/mfa.
  await page.goto('/admin/collections/pages')
  await expect(page).not.toHaveURL(/\/admin\/mfa/)
})
