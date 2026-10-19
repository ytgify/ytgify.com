import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
]) {
  test(`source identity and caption discovery at ${viewport.width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.route(/googletagmanager.com|google-analytics.com|posthog.com/, (route) => route.abort());
    await page.addInitScript(() => {
      const observed = window as typeof window & { dataLayer: unknown[][]; gtag: (...args: unknown[]) => void };
      observed.dataLayer = [];
      observed.gtag = (...args) => observed.dataLayer.push(args);
    });
    await page.goto('/video-to-gif');
    const filename = `PRIVATE-${'long-video-name-'.repeat(12)}.webm`;
    await page.getByLabel('Upload video', { exact: true }).setInputFiles({
      name: filename,
      mimeType: 'video/webm',
      buffer: await readFile('tests/fixtures/visual-timeline.webm'),
    });
    const source = page.getByLabel('Source video', { exact: true });
    await expect(source).toContainText(filename);
    await expect(source).toContainText('320 × 240');
    const caption = page.locator('summary').filter({ hasText: 'Add a caption' });
    await expect(caption).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await caption.click();
    await page.getByLabel('Top text').fill('PRIVATE CAPTION');
    await page.getByText('Caption style', { exact: true }).click();
    await page.getByLabel('Caption color').focus();
    await page.getByLabel('Caption color').selectOption('yellow');
    await page.getByRole('button', { name: 'Preview caption', exact: true }).click();
    await expect(page.getByTestId('caption-preview-frame')).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId('create-bar')).toHaveCSS('position', 'static');
    await page.screenshot({ path: testInfo.outputPath(`caption-preview-${viewport.width}.png`) });
    await page.getByRole('button', { name: 'Return to caption editing' }).click();
    await expect(page.getByLabel('Caption color')).toBeFocused();
    await page.getByText('Caption style', { exact: true }).click();
    const previewButton = page.getByRole('button', { name: 'Preview caption', exact: true });
    await previewButton.click();
    await page.getByRole('button', { name: 'Return to caption editing' }).click();
    await expect(previewButton).toBeFocused();
    await expect(previewButton).toBeInViewport();
    await expect(page.getByLabel('Caption color')).toHaveValue('yellow');
    await page.getByText('Caption style', { exact: true }).click();
    await expect(page.getByLabel('Top text')).toHaveValue('PRIVATE CAPTION');
    await page
      .getByRole('button', { name: '10s', exact: true })
      .count()
      .then((count) => expect(count).toBe(0));
    await page.getByRole('button', { name: 'Full clip · 6.0s', exact: true }).click();
    await expect(page.getByLabel('Duration', { exact: true })).toHaveValue('6.0');
    await page.getByLabel('Duration', { exact: true }).fill('10');
    await page.getByLabel('Duration', { exact: true }).press('Tab');
    await expect(page.getByRole('status')).toContainText('Adjusted to 6.0s');
    await page.getByRole('button', { name: 'More detail', exact: true }).click();
    await expect(page.getByTestId('effective-settings')).toContainText('320 × 240 output · 15 FPS · 480p maximum');
    const estimateExplanation = page.getByTestId('size-estimate-explanation');
    await expect(estimateExplanation).toContainText('Simple clips can be much smaller');
    await estimateExplanation.scrollIntoViewIfNeeded();
    await expect(estimateExplanation).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath(`estimate-${viewport.width}.png`) });
    await page.getByRole('button', { name: '3s', exact: true }).click();
    await page.getByRole('button', { name: 'Create GIF', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'GIF ready', exact: true })).toBeVisible({ timeout: 60000 });
    await expect(page.locator('p').filter({ hasText: /320.*240.*3\.0s/ })).toBeVisible();
    await page.getByRole('button', { name: 'Make smaller', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('320 × 240 at 10 FPS (480p maximum)');
    await expect(source).toContainText(filename);
    await expect(page.getByLabel('Top text')).toHaveValue('PRIVATE CAPTION');
    expect(
      await page.evaluate(() => JSON.stringify((window as typeof window & { dataLayer: unknown[] }).dataLayer)),
    ).not.toContain('PRIVATE');
    await page.getByRole('button', { name: 'Start over', exact: true }).click();
    await expect(source).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Choose video', exact: true })).toBeVisible();
  });
}

for (const available of [2.98, 4.98, 9.98]) {
  test(`retains a full-clip shortcut just below ${Math.round(available)}s`, async ({ page }) => {
    // Exercise raw media metadata precision independently of the trim controls' 0.1s rounding.
    await page.addInitScript((duration) => {
      Object.defineProperty(HTMLMediaElement.prototype, 'duration', { get: () => duration });
    }, available);
    await page.goto('/video-to-gif');
    await page.getByLabel('Upload video', { exact: true }).setInputFiles('tests/fixtures/visual-timeline.webm');
    const duration = page.getByLabel('Duration', { exact: true });
    await duration.fill('1');
    await duration.press('Enter');
    await expect(page.getByRole('button', { name: `${Math.round(available)}s`, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: `Full clip · ${available.toFixed(1)}s`, exact: true }).click();
    await expect(duration).toHaveValue(available.toFixed(1));
    await expect(page.getByLabel('Start time', { exact: true })).toHaveValue('00:00.0');
  });
}
