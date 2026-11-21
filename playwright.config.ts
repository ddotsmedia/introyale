import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'apps/web/tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  passWithNoTests: true,
})
