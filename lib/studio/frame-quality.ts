import { renderCaptions } from './captions';
import { seekVideo } from './frame-seeking';
import type { StudioCaptionSettings } from './types';

const SEEK_READY_TOLERANCE_SECONDS = 0.075;
const DUPLICATE_SAMPLE_STRIDE = 64;
const DUPLICATE_DELTA_THRESHOLD = 2.5;

export function isSuspiciousDuplicate(
  previous: ImageData,
  next: ImageData,
  actualTime: number,
  targetTime: number,
): boolean {
  if (Math.abs(actualTime - targetTime) <= SEEK_READY_TOLERANCE_SECONDS) return false;
  return averagePixelDelta(previous, next) <= DUPLICATE_DELTA_THRESHOLD;
}

export async function recoverDuplicateFrame({
  video,
  ctx,
  captions,
  width,
  height,
  frameTime,
  previousFrame,
  signal,
}: {
  video: HTMLVideoElement;
  ctx: CanvasRenderingContext2D;
  captions: StudioCaptionSettings;
  width: number;
  height: number;
  frameTime: number;
  previousFrame: ImageData;
  signal?: AbortSignal;
}): Promise<ImageData | null> {
  const recoveryTargets = [frameTime + 0.01, frameTime, Math.max(0, frameTime - 0.05)];

  for (const recoveryTarget of recoveryTargets) {
    if (signal?.aborted) throw new Error('cancelled');

    try {
      const seekResult = await seekVideo(video, Math.min(video.duration || recoveryTarget, recoveryTarget), signal);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);
      renderCaptions(ctx, captions, width, height);
      const recovered = ctx.getImageData(0, 0, width, height);

      if (!isSuspiciousDuplicate(previousFrame, recovered, seekResult.actualTime, frameTime)) {
        return recovered;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'cancelled') {
        throw error;
      }
    }
  }

  return null;
}

function averagePixelDelta(previous: ImageData, next: ImageData): number {
  const previousPixels = previous.data;
  const nextPixels = next.data;
  const maxLength = Math.min(previousPixels.length, nextPixels.length);
  let totalDelta = 0;
  let samples = 0;

  for (let index = 0; index < maxLength; index += DUPLICATE_SAMPLE_STRIDE * 4) {
    totalDelta += Math.abs(previousPixels[index] - nextPixels[index]);
    totalDelta += Math.abs(previousPixels[index + 1] - nextPixels[index + 1]);
    totalDelta += Math.abs(previousPixels[index + 2] - nextPixels[index + 2]);
    samples += 3;
  }

  return samples > 0 ? totalDelta / samples : Number.POSITIVE_INFINITY;
}
