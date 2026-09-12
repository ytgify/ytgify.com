import type { CompressionOptions } from '../gif/compress';

export type GifOperation = { kind: 'inspect' } | { kind: 'compress'; options: CompressionOptions };

export interface GifJob {
  id: number;
  bytes: ArrayBuffer;
  operation: GifOperation;
}

export interface GifJobResult {
  width: number;
  height: number;
  duration: number;
  frameCount: number;
  loop: number | null;
  normalizedTiming: boolean;
  estimatedWorkspace: number;
  bytes?: Uint8Array;
  mime?: 'image/gif';
  targetMet?: boolean;
  attempts?: number;
  mean?: number;
  minimum?: number;
}

export type GifReply =
  | { id: number; kind: 'progress'; value: number; stage: string }
  | { id: number; kind: 'result'; result: GifJobResult }
  | { id: number; kind: 'error'; message: string };
