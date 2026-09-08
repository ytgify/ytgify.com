import { test, expect } from '@playwright/test';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('worker cancellation, replacement and ten jobs retain bounded resources', async ({ page, browserName }, info) => {
  test.skip(browserName !== 'chromium', 'CDP heap observation is Chromium-specific.');
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const NativeWorker = Worker;
    const observations = { active: 0, gaps: [] as number[], urls: new Set<string>() };
    (window as typeof window & { __jobs?: typeof observations }).__jobs = observations;
    window.Worker = class extends NativeWorker {
      private live = true;
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        observations.active++;
      }
      terminate() {
        if (this.live) {
          observations.active--;
          this.live = false;
        }
        super.terminate();
      }
    };
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (object) => {
      const url = create(object);
      observations.urls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      observations.urls.delete(url);
      revoke(url);
    };
    let last = performance.now();
    setInterval(() => {
      const now = performance.now();
      observations.gaps.push(now - last);
      last = now;
    }, 100);
  });
  await page.goto('/gif-compressor');
  const input = page.getByLabel('Choose a GIF', { exact: true });
  await input.setInputFiles(path.resolve('tests/fixtures/gif/natural-bunny-4.gif'));
  await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
  await page.getByLabel('Target size (MB)').fill('0.000001');
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  const start = Date.now();
  await page.getByRole('button', { name: 'Cancel processing', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeEnabled();
  const cancellationMs = Date.now() - start;
  expect(cancellationMs).toBeLessThanOrEqual(1000);
  await page.waitForTimeout(300);
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    (window as typeof window & { __jobs?: { gaps: number[] } }).__jobs!.gaps = [];
  });
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible({ timeout: 65000 });
  const processingHeartbeatMs = await page.evaluate(() =>
    Math.max(...(window as typeof window & { __jobs?: { gaps: number[] } }).__jobs!.gaps),
  );
  expect(processingHeartbeatMs).toBeLessThanOrEqual(250);
  const cdp = await page.context().newCDPSession(page);
  const heaps = [];
  const residentBytes: number[] = [];
  const browserCdp = await page.context().browser()!.newBrowserCDPSession();
  for (let job = 0; job < 10; job++) {
    await input.setInputFiles(path.resolve(`tests/fixtures/gif/natural-bunny-${(job % 6) + 1}.gif`));
    await expect(page.getByRole('button', { name: 'Compress GIF', exact: true })).toBeVisible();
    await page.getByLabel('Target size (MB)').fill('1');
    await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Download GIF', exact: true })).toBeVisible();
    await cdp.send('HeapProfiler.collectGarbage');
    heaps.push((await cdp.send('Runtime.getHeapUsage')).usedSize);
    await page.waitForTimeout(500);
    const processes = (await browserCdp.send('SystemInfo.getProcessInfo')).processInfo;
    const rss = execFileSync('ps', [
      '-o',
      'rss=',
      '-p',
      processes.map((process: { id: number }) => process.id).join(','),
    ])
      .toString()
      .trim()
      .split(/\s+/)
      .map(Number);
    residentBytes.push(rss.reduce((sum, value) => sum + value * 1024, 0));
    expect(await page.evaluate(() => (window as typeof window & { __jobs?: { active: number } }).__jobs?.active)).toBe(
      0,
    );
  }
  const observation = await page.evaluate(() => {
    const data = (window as typeof window & { __jobs?: { gaps: number[]; urls: Set<string> } }).__jobs!;
    return { maximumHeartbeatGapMs: Math.max(...data.gaps), liveBlobUrls: data.urls.size };
  });
  expect(heaps.at(-1)! - heaps[0]).toBeLessThan(20 * 1024 * 1024);
  expect(residentBytes.at(-1)! - residentBytes[0]).toBeLessThan(20 * 1024 * 1024);
  expect(observation.liveBlobUrls).toBeLessThanOrEqual(2);
  // Forced GC is measured separately; it can delay this main-thread heartbeat.
  writeFileSync(
    info.outputPath('lifecycle-receipt.json'),
    JSON.stringify(
      {
        cancellationMs,
        processingHeartbeatMs,
        heaps,
        residentBytes,
        observation,
        memoryScope:
          'heaps: main renderer JavaScript bytes; residentBytes: summed OS RSS for this test browser processes reported by CDP; neither is the app-owned pixel budget',
      },
      null,
      2,
    ),
  );
  await info.attach('lifecycle-receipt', {
    body: JSON.stringify({
      cancellationMs,
      heaps,
      observation,
      memoryScope:
        'heaps: main renderer JavaScript bytes; residentBytes: summed OS RSS for this test browser processes reported by CDP; neither is the app-owned pixel budget',
    }),
    contentType: 'application/json',
  });
  await page.getByRole('button', { name: 'Compress GIF', exact: true }).click();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
