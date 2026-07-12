import { describe, expect, it } from 'vitest';
import { applyDurationPreset, formatTime, makeTrimSelection } from './presets';

describe('Studio trim presets', () => {
  it('normalizes selections to the source duration', () => {
    expect(makeTrimSelection(-2, 15, 8)).toEqual({
      startTime: 0,
      endTime: 8,
      duration: 8,
    });
  });

  it('handles non-finite input and caps exports at ten seconds', () => {
    expect(makeTrimSelection(Number.NaN, Number.NaN, Number.NaN)).toEqual({
      startTime: 0,
      endTime: 0,
      duration: 0,
    });
    expect(makeTrimSelection(2, 50, 30)).toEqual({
      startTime: 2,
      endTime: 12,
      duration: 10,
    });
  });

  it('keeps a preset inside the source near the end', () => {
    expect(applyDurationPreset(5, { startTime: 8, endTime: 10, duration: 2 }, 10)).toEqual({
      startTime: 5,
      endTime: 10,
      duration: 5,
    });
  });

  it('uses safe defaults for invalid preset input', () => {
    expect(
      applyDurationPreset(Number.NaN, { startTime: Number.NaN, endTime: Number.NaN, duration: Number.NaN }, 6),
    ).toEqual({ startTime: 0, endTime: 6, duration: 6 });
  });

  it('formats finite times consistently', () => {
    expect(formatTime(3.26)).toBe('3.3s');
    expect(formatTime(Number.NaN)).toBe('0.0s');
  });
});
