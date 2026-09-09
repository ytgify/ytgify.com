import { GIFEncoder } from 'gifenc';
import { indexFrame } from './palette';
import type { DecodedGif } from './types';

export function encodeGifFrames(gif: DecodedGif, colors = 256, progress?: (value: number) => void): Uint8Array {
  const encoder = GIFEncoder();
  const hasAlpha = gif.frames.some((frame) => {
    for (let i = 3; i < frame.rgba.length; i += 4) if (frame.rgba[i] < 128) return true;
    return false;
  });
  // Full frames and explicit disposal avoid reusing opaque pixels behind later transparency.
  gif.frames.forEach((frame, index) => {
    const { palette, indexed, transparent } = indexFrame(frame.rgba, colors, hasAlpha);
    encoder.writeFrame(indexed, gif.width, gif.height, {
      palette,
      delay: frame.delay,
      transparent,
      transparentIndex: 0,
      dispose: 2,
      first: index === 0,
      repeat: gif.loop === null ? -1 : gif.loop,
    });
    progress?.(Math.round(((index + 1) / gif.frames.length) * 100));
  });
  encoder.finish();
  return encoder.bytes();
}
