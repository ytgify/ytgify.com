/** Read graphic-control delays attached to image blocks, skipping compressed image data. */
export function readGifDelays(bytes: Uint8Array): number[] {
  const tableSize = (packed: number) => (packed & 0x80 ? 3 * 2 ** ((packed & 7) + 1) : 0);
  let offset = 13 + tableSize(bytes[10]);
  let delay = 0;
  const delays: number[] = [];
  const skipBlocks = () => {
    while (offset < bytes.length) {
      const size = bytes[offset++];
      if (size === 0) return;
      offset += size;
    }
    throw new Error('Truncated GIF blocks');
  };
  while (offset < bytes.length) {
    const marker = bytes[offset++];
    if (marker === 0x3b) return delays;
    if (marker === 0x21) {
      const label = bytes[offset++];
      if (label === 0xf9) delay = bytes[offset + 2] | (bytes[offset + 3] << 8);
      skipBlocks();
    } else if (marker === 0x2c) {
      offset += 9 + tableSize(bytes[offset + 8]) + 1;
      skipBlocks();
      delays.push(delay);
      delay = 0;
    } else {
      throw new Error('Invalid GIF block');
    }
  }
  throw new Error('Missing GIF trailer');
}
