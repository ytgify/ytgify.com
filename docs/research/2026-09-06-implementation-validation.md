# September 6 converter iteration: acceptance evidence

Local implementation and validation; not deployed or submitted for indexing.

## Changes

- Size targeting now estimates from actual output dimensions and frame count, filters candidate settings through the 80 MiB raw-frame budget, and recalculates after trim changes. Manual resolution/FPS selection turns off targeting.
- Targets are labeled “Aim for” and shown alongside a rough size range. The result preview reports actual size and whether the target was met. If even the smallest settings exceed the estimate, the editor asks for a shorter clip. This is not a hard file-size cap or an empirically calibrated estimate.
- Entry labels are restricted to homepage hero/nav, promo, footer, tutorial, and settings guide. Missing or unrecognized entry labels become `unknown`. Recognized entries report internal attribution; otherwise the historical document-referrer bucket remains a coarse fallback. A bookmarked/shared marked URL can retain its placement, so this is placement attribution rather than proof of the immediately previous page.
- Caption activation fires once per selected source, outside React state updaters, even after erasing and retyping. New file/reset allows another activation. Page-view reporting is guarded against Strict Mode effect replay.
- `studio_size_target_selected` records `size_target` (`auto`, 5, 10, 25). Export events carry that target; success/download carry `size_target_outcome` (`met`, `exceeded`, `not_requested`). No filename, text, full referrer, or raw user agent was added.
- Tutorial/settings guides link contextually to the local converter. Limits copy now says 30 minutes/250 MB for sources and 10 seconds for GIF selection. Historical duration buckets remain; longer sources use `5-10m` and `10-30m`.

## Three realistic failure modes

1. **Automatic settings exceed memory or ignore a longer trim.** Unit tests exercise duration, aspect ratio, target, actual dimensions/no upscaling, manual mode, and impossible budgets. Browser coverage changes a 3-second selection to 10 seconds and verifies automatic settings change, export remains enabled, and manual FPS disables the target.
2. **Long-source export decodes the wrong segment or produces an unusable download.** A real 370-second moving WebM fixture is loaded, trimmed to 360–363 seconds, captioned, exported, and downloaded in Chromium. FFprobe confirms 45 frames, 160×90, 346,815 bytes. Visual inspection of the decoded first frame shows the source's `00:06:00.000` timestamp and caption. Existing real-fixture download/export tests also pass in Chromium, Firefox, WebKit, and mobile Chromium. The long H.264 fixture is rejected by bundled Chromium; WebM is the tested fallback. The retained H.264 companion is not claimed as a verified long-source export.
3. **Telemetry inflates usage or entry links fail on mobile.** Browser assertions verify one caption event through typing/clearing/retyping, entry placement, source-duration bucket, target selections, successful export outcome, and download outcome. Unit dispatch tests cover allowlists and both analytics sinks. A 390px homepage-to-converter flow and both editorial links pass. Production PostHog ingestion and customer counts were not queried; network analytics are blocked during the new tests.

## Validation results

- 31 unit tests pass; configured coverage gate passes (89.52% branches).
- Pre-push passes: ESLint, formatting, TypeScript, Knip, CI boundaries, production build, route verification, and four Chromium smoke tests. Existing function-length warnings remain; no file-size ceiling increased.
- Final full browser run: **61/61 passed in 48.4 seconds**, with retries disabled, against a fresh production build. Command: `env -u PLAYWRIGHT_BASE_URL -u PLAYWRIGHT_SKIP_BUILD npm run test:e2e -- --workers=2 --retries=0`. This includes all three converter improvement tests, guide metadata/sitemap checks, and real fixture exports in Chromium, Firefox, WebKit, and mobile Chromium. The previous four failures are resolved in this complete run. New tests are included in the converter npm command and CI path/job selection. The HTML report is saved locally at `playwright-report/index.html`.
- The 15 FPS encoder currently rounds each frame delay to GIF timing units; this selected 3-second clip plays for 3.15 seconds. That existing timing behavior was observed, not changed in this iteration.

The saved local export is in `.ytgify-runtime/research-qa/converter-improvements-exp-1a937-urce-with-private-analytics-chromium/long-source.gif`. Test artifacts are ignored by Git; regenerating the test recreates the export.

After deployment, request indexing for the canonical converter and measure unique exporters, ordered file-load/export/download conversion, target outcomes, source failures, and exports on another calendar day. Do not discard converter events solely because missing raw user agents cause the analytics service to classify them as automation.
