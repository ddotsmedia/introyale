/* eslint-disable */
// Local-only: screenshots of every admin view (light + dark, 1440 and 800 wide) plus responsive checks.
// Usage: ADMIN_PW=... node scripts/admin-ui-shots.mjs [outDir]
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const base = process.env.BASE ?? 'http://localhost:3100'
const out = process.argv[2] ?? 'docs/preview/admin-ui-v4'
const pw = process.env.ADMIN_PW
const email = process.env.ADMIN_EMAIL ?? 'admin@introyale.local'
fs.mkdirSync(out, { recursive: true })

const VIEWS = [
  ['dashboard', '/admin'],
  ['analytics', '/admin/analytics'],
  ['leads-board', '/admin/leads-board'],
  ['leads-table', '/admin/leads'],
  ['lead-detail', '/admin/lead?id=1'],
  ['calendar', '/admin/calendar'],
  ['workflow', '/admin/workflow'],
  ['content-health', '/admin/content-health'],
  ['media-library', '/admin/media-library'],
  ['site-tools', '/admin/site-tools'],
  ['system', '/admin/system'],
  ['security', '/admin/security'],
  ['audit', '/admin/audit'],
  ['account', '/admin/account'],
  ['projects-list', '/admin/collections/projects'],
  ['site-settings', '/admin/globals/site-settings'],
]

const browser = await chromium.launch()
const only = process.env.ONLY?.split(',')

async function session(theme, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
  await ctx.addCookies([{ name: 'payload-theme', value: theme, url: base }])
  const page = await ctx.newPage()
  return { ctx, page }
}

// Login page (signed out)
for (const theme of ['light', 'dark']) {
  const { ctx, page } = await session(theme, 1440, 900)
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(out, `login-${theme}-1440.png`) })
  await ctx.close()
}

for (const theme of ['light', 'dark']) {
  for (const w of [1440, 800]) {
    const { ctx, page } = await session(theme, w, 900)
    await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
    await page.fill('input[name=email], #field-email', email)
    await page.fill('input[type=password]', pw)
    await page.click('button[type=submit]')
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 30000 })
    for (const [name, url] of VIEWS) {
      if (only && !only.includes(name)) continue
      await page.goto(base + url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2500)
      const sx = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      if (sx > 1) console.log(`HSCROLL ${name} ${theme} ${w}: +${sx}px`)
      await page.screenshot({ path: path.join(out, `${name}-${theme}-${w}.png`), fullPage: true })
    }
    await ctx.close()
  }
}

// Responsive checks (light) on the dashboard
for (const w of [1280, 1024, 390]) {
  const { ctx, page } = await session('light', w, 900)
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await page.fill('input[name=email], #field-email', email)
  await page.fill('input[type=password]', pw)
  await page.click('button[type=submit]')
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 30000 })
  await page.goto(`${base}/admin`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const sx = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  console.log(`dashboard ${w}: hscroll=${sx}`)
  await page.screenshot({ path: path.join(out, `dashboard-light-${w}.png`), fullPage: true })
  if (w === 390) {
    await page.click('.app-header button[aria-label*="enu"], .app-header__mobile-nav-toggler, #nav-toggler button').catch(() => {})
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(out, `drawer-light-390.png`) })
  }
  await ctx.close()
}
await browser.close()
