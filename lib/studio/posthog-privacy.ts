import type { CaptureResult } from 'posthog-js';
import { toolEventProperties } from '../media/analytics';

const privateCreatorPaths = new Set([
  '/studio',
  '/video-to-gif',
  '/gif-compressor',
  '/resize-gif',
  '/gif-to-mp4',
  '/screen-to-gif',
]);
const privateCreatorProperties = [
  '$raw_user_agent',
  '$geoip_postal_code',
  '$geoip_latitude',
  '$geoip_longitude',
] as const;

export function filterPrivateCreatorEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !isPrivateCreatorEvent(event)) return event;
  if (event.event === 'gif_tool_activity') {
    const safe = toolEventProperties(event.properties || {});
    const transport = Object.fromEntries(
      ['token', 'distinct_id']
        .filter((key) => typeof event.properties?.[key] === 'string')
        .map((key) => [key, event.properties![key]]),
    );
    return safe ? { ...event, properties: { ...safe, ...transport, $geoip_disable: true } } : null;
  }
  return event.event.startsWith('studio_') ? sanitizeCreatorEvent(event) : null;
}

function isPrivateCreatorEvent(event: CaptureResult): boolean {
  const currentUrl = event.properties?.$current_url;
  if (typeof currentUrl === 'string') {
    try {
      return privateCreatorPaths.has(normalizePath(new URL(currentUrl, 'https://ytgify.com').pathname));
    } catch {
      return false;
    }
  }

  return typeof window !== 'undefined' && privateCreatorPaths.has(normalizePath(window.location.pathname));
}

function sanitizeCreatorEvent(event: CaptureResult): CaptureResult {
  const properties = { ...event.properties };
  for (const key of ['$referrer', '$initial_referrer', '$initial_current_url']) delete properties[key];
  for (const key of privateCreatorProperties) delete properties[key];
  properties.$geoip_disable = true;
  if (typeof properties.$current_url === 'string') {
    const url = new URL(properties.$current_url, 'https://ytgify.com');
    properties.$current_url = `${url.origin}${normalizePath(url.pathname)}`;
  }
  return { ...event, properties };
}

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}
