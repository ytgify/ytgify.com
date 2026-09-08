import { expect, test } from 'vitest';
import { canProbeMp4 } from './platform';

test('Linux WebKit is rejected before probing the crashing codec backend', () => {
  const safari = 'Mozilla/5.0 AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
  expect(canProbeMp4(safari, 'Linux x86_64')).toBe(false);
  expect(canProbeMp4(safari, 'MacIntel')).toBe(true);
  expect(canProbeMp4(`${safari} Chrome/152.0.0.0`, 'Linux x86_64')).toBe(true);
  expect(canProbeMp4('Mozilla/5.0 Gecko/20100101 Firefox/145.0', 'Linux x86_64')).toBe(true);
});
