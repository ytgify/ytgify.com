import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { decodeGif } from './decode';
import { encodeGifFrames } from './encode';
import { sampleGifFrames } from './sample';
import { compressGif } from './compress';
import { gifQuality } from './quality';

test('explicit frame reduction aggregates variable delays and preserves the finite loop', () => {
  const source = decodeGif(new Uint8Array(readFileSync('tests/fixtures/gif/variable-delays.gif')));
  const sampled = sampleGifFrames(source);
  expect(sampled.frames.reduce((sum, frame) => sum + frame.delay, 0)).toBe(source.duration);
  expect(sampled.frames[0].delay).toBe(source.frames[0].delay + source.frames[1].delay);
  expect(decodeGif(encodeGifFrames(sampled)).loop).toBe(source.loop);
  expect(gifQuality(source, sampled).mean).toBeLessThan(0.98);
});

// Two full optimizer searches need more than Vitest's 5s default on CI CPUs.
test('optimizer can reduce duplicate frames only when explicitly enabled', { timeout: 30_000 }, () => {
  const source = decodeGif(new Uint8Array(readFileSync('tests/fixtures/gif/original-motion.gif')));
  source.frames.forEach((frame) => {
    frame.rgba = source.frames[0].rgba;
  });
  const bytes = encodeGifFrames(source);
  const ordinary = compressGif(source, bytes, { targetBytes: 1, allowResize: false }, () => {});
  expect(ordinary.frameCount).toBe(source.frames.length);
  const sampled = compressGif(
    source,
    bytes,
    { targetBytes: 1, allowResize: false, allowFrameReduction: true },
    () => {},
  );
  expect(sampled.frameCount).toBe(Math.ceil(source.frames.length / 2));
  expect(sampled.bytes.length).toBeLessThan(ordinary.bytes.length);
  expect(decodeGif(sampled.bytes).duration).toBe(source.duration);
  expect(sampled.attempts).toBeLessThanOrEqual(12);
  expect(sampled.targetMet).toBe(false);
});
