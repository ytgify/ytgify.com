# Progressive disclosure validation — September 7, 2026

Implemented locally in `.worktrees/mobile-ux-plan`, branch `codex/mobile-ux-plan`, based on deployed main `52af0ab2069e90c60fdb032d030855b786be2b3c`. Uncommitted and not deployed. This continues the preserved production comparison and the upload/trimming slices.

## User journey

The editor keeps the video, start time, duration, and three quality presets visible. Detailed timing, optional size targets, manual resolution/frame rate, and captions expand on request. Caption style is a nested disclosure. Closing a section preserves its values; presets clear automatic targets and the effective summary shows the current settings.

Captions are edited inline, eliminating the mandatory caption screen. The preview now uses the same canvas caption renderer as export, including capitalization, wrapping, color, and stroke. Create GIF and its estimate remain reachable in a sticky bar; focusing a field returns the bar to normal flow. The bar resumes sticking after control activation, preventing it from intercepting the pointer release when focus leaves a caption input. That defect was reproduced and fixed during acceptance.

The result puts preview, actual size, and Download GIF first. Make smaller preserves the source, trim, caption, and previous download until a replacement succeeds. Details and feedback are optional. Estimates remain estimates; existing input and memory limits are retained.

## Three realistic failure modes

| Failure mode                                                      | Direct evidence                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hidden choices disappear, or the action bar covers an interaction | Browser tests preserve caption drafts and settings across disclosure/preset changes, verify focused-field bar behavior and mobile reachability, and exercise caption style immediately after manual output changes. Supplemental Chromium, Firefox, and WebKit checks at 390×844 passed nested disclosures, Enter/Space activation, preserved values, and no horizontal overflow. |
| Preview or output settings misrepresent the exported GIF          | Real Chrome-demo export verifies the yellow caption canvas pixels and dimensions, followed by decoded GIF dimensions/frame count. Existing fixture exports, long-source selection, budget blocking, target/manual transitions, and private analytics checks all pass. The preview and encoder share the caption renderer.                                                         |
| Making a smaller GIF destroys a usable result or loses the edit   | A real fixture test preserves start time and caption, forces a canvas failure, verifies the old blob remains downloadable, retries successfully, verifies fewer actual bytes, and confirms the old URL is revoked only after successful replacement. Unit cases cover smaller candidates and minimum effective dimensions.                                                        |

## Checks

- `npm run pre-push`: passed lint, formatting, TypeScript, Knip, CI path boundaries, 37 unit tests, production build, canonical-route verification, and four Chromium smoke tests.
- Full fresh-production browser suite: **68 passed**, two workers, **zero retries**. Includes Chromium, Firefox, WebKit, and mobile Chromium fixture exports.
- Supplemental narrow-viewport caption/keyboard checks: passed in all three browser engines.
- Gallery: all 24 mobile/desktop full-step and viewport images load through both selectors.
- Existing six ESLint function-length warnings remain; no file-size ceilings were raised. Entry analytics were extracted to keep the controller under the source-file limit.

## Review artifacts

Local gallery: `.ytgify-runtime/progressive-journey/index.html`. It includes default editor, expanded timing, size target, caption, result, and smaller-result editing at 390×844 and 1440×900. The previous journey remains linked at `.ytgify-runtime/user-journey/index.html`; original production/local captures remain under `.ytgify-runtime/mobile-ux-comparison/`.

Full-step captures temporarily put the sticky bar in normal flow to avoid obscuring content in a tall stitched image. Viewport captures retain its real behavior. The mobile default Create button is 110×48 CSS pixels at y=784 in an 844px viewport. Both layouts exported the captioned three-second fixture successfully; actual files are saved as `mobile.gif` and `desktop.gif` beside the gallery.

Real iOS/Android keyboard, file-picker, memory, and download behavior still needs device testing; emulation does not establish those outcomes. The previously measured 15 FPS playback rounding (3s selection encoded as 3.15s) remains separate media debt. CI concurrency benchmarking and deployment measurement remain separate planned work.
