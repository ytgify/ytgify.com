import { decodeGif } from '../gif/decode';
import { compressGif } from '../gif/compress';
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
