import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prepareVideo } from './prepare-video';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('HTMLMediaElement', { HAVE_CURRENT_DATA: 2 });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function source(readyState = 1) {
  return { readyState, muted: false, play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() };
}
const prepare = (video: ReturnType<typeof source>, signal?: AbortSignal) =>
  prepareVideo(video as unknown as HTMLVideoElement, signal);

describe('iOS video readiness', () => {
  it('does not play an already decoded source', async () => {
    const video = source(2);
    await prepare(video);
    expect(video.play).not.toHaveBeenCalled();
  });
  it('warms an undecoded source muted and restores a paused preview', async () => {
    const video = source();
    video.play.mockImplementation(async () => {
      expect(video.muted).toBe(true);
    });
    await prepare(video);
    expect(video.play).toHaveBeenCalledOnce();
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.muted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('reports decoder failure and restores mute state', async () => {
    const video = source();
    video.play.mockRejectedValue(new Error('unsupported'));
    await expect(prepare(video)).rejects.toThrow('decode_failed');
    expect(video.muted).toBe(false);
    expect(video.pause).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('waits for pixels at the current seek position before pausing warm-up', async () => {
    let presented!: VideoFrameRequestCallback;
    const video = Object.assign(source(), {
      currentTime: 1.1,
      seeking: false,
      requestVideoFrameCallback: vi.fn((callback: VideoFrameRequestCallback) => {
        presented = callback;
        return 7;
      }),
      cancelVideoFrameCallback: vi.fn(),
    });
    const pending = prepare(video);
    await Promise.resolve();
    presented(0, { mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(video.pause).not.toHaveBeenCalled();
    presented(0, { mediaTime: 1.1 } as VideoFrameCallbackMetadata);
    await pending;
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.cancelVideoFrameCallback).toHaveBeenCalledWith(7);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('bounds and cancels a warm-up whose frame is never presented', async () => {
    const video = Object.assign(source(), {
      requestVideoFrameCallback: vi.fn().mockReturnValue(9),
      cancelVideoFrameCallback: vi.fn(),
    });
    const pending = expect(prepare(video)).rejects.toThrow('extraction_timeout');
    await vi.advanceTimersByTimeAsync(5000);
    await pending;
    expect(video.cancelVideoFrameCallback).toHaveBeenCalledWith(9);
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.muted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('bounds a stalled decoder', async () => {
    const video = source();
    video.play.mockReturnValue(new Promise(() => {}));
    const assertion = expect(prepare(video)).rejects.toThrow('extraction_timeout');
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.muted).toBe(false);
  });
  it('cancels immediately and pauses a play request that resolves after cancellation', async () => {
    const video = source();
    let resolvePlay!: () => void;
    video.play.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePlay = resolve;
      }),
    );
    const controller = new AbortController();
    const assertion = expect(prepare(video, controller.signal)).rejects.toThrow('cancelled');
    controller.abort();
    await assertion;
    expect(video.pause).toHaveBeenCalledOnce();
    resolvePlay();
    await Promise.resolve();
    expect(video.pause).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
