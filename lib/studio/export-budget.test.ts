import { describe, expect, it } from 'vitest';
import { calculateExportBudget, STUDIO_FRAME_MEMORY_BUDGET_BYTES } from './export-budget';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from './types';

const metadata: StudioVideoMetadata = {
  duration: 15,
  width: 1920,
  height: 1080,
  type: 'video/mp4',
  size: 10_000,
};

describe('Studio export working-set budget', () => {
  it('allows the default focused workflow', () => {
    const result = calculateExportBudget(metadata, trim(5), settings(10, 360));
    expect(result).toMatchObject({ allowed: true, frameCount: 50, width: 640, height: 360 });
    expect(result.estimatedBytes).toBe(46_080_000);
  });

  it('blocks a high-cost export above the conservative frame budget', () => {
    const result = calculateExportBudget(metadata, trim(10), settings(15, 480));
    expect(result.allowed).toBe(false);
    expect(result.estimatedBytes).toBeGreaterThan(STUDIO_FRAME_MEMORY_BUDGET_BYTES);
    expect(result.estimatedMegabytes).toBe(235);
  });
});

function trim(duration: number): StudioTrimSelection {
  return { startTime: 0, endTime: duration, duration };
}

function settings(fps: 5 | 10 | 15, resolution: 240 | 360 | 480): StudioOutputSettings {
  return { fps, resolution };
}
