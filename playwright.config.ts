import { defineConfig, devices } from '@playwright/test';

const testPort = Number(process.env.PLAYWRIGHT_PORT || 3217);
const testUrl = `http://localhost:${testPort}`;
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBaseUrl || testUrl,
    trace: 'on-first-retry',
  },
  projects: [
    ...(process.env.NATIVE_CAPTURE === '1'
      ? [
          {
            name: 'native-capture',
            testMatch: /native-capture\.spec\.ts/,
            use: {
              ...devices['Desktop Chrome'],
              channel: 'chrome',
              headless: false,
              launchOptions: { args: ['--auto-select-tab-capture-source-by-title=YTgify controlled capture'] },
            },
          },
        ]
      : []),
    {
      name: 'chrome-media',
      testMatch: /(gif-tools|gif-corpus-exports|gif-journeys)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'chromium',
      testIgnore: /(native-capture|gif-corpus-exports|gif-journeys)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /(studio|gif-tools)\.spec\.ts/,
      grepInvert: /public video-to-GIF converter/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /(studio|gif-tools)\.spec\.ts/,
      grepInvert: /public video-to-GIF converter/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: /(studio|gif-tools)\.spec\.ts/,
      grepInvert: /public video-to-GIF converter/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command:
          process.env.PLAYWRIGHT_SKIP_BUILD === '1'
            ? `npx serve out -l ${testPort}`
            : `npm run build && npx serve out -l ${testPort}`,
        url: testUrl,
        reuseExistingServer: false,
        timeout: 120000,
      },
});
