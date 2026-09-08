import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const inspect = (file: string) =>
  JSON.parse(execFileSync('node', ['scripts/gif-fixtures/inspect-gifuct.mjs', file]).toString())[0];

for (let number = 1; number <= 6; number++) {
  test(`natural GIF ${number}: three measured compression targets and independent quality`, async ({ page }, info) => {
    test.setTimeout(180000);
    const input = path.resolve(`tests/fixtures/gif/natural-bunny-${number}.gif`);
    const originalBytes = readFileSync(input).length;
    const original = inspect(input);
    await page.goto('/gif-compressor');
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(input);
    await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
    const receipts = [];
    for (const ratio of [0.8, 0.5, 0.05]) {
      const target = Math.floor(originalBytes * ratio);
      await page.getByLabel('Target size (MB)').fill(String(target / 1_000_000));
      const started = Date.now();
      await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 65000 });
      const pending = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Download GIF', exact: true }).click();
      const output = info.outputPath(`natural-${number}-${ratio}.gif`);
      await (await pending).saveAs(output);
      const actual = inspect(output);
      expect(actual.rawDelaysCs).toEqual(original.rawDelaysCs);
      expect(actual.loop).toEqual(original.loop);
      expect([actual.width, actual.height]).toEqual([original.width, original.height]);
      const size = readFileSync(output).length;
      expect(size).toBeLessThanOrEqual(originalBytes);
      expect(await page.getByText('Target met.', { exact: true }).count()).toBe(size <= target ? 1 : 0);
      const stats = info.outputPath(`ssim-${ratio}.txt`);
      execFileSync(process.env.FFMPEG || 'ffmpeg', [
        '-v',
        'error',
        '-i',
        input,
        '-i',
        output,
        '-lavfi',
        `[0:v]setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]ssim=stats_file=${stats}`,
        '-f',
        'null',
        '-',
      ]);
      const scores = [...readFileSync(stats, 'utf8').matchAll(/All:([\d.]+)/g)].map((match) => Number(match[1]));
      expect(scores.length).toBeGreaterThan(0);
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const minimum = Math.min(...scores);
      expect(mean).toBeGreaterThanOrEqual(0.95);
      expect(minimum).toBeGreaterThanOrEqual(0.9);
      receipts.push({
        target,
        size,
        originalBytes,
        elapsedMs: Date.now() - started,
        independentFfmpegSSIM: { mean, minimum },
      });
      await info.attach(`actual-${ratio}`, { path: output });
    }
    await info.attach('compression-receipt', {
      body: JSON.stringify(receipts, null, 2),
      contentType: 'application/json',
    });
  });
}

for (const name of [
  'natural-bunny-1',
  'natural-bunny-2',
  'natural-bunny-3',
  'natural-bunny-4',
  'natural-bunny-5',
  'natural-bunny-6',
  'local-palette-alpha',
  'variable-delays',
  'interlaced-odd',
]) {
  test(`${name}: actual MP4 at one and three cycles`, async ({ page }, info) => {
    test.setTimeout(120000);
    const input = path.resolve(`tests/fixtures/gif/${name}.gif`);
    const original = inspect(input);
    const duration =
      original.rawDelaysCs.reduce(
        (sum: number, delay: number | null) => sum + (delay === null || delay < 2 ? 10 : delay),
        0,
      ) / 100;
    await page.goto('/gif-to-mp4');
    await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(input);
    await expect(page.getByRole('button', { name: 'Create MP4', exact: true })).toBeVisible();
    for (const cycles of [1, 3]) {
      await page.getByLabel('Animation cycles').selectOption(String(cycles));
      await page.getByRole('button', { name: 'Create MP4', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toBeVisible({ timeout: 65000 });
      const pending = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Download MP4', exact: true }).click();
      const output = info.outputPath(`${name}-${cycles}.mp4`);
      await (await pending).saveAs(output);
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
      expect(probe.streams[0].width).toBe(Math.max(16, Math.ceil(original.width / 2) * 2));
      expect(probe.streams[0].height).toBe(Math.max(16, Math.ceil(original.height / 2) * 2));
      expect(Math.abs(Number(probe.format.duration) - duration * cycles)).toBeLessThanOrEqual(0.11);
      const pixels = execFileSync(process.env.GIF_ORACLE_PYTHON || 'python3', [
        'scripts/gif-fixtures/verify-product-export.py',
        'mp4',
        input,
        output,
        String(cycles),
      ]).toString();
      await info.attach(`decoded-colors-${cycles}`, { body: pixels, contentType: 'application/json' });
      await info.attach(`actual-MP4-${cycles}`, { path: output });
      await info.attach(`probe-${cycles}`, { body: JSON.stringify(probe), contentType: 'application/json' });
    }
  });
}
