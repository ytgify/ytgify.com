import { MAX_WORKSPACE, workspaceBytes } from './types';

const FULLY_SUPPORTED_SOURCE_BYTES = 10 * 1024 * 1024;
const SOURCE_SOFT_WARNING_BYTES = 25_000_000;

const supportedRangeNotice =
  'Files up to 10 MB are fully supported. Larger GIFs may take longer or exceed your browser’s available memory, but YTgify will attempt to process them.';

export function sourceSizeNotice(bytes: number): string {
  if (bytes <= FULLY_SUPPORTED_SOURCE_BYTES) return '';
  if (bytes <= SOURCE_SOFT_WARNING_BYTES) return supportedRangeNotice;
  return `${supportedRangeNotice} This file is also above the current 25 MB soft warning threshold.`;
}

export function sourceAdmissionError(bytes: number): string {
  if (workspaceBytes(bytes, 0, 0) <= MAX_WORKSPACE) return '';
  return 'This file alone would exceed the compressor’s reliable browser memory budget. Choose a smaller GIF.';
}
