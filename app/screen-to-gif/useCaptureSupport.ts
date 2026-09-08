'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const snapshot = () =>
  typeof navigator.mediaDevices?.getDisplayMedia === 'function' && typeof MediaRecorder !== 'undefined';
export function useCaptureSupport() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
