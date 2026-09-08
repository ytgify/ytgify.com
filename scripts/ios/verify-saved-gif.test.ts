import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GIFEncoder } from 'gifenc';
import { verifySavedGif } from './verify-saved-gif.mjs';

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function fixture({ captions = false, frozen = false, offset = 0, delay = 200 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ytgify-ios-oracle-'));
  directories.push(dir);
  const encoder = GIFEncoder();
  for (let i = 0; i < 15; i++) {
    const id = 11 + (frozen ? 0 : i * 2) + offset;
    const background = [
      [180, 40, 40],
      [40, 160, 40],
      [40, 40, 180],
      [180, 120, 30],
    ][Math.floor(id / 10)];
    const pixels = new Uint8Array(320 * 240);
    for (let bit = 0; bit < 6; bit++) {
      for (let y = 90; y < 130; y++)
        for (let x = 16 + bit * 48; x < 48 + bit * 48; x++) {
          pixels[y * 320 + x] = id & (1 << bit) ? 2 : 1;
        }
    }
    if (captions)
      for (const start of [20, 190]) {
        for (let y = start; y < start + 20; y++) for (let x = 100; x < 120; x++) pixels[y * 320 + x] = 3;
      }
    encoder.writeFrame(pixels, 320, 240, {
      palette: [background, [10, 10, 10], [240, 240, 240], [255, 255, 255]],
      delay,
    });
  }
  encoder.finish();
  const file = join(dir, 'saved.gif');
  writeFileSync(file, encoder.bytes());
  return file;
}

it('accepts complete plain and captioned saved GIFs and emits file hashes', () => {
  expect(verifySavedGif(fixture(), 'plain').frames).toHaveLength(15);
  expect(verifySavedGif(fixture({ captions: true }), 'captioned').sha256).toMatch(/^[a-f0-9]{64}$/);
});
it('rejects wrong selection, frozen content and wrong timing', () => {
  expect(() => verifySavedGif(fixture({ offset: -4 }), 'plain')).toThrow(/source frame/);
  expect(() => verifySavedGif(fixture({ frozen: true }), 'plain')).toThrow(/source frame|Frozen/);
  expect(() => verifySavedGif(fixture({ delay: 210 }), 'plain')).toThrow(/Duration/);
});
it('rejects missing captions, invalid modes and truncated downloads', () => {
  const file = fixture();
  expect(() => verifySavedGif(file, 'captioned')).toThrow(/Caption mismatch/);
  expect(() => verifySavedGif(file, 'unknown')).toThrow(/mode/);
  writeFileSync(file, 'GIF89a');
  expect(() => verifySavedGif(file, 'plain')).toThrow(/trailer/);
});
