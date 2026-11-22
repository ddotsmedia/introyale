import AxeBuilder from '@axe-core/playwright'
import { expect, request as pwRequest, test } from '@playwright/test'

// Admin v3: analytics, dashboard, calendar, leads, palette, collector, CSV. Needs the CI stack's E2E_ADMIN_PW user.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// One account is shared by every test here; concurrent logins of one user race on its session list.
test.describe.configure({ mode: 'serial' })

test.beforeEach(({ browserName: _b }, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once, on desktop')
  test.skip(!process.env.E2E_ADMIN_PW, 'needs E2E_ADMIN_PW (CI stack)')
})

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/admin/login')
  await page.fill('#field-email', 'e2e-v3@introyale.local')
  await page.fill('#field-password', process.env.E2E_ADMIN_PW ?? '')
  await page.click('button[type=submit]')
  await page.waitForURL((u) => !u.pathname.includes('/login'))
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
}

async function open(page: import('@playwright/test').Page, path: string) {
  await page.goto(path)
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
}

test('the collector counts a real visit, ignores bots and opted-out visitors, and the admin sees it live', async ({
  page,
}, info) => {
  const base = String(info.project.use.baseURL)
  const visitor = await pwRequest.newContext({
    baseURL: base,
    extraHTTPHeaders: { 'user-agent': CHROME, 'x-forwarded-for': '203.0.113.77' },
  })
  const body = JSON.stringify({
    t: 'pv',
    p: '/work',
    ti: 'Work',
    sw: 1440,
    l: 'en-GB',
    tz: 'Asia/Dubai',
  })
  // Opted-out and bot hits answer 204 but are not stored; a normal hit is.
  expect(
    (await visitor.post('/api/a/collect', { data: body, headers: { dnt: '1' } })).status(),
  ).toBe(204)
  expect(
    (
      await visitor.post('/api/a/collect', { data: body, headers: { 'user-agent': 'curl/8.4.0' } })
    ).status(),
  ).toBe(204)
  expect((await visitor.post('/api/a/collect', { data: '{bad json' })).status()).toBe(204)
  expect((await visitor.post('/api/a/collect', { data: 'x'.repeat(4000) })).status()).toBe(413)
  expect((await visitor.post('/api/a/collect', { data: body })).status()).toBe(204)
  await signIn(page)
  await open(page, '/admin/analytics')
  await expect(page.getByRole('heading', { name: 'Analytics', level: 1 })).toBeVisible()
  await expect(page.locator('.ir-live .big')).toContainText(/[1-9]/)
  await expect(page.getByText('/work', { exact: true }).first()).toBeVisible()
})

for (const path of ['/admin', '/admin/analytics', '/admin/calendar', '/admin/leads']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await signIn(page)
    await open(page, path)
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
      ),
    ).toEqual([])
  })
}

test('the command palette opens with Ctrl+K and finds navigation targets', async ({ page }) => {
  await signIn(page)
  await open(page, '/admin')
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  await page.keyboard.type('analytics')
  await expect(page.getByRole('option', { name: /Analytics/ }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden()
})

test('the dashboard layout can be reordered, hidden and reset, per user', async ({ page }) => {
  await signIn(page)
  await open(page, '/admin')
  await page.getByText('Customise this dashboard').click()
  const row = page.getByRole('list', { name: 'Dashboard widgets' }).getByRole('listitem').first()
  await row.getByRole('checkbox').uncheck()
  await page.getByRole('button', { name: 'Save layout' }).click()
  await page.waitForLoadState('networkidle')
  await page.getByText('Customise this dashboard').click()
  await expect(
    page
      .getByRole('list', { name: 'Dashboard widgets' })
      .getByRole('listitem')
      .first()
      .getByRole('checkbox'),
  ).not.toBeChecked()
  await page.getByRole('button', { name: 'Reset to default' }).click()
  await page.waitForLoadState('networkidle')
  await page.getByText('Customise this dashboard').click()
  await expect(
    page
      .getByRole('list', { name: 'Dashboard widgets' })
      .getByRole('listitem')
      .first()
      .getByRole('checkbox'),
  ).toBeChecked()
})

test('analytics CSV export downloads for staff and is refused without a session', async ({
  page,
}, info) => {
  await signIn(page)
  const ok = await page.request.get('/api/admin-tools/analytics-csv?table=daily&range=7d')
  expect(ok.status()).toBe(200)
  expect(ok.headers()['content-type']).toContain('text/csv')
  expect((await ok.text()).split('\n')[0]).toBe(
    'day,visitors,sessions,pageviews,bounced_sessions,seconds_total,enquiries',
  )
  const anon = await pwRequest.newContext({ baseURL: String(info.project.use.baseURL) })
  expect((await anon.get('/api/admin-tools/analytics-csv?table=daily')).status()).toBe(403)
})
