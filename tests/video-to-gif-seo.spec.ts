import { expect, test } from '@playwright/test';

test.describe('public video to GIF launch surface', () => {
  test('publishes intent-focused metadata and canonical URL', async ({ page }) => {
    await page.goto('/video-to-gif');
    await expect(page).toHaveTitle('Free Video to GIF Converter - Private, No Watermark | YTgify');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ytgify.com/video-to-gif');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Convert your own MP4, MOV, or WebM/i,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index/);
    await expect(page.getByRole('heading', { level: 1, name: 'Free Video to GIF Converter' })).toBeVisible();
    await expect(page.getByText('Studio', { exact: false })).toHaveCount(0);
  });

  test('exposes application, how-to, breadcrumb, and FAQ structured data', async ({ page }) => {
    await page.goto('/video-to-gif');
    const application = JSON.parse(
      (await page.locator('script[data-schema="video-to-gif-application"]').textContent()) || '{}',
    );
    const types = application['@graph'].map((entry: { '@type': string }) => entry['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebApplication', 'HowTo', 'BreadcrumbList']));
    expect(application['@graph'][0].offers.price).toBe('0');

    const faq = JSON.parse((await page.locator('script[data-schema="video-to-gif-faq"]').textContent()) || '{}');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(6);
  });

  test('publishes the worked example without automatically fetching either download', async ({ page, request }) => {
    const mediaRequests: string[] = [];
    page.on('request', (entry) => {
      if (/\/samples\/video-to-gif\/[^/]+\.(gif|mp4)$/.test(entry.url())) mediaRequests.push(entry.url());
    });

    await page.goto('/video-to-gif');
    const example = page.getByRole('region', { name: 'MP4 to GIF example' });
    await example.scrollIntoViewIfNeeded();
    await expect(example.getByRole('img')).toHaveJSProperty('naturalWidth', 640);
    await expect(example).toContainText('00:08–00:12');
    await expect(example.getByRole('link', { name: 'CC BY 3.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/3.0/',
    );
    expect(mediaRequests).toEqual([]);

    const gifLink = example.getByRole('link', { name: /View GIF/ });
    const mp4Link = example.getByRole('link', { name: 'Download sample MP4' });
    await expect(mp4Link).toHaveAttribute('download', '');
    const [gif, mp4] = await Promise.all([
      request.get((await gifLink.getAttribute('href'))!),
      request.get((await mp4Link.getAttribute('href'))!),
    ]);
    await expect(gif).toBeOK();
    await expect(mp4).toBeOK();
    const gifBytes = await gif.body();
    expect(gifBytes.subarray(0, 3).toString('ascii')).toBe('GIF');
    expect((await mp4.body()).subarray(4, 8).toString('ascii')).toBe('ftyp');
    await expect(gifLink).toContainText(`${(gifBytes.length / 1_000_000).toFixed(2)} MB`);
  });

  test('renders crawlable privacy, compatibility, limits, and workflow answers', async ({ page }) => {
    await page.goto('/video-to-gif');
    await expect(page.getByRole('heading', { name: 'Convert video to GIF in three steps' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Private by design' })).toBeVisible();
    await expect(page.getByText(/250 MB and 30 minute source limits/)).toBeVisible();
    await expect(page.getByText(/H.264 MP4 or WebM works best/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get a usable GIF from your video file' })).toBeVisible();
    await expect(
      page.locator('section[aria-labelledby="file-and-output-help"] a[href="/gif-compressor"]'),
    ).toBeVisible();
    await expect(page.getByText(/does not send your source media, filename, or captions/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#how-it-works');
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Install the YTgify Chrome extension' })).toHaveAttribute(
      'href',
      '/#install',
    );
    await expect(page.getByRole('link', { name: 'View the extension' })).toHaveAttribute('href', '/#install');

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('is discoverable from the homepage, footer, and sitemap', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Open video to GIF converter/i })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Video to GIF Converter' })).toBeVisible();

    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('<loc>https://ytgify.com/video-to-gif</loc>');
    expect(sitemap).toContain('<lastmod>2026-10-02');
  });
});
