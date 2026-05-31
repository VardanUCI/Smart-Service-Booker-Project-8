import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '__tests__/e2e',
  timeout: 30000,
  retries: 1,

  use: {
    baseURL: 'http://localhost:3000',
    // Capture traces on first retry to aid debugging
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    // Reuse an already-running dev server locally; always start fresh in CI
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
