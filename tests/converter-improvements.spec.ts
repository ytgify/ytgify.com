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
  await page.getByRole('textbox', { name: 'Start time', exact: true }).fill('360');
  await page.getByRole('button', { name: '3s', exact: true }).click();
  await openDetails(page, 'Set a size target');
  await page.getByRole('button', { name: 'Aim for 5 MB' }).click();
  await expect(page.getByText('Preview cued to 06:00.0 - 06:03.0.')).toBeVisible();
  await openDetails(page, 'Add a caption');
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
  await openDetails(page, 'Set a size target');
  await page.getByRole('button', { name: 'Aim for 5 MB' }).click();
  const before = await page.getByTestId('effective-settings').textContent();
  await page.getByRole('button', { name: '10s', exact: true }).click();
  expect(await page.getByTestId('effective-settings').textContent()).not.toEqual(before);
  await expect(page.getByRole('button', { name: 'Create GIF', exact: true })).toBeEnabled();
  await openDetails(page, 'Advanced settings');
  await page.getByRole('button', { name: /^5 fps/ }).click();
  await expect(page.getByRole('button', { name: 'No target' })).toHaveAttribute('aria-pressed', 'true');
  expect(await events(page, 'studio_size_target_selected')).toEqual([{ size_target: 5 }, { size_target: 'auto' }]);
});

test('mobile homepage has a clear file entry and guide links are crawlable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Convert video to GIF Free online tool · No installation' }).click();
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

for (const viewport of [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
]) {
  test(`choose video is immediately reachable at ${viewport.width}px and opens a real fixture`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/video-to-gif');
    const choose = page.getByRole('button', { name: 'Choose video', exact: true });
    await expect(choose).toBeInViewport({ ratio: 1 });
    const bounds = await choose.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByText('Your video stays on your device.', { exact: true })).toBeInViewport();
    await expect(page.getByText(/MP4, MOV, or WebM · up to/)).toBeInViewport();

    const fileChooser = page.waitForEvent('filechooser');
    await choose.click();
    await (await fileChooser).setFiles('tests/fixtures/bob-ross-15s.webm');
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
    expect(await events(page, 'studio_upload_loaded')).toHaveLength(1);
  });
}

test('long-source trim supports draft times, precise keys, and bounded navigation on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/video-to-gif');
  await page.getByLabel('Upload video').setInputFiles('tests/fixtures/long-source-370s.webm');
  const start = page.getByRole('textbox', { name: 'Start time', exact: true });
  const duration = page.getByRole('textbox', { name: 'Duration', exact: true });
  await page.getByRole('button', { name: '3s', exact: true }).click();
  await start.fill('06:');
  await expect(page.getByText('Preview cued to 00:00.0 - 00:03.0.')).toBeVisible();
  await start.fill('06:00.0');
  await start.press('Enter');
  await expect(page.getByText('Preview cued to 06:00.0 - 06:03.0.')).toBeVisible();
  await openDetails(page, 'Fine-tune timing');
  await expect(page.getByLabel('Visible timeline window')).toHaveText('05:40.006:10.0');
  await start.fill('6:99');
  await start.press('Enter');
  await expect(start).toHaveValue('06:00.0');
  await expect(start).toHaveAttribute('aria-invalid', 'true');
  await start.fill('123');
  await start.press('Escape');
  await expect(start).toHaveValue('06:00.0');
  await openDetails(page, 'Fine-tune timing');
  const handle = page.getByTestId('timeline-start-handle');
  await handle.focus();
  await handle.press('ArrowRight');
  await expect(start).toHaveValue('06:00.1');
  await expect(duration).toHaveValue('2.9');
  const startBox = (await handle.boundingBox())!;
  const endBox = (await page.getByTestId('timeline-end-handle').boundingBox())!;
  expect(startBox.width).toBeGreaterThanOrEqual(44);
  expect(startBox.height).toBeGreaterThanOrEqual(44);
  expect(endBox.y).toBeGreaterThanOrEqual(startBox.y + startBox.height);
  await page.getByRole('button', { name: '30s later' }).click();
  await expect(page.getByRole('button', { name: '30s later' })).toBeDisabled();
  await expect(duration).toHaveValue('2.9');
  await page.getByRole('button', { name: '10s', exact: true }).click();
  await expect(start).toHaveValue('06:00.0');
  await expect(duration).toHaveValue('10.0');
  await duration.fill('100');
  await duration.press('Enter');
  await expect(duration).toHaveValue('10.0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('touch trimming', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('keeps the detail window stable through a touch drag and stops on cancellation', async ({ page }) => {
    await page.goto('/video-to-gif');
    await page.getByLabel('Upload video').setInputFiles('tests/fixtures/long-source-370s.webm');
    const start = page.getByRole('textbox', { name: 'Start time', exact: true });
    await page.getByRole('button', { name: '3s', exact: true }).click();
    await start.fill('100');
    await start.press('Enter');
    await openDetails(page, 'Fine-tune timing');
    const handle = page.getByTestId('timeline-start-handle');
    await handle.scrollIntoViewIfNeeded();
    const bounds = (await handle.boundingBox())!;
    const rail = (await page.getByTestId('studio-timeline').boundingBox())!;
    const touch = await page.context().newCDPSession(page);
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + rail.width / 30, y }] });
    await expect(start).toHaveValue('01:41.0');
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + (2 * rail.width) / 30, y }],
    });
    await expect(start).toHaveValue('01:42.0');
    await expect(page.getByLabel('Visible timeline window')).toHaveText('01:26.501:56.5');
    await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await page.mouse.move(x - 30, y);
    await expect(start).toHaveValue('01:42.0');
    await expect(page.getByLabel('Visible timeline window')).toHaveText('01:27.501:57.5');
    await touch.detach();
  });
});

