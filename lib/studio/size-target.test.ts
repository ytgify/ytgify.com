import { describe, expect, it } from 'vitest';
import { calculateExportBudget } from './export-budget';
import { chooseSettingsForTarget, estimateGifSize, sizeTargetOutcome } from './size-target';
import type { StudioOutputSettings } from './types';

const video = { duration: 370, width: 1920, height: 1080, type: 'video/mp4', size: 1000 };
const clip = { startTime: 360, endTime: 370, duration: 10 };
const settings: StudioOutputSettings = { fps: 15, resolution: 480, sizeTarget: 5 };

describe('size targeting', () => {
  it('uses actual dimensions, never upscales small sources, and scales with frame count', () => {
    const small = { ...video, width: 160, height: 90 };
    expect(estimateGifSize(small, clip, settings)).toEqual(
      estimateGifSize(small, clip, { ...settings, resolution: 240 }),
    );
    expect(estimateGifSize(video, clip, settings).high).toBeGreaterThan(estimateGifSize(small, clip, settings).high);
    expect(estimateGifSize(video, { ...clip, duration: 3 }, settings).high).toBeLessThan(
      estimateGifSize(video, clip, settings).high,
    );
  });
  it('fits the conservative estimate and memory budget across duration, aspect ratio, and target', () => {
    for (const width of [640, 1920, 4000]) {
      for (const duration of [3, 5, 10]) {
        for (const sizeTarget of [5, 10, 25] as const) {
          const metadata = { ...video, width };
          const trim = { ...clip, duration, endTime: clip.startTime + duration };
          const chosen = chooseSettingsForTarget(metadata, trim, { ...settings, sizeTarget });
          expect(calculateExportBudget(metadata, trim, chosen).allowed).toBe(true);
          const smallest = estimateGifSize(metadata, trim, { ...settings, fps: 5, resolution: 240 }).high;
          if (smallest <= sizeTarget * 1048576) {
            expect(estimateGifSize(metadata, trim, chosen).high).toBeLessThanOrEqual(sizeTarget * 1048576);
          } else {
            expect(chosen).toMatchObject({ fps: 5, resolution: 240 });
          }
        }
      }
    }
  });
  it('recalculates for longer clips while preserving manual choices', () => {
    const short = chooseSettingsForTarget(video, { ...clip, duration: 3 }, settings);
    const long = chooseSettingsForTarget(video, clip, settings);
    expect(long).not.toEqual(short);
    expect(chooseSettingsForTarget(video, clip, { ...settings, sizeTarget: 'auto' })).toEqual({
      ...settings,
      sizeTarget: 'auto',
    });
  });
  it('leaves the memory guard blocking when no supported settings are safe', () => {
    const metadata = { ...video, width: 100000 };
    expect(calculateExportBudget(metadata, clip, chooseSettingsForTarget(metadata, clip, settings)).allowed).toBe(
      false,
    );
  });
  it('reports actual outcomes independently of the estimate', () => {
    expect(sizeTargetOutcome(5 * 1048576, 5)).toBe('met');
    expect(sizeTargetOutcome(5 * 1048576 + 1, 5)).toBe('exceeded');
    expect(sizeTargetOutcome(1, 'auto')).toBe('not_requested');
  });
});
