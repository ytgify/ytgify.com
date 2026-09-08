import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseGIF, decompressFrames } from 'gifuct-js';

/** Verify the fixed visual-timeline recipe: 1.1–4.1 seconds, 5 FPS, 240p. */
export function verifySavedGif(file, captions) {
  assert(['plain', 'captioned'].includes(captions), 'Caption mode must be plain or captioned');
  const bytes = readFileSync(file);
  assert.equal(bytes.subarray(0, 6).toString(), 'GIF89a', 'GIF header');
  assert.equal(bytes.at(-1), 0x3b, 'Complete GIF trailer');
  const gif = parseGIF(Uint8Array.from(bytes).buffer);
  assert.deepEqual([gif.lsd.width, gif.lsd.height], [320, 240], 'Output dimensions');
  const frames = decompressFrames(gif, true);
  assert.equal(frames.length, 15, 'Frame count');
  assert.equal(
    frames.reduce((sum, frame) => sum + frame.delay, 0),
    3000,
    'Duration in ms',
  );
  const colors = [
    [180, 40, 40],
    [40, 160, 40],
    [40, 40, 180],
    [180, 120, 30],
    [140, 40, 160],
    [30, 140, 160],
  ];
  const rows = frames.map((frame, index) => {
    assert.equal(frame.delay, 200, `Frame delay at output ${index}`);
    assert.deepEqual(frame.dims, { left: 0, top: 0, width: 320, height: 240 }, 'Full frame');
    const pixel = (x, y) => frame.patch.subarray((y * 320 + x) * 4, (y * 320 + x) * 4 + 4);
    const id = Array.from({ length: 6 }, (_, bit) => (pixel(32 + bit * 48, 110)[0] > 128 ? 1 << bit : 0)).reduce(
      (a, b) => a + b,
      0,
    );
    assert(Math.abs(id - (11 + index * 2)) <= 1, `Unexpected source frame ${id} at output ${index}`);
    const sample = pixel(8, 170);
    colors[Math.floor(id / 10)].forEach((value, channel) => {
      assert(Math.abs(sample[channel] - value) < 25, `Background mismatch at output ${index}`);
    });
    assert.equal(sample[3], 255, 'Opaque background');
    const ink = [10, 180].map((startY) => {
      let count = 0;
      for (let y = startY; y < startY + 50; y++)
        for (let x = 50; x < 270; x++) {
          const rgba = pixel(x, y);
          if (rgba[0] > 210 && rgba[1] > 210 && rgba[2] > 210 && rgba[3] === 255) count++;
        }
      assert(captions === 'plain' ? count === 0 : count > 100, `Caption mismatch at output ${index}, y=${startY}`);
      return count;
    });
    return { sourceFrame: id, delayMs: frame.delay, topInk: ink[0], bottomInk: ink[1] };
  });
  rows.slice(1).forEach((row, index) => assert(row.sourceFrame > rows[index].sourceFrame, 'Frozen/reversed frames'));
  return {
    file,
    captions,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    durationMs: 3000,
    frames: rows,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assert.equal(process.argv.length, 4, 'Usage: node scripts/ios/verify-saved-gif.mjs FILE plain|captioned');
    console.log(JSON.stringify(verifySavedGif(process.argv[2], process.argv[3]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
