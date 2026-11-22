import { createHash } from 'node:crypto'
import { z } from 'zod'

// First-party, cookieless analytics: pure helpers (no I/O) so they are unit-testable.

export const MAX_BODY = 2048
const clip = (max: number) => z.string().max(max).optional()

/** Payload sent by the tracker (src/tracker/a.ts) and by the Web Vitals component. */
export const collectSchema = z.object({
  t: z.enum(['pv', 'ev', 'vt']),
  p: z.string().min(1).max(300), // path only (the tracker never sends query or hash)
  ti: clip(160), // title
  r: clip(300), // referrer URL (reduced to its domain on the server)
  us: clip(80), // utm_source
  um: clip(80),
  uc: clip(120),
  sw: z.number().int().min(0).max(10000).optional(), // screen width
  l: clip(16), // language
  tz: clip(48), // timezone
  n: clip(60), // event / metric name
  v: z.number().optional(),
  nf: z.boolean().optional(), // page was a 404
})
export type Collect = z.infer<typeof collectSchema>

const BOT_UA =
  /bot|crawl|spider|slurp|headless|phantom|lighthouse|pagespeed|gtmetrix|curl|wget|python|java\/|go-http|axios|node-fetch|okhttp|httpclient|facebookexternalhit|preview|monitor|uptime|pingdom|scrapy|playwright|puppeteer|selenium/i

/** Known automation and crawler user agents. Missing or very short UAs count as bots. */
export function isBot(ua: string | null | undefined): boolean {
  return !ua || ua.length < 20 || BOT_UA.test(ua)
}

/** True when the visitor asked not to be tracked (Do Not Track or Global Privacy Control). */
export function optedOut(h: { get(name: string): string | null }): boolean {
  return h.get('dnt') === '1' || h.get('sec-gpc') === '1'
}

export function deviceType(ua: string, width?: number): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|kindle|silk|playbook/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua)))
    return 'tablet'
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile'
  if (width && width < 640) return 'mobile'
  return 'desktop'
}

export function browserOf(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Other'
}

export function osOf(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/android/i.test(ua)) return 'Android'
  if (/mac os x|macintosh/i.test(ua)) return 'macOS'
  if (/cros/i.test(ua)) return 'ChromeOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Other'
}

export function screenBucket(w?: number): string {
  if (!w) return 'unknown'
  if (w < 640) return '<640'
  if (w < 1024) return '640-1023'
  if (w < 1440) return '1024-1439'
  return '1440+'
}

/** Domain of the referrer, or '' for direct and same-site traffic. */
export function refDomain(ref: string | undefined, host: string): string {
  if (!ref) return ''
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '')
    return h === host.replace(/^www\./, '').split(':')[0] ? '' : h.slice(0, 80)
  } catch {
    return ''
  }
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./i
const SOCIAL =
  /(^|\.)(facebook|instagram|linkedin|twitter|x|t|pinterest|youtube|tiktok|snapchat|wa|whatsapp|lnkd)\.(com|co|me|in|net|us)$/i

/** One label per session for the traffic-sources chart: utm source, else the referrer class, else direct. */
export function sourceLabel(utmSource: string | undefined, domain: string): string {
  if (utmSource) return utmSource.toLowerCase().slice(0, 40)
  if (!domain) return 'direct'
  if (SEARCH.test(domain)) return 'organic search'
  if (SOCIAL.test(domain)) return 'social'
  return 'referral'
}

/** Page template used to group Core Web Vitals. */
export function templateOf(path: string): string {
  if (path === '/' || path === '') return 'home'
  if (/^\/work\/[^/]+/.test(path)) return 'case study'
  if (path === '/work') return 'work'
  if (/^\/start/.test(path)) return 'start'
  if (/^\/services\/[^/]+/.test(path)) return 'service'
  if (/^\/(residential|commercial|hospitality-leisure)$/.test(path)) return 'sector'
  if (/^\/journal/.test(path)) return 'journal'
  if (/^\/(studio|clients|contact|process)/.test(path)) return path.slice(1).split('/')[0] ?? 'page'
  return 'other'
}

/** Visitor id: hash of the day's secret salt, the IP and the user agent. The salt rotates daily, so ids never link across days. */
export function visitorId(salt: string, ip: string, ua: string): string {
  return createHash('sha256').update(`${salt}|${ip}|${ua}`).digest('hex').slice(0, 20)
}

export function clientIp(h: { get(name: string): string | null }): string {
  return (h.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || h.get('x-real-ip') || '0.0.0.0'
}

/** Normalises a path: no query, no hash, never an admin, API or preview URL. */
export function cleanPath(p: string): string | null {
  const path = p.split(/[?#]/)[0] ?? ''
  if (!path.startsWith('/') || /^\/(admin|api|preview)(\/|$)/.test(path)) return null
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

/** Event names the tracker may send. Anything else is dropped (the list is the contract). */
export const EVENT_NAMES = new Set([
  'cta_click',
  'whatsapp_click',
  'phone_click',
  'email_click',
  'outbound',
  'download',
  'scroll',
  'time',
  'gallery_open',
  'before_after',
  'step_reached',
  'consult_submit',
  'contact_submit',
  'form_error',
])
export const VITALS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB'])
