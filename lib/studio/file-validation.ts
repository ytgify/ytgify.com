import {
  STUDIO_ACCEPTED_EXTENSIONS,
  STUDIO_ACCEPTED_MIME_TYPES,
  STUDIO_MAX_FILE_SIZE_BYTES,
  STUDIO_MAX_SOURCE_DURATION_SECONDS,
} from './constants';
import type { StudioError } from './types';

export function validateVideoFile(file: File): StudioError | null {
  if (file.size > STUDIO_MAX_FILE_SIZE_BYTES) {
    return {
      code: 'file_too_large',
      message: 'That video is larger than the 250 MB Studio limit.',
      action: 'Choose a smaller clip or trim the source video first.',
    };
  }

  const lowerName = file.name.toLowerCase();
  const hasAcceptedType = STUDIO_ACCEPTED_MIME_TYPES.includes(file.type);
  const hasAcceptedExtension = STUDIO_ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));

  if (!hasAcceptedType && !hasAcceptedExtension) {
    return {
      code: 'unsupported_file',
      message: 'Studio supports browser-decodable MP4, MOV, and WebM files.',
      action: 'Choose a different local video file.',
    };
  }

  return null;
}

export function validateVideoDuration(duration: number): StudioError | null {
  if (!Number.isFinite(duration) || duration <= 0) {
    return {
      code: 'decode_failed',
      message: 'The browser could not read that video.',
      action: 'Try another MP4, MOV, or WebM file.',
    };
  }

  if (duration > STUDIO_MAX_SOURCE_DURATION_SECONDS) {
    return {
      code: 'source_too_long',
      message: 'Studio MVP supports source videos up to 5 minutes.',
      action: 'Choose a shorter source clip for now.',
    };
  }

  return null;
}

export function durationBucket(duration: number): string {
  if (duration <= 10) return '0-10s';
  if (duration <= 30) return '11-30s';
  if (duration <= 60) return '31-60s';
  if (duration <= 180) return '1-3m';
  return '3-5m';
}

export function fileSizeBucket(size: number): string {
  const mb = size / (1024 * 1024);
  if (mb <= 5) return '0-5mb';
  if (mb <= 25) return '5-25mb';
  if (mb <= 100) return '25-100mb';
  if (mb <= 250) return '100-250mb';
  return '250mb+';
}

export function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;

  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 10 ? 1 : 2)} MB`;
}
