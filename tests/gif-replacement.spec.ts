import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test('replacement during file reading cannot publish the obsolete file', { tag: ['@gif-shared'] }, async ({ page }) => {
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === 'slow.gif') await new Promise((resolve) => setTimeout(resolve, 400));
      return read.call(this);
    };
  });
  await page.goto('/gif-compressor');
  const picker = page.getByLabel('Choose a GIF', { exact: true });
  await picker.setInputFiles({
    name: 'slow.gif',
    mimeType: 'image/gif',
    buffer: readFileSync('tests/fixtures/gif/natural-bunny-1.gif'),
  });
  await picker.setInputFiles(path.resolve('tests/fixtures/gif/crop-grid.gif'));
  await expect(page.getByText(/16 × 12 · 4 frames/)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByText(/16 × 12 · 4 frames/)).toBeVisible();
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
});

test(
  'cancelling a delayed worker handoff rejects late success and supports retry',
  { tag: ['@gif-shared'] },
  async ({ page }) => {
    await page.addInitScript(() => {
      const NativeWorker = Worker;
      window.Worker = class extends NativeWorker {
        constructor(url: string | URL, options?: WorkerOptions) {
          super(url, options);
          Object.defineProperty(this, 'onmessage', {
            set(callback: (event: MessageEvent) => void) {
              this.addEventListener('message', (event: MessageEvent) => setTimeout(() => callback(event), 400));
            },
          });
        }
      };
    });
    await page.goto('/gif-compressor');
    await page
      .getByLabel('Choose a GIF', { exact: true })
      .setInputFiles(path.resolve('tests/fixtures/gif/crop-grid.gif'));
    await page.getByRole('button', { name: 'Cancel processing', exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
    await page
      .getByLabel('Choose a GIF', { exact: true })
      .setInputFiles(path.resolve('tests/fixtures/gif/crop-grid.gif'));
    await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
  },
);
