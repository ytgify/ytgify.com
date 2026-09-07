# Mobile converter improvements and comparison plan

Status: production/local baseline captured; upload clarity, precise trimming, progressive disclosure, output presets, and smaller-result recovery implemented locally. See [upload evidence](2026-09-07-upload-clarity-validation.md), [trimming evidence](2026-09-07-trimming-validation.md), and [progressive-disclosure evidence](2026-09-07-progressive-disclosure-validation.md). CI benchmarking remains planned.

Worktree: `.worktrees/mobile-ux-plan`, branch `codex/mobile-ux-plan`, based on `origin/main` at `52af0ab2069e90c60fdb032d030855b786be2b3c` (PR #30). The original checkout is unchanged. This document plans the work; it does not claim new browser or customer evidence.

## Why this order

The [September 6 research](2026-09-06-search-and-usage-analysis.md) recorded 94 converter visitors, 29 file selectors, and 12 downloaders. The biggest observed loss occurred before file selection, but the cause is unknown. Mobile contributed 19 converter visitors and three downloaders. These small samples support focused usability improvements, not a fragmented A/B test or a claim that the layout caused abandonment.

Analytics corrections, entry labels, clearer homepage copy, 30-minute sources, and estimated size targets have already shipped in PRs #29–30. Preserve these and measure their effects; do not repeat their implementation. The next sequence is upload clarity, easier trimming, simpler output choices, and faster recovery from an oversized result. Keep CI optimization in a separate change so its effect can be measured independently.

## Establish a reproducible baseline before editing

1. Install this worktree's pinned dependencies with `npm ci`. Check Husky's hooks path and launch the installed Playwright browsers; install pinned runtimes if missing.
2. Confirm the current production deployment SHA from GitHub and record its timestamp and URL. Capture `https://ytgify.com/` and `https://ytgify.com/video-to-gif`. If production has advanced from the worktree base, reconcile that difference before calling any visual difference an improvement.
3. Start the local QA server with `make start-dev-bg`, using a unique `YTGIFY_DEV_TMUX_SESSION=ytgify-mobile-ux`. Use port 3000 if free; otherwise use 3001 and record the exact URL. Check the server's worktree so another checkout cannot silently become the local baseline.
4. Run the same browser scenarios against production and the unchanged local base. Use fresh contexts with identical browser versions, viewport, device scale, locale, color scheme, fixture, and settings. Intercept analytics ingestion during automated QA and retain requests locally for schema checks. Do not send synthetic exports into production metrics.
5. Save matching viewport screenshots and full-page screenshots, then repeat them after each local iteration. Capture stable loaded states, pause media at the same source time, and wait for fonts. Compare animated GIFs as exports separately; do not score arbitrary animation frames as layout regressions.

Keep evidence under `.ytgify-runtime/mobile-ux-comparison/<baseline-or-iteration>/`, outside Playwright's disposable results directory. Include a manifest with deployment/local SHA, uncommitted diff hash if applicable, URLs, capture time, browser version, viewport, fixture hash, settings, and scenario. Produce a local side-by-side HTML gallery with live baseline on the left, local candidate on the right, and a brief observation for each pair. Keep a concise evidence report in `docs/research`; images can remain local artifacts until a review needs them attached.

### Comparison matrix

| Scenario                    | Fixed inputs                                                      | Compare and record                                                                                           |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Homepage entry              | Fresh homepage; follow “Convert video to GIF”                     | CTA visibility, wrapping, local-file expectations, canonical destination and `home_hero` attribution         |
| Empty converter             | Direct entry and homepage entry                                   | Choose video position, scroll required, local-processing explanation, file limits and recovery guidance      |
| Short clip                  | `tests/fixtures/bob-ross-15s.webm`; start 2s, duration 3s         | Preview, selection accuracy, control sizes, scroll and actions needed to continue                            |
| Long clip                   | `tests/fixtures/long-source-370s.webm`; start 360s, duration 3s   | Reach 06:00, adjust by 0.1s, select without overlapping handles, preview correct moment                      |
| Output choices              | Same short clip; default, then 5 MB target, then manual change    | Number of visible decisions, selected state, estimate clarity, automatic/manual precedence                   |
| Caption and export          | Same clip; top caption “Mobile comparison”; default caption style | Keyboard occlusion, back-navigation preservation, progress, cancellation and retry                           |
| Download and smaller result | Same exported GIF; choose smaller settings and export again       | Download prominence, actual bytes, preserved source/trim/caption, original-result availability while editing |
| Failure recovery            | Invalid file, decode failure, blocked export budget               | Readable error, reachable recovery action, successful subsequent valid export                                |

Primary paired captures: touch Chromium at 390×844 and desktop Chromium at 1440×900. Check 360×800 for cramped layouts, 768×1024 for intermediate breakpoints, and 200% desktop zoom for reflow. Run critical upload → trim → download and cancellation/recovery interactions in Firefox and WebKit. Include WebKit at a mobile viewport; browser emulation does not establish real iPhone file-picker, keyboard, memory, or download behavior. Record real iOS Safari/Android Chrome checks separately when devices are available, and state that gap if unavailable.

## Implementation slices

### 1. Make choosing a video the obvious first action

Owners: `UploadHero.tsx`, `UploadScreen.tsx`, and only necessary wizard layout changes.

- Keep the converter heading, shorten the introduction to one sentence, and bring Choose video ahead of the benefit-card block and other secondary content.
- Use device-oriented copy: “Choose a video from your device.” Keep desktop drag-and-drop available. Retain concise privacy/no-watermark reassurance and readable format, duration, and file-size limits near the action.
- Keep the recently shipped homepage link wording. Verify its mobile prominence against production before deciding whether further homepage layout changes are needed.
- Acceptance: Choose video is visible without scrolling at 390×844 and 360×800; no horizontal overflow; the primary control is at least 44×44 CSS pixels; keyboard upload and invalid-file recovery still work. Preserve useful SEO heading/content and canonical routing.

### 2. Make long-source trimming precise on touch screens

Owners: `TimelinePanel.tsx`, `useTimelineSelection.ts`, extracted time-input/timeline helpers, and focused unit tests.

- Present the start as minutes and seconds with a fractional-seconds option; retain duration in seconds. Support intermediate typing states and validate on commit without unexpected jumps or lost input.
- Separate coarse source navigation from a detailed clip timeline. Prototype a 30-second detail window centered around the selection, clamped at source boundaries, with explicit previous/next window controls. Keep the selected clip within the detail window during adjustments.
- Give start/end controls distinct, reachable touch targets and keyboard/numeric alternatives. If a very short selection makes touch targets overlap, use separate control rows or accessible step controls; invisible overlapping padding is not sufficient.
- Acceptance: select 360–363s from the 370s fixture, adjust by 0.1s, and export the correct moment. Cover source start/end, shorter-than-preset sources, invalid time text, range movement, and the existing 10-second export cap. Keep the 30-minute source, 250 MiB input, and existing frame-memory limits.

### 3. Reduce settings decisions without hiding their effects

Owners: a new output-settings component, `studio-config.ts`, settings helpers, and size-target tests.

- Offer Small file (240p/5 FPS), Balanced (360p/10 FPS, current default), and More detail (480p/15 FPS). Treat these as proposed starting mappings, to be assessed against the same real fixture exports and budget guard.
- Move individual resolution/FPS choices into an accessible Advanced disclosure. Show a compact effective-settings summary and estimated-size range.
- Keep “Aim for 5/10/25 MB” optional. Selecting a quality preset clears an active target; selecting a target recalculates settings and shows automatic mode; manual advanced edits clear the target and show Custom. Do not display a preset as active when its effective settings differ.
- Acceptance: default export is unchanged; every transition has a clear selected state; trim changes recalculate an active target; captions, motion, and detail remain acknowledged sources of estimate error. Targets remain estimates, never promised hard limits.

### 4. Make download and size adjustment easy

Owners: `SuccessScreen.tsx`, a small controller action/helper, and workflow coverage.

- Put Download GIF and actual file size ahead of secondary metadata. Move the next-tool question below the core actions; remove the encoder implementation detail from the user-facing result.
- Add Make smaller beside or directly below Download. Return to output settings with a visibly smaller candidate while preserving source, trim, captions, and the existing downloadable result until replacement succeeds.
- Choose the next lower-cost safe settings, show the changed settings, and let the user export explicitly. If already at the smallest supported settings, guide them to shorten the clip. A smaller estimate is not a guarantee of smaller encoded bytes for every source.
- Acceptance: an oversized-result recovery requires no file reselection or caption retyping; the exported fixture becomes smaller; cancellation/failure leaves a usable previous download; reset releases old resources. Tall/portrait previews must not bury the download action.

After each slice, capture paired images, review the actual interaction, and record keep/revise decisions. A screenshot improvement alone does not justify a behavior regression. Split controllers/components before exceeding the 300-line boundary and lower existing debt overrides when extracting code.

## Testing and CI optimization slice

The current tiers are appropriate: staged lint/format plus units on commit; full core checks, one build and four Chromium smoke checks on push; broader path-aware browser coverage in CI. Preserve those tiers.

1. Record five comparable CI runs at one worker, including setup, build, browser execution, total critical path, retry count, and failures. Benchmark two workers on the same revision, runner class, and suite with at least five runs. Keep suites and retry policy constant; report first-attempt failures so retries cannot hide instability.
2. Adopt two workers only with a meaningful median improvement (target at least 15% in the converter browser job), no additional observed flakes, and no media resource failures. Otherwise retain one worker. Do not increase concurrency merely to reduce a single favorable timing.
3. Review setup/cache and artifact costs from those timings before adding caching or sharding. Preserve build-once artifact reuse, shared-change coverage, merge-group checks, and fail-closed CI behavior. Update path-boundary verification if new comparison tests are added.
4. Add focused GIF-output assertions for selected scene, caption presence, dimensions, frame count, and playback duration. The prior validation documented 3.15s encoded playback for a selected 3s at 15 FPS; measure and resolve or explicitly track that separately from visual layout work. Avoid platform-fragile byte-identical output assertions.
5. Keep screenshots as review evidence initially. Only promote stable, useful views to visual regression checks after assessing font/render variability. Include failure traces/screenshots in CI artifacts without uploading user media.

## Required acceptance evidence

| Realistic failure mode                                                                                            | Direct evidence required                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile controls become unreachable, overlap, or lose input under the keyboard                                     | Paired viewport images; touch and keyboard interactions at narrow widths; overflow/target-size assertions; real-device findings or explicit remaining gap                                                 |
| Trimming or new output modes export the wrong moment, lose captions, exceed budgets, or discard a previous result | Real short/long fixture exports; decoded frame/time/caption checks; unit boundary cases; target/manual transitions; cancellation and failed re-export recovery                                            |
| UI/CI changes quietly reduce trustworthy measurement or coverage                                                  | Locally captured analytics properties with no filenames/caption text/media URLs; deduplication checks; path-boundary and merge-group checks; benchmark first-attempt failures and retained browser matrix |

Run focused tests during each slice. Before implementation is ready for PR, stop this worktree's dev server, run the prescribed push gates, then the relevant full converter/browser coverage against fresh production output. Include homepage tests for entry/layout changes. Restart persistent local QA afterward if needed. Do not reuse stale build output or run a build alongside this worktree's dev server.

## Release evaluation and adjacent tools

Record deployment date/SHA and compare complete equal-length pre/post windows (initially 14 days each): unique converter views → file selections → loaded sources → successful exports → download clicks, upload errors by reason, size-target use/outcomes, and repeat exports on another day. Segment mobile and entry placement only when counts are useful; display counts alongside rates. Download clicks are not verified saves. If traffic remains sparse, extend observation to 28 days and avoid causal claims from before/after movement.

Cropping/resizing inside the converter is the next adjacent candidate after these usability changes. A standalone GIF compressor needs stronger evidence from size-target use, smaller-result retries, and explicit feedback. Screen-to-GIF remains exploratory; a separate caption product, accounts, and cloud sharing are not supported by the present evidence. Revisit Google indexing and converter search impressions as a separate discovery follow-up rather than assuming UX polish resolves indexing.

## Execution checklist

- [x] Create fresh worktree from current remote main and inspect research, UI, tests, and CI.
- [x] Write ordered changes, comparison protocol, and acceptance criteria.
- [x] Capture and review production versus unchanged local baseline.
- [x] Implement and compare upload clarity.
- [x] Implement and compare precise mobile trimming.
- [x] Implement and compare output presets and smaller-result recovery.
- [x] Run complete acceptance checks and produce the comparison gallery/report.
- [ ] Benchmark and propose CI optimizations separately.
- [ ] Prepare focused implementation PRs with evidence, then evaluate deployed results.
