import { expect, test } from 'vitest';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { decodeGif } from './decode';
import { encodeGifFrames } from './encode';
import { compressGif } from './compress';
import { transformGif } from './geometry';
import oracle from '../../../tests/fixtures/gif/decoded-oracle.json';

test('round-trip exports preserve independent pixels, timing and loop metadata', () => {
  const folder = '.ytgify-runtime/gif-roundtrips';
  mkdirSync(folder, { recursive: true });
  for (const fixture of oracle) {
    const gif = decodeGif(new Uint8Array(readFileSync(`tests/fixtures/gif/${fixture.file}`)));
    writeFileSync(`${folder}/${fixture.file}`, encodeGifFrames(gif));
  }
  const outputs = JSON.parse(
    execFileSync('node', ['scripts/gif-fixtures/inspect-gifuct.mjs', ...oracle.map((f) => `${folder}/${f.file}`)], {
      maxBuffer: 5_000_000,
    }).toString(),
  );
  outputs.forEach((output: { loop: number | null; rawDelaysCs: number[]; hashes: string[] }, index: number) => {
    expect(output.loop, oracle[index].file).toBe(oracle[index].loop);
    expect(output.rawDelaysCs).toEqual(
      oracle[index].rawDelaysCs.map((delay) => (delay === null || delay < 2 ? 10 : delay)),
    );
    expect(output.hashes, oracle[index].file).toEqual(oracle[index].hashes);
  });
});

test('transparent frames after opaque frames do not inherit a black background', () => {
  const gif = decodeGif(new Uint8Array(readFileSync('tests/fixtures/gif/loop-finite.gif')));
  gif.frames[1].rgba.fill(0);
  const output = decodeGif(encodeGifFrames(gif));
  expect(output.frames[1].rgba.filter((_, index) => index % 4 === 3).every((value) => value === 0)).toBe(true);
});

test('measures compression and honestly reports an impossible target', () => {
  const original = new Uint8Array(readFileSync('tests/fixtures/gif/compressible.gif'));
  const gif = decodeGif(original);
  const result = compressGif(
    gif,
    original,
    { targetBytes: Math.floor(original.length * 0.8), allowResize: false },
    () => {},
  );
  expect(result.bytes.length).toBeLessThanOrEqual(original.length * 0.8);
  expect(result.targetMet).toBe(true);
  expect(decodeGif(result.bytes).duration).toBe(gif.duration);
  const impossible = compressGif(gif, original, { targetBytes: 1, allowResize: false }, () => {});
  expect(impossible.targetMet).toBe(false);
  expect(impossible.bytes.length).toBeLessThanOrEqual(original.length);
  expect(impossible.attempts).toBeLessThanOrEqual(12);
});

test('crop coordinates and transparent padding correspond to the selected region', () => {
  const gif = decodeGif(new Uint8Array(readFileSync('tests/fixtures/gif/crop-grid.gif')));
  const cropped = transformGif(gif, {
    left: 3,
    top: 2,
    cropWidth: 7,
    cropHeight: 5,
    width: 7,
    height: 5,
    fit: 'stretch',
  });
  cropped.frames.forEach((frame, index) => {
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 7; x++) {
        const original = ((y + 2) * gif.width + x + 3) * 4;
        expect([...frame.rgba.subarray((y * 7 + x) * 4, (y * 7 + x) * 4 + 4)]).toEqual([
          ...gif.frames[index].rgba.subarray(original, original + 4),
        ]);
      }
  });
  expect(() =>
    transformGif(gif, { left: 0, top: 0, cropWidth: 16, cropHeight: 12, width: 4096, height: 4096, fit: 'contain' }),
  ).toThrow(/memory/);
});

test('contain adds exact transparent bars without changing animation timing', () => {
  const source = decodeGif(new Uint8Array(readFileSync('tests/fixtures/gif/crop-grid.gif')));
  const result = decodeGif(
    encodeGifFrames(
      transformGif(source, { left: 0, top: 0, cropWidth: 16, cropHeight: 12, width: 32, height: 32, fit: 'contain' }),
    ),
  );
  expect(result.duration).toBe(source.duration);
  for (const frame of result.frames) {
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) expect(frame.rgba[(y * 32 + x) * 4 + 3]).toBe(y < 4 || y >= 28 ? 0 : 255);
  }
});
