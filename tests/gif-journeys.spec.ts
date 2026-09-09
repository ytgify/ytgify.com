import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

async function save(page: Page, info: TestInfo, name: string, kind = 'GIF') {
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: `Download ${kind}`, exact: true }).click();
  const file = info.outputPath(name);
  await (await pending).saveAs(file);
  await info.attach(name, { path: file });
  return file;
}

for (const name of ['natural-bunny-4', 'local-palette-alpha', 'variable-delays']) {
  test(
    `${name}: compressor to resize to MP4 preserves the measured timeline`,
    { tag: ['@compressor', '@resize', '@mp4'] },
    async ({ page }, info) => {
      test.setTimeout(60000);
      await page.goto('/gif-compressor');
      await page
        .getByLabel('Choose a GIF', { exact: true })
        .setInputFiles(path.resolve(`tests/fixtures/gif/${name}.gif`));
      await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
      const compressed = await save(page, info, 'compressed.gif');
      await page.goto('/resize-gif');
      await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(compressed);
      await page.getByLabel('Output width', { exact: true }).fill('128');
      await page.getByRole('button', { name: 'Resize GIF', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
      const resized = await save(page, info, 'resized.gif');
      await page.goto('/gif-to-mp4');
      await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles(resized);
      await expect(page.getByRole('button', { name: 'Create MP4', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Create MP4', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Download MP4', exact: true })).toBeVisible({ timeout: 30000 });
      const mp4 = await save(page, info, 'final.mp4', 'MP4');
      const receipt = execFileSync(process.env.GIF_ORACLE_PYTHON || 'python3', [
        'scripts/gif-fixtures/verify-product-export.py',
        'mp4',
        resized,
        mp4,
        '1',
      ]).toString();
      await info.attach('independent-final-pixels-and-timeline', { body: receipt, contentType: 'application/json' });
    },
  );
}
