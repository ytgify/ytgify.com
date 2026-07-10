import { GIFEncoder, applyPalette, quantize, type GifPalette } from 'gifenc';
import type { StudioExportProgress, StudioFrame } from '../types';

const paletteFormat = 'rgb565';
const stuckiWeights = [
  [1, 0, 8 / 42],
  [2, 0, 4 / 42],
  [-2, 1, 2 / 42],
  [-1, 1, 4 / 42],
  [0, 1, 8 / 42],
  [1, 1, 4 / 42],
  [2, 1, 2 / 42],
  [-2, 2, 1 / 42],
  [-1, 2, 2 / 42],
  [0, 2, 4 / 42],
  [1, 2, 2 / 42],
  [2, 2, 1 / 42],
] as const;

interface EncodeGifOptions {
  frames: StudioFrame[];
  width: number;
  height: number;
  fps: number;
  signal?: AbortSignal;
  onProgress?: (progress: StudioExportProgress) => void;
}

export async function encodeGif({
  frames,
  width,
  height,
  fps,
  signal,
  onProgress,
}: EncodeGifOptions): Promise<Blob> {
  if (frames.length === 0) {
    throw new Error('encoding_failed');
  }

  onProgress?.({
    stage: 'encoding',
    percentage: 50,
    message: 'Preparing GIF palette',
    totalFrames: frames.length,
  });

  const encoder = GIFEncoder();
  const palette = createGlobalPalette(frames);
  const delay = Math.round(1000 / fps);

  for (let index = 0; index < frames.length; index += 1) {
    if (signal?.aborted) throw new Error('cancelled');

    const pixels = frames[index].imageData.data;
    const framePalette = palette || createFramePalette(pixels);
    const indexedFrame = applyPaletteWithStuckiDither(pixels, framePalette, width, height);

    encoder.writeFrame(indexedFrame, width, height, {
      palette: framePalette,
      delay: frames[index].delay || delay,
      dispose: 2,
      first: index === 0,
      repeat: index === 0 ? 0 : undefined,
    });

    onProgress?.({
      stage: 'encoding',
      percentage: 50 + Math.round(((index + 1) / frames.length) * 45),
      message: `Encoding frame ${index + 1}/${frames.length}`,
      frameIndex: index + 1,
      totalFrames: frames.length,
    });

    if (index % 8 === 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
  }

  onProgress?.({
    stage: 'finalizing',
    percentage: 97,
    message: 'Finalizing GIF',
    totalFrames: frames.length,
  });

  encoder.finish();
  return new Blob([new Uint8Array(encoder.bytes())], { type: 'image/gif' });
}

function createGlobalPalette(frames: StudioFrame[]): GifPalette | null {
  const samples = frames.filter((_, index) => index % Math.max(1, Math.floor(frames.length / 5)) === 0).slice(0, 5);
  const totalLength = samples.reduce((sum, frame) => sum + frame.imageData.data.length, 0);
  const combined = new Uint8ClampedArray(totalLength);
  let offset = 0;

  for (const frame of samples) {
    combined.set(frame.imageData.data, offset);
    offset += frame.imageData.data.length;
  }

  try {
    const palette = quantize(combined, 256, { format: paletteFormat, clearAlpha: false });
    return palette.length > 0 ? palette : null;
  } catch {
    return null;
  }
}

function createFramePalette(pixels: Uint8ClampedArray): GifPalette {
  try {
    const palette = quantize(pixels, 256, { format: paletteFormat, clearAlpha: false });
    if (palette.length > 0) return palette;
  } catch {
    // Use fallback below.
  }

  return [[pixels[0] || 0, pixels[1] || 0, pixels[2] || 0], [0, 0, 0]];
}

function applyPaletteWithStuckiDither(
  pixels: Uint8ClampedArray,
  palette: GifPalette,
  width: number,
  height: number
): Uint8Array {
  if (palette.length <= 2) {
    return applyPalette(pixels, palette, paletteFormat);
  }

  const indexed = new Uint8Array(width * height);
  const rgb = new Float32Array(width * height * 3);
  const nearestCache = new Int16Array(65536);
  nearestCache.fill(-1);

  for (let pixelIndex = 0, rgbIndex = 0; pixelIndex < pixels.length; pixelIndex += 4, rgbIndex += 3) {
    rgb[rgbIndex] = pixels[pixelIndex];
    rgb[rgbIndex + 1] = pixels[pixelIndex + 1];
    rgb[rgbIndex + 2] = pixels[pixelIndex + 2];
  }

  for (let y = 0; y < height; y += 1) {
    const direction = y % 2 === 0 ? 1 : -1;
    const startX = direction === 1 ? 0 : width - 1;
    const endX = direction === 1 ? width : -1;

    for (let x = startX; x !== endX; x += direction) {
      const frameIndex = y * width + x;
      const rgbIndex = frameIndex * 3;
      const red = clampChannel(rgb[rgbIndex]);
      const green = clampChannel(rgb[rgbIndex + 1]);
      const blue = clampChannel(rgb[rgbIndex + 2]);
      const paletteIndex = nearestPaletteIndex(red, green, blue, palette, nearestCache);
      const color = palette[paletteIndex] || palette[0] || [0, 0, 0];

      indexed[frameIndex] = paletteIndex;

      const redError = red - (color[0] || 0);
      const greenError = green - (color[1] || 0);
      const blueError = blue - (color[2] || 0);

      for (const [offsetX, offsetY, weight] of stuckiWeights) {
        const targetX = x + offsetX * direction;
        const targetY = y + offsetY;

        if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
          continue;
        }

        const targetIndex = (targetY * width + targetX) * 3;
        rgb[targetIndex] += redError * weight;
        rgb[targetIndex + 1] += greenError * weight;
        rgb[targetIndex + 2] += blueError * weight;
      }
    }
  }

  return indexed;
}

function nearestPaletteIndex(
  red: number,
  green: number,
  blue: number,
  palette: GifPalette,
  cache: Int16Array
): number {
  const key = ((red >> 3) << 11) | ((green >> 2) << 5) | (blue >> 3);
  const cached = cache[key];
  if (cached >= 0) return cached;

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < palette.length; index += 1) {
    const color = palette[index] || [0, 0, 0];
    const redDelta = red - (color[0] || 0);
    const greenDelta = green - (color[1] || 0);
    const blueDelta = blue - (color[2] || 0);
    const distance = redDelta * redDelta + greenDelta * greenDelta + blueDelta * blueDelta;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  cache[key] = bestIndex;
  return bestIndex;
}

function clampChannel(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}
