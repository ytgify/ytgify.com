import { describe, expect, test } from 'vitest';
import { MAX_WORKSPACE } from './types';
import { sourceAdmissionError, sourceSizeNotice } from './source-policy';

const fullySupportedSourceBytes = 10 * 1024 * 1024;
const sourceSoftWarningBytes = 25_000_000;

describe('GIF source policy', () => {
  test('distinguishes the guaranteed range from best-effort sources', () => {
    expect(sourceSizeNotice(fullySupportedSourceBytes)).toBe('');
    expect(sourceSizeNotice(fullySupportedSourceBytes + 1)).toMatch(
      /Files up to 10 MB are fully supported.*YTgify will attempt to process them/,
    );
    expect(sourceSizeNotice(sourceSoftWarningBytes + 1)).toMatch(/above the current 25 MB soft warning threshold/);
  });

  test('stops only when the input alone exhausts the workspace budget', () => {
    const fixedReserve = 4 * 1024 * 1024;
    expect(sourceAdmissionError(MAX_WORKSPACE - fixedReserve)).toBe('');
    expect(sourceAdmissionError(MAX_WORKSPACE - fixedReserve + 1)).toMatch(/memory budget/);
  });
});
