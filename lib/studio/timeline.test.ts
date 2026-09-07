import { describe, expect, it } from 'vitest';
import { formatClock, parseTimeInput, timelineWindow } from './timeline';

describe('readable trim times', () => {
  it('accepts clock times or seconds and rounds display across minute boundaries', () => {
    expect(parseTimeInput('06:00.1')).toBe(360.1);
    expect(parseTimeInput('360.1')).toBe(360.1);
    expect(parseTimeInput(' 0:05 ')).toBe(5);
    expect(formatClock(59.96)).toBe('01:00.0');
    expect(formatClock(1800)).toBe('30:00.0');
  });
  it('rejects partial, malformed and nonfinite values without converting them to zero', () => {
    for (const value of ['', '6:', '6:60', '-1', '1e3', 'Infinity', '3.4.5', '9'.repeat(400)]) {
      expect(parseTimeInput(value)).toBeNull();
    }
  });
  it('keeps the entire selection in a bounded detail window', () => {
    expect(timelineWindow(360, 363, 370)).toEqual({ start: 340, span: 30 });
    expect(timelineWindow(0, 3, 370)).toEqual({ start: 0, span: 30 });
    expect(timelineWindow(100, 110, 370)).toEqual({ start: 90, span: 30 });
    expect(timelineWindow(0, 0.5, 0.5)).toEqual({ start: 0, span: 0.5 });
  });
});
