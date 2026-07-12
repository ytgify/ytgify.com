'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function getMobileSnapshot() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mobile') === 'true') return true;
  if (urlParams.get('mobile') === 'false') return false;

  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(navigator.userAgent) || window.innerWidth < 768;
}

function getServerSnapshot() {
  return null;
}

/**
 * Client-side mobile detection hook.
 * Returns null while detecting, true for mobile, false for desktop.
 */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    subscribe,
    getMobileSnapshot,
    getServerSnapshot,
  );
}
