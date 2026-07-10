import { defineConfig, devices } from '@playwright/test';

const testPort = 3217;
const testUrl = `http://localhost:${testPort}`;
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: externalBaseUrl || testUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npm run build && npx serve out -l ${testPort}`,
        url: testUrl,
        reuseExistingServer: false,
        timeout: 120000,
      },
});
