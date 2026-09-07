# Upload clarity: first mobile comparison

September 7, 2026. Local implementation on `codex/mobile-ux-plan` in `.worktrees/mobile-ux-plan`; not deployed. This is the first slice of the [mobile UX plan](2026-09-07-mobile-ux-comparison-plan.md).

## Baseline and changes

Verified the latest successful [production deployment](https://github.com/ytgify/ytgify.com/actions/runs/34074379780) at commit `52af0ab2069e90c60fdb032d030855b786be2b3c`, matching the worktree base. Captured production and unchanged local homepage, upload, short/long trim, size target, caption, result, and invalid-file states. The upload screenshots are byte-identical at 390×844, 360×800, and 1440×900. Each capture set includes viewport/full-page images, a manifest, fixture hashes, browser version, and locally captured events.

The upload screen now puts file selection directly after a short introduction. Choose video spans the mobile panel, privacy and format guidance sit beside the action, the redundant benefit cards are removed, and the progress indicator follows file selection. The heading explicitly asks for a video from the device. Desktop drag-and-drop stays available. The input handling, media pipeline, output defaults, limits, and homepage are unchanged.

| Viewport | Production button top | Local button top |       Change | Local button size |
| -------- | --------------------: | ---------------: | -----------: | ----------------- |
| 390×844  |               795.6px |          411.6px | 384px higher | 308×48px          |
| 360×800  |               795.6px |          411.6px | 384px higher | 278×48px          |
| 1440×900 |                 834px |            430px | 404px higher | 164×48px          |

At 360×800 the production button was not fully visible; the local button and file limits now fit in the first viewport. At 390×844 the old button only just fit. These are layout observations, not evidence of improved customer conversion.

## Comparison artifacts

The local gallery is `.ytgify-runtime/mobile-ux-comparison/index.html`. It switches viewport, screen, full-page/viewport capture, and unchanged versus improved local version. Baseline frames and fixture GIFs remain in `production/` and `local-baseline/`; the first candidate is in `upload-v1/`. The gallery controls and image loading were verified in Chromium, and mobile/desktop candidate images were visually inspected.

The ignored `capture.mjs` and `gallery.mjs` in that directory regenerate the local artifacts. Capture commands run from this worktree:

```sh
node .ytgify-runtime/mobile-ux-comparison/capture.mjs production https://ytgify.com
node .ytgify-runtime/mobile-ux-comparison/capture.mjs local-baseline http://localhost:3000
node .ytgify-runtime/mobile-ux-comparison/capture.mjs upload-v1 http://localhost:3000 upload
node .ytgify-runtime/mobile-ux-comparison/gallery.mjs
```

Do not overwrite the unchanged baseline using modified code. The original captures used Chromium 141.0.7390.37, device scale 1, dark mode, en-US locale, and reduced motion. The comparison script blocks Google Analytics, Tag Manager, and PostHog requests and disables service workers. Captured media previews are paused; do not use arbitrary GIF animation frames as a pixel-diff gate.

## Three realistic failure modes

1. **The file action remains hidden or too small on narrow screens.** New browser checks at 360, 390, and 768px assert the whole button is in the viewport, its target is at least 44×44px, there is no horizontal overflow, and privacy/file-limit guidance is visible. They open the actual file chooser, select a real WebM fixture, and verify one loaded-source event. Paired captures directly show the change at narrow, mobile, and desktop sizes.
2. **Reordering upload content breaks keyboard access or error recovery.** The accessibility test now observes the actual file-chooser event after Enter. Its invalid-file flow activates Start over with the keyboard, verifies the error disappears, then loads a valid fixture into the trim screen. Mobile invalid-file screenshots retain a clear error and recovery action.
3. **The simpler entry screen regresses exporting or analytics.** Existing focused coverage still verifies homepage entry attribution, one caption-activation event, target recalculation/manual override, and a captioned real-source export/download at 360–363 seconds. Those tests passed after the change; no media or analytics implementation changed.

## Validation

- `npm ci` completed; Husky reports `.husky/_`. Chromium 141.0.7390.37, Firefox 142.0.1, and WebKit 26.0 all launched successfully.
- Eight focused browser checks passed with retries disabled against the local dev server.
- Full pre-push passed: ESLint, formatting, TypeScript, Knip, CI boundaries, 31 unit tests, production build, canonical-route checks, and four Chromium smoke checks. Six existing function-length warnings remain; no debt ceiling increased.
- Full browser suite: 64/64 passed in 48.5 seconds with retries disabled, against a fresh production build. This includes real fixture exports in Chromium, Firefox, WebKit, and mobile Chromium. Artifacts are retained under `.ytgify-runtime/mobile-ux-comparison/acceptance/`.
- Supplementary checks pass against static production output: touch file selection in WebKit at 390×844, and Tab/Enter file selection with no horizontal overflow at a 720×450 CSS viewport (a reflow approximation for 1440×900 at 200%, not actual browser UI zoom). Both load the real WebM fixture. The final candidate screenshots were recaptured against this build and retain the same layout measurements.
- An initial attempt to use Tab traversal in mobile WebKit did not advance focus. Repeating it against production showed the same behavior, with focus staying on the document body. Mobile WebKit acceptance therefore covers touch interaction; real mobile hardware-keyboard behavior remains unverified. Desktop Chromium Tab traversal passes.

No customer-analytics query, CI concurrency change, PR, or deployment is part of this slice. Real iOS/Android device checks remain unavailable; browser emulation does not verify phone file-picker, keyboard, or save behavior. Next work is precise mobile trimming using the captured long-source baseline, followed by output presets and smaller-result recovery.
