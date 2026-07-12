import type { CaptureResult } from 'posthog-js';

const privateCreatorPaths = new Set(['/studio', '/video-to-gif']);

export function filterPrivateCreatorEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !isPrivateCreatorEvent(event)) return event;
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
  if (typeof properties.$current_url === 'string') {
    const url = new URL(properties.$current_url, 'https://ytgify.com');
    properties.$current_url = `${url.origin}${normalizePath(url.pathname)}`;
  }
  return { ...event, properties };
}

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}
