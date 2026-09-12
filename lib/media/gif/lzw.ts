import { GifError } from './types';

export function decodeLzw(chunks: Uint8Array[], minimumCodeSize: number, expectedPixels: number): Uint8Array {
  const output = new Uint8Array(expectedPixels);
  const prefix = new Uint16Array(4096);
  const suffix = new Uint8Array(4096);
  const stack = new Uint8Array(4096);
  const clear = 1 << minimumCodeSize;
  const end = clear + 1;
  let available = end + 1;
  let size = minimumCodeSize + 1;
  let old = -1;
  let first = 0;
  let cursor = 0;
  let chunk = 0;
  let offset = 0;
  let bits = 0;
  let accumulator = 0;
  while (true) {
    while (bits < size) {
      while (chunk < chunks.length && offset === chunks[chunk].length) {
        chunk++;
        offset = 0;
      }
      if (chunk >= chunks.length) invalid();
      accumulator |= chunks[chunk][offset++] << bits;
      bits += 8;
    }
    let code = accumulator & ((1 << size) - 1);
    accumulator >>>= size;
    bits -= size;
    if (code === clear) {
      available = end + 1;
      size = minimumCodeSize + 1;
      old = -1;
      continue;
    }
    if (code === end) {
      if (cursor !== expectedPixels) invalid();
      return output;
    }
    if (code > available || code >= 4096) invalid();
    if (old < 0) {
      if (code >= clear || cursor >= expectedPixels) invalid();
      output[cursor++] = code;
      old = code;
      first = code;
      continue;
    }
    const original = code;
    let count = 0;
    if (code === available) {
      stack[count++] = first;
      code = old;
    }
    while (code >= clear) {
      if (code >= available || count >= stack.length - 1) invalid();
      stack[count++] = suffix[code];
      code = prefix[code];
    }
    first = code;
    stack[count++] = first;
    if (cursor + count > expectedPixels) invalid();
    while (count) output[cursor++] = stack[--count];
    if (available < 4096) {
      prefix[available] = old;
      suffix[available] = first;
      available++;
      if (available === 1 << size && size < 12) size++;
    }
    old = original;
  }
}

function invalid(): never {
  throw new GifError('invalid_gif', 'The GIF contains damaged compressed frame data.');
}
