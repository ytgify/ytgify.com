import posthog from 'posthog-js';
import { filterPrivateCreatorEvent } from '@/lib/studio/posthog-privacy';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

const privateMediaTool = ['/gif-compressor', '/resize-gif', '/gif-to-mp4', '/screen-to-gif'].includes(
  window.location.pathname.replace(/\/+$/, ''),
);

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: !privateMediaTool,
    disable_session_recording: privateMediaTool,
    before_send: filterPrivateCreatorEvent,
    capture_exceptions: !privateMediaTool,
    capture_pageleave: !privateMediaTool,
    capture_pageview: !privateMediaTool,
    defaults: '2025-05-24',
    debug: process.env.NODE_ENV === 'development',
    mask_all_element_attributes: true,
    mask_all_text: true,
    person_profiles: 'identified_only',
  });
}
