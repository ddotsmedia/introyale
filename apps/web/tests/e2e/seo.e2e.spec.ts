import { expect, test } from '@playwright/test'
import { LEGACY_REDIRECTS } from '../../src/lib/legacyRedirects'

// Technical SEO (SPEC §7 M9): every legacy URL answers with its mapped 301, sitemap and robots work,
// and the home page carries structured data.

test.describe('legacy redirects (M9)', () => {
  for (const [from, rule] of Object.entries(LEGACY_REDIRECTS)) {
    test(`${from} → 301 to ${rule.to}`, async ({ request, baseURL }) => {
      const res = await request.get(from, { maxRedirects: 0 })
      expect(res.status()).toBe(rule.type)
      const location = res.headers()['location'] ?? ''
      // Location may be relative (RFC 9110 allows it); resolve it like a browser does.
      expect(new URL(location, baseURL).toString()).toBe(new URL(rule.to, baseURL).toString())
    })
  }
})

test.describe('crawl surface (M9)', () => {
  test('robots.txt points to the sitemap when indexing is allowed', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain('Sitemap:')
  })

  test('sitemap.xml lists the core pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('/work')
    expect(body).toContain('/services')
  })

  test('the home page carries Organization structured data and a canonical link', async ({
    page,
  }) => {
    await page.goto('/')
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.some((t) => t.includes('"@type":"Organization"'))).toBe(true)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })
})
