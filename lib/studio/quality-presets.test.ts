import { expect, it } from 'vitest';
import { qualityLabel, qualityPresets, smallerSettings } from './quality-presets';
import { estimateGifSize } from './size-target';

const metadata = { width: 480, height: 360, duration: 6, type: 'video/webm', size: 1000 };
const trim = { startTime: 2, endTime: 5, duration: 3 };
it('keeps the default balanced mapping and distinguishes auto and custom choices', () => {
  expect(qualityPresets[1].settings).toEqual({ resolution: 360, fps: 10, sizeTarget: 'auto' });
  expect(qualityLabel({ resolution: 360, fps: 10, sizeTarget: 5 })).toBe('Auto · aim for 5 MB');
  expect(qualityLabel({ resolution: 480, fps: 5, sizeTarget: 'auto' })).toBe('Custom');
});
it('offers a cheaper export without increasing either resolution or FPS', () => {
  const current = qualityPresets[1].settings;
  const next = smallerSettings(metadata, trim, current)!;
  expect(next).toEqual({ resolution: 360, fps: 5, sizeTarget: 'auto' });
  expect(estimateGifSize(metadata, trim, next).high).toBeLessThan(estimateGifSize(metadata, trim, current).high);
});
it('does not claim smaller output when lower resolution cannot reduce a tiny source', () => {
  expect(
    smallerSettings({ ...metadata, width: 160, height: 90 }, trim, { resolution: 480, fps: 5, sizeTarget: 5 }),
  ).toBeNull();
  expect(smallerSettings(metadata, trim, qualityPresets[0].settings)).toBeNull();
});
