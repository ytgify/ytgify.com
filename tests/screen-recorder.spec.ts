import { test, expect } from '@playwright/test';

test('recorder denial recovers without automatically requesting permission', { tag: ['@screen'] }, async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
      value: async () => {
        throw new DOMException('Denied', 'NotAllowedError');
      },
    });
  });
  await page.goto('/screen-to-gif');
  await expect(page.locator('p[role=alert]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start screen recording' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('cancelled or denied');
  await expect(page.getByRole('button', { name: 'Start screen recording' })).toBeEnabled();
});

test(
  'real MediaRecorder canvas recording is finalized, trimmed and exported to GIF',
  { tag: ['@screen', '@video', '@compressor'] },
  async ({ page }, info) => {
    test.setTimeout(60000);
    // A real encoder and moving pixels exercise ingestion. This substituted source does not accept the native-picker gate.
    await page.addInitScript(() => {
      let attempts = 0;
      Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
        value: async () => {
          if (attempts++) throw new DOMException('Cancelled replacement', 'NotAllowedError');
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 90;
          const context = canvas.getContext('2d')!;
          let frame = 0;
          const interval = setInterval(() => {
            context.fillStyle = frame++ % 2 ? '#fc3311' : '#1155ff';
            context.fillRect(0, 0, 160, 90);
          }, 100);
          const stream = canvas.captureStream(10);
          const observed = window as typeof window & { __capture?: MediaStream };
          observed.__capture = stream;
          const track = stream.getVideoTracks()[0];
          const stop = track.stop.bind(track);
          track.stop = () => {
            clearInterval(interval);
            stop();
          };
          return stream;
        },
      });
    });
    await page.goto('/screen-to-gif');
    await page.getByRole('button', { name: 'Start screen recording' }).click();
    await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Stop recording' }).click();
    expect(
      await page.evaluate(() =>
        (window as typeof window & { __capture?: MediaStream }).__capture
          ?.getTracks()
          .every((track) => track.readyState === 'ended'),
      ),
    ).toBe(true);
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 30000 });
    const originalDownload = await page.getByRole('link', { name: 'Download GIF', exact: true }).getAttribute('href');
    await page.getByRole('button', { name: 'Record another clip' }).click();
    await expect(page.locator('p[role=alert]')).toContainText('cancelled or denied');
    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveAttribute(
      'href',
      originalDownload!,
    );
    const pending = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download GIF', exact: true }).click();
    const file = info.outputPath('recorded-canvas.gif');
    await (await pending).saveAs(file);
    await info.attach('actual-recorded-canvas-GIF', { path: file });
    await page.goto('/gif-compressor');
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(file);
    await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByText('Target met.', { exact: true })).toBeVisible();
  },
);
