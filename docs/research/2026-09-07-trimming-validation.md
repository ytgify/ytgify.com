# Precise trimming: second mobile iteration

September 7, 2026. Implemented locally on `codex/mobile-ux-plan`, following the [upload clarity slice](2026-09-07-upload-clarity-validation.md). Not deployed.

## User-visible changes

- Start time accepts `06:00.0` or `360`, displays minutes/seconds, and commits on blur or Enter. Incomplete typing does not seek the video. Invalid input restores the previous value with an accessible description; Escape discards the draft.
- Duration also commits on blur or Enter. Time fields sit side by side on mobile. Preview timestamps use the same clock notation.
- Videos longer than 30 seconds get a full-source navigation slider, 30s earlier/later controls, and a detailed 30-second timeline. Navigation moves the selected clip while preserving its duration and clamps at source boundaries. Short sources use their full duration.
- Start and End have separate rows with 44×44px targets, so their hit areas cannot overlap even for a very short clip. The middle control moves the range. Arrow keys adjust the focused control by 0.1 seconds. Duration presets also have 44px minimum targets.
- The detail window is frozen during dragging, then recenters around the selected clip on release or cancellation. Drag offsets account for handles constrained inside the track edges. Moving a start handle cannot expand the clip beyond ten seconds or move its end unexpectedly.

The existing 30-minute source, 250 MiB file, ten-second export, and frame-memory limits remain. No analytics event/property was added. The old number-input helper was removed; parsing/window calculations and UI controls are separate modules within the size limits.

## Production comparison

The original baseline is production commit `52af0ab` from PR #30. Both versions use the 370-second WebM fixture and the same 360–363s selection. Original captures remain intact. Updated full-page screenshots are under `.ytgify-runtime/mobile-ux-comparison/trim-v1/`; the gallery has an Upload + precise trimming version and a focused `trim-detail.html` comparison.

The new 30-second scale provides about 12.3 times the horizontal precision of the original 370-second track. The original 16px-wide handles nearly overlap at six minutes; the new 44px targets occupy separate rows. The tradeoff is approximately 230px more vertical content on the 390px long-source screen. Side-by-side time fields reduce this compared with the initial prototype. The upcoming output-settings slice should address the remaining lengthy settings screen.

Final screenshots were captured against the production build at `localhost:3218`, at 390×844 and 1440×900, with a supplementary 360×800 no-overflow check. The manifest records source/fixture hashes and browser settings. The focused gallery and full gallery were browser-checked, including viewport/version/image switching. Source media and analytics ingestion remain blocked from automated telemetry; fixture files are processed locally.

## Three realistic failure modes and direct evidence

1. **Typing a minute value seeks prematurely or destroys the current clip.** Browser checks type `06:`, verify the preview stays unchanged, commit `06:00.0`, reject `6:99`, and discard a replacement with Escape. They verify 0.1s keyboard adjustments, preserved duration during navigation, end-of-source clamping, and the ten-second preset/maximum. Unit tests cover parsing, malformed/nonfinite values, minute rollover, and detail-window bounds including a half-second source.
2. **Touch handles overlap, the timeline moves beneath a drag, or cancellation leaves dragging active.** At a 390px touch viewport, a browser-level touch gesture moves Start by one second and then a second second. The test verifies the exact resulting times and unchanged window during the gesture, sends touch cancellation, then verifies that subsequent pointer motion does not change the selection. Handle dimensions and separate vertical hit areas are asserted. Existing direct mouse-scrubber coverage still passes. Supplemental Firefox and mobile WebKit checks verify clock entry, precise keys, and no overflow.
3. **The new selection controls export the wrong moment or regress the pipeline.** The real six-minute caption/export/download test passes against fresh production output, including target and private analytics assertions. FFprobe reports a 160×90 GIF with 45 frames and 346,815 bytes; visual inspection of the decoded first frame shows `00:06:00.000` and the caption. The full suite retains backwards-navigation, caption preservation, cancellation/reset, memory-budget, and cross-browser real-fixture export checks.

## Validation results

- Full pre-push passed: lint, format, TypeScript, Knip, CI path boundaries, 34 unit tests, production build, canonical-route verification, and four smoke checks. Six existing function-length warnings remain; no size ceiling increased.
- Full browser suite: **66/66 passed in 47.0 seconds**, two workers, retries disabled, fresh production build. Command: `env -u PLAYWRIGHT_BASE_URL -u PLAYWRIGHT_SKIP_BUILD npm run test:e2e -- --workers=2 --retries=0 --output=.ytgify-runtime/mobile-ux-comparison/trim-acceptance`.
- Focused tests exposed an accessible-name issue from nesting help text inside the input label. Explicit field names now keep descriptions separate; final focused and full runs pass.
- Supplementary Firefox desktop and WebKit mobile-viewport clock-entry/keyboard checks pass. A browser-controlled touch drag is covered in Chromium; real phone picker, keyboard, memory, and save behavior remain unverified.
- The pre-existing GIF timing rounding remains: a three-second selection exported at 15 FPS plays for 3.15 seconds. This slice verifies the selected source moment and does not change encoder timing. Keep the timing follow-up separate.

Next: simpler output presets, then Make smaller recovery with preserved source, trim, captions, and prior download. CI concurrency optimization remains a separate benchmarked change.
