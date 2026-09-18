import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/player',
  testMatch: '**/*.spec.mjs',
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: { command: 'node tests/player/serve.mjs', port: 4173, reuseExistingServer: !process.env.CI },
});
