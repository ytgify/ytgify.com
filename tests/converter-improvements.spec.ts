import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function events(page: Page, name: string) {
  return page.evaluate((eventName) => {
    const data = (window as typeof window & { dataLayer: unknown[][] }).dataLayer;
    return data.filter((event) => event[0] === 'event' && event[1] === eventName).map((event) => event[2]);
  }, name);
}

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager.com|google-analytics.com|posthog.com/, (route) => route.abort());
  await page.addInitScript(() => {
    const observed = window as typeof window & { dataLayer: unknown[][]; gtag: (...args: unknown[]) => void };
    observed.dataLayer = [];
    observed.gtag = (...args) => {
      observed.dataLayer.push(args);
    };
  });
});

test('exports and downloads a bounded segment six minutes into a real source with private analytics', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.goto('/video-to-gif?entry=tutorial');
  await expect
    .poll(() => events(page, 'studio_page_view'))
    .toEqual([{ source_page: 'internal', entry_point: 'tutorial' }]);
  await page.getByLabel('Upload video').setInputFiles(path.join(process.cwd(), 'tests/fixtures/long-source-370s.webm'));
  await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Start time', exact: true }).fill('360');
  await page.getByRole('button', { name: '3s', exact: true }).click();
  await page.getByRole('button', { name: 'Aim for 5 MB' }).click();
  await expect(page.getByText('Preview cued to 360.0s - 363.0s.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Customize' }).click();
  await page.getByLabel('Top text').pressSequentially('PRIVATE CAPTION');
  await page.getByLabel('Top text').fill('');
  await page.getByLabel('Bottom text').fill('PRIVATE SECOND CAPTION');
  expect(await events(page, 'studio_caption_added')).toHaveLength(1);
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF ready', exact: true })).toBeVisible({ timeout: 60000 });
  await expect(page.getByText('This GIF meets your 5 MB target.')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download GIF', exact: true }).click();
  const download = await downloadPromise;
  const output = testInfo.outputPath('long-source.gif');
  await download.saveAs(output);
  const gif = await readFile(output);
  expect(gif.subarray(0, 6).toString()).toMatch(/^GIF8[79]a$/);
  expect(gif.readUInt16LE(6)).toBe(160);
  expect(gif.readUInt16LE(8)).toBe(90);
  expect(gif.length).toBeLessThanOrEqual(5 * 1048576);
  const success = await events(page, 'studio_export_succeeded');
  expect(success).toEqual([
    expect.objectContaining({ size_target: 5, size_target_outcome: 'met', output_duration: 3, captions_enabled: true }),
  ]);
  expect(await events(page, 'studio_download_clicked')).toEqual([
    expect.objectContaining({ size_target: 5, size_target_outcome: 'met' }),
  ]);
  expect(await events(page, 'studio_upload_loaded')).toEqual([
    expect.objectContaining({ source_duration_bucket: '5-10m' }),
  ]);
  expect(JSON.stringify(success)).not.toMatch(/PRIVATE|long-source/);
  await testInfo.attach('export', { path: output, contentType: 'image/gif' });
});

test('size target recalculates after trim and manual settings turn it off', async ({ page }) => {
  await page.goto('/video-to-gif');
  await page.getByLabel('Upload video').setInputFiles('tests/fixtures/bob-ross-15s.webm');
  await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
  await page.getByRole('button', { name: '3s', exact: true }).click();
  await page.getByRole('button', { name: 'Aim for 5 MB' }).click();
  const before = await page.getByRole('button', { pressed: true }).allTextContents();
  await page.getByRole('button', { name: '10s', exact: true }).click();
  expect(await page.getByRole('button', { pressed: true }).allTextContents()).not.toEqual(before);
  await expect(page.getByRole('button', { name: 'Continue to Customize' })).toBeEnabled();
  await page.getByRole('button', { name: /^5 fps/ }).click();
  await expect(page.getByRole('button', { name: 'No target' })).toHaveAttribute('aria-pressed', 'true');
  expect(await events(page, 'studio_size_target_selected')).toEqual([{ size_target: 5 }, { size_target: 'auto' }]);
});

test('mobile homepage has a clear file entry and guide links are crawlable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'From a video file' }).click();
  await expect(page.getByRole('button', { name: 'Choose video' })).toBeVisible();
  await expect
    .poll(() => events(page, 'studio_page_view'))
    .toEqual([{ source_page: 'internal', entry_point: 'home_hero' }]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [slug, entry] of [
    ['how-to-create-gif-from-youtube-video', 'tutorial'],
    ['best-gif-settings-for-social-media', 'settings_guide'],
  ]) {
    await page.goto(`/blog/${slug}`);
    await expect(page.locator(`a[href="/video-to-gif?entry=${entry}"]`)).toBeVisible();
  }
});
