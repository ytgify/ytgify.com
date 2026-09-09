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

test(
  'resize exports a cropped GIF and supports a downloaded GIF in the compressor',
  { tag: ['@resize', '@compressor'] },
  async ({ page }, info) => {
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
  },
);

test('invalid GIF fails safely and the same picker recovers', { tag: ['@gif-shared'] }, async ({ page }) => {
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

test(
  'MP4 export has a real H.264 stream or an actionable unsupported message',
  { tag: ['@mp4'] },
  async ({ page }, info) => {
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
  },
);

test('new routes have canonical metadata and work at narrow widths', { tag: ['@gif-shared'] }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['gif-compressor', 'resize-gif', 'gif-to-mp4', 'screen-to-gif']) {
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

test(
  'resize lock restores proportions and fit changes invalidate previous exports',
  { tag: '@resize' },
  async ({ page }, info) => {
    await page.goto('/resize-gif');
    await upload(page, 'compressible.gif');
    await page.getByLabel('Lock crop aspect ratio').uncheck();
    await page.getByLabel('Output height', { exact: true }).fill('20');
    await page.getByLabel('Lock crop aspect ratio').check();
    await expect(page.getByLabel('Output height', { exact: true })).toHaveValue('48');
    await page.getByLabel('Output width', { exact: true }).fill('32');
    await expect(page.getByLabel('Output height', { exact: true })).toHaveValue('24');
    await page.getByRole('button', { name: 'Resize GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    expect(inspect(await download(page, info))).toMatchObject({ width: 32, height: 24 });
    await page.getByLabel('Fit mode').selectOption('contain');
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
    await expect(page.getByText(/Unlock the aspect ratio/)).toBeVisible();
    await page.getByLabel('Lock crop aspect ratio').uncheck();
    await page.getByLabel('Output height', { exact: true }).fill('40');
    await page.getByRole('button', { name: 'Resize GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    const padded = await download(page, info);
    expect(inspect(padded)).toMatchObject({ width: 32, height: 40 });
    const alpha = execFileSync(process.env.GIF_ORACLE_PYTHON || 'python3', [
      '-c',
      'from PIL import Image; import sys; im=Image.open(sys.argv[1]).convert("RGBA"); assert im.getpixel((16,0))[3] == 0; assert im.getpixel((16,20))[3] == 255',
      padded,
    ]);
    expect(alpha.length).toBe(0);
  },
);

test('MP4 cycle and background settings replace the previous result', { tag: '@mp4' }, async ({ page }, info) => {
  test.skip(info.project.name !== 'chrome-media', 'Actual H.264 settings acceptance uses native Chrome.');
  await page.goto('/gif-to-mp4');
  await upload(page, 'transparent-single-pixel.gif');
  await page.getByRole('button', { name: 'Create MP4', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toBeVisible();
  await page.getByLabel('Animation cycles').selectOption('3');
  await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toHaveCount(0);
  await page.getByLabel('Transparency background').fill('#00ff00');
  await expect(page.getByText(/3 cycles · background #00FF00/)).toBeVisible();
  await page.getByRole('button', { name: 'Create MP4', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toBeVisible();
  const output = await download(page, info, 'MP4');
  const pixels = execFileSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    output,
    '-frames:v',
    '1',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgb24',
    'pipe:1',
  ]);
  expect(pixels[0]).toBeLessThan(15);
  expect(pixels[1]).toBeGreaterThan(240);
  expect(pixels[2]).toBeLessThan(15);
  const duration = Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      output,
    ]).toString(),
  );
  const original = inspect(fixture('transparent-single-pixel.gif'));
  const cycleSeconds =
    original.rawDelaysCs.reduce((sum: number, delay: number) => sum + (delay < 2 ? 10 : delay), 0) / 100;
  expect(duration).toBeCloseTo(cycleSeconds * 3, 1);
  await page.getByLabel('Transparency background').fill('#ff0000');
  await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toHaveCount(0);
});
