import { expect, test } from '@playwright/test'

// Full consultation flow against the local stack: web, worker and Mailpit (SPEC §7 M8).
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025'

test.describe('consultation lead flow (M8)', () => {
  test('a valid request is stored, queued, and both emails arrive in Mailpit', async ({
    page,
    request,
  }) => {
    test.setTimeout(240_000)
    await page.goto('/start?sector=residential')
    await page.waitForSelector('html[data-hydrated="true"]')

    // Step 1: project
    await expect(page.getByLabel('Sector')).toHaveValue('residential')
    await page.getByLabel('Type of project').fill('Apartment refurbishment')
    await page.getByLabel('District or area').fill('Saadiyat')
    await page.getByLabel('Property type').fill('Apartment')
    await page.getByLabel('Approximate area').fill('120 m²')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2: space and timing
    await page.getByLabel('Where are you in the process?').selectOption('design')
    await page.getByLabel('Target start').fill('Q1 2027')
    await page.getByLabel('Tell us about the project').fill('Open-plan kitchen and two bathrooms.')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: contact
    const email = `lead-${String(Date.now())}@example.test`
    await page.getByLabel('Name', { exact: true }).fill('Test Lead')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Preferred way to reply').selectOption('email')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 4: consent and the proof-of-work widget (solves on load)
    await page.getByLabel(/I agree that Introyale Interiors may contact me/).check()
    // The form must be at least 3 seconds old when submitted (SPEC §7 M8).
    await page.waitForTimeout(3500)
    await expect(page.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 90_000 })
    await page.getByRole('button', { name: 'Send request' }).click()

    await page.waitForURL(/\/start\/thank-you\?ref=IR-\d{4}-\d{4}/, { timeout: 90_000 })
    const ref = new URL(page.url()).searchParams.get('ref') ?? ''
    expect(ref).toMatch(/^IR-\d{4}-\d{4}$/)

    // Both messages reach Mailpit once the worker runs the jobs.
    await expect
      .poll(
        async () => {
          const res = await request.get(`${MAILPIT}/api/v1/messages`)
          const body = (await res.json()) as { messages?: { Subject?: string }[] }
          const subjects = (body.messages ?? []).map((m) => m.Subject ?? '')
          return {
            staff: subjects.some((s) => s.includes(ref) && s.startsWith('New enquiry')),
            confirmation: subjects.some((s) => s.includes(ref) && s.startsWith('We received')),
          }
        },
        { timeout: 120_000, intervals: [2_000] },
      )
      .toEqual({ staff: true, confirmation: true })
  })

  test('the thank-you page shows the reference and next steps', async ({ page }) => {
    await page.goto('/start/thank-you?ref=IR-2026-0001')
    await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible()
    await expect(page.getByText('IR-2026-0001')).toBeVisible()
  })
})
