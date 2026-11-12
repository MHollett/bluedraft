import { defineConfig, devices } from '@playwright/test';

// Two modes:
//   pnpm e2e                         -> starts local dev servers and tests them
//   BASE_URL=https://... pnpm e2e    -> tests a deployed URL (e.g. a Vercel preview)
const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';
const isRemote = Boolean(process.env.BASE_URL);
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Lets tests through Vercel's preview deployment protection.
    ...(bypass ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': bypass } } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: 'pnpm dev',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
});
