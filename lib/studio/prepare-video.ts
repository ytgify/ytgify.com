// iOS may expose metadata before decoding any frames. Start decoding from the
// export gesture so users do not need to play the preview before creating a GIF.
export async function prepareVideo(video: HTMLVideoElement, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new Error('cancelled');
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
  const muted = video.muted;
  video.muted = true;
  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let frameCallback: number | undefined;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (frameCallback !== undefined) video.cancelVideoFrameCallback(frameCallback);
        signal?.removeEventListener('abort', abort);
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(new Error('cancelled'));
      const timer = window.setTimeout(() => finish(new Error('extraction_timeout')), 5000);
      signal?.addEventListener('abort', abort, { once: true });
      // play() can resolve before canvas sees the decoded pixels. Wait for a
      // presented frame at the preview's seek position before pausing on iOS.
      const decoded = () => {
        frameCallback = video.requestVideoFrameCallback((_now, frame) => {
          if (settled) return;
          if (!video.seeking && Math.abs(frame.mediaTime - video.currentTime) < 0.075) finish();
          else decoded();
        });
      };
      video.play().then(
        () => {
          if (settled) video.pause();
          else if (typeof video.requestVideoFrameCallback === 'function') decoded();
          else finish();
        },
        () => finish(new Error('decode_failed')),
      );
    });
  } finally {
    video.pause();
    video.muted = muted;
  }
}
