import { defineConfig, devices } from '@playwright/test'

// 3000 may be held by another local project; tests use 3200.
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3200'

export default defineConfig({
  testDir: 'apps/web/tests',
  testMatch: ['**/e2e/**/*.spec.ts', '**/a11y/**/*.spec.ts'],
  fullyParallel: true,
  globalSetup: './apps/web/tests/global-setup.ts',
  reporter: [['list']],
  // Reduced motion: scroll-reveal fades otherwise make axe read mid-animation colours (flaky contrast).
  use: { baseURL, trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm -C apps/web exec next dev --port 3200',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
})
