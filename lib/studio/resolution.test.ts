import { describe, expect, it } from 'vitest';
import { calculateOutputDimensions } from './resolution';

describe('Studio output dimensions', () => {
  it('preserves landscape aspect ratio with even dimensions', () => {
    expect(calculateOutputDimensions(1920, 1080, 360)).toEqual({
      width: 640,
      height: 360,
      scale: 1 / 3,
    });
  });

  it('preserves portrait aspect ratio within the selected height', () => {
    expect(calculateOutputDimensions(1080, 1920, 480)).toEqual({
      width: 270,
      height: 480,
      scale: 0.25,
    });
  });

  it('does not upscale a smaller source', () => {
    expect(calculateOutputDimensions(320, 180, 480)).toEqual({
      width: 320,
      height: 180,
      scale: 1,
    });
  });

  it('rejects invalid source dimensions', () => {
    expect(() => calculateOutputDimensions(0, 1080, 360)).toThrow('Invalid source dimensions');
    expect(() => calculateOutputDimensions(1920, -1, 360)).toThrow('Invalid source dimensions');
  });
});
