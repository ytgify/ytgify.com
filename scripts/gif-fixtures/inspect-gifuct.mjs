// Independent fixture inspection adapter; never imported by production code.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseGIF, decompressFrames } from 'gifuct-js';

function inspect(file) {
  const bytes = readFileSync(file);
  const parsed = parseGIF(Uint8Array.from(bytes).buffer);
  const { width, height } = parsed.lsd;
  if (width * height > 4096 * 4096) throw new Error('Unsafe fixture canvas');
  const frames = decompressFrames(parsed, true);
  const raw = parsed.frames.filter((frame) => frame.image);
  const application = parsed.frames.find((frame) => frame.application?.id === 'NETSCAPE2.0')?.application;
  const loop = application ? application.blocks[1] + 256 * application.blocks[2] : null;
  const background = parsed.gct?.[parsed.lsd.backgroundColorIndex] ?? [0, 0, 0];
  const surface = new Uint8Array(width * height * 4);
  const transparent = frames[0]?.transparentIndex !== undefined;
  for (let i = 0; i < surface.length; i += 4) surface.set([...background, transparent ? 0 : 255], i);
  const hashes = [];
  for (const frame of frames) {
    const before = surface.slice();
    const { left, top, width: fw, height: fh } = frame.dims;
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const offset = (y * fw + x) * 4;
        if (frame.patch[offset + 3])
          surface.set(frame.patch.subarray(offset, offset + 4), ((y + top) * width + x + left) * 4);
      }
    }
    const visible = surface.slice();
    for (let i = 0; i < visible.length; i += 4) if (!visible[i + 3]) visible.fill(0, i, i + 3);
    hashes.push(createHash('sha256').update(visible).digest('hex'));
    if (frame.disposalType === 2) {
      for (let y = top; y < top + fh; y++) {
        for (let x = left; x < left + fw; x++) {
          surface.set([...background, frame.transparentIndex === undefined ? 255 : 0], (y * width + x) * 4);
        }
      }
    } else if (frame.disposalType === 3) surface.set(before);
  }
  return {
    file,
    width,
    height,
    bytes: bytes.length,
    loop,
    rawDelaysCs: raw.map((frame) => frame.gce?.delay ?? null),
    hashes,
  };
}

console.log(JSON.stringify(process.argv.slice(2).map(inspect)));
