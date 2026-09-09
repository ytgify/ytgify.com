import { test, expect } from '@playwright/test';
import { gunzipSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';

// Exercise analytics ingestion, which deliberately filters the default HeadlessChrome bot UA.
test.use({
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
});

test('enabled PostHog sends only allowlisted tool outcomes across success, cancel and error', async ({
  page,
}, info) => {
  test.skip(process.env.PRIVACY_QA !== '1', 'Run against a local build with the dedicated test PostHog key and host.');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined });
  });
  const events: { event: string; properties: Record<string, unknown> }[] = [];
  const requests: string[] = [];
  await page.route('**/posthog/**', async (route) => {
    const request = route.request();
    const body = request.postDataBuffer();
    if (body && !request.url().includes('/flags')) {
      let text = body.toString();
      if (body[0] === 31 && body[1] === 139) text = gunzipSync(body).toString();
      const parsed = JSON.parse(text);
      events.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    }
    await route.fulfill({
      contentType: 'application/json',
      body: request.url().includes('/flags') ? '{"featureFlags":{},"sessionRecording":false}' : '{"status":1}',
    });
  });
  await page.route(
    /google-analytics.com|analytics.google.com|googletagmanager.com|doubleclick.net|google.com\/measurement/,
    (route) => route.abort(),
  );
  page.on('request', (request) => requests.push(`${request.url()} ${request.postData() || ''}`));
  await page.goto('/gif-compressor?private=SECRET_QUERY');
  await page.getByLabel('Choose a GIF', { exact: true }).setInputFiles({
    name: 'SECRET_FILENAME.gif',
    mimeType: 'image/gif',
    buffer: readFileSync('tests/fixtures/gif/natural-bunny-4.gif'),
  });
  await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
  await page.getByLabel('Target size (MB)').fill('0.000001');
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel processing' }).click();
  await page.getByLabel('Target size (MB)').fill('1');
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Download GIF', exact: true }).click();
  await page
    .getByLabel('Choose a GIF', { exact: true })
    .setInputFiles({ name: 'SECRET_BROKEN.gif', mimeType: 'image/gif', buffer: Buffer.from('broken') });
  await expect(page.locator('p[role=alert]')).toBeVisible();
  await expect.poll(() => events.some((event) => event.properties.outcome === 'error'), { timeout: 15000 }).toBe(true);
  expect(events.length).toBeGreaterThan(3);
  for (const event of events) {
    expect(event.event).toBe('gif_tool_activity');
    expect(Object.keys(event.properties).sort()).toEqual(['$geoip_disable', 'distinct_id', 'outcome', 'token', 'tool']);
  }
  expect(events.map((event) => event.properties.outcome)).toEqual(
    expect.arrayContaining(['view', 'start', 'cancel', 'success', 'download', 'error']),
  );
  expect(requests.some((request) => /googletagmanager|google-analytics|analytics.google/.test(request))).toBe(false);
  expect(JSON.stringify(events)).not.toMatch(/SECRET|blob:|filename|caption/i);
  expect(
    requests.filter((request) => !request.includes('/gif-compressor?private=SECRET_QUERY')).join('\n'),
  ).not.toMatch(/SECRET_FILENAME|SECRET_BROKEN/);
  writeFileSync(info.outputPath('actual-posthog-events.json'), JSON.stringify(events, null, 2));
  await info.attach('actual-posthog-events', { body: JSON.stringify(events), contentType: 'application/json' });
});
