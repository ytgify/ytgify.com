import { expect, test } from '@playwright/test';
import path from 'node:path';

export function registerMediaReadinessTests() {
  test('defers preview seeking until the first frame is decoded', async ({ page, browserName }) => {
    await page.addInitScript(() => {
      const media = HTMLMediaElement.prototype;
      const readiness = Object.getOwnPropertyDescriptor(media, 'readyState')!;
      const time = Object.getOwnPropertyDescriptor(media, 'currentTime')!;
      const state = { decoded: false, earlySeeks: 0 };
      Object.assign(window, { __mediaReadiness: state });
      Object.defineProperty(media, 'readyState', {
        configurable: true,
        get() {
          return this.controls && !state.decoded ? 1 : readiness.get!.call(this);
        },
      });
      Object.defineProperty(media, 'currentTime', {
        configurable: true,
        get: time.get,
        set(value: number) {
          if (this.controls && !state.decoded) state.earlySeeks += 1;
          time.set!.call(this, value);
        },
      });
    });

    await page.goto('/video-to-gif');
    await page
      .getByLabel('Upload video')
      .setInputFiles(
        path.join(process.cwd(), `tests/fixtures/visual-timeline.${browserName === 'webkit' ? 'mp4' : 'webm'}`),
      );
    await expect(page.getByRole('heading', { name: 'Select Your Perfect Moment' })).toBeVisible();
    await page.getByRole('button', { name: '3s', exact: true }).click();
    await page.getByLabel('Start time', { exact: true }).fill('1.1');
    await page.getByLabel('Start time', { exact: true }).press('Enter');
    await expect(page.getByLabel('Start time', { exact: true })).toHaveValue('00:01.1');

    const earlySeeks = await page.evaluate(() => {
      const state = (window as typeof window & { __mediaReadiness: { decoded: boolean; earlySeeks: number } })
        .__mediaReadiness;
      // The play event can also arrive before frame data on iOS.
      document.querySelector('video')!.dispatchEvent(new Event('play'));
      return state.earlySeeks;
    });
    expect(earlySeeks).toBe(0);

    await page.evaluate(() => {
      (window as typeof window & { __mediaReadiness: { decoded: boolean } }).__mediaReadiness.decoded = true;
      document.querySelector('video')!.dispatchEvent(new Event('loadeddata'));
    });
    await expect
      .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime))
      .toBeCloseTo(1.1);
  });
}
