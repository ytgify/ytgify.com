import { applyPalette, quantize, type GifPalette } from 'gifenc';

export function indexFrame(rgba: Uint8ClampedArray, maxColors = 256, forceTransparent = false) {
  let transparent = forceTransparent;
  for (let i = 3; i < rgba.length; i += 4)
    if (rgba[i] < 128) {
      transparent = true;
      break;
    }
  const exact = exactPalette(rgba, maxColors, transparent);
  if (exact) return { ...exact, transparent };
  const palette = quantize(rgba, maxColors - (transparent ? 1 : 0), { format: 'rgb565' });
  const indexed = applyPalette(rgba, palette, 'rgb565');
  if (transparent) {
    palette.unshift([0, 0, 0]);
    for (let i = 0; i < indexed.length; i++) indexed[i] = rgba[i * 4 + 3] < 128 ? 0 : indexed[i] + 1;
  }
  return { palette, indexed, transparent };
}

function exactPalette(rgba: Uint8ClampedArray, maxColors: number, transparent: boolean) {
  const palette: GifPalette = transparent ? [[0, 0, 0]] : [];
  const colors = new Map<number, number>();
  const indexed = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < rgba.length; i += 4) {
    if (transparent && rgba[i + 3] < 128) continue;
    const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    let index = colors.get(key);
    if (index === undefined) {
      if (palette.length >= maxColors) return null;
      index = palette.length;
      colors.set(key, index);
      palette.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
    indexed[i / 4] = index;
  }
  return { palette, indexed };
}
