import {
  Input,
  BlobSource,
  ALL_FORMATS,
  Output,
  BufferTarget,
  WebMOutputFormat,
  Mp4OutputFormat,
  Conversion,
} from 'mediabunny';

/** Remux recorder chunks to write seekable duration metadata without re-encoding their pixels. */
export async function finalizeRecording(blob: Blob, signal: AbortSignal): Promise<File> {
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  const mp4 = blob.type.includes('mp4');
  const target = new BufferTarget();
  const output = new Output({
    target,
    format: mp4 ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(),
  });
  let conversion: Conversion | undefined;
  const cancel = () => {
    void conversion?.cancel();
  };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    conversion = await Conversion.init({
      input,
      output,
      audio: { discard: true },
      tags: {},
      copy: { mode: 'forced' },
    });
    signal.throwIfAborted();
    if (!conversion.isValid) throw new Error('This recording format cannot be prepared for editing.');
    await conversion.execute();
    signal.throwIfAborted();
    if (!target.buffer) throw new Error('The recording could not be finalized.');
    return new File([target.buffer], `screen-recording.${mp4 ? 'mp4' : 'webm'}`, {
      type: mp4 ? 'video/mp4' : 'video/webm',
    });
  } finally {
    signal.removeEventListener('abort', cancel);
    input.dispose();
  }
}
