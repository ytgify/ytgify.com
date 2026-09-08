import { execFileSync } from 'node:child_process';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { decompressFrames, parseGIF, type ParsedFrame } from 'gifuct-js';

const colors = [
  [180, 40, 40],
  [40, 160, 40],
  [40, 40, 180],
  [180, 120, 30],
  [140, 40, 160],
  [30, 140, 160],
];

export function registerVisualContentTests() {
  test('exported GIF pixels preserve the selected motion and both captions', async ({
    page,
    browserName,
  }, testInfo) => {
    await page.goto('/video-to-gif');
    await page
      .getByLabel('Upload video')
      .setInputFiles(
        path.join(process.cwd(), `tests/fixtures/visual-timeline.${browserName === 'webkit' ? 'mp4' : 'webm'}`),
      );
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 20000 });
    await setTime(page, 'Duration', '3');
    await setTime(page, 'Start time', '1.1');
    await openDetails(page, 'Advanced settings');
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: '240p', exact: true }).click();
    const plain = await exportFrames(page, testInfo, 'plain');
    const plainIds = assertTimeline(plain);
    for (const frame of plain) {
      expect(captionInk(frame, 'top')).toBe(0);
      expect(captionInk(frame, 'bottom')).toBe(0);
    }

    await page.getByRole('button', { name: 'Edit clip' }).click();
    await openDetails(page, 'Add a caption');
    await page.getByLabel('Top text').fill('TOP TEST');
    await page.getByLabel('Bottom text').fill('BOTTOM TEST');
    const captioned = await exportFrames(page, testInfo, 'captioned');
    const captionedIds = assertTimeline(captioned);
    for (const frame of captioned) {
      expect(captionInk(frame, 'top'), 'top caption must be burned into every frame').toBeGreaterThan(100);
      expect(captionInk(frame, 'bottom'), 'bottom caption must be burned into every frame').toBeGreaterThan(100);
    }
    await testInfo.attach('decoded-source-frame-ids', {
      body: JSON.stringify({ plain: plainIds, captioned: captionedIds }),
      contentType: 'application/json',
    });
  });
}

async function exportFrames(page: Page, testInfo: TestInfo, name: string) {
  await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 60000 });
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download GIF' }).click();
  const download = await pending;
  const file = (await download.path())!;
  await testInfo.attach(`${name}.gif`, { path: file, contentType: 'image/gif' });
  execFileSync(process.execPath, ['scripts/ios/verify-saved-gif.mjs', file, name]);
  const bytes = await readFile(file);
  const gif = parseGIF(Uint8Array.from(bytes).buffer);
  expect([gif.lsd.width, gif.lsd.height]).toEqual([320, 240]);
  return decompressFrames(gif, true);
}

function assertTimeline(frames: ParsedFrame[]) {
  expect(frames).toHaveLength(15);
  expect(frames.reduce((sum, frame) => sum + frame.delay, 0)).toBe(3000);
  const ids = frames.map((frame, index) => {
    // gifenc emits full opaque frames; reject partial patches rather than misreading their coordinates.
    expect(frame.dims).toEqual({ width: 320, height: 240, top: 0, left: 0 });
    let id = 0;
    for (let bit = 0; bit < 6; bit++) {
      if (pixel(frame, 32 + bit * 48, 110)[0] > 128) id |= 1 << bit;
    }
    // Browser seeks may choose either frame bordering a source timestamp (100 ms at 10 FPS).
    expect(Math.abs(id - (11 + index * 2)), `source frame ${index}: decoded ${id}`).toBeLessThanOrEqual(1);
    const expected = colors[Math.floor(id / 10)];
    const actual = pixel(frame, 8, 170);
    for (let channel = 0; channel < 3; channel++) {
      expect(Math.abs(actual[channel] - expected[channel]), `background color at frame ${index}`).toBeLessThan(25);
    }
    expect(actual[3]).toBe(255);
    return id;
  });
  for (let index = 1; index < ids.length; index++) expect(ids[index]).toBeGreaterThan(ids[index - 1]);
  return ids;
}

function pixel(frame: ParsedFrame, x: number, y: number) {
  return frame.patch.subarray((y * 320 + x) * 4, (y * 320 + x) * 4 + 4);
}

function captionInk(frame: ParsedFrame, placement: 'top' | 'bottom') {
  let count = 0;
  const start = placement === 'top' ? 10 : 180;
  for (let y = start; y < start + 50; y++) {
    for (let x = 50; x < 270; x++) {
      const rgba = pixel(frame, x, y);
      if (rgba[0] > 210 && rgba[1] > 210 && rgba[2] > 210 && rgba[3] === 255) count++;
    }
  }
  return count;
}

async function setTime(page: Page, name: string, value: string) {
  const input = page.getByRole('textbox', { name, exact: true });
  await input.fill(value);
  await input.press('Enter');
}

async function openDetails(page: Page, title: string) {
  const summary = page.locator('summary').filter({ hasText: title });
  if ((await summary.locator('..').getAttribute('open')) === null) await summary.click();
}
