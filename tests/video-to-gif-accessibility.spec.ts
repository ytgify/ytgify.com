import { expect, test } from '@playwright/test';

test.describe('video to GIF accessibility', () => {
  test('exposes a keyboard-reachable upload action and clear page structure', async ({ page }) => {
    await page.goto('/video-to-gif');

    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Video to GIF Studio' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Studio wizard progress' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Upload' })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByLabel('Upload video')).toHaveAttribute('accept', /video\/mp4/);

    const chooseVideo = page.getByRole('button', { name: 'Choose video' });
    await chooseVideo.focus();
    await expect(chooseVideo).toBeFocused();
    await page.keyboard.press('Enter');
  });

  test('announces upload errors and keeps recovery keyboard accessible', async ({ page }) => {
    await page.goto('/video-to-gif');
    await page.getByLabel('Upload video').setInputFiles({
      name: 'not-a-video.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not video data'),
    });

    const alert = page.getByRole('alert').filter({ hasText: 'Studio supports browser-decodable' });
    await expect(alert).toContainText('Choose a different local video file');
    const startOver = page.getByRole('button', { name: 'Start over' });
    await startOver.focus();
    await expect(startOver).toBeFocused();
  });
});
