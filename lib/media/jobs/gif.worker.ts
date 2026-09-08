import { decodeGif } from '../gif/decode';
import { compressGif } from '../gif/compress';
import { transformGif } from '../gif/geometry';
import { encodeGifFrames } from '../gif/encode';
import type { GifJob, GifJobResult, GifReply } from './protocol';

const send = (message: GifReply) => self.postMessage(message);

self.addEventListener('message', async (event: MessageEvent<GifJob>) => {
  const { id, bytes: buffer, operation } = event.data;
  const progress = (stage: string) => (value: number) => send({ id, kind: 'progress', stage, value });
  try {
    const bytes = new Uint8Array(buffer);
    const gif = decodeGif(bytes, progress('Reading GIF'));
    let result: GifJobResult = {
      width: gif.width,
      height: gif.height,
      duration: gif.duration,
      frameCount: gif.frames.length,
      loop: gif.loop,
      normalizedTiming: gif.normalizedTiming,
      estimatedWorkspace: gif.estimatedWorkspace,
    };
    if (operation.kind === 'compress') {
      result = {
        ...result,
        ...compressGif(gif, bytes, operation.options, progress('Finding a smaller GIF')),
        mime: 'image/gif',
      };
    } else if (operation.kind === 'resize') {
      const transformed = transformGif(gif, operation.options);
      result = {
        ...result,
        width: transformed.width,
        height: transformed.height,
        bytes: encodeGifFrames(transformed, 256, progress('Encoding GIF')),
        mime: 'image/gif',
      };
    } else if (operation.kind === 'mp4') {
      const { encodeMp4 } = await import('../mp4/encode');
      result = {
        ...result,
        ...(await encodeMp4(gif, operation.options.cycles, operation.options.background, progress('Encoding MP4'))),
        mime: 'video/mp4',
      };
    }
    const scope = self as unknown as { postMessage: (message: GifReply, transfer: Transferable[]) => void };
    scope.postMessage({ id, kind: 'result', result }, result.bytes ? [result.bytes.buffer as ArrayBuffer] : []);
  } catch (error) {
    send({
      id,
      kind: 'error',
      message: error instanceof Error ? error.message : 'The file could not be processed. Try another GIF.',
    });
  }
});
