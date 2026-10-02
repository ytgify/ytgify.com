import { test, expect } from '@playwright/test';

const installUrl = 'https://ytgify.com/#install';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

test('mobile visitors can share the desktop setup link', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const testWindow = window as Window & {
      sharedUrl?: string;
      events?: Array<{ name: string; properties: unknown }>;
      gtag?: (command: string, name: string, properties: Record<string, string>) => void;
    };
    testWindow.events = [];
    testWindow.gtag = (_command, name, properties) => testWindow.events?.push({ name, properties });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        testWindow.sharedUrl = data.url;
      },
    });
  });

  const save = page.getByRole('button', { name: 'Save for later' });
  await expect(save).toBeVisible();
  await save.click();
  await expect(page.getByText('Link shared. Open it on your computer when you are ready.')).toBeVisible();

  const result = await page.evaluate(() => {
    const testWindow = window as Window & {
      sharedUrl?: string;
      events?: Array<{ name: string; properties: unknown }>;
    };
    return { sharedUrl: testWindow.sharedUrl, events: testWindow.events };
  });
  expect(result.sharedUrl).toBe(installUrl);
  expect(result.events).toContainEqual({
    name: 'mobile_extension_save_completed',
    properties: expect.objectContaining({ surface: 'home_hero', save_method: 'web_share', device_category: 'mobile' }),
  });
});

test('mobile visitors can copy the link when sharing is unavailable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const testWindow = window as Window & {
      copiedUrl?: string;
      events?: Array<{ name: string; properties: unknown }>;
      gtag?: (command: string, name: string, properties: Record<string, string>) => void;
    };
    testWindow.events = [];
    testWindow.gtag = (_command, name, properties) => testWindow.events?.push({ name, properties });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          testWindow.copiedUrl = value;
        },
      },
    });
  });

  await page.getByRole('button', { name: 'Save for later' }).click();
  await expect(page.getByText('Link copied. Send it to yourself for your computer.')).toBeVisible();

  const result = await page.evaluate(() => {
    const testWindow = window as Window & {
      copiedUrl?: string;
      events?: Array<{ name: string; properties: unknown }>;
    };
    return { copiedUrl: testWindow.copiedUrl, events: testWindow.events };
  });
  expect(result.copiedUrl).toBe(installUrl);
  expect(result.events).toContainEqual({
    name: 'mobile_extension_save_completed',
    properties: expect.objectContaining({ surface: 'home_hero', save_method: 'clipboard', device_category: 'mobile' }),
  });
});

test('a denied clipboard still leaves a selectable setup link', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard denied');
        },
      },
    });
  });

  await page.getByRole('button', { name: 'Save for later' }).click();
  const link = page.getByRole('textbox', { name: 'Desktop extension setup link' });
  await expect(link).toBeVisible();
  await expect(link).toHaveValue(installUrl);
  await link.focus();
  expect(await link.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(0);
  expect(await link.evaluate((input: HTMLInputElement) => input.selectionEnd)).toBe(installUrl.length);
});

test('a failed share sheet falls back to copying the link', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const testWindow = window as Window & { copiedUrl?: string };
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new Error('Share unavailable');
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          testWindow.copiedUrl = value;
        },
      },
    });
  });

  await page.getByRole('button', { name: 'Save for later' }).click();
  await expect(page.getByText('Link copied. Send it to yourself for your computer.')).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { copiedUrl?: string }).copiedUrl)).toBe(installUrl);
});

test('cancelling the share sheet does not claim the link was saved', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Cancelled', 'AbortError');
      },
    });
  });

  await page.getByRole('button', { name: 'Save for later' }).click();
  await expect(page.getByText('Share the setup link to your notes, email, or another device.')).toBeVisible();
  await expect(page.getByText(/Link shared|Link copied/)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Desktop extension setup link' })).toHaveCount(0);
});
