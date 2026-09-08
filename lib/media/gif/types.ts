export interface GifControl {
  rawDelay: number | null;
  delay: number;
  disposal: number;
  transparent: number | null;
}

export interface GifPatch extends GifControl {
  left: number;
  top: number;
  width: number;
  height: number;
  palette: Uint8Array;
  interlaced: boolean;
  minimumCodeSize: number;
  chunks: Uint8Array[];
}

interface GifMetadata {
  width: number;
  height: number;
  loop: number | null;
  duration: number;
  normalizedTiming: boolean;
  background: number[];
  estimatedWorkspace: number;
}

export interface ParsedGif extends GifMetadata {
  patches: GifPatch[];
}

interface GifFrame {
  rgba: Uint8ClampedArray;
  delay: number;
}

export interface DecodedGif extends GifMetadata {
  frames: GifFrame[];
}

export class GifError extends Error {
  constructor(
    public readonly code: 'invalid_gif' | 'memory_limit' | 'input_limit' | 'unsupported_gif',
    message: string,
  ) {
    super(message);
    this.name = 'GifError';
  }
}

export const MAX_WORKSPACE = 80 * 1024 * 1024;

export function workspaceBytes(inputBytes: number, frameBytes: number, canvasBytes: number): number {
  // Decoder admission: retained input/frames, compositor snapshots, LZW scratch and a fixed reserve.
  // Transform and optimizer allocations are admitted separately before they are created.
  return inputBytes + frameBytes + canvasBytes * 4 + 4 * 1024 * 1024;
}
