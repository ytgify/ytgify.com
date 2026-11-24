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

  test('clean and legacy tagged URLs serve the only converter URL listed in the sitemap', async ({ page, request }) => {
    const canonical = 'https://ytgify.com/video-to-gif';
    for (const url of ['/video-to-gif', '/video-to-gif?entry=footer']) {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      await expect(page.getByRole('heading', { level: 1, name: 'Free Video to GIF Converter' })).toBeVisible();
    }

    const sitemap = await (await request.get('/sitemap.xml')).text();
    const converterLocations = sitemap.match(/<loc>https:\/\/ytgify\.com\/video-to-gif[^<]*<\/loc>/g);
    expect(converterLocations).toEqual([`<loc>${canonical}</loc>`]);
    expect(sitemap).toContain('<lastmod>2026-10-02');
  });

  test.describe('server-rendered converter links', () => {
    test.use({ javaScriptEnabled: false });

    test('homepage, shared footer, and guides expose clean anchors before hydration', async ({ page }) => {
      const taggedLinks = page.locator('a[href^="/video-to-gif?"]');
      await page.goto('/');
      await expect(page.locator('a[href="/video-to-gif"]')).toHaveCount(6);
      await expect(taggedLinks).toHaveCount(0);

      for (const slug of ['how-to-create-gif-from-youtube-video', 'best-gif-settings-for-social-media']) {
        await page.goto(`/blog/${slug}`);
        await expect(page.locator('article a[href="/video-to-gif"]')).toBeVisible();
        await expect(page.locator('footer a[href="/video-to-gif"]')).toBeVisible();
        await expect(taggedLinks).toHaveCount(0);
      }

      await page.goto('/blog');
      await expect(page.locator('footer a[href="/video-to-gif"]')).toBeVisible();
    });
  });
});
