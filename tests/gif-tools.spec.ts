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
test(
  'compressor downloads a smaller real GIF, preserves pixels and reports impossible targets',
  { tag: ['@compressor'] },
  async ({ page }, info) => {
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
  },
);

test('invalid GIF fails safely and the same picker recovers', { tag: ['@gif-shared'] }, async ({ page }) => {
  await page.goto('/gif-compressor');
  for (const name of ['truncated.gif', 'huge-canvas.gif', 'out-of-bounds.gif', 'malformed-lzw.gif']) {
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(fixture(name));
    await expect(page.locator('p[role=alert]')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Original animation' })).toHaveCount(0);
  }
  await upload(page, 'natural-bunny-5.gif');
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 30000 });
});

test('new routes have canonical metadata and work at narrow widths', { tag: ['@gif-shared'] }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['gif-compressor']) {
    await page.goto(`/${route}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://ytgify.com/${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test(
  'size presets show selection, explain already-small files and clear stale results',
  { tag: '@compressor' },
  async ({ page }, info) => {
    await page.goto('/gif-compressor');
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
