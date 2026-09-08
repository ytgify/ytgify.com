# iOS Safari native regression recipe

This is a human/agent-driven native Safari journey plus an automated saved-file
verifier. It is **not** unattended iOS CI, and desktop Playwright WebKit does not
substitute for the native steps below. Use an isolated Simulator or a test iPhone.

## Prepare

Build the production application with `npm run build` after stopping this
checkout's development server. Serve `out` on an unused loopback port, for example
`npx serve out -l 3235`. A Simulator can reach `http://localhost:3235/video-to-gif`.
A physical phone needs a reachable development host URL instead of localhost.

Use `xcrun simctl list devices available` to select the dedicated test device by
its actual UDID; do not use `booted` when unrelated simulators are running. Boot
that device if necessary and import the repository's deterministic video:

```sh
xcrun simctl addmedia YOUR_TEST_DEVICE_UDID "$PWD/tests/fixtures/visual-timeline.mp4"
```

Use Photos/Files to transfer the same fixture on a physical phone. Do not use
personal media. Record the app commit, device model, OS version, URL, and run time.

## Native flow

1. In Safari, open `/video-to-gif` and tap Choose video → Photo Library. Select
   the six-second colored-block fixture and confirm it in the native picker.
2. Without playing the preview first, select the **3s** preset, then enter **1.1**
   as Start time. Confirm the preview reads **00:01.1–00:04.1**. Set duration
   first: a five-second default selection would clamp this start to one second.
3. Open Advanced settings and choose **5 FPS**, **240p**. Leave captions empty.
   Tap Create GIF. Confirm processing and GIF ready are visible and reachable.
4. Tap Download GIF, accept Safari's download confirmation, open Downloads/Files,
   and reopen the saved GIF. Preserve this actual saved file as `plain.gif`.
5. Return to the result and tap Edit clip. Confirm trim and settings persist.
   Open Add a caption; enter **TOP TEST** and **BOTTOM TEST** in white. Exercise
   the software keyboard and confirm the active input stays accessible and
   Create GIF is reachable after dismissing the keyboard.
6. Create GIF again, download, and reopen the new file in Files. Preserve it as
   `captioned.gif`. Confirm the first saved file remains intact. If Safari exposes
   Save Image, also save to Photos and reopen it there; report that separately
   from Files download/reopen.
7. Copy the two actual files to the host without converting or re-encoding them.
   Record their original location and creation time, and retain screenshots of
   the native picker, keyboard, result, and reopened saved output.

## Verify actual saved files

Run from this repository with dependencies installed:

```sh
node scripts/ios/verify-saved-gif.mjs /absolute/path/plain.gif plain > plain-receipt.json
node scripts/ios/verify-saved-gif.mjs /absolute/path/captioned.gif captioned > captioned-receipt.json
```

A nonzero exit means failure. Receipts include SHA-256, size, every decoded source
frame ID, delays, and top/bottom caption pixel counts. The verifier checks the
fixed recipe above: 320 × 240, 15 frames, 3 seconds, selected source frames
11,13,…,39 with a one-source-frame seek-boundary tolerance and strictly advancing
motion. Background colors must match. Both caption regions must be absent in the
plain export and present in every captioned frame. Text spelling is not OCR-tested.

A receipt proves file content, not its origin. Do not label a Playwright download,
synthetic unit-test GIF, old download, or copied fixture as a new iOS result.
The native screenshots and saved-file provenance complete the acceptance evidence.

## Automation and failure checks

The existing four-browser visual E2E test invokes this CLI on each real download,
so it stays tested in converter CI. The unit suite also rejects wrong selections,
frozen frames, timing drift, missing captions, invalid modes, and truncated files.
Run `npm run test:unit` or the usual converter browser command to check these.

## September 8, 2026 native acceptance

Tested the PR #37 runtime changes on base `dda6ba76609133a493dcd568db6b9a59d5b18a56`,
served as a production build at `http://localhost:3235/video-to-gif`.
Device: YTgify-Native-E2E, iPhone 17 Pro, iOS 26.5 Simulator,
`F332F7E5-BF32-4561-96A5-811E4CDB70D3`. Native UI steps used XCUITest after the
pointer driver repeatedly failed. This is a completed local Simulator run, not
unattended native CI or physical-device coverage.

