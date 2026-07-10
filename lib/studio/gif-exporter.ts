import { hasCaptions } from './captions';
import { encodeGif } from './encoders/gifenc-encoder';
import { encodeGifWithGifski } from './encoders/gifski-encoder';
import { extractVideoFrames } from './frame-extractor';
import { calculateOutputDimensions } from './resolution';
import type {
  StudioCaptionSettings,
  StudioExportProgress,
  StudioExportResult,
  StudioEncoderUsed,
  StudioOutputSettings,
  StudioTrimSelection,
  StudioVideoMetadata,
} from './types';

interface ExportStudioGifOptions {
  video: HTMLVideoElement;
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  settings: StudioOutputSettings;
  captions: StudioCaptionSettings;
  signal?: AbortSignal;
  onProgress?: (progress: StudioExportProgress) => void;
}

export async function exportStudioGif({
  video,
  metadata,
  trim,
  settings,
  captions,
  signal,
  onProgress,
}: ExportStudioGifOptions): Promise<Omit<StudioExportResult, 'url'>> {
  const dimensions = calculateOutputDimensions(metadata.width, metadata.height, settings.resolution);

  onProgress?.({
    stage: 'preparing',
    percentage: 5,
    message: 'Preparing video frames',
  });

  const frames = await extractVideoFrames({
    video,
    trim,
    fps: settings.fps,
    width: dimensions.width,
    height: dimensions.height,
    captions,
    signal,
    onProgress,
  });

  if (hasCaptions(captions)) {
    onProgress?.({
      stage: 'captions',
      percentage: 48,
      message: 'Captions applied to frames',
      totalFrames: frames.length,
    });
  }

  const { blob, encoder, encoderFallback } = await encodeWithSelectedEncoder({
    frames,
    width: dimensions.width,
    height: dimensions.height,
    fps: settings.fps,
    encoderMode: settings.encoder,
    signal,
    onProgress,
  });

  onProgress?.({
    stage: 'complete',
    percentage: 100,
    message: 'GIF ready',
    totalFrames: frames.length,
  });

  return {
    blob,
    fileSize: blob.size,
    width: dimensions.width,
    height: dimensions.height,
    duration: trim.duration,
    frameCount: frames.length,
    encoder,
    encoderFallback,
  };
}

interface EncodeSelectedOptions {
  frames: Parameters<typeof encodeGif>[0]['frames'];
  width: number;
  height: number;
  fps: number;
  encoderMode: StudioOutputSettings['encoder'];
  signal?: AbortSignal;
  onProgress?: (progress: StudioExportProgress) => void;
}

async function encodeWithSelectedEncoder({
  frames,
  width,
  height,
  fps,
  encoderMode,
  signal,
  onProgress,
}: EncodeSelectedOptions): Promise<{ blob: Blob; encoder: StudioEncoderUsed; encoderFallback?: boolean }> {
  if (encoderMode === 'quality') {
    try {
      const blob = await encodeGifWithGifski({ frames, width, height, fps, signal, onProgress });
      return { blob, encoder: 'gifski' };
    } catch (error) {
      if (signal?.aborted || error instanceof Error && error.message === 'cancelled') {
        throw new Error('cancelled');
      }

      onProgress?.({
        stage: 'encoding',
        percentage: 50,
        message: 'High-quality encoder unavailable, using fast fallback',
        totalFrames: frames.length,
      });
    }
  }

  const blob = await encodeGif({ frames, width, height, fps, signal, onProgress });
  return { blob, encoder: 'gifenc', encoderFallback: encoderMode === 'quality' ? true : undefined };
}
