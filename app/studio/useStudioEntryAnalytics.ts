import { useEffect, useRef } from 'react';
import { studioEntryPoint, studioSourceBucket, trackStudioEvent } from '@/lib/studio/analytics';

export function useStudioEntryAnalytics() {
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    const entry = studioEntryPoint(window.location.search);
    trackStudioEvent('studio_page_view', {
      source_page: entry !== 'unknown' ? 'internal' : studioSourceBucket(document.referrer, window.location.hostname),
      entry_point: entry,
    });
  }, []);
}
