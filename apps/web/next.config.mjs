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
}

export default withPayload(nextConfig)
