import type { DecodedGif } from './types';

export function sampleGifFrames(gif: DecodedGif): DecodedGif {
  const frames = [];
  for (let index = 0; index < gif.frames.length; index += 2) {
    frames.push({ rgba: gif.frames[index].rgba, delay: gif.frames[index].delay + (gif.frames[index + 1]?.delay ?? 0) });
  }
  return { ...gif, frames };
}
