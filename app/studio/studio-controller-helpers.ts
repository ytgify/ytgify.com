import { studioDurationBucket, studioFileSizeBucket, trackStudioEvent } from '@/lib/studio/analytics';
import { STUDIO_MAX_EXPORT_DURATION_SECONDS } from '@/lib/studio/constants';
import { formatTime } from '@/lib/studio/presets';
import type {
  StudioError,
  StudioExportResult,
  StudioOutputSettings,
  StudioStatus,
  StudioTrimSelection,
  StudioVideoMetadata,
  StudioSizeTarget,
} from '@/lib/studio/types';
import { sizeTargetOutcome } from '@/lib/studio/size-target';

export function isValidExport(
  status: StudioStatus,
  metadata: StudioVideoMetadata | null,
  trim: StudioTrimSelection | null,
) {
  return (
    status === 'editing' &&
    Boolean(metadata) &&
    Boolean(trim) &&
    Number.isFinite(trim?.startTime) &&
    Number.isFinite(trim?.endTime) &&
    Number.isFinite(trim?.duration) &&
    (trim?.duration || 0) > 0 &&
    (trim?.duration || 0) <= STUDIO_MAX_EXPORT_DURATION_SECONDS
  );
}

export function getOutputSummary(
  metadata: StudioVideoMetadata | null,
  trim: StudioTrimSelection | null,
  settings: StudioOutputSettings,
) {
  if (!metadata || !trim) return null;
  return `${formatTime(trim.duration)} at ${settings.fps} FPS, max ${settings.resolution}p, browser GIF encoder`;
}

export function getSizeTargetLabel(target: StudioSizeTarget): string {
  return target === 'auto' ? 'No target' : `Aim for ${target} MB`;
}

export function trackExportStarted(
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  settings: StudioOutputSettings,
  captions: boolean,
) {
  trackStudioEvent('studio_export_started', {
    size_target: settings.sizeTarget,
    source_duration_bucket: studioDurationBucket(metadata.duration),
    output_duration: trim.duration,
    output_fps: settings.fps,
    output_resolution: settings.resolution,
    output_encoder: 'gifenc',
    captions_enabled: captions,
  });
}

export function trackExportSucceeded(
  exported: Omit<StudioExportResult, 'url'>,
  settings: StudioOutputSettings,
  captions: boolean,
) {
  trackStudioEvent('studio_export_succeeded', {
    size_target: settings.sizeTarget,
    size_target_outcome: sizeTargetOutcome(exported.fileSize, settings.sizeTarget),
    output_duration: exported.duration,
    output_fps: settings.fps,
    output_resolution: settings.resolution,
    output_encoder: exported.encoder,
    captions_enabled: captions,
    output_file_size_bucket: studioFileSizeBucket(exported.fileSize),
  });
}

export function trackExportFailed(
  error: StudioError,
  trim: StudioTrimSelection,
  settings: StudioOutputSettings,
  captions: boolean,
) {
  trackStudioEvent('studio_export_failed', {
    size_target: settings.sizeTarget,
    error_code: error.code,
    output_duration: trim.duration,
    output_fps: settings.fps,
    output_resolution: settings.resolution,
    output_encoder: 'gifenc',
    captions_enabled: captions,
  });
}
