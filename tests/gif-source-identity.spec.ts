import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
]) {
  test(`loaded GIF identity survives replacement and reselection at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/gif-compressor');
    const button = page.getByRole('button', { name: 'Choose a GIF', exact: true });
    const picker = page.getByLabel('Choose a GIF', { exact: true });
    await button.focus();
    const chooserEvent = page.waitForEvent('filechooser');
    await button.press('Enter');
    await (await chooserEvent).setFiles(path.resolve('tests/fixtures/gif/compressible.gif'));
    await expect(page.getByText('Loaded GIF: compressible.gif', { exact: true })).toBeVisible();
    await expect(picker).toBeHidden();
    await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '10 KB', exact: true }).click();
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    await picker.setInputFiles(path.resolve('tests/fixtures/gif/crop-grid.gif'));
    await expect(page.getByText('Loaded GIF: crop-grid.gif', { exact: true })).toBeVisible();
    await expect(page.getByText('Loaded GIF: compressible.gif', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
    await picker.setInputFiles(path.resolve('tests/fixtures/gif/crop-grid.gif'));
    await expect(page.getByText('Loaded GIF: crop-grid.gif', { exact: true })).toBeVisible();
    const longName = `${'synthetic-long-name-'.repeat(10)}.gif`;
    await picker.setInputFiles({
      name: longName,
      mimeType: 'image/gif',
      buffer: readFileSync('tests/fixtures/gif/compressible.gif'),
    });
    await expect(page.getByText(`Loaded GIF: ${longName}`, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.reload();
    await expect(button).toBeVisible();
    await expect(page.getByText(/^Loaded GIF:/)).toHaveCount(0);
    await expect(page.getByRole('img', { name: 'Original animation', exact: true })).toHaveCount(0);
  });
}
