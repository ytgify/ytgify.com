import { calculateOutputDimensions } from './resolution';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from './types';

export const STUDIO_FRAME_MEMORY_BUDGET_BYTES = 80 * 1024 * 1024;

export interface StudioExportBudget {
  allowed: boolean;
  estimatedBytes: number;
  estimatedMegabytes: number;
  frameCount: number;
  width: number;
  height: number;
}

export function calculateExportBudget(
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  settings: StudioOutputSettings,
): StudioExportBudget {
  const { width, height } = calculateOutputDimensions(metadata.width, metadata.height, settings.resolution);
  const frameCount = Math.max(1, Math.ceil(trim.duration * settings.fps));
  const estimatedBytes = width * height * 4 * frameCount;

  return {
    allowed: estimatedBytes <= STUDIO_FRAME_MEMORY_BUDGET_BYTES,
    estimatedBytes,
    estimatedMegabytes: Math.ceil(estimatedBytes / (1024 * 1024)),
    frameCount,
    width,
    height,
  };
}
