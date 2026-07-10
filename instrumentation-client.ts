import posthog from 'posthog-js';

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: true,
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: true,
    defaults: '2025-05-24',
    debug: process.env.NODE_ENV === 'development',
    person_profiles: 'identified_only',
  });
}
