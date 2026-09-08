import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, Quality, canEncodeVideo } from 'mediabunny';
import type { DecodedGif } from '../gif/types';

export async function encodeMp4(
  gif: DecodedGif,
  cycles: number,
  background: string,
  progress: (value: number) => void,
) {
  if (
    !Number.isInteger(cycles) ||
    cycles < 1 ||
    cycles > 3 ||
    gif.duration * cycles > 60_000 ||
    !/^#[0-9a-f]{6}$/i.test(background)
  ) {
    throw new Error('Choose 1–3 cycles totaling at most 60 seconds and a background color.');
  }
  const width = Math.max(16, Math.ceil(gif.width / 2) * 2);
  const height = Math.max(16, Math.ceil(gif.height / 2) * 2);
  if (typeof OffscreenCanvas === 'undefined' || !(await canEncodeVideo('avc', { width, height }))) {
    throw new Error('MP4 encoding is unavailable in this browser. Try a recent desktop Chrome or Safari.');
  }
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not create a video canvas.');
  const sourceCanvas = new OffscreenCanvas(gif.width, gif.height);
  const sourceContext = sourceCanvas.getContext('2d');
  if (!sourceContext) throw new Error('The browser could not read GIF frames.');
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new CanvasSource(canvas, { codec: 'avc', quality: new Quality('high') });
  output.addVideoTrack(source);
  try {
    await output.start();
    let time = 0;
    for (let cycle = 0; cycle < cycles; cycle++) {
      for (let index = 0; index < gif.frames.length; index++) {
        const frame = gif.frames[index];
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
        sourceContext.putImageData(new ImageData(new Uint8ClampedArray(frame.rgba), gif.width, gif.height), 0, 0);
        context.drawImage(sourceCanvas, 0, 0);
        await source.add(time / 1000, frame.delay / 1000);
        time += frame.delay;
        progress(Math.round(((cycle * gif.frames.length + index + 1) / (cycles * gif.frames.length)) * 100));
      }
    }
    source.close();
    await output.finalize();
    if (!target.buffer) throw new Error('The browser did not produce an MP4 file.');
    return { bytes: new Uint8Array(target.buffer), width, height, duration: time };
  } catch (error) {
    await output.cancel();
    throw error;
  }
}
