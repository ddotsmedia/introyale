import { gzipSync } from 'node:zlib'
import { expect, request as pwRequest, test } from '@playwright/test'
import { FX } from '../../src/lib/motionFx'

// Motion layer (NEXT-PROMPT-VISUAL): CMS switches, reduced motion, keyboard access, and the initial JS budget.
// Desktop project only (the effects are checked once; mobile is covered by the layout tests).
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once, on desktop')
})

test('every effect has a CMS switch and is on by default', async ({ page }) => {
  await page.goto('/')
  const fx = (await page.locator('.fx-root').getAttribute('data-fx')) ?? ''
  expect(fx.split(' ').length).toBeGreaterThanOrEqual(26)
  for (const k of [
    'heroSlideshow',
    'pageTransitions',
    'parallax',
    'marquee',
    'lightbox',
    'backToTop',
  ])
    expect(fx).toContain(k)
})

test('the home hero image is visible immediately and the slideshow is keyboard operable', async ({
  page,
}) => {
  await page.goto('/')
  const first = page.locator('.hero__slide').first()
  await expect(first).toHaveAttribute('data-active', 'true')
  expect(await first.evaluate((e) => getComputedStyle(e).opacity)).toBe('1')
  const pause = page.getByRole('button', { name: 'Pause slideshow' })
  if (await pause.count()) {
    await pause.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show slide 1' })).toBeVisible()
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows the static version with all content visible', async ({ page }) => {
    await page.goto('/')
    // One hero image, no slideshow controls, static logo grid, statement fully coloured, no scroll cue animation.
    expect(await page.locator('.hero__slide:not([data-active="false"])').count()).toBe(1)
    await expect(page.locator('.hero-ctrl')).toBeHidden()
    const marquee = page.locator('.marquee-on')
    if (await marquee.count())
      expect(await marquee.evaluate((e) => getComputedStyle(e).display)).toBe('none')
    const word = page.locator('.stmt-word').first()
    if (await word.count())
      expect(await word.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(31, 29, 26)')
    const h1 = page.locator('h1').first()
    expect(await h1.evaluate((e) => getComputedStyle(e).opacity)).toBe('1')
  })
})

test('initial JavaScript stays within 150 KB (gzip); the motion runtime loads after first paint', async ({
  page,
}) => {
  const scripts: { url: string; gz: number; runtime: boolean }[] = []
  const pending: Promise<void>[] = []
  page.on('response', (res) => {
    if (!res.url().includes('/_next/static/') || !res.url().endsWith('.js')) return
    pending.push(
      res.body().then((b) => {
        scripts.push({
          url: res.url(),
          gz: gzipSync(b).length,
          runtime: b.includes('cursor-bubble'),
        })
      }),
    )
  })
  await page.goto('/', { waitUntil: 'load' })
  await page.waitForTimeout(4000) // let the idle-loaded runtime arrive
  await Promise.all(pending)
  const runtime = scripts.filter((s) => s.runtime)
  expect(runtime.length).toBeGreaterThan(0) // the runtime is a separate, lazily loaded chunk
  const initial = scripts.filter((s) => !s.runtime).reduce((n, s) => n + s.gz, 0)
  expect(initial).toBeLessThan(150 * 1024)
})

test('an effect switched off in the CMS disappears without a rebuild', async ({ page }, info) => {
  const pw = process.env.E2E_ADMIN_PW
  test.skip(!pw, 'needs E2E_ADMIN_PW (CI stack)')
  const admin = await pwRequest.newContext({ baseURL: String(info.project.use.baseURL) })
  const login = await admin.post('/api/users/login', {
    data: { email: process.env.E2E_MOTION_EMAIL ?? 'e2e-motion@introyale.local', password: pw },
  })
  expect(login.ok()).toBe(true)
  // One non-critical effect is toggled (not the master switch) so tests running in parallel are unaffected.
  const effects = (off: boolean) =>
    Object.fromEntries(FX.map(([k]) => [k, !(off && k === 'formSteps')]))
  const set = (off: boolean) =>
    admin.post('/api/globals/motion-settings', { data: { enabled: true, effects: effects(off) } })
  try {
    expect((await set(true)).ok()).toBe(true)
    await page.goto('/')
    const fx = (await page.locator('.fx-root').getAttribute('data-fx')) ?? ''
    expect(fx).not.toContain('formSteps')
    expect(fx).toContain('heroSlideshow')
  } finally {
    await set(false)
    await admin.dispose()
  }
  await page.goto('/')
  expect((await page.locator('.fx-root').getAttribute('data-fx')) ?? '').toContain('formSteps')
})

test('back-to-top and the mobile-first controls are keyboard operable', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.scrollTo(0, 2000)
  })
  const top = page.getByRole('button', { name: 'Back to top' })
  await expect(top).toHaveAttribute('data-visible', 'true', { timeout: 15_000 })
  await top.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8000 }).toBeLessThan(50)
})
