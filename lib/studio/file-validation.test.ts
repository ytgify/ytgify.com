import { describe, expect, it } from 'vitest';
import { STUDIO_MAX_FILE_SIZE_BYTES } from './constants';
import {
  durationBucket,
  fileSizeBucket,
  formatFileSize,
  validateVideoDuration,
  validateVideoFile,
} from './file-validation';

function file(name: string, type: string, size = 1): File {
  return { name, type, size } as File;
}

describe('Studio file validation', () => {
  it('accepts supported MIME types and extensions', () => {
    expect(validateVideoFile(file('clip.bin', 'video/mp4'))).toBeNull();
    expect(validateVideoFile(file('clip.MOV', ''))).toBeNull();
  });

  it('rejects unsupported and oversized files', () => {
    expect(validateVideoFile(file('notes.txt', 'text/plain'))?.code).toBe('unsupported_file');
    expect(validateVideoFile(file('clip.mp4', 'video/mp4', STUDIO_MAX_FILE_SIZE_BYTES + 1))?.code).toBe(
      'file_too_large',
    );
  });

  it('rejects invalid and overly long durations', () => {
    expect(validateVideoDuration(Number.NaN)?.code).toBe('decode_failed');
    expect(validateVideoDuration(301)?.code).toBe('source_too_long');
    expect(validateVideoDuration(300)).toBeNull();
  });

  it('uses stable analytics buckets and readable sizes', () => {
    expect(durationBucket(10)).toBe('0-10s');
    expect(durationBucket(30)).toBe('11-30s');
    expect(durationBucket(180)).toBe('1-3m');
    expect(durationBucket(181)).toBe('3-5m');
    expect(fileSizeBucket(5 * 1024 * 1024)).toBe('0-5mb');
    expect(fileSizeBucket(20 * 1024 * 1024)).toBe('5-25mb');
    expect(fileSizeBucket(80 * 1024 * 1024)).toBe('25-100mb');
    expect(fileSizeBucket(200 * 1024 * 1024)).toBe('100-250mb');
    expect(fileSizeBucket(251 * 1024 * 1024)).toBe('250mb+');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(20 * 1024 * 1024)).toBe('20.0 MB');
  });
});
