import type { StudioExportProgress, StudioFrame } from '../types';

interface EncodeGifskiOptions {
  frames: StudioFrame[];
  width: number;
  height: number;
  fps: number;
  signal?: AbortSignal;
  onProgress?: (progress: StudioExportProgress) => void;
}

export async function encodeGifWithGifski({
  frames,
  width,
  height,
  fps,
  signal,
  onProgress,
}: EncodeGifskiOptions): Promise<Blob> {
  if (frames.length < 2) {
    throw new Error('encoding_failed');
  }

  if (signal?.aborted) throw new Error('cancelled');

  onProgress?.({
    stage: 'encoding',
    percentage: 50,
    message: 'Loading high-quality encoder',
    totalFrames: frames.length,
  });

  const gifski = await import('gifski-wasm');
  if (signal?.aborted) throw new Error('cancelled');

  await gifski.init();
  if (signal?.aborted) throw new Error('cancelled');

  onProgress?.({
    stage: 'encoding',
    percentage: 58,
    message: 'Encoding GIF with gifski',
    totalFrames: frames.length,
  });

  const gifData = await gifski.default({
    frames: frames.map((frame) => frame.imageData),
    width,
    height,
    fps,
    quality: 100,
    repeat: 0,
  });

  if (signal?.aborted) throw new Error('cancelled');

  onProgress?.({
    stage: 'finalizing',
    percentage: 97,
    message: 'Finalizing high-quality GIF',
    totalFrames: frames.length,
  });

  return new Blob([new Uint8Array(gifData)], { type: 'image/gif' });
}
