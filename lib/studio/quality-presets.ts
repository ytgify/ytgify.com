import { STUDIO_FPS_OPTIONS, STUDIO_RESOLUTION_OPTIONS } from './constants';
import { calculateExportBudget } from './export-budget';
import { estimateGifSize } from './size-target';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from './types';

export const qualityPresets: Array<{ label: string; settings: StudioOutputSettings }> = [
  { label: 'Small file', settings: { resolution: 240, fps: 5, sizeTarget: 'auto' } },
  { label: 'Balanced', settings: { resolution: 360, fps: 10, sizeTarget: 'auto' } },
  { label: 'More detail', settings: { resolution: 480, fps: 15, sizeTarget: 'auto' } },
];

export function qualityLabel(settings: StudioOutputSettings): string {
  if (settings.sizeTarget !== 'auto') return `Auto · aim for ${settings.sizeTarget} MB`;
  return (
    qualityPresets.find(
      (preset) => preset.settings.resolution === settings.resolution && preset.settings.fps === settings.fps,
    )?.label ?? 'Custom'
  );
}

export function smallerSettings(
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  settings: StudioOutputSettings,
): StudioOutputSettings | null {
  const current = estimateGifSize(metadata, trim, settings).high;
  const candidates = STUDIO_RESOLUTION_OPTIONS.flatMap((resolution) =>
    STUDIO_FPS_OPTIONS.map((fps) => ({ resolution, fps, sizeTarget: 'auto' as const })),
  )
    .filter((candidate) => candidate.resolution <= settings.resolution && candidate.fps <= settings.fps)
    .filter(
      (candidate) =>
        calculateExportBudget(metadata, trim, candidate).allowed &&
        estimateGifSize(metadata, trim, candidate).high < current,
    )
    .sort((a, b) => b.resolution - a.resolution || b.fps - a.fps);
  return candidates[0] ?? null;
}