async function openDetails(page: import('@playwright/test').Page, title: string) {
  const summary = page.locator('summary').filter({ hasText: title });
  if ((await summary.locator('..').getAttribute('open')) === null) await summary.click();
}

test('progressive editor preserves hidden choices and keeps creation reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/video-to-gif');
  await page.getByLabel('Upload video').setInputFiles('tests/fixtures/bob-ross-15s.webm');
  await expect(page.getByRole('button', { name: 'Balanced', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('timeline-start-handle')).toBeHidden();
  await expect(page.getByRole('button', { name: '240p', exact: true })).toBeHidden();
  await expect(page.getByLabel('Top text')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Create GIF', exact: true })).toBeInViewport({ ratio: 1 });
  await openDetails(page, 'Add a caption');
  await page.getByLabel('Top text').fill('Keep this caption');
  await expect(page.getByTestId('create-bar')).toHaveCSS('position', 'static');
  await page.getByLabel('Top text').blur();
  await page.locator('summary').filter({ hasText: 'Add a caption' }).click();
  await page.getByRole('button', { name: 'Small file', exact: true }).click();
  await expect(page.getByLabel('Top text')).toBeHidden();
  await openDetails(page, 'Add a caption');
  await expect(page.getByLabel('Top text')).toHaveValue('Keep this caption');
  await openDetails(page, 'Set a size target');
  await page.getByRole('button', { name: 'Aim for 5 MB' }).click();
  await page.locator('summary').filter({ hasText: 'Set a size target' }).click();
  await expect(page.getByTestId('effective-settings')).toContainText('Auto · aim for 5 MB');
  await page.getByRole('button', { name: 'Balanced', exact: true }).click();
  await expect(page.getByTestId('effective-settings')).toContainText('Balanced · 360p · 10 FPS');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('make smaller preserves the previous download through failure and replaces it only on success', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/video-to-gif');
  await page.getByLabel('Upload video').setInputFiles('tests/fixtures/bob-ross-15s.webm');
  await page.getByRole('button', { name: '3s', exact: true }).click();
  await page.getByLabel('Start time', { exact: true }).fill('2');
  await page.getByLabel('Start time', { exact: true }).press('Enter');
  await openDetails(page, 'Add a caption');
  await page.getByLabel('Top text').fill('Keep me');
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF ready', exact: true })).toBeVisible();
  const originalUrl = (await page.getByRole('link', { name: 'Download GIF', exact: true }).getAttribute('href'))!;
  const originalSize = await page.evaluate(async (url) => (await (await fetch(url)).blob()).size, originalUrl);
  await page.getByRole('button', { name: 'Make smaller', exact: true }).click();
  await expect(page.getByLabel('Start time', { exact: true })).toHaveValue('00:02.0');
  await expect(page.getByLabel('Top text')).toHaveValue('Keep me');
  await expect(page.getByTestId('effective-settings')).toContainText('360p · 5 FPS');
  await expect(page.getByRole('link', { name: 'Download previous GIF' })).toHaveAttribute('href', originalUrl);
  await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function () {
      CanvasRenderingContext2D.prototype.getImageData = original;
      throw new Error('canvas_failed');
    };
  });
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF Creation Failed' })).toBeVisible();
  expect(await page.evaluate(async (url) => (await (await fetch(url)).blob()).size, originalUrl)).toBe(originalSize);
  await page.getByRole('button', { name: 'Go back', exact: true }).click();
  await expect(page.getByLabel('Top text')).toHaveValue('Keep me');
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF ready', exact: true })).toBeVisible();
  const nextUrl = (await page.getByRole('link', { name: 'Download GIF', exact: true }).getAttribute('href'))!;
  expect(nextUrl).not.toBe(originalUrl);
  expect(await page.evaluate(async (url) => (await (await fetch(url)).blob()).size, nextUrl)).toBeLessThan(
    originalSize,
  );
  expect(
    await page.evaluate(async (url) => {
      try {
        await fetch(url);
        return false;
      } catch {
        return true;
      }
    }, originalUrl),
  ).toBe(true);
});
