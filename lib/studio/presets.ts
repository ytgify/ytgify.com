import { STUDIO_MAX_EXPORT_DURATION_SECONDS } from './constants';
import type { StudioTrimSelection } from './types';

export function makeTrimSelection(startTime: number, endTime: number, videoDuration: number): StudioTrimSelection {
  const safeVideoDuration = Number.isFinite(videoDuration) ? Math.max(0, videoDuration) : 0;
  const requestedStart = Number.isFinite(startTime) ? startTime : 0;
  const requestedEnd = Number.isFinite(endTime) ? endTime : requestedStart + 0.1;
  const safeStart = Math.max(0, Math.min(requestedStart, Math.max(0, safeVideoDuration - 0.1)));
  const safeEnd = Math.max(safeStart + 0.1, Math.min(requestedEnd, safeVideoDuration));
  const clampedEnd = Math.min(safeEnd, safeStart + STUDIO_MAX_EXPORT_DURATION_SECONDS);

  return {
    startTime: roundTime(safeStart),
    endTime: roundTime(clampedEnd),
    duration: roundTime(clampedEnd - safeStart),
  };
}

export function applyDurationPreset(
  duration: number,
  currentSelection: StudioTrimSelection,
  videoDuration: number
): StudioTrimSelection {
  const safeVideoDuration = Number.isFinite(videoDuration) ? Math.max(0, videoDuration) : 0;
  const requestedDuration = Number.isFinite(duration) ? duration : STUDIO_MAX_EXPORT_DURATION_SECONDS;
  const presetDuration = Math.min(requestedDuration, STUDIO_MAX_EXPORT_DURATION_SECONDS, safeVideoDuration);
  let startTime = Number.isFinite(currentSelection.startTime) ? currentSelection.startTime : 0;
  let endTime = startTime + presetDuration;

  if (endTime > safeVideoDuration) {
    endTime = safeVideoDuration;
    startTime = Math.max(0, endTime - presetDuration);
  }

  return makeTrimSelection(startTime, endTime, safeVideoDuration);
}

export function roundTime(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatTime(value: number): string {
  if (!Number.isFinite(value)) return '0.0s';
  return `${value.toFixed(1)}s`;
}
