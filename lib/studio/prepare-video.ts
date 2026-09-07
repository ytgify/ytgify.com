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
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(new Error('cancelled'));
      const timer = window.setTimeout(() => finish(new Error('extraction_timeout')), 5000);
      signal?.addEventListener('abort', abort, { once: true });
      video.play().then(
        () => {
          if (settled) video.pause();
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
