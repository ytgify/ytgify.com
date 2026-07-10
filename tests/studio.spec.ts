import { expect, test } from '@playwright/test';
import path from 'node:path';

const chromeDemoFixture = path.join(process.cwd(), 'tests/fixtures/ytgify-chrome-demo.webm');
const bobRossFixture = path.join(process.cwd(), 'tests/fixtures/bob-ross-15s.webm');

test.describe.skip('Studio (disabled until public launch)', () => {
  test('exports a local video to GIF without uploading source media details', async ({ page }) => {
    const observedRequests: string[] = [];
    const secretFileName = 'studio-fixture-secret-video.webm';
    const secretCaption = 'SECRET CAPTION SHOULD NOT LEAVE BROWSER';

    page.on('request', (request) => {
      observedRequests.push(`${request.url()} ${request.postData() || ''}`);
    });

    await page.goto('/studio');
    await expect(page.getByRole('listitem').filter({ hasText: 'Upload' })).toHaveAttribute('aria-current', 'step');
    await page.evaluate(() => {
      const originalRevoke = URL.revokeObjectURL.bind(URL);
      const observedWindow = window as typeof window & { __revokedObjectUrls?: string[] };
      observedWindow.__revokedObjectUrls = [];
      URL.revokeObjectURL = (url: string) => {
        observedWindow.__revokedObjectUrls?.push(url);
        originalRevoke(url);
      };
    });
    await expect(page.getByRole('heading', { name: 'Video to GIF Studio' })).toBeVisible();

    await attachGeneratedVideo(page, secretFileName);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    const uploadedVideoUrl = await page.locator('video').getAttribute('src');
    await page.getByRole('button', { name: '3s' }).click();
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: /240p Mini/ }).click();
    await expect(page.getByText('~15')).toBeVisible();

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await expect(page.getByRole('heading', { name: 'Make It Memorable' })).toBeVisible();
    await page.getByLabel('Top text').fill(secretCaption);

    await page.getByRole('button', { name: 'Create GIF' }).click();

    await expect(page.getByRole('heading', { name: 'Creating Your GIF' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await expect(page.getByAltText('Generated GIF preview')).toBeVisible();
    await expect(page.getByText('Frames')).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? (B|KB|MB)/)).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download GIF' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ytgify-studio.gif');

    const requestText = observedRequests.join('\n');
    expect(requestText).not.toContain(secretFileName);
    expect(requestText).not.toContain(secretCaption);

    const revokedUrls = await page.evaluate(() => {
      return ((window as typeof window & { __revokedObjectUrls?: string[] }).__revokedObjectUrls || []);
    });
    expect(revokedUrls).not.toContain(uploadedVideoUrl);
  });

  test('shows a product error for unsupported files', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles({
      name: 'not-a-video.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a video'),
    });

    await expect(page.getByText('Studio supports browser-decodable MP4, MOV, and WebM files.')).toBeVisible();
    await expect(page.getByText('Choose a different local video file.')).toBeVisible();
  });

  test('exports from the skip text branch and returns from success to capture', async ({ page }) => {
    await page.goto('/studio');
    await attachGeneratedVideo(page, 'studio-skip-text-video.webm');

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('listitem').filter({ hasText: 'Capture' })).toHaveAttribute('aria-current', 'step');
    await page.getByRole('button', { name: 'Continue to Customize' }).click();

    await expect(page.getByRole('heading', { name: 'Make It Memorable' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Text' })).toHaveAttribute('aria-current', 'step');
    await page.getByRole('button', { name: 'Create without text' }).click();

    await expect(page.getByRole('heading', { name: 'Creating Your GIF' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await page.getByRole('button', { name: 'Edit clip' }).click();
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Capture' })).toHaveAttribute('aria-current', 'step');
  });

  test('exports the bundled Chrome demo fixture to GIF', async ({ page }) => {
    const observedRequests: string[] = [];
    const fixtureCaption = 'CHROME DEMO QA';

    page.on('request', (request) => {
      observedRequests.push(`${request.url()} ${request.postData() || ''}`);
    });

    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(chromeDemoFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('414x360')).toBeVisible();
    await page.getByRole('spinbutton', { name: 'Start time' }).fill('1');
    await page.getByRole('button', { name: '3s' }).click();
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: /240p Mini/ }).click();

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await page.getByLabel('Bottom text').fill(fixtureCaption);
    await page.getByRole('button', { name: /^Large/ }).click();
    await page.getByRole('button', { name: /^Yellow/ }).click();
    const captionPreviewFrame = page.getByTestId('caption-preview-frame');
    const bottomCaption = captionPreviewFrame.getByText(fixtureCaption);
    await expect(bottomCaption).toBeVisible();
    await expect(bottomCaption).toHaveCSS('color', 'rgb(255, 228, 92)');
    const captionBounds = await bottomCaption.boundingBox();
    const frameBounds = await captionPreviewFrame.boundingBox();
    expect(captionBounds).not.toBeNull();
    expect(frameBounds).not.toBeNull();
    expect(captionBounds!.y + captionBounds!.height).toBeLessThanOrEqual(frameBounds!.y + frameBounds!.height);
    await page.getByRole('button', { name: 'Create GIF' }).click();

    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await expect(page.getByText('276x240')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download GIF' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ytgify-studio.gif');

    const requestText = observedRequests.join('\n');
    expect(requestText).not.toContain('ytgify-chrome-demo.webm');
    expect(requestText).not.toContain('ytgify-chrome-demo.mp4');
    expect(requestText).not.toContain(fixtureCaption);
  });

  test('exports the Chrome demo with the optional high-quality encoder path', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(chromeDemoFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('spinbutton', { name: 'Start time' }).fill('1');
    await page.getByRole('button', { name: '3s' }).click();
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: /240p Mini/ }).click();
    await page.getByRole('button', { name: /^Best quality gifski/ }).click();

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await page.getByRole('button', { name: 'Create without text' }).click();

    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Encoder')).toBeVisible();
    await expect(page.getByText(/gifski|gifenc fallback/)).toBeVisible();
    await expect(page.getByText('276x240')).toBeVisible();
  });

  test('preserves trim and caption drafts when moving backward and exporting without text', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(chromeDemoFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('spinbutton', { name: 'Start time' }).fill('1');
    await page.getByRole('button', { name: '3s' }).click();
    await expect(page.getByText('Preview cued to 1.0s - 4.0s.')).toBeVisible();
    await expect.poll(async () => page.locator('video').evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0.9);

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await expect(page.getByRole('heading', { name: 'Make It Memorable' })).toBeVisible();
    await expect.poll(async () => page.locator('video').evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0.9);
    await page.getByLabel('Top text').fill('KEEP THIS DRAFT');

    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Start time' })).toHaveValue('1');

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await expect(page.getByLabel('Top text')).toHaveValue('KEEP THIS DRAFT');
    await page.getByRole('button', { name: 'Create without text' }).click();

    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await page.getByRole('button', { name: 'Edit clip' }).click();
    await expect(page.getByRole('spinbutton', { name: 'Start time' })).toHaveValue('1');

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await expect(page.getByLabel('Top text')).toHaveValue('KEEP THIS DRAFT');
  });

  test('updates the trim selection from the direct timeline scrubber', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(chromeDemoFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: '3s' }).click();

    const timeline = page.getByTestId('studio-timeline');
    const timelineBounds = await timeline.boundingBox();
    expect(timelineBounds).not.toBeNull();

    await timeline.click({
      position: {
        x: timelineBounds!.width * 0.75,
        y: timelineBounds!.height / 2,
      },
    });

    await expect.poll(async () => startTimeValue(page)).toBeGreaterThan(2.5);

    const startHandle = page.getByTestId('timeline-start-handle');
    const startHandleBounds = await startHandle.boundingBox();
    expect(startHandleBounds).not.toBeNull();

    await page.mouse.move(startHandleBounds!.x + startHandleBounds!.width / 2, startHandleBounds!.y + startHandleBounds!.height / 2);
    await page.mouse.down();
    await page.mouse.move(timelineBounds!.x + timelineBounds!.width * 0.25, timelineBounds!.y + timelineBounds!.height / 2);
    await page.mouse.up();

    await expect.poll(async () => startTimeValue(page)).toBeLessThan(2);
    await expect(page.getByText(/Preview cued to \d+\.\ds - \d+\.\ds\./)).toBeVisible();
  });

  test('exports the Bob Ross fixture to GIF from the no-text branch', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(bobRossFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('480x360')).toBeVisible();
    await page.getByRole('button', { name: '3s' }).click();
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: /240p Mini/ }).click();

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await page.getByRole('button', { name: 'Create without text' }).click();

    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await expect(page.getByText('320x240')).toBeVisible();
  });

  test('recovers when initial seeked events are missed during export', async ({ page }) => {
    await page.addInitScript(() => {
      const originalAddEventListener = HTMLMediaElement.prototype.addEventListener;
      const observedWindow = window as typeof window & { __droppedSeekedListeners?: number };
      observedWindow.__droppedSeekedListeners = 0;

      HTMLMediaElement.prototype.addEventListener = function patchedAddEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) {
        if (type === 'seeked' && (observedWindow.__droppedSeekedListeners || 0) < 2) {
          observedWindow.__droppedSeekedListeners = (observedWindow.__droppedSeekedListeners || 0) + 1;
          return;
        }

        return originalAddEventListener.call(this, type, listener, options);
      };
    });

    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(bobRossFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: '3s' }).click();
    await page.getByRole('button', { name: /^5 fps/ }).click();
    await page.getByRole('button', { name: /240p Mini/ }).click();

    await page.getByRole('button', { name: 'Continue to Customize' }).click();
    await page.getByRole('button', { name: 'Create without text' }).click();

    await expect(page.getByRole('heading', { name: 'GIF ready' })).toBeVisible({ timeout: 45000 });
    await expect(page.getByText('320x240')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => {
      return (window as typeof window & { __droppedSeekedListeners?: number }).__droppedSeekedListeners || 0;
    })).toBe(2);
  });

  test('stays stable when export is double-clicked and reset during processing', async ({ page }) => {
    await page.goto('/studio');
    await page.getByLabel('Upload video').setInputFiles(bobRossFixture);

    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /^15 fps/ }).click();
    await page.getByRole('button', { name: /480p HD/ }).click();
    await expect(page.getByText(/Large export: 75 frames at 480p/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue to Customize' }).click();

    await page.getByRole('button', { name: 'Create GIF' }).evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });

    await expect(page.getByRole('heading', { name: 'Creating Your GIF' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByRole('heading', { name: 'Video to GIF Studio' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Make It Memorable' })).toBeHidden();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Video to GIF Studio' })).toBeVisible();
  });
});

async function startTimeValue(page: import('@playwright/test').Page): Promise<number> {
  const value = await page.getByRole('spinbutton', { name: 'Start time' }).inputValue();
  return Number(value);
}

async function attachGeneratedVideo(page: import('@playwright/test').Page, fileName: string): Promise<void> {
  await page.evaluate(async (generatedFileName) => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      const stream = canvas.captureStream(12);
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error('Could not record fixture video'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));

      let frame = 0;
      recorder.start();

      const drawFrame = () => {
        ctx.fillStyle = `rgb(${40 + frame * 4}, ${30 + frame * 3}, ${120 + frame * 2})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 24px Arial';
        ctx.fillText(`YTgify ${frame}`, 22, 50);
        frame += 1;

        if (frame >= 36) {
          window.clearInterval(timer);
          setTimeout(() => recorder.stop(), 120);
        }
      };

      const timer = window.setInterval(drawFrame, 85);
      drawFrame();
    });

    const file = new File([blob], generatedFileName, { type: 'video/webm' });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');

    if (!input) {
      throw new Error('Upload input not found');
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, fileName);
}
