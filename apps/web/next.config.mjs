import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Payload generates AVIF/WebP variants at upload; runtime optimisation is off (SPEC C12).
  images: { unoptimized: true },
}

export default withPayload(nextConfig)
