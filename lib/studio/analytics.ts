import posthog from 'posthog-js';
import { durationBucket, fileSizeBucket } from './file-validation';

export type StudioEventName =
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

type StudioEventValue = string | number | boolean | undefined;
export type StudioEventProperties = Record<string, StudioEventValue>;

interface StudioAnalyticsSinks {
  posthog?: (eventName: StudioEventName, properties: StudioEventProperties) => void;
  ga?: (eventName: StudioEventName, properties: StudioEventProperties) => void;
}

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, properties?: StudioEventProperties) => void;
  }
}

const hasPostHogKey = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
const safeProperties: Record<StudioEventName, readonly string[]> = {
  studio_page_view: ['source_page'],
  studio_upload_started: ['file_type', 'file_size_bucket'],
  studio_upload_loaded: ['file_type', 'source_duration_bucket'],
  studio_upload_failed: ['error_code', 'file_type'],
  studio_trim_changed: ['output_duration'],
  studio_caption_added: ['captions_enabled'],
  studio_export_started: [
    'source_duration_bucket',
    'output_duration',
    'output_fps',
    'output_resolution',
    'output_encoder',
    'captions_enabled',
  ],
  studio_export_succeeded: [
    'output_duration',
    'output_fps',
    'output_resolution',
    'output_encoder',
    'captions_enabled',
    'output_file_size_bucket',
  ],
  studio_export_failed: [
    'error_code',
    'output_duration',
    'output_fps',
    'output_resolution',
    'output_encoder',
    'captions_enabled',
  ],
  studio_download_clicked: ['output_file_size_bucket'],
  studio_next_tool_selected: ['next_tool'],
};

export function trackStudioEvent(eventName: StudioEventName, properties: StudioEventProperties = {}): void {
  if (typeof window === 'undefined') return;
  dispatchStudioEvent(eventName, properties, {
    posthog: hasPostHogKey ? (name, safe) => posthog.capture(name, safe) : undefined,
    ga: typeof window.gtag === 'function' ? (name, safe) => window.gtag?.('event', name, safe) : undefined,
  });
}

export function dispatchStudioEvent(
  eventName: StudioEventName,
  properties: StudioEventProperties,
  sinks: StudioAnalyticsSinks,
): StudioEventProperties {
  const safe = sanitizeProperties(eventName, properties);
  sinks.posthog?.(eventName, safe);
  sinks.ga?.(eventName, safe);
  return safe;
}

export function sanitizeProperties(
  eventName: StudioEventName,
  properties: StudioEventProperties,
): StudioEventProperties {
  const allowed = new Set(safeProperties[eventName]);
  return Object.entries(properties).reduce<StudioEventProperties>((safe, [key, value]) => {
    if (!allowed.has(key) || value === undefined) return safe;
    if (typeof value === 'number') {
      if (Number.isFinite(value)) safe[key] = value;
      return safe;
    }
    safe[key] = typeof value === 'string' ? safeCategory(value) : value;
    return safe;
  }, {});
}

export function studioSourceBucket(referrer: string, currentHostname: string): string {
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname === currentHostname ? 'internal' : 'external';
  } catch {
    return 'unknown';
  }
}

export function studioFileTypeBucket(type: string): string {
  if (type === 'video/mp4') return 'mp4';
  if (type === 'video/quicktime') return 'mov';
  if (type === 'video/webm') return 'webm';
  return 'other';
}

export function studioDurationBucket(duration: number): string {
  return durationBucket(duration);
}

export function studioFileSizeBucket(size: number): string {
  return fileSizeBucket(size);
}

function safeCategory(value: string): string {
  return /^[a-z0-9][a-z0-9_./+-]{0,39}$/i.test(value) ? value : 'other';
}
