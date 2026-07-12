const SEEK_TIMEOUT_MS = 5000;
const SEEK_POLL_INTERVAL_MS = 25;
const SEEK_READY_TOLERANCE_SECONDS = 0.075;

interface SeekResult {
  actualTime: number;
}

export async function seekVideo(video: HTMLVideoElement, time: number, signal?: AbortSignal): Promise<SeekResult> {
  if (Math.abs(video.currentTime - time) < 0.035 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return { actualTime: video.currentTime };
  }

  const startedAt = performance.now();
  const targets = [time, Math.min(video.duration || time, time + 0.001), Math.max(0, time - 0.05)];
  let lastError: Error | null = null;

  for (const target of targets) {
    if (signal?.aborted) throw new Error('cancelled');
    const remainingMs = SEEK_TIMEOUT_MS - (performance.now() - startedAt);
    if (remainingMs <= 0) break;

    try {
      return await seekOnce(video, target, time, Math.max(250, remainingMs), signal);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('extraction_timeout');
      if (lastError.message === 'cancelled' || lastError.message === 'decode_failed') {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('extraction_timeout');
}

async function seekOnce(
  video: HTMLVideoElement,
  seekTarget: number,
  desiredTime: number,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<SeekResult> {
  const startedAt = performance.now();

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let pollId = 0;

    const timeout = window.setTimeout(() => {
      rejectSeek(new Error('extraction_timeout'));
    }, timeoutMs);

    const cleanup = () => {
      window.clearTimeout(timeout);
      if (pollId) window.clearTimeout(pollId);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
    };

    const resolveReady = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const rejectSeek = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const pollReady = () => {
      if (signal?.aborted) {
        rejectSeek(new Error('cancelled'));
        return;
      }

      if (canRenderFrame(video, desiredTime)) {
        resolveReady();
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        rejectSeek(new Error('extraction_timeout'));
        return;
      }

      pollId = window.setTimeout(pollReady, SEEK_POLL_INTERVAL_MS);
    };

    const onSeeked = () => {
      if (canRenderFrame(video, desiredTime)) {
        resolveReady();
        return;
      }

      pollReady();
    };

    const onError = () => {
      rejectSeek(new Error('decode_failed'));
    };

    const onAbort = () => {
      rejectSeek(new Error('cancelled'));
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });

    video.currentTime = seekTarget;
    pollReady();
  });

  await delay(video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? 25 : 80, signal);
  return { actualTime: video.currentTime };
}

function canRenderFrame(video: HTMLVideoElement, targetTime: number): boolean {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return false;
  if (Math.abs(video.currentTime - targetTime) > SEEK_READY_TOLERANCE_SECONDS) return false;

  return isBuffered(video, video.currentTime) || video.buffered.length === 0;
}

function isBuffered(video: HTMLVideoElement, time: number): boolean {
  for (let index = 0; index < video.buffered.length; index += 1) {
    if (video.buffered.start(index) <= time && video.buffered.end(index) >= time) {
      return true;
    }
  }

  return false;
}

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new Error('cancelled');

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const cleanup = () => {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new Error('cancelled'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
