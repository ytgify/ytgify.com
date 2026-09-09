import { GifError } from './types';

export class GifReader {
  position = 0;
  private blockCount = 0;
  constructor(public readonly bytes: Uint8Array) {}

  take(length: number): Uint8Array {
    if (this.position + length > this.bytes.length)
      throw new GifError('invalid_gif', 'The GIF is incomplete. Choose another file.');
    const result = this.bytes.subarray(this.position, this.position + length);
    this.position += length;
    return result;
  }

  byte(): number {
    return this.take(1)[0];
  }
  word(): number {
    const bytes = this.take(2);
    return bytes[0] | (bytes[1] << 8);
  }
  text(length: number): string {
    return String.fromCharCode(...this.take(length));
  }

  blocks(): Uint8Array[] {
    const blocks: Uint8Array[] = [];
    for (let length = this.byte(); length !== 0; length = this.byte()) {
      if (++this.blockCount > 100_000) throw new GifError('input_limit', 'This GIF contains too many data blocks.');
      blocks.push(this.take(length));
    }
    return blocks;
  }
}
