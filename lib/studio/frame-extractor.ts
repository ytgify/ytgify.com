import { renderCaptions } from './captions';
import { isSuspiciousDuplicate, recoverDuplicateFrame } from './frame-quality';
import { seekVideo } from './frame-seeking';
import { createFrameTiming } from './frame-timing';
import { prepareVideo } from './prepare-video';
import type { StudioCaptionSettings, StudioExportProgress, StudioFrame, StudioTrimSelection } from './types';

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

  const timing = createFrameTiming(trim.duration, fps);
  const totalFrames = timing.length;
  const frames: StudioFrame[] = [];
  const originalTime = video.currentTime;
  let previousFrame: ImageData | null = null;
  let consecutiveSuspiciousDuplicates = 0;

  video.pause();

  try {
    await prepareVideo(video, signal);
    for (let index = 0; index < totalFrames; index += 1) {
      if (signal?.aborted) throw new Error('cancelled');

      const frameTime = Math.min(trim.endTime, trim.startTime + timing[index].time);
      const seekResult = await seekVideo(video, frameTime, signal);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);
      renderCaptions(ctx, captions, width, height);
      let imageData = ctx.getImageData(0, 0, width, height);
      if (signal?.aborted) throw new Error('cancelled');

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

      if (signal?.aborted) throw new Error('cancelled');

      frames.push({
        imageData,
        delay: timing[index].delay,
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
      video.pause();
    } catch {
      // Restoring preview state is best-effort after export/cancel.
    }
  }

  return frames;
}
