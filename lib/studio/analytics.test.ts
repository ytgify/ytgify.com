import { describe, expect, it } from 'vitest';
import { sanitizeProperties, studioDurationBucket, studioFileSizeBucket, trackStudioEvent } from './analytics';

describe('Studio analytics privacy', () => {
  it('removes media, caption, text, and URL properties', () => {
    expect(
      sanitizeProperties({
        filename: 'private.mov',
        topText: 'secret caption',
        objectUrl: 'blob:secret',
        output_fps: 10,
        captions_enabled: true,
      }),
    ).toEqual({ output_fps: 10, captions_enabled: true });
  });

  it('omits undefined values and exposes only coarse buckets', () => {
    expect(sanitizeProperties({ source: undefined, output_resolution: 360 })).toEqual({
      output_resolution: 360,
    });
    expect(studioDurationBucket(45)).toBe('31-60s');
    expect(studioFileSizeBucket(30 * 1024 * 1024)).toBe('25-100mb');
  });

  it('is safe when analytics is unavailable during server rendering', () => {
    expect(() => trackStudioEvent('studio_page_view', { source_page: 'direct' })).not.toThrow();
  });
});