The native run found two failures that desktop happy-path exports had missed:

- Seeking the metadata-only preview before its first decoded frame could leave
  Safari permanently seeking. Fresh uploads timed out during extraction. Preview
  seeking now waits for frame data and cues the selection on `loadeddata`.
- With that stall fixed, an actual saved GIF still contained source frame zero
  in its first two output frames. `play()` had resolved before the right pixels
  were presented. Decoder warm-up now waits for a video-frame callback matching
  the current seek position before pausing, within the existing five-second
  cancellation/timeout boundary. Browsers without that API retain the fallback.

### Completed native journey

Used the six-second fixture through Safari's native Photo Library picker, without
playing the preview first. Selected 1.1–4.1 seconds, 240p, and 5 FPS. Exported and
accepted Safari's Download confirmation. Then returned through Edit clip, checked
that trim/settings persisted, entered TOP TEST and BOTTOM TEST with the software
keyboard visible, dismissed it, and exported/downloaded again. Both caption fields
were reachable with Safari's keyboard Next/Previous controls; Create GIF was
reachable after keyboard dismissal. Both saved files were reopened in Files
Quick Look, including an assertion of the captioned file's native accessibility
label. The plain file's bytes remained unchanged after the second download.

Safari's image context menu also exposed Save to Photos. Saved the captioned GIF
there and reopened it in Photos. The resulting `Media/DCIM/100APPLE/IMG_0008.GIF`
passed the verifier and was byte-identical to the captioned Files download; see
the [Photos screenshot](evidence/2026-09-08-ios-safari/photos-reopened.png) and
provenance record.

Preserved the actual native files, screenshots, verifier receipts, and
[provenance](evidence/2026-09-08-ios-safari/provenance.json) in
[evidence/2026-09-08-ios-safari](evidence/2026-09-08-ios-safari).

| Output                                                        | Native Downloads filename |   Saved size | Verification                                                     |
| ------------------------------------------------------------- | ------------------------- | -----------: | ---------------------------------------------------------------- |
| [Plain GIF](evidence/2026-09-08-ios-safari/plain.gif)         | ytgify-video-to-gif 2.gif | 30,482 bytes | [Receipt](evidence/2026-09-08-ios-safari/plain-receipt.json)     |
| [Captioned GIF](evidence/2026-09-08-ios-safari/captioned.gif) | ytgify-video-to-gif 3.gif | 70,073 bytes | [Receipt](evidence/2026-09-08-ios-safari/captioned-receipt.json) |

Both are 320 × 240, with exactly 15 frames at 200 ms each, totaling 3,000 ms.
Source frame IDs are exactly 11,13,15,…,39. Every plain frame has zero caption
pixels. Every captioned frame has 434 top and 662 bottom white caption pixels.
The earlier failed download is not presented as acceptance evidence.

Native screenshots: [software keyboard](evidence/2026-09-08-ios-safari/caption-keyboard.png),
[plain reopened](evidence/2026-09-08-ios-safari/plain-reopened.png), and
[captioned reopened](evidence/2026-09-08-ios-safari/captioned-reopened.png).

### Acceptance checks

1. **Decoder stall or cancellation:** the fresh native upload completes without
   preview playback. A new four-browser regression simulates metadata-only video
   and checks that neither trim changes nor early play events seek prematurely,
   then verifies the deferred selection is applied. Unit tests bound a missing
   presented frame and retain cancellation/cleanup checks.
2. **Stale frames, wrong trim/timing, or missing captions:** both real native
   downloads pass the CLI pixel/timing/completeness checks. The CLI rejected the
   stale-first-frame intermediate result. Four-browser plain/captioned exports
   also pass; negative controls reject frozen output and missing captions.
3. **Native picker, keyboard, and saved-file integration:** observed native Photo
   Library selection, software keyboard entry, download confirmation, and Files
   Quick Look for both outputs. Saved file hashes match the preserved artifacts.

Validation: 68 unit tests, all 97 browser tests, and all pre-push quality/build/
route/smoke gates passed. Native XCUITest logs and `.xcresult` bundles remain in
the ignored `.ytgify-runtime/ios-driver` directory. The native UI sequence still
requires supervision around Simulator animations; the stable readiness and
saved-content regressions run in the existing browser CI matrix.
