import { test, expect } from '@playwright/test';
import { DEMO_VIDEO_EMBED_URL, CHROME_EXTENSION_URL } from '../lib/constants';

test.describe('Welcome Page Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page).toHaveTitle(/Welcome to YTgify/);
  });

  test('success message is visible', async ({ page }) => {
    await page.goto('/welcome');
    const heading = page.getByRole('heading', { name: /You're all set!/i });
    await expect(heading).toBeVisible();
  });

  test('page has noindex meta tag', async ({ page }) => {
    await page.goto('/welcome');
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta.first()).toHaveAttribute('content', /noindex/);
  });

  test('demo video iframe is present', async ({ page }) => {
    await page.goto('/welcome');
    const iframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', DEMO_VIDEO_EMBED_URL);
  });

  test('Try it now on YouTube button is visible and links correctly', async ({ page }) => {
    await page.goto('/welcome');
    const ytButton = page.getByRole('link', { name: /Try it now on YouTube/i });
    await expect(ytButton).toBeVisible();
    await expect(ytButton).toHaveAttribute('href', 'https://www.youtube.com');
    await expect(ytButton).toHaveAttribute('target', '_blank');
  });

  test('quick tips section is visible', async ({ page }) => {
    await page.goto('/welcome');
    const tipsHeading = page.getByRole('heading', { name: /Quick tips/i });
    await expect(tipsHeading).toBeVisible();

    // Verify tip items are present
    await expect(page.getByText(/pink GIF button/i).first()).toBeVisible();
    await expect(page.getByText(/max 10 seconds/i)).toBeVisible();
    await expect(page.getByText(/No watermark/i)).toBeVisible();
  });

  test('rating CTA is visible', async ({ page }) => {
    await page.goto('/welcome');
    const ratingHeading = page.getByRole('heading', { name: /Enjoying YTgify/i });
    await expect(ratingHeading).toBeVisible();

    const reviewLink = page.getByRole('link', { name: /Leave a review/i });
    await expect(reviewLink).toBeVisible();
    await expect(reviewLink).toHaveAttribute('href', `${CHROME_EXTENSION_URL}/reviews`);
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/welcome');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check footer links
    await expect(page.locator('footer').getByRole('link', { name: /Privacy Policy/i })).toBeVisible();
  });

  test('where to find it section is visible', async ({ page }) => {
    await page.goto('/welcome');
    const heading = page.getByRole('heading', { name: /Where to find it/i });
    await expect(heading).toBeVisible();
    await expect(page.getByText(/like\/dislike buttons/i)).toBeVisible();
  });
});
