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
    const questions = await page.getByRole('region', { name: 'Help' }).locator('summary').allTextContents();
    expect(questions).toHaveLength(4);
    expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(questions);
  });

  test('publishes the worked example without automatically fetching either download', async ({ page, request }) => {
    const mediaRequests: string[] = [];
    page.on('request', (entry) => {
      if (/\/samples\/video-to-gif\/[^/]+\.(gif|mp4)$/.test(entry.url())) mediaRequests.push(entry.url());
    });

    await page.goto('/video-to-gif');
    const example = page.getByRole('region', { name: 'MP4 to GIF example' });
    await example.scrollIntoViewIfNeeded();
    const before = example.getByRole('region', { name: 'Before' });
    const after = example.getByRole('region', { name: 'After' });
    await expect(before).toContainText('15-second MP4');
    await expect(after).toContainText('4-second GIF');
    await expect(before.getByRole('img')).toHaveJSProperty('naturalWidth', 640);
    await expect(after.getByRole('img')).toHaveJSProperty('naturalWidth', 640);
    await expect(example).toContainText('00:08–00:12');
    await expect(example.getByRole('link', { name: 'CC BY 3.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/3.0/',
    );
    expect(mediaRequests).toEqual([]);

    const gifLink = after.getByRole('link', { name: /View GIF/ });
    const mp4Link = before.getByRole('link', { name: 'Download MP4' });
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

  test('renders a scannable guide with direct links and accessible help', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/video-to-gif');
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');
    const guide = page.locator('article');
    await expect(guide.getByRole('heading', { level: 2 })).toHaveText([
      'How to make a GIF',
      'MP4 to GIF example',
      'Formats & limits',
      'Help',
    ]);
    await expect(guide.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByText(/H.264 MP4 or WebM works best/)).toBeVisible();
    const limits = guide.getByRole('region', { name: 'Formats & limits' });
    await expect(limits).toContainText('250 MB and 30 minutes');
    await expect(limits).toContainText('Up to 10 seconds');
    await expect(page.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#how-it-works');
    await expect(page.getByRole('link', { name: 'Install the YTgify Chrome extension' })).toHaveAttribute(
      'href',
      '/#install',
    );

    const navigation = guide.getByRole('navigation', { name: 'Converter guide' });
    await expect(navigation.getByRole('link', { name: 'Example' })).toHaveAttribute('href', '#mp4-to-gif-example');
    await expect(navigation.getByRole('link', { name: 'Formats & limits' })).toHaveAttribute(
      'href',
      '#formats-and-limits',
    );
    await navigation.getByRole('link', { name: 'Help' }).click();
    await expect(page).toHaveURL(/#video-gif-faq$/);

    const help = guide.getByRole('region', { name: 'Help' });
    await expect(guide.locator('section:target')).toHaveAttribute('id', 'video-gif-faq');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
    await expect(help.locator('details[open]')).toHaveCount(0);
    const size = help.locator('summary').filter({ hasText: 'How can I make the GIF smaller?' });
    await size.focus();
    await size.press('Enter');
    await expect(help.getByRole('link', { name: 'Compress an existing GIF' })).toBeVisible();
    await expect(help.getByRole('link', { name: 'Compress an existing GIF' })).toHaveAttribute(
      'href',
      '/gif-compressor',
    );
    await size.press('Enter');
    await expect(help.getByRole('link', { name: 'Compress an existing GIF' })).toBeHidden();
    await help.getByText('Does YTgify upload my video?', { exact: true }).click();
    await expect(help.getByText(/Your video and captions stay in your browser/)).toBeVisible();
    await help.getByText('Can I paste a YouTube URL?', { exact: true }).click();
    await expect(help.getByRole('link', { name: 'use the desktop Chrome extension' })).toHaveAttribute(
      'href',
      '/#install',
    );

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
