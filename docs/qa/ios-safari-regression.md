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

## September 8, 2026 run

Application base: `71695f62ab1a0e2496bede35ab5397a99decf7ec` (merged PR #35).
Production URL: `http://localhost:3235/video-to-gif`.
Device: YTgify-Native-E2E, iPhone 17 Pro, iOS 26.5,
`F332F7E5-BF32-4561-96A5-811E4CDB70D3`.

**Partial native result:** successfully imported the fixture into Photos, used
Safari's native Photo Library picker, uploaded without playing first, and edited
to 1.1–4.1 seconds. Export/download/reopen and caption keyboard checks are not yet
verified in this run. The Simulator initially failed with LaunchdSimError 133;
a second boot succeeded. Computer-use pointer input repeatedly failed with
`noWindowsAvailable` / `windowNotFoundAtPosition`, including after full-screen
and client resets. Keyboard Page Down worked, but did not restore pointer input.
The device is left on the editor for continuation. No native saved output is
claimed. Earlier September 7 native evidence remains in its separate QA report.

**Automated evidence:** 66 unit tests passed, including the verifier's positive
and negative controls. Its CLI passed on all eight real plain/captioned downloads
from Chromium, Firefox, WebKit, and mobile Chromium. This evidence is distinct
from the unfinished native save-flow check. The full production-shaped browser
suite also passed all 93 tests using the local static build.

Three acceptance risks are tracked explicitly: wrong/frozen/timed output (file
assertions and negative controls); missing captions (positive/negative pixel
checks); native picker/keyboard/save integration (picker/trim observed, remaining
steps blocked by host UI automation and not marked passed).
