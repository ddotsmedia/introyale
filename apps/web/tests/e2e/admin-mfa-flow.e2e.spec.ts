import { expect, test, type Page } from '@playwright/test'
import { generateSync } from 'otplib'

// Two-factor authentication is OPTIONAL for every role (D10). One fresh administrator walks through:
//  1. sign in -> dashboard directly (no MFA screen)
//  2. opt in on the account page (QR/key, confirm a code, recovery codes)
//  3. sign in again -> the code is now required -> dashboard
//  4. opt out (current password + code) -> sign in -> dashboard directly again
// Needs a stack with a fresh administrator: scripts/ci-stack.sh creates one from E2E_ADMIN_PW.
const email = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@introyale.local'
const password = process.env.E2E_ADMIN_PW ?? ''

async function signIn(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('button[type="submit"]').click()
}
/** Fills a fresh code, submits, and retries once if the code fell on a 30-second boundary. */
async function submitCode(
  page: Page,
  scope: Page | ReturnType<Page['getByTestId']>,
  input: string,
  button: string,
  api: string,
  secret: string,
  extra?: () => Promise<void>,
): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    await extra?.()
    await scope.locator(input).fill(generateSync({ secret }))
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(api)),
      scope.getByRole('button', { name: button }).click(),
    ])
    if (res.ok()) return
    await page.waitForTimeout(1500)
  }
}
const dashboard = (page: Page) => page.getByRole('heading', { name: 'Dashboard' })

test('2FA is optional, opt-in works, and once on the code is required', async ({
  page,
}, testInfo) => {
  test.skip(!password, 'E2E_ADMIN_PW not set (needs the CI stack)')
  test.skip(testInfo.project.name !== 'desktop', 'single-user flow: runs once, on desktop')
  test.setTimeout(150_000)

  // 1. No 2FA yet: straight to the dashboard.
  await signIn(page)
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 })
  await expect(dashboard(page)).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('does not have access')).toHaveCount(0)

  // 2. Opt in on the account page.
  await page.goto('/admin/account')
  const panel = page.getByTestId('mfa-account')
  await expect(page.getByRole('heading', { name: 'Two-factor authentication' })).toBeVisible({
    timeout: 20_000,
  })
  await panel.getByRole('button', { name: 'Set up authenticator app' }).click()
  const key = (await panel.locator('section[aria-labelledby="scan"] code').innerText()).trim()
  expect(key.length).toBeGreaterThan(10)
  await submitCode(page, panel, '#c1', 'Confirm', '/api/mfa/confirm', key)
  await expect(panel.getByRole('heading', { name: 'Recovery codes' })).toBeVisible()
  await expect(
    panel.getByRole('heading', { name: 'Two-factor authentication is on' }),
  ).toBeVisible()

  // 3. A fresh sign-in now needs the code.
  await signIn(page)
  await expect(page).toHaveURL(/\/admin\/mfa/, { timeout: 30_000 })
  await page.goto('/admin') // the password alone must not open the admin
  await expect(page).toHaveURL(/\/admin\/mfa/)
  await page.locator('#c2').fill('000000')
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Invalid code' })).toBeVisible()
  await page.locator('#c2').fill(generateSync({ secret: key }))
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 })
  await expect(dashboard(page)).toBeVisible({ timeout: 20_000 })

  // 4. Opt out with the current password and a code, then sign in without a code again.
  await page.goto('/admin/account')
  const off = page.getByTestId('mfa-account')
  await submitCode(
    page,
    off,
    '#c3',
    'Turn off two-factor authentication',
    '/api/mfa/disable',
    key,
    async () => {
      await off.locator('#pw').fill(password)
    },
  )
  await expect(off.getByText('Two-factor authentication is now off.')).toBeVisible()
  await signIn(page)
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 })
  await expect(dashboard(page)).toBeVisible({ timeout: 20_000 })
})
