import { STUDIO_FPS_OPTIONS, STUDIO_RESOLUTION_OPTIONS } from './constants';
import { calculateExportBudget } from './export-budget';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from './types';

// GIF compression depends on motion, detail, dithering, and captions. This is a
// planning range per indexed pixel, not a measured sample or a guaranteed cap.
export function estimateGifSize(
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  settings: StudioOutputSettings,
) {
  const { width, height, frameCount } = calculateExportBudget(metadata, trim, settings);
  const pixels = width * height * frameCount;
  return { low: pixels * 0.3 + 1024, high: pixels * 1.2 + 1024 };
}

export function chooseSettingsForTarget(
  metadata: StudioVideoMetadata | null,
  trim: StudioTrimSelection | null,
  settings: StudioOutputSettings,
): StudioOutputSettings {
  if (!metadata?.duration || !trim || settings.sizeTarget === 'auto') return settings;
  const targetBytes = settings.sizeTarget * 1024 * 1024;
  const candidates = STUDIO_RESOLUTION_OPTIONS.flatMap((resolution) =>
    STUDIO_FPS_OPTIONS.map((fps) => ({ ...settings, resolution, fps })),
  );
  const safe = candidates.filter((candidate) => calculateExportBudget(metadata, trim, candidate).allowed);
  // Favor detail first, then motion. Never offer a combination over the memory budget.
  safe.sort((a, b) => b.resolution - a.resolution || b.fps - a.fps);
  return (
    safe.find((candidate) => estimateGifSize(metadata, trim, candidate).high <= targetBytes) ??
    safe.at(-1) ?? { ...settings, fps: 5, resolution: 240 }
  );
}

export function sizeTargetOutcome(bytes: number, target: StudioOutputSettings['sizeTarget']): string {
  return target === 'auto' ? 'not_requested' : bytes <= target * 1024 * 1024 ? 'met' : 'exceeded';
}
