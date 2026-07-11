import { test, expect } from '@playwright/test';
import { DEMO_VIDEO_EMBED_URL } from '../lib/constants';

test.describe('Landing Page Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/YTgify/);
  });

  test('headline is visible', async ({ page }) => {
    await page.goto('/');
    const headline = page.getByRole('heading', { name: /YouTube to GIF Converter/i });
    await expect(headline).toBeVisible();
  });

  test('homepage exposes search-focused metadata and FAQ content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('YouTube to GIF Converter - Free, No Watermark | YTgify');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Turn YouTube videos into GIFs for free/i);
    await expect(page.getByRole('heading', { name: /Common questions, answered/i })).toBeVisible();
    await expect(page.getByText(/How do I turn a YouTube video into a GIF/i)).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"][data-schema="faq"]')).toHaveCount(1);
  });

  test('demo section follows the hero narrative', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/See YTgify in live action/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /See it in action/i })).toBeVisible();
    await expect(page.getByText(/Ready to add it to Chrome/i)).toBeVisible();
    await expect(page.getByText(/Product demo/i)).toHaveCount(0);
    await expect(page.getByText(/Install in about a minute/i)).toHaveCount(0);
  });

  test('landing download link is centralized in install section', async ({ page }) => {
    await page.goto('/');
    const downloadLinks = page.locator('a[href*="/downloads/ytgify"]');
    await expect(downloadLinks.first()).toBeVisible();
    await expect(downloadLinks).toHaveCount(1);
    await expect(page.locator('#install a[href*="/downloads/ytgify"]')).toHaveCount(1);
  });

  test('landing install CTAs lead to install walkthrough', async ({ page }) => {
    await page.goto('/');
    const navInstallLinks = page.getByRole('navigation', { name: /Page sections/i }).locator('a[href="#install"]');
    await expect(navInstallLinks).toHaveCount(2);
    await expect(page.getByRole('link', { name: /Install Chrome Extension/i }).first()).toHaveAttribute('href', '#install');
    await expect(page.locator('#demo').getByRole('link', { name: /Install Chrome Extension/i })).toHaveAttribute('href', '#install');
    await expect(page.getByRole('link', { name: /View install walkthrough/i })).toHaveAttribute('href', '#install');
    await expect(page.locator('#demo').getByRole('link', { name: /View walkthrough/i })).toHaveAttribute('href', '#install');
    await expect(page.locator('a[href="/install"]')).toHaveCount(0);
  });

  test('studio is not exposed while in development', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/studio"]')).toHaveCount(0);
    await expect(page.getByText(/Try Studio/i)).toHaveCount(0);

    const response = await page.goto('/studio');
    expect(response?.status()).toBe(404);
  });

  test('landing install walkthrough is interactive', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('img', { name: /Developer mode off/i })).toBeVisible();
    await expect(page.getByText(/Double-click the screenshot to enlarge it/i)).toBeVisible();
    await page.getByRole('button', { name: /Turn on Developer mode/i }).click();
    await expect(page.getByText(/Chrome reveals the Load unpacked button/i)).toBeVisible();
    await expect(page.getByRole('img', { name: /Developer mode on and Load unpacked visible/i })).toBeVisible();
    await page.getByRole('button', { name: /Select extracted folder/i }).click();
    await expect(page.getByText(/Select the folder that contains the extension files/i)).toBeVisible();
    await expect(page.getByRole('img', { name: /ytgify-v1\.0\.19-chrome folder selected/i })).toBeVisible();
    await page.getByRole('button', { name: /Confirm YTgify loaded/i }).click();
    await expect(page.getByRole('img', { name: /YTgify extension card loaded/i })).toBeVisible();
  });

  test('landing install screenshots expand into a guided carousel', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Expand screenshot for Open Chrome extensions/i }).dblclick();

    const dialog = page.getByRole('dialog', { name: /Manual install screenshot carousel/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Step 1 of 4/i)).toBeVisible();
    await expect(dialog.getByRole('img', { name: /Developer mode off/i })).toBeVisible();
    await expect(dialog.getByText(/Developer mode starts off/i)).toBeVisible();

    await dialog.getByRole('button', { name: /Next/i }).click();
    await expect(dialog.getByText(/Step 2 of 4/i)).toBeVisible();
    await expect(dialog.getByText(/Enable Developer mode/i)).toBeVisible();
    await expect(dialog.getByRole('img', { name: /Developer mode on and Load unpacked visible/i })).toBeVisible();

    await dialog.getByRole('button', { name: /Close screenshot carousel/i }).click();
    await expect(dialog).toBeHidden();
  });

  test('landing nav stays visible while scrolling', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /Page sections/i });
    const before = await nav.boundingBox();
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(100);
    const after = await nav.boundingBox();

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(after!.y).toBeLessThanOrEqual(1);
  });

  test('demo video iframe is present', async ({ page }) => {
    await page.goto('/');
    const iframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', DEMO_VIDEO_EMBED_URL);
  });

  test('privacy policy link works', async ({ page }) => {
    await page.goto('/');
    const privacyLink = page.getByRole('link', { name: /Privacy Policy/i });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', /privacy-policy/);
  });

  test('features section is visible', async ({ page }) => {
    await page.goto('/');
    const featuresHeading = page.getByRole('heading', { name: /See it in action/i });
    await expect(featuresHeading).toBeVisible();
  });

  test('GitHub social link is visible and correct', async ({ page }) => {
    await page.goto('/');
    const githubLink = page.locator('footer').getByRole('link', { name: 'GitHub' });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/ytgify');
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('X (Twitter) social link is visible and correct', async ({ page }) => {
    await page.goto('/');
    const xLink = page.locator('footer').getByRole('link', { name: /X \(Twitter\)/i });
    await expect(xLink).toBeVisible();
    await expect(xLink).toHaveAttribute('href', 'https://x.com/neonwatty');
    await expect(xLink).toHaveAttribute('target', '_blank');
  });

  test('external Blog social link is visible and correct', async ({ page }) => {
    await page.goto('/');
    const blogLink = page.locator('footer a[href="https://neonwatty.com/"]');
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('target', '_blank');
  });

  test('internal Blog link is visible', async ({ page }) => {
    await page.goto('/');
    const blogLink = page.locator('footer a[href="/blog"]');
    await expect(blogLink).toBeVisible();
  });

  test('all social links have security attributes', async ({ page }) => {
    await page.goto('/');
    const socialLinks = page.locator('footer a[target="_blank"][rel="noopener noreferrer"]').filter({
      has: page.locator('svg')
    });
    await expect(socialLinks).toHaveCount(5);
  });
});
