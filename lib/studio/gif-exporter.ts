import { hasCaptions } from './captions';
import { encodeGif } from './encoders/gifenc-encoder';
import { calculateExportBudget } from './export-budget';
import { extractVideoFrames } from './frame-extractor';
import { calculateOutputDimensions } from './resolution';
import type {
  StudioCaptionSettings,
  StudioExportProgress,
  StudioExportResult,
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
  if (!calculateExportBudget(metadata, trim, settings).allowed) throw new Error('memory_limit');
  onProgress?.({ stage: 'preparing', percentage: 5, message: 'Preparing video frames' });

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

  const blob = await encodeGif({
    frames,
    width: dimensions.width,
    height: dimensions.height,
    fps: settings.fps,
    signal,
    onProgress,
  });

  onProgress?.({ stage: 'complete', percentage: 100, message: 'GIF ready', totalFrames: frames.length });
  return {
    blob,
    fileSize: blob.size,
    width: dimensions.width,
    height: dimensions.height,
    duration: trim.duration,
    frameCount: frames.length,
    encoder: 'gifenc',
  };
}
