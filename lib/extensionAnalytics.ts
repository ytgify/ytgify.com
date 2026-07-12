import posthog from 'posthog-js';

export const CHROME_EXTENSION_VERSION = '1.0.19';
export const CHROME_EXTENSION_DOWNLOAD_PATH = `/downloads/ytgify-v${CHROME_EXTENSION_VERSION}-chrome.zip`;

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;
type AnalyticsWindow = Window & {
  gtag?: (command: 'event', eventName: string, properties?: AnalyticsProperties) => void;
};

const MAX_PROPERTY_LENGTH = 120;
const SAFE_LABEL_PATTERN = /[^a-zA-Z0-9._:/-]/g;

const hasPostHogKey = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

function safeLabel(value: string | null, maxLength = MAX_PROPERTY_LENGTH) {
  if (!value) return null;
  return value.replace(SAFE_LABEL_PATTERN, '_').slice(0, maxLength) || null;
}

function referrerDomain() {
  if (!document.referrer) return null;

  try {
    return new URL(document.referrer).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function analyticsDestination(href: string | undefined) {
  if (!href) return 'unknown';
  if (href.startsWith('#')) return 'page_section';
  if (href.startsWith('/downloads/')) return 'extension_zip';
  if (href.startsWith('/')) return 'internal_page';

  try {
    const hostname = new URL(href).hostname.toLowerCase();
    if (hostname === 'chromewebstore.google.com') return 'chrome_web_store';
    if (hostname === 'addons.mozilla.org') return 'firefox_addons';
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(hostname)) return 'youtube';
    if (['github.com', 'www.github.com'].includes(hostname)) return 'github';
  } catch {
    return 'invalid_destination';
  }

  return 'external_site';
}

function cleanProperties(properties: AnalyticsProperties = {}): AnalyticsProperties {
  return Object.entries(properties).reduce<AnalyticsProperties>((cleaned, [key, value]) => {
    if (value !== undefined) {
      cleaned[key] = typeof value === 'string' ? safeLabel(value) : value;
    }
    return cleaned;
  }, {});
}

function pageProperties() {
  if (typeof window === 'undefined') return {};

  return {
    page_path: window.location.pathname,
    referrer_domain: referrerDomain(),
    utm_source: safeLabel(new URLSearchParams(window.location.search).get('utm_source'), 80),
    utm_medium: safeLabel(new URLSearchParams(window.location.search).get('utm_medium'), 80),
    utm_campaign: safeLabel(new URLSearchParams(window.location.search).get('utm_campaign'), 80),
    device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    extension_version: CHROME_EXTENSION_VERSION,
  };
}

export function trackExtensionEvent(eventName: string, properties: AnalyticsProperties = {}) {
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

export function trackExtensionException(error: unknown, properties: AnalyticsProperties = {}) {
  if (!hasPostHogKey || typeof window === 'undefined') return;

  posthog.captureException(
    error,
    cleanProperties({
      ...pageProperties(),
      ...properties,
    }),
  );
}
