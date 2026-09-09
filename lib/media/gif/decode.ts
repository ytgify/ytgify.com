import { parseGif } from './parse';
import { decodeLzw } from './lzw';
import { GifError, type DecodedGif, type GifPatch } from './types';

export function decodeGif(bytes: Uint8Array, progress?: (percentage: number) => void): DecodedGif {
  const { patches, ...metadata } = parseGif(bytes);
  const surface = new Uint8ClampedArray(metadata.width * metadata.height * 4);
  const background = [...metadata.background, patches[0].transparent === null ? 255 : 0];
  for (let i = 0; i < surface.length; i += 4) surface.set(background, i);
  const frames = patches.map((patch, index) => {
    const previous = patch.disposal === 3 ? surface.slice() : null;
    const pixels = decodeLzw(patch.chunks, patch.minimumCodeSize, patch.width * patch.height);
    paint(surface, metadata.width, patch, pixels);
    const rgba = surface.slice();
    if (patch.disposal === 3 && previous) surface.set(previous);
    if (patch.disposal === 2) {
      const clear = [...metadata.background, patch.transparent === null ? 255 : 0];
      for (let y = patch.top; y < patch.top + patch.height; y++) {
        for (let x = patch.left; x < patch.left + patch.width; x++) surface.set(clear, (y * metadata.width + x) * 4);
      }
    }
    progress?.(Math.round(((index + 1) / patches.length) * 100));
    return { rgba, delay: patch.delay };
  });
  return { ...metadata, frames };
}

function paint(surface: Uint8ClampedArray, canvasWidth: number, patch: GifPatch, pixels: Uint8Array): void {
  const rows: number[] = [];
  const passes = patch.interlaced
    ? [
        [0, 8],
        [4, 8],
        [2, 4],
        [1, 2],
      ]
    : [[0, 1]];
  for (const [start, step] of passes) for (let y = start; y < patch.height; y += step) rows.push(y);
  for (let sourceY = 0; sourceY < patch.height; sourceY++) {
    for (let x = 0; x < patch.width; x++) {
      const value = pixels[sourceY * patch.width + x];
      if (value === patch.transparent) continue;
      if (value * 3 + 2 >= patch.palette.length)
        throw new GifError('invalid_gif', 'The GIF contains an invalid color index.');
      surface.set(
        [...patch.palette.subarray(value * 3, value * 3 + 3), 255],
        ((rows[sourceY] + patch.top) * canvasWidth + x + patch.left) * 4,
      );
    }
  }
}
