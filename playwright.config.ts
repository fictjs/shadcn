import { defineConfig } from '@playwright/test'

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.e2e\.ts/,
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : 4,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:6006',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm storybook:prepare && pnpm exec storybook dev -p 6006 --ci --host 127.0.0.1',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !isCI,
    timeout: 3 * 60 * 1000,
  },
})
