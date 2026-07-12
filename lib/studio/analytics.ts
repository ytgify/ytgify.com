import { durationBucket, fileSizeBucket } from './file-validation';

type StudioEventName =
  | 'studio_page_view'
  | 'studio_upload_started'
  | 'studio_upload_loaded'
  | 'studio_upload_failed'
  | 'studio_trim_changed'
  | 'studio_caption_added'
  | 'studio_export_started'
  | 'studio_export_succeeded'
  | 'studio_export_failed'
  | 'studio_download_clicked'
  | 'studio_next_tool_selected';

type StudioEventProperties = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, properties?: StudioEventProperties) => void;
  }
}

const REDACTED_KEYS = new Set([
  'fileName',
  'filename',
  'name',
  'caption',
  'captionText',
  'topText',
  'bottomText',
  'text',
  'objectUrl',
  'url',
]);

export function trackStudioEvent(eventName: StudioEventName, properties: StudioEventProperties = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, sanitizeProperties(properties));
}

export function sanitizeProperties(properties: StudioEventProperties): StudioEventProperties {
  return Object.entries(properties).reduce<StudioEventProperties>((safe, [key, value]) => {
    if (value === undefined || REDACTED_KEYS.has(key)) return safe;
    safe[key] = value;
    return safe;
  }, {});
}

export function studioDurationBucket(duration: number): string {
  return durationBucket(duration);
}

export function studioFileSizeBucket(size: number): string {
  return fileSizeBucket(size);
}
