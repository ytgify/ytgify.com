import { GifReader } from './reader';
import { GifError, MAX_WORKSPACE, workspaceBytes, type GifControl, type GifPatch, type ParsedGif } from './types';

const defaultControl = (): GifControl => ({ rawDelay: null, delay: 100, disposal: 0, transparent: null });

export function parseGif(bytes: Uint8Array): ParsedGif {
  if (bytes.length > 25_000_000) throw new GifError('input_limit', 'Choose a GIF smaller than 25 MB.');
  const reader = new GifReader(bytes);
  if (!['GIF87a', 'GIF89a'].includes(reader.text(6))) throw new GifError('invalid_gif', 'Choose a valid GIF file.');
  const width = reader.word();
  const height = reader.word();
  if (!width || !height || width > 4096 || height > 4096)
    throw new GifError('input_limit', 'This GIF canvas is too large.');
  const flags = reader.byte();
  const backgroundIndex = reader.byte();
  reader.byte();
  const palette = flags & 128 ? reader.take(3 * (2 << (flags & 7))) : new Uint8Array();
  const background = [...palette.subarray(backgroundIndex * 3, backgroundIndex * 3 + 3)];
  if (background.length !== 3) background.splice(0, 3, 0, 0, 0);
  const patches: GifPatch[] = [];
  let control = defaultControl();
  let loop: number | null = null;
  let duration = 0;
  let normalizedTiming = false;
  let estimatedWorkspace = 0;
  while (true) {
    const marker = reader.byte();
    if (marker === 0x3b) break;
    if (marker === 0x21) {
      const label = reader.byte();
      if (label === 0xf9) control = readControl(reader);
      else if (label === 0xff) {
        const identifier = reader.text(reader.byte());
        const blocks = reader.blocks();
        if (['NETSCAPE2.0', 'ANIMEXTS1.0'].includes(identifier)) {
          if (blocks.length !== 1 || blocks[0].length !== 3 || blocks[0][0] !== 1) invalid();
          loop = blocks[0][1] | (blocks[0][2] << 8);
        }
      } else if (label === 0xfe) reader.blocks();
      else throw new GifError('unsupported_gif', 'This GIF uses an unsupported extension. Choose another GIF.');
      continue;
    }
    if (marker !== 0x2c) invalid();
    const patch = readPatch(reader, palette, control);
    if (patch.left + patch.width > width || patch.top + patch.height > height) invalid();
    patches.push(patch);
    duration += patch.delay;
    normalizedTiming ||= patch.rawDelay === null || patch.rawDelay < 2;
    if (patches.length > 600 || duration > 60_000)
      throw new GifError('input_limit', 'Choose a GIF with at most 600 frames and a 60-second cycle.');
    estimatedWorkspace = workspaceBytes(bytes.length, width * height * 4 * patches.length, width * height * 4);
    if (estimatedWorkspace > MAX_WORKSPACE)
      throw new GifError('memory_limit', 'This animation needs too much memory. Choose a smaller or shorter GIF.');
    control = defaultControl();
  }
  if (!patches.length) invalid();
  return { width, height, background, loop, duration, normalizedTiming, estimatedWorkspace, patches };
}

function readControl(reader: GifReader): GifControl {
  if (reader.byte() !== 4) invalid();
  const flags = reader.byte();
  const rawDelay = reader.word();
  const transparent = reader.byte();
  if (reader.byte() !== 0 || flags & 0xe0 || ((flags >> 2) & 7) > 3) invalid();
  if (flags & 2) throw new GifError('unsupported_gif', 'GIFs that wait for user input are not supported.');
  return {
    rawDelay,
    delay: rawDelay < 2 ? 100 : rawDelay * 10,
    disposal: (flags >> 2) & 7,
    transparent: flags & 1 ? transparent : null,
  };
}

function readPatch(reader: GifReader, globalPalette: Uint8Array, control: GifControl): GifPatch {
  const left = reader.word();
  const top = reader.word();
  const width = reader.word();
  const height = reader.word();
  const flags = reader.byte();
  const palette = flags & 128 ? reader.take(3 * (2 << (flags & 7))) : globalPalette;
  const minimumCodeSize = reader.byte();
  if (!width || !height || !palette.length || minimumCodeSize < 2 || minimumCodeSize > 8) invalid();
  if (control.transparent !== null && control.transparent * 3 >= palette.length) invalid();
  const chunks = reader.blocks();
  if (!chunks.length) invalid();
  return { left, top, width, height, palette, minimumCodeSize, chunks, interlaced: Boolean(flags & 64), ...control };
}

function invalid(): never {
  throw new GifError('invalid_gif', 'The GIF is damaged or has invalid frame data.');
}
