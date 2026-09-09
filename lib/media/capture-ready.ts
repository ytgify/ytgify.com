/** Wait for decoded capture pixels before recording, avoiding an initial uninitialized black frame. */
export async function waitForCaptureFrame(stream: MediaStream): Promise<void> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  video.style.cssText = 'position:fixed;left:-10000px;width:2px;height:2px;opacity:0;pointer-events:none';
  document.body.append(video);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => {
          if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(() => resolve());
          else resolve();
        };
        video.onerror = () => reject(new Error('The browser could not read the captured screen.'));
        void video.play().catch(reject);
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('No screen frames arrived. Choose another source and retry.')), 3000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    video.pause();
    video.srcObject = null;
    video.remove();
  }
}
