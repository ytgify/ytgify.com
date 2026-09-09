import { decodeGif } from './decode';
import { encodeGifFrames } from './encode';
import { transformGif } from './geometry';
import { gifQuality } from './quality';
import { sampleGifFrames } from './sample';
import { GifError, MAX_WORKSPACE, type DecodedGif } from './types';

export interface CompressionOptions {
  targetBytes: number;
  allowResize: boolean;
  allowFrameReduction?: boolean;
}

export interface CompressionResult {
  bytes: Uint8Array;
  width: number;
  height: number;
  mean: number;
  minimum: number;
  attempts: number;
  targetMet: boolean;
  frameCount: number;
}

export function compressGif(
  gif: DecodedGif,
  original: Uint8Array,
  options: CompressionOptions,
  progress: (value: number) => void,
): CompressionResult {
  if (!Number.isSafeInteger(options.targetBytes) || options.targetBytes < 1 || options.targetBytes > 25_000_000)
    throw new Error('Enter a target between 1 byte and 25 MB.');
  let best: CompressionResult = {
    bytes: original,
    width: gif.width,
    height: gif.height,
    mean: 1,
    minimum: 1,
    attempts: 0,
    targetMet: original.length <= options.targetBytes,
    frameCount: gif.frames.length,
  };
  // Preserve normalization/unsupported metadata decisions by encoding even already-small inputs when needed.
  if (best.targetMet && !gif.normalizedTiming) return best;
  const started = performance.now();
  const scales = options.allowResize ? [1, 0.75, 0.5] : [1];
  let attempts = 0;
  for (const scale of scales) {
    const width = Math.max(1, Math.round(gif.width * scale));
    const height = Math.max(1, Math.round(gif.height * scale));
    const candidateCanvas = width * height * 4;
    // Reference/candidate pixels plus channel SSIM matrices and encoder scratch. Keep the original as a safe fallback.
    if (gif.estimatedWorkspace + candidateCanvas * (gif.frames.length * 2 + 24) > MAX_WORKSPACE) continue;
    const reference =
      scale === 1
        ? gif
        : transformGif(gif, {
            left: 0,
            top: 0,
            cropWidth: gif.width,
            cropHeight: gif.height,
            width,
            height,
            fit: 'stretch',
          });
    const candidates = options.allowFrameReduction
      ? [
          { colors: 256, sample: false },
          { colors: 128, sample: false },
          { colors: 256, sample: true },
          { colors: 128, sample: true },
        ]
      : [256, 128, 64, 32].map((colors) => ({ colors, sample: false }));
    for (const { colors, sample } of candidates) {
      if (performance.now() - started > 60_000) return { ...best, attempts };
      const bytes = encodeGifFrames(sample ? sampleGifFrames(reference) : reference, colors);
      if (bytes.length > 25_000_000) {
        attempts++;
        continue;
      }
      let decoded;
      try {
        decoded = decodeGif(bytes);
      } catch (error) {
        if (error instanceof GifError && error.code === 'memory_limit') {
          attempts++;
          continue;
        }
        throw error;
      }
      const quality = gifQuality(reference, decoded);
      attempts++;
      progress(Math.round((attempts / (scales.length * 4)) * 100));
      if (quality.mean >= 0.98 && quality.minimum >= 0.95 && bytes.length < best.bytes.length) {
        best = {
          bytes,
          width: reference.width,
          height: reference.height,
          ...quality,
          attempts,
          targetMet: bytes.length <= options.targetBytes,
          frameCount: decoded.frames.length,
        };
        if (best.targetMet) return best;
      }
    }
  }
  return { ...best, attempts };
}
