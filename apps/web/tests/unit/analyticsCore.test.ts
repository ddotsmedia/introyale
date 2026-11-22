import { describe, expect, it } from 'vitest'
import {
  browserOf,
  cleanPath,
  collectSchema,
  deviceType,
  isBot,
  optedOut,
  osOf,
  refDomain,
  sourceLabel,
  templateOf,
  visitorId,
} from '../../src/lib/analytics/core'

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

const headers = (o: Record<string, string>) => ({ get: (k: string) => o[k.toLowerCase()] ?? null })

describe('collect payload validation', () => {
  it('accepts a pageview and rejects unknown types, missing paths and oversize fields', () => {
    expect(collectSchema.safeParse({ t: 'pv', p: '/work' }).success).toBe(true)
    expect(collectSchema.safeParse({ t: 'x', p: '/work' }).success).toBe(false)
    expect(collectSchema.safeParse({ t: 'pv' }).success).toBe(false)
    expect(collectSchema.safeParse({ t: 'pv', p: '/a', ti: 'x'.repeat(161) }).success).toBe(false)
    expect(collectSchema.safeParse({ t: 'ev', p: '/a', v: Number.POSITIVE_INFINITY }).success).toBe(
      false,
    )
  })
})

describe('bot and opt-out filtering', () => {
  it('flags crawlers, headless browsers, scripts and empty user agents', () => {
    for (const ua of [
      '',
      'curl/8.4.0',
      'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/126.0 Safari/537.36',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'python-requests/2.31 and a long enough suffix',
    ]) {
      expect(isBot(ua), ua).toBe(true)
    }
    expect(isBot(CHROME)).toBe(false)
    expect(isBot(IPHONE)).toBe(false)
  })
  it('honours Do Not Track and Global Privacy Control', () => {
    expect(optedOut(headers({ dnt: '1' }))).toBe(true)
    expect(optedOut(headers({ 'sec-gpc': '1' }))).toBe(true)
    expect(optedOut(headers({}))).toBe(false)
  })
})

describe('visitor id (cookieless)', () => {
  it('is stable within a day and never links across days (different salt)', () => {
    const a = visitorId('salt-monday', '203.0.113.9', CHROME)
    expect(visitorId('salt-monday', '203.0.113.9', CHROME)).toBe(a)
    expect(visitorId('salt-tuesday', '203.0.113.9', CHROME)).not.toBe(a)
    expect(visitorId('salt-monday', '203.0.113.10', CHROME)).not.toBe(a)
  })
  it('contains neither the IP nor the user agent', () => {
    const id = visitorId('s', '203.0.113.9', CHROME)
    expect(id).toMatch(/^[0-9a-f]{20}$/)
    expect(id).not.toContain('203')
  })
})

describe('classification', () => {
  it('derives device, browser and os from the user agent', () => {
    expect(deviceType(CHROME)).toBe('desktop')
    expect(deviceType(IPHONE)).toBe('mobile')
    expect(browserOf(CHROME)).toBe('Chrome')
    expect(browserOf(IPHONE)).toBe('Safari')
    expect(osOf(CHROME)).toBe('Windows')
    expect(osOf(IPHONE)).toBe('iOS')
  })
  it('reduces referrers to a domain and a source label', () => {
    expect(refDomain('https://www.google.com/search?q=x', 'introyale.online')).toBe('google.com')
    expect(refDomain('https://introyale.online/work', 'introyale.online')).toBe('')
    expect(refDomain('not a url', 'introyale.online')).toBe('')
    expect(sourceLabel(undefined, '')).toBe('direct')
    expect(sourceLabel(undefined, 'google.com')).toBe('organic search')
    expect(sourceLabel(undefined, 'instagram.com')).toBe('social')
    expect(sourceLabel(undefined, 'example.org')).toBe('referral')
    expect(sourceLabel('Newsletter', 'google.com')).toBe('newsletter')
  })
  it('groups pages into templates', () => {
    expect(templateOf('/')).toBe('home')
    expect(templateOf('/work')).toBe('work')
    expect(templateOf('/work/villa-one')).toBe('case study')
    expect(templateOf('/start')).toBe('start')
    expect(templateOf('/services/fit-out')).toBe('service')
    expect(templateOf('/residential')).toBe('sector')
  })
  it('never records admin, API or preview paths, and drops query and hash', () => {
    expect(cleanPath('/admin/collections/enquiries')).toBeNull()
    expect(cleanPath('/api/health')).toBeNull()
    expect(cleanPath('/preview/abc')).toBeNull()
    expect(cleanPath('/work/?sector=a#x')).toBe('/work')
    expect(cleanPath('work')).toBeNull()
  })
})
