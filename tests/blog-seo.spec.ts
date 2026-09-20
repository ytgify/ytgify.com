import { expect, test } from '@playwright/test';

const guides = [
  {
    slug: 'how-to-create-gif-from-youtube-video',
    updated: '2026-09-06',
    updatedLabel: 'September 6, 2026',
    heading: 'How to Create a GIF from a YouTube Video',
    evidence: ['installed manually in Chrome', '1 to 20 seconds', '144p, 240p, 360p, 480p'],
  },
  {
    slug: 'best-gif-settings-for-social-media',
    updated: '2026-09-06',
    updatedLabel: 'September 6, 2026',
    heading: 'Best GIF Settings for Sharing: Resolution, FPS, and Length',
    evidence: ['Quick settings by sharing goal', 'YTgify starting points', '5, 10, or 15 FPS'],
  },
  {
    slug: 'youtube-to-gif-free-no-watermark',
    updated: '2026-07-11',
    updatedLabel: 'July 11, 2026',
    heading: 'YouTube to GIF Without a Watermark: What Stays Local',
    evidence: ['What “local” means here', 'Current practical limits', 'processing is local'],
  },
  {
    slug: 'how-to-compress-a-gif',
    updated: '2026-09-20',
    updatedLabel: 'September 20, 2026',
    heading: 'How to Compress a GIF Without Losing Too Much Quality',
    evidence: ['Compress a GIF step by step', 'Allow smaller dimensions', 'Why a target might not be met'],
  },
];

test.describe('evidence-backed guide cluster', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
  });

  for (const guide of guides) {
    test(`${guide.slug} exposes matching visible and structured evidence`, async ({ page }) => {
      await page.goto(`/blog/${guide.slug}`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { level: 1, name: guide.heading })).toBeVisible();
      const evidenceRow = page.getByTestId('article-evidence');
      await expect(evidenceRow).toContainText('By Jeremy Watt');
      await expect(evidenceRow).toContainText(
        guide.slug === 'how-to-compress-a-gif' ? `Published ${guide.updatedLabel}` : `Updated ${guide.updatedLabel}`,
      );
      if (guide.slug !== 'how-to-compress-a-gif') {
        await expect(evidenceRow).toContainText('Tested with YTgify v1.0.19');
      }
      await expect(page.getByRole('complementary', { name: 'About the author' })).toContainText('Jeremy Watt');

      for (const text of guide.evidence) {
        await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
      }

      const articleSchema = page.locator('script[data-schema="article"]');
      const schema = JSON.parse((await articleSchema.textContent()) || '{}');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe(guide.heading);
      expect(schema.author.name).toBe('Jeremy Watt');
      expect(schema.dateModified).toBe(guide.updated);
      expect(schema.datePublished).toMatch(guide.slug === 'how-to-compress-a-gif' ? /^2026-/ : /^2025-/);
    });
  }

  test('guides link to the rest of the cluster and the install walkthrough', async ({ page }) => {
    await page.goto('/blog/how-to-create-gif-from-youtube-video', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('a[href="/blog/best-gif-settings-for-social-media"]').first()).toBeVisible();
    await expect(page.locator('a[href="/blog/youtube-to-gif-free-no-watermark"]').first()).toBeVisible();
    await expect(page.locator('a[href="/#install"]').first()).toBeVisible();
  });

  test('homepage presents verified guides and the compressor', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Get a better GIF on the first export' })).toBeVisible();
    for (const guide of guides) {
      if (guide.slug !== 'how-to-compress-a-gif') {
        await expect(page.locator(`a[href="/blog/${guide.slug}"]`).first()).toBeVisible();
      }
    }
    await expect(page.getByRole('link', { name: 'Open GIF compressor' })).toHaveAttribute('href', '/gif-compressor');
  });

  test('blog index preloads its above-the-fold guide cover', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveAttribute(
      'href',
      '/blog/images/gif-settings-resolution-fps-length.png',
    );
  });

  test('compressor discovery links remain usable on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Work with your own media files' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open GIF compressor' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    await page.goto('/blog/how-to-compress-a-gif', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: guides[3].heading })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GIF compressor', exact: true }).first()).toHaveAttribute(
      'href',
      '/gif-compressor',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('robots policy explicitly permits OAI-SearchBot', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const robots = await response.text();
    expect(robots).toMatch(/User-agent: OAI-SearchBot\s+Allow: \//);
    expect(robots).toContain('Sitemap: https://ytgify.com/sitemap.xml');
  });

  test('sitemap exposes refreshed guide dates and the IndexNow key is public', async ({ request }) => {
    const sitemapResponse = await request.get('/sitemap.xml');
    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemap = await sitemapResponse.text();

    for (const guide of guides) {
      expect(sitemap.replace(/>\s+</g, '><')).toContain(
        `<loc>https://ytgify.com/blog/${guide.slug}</loc><lastmod>${guide.updated}`,
      );
    }
    expect(sitemap.replace(/>\s+</g, '><')).toContain(
      '<loc>https://ytgify.com/gif-compressor</loc><lastmod>2026-09-12',
    );

    const keyResponse = await request.get('/d1fc505c0bd2b087bc463a1b955f0f13.txt');
    expect(keyResponse.ok()).toBeTruthy();
    expect((await keyResponse.text()).trim()).toBe('d1fc505c0bd2b087bc463a1b955f0f13');
  });
});
