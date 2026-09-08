import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const fixture = (name: string) => path.join(process.cwd(), 'tests/fixtures/gif', name);
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
async function upload(page: Page, name: string) {
  await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture(name));
  await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible({ timeout: 15000 });
}

test('compressor downloads a smaller real GIF, preserves pixels and reports impossible targets', async ({
  page,
}, info) => {
  await page.goto('/gif-compressor');
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
});

test('resize exports a cropped GIF and supports a downloaded GIF in the compressor', async ({ page }, info) => {
  await page.goto('/resize-gif');
  await upload(page, 'crop-grid.gif');
  await page.getByLabel('Lock crop aspect ratio').uncheck();
  for (const [label, value] of [
    ['Crop left', '3'],
    ['Crop top', '2'],
    ['Crop width', '7'],
    ['Crop height', '5'],
    ['Output width', '7'],
    ['Output height', '5'],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Resize GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Result', exact: true })).toBeVisible({ timeout: 30000 });
  const output = await download(page, info);
  const pixels = execFileSync(process.env.GIF_ORACLE_PYTHON || 'python3', [
    'scripts/gif-fixtures/verify-product-export.py',
    'crop',
    fixture('crop-grid.gif'),
    output,
    '3',
    '2',
    '7',
    '5',
  ]).toString();
  await info.attach('independent-crop-pixels', { body: pixels, contentType: 'application/json' });
  const actual = inspect(output);
  expect(actual.width).toBe(7);
  expect(actual.height).toBe(5);
  expect(actual.hashes).toHaveLength(4);
  await page.goto('/gif-compressor');
  await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(output);
  await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByText('Target met.', { exact: true })).toBeVisible();
});

test('invalid GIF fails safely and the same picker recovers', async ({ page }) => {
  await page.goto('/resize-gif');
  for (const name of ['truncated.gif', 'huge-canvas.gif', 'out-of-bounds.gif', 'malformed-lzw.gif']) {
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture(name));
    await expect(page.locator('p[role=alert]')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Original animation' })).toHaveCount(0);
  }
  await upload(page, 'natural-bunny-5.gif');
  await page.getByRole('button', { name: 'Resize GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 30000 });
});

test('MP4 export has a real H.264 stream or an actionable unsupported message', async ({ page }, info) => {
  await page.goto('/gif-to-mp4');
  await upload(page, 'natural-bunny-6.gif');
  await page.getByLabel('Animation cycles').selectOption('2');
  await page.getByRole('button', { name: 'Create MP4', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Download MP4', exact: true }).or(page.locator('p[role=alert]')),
  ).toBeVisible({ timeout: 65000 });
  if (await page.locator('p[role=alert]').count()) {
    await expect(page.locator('p[role=alert]')).toContainText('MP4 encoding is unavailable');
    if (info.project.name !== 'chrome-media') return;
    throw new Error('Chromium must produce an actual MP4 for this acceptance gate.');
  }
  const output = await download(page, info, 'MP4');
  const probe = JSON.parse(
    execFileSync(process.env.FFPROBE || 'ffprobe', [
      '-v',
      'error',
      '-show_streams',
      '-show_format',
      '-of',
      'json',
      output,
    ]).toString(),
  );
  expect(probe.streams).toHaveLength(1);
  expect(probe.streams[0].codec_name).toBe('h264');
  expect(probe.streams[0].width).toBe(256);
  expect(Number(probe.format.duration)).toBeCloseTo(4, 1);
  await info.attach('ffprobe', { body: JSON.stringify(probe, null, 2), contentType: 'application/json' });
});

test('new routes have canonical metadata and work at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['gif-compressor', 'resize-gif', 'gif-to-mp4', 'screen-to-gif']) {
    await page.goto(`/${route}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://ytgify.com/${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
