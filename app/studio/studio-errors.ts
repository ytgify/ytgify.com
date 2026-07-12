import type { StudioError } from '@/lib/studio/types';

export function mapExportError(code: string): StudioError {
  if (code === 'cancelled') {
    return {
      code: 'cancelled',
      message: 'The export was cancelled.',
      action: 'Choose a clip and try again when ready.',
    };
  }

  if (code === 'canvas_failed') {
    return {
      code: 'canvas_failed',
      message: 'The converter could not create a canvas for this export.',
      action: 'Try a shorter clip or restart the browser tab.',
    };
  }

  if (code === 'memory_limit') {
    return {
      code: 'memory_limit',
      message: 'Those settings need too much working memory for a reliable browser export.',
      action: 'Lower the clip duration, frame rate, or resolution and try again.',
    };
  }

  if (code === 'extraction_timeout') {
    return {
      code: 'extraction_timeout',
      message: 'Frame extraction took too long.',
      action: 'Shorten the clip or lower the output resolution.',
    };
  }

  if (code === 'decode_failed') {
    return {
      code: 'decode_failed',
      message: 'The converter could not decode that frame.',
      action: 'Try a different browser-decodable video or choose another clip range.',
    };
  }

  return {
    code: 'encoding_failed',
    message: 'The converter could not encode that GIF.',
    action: 'Try a shorter clip, lower FPS, or lower resolution.',
  };
}
