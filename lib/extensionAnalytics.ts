import posthog from 'posthog-js';

export const CHROME_EXTENSION_VERSION = '1.0.19';
export const CHROME_EXTENSION_DOWNLOAD_PATH = `/downloads/ytgify-v${CHROME_EXTENSION_VERSION}-chrome.zip`;

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;
type AnalyticsWindow = Window & {
  gtag?: (command: 'event', eventName: string, properties?: AnalyticsProperties) => void;
};

const hasPostHogKey = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
);

function cleanProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

function pageProperties() {
  if (typeof window === 'undefined') return {};

  return {
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || null,
    extension_version: CHROME_EXTENSION_VERSION,
  };
}

export function trackExtensionEvent(
  eventName: string,
  properties: AnalyticsProperties = {}
) {
  if (typeof window === 'undefined') return;

  const eventProperties = cleanProperties({
    ...pageProperties(),
    ...properties,
  });

  if (hasPostHogKey) {
    posthog.capture(eventName, eventProperties);
  }

  const analyticsWindow = window as AnalyticsWindow;

  if (typeof analyticsWindow.gtag === 'function') {
    analyticsWindow.gtag('event', eventName, eventProperties);
  }
}

export function trackExtensionException(
  error: unknown,
  properties: AnalyticsProperties = {}
) {
  if (!hasPostHogKey || typeof window === 'undefined') return;

  posthog.captureException(error, cleanProperties({
    ...pageProperties(),
    ...properties,
  }));
}
