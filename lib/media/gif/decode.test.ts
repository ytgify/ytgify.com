import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { decodeGif } from './decode';
import { parseGif } from './parse';
import { decodeLzw } from './lzw';
import oracle from '../../../tests/fixtures/gif/decoded-oracle.json';
import manifest from '../../../tests/fixtures/gif/manifest.json';

const source = (file: string) => new Uint8Array(readFileSync(`tests/fixtures/gif/${file}`));

describe('bounded GIF decoder against independent GIF/PNG oracle', () => {
  for (const fixture of oracle) {
    test(fixture.file, () => {
      const bytes = source(fixture.file);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(fixture.sha256);
      const parsed = parseGif(bytes);
      expect(parsed.patches.map((frame) => frame.rawDelay)).toEqual(fixture.rawDelaysCs);
      const gif = decodeGif(bytes);
      expect([gif.width, gif.height, gif.loop]).toEqual([fixture.width, fixture.height, fixture.loop]);
      expect(gif.duration).toBe(
        fixture.rawDelaysCs.reduce(
          (sum: number, delay: number | null) => sum + (delay === null || delay < 2 ? 100 : delay * 10),
          0,
        ),
      );
      expect(
        gif.frames.map((frame) => {
          const visible = frame.rgba.slice();
          for (let i = 0; i < visible.length; i += 4) if (!visible[i + 3]) visible.fill(0, i, i + 3);
          return createHash('sha256').update(visible).digest('hex');
        }),
      ).toEqual(fixture.hashes);
    });
  }

  for (const fixture of manifest.fixtures.filter((entry) => !entry.decodeForOracle)) {
    test(`rejects ${fixture.id} before compositing`, () => expect(() => parseGif(source(fixture.file))).toThrow());
  }

  test('bounds decoded workspace even when compressed bytes are small', () => {
    const bytes = source('compressible.gif');
    bytes[6] = 0;
    bytes[7] = 8;
    bytes[8] = 0;
    bytes[9] = 8;
    expect(() => parseGif(bytes)).toThrow(/memory/i);
  });

  test('rejects incomplete or overflowing LZW data rather than returning padded pixels', () => {
    expect(() => decodeLzw([new Uint8Array([0])], 2, 4)).toThrow();
    const parsed = parseGif(source('loop-finite.gif'));
    expect(() => decodeLzw(parsed.patches[0].chunks, 2, 1)).toThrow();
  });
});
