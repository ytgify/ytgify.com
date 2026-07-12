import { describe, expect, it, vi } from 'vitest';
import {
  dispatchStudioEvent,
  sanitizeProperties,
  studioDurationBucket,
  studioFileSizeBucket,
  studioFileTypeBucket,
  studioSourceBucket,
  trackStudioEvent,
} from './analytics';

describe('Studio analytics privacy', () => {
  it('uses an event-specific allowlist and rejects private or unexpected values', () => {
    expect(
      sanitizeProperties('studio_export_started', {
        filename: 'private.mov',
        topText: 'secret caption',
        objectUrl: 'blob:secret',
        output_fps: 10,
        output_encoder: 'gifenc',
        captions_enabled: true,
        source_page: 'https://private.example/path?token=secret',
      }),
    ).toEqual({ output_fps: 10, output_encoder: 'gifenc', captions_enabled: true });
  });

  it('dispatches the same sanitized funnel payload to PostHog and GA', () => {
    const posthog = vi.fn();
    const ga = vi.fn();
    const safe = dispatchStudioEvent(
      'studio_export_succeeded',
      {
        output_duration: 3,
        output_fps: 10,
        output_resolution: 360,
        output_encoder: 'gifenc',
        captions_enabled: true,
        output_file_size_bucket: '0-5mb',
        filename: 'PRIVATE-family-video.mov',
        topText: 'SECRET CAPTION',
      },
      { posthog, ga },
    );

    expect(safe).toEqual({
      output_duration: 3,
      output_fps: 10,
      output_resolution: 360,
      output_encoder: 'gifenc',
      captions_enabled: true,
      output_file_size_bucket: '0-5mb',
    });
    expect(posthog).toHaveBeenCalledWith('studio_export_succeeded', safe);
    expect(ga).toHaveBeenCalledWith('studio_export_succeeded', safe);
    expect(JSON.stringify(posthog.mock.calls)).not.toMatch(/PRIVATE|SECRET/);
    expect(JSON.stringify(ga.mock.calls)).not.toMatch(/PRIVATE|SECRET/);
  });

  it('coarsens source, media type, duration, and size values', () => {
    expect(studioSourceBucket('', 'ytgify.com')).toBe('direct');
    expect(studioSourceBucket('https://ytgify.com/blog?private=yes', 'ytgify.com')).toBe('internal');
    expect(studioSourceBucket('https://search.example/result?private=yes', 'ytgify.com')).toBe('external');
    expect(studioSourceBucket('not a url', 'ytgify.com')).toBe('unknown');
    expect(studioFileTypeBucket('video/quicktime')).toBe('mov');
    expect(studioFileTypeBucket('private/caption')).toBe('other');
    expect(studioDurationBucket(45)).toBe('31-60s');
    expect(studioFileSizeBucket(30 * 1024 * 1024)).toBe('25-100mb');
  });

  it('is safe when analytics is unavailable during server rendering', () => {
    expect(() => trackStudioEvent('studio_page_view', { source_page: 'direct' })).not.toThrow();
  });
});
