import { expect, test } from 'vitest';
import { formatMediaSize } from './file-size';

test('file sizes use decimal units matching targets, including rounding boundaries', () => {
  expect(formatMediaSize(0)).toBe('0 B');
  expect(formatMediaSize(500)).toBe('500 B');
  expect(formatMediaSize(999)).toBe('999 B');
  expect(formatMediaSize(1000)).toBe('1 KB');
  expect(formatMediaSize(28065)).toBe('28.1 KB');
  expect(formatMediaSize(999999)).toBe('1 MB');
  expect(formatMediaSize(1500000)).toBe('1.5 MB');
});
