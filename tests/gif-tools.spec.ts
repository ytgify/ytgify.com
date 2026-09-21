import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const fixture = (name: string) => path.join(process.cwd(), 'tests/fixtures/gif', name);
function paddedGif(name: string, bytes: number) {
  const source = readFileSync(fixture('compressible.gif'));
  return { name, mimeType: 'image/gif', buffer: Buffer.concat([source, Buffer.alloc(bytes - source.length)]) };
}
async function download(page: Page, info: TestInfo, kind = 'GIF') {
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: `Download ${kind}`, exact: true }).click();
  const downloaded = await pending;
  const output = info.outputPath(downloaded.suggestedFilename());
  await downloaded.saveAs(output);
  await info.attach(`actual-${kind}`, { path: output });
  return output;
}
function inspect(file: string) {
  return JSON.parse(execFileSync('node', ['scripts/gif-fixtures/inspect-gifuct.mjs', file]).toString())[0];
}
async function gotoCompressor(page: Page) {
  await page.goto('/gif-compressor', { waitUntil: 'domcontentloaded' });
}

test('compressor loads without a third-party font dependency and presents the local workflow', async ({ page }) => {
  const remoteFonts: string[] = [];
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) remoteFonts.push(request.url());
  });

  await page.goto('/gif-compressor', { waitUntil: 'load' });

  await expect(page.getByRole('heading', { level: 1, name: /Make your GIF lighter/i })).toBeVisible();
  await expect(page.getByText(/No uploads/)).toBeVisible();
  await expect(page.getByTestId('gif-compressor-workspace')).toContainText('Start with an animated GIF');
  expect(remoteFonts).toEqual([]);
});

test('invalid targets stay editable and never start a worker', { tag: '@compressor' }, async ({ page }, info) => {
  await page.setViewportSize(
    info.project.name === 'mobile-chromium' ? { width: 393, height: 852 } : { width: 1440, height: 900 },
  );
  await page.addInitScript(() => {
    const NativeWorker = Worker;
    const state = { started: 0 };
    Object.assign(window, { __targetWorkers: state });
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        state.started++;
      }
    };
  });
  await gotoCompressor(page);
  await upload(page, 'compressible.gif');
  const target = page.getByLabel('Target size (MB)', { exact: true });
  for (const value of ['', '0', '-1', '26', '0.0000009']) {
    await target.fill(value);
    await expect(target).toHaveValue(value);
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.locator('p[role=alert]')).toHaveText('Enter a target between 1 byte and 25 MB.');
    await expect(target).toBeFocused();
    await expect(target).toHaveAttribute('aria-invalid', 'true');
    if (value === '') {
      await info.attach('empty-target-validation', {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
    }
    expect(
      await page.evaluate(
        () => (window as typeof window & { __targetWorkers: { started: number } }).__targetWorkers.started,
      ),
    ).toBe(1);
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
  }
  await page.getByRole('button', { name: '10 KB', exact: true }).click();
  await expect(target).toHaveValue('0.01');
  await expect(page.locator('p[role=alert]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
  await info.attach('recovered-result', {
    body: await page.screenshot({ fullPage: false }),
    contentType: 'image/png',
  });
  const output = await download(page, info);
  expect(readFileSync(output).length).toBeLessThan(readFileSync(fixture('compressible.gif')).length);
  expect(inspect(output).rawDelaysCs).toEqual(inspect(fixture('compressible.gif')).rawDelaysCs);
});
async function upload(page: Page, name: string) {
  await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture(name));
  await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible({ timeout: 15000 });
}
test(
  'compressor downloads a smaller real GIF, preserves pixels and reports impossible targets',
  { tag: ['@compressor'] },
  async ({ page }, info) => {
    await gotoCompressor(page);
    await upload(page, 'compressible.gif');
    await page.getByLabel('Target size (MB)').fill('0.000001');
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Result', exact: true })).toBeVisible({ timeout: 65000 });
    await expect(page.getByText(/^Target not met/)).toBeVisible();
    const output = await download(page, info);
    expect(readFileSync(output).length).toBeLessThan(readFileSync(fixture('compressible.gif')).length * 0.8);
    const original = inspect(fixture('compressible.gif'));
    const actual = inspect(output);
    expect(actual.hashes).toEqual(original.hashes);
    expect(actual.rawDelaysCs).toEqual(original.rawDelaysCs);
    expect(actual.loop).toEqual(original.loop);
  },
);

test('invalid GIF fails safely and the same picker recovers', { tag: ['@gif-shared'] }, async ({ page }) => {
  await gotoCompressor(page);
  for (const name of [
    'truncated.gif',
    'huge-canvas.gif',
    'too-many-frames.gif',
    'out-of-bounds.gif',
    'malformed-lzw.gif',
  ]) {
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture(name));
    await expect(page.locator('p[role=alert]')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Original animation' })).toHaveCount(0);
  }
  await upload(page, 'natural-bunny-5.gif');
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 30000 });
});

test('large sources warn and continue on a best-effort basis', { tag: '@compressor' }, async ({ page }, info) => {
  await gotoCompressor(page);
  const picker = page.getByLabel('Choose a GIF', { exact: true });

  await picker.setInputFiles(paddedGif('supported-boundary.gif', 10 * 1024 * 1024));
  await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible();
  await expect(page.getByTestId('source-size-notice')).toHaveCount(0);

  await picker.setInputFiles(paddedGif('best-effort.gif', 10 * 1024 * 1024 + 1));
  await expect(page.getByTestId('source-size-notice')).toContainText(
    /Files up to 10 MB are fully supported.*YTgify will attempt to process them/,
  );
  await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible();
  await info.attach('best-effort-source-warning', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await picker.setInputFiles(paddedGif('above-soft-warning.gif', 25_000_001));
  await expect(page.getByTestId('source-size-notice')).toContainText(/above the current 25 MB soft warning threshold/);
  await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 65_000 });
  await info.attach('above-soft-threshold-result', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

test('new routes have canonical metadata and work at narrow widths', { tag: ['@gif-shared'] }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['gif-compressor']) {
    await page.goto(`/${route}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://ytgify.com/${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test(
  'size presets show selection, explain already-small files and clear stale results',
  { tag: '@compressor' },
  async ({ page }, info) => {
    await gotoCompressor(page);
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture('compressible.gif'));
    await expect(page.getByText(/seconds per cycle · 28.1 KB/)).toBeVisible();
    await expect(page.getByRole('button', { name: '1 MB', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '5 MB', exact: true }).click();
    await expect(page.getByLabel('Target size (MB)')).toHaveValue('5');
    await expect(page.getByRole('button', { name: '5 MB', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/Your GIF is already below this target/)).toBeVisible();
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '10 KB', exact: true }).click();
    await expect(page.getByLabel('Target size (MB)')).toHaveValue('0.01');
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your GIF is already below this target/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: '5 MB', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    const output = await download(page, info);
    expect(readFileSync(output).length).toBeLessThan(28065);
    await expect(page.getByText(/KB · 1.20 seconds per cycle/)).toBeVisible();
  },
);
