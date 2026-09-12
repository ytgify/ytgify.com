import { ssim } from 'ssim.js';
import type { DecodedGif } from './types';

export function gifQuality(source: DecodedGif, output: DecodedGif): { mean: number; minimum: number } {
  if (source.width !== output.width || source.height !== output.height || source.duration !== output.duration) {
    return { mean: 0, minimum: 0 };
  }
  let weighted = 0;
  let minimum = 1;
  let outputIndex = 0;
  let outputEnd = output.frames[0].delay;
  let sourceStart = 0;
  for (let i = 0; i < source.frames.length; i++) {
    while (sourceStart >= outputEnd && outputIndex + 1 < output.frames.length)
      outputEnd += output.frames[++outputIndex].delay;
    let score = 1;
    for (const matte of [0, 255]) {
      const a = flatten(source.frames[i].rgba, matte);
      const b = flatten(output.frames[outputIndex].rgba, matte);
      // Evaluate every color channel, not only luminance: chroma damage can hide in a grayscale score.
      for (const channel of [0, 1, 2]) {
        const ac = singleChannel(a, channel);
        const bc = singleChannel(b, channel);
        const value =
          source.width < 11 || source.height < 11
            ? Number(ac.every((pixel, index) => pixel === bc[index]))
            : ssim(
                { data: ac, width: source.width, height: source.height },
                { data: bc, width: output.width, height: output.height },
                { downsample: 'original' },
              ).mssim;
        score = Math.min(score, value);
      }
    }
    minimum = Math.min(minimum, score);
    weighted += score * source.frames[i].delay;
    sourceStart += source.frames[i].delay;
  }
  return { mean: weighted / source.duration, minimum };
}

function flatten(rgba: Uint8ClampedArray, matte: number): Uint8ClampedArray {
  const result = rgba.slice();
  for (let i = 0; i < result.length; i += 4) {
    const alpha = rgba[i + 3] / 255;
    for (let channel = 0; channel < 3; channel++)
      result[i + channel] = Math.round(rgba[i + channel] * alpha + matte * (1 - alpha));
    result[i + 3] = 255;
  }
  return result;
}

function singleChannel(data: Uint8ClampedArray, channel: number) {
  const result = data.slice();
  for (let i = 0; i < result.length; i += 4) result[i] = result[i + 1] = result[i + 2] = data[i + channel];
  return result;
}
