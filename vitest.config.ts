import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@payload-config': path.resolve(import.meta.dirname, 'apps/web/src/payload.config.ts'),
    },
  },
  test: {
    include: ['apps/web/tests/unit/**/*.test.ts', 'apps/web/tests/int/**/*.int.test.ts'],
    environment: 'node',
    passWithNoTests: true,
    // Never let Payload push schema during tests: the dev path prompts for data loss and blocks.
    env: { PAYLOAD_MIGRATING: 'true' },
    testTimeout: 60_000,
    hookTimeout: 300_000,
  },
})
