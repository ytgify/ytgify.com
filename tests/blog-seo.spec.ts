import { expect, test } from '@playwright/test';

const guides = [
  {
    slug: 'how-to-create-gif-from-youtube-video',
    heading: 'How to Create a GIF from a YouTube Video',
    evidence: ['installed manually in Chrome', '1 to 20 seconds', '144p, 240p, 360p, 480p'],
  },
  {
    slug: 'best-gif-settings-for-social-media',
    heading: 'Best GIF Settings for Sharing: Resolution, FPS, and Length',
    evidence: ['Quick settings by sharing goal', 'YTgify starting points', '5, 10, or 15 FPS'],
  },
  {
    slug: 'youtube-to-gif-free-no-watermark',
    heading: 'YouTube to GIF Without a Watermark: What Stays Local',
    evidence: ['What “local” means here', 'Current practical limits', 'processing is local'],
  },
];

test.describe('evidence-backed guide cluster', () => {
  for (const guide of guides) {
    test(`${guide.slug} exposes matching visible and structured evidence`, async ({ page }) => {
      await page.goto(`/blog/${guide.slug}`);

      await expect(page.getByRole('heading', { level: 1, name: guide.heading })).toBeVisible();
      const evidenceRow = page.getByTestId('article-evidence');
      await expect(evidenceRow).toContainText('By Jeremy Watt');
      await expect(evidenceRow).toContainText('Updated July 11, 2026');
      await expect(evidenceRow).toContainText('Tested with YTgify v1.0.19');
      await expect(page.getByRole('complementary', { name: 'About the author' })).toContainText('Jeremy Watt');

      for (const text of guide.evidence) {
        await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
      }

      const articleSchema = page.locator('script[data-schema="article"]');
      const schema = JSON.parse((await articleSchema.textContent()) || '{}');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe(guide.heading);
      expect(schema.author.name).toBe('Jeremy Watt');
      expect(schema.dateModified).toBe('2026-07-11');
      expect(schema.datePublished).toMatch(/^2025-/);
    });
  }

  test('guides link to the rest of the cluster and the install walkthrough', async ({ page }) => {
    await page.goto('/blog/how-to-create-gif-from-youtube-video');

    await expect(page.locator('a[href="/blog/best-gif-settings-for-social-media"]').first()).toBeVisible();
    await expect(page.locator('a[href="/blog/youtube-to-gif-free-no-watermark"]').first()).toBeVisible();
    await expect(page.locator('a[href="/#install"]').first()).toBeVisible();
  });

  test('homepage presents all three verified guides', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Get a better GIF on the first export' })).toBeVisible();
    for (const guide of guides) {
      await expect(page.locator(`a[href="/blog/${guide.slug}"]`).first()).toBeVisible();
    }
  });

  test('blog index preloads its above-the-fold guide cover', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveAttribute(
      'href',
      '/blog/images/youtube-to-gif-no-watermark-local.png',
    );
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
      expect(sitemap).toContain(`<loc>https://ytgify.com/blog/${guide.slug}</loc>`);
    }
    expect(sitemap.match(/<lastmod>2026-07-11/g)).toHaveLength(5);

    const keyResponse = await request.get('/d1fc505c0bd2b087bc463a1b955f0f13.txt');
    expect(keyResponse.ok()).toBeTruthy();
    expect((await keyResponse.text()).trim()).toBe('d1fc505c0bd2b087bc463a1b955f0f13');
  });
});
