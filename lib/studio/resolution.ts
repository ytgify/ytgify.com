import type { StudioResolution } from './types';

function even(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

export function calculateOutputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxHeight: StudioResolution
): { width: number; height: number; scale: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Invalid source dimensions');
  }

  const height = Math.min(sourceHeight, maxHeight);
  const scale = height / sourceHeight;

  return {
    width: even(sourceWidth * scale),
    height: even(height),
    scale,
  };
}
