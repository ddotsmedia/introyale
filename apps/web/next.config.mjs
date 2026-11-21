import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'),
  reactStrictMode: true,
  // Dev-only: Playwright and local checks use 127.0.0.1; Next 16 blocks cross-origin dev resources otherwise.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  poweredByHeader: false,
  // Payload generates AVIF/WebP variants at upload; runtime optimisation is off (SPEC C12).
  images: { unoptimized: true },
  // Resolve metadata into <head> for every user agent (default streams it into <body> for browsers, which hides
  // title/description/canonical from tools that read the head).
  htmlLimitedBots: /.*/,
  // Inline the (small) stylesheet so first paint needs no extra round trip.
  experimental: { inlineCss: true },
  // Headers for every response, including static files and API routes the proxy does not touch (M10.5).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ]
  },
}

const withPayloadConfig = withPayload(nextConfig)
const payloadHeaders = withPayloadConfig.headers

// withPayload adds Accept-CH / Critical-CH (admin theme hint) to every path. Critical-CH makes Chrome restart each
// first navigation (an extra round trip before any HTML), so it is removed; the admin falls back to its default theme.
const CLIENT_HINT_HEADERS = new Set(['accept-ch', 'critical-ch'])
withPayloadConfig.headers = async () =>
  ((await payloadHeaders?.()) ?? [])
    .map((rule) => ({
      ...rule,
      headers: rule.headers.filter(
        (h) =>
          !CLIENT_HINT_HEADERS.has(h.key.toLowerCase()) &&
          !(h.key.toLowerCase() === 'vary' && h.value === 'Sec-CH-Prefers-Color-Scheme'),
      ),
    }))
    .filter((rule) => rule.headers.length > 0) // Next rejects empty header rules

// ANALYZE=true pnpm -C apps/web build opens the bundle report (M10.6).
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
})
export default withBundleAnalyzer(withPayloadConfig)
