import { afterEach, describe, expect, it, vi } from 'vitest';
import { readGifDelays } from '../../tests/helpers/gif-timing';
import { STUDIO_FPS_OPTIONS } from './constants';
import { encodeGif } from './encoders/gifenc-encoder';
import { createFrameTiming } from './frame-timing';

afterEach(() => vi.unstubAllGlobals());

describe.each(STUDIO_FPS_OPTIONS)('%i FPS timing', (fps) => {
  it('keeps every supported trim length within one half centisecond at each boundary', () => {
    for (let tenths = 1; tenths <= 100; tenths++) {
      const duration = tenths / 10;
      const timing = createFrameTiming(duration, fps);
      expect(timing).toHaveLength(Math.ceil(duration * fps));
      let elapsed = 0;
      timing.forEach((frame, index) => {
        elapsed += frame.delay;
        expect(frame.delay % 10).toBe(0);
        expect(frame.delay).toBeGreaterThanOrEqual(20);
        expect(Math.abs(elapsed - ((index + 1) * duration * 1000) / timing.length)).toBeLessThanOrEqual(5.000001);
        expect(frame.time).toBeGreaterThanOrEqual(0);
        expect(frame.time).toBeLessThan(duration);
      });
      expect(elapsed).toBe(Math.round(duration * 100) * 10);
    }
  });

  it.each([0.1, 0.3, 3, 3.1, 3.137, 10])('writes faithful encoded delays for %s seconds', async (duration) => {
    vi.stubGlobal('window', { setTimeout });
    const frames = createFrameTiming(duration, fps).map(({ delay }, index) => ({
      delay,
      imageData: {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([index % 256, 80, 160, 255]),
      } as ImageData,
    }));
    const blob = await encodeGif({ frames, width: 1, height: 1 });
    const delays = readGifDelays(new Uint8Array(await blob.arrayBuffer()));
    expect(delays).toEqual(frames.map((frame) => frame.delay / 10));
    expect(delays.reduce((sum, delay) => sum + delay, 0)).toBe(Math.round(duration * 100));
    if (duration === 3 && fps === 15) {
      expect(delays).toHaveLength(45);
      expect(delays.filter((delay) => delay === 7)).toHaveLength(30);
      expect(delays.filter((delay) => delay === 6)).toHaveLength(15);
    }
  });
});
