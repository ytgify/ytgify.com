# Visual export E2E acceptance

The converter now has a real download-and-decode test registered by
`tests/studio.spec.ts`, so it runs in the existing Chromium, Firefox, WebKit,
and mobile Chromium projects and converter CI command. `gifuct-js` is pinned
as a development-only decoder; it is not part of the application bundle.

The committed six-second H.264/VP9 fixtures contain six-bit source-frame markers
and per-second background colors. See `tests/fixtures/visual-timeline.md` for
regeneration and the independent expected values.

## Three failure modes

1. **Wrong trim or frozen/blank frames:** select 1.1–4.1 seconds at 5 FPS and
   inspect all 15 decoded frame IDs, their strict progression, RGB backgrounds,
   opacity, dimensions, and total duration. This checks every frame, including
   the first and last. An intentional wrong-start control failed at frame zero.
2. **Captions appear only in preview, disappear, or move outside their regions:**
   export without captions, then edit and export with top and bottom captions.
   Every plain frame has zero white caption pixels; every captioned frame has
   more than 100 in each caption region. An intentional missing-top-caption
   control failed on the encoded pixels. Exact text spelling is not checked.
3. **Decode readiness varies between browsers:** the new test exposed intermittent
   dark frames in Firefox and WebKit exports, independently confirmed with ffmpeg.
   Seeking now waits for `video.seeking` to clear and gives the decoder 100 ms to
   settle, including the same-time fast path. The prior 25/80 ms readiness-based
   delay could finish before canvas pixels were usable. The attached-video and
   iOS preparation paths remain intact. Twelve repeated visual tests passed with
   the longer settling delay; the final full suite passed all 93 tests.

## Evidence and limits

- Full suite: `npm run test:e2e -- --workers=4` — 93 passed.
- Repeated focused matrix: 12 passed (three per browser configuration).
- Wrong-trim and missing-caption negative controls both failed as intended;
  temporary test edits were restored immediately.
- Downloaded GIFs and decoded frame IDs are attached to Playwright reports.
- Full report and negative-control logs retained locally under
  `/tmp/ytgify-visual-e2e-evidence`.

The settling delay is an empirically verified mitigation, not a hardware-level
frame-presentation guarantee. Relative to the old 25 ms path, it adds about
1.1 seconds for a 15-frame export or up to 11.25 seconds for 150 frames. The
existing abortable delay preserves cancellation. A future frame-presentation
callback implementation could reduce that cost with equivalent regression tests.

This validates desktop WebKit and emulated mobile Chromium, not iOS Safari's
file picker or Save to Photos flow. No device-level iOS automation was added.
