import { renderCaptions } from './captions';
import type { StudioCaptionSettings, StudioExportProgress, StudioFrame, StudioTrimSelection } from './types';

const SEEK_TIMEOUT_MS = 5000;
const SEEK_POLL_INTERVAL_MS = 25;
const SEEK_READY_TOLERANCE_SECONDS = 0.075;
const DUPLICATE_SAMPLE_STRIDE = 64;
const DUPLICATE_DELTA_THRESHOLD = 2.5;
const MAX_SUSPICIOUS_DUPLICATES = 4;

interface ExtractFramesOptions {
  video: HTMLVideoElement;
  trim: StudioTrimSelection;
  fps: number;
  width: number;
  height: number;
  captions: StudioCaptionSettings;
  signal?: AbortSignal;
  onProgress?: (progress: StudioExportProgress) => void;
}

export async function extractVideoFrames({
  video,
  trim,
  fps,
  width,
  height,
  captions,
  signal,
  onProgress,
}: ExtractFramesOptions): Promise<StudioFrame[]> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('canvas_failed');
  }

  const totalFrames = Math.max(1, Math.ceil(trim.duration * fps));
  const frameDelay = Math.round(1000 / fps);
  const frames: StudioFrame[] = [];
  const originalTime = video.currentTime;
  const wasPaused = video.paused;
  let previousFrame: ImageData | null = null;
  let consecutiveSuspiciousDuplicates = 0;

  video.pause();

  try {
    for (let index = 0; index < totalFrames; index += 1) {
      if (signal?.aborted) throw new Error('cancelled');

      const frameTime = Math.min(trim.endTime, trim.startTime + index / fps);
      const seekResult = await seekVideo(video, frameTime, signal);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);
      renderCaptions(ctx, captions, width, height);
      let imageData = ctx.getImageData(0, 0, width, height);

      if (previousFrame && isSuspiciousDuplicate(previousFrame, imageData, seekResult.actualTime, frameTime)) {
        consecutiveSuspiciousDuplicates += 1;

        if (consecutiveSuspiciousDuplicates >= MAX_SUSPICIOUS_DUPLICATES) {
          throw new Error('extraction_timeout');
        }

        const recoveredFrame = await recoverDuplicateFrame({
          video,
          ctx,
          captions,
          width,
          height,
          frameTime,
          previousFrame,
          signal,
        });

        if (recoveredFrame) {
          imageData = recoveredFrame;
          consecutiveSuspiciousDuplicates = 0;
        }
      } else {
        consecutiveSuspiciousDuplicates = 0;
      }

      frames.push({
        imageData,
        delay: frameDelay,
      });
      previousFrame = imageData;

      onProgress?.({
        stage: 'capturing',
        percentage: Math.round(((index + 1) / totalFrames) * 45),
        message: `Captured ${index + 1}/${totalFrames} frames`,
        frameIndex: index + 1,
        totalFrames,
      });
    }
  } finally {
    try {
      video.currentTime = originalTime;
      if (!wasPaused) {
        await video.play().catch(() => undefined);
      }
    } catch {
      // Restoring preview state is best-effort after export/cancel.
    }
  }

  return frames;
}

interface SeekResult {
  actualTime: number;
}

async function seekVideo(video: HTMLVideoElement, time: number, signal?: AbortSignal): Promise<SeekResult> {
  if (Math.abs(video.currentTime - time) < 0.035 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return { actualTime: video.currentTime };
  }

  const startedAt = performance.now();
  const targets = [time, Math.min(video.duration || time, time + 0.001), Math.max(0, time - 0.05)];
  let lastError: Error | null = null;

  for (const target of targets) {
    if (signal?.aborted) throw new Error('cancelled');
    const remainingMs = SEEK_TIMEOUT_MS - (performance.now() - startedAt);
    if (remainingMs <= 0) break;

    try {
      return await seekOnce(video, target, time, Math.max(250, remainingMs), signal);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('extraction_timeout');
      if (lastError.message === 'cancelled' || lastError.message === 'decode_failed') {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('extraction_timeout');
}

async function seekOnce(
  video: HTMLVideoElement,
  seekTarget: number,
  desiredTime: number,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<SeekResult> {
  const startedAt = performance.now();

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let pollId = 0;

    const timeout = window.setTimeout(() => {
      rejectSeek(new Error('extraction_timeout'));
    }, timeoutMs);

    const cleanup = () => {
      window.clearTimeout(timeout);
      if (pollId) window.clearTimeout(pollId);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
    };

    const resolveReady = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const rejectSeek = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const pollReady = () => {
      if (signal?.aborted) {
        rejectSeek(new Error('cancelled'));
        return;
      }

      if (canRenderFrame(video, desiredTime)) {
        resolveReady();
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        rejectSeek(new Error('extraction_timeout'));
        return;
      }

      pollId = window.setTimeout(pollReady, SEEK_POLL_INTERVAL_MS);
    };

    const onSeeked = () => {
      if (canRenderFrame(video, desiredTime)) {
        resolveReady();
        return;
      }

      pollReady();
    };

    const onError = () => {
      rejectSeek(new Error('decode_failed'));
    };

    const onAbort = () => {
      rejectSeek(new Error('cancelled'));
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });

    video.currentTime = seekTarget;
    pollReady();
  });

  await delay(video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? 25 : 80, signal);
  return { actualTime: video.currentTime };
}

function canRenderFrame(video: HTMLVideoElement, targetTime: number): boolean {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return false;
  if (Math.abs(video.currentTime - targetTime) > SEEK_READY_TOLERANCE_SECONDS) return false;

  return isBuffered(video, video.currentTime) || video.buffered.length === 0;
}

function isBuffered(video: HTMLVideoElement, time: number): boolean {
  for (let index = 0; index < video.buffered.length; index += 1) {
    if (video.buffered.start(index) <= time && video.buffered.end(index) >= time) {
      return true;
    }
  }

  return false;
}

function isSuspiciousDuplicate(previous: ImageData, next: ImageData, actualTime: number, targetTime: number): boolean {
  if (Math.abs(actualTime - targetTime) <= SEEK_READY_TOLERANCE_SECONDS) return false;
  return averagePixelDelta(previous, next) <= DUPLICATE_DELTA_THRESHOLD;
}

async function recoverDuplicateFrame({
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

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new Error('cancelled');

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const cleanup = () => {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new Error('cancelled'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
