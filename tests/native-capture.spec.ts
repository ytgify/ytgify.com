import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test('native Chrome tab capture exports moving pixels and releases tracks', async ({ context, page }, info) => {
  test.setTimeout(60000);
  const controlled = await prepareNative(context, page);
  await page.getByRole('button', { name: 'Start screen recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  const tracks = await page.evaluate(() =>
    (window as typeof window & { __nativeCapture?: MediaStream }).__nativeCapture
      ?.getTracks()
      .map((track) => ({ state: track.readyState, kind: track.kind })),
  );
  expect(tracks).toEqual([{ state: 'ended', kind: 'video' }]);
  await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 30000 });
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download GIF', exact: true }).click();
  const output = info.outputPath('native-tab-capture.gif');
  await (await pending).saveAs(output);
  const inspection = JSON.parse(
    execFileSync('node', ['scripts/gif-fixtures/inspect-gifuct.mjs', output]).toString(),
  )[0];
  expect(new Set(inspection.hashes).size).toBeGreaterThan(1);
  await info.attach('native-tab-capture', { path: output });
  await info.attach('native-inspection', {
    body: JSON.stringify({
      tracks,
      inspection,
      browser: context.browser()?.version(),
      picker: 'Chromium test switch selects only the controlled tab by title',
    }),
    contentType: 'application/json',
  });
  await page.goto('/gif-compressor');
  await page.bringToFront();
  await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(output);
  await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByText('Target met.', { exact: true })).toBeVisible();
  await controlled.close();
});

async function prepareNative(context: BrowserContext, page: Page) {
  const controlled = await context.newPage();
  await controlled.route('**/controlled-capture', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>YTgify controlled capture</title><canvas width="320" height="180"></canvas><script>const c=document.querySelector("canvas").getContext("2d");let n=0;setInterval(()=>{c.fillStyle=n++%2?"#ff2200":"#0044ff";c.fillRect(0,0,320,180);c.fillStyle="white";c.fillRect(n%200,30,30,30)},100)</script>',
    }),
  );
  await controlled.goto('/controlled-capture');
  // Observe the genuine native stream. No fake device, canvas stream, or substituted getDisplayMedia result.
  await page.addInitScript(() => {
    const native = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getDisplayMedia = async (constraints) => {
      const stream = await native(constraints);
      (window as typeof window & { __nativeCapture?: MediaStream }).__nativeCapture = stream;
      return stream;
    };
  });
  await page.goto('/screen-to-gif');
  await page.bringToFront();
  return controlled;
}

test('native capture enforces its cap and stops when its source tab closes', async ({ context, page }) => {
  test.setTimeout(60000);
  const controlled = await prepareNative(context, page);
  await page.getByRole('button', { name: 'Start screen recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toHaveCount(0, { timeout: 32000 });
  expect(
    await page.evaluate(() =>
      (window as typeof window & { __nativeCapture?: MediaStream }).__nativeCapture
        ?.getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
  await expect(page.getByRole('button', { name: 'Record another clip' })).toBeVisible({ timeout: 10000 });
  await page.bringToFront();
  await page.getByRole('button', { name: 'Record another clip' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.waitForTimeout(1000);
  await controlled.close();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toHaveCount(0, { timeout: 1000 });
  expect(
    await page.evaluate(() =>
      (window as typeof window & { __nativeCapture?: MediaStream }).__nativeCapture
        ?.getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
});

test('leaving the recorder releases the real native stream', async ({ context, page }) => {
  const controlled = await prepareNative(context, page);
  await page.getByRole('button', { name: 'Start screen recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.getByRole('link', { name: 'YTgify', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(
    await page.evaluate(() =>
      (window as typeof window & { __nativeCapture?: MediaStream }).__nativeCapture
        ?.getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
  await controlled.close();
});
