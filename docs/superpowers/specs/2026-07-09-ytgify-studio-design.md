# YTgify Studio Design

Date: 2026-07-09
Status: Proposed
Owner: Jeremy

## Summary

YTgify Studio is the next product direction for YTgify: a private, browser-based video-to-GIF editor for user-owned clips.

The first version should live at `/studio` inside the existing `ytgify.com` landing page repo. It should be tool-first, not hub-first: visitors should immediately get a working upload-to-GIF flow rather than a landing page for multiple future tools. The page can still hint at the broader toolkit direction after the user has seen or used the core tool.

The MVP should let a visitor upload a local video, trim a short moment, choose output settings, optionally add top/bottom captions, export a GIF in the browser, and download it with no account, no upload, and no watermark.

## Product Bet

YTgify already has search equity around "YouTube to GIF," "video to GIF," "no watermark," and related GIF maker queries. The Chrome extension proved demand for fast clip-to-GIF workflows but carried policy risk because it transformed YouTube video frames inside a Chrome extension.

The Studio pivot keeps the useful promise while changing the source material:

- From: clip YouTube videos in a Chrome extension.
- To: turn your own local video clips into clean GIFs in the browser.

This preserves the core user job while reducing platform and store-policy risk.

## Goals

- Ship a real, usable `/studio` MVP rather than only a waitlist or fake-door page.
- Reuse the extension's media-processing concepts and code where practical.
- Keep the workflow local-first: user media should remain in the browser for the MVP.
- Validate whether current YTgify traffic wants a broader creator media toolkit.
- Preserve YTgify's search positioning around GIF creation, no watermark, and fast video clipping.
- Instrument the funnel so future decisions are based on actual behavior.

## Non-Goals

- Do not rebuild the Chrome extension.
- Do not support YouTube URL ingestion in the MVP.
- Do not upload user videos or generated GIFs to a backend.
- Do not add accounts, profiles, likes, comments, collections, or public hosting.
- Do not build a multi-tool Studio hub before the first tool works.
- Do not support batch conversion, MP4 export, WebP export, or screen recording in the first version.
- Do not promise use of third-party copyrighted material.

## Target User

The first target user is someone who has a short local video clip and wants a quick GIF without using a heavy editor or a watermarked service. This includes:

- creators making reaction GIFs or short social snippets;
- product builders making lightweight demo GIFs;
- support/dev teams making quick visual repros;
- people converting phone or screen-recorded clips into shareable GIFs.

## Positioning

Primary copy:

> Turn your own videos into clean GIFs. Upload a clip, trim the moment, add a caption, and export a no-watermark GIF directly in your browser.

Supporting points:

- No upload required for the MVP.
- No watermark.
- Works with local MP4, MOV, and WebM files where the browser can decode them.
- Built from the open-source YTgify extension's GIF engine.
- Use videos you own or have rights to edit.

## Route Strategy

`/studio` should be the working flagship tool:

- First viewport: upload-to-GIF tool.
- Below the tool: concise "coming next" cards for future toolkit ideas.
- Homepage: add a clear CTA to `/studio` once the MVP exists.
- Future dedicated utility pages can be added later, such as `/studio/compress-gif`, `/studio/screen-to-gif`, and `/studio/caption-gif`.

Do not make `/studio` a generic product hub until there are at least two working tools.

## MVP Workflow

1. Visitor opens `/studio`.
2. Visitor sees an upload/drop area with privacy and no-watermark messaging.
3. Visitor uploads a local video file.
4. The app creates a local object URL and loads it into a controlled `<video>` element.
5. The app reads duration, dimensions, and browser media readiness.
6. Visitor chooses a clip using timeline start/end controls.
7. Visitor can apply quick presets: 3 seconds, 5 seconds, or 10 seconds.
8. Visitor chooses FPS: 5, 10, or 15.
9. Visitor chooses resolution: 240p, 360p, or 480p.
10. Visitor optionally adds top and/or bottom caption text.
11. Visitor clicks Export GIF.
12. The app extracts frames from the video element into canvas `ImageData`.
13. The app applies captions during frame rendering when captions are present.
14. The app encodes the frames into a GIF in the browser.
15. Visitor sees progress, then a result preview with file size and download button.
16. Visitor downloads the GIF.
17. Visitor sees a post-export prompt asking which Studio tool would be most useful next.

## Core UI

### Empty State

The empty state should make the product obvious and usable:

- title: "Video to GIF Studio";
- short description focused on owned/local videos;
- drag-and-drop upload target;
- button: "Upload video";
- accepted file hint: MP4, MOV, WebM;
- privacy line: "Runs in your browser. Your video is not uploaded.";
- rights line: "Use videos you own or have permission to edit."

### Editing State

After upload, the layout should prioritize the editor:

- video preview;
- trim range/timeline controls;
- start time, end time, and duration readouts;
- quick duration preset buttons;
- output settings group for FPS and resolution;
- caption controls for top and bottom text;
- export button with disabled/loading/error states.

The first version can use simple form controls where custom timeline UI would slow delivery, but the component boundaries should allow replacing them with the extension's richer timeline scrubber later.

### Processing State

Processing should show stage-based progress:

- preparing video;
- capturing frames;
- applying captions;
- encoding GIF;
- finalizing download.

This can reuse the extension's stage/progress language but should avoid extension-specific assumptions.

### Result State

The result panel should show:

- GIF preview;
- file size;
- dimensions;
- duration;
- frame count;
- download button;
- "make another" action;
- a small post-export next-tool prompt.

## Extension Reuse Map

The extension repo `neonwatty/ytgify` contains several reusable components and concepts.

### Reuse Directly Or With Light Adaptation

- `src/lib/encoders/abstract-encoder.ts`
  - Reuse the encoder interface and progress model.
- `src/lib/encoders/encoder-factory.ts`
  - Reuse the encoder selection pattern, adjusted for Next/browser constraints.
- `src/lib/encoders/gifenc-encoder.ts`
  - Reuse as the likely default MVP encoder because it is fast and browser-friendly.
- `src/lib/encoders/gifski-encoder.ts`
  - Reuse as an optional high-quality path if bundle size and WASM loading are acceptable.
- `src/content/preset-calculator.ts`
  - Reuse the 3s/5s/10s preset logic.
- `src/types/storage.ts`
  - Reuse or adapt `TextOverlay`, `GifSettings`, and `TimelineSelection`.
- GIF creation and encoder tests
  - Reuse test cases and fixtures to verify the web MVP's output pipeline.

### Adapt Heavily

- `src/lib/simple-frame-extractor.ts`
  - Keep the video-element-to-canvas idea, but simplify for local files where buffering/network constraints are different.
- `src/content/gif-processor.ts`
  - Reuse the stage model, frame-to-GIF orchestration, and caption rendering ideas, but remove Chrome and YouTube assumptions.
- `src/content/overlay-wizard/components/TimelineScrubber.tsx`
  - Port only if it can be made independent of extension CSS and page injection assumptions.
- `src/content/overlay-wizard/screens/QuickCaptureScreen.tsx`
  - Use as a UX reference for trim/settings layout; do not copy wholesale.
- `src/content/overlay-wizard/screens/TextOverlayScreenV2.tsx`
  - Use as a UX and canvas-captioning reference; simplify for the web MVP.

### Do Not Reuse In MVP

- YouTube detector, YouTube API integration, player controller, injection manager, and YouTube button.
- Chrome runtime message passing and Chrome storage adapters.
- Popup auth, trending GIFs, user profile, likes, comments, and upload API.
- API types that require YouTube metadata.

## Technical Architecture

### App Route

Add a Next app route:

- `app/studio/page.tsx`

The page should render client-side interactive components because file upload, video decoding, canvas extraction, and encoding are browser-only.

### Suggested Component Boundaries

- `StudioPage`
  - Server route wrapper and metadata.
- `StudioApp`
  - Client component that owns the main state machine.
- `VideoDropzone`
  - File selection, drag/drop, accepted-file validation.
- `VideoPreviewPanel`
  - Controlled video preview and metadata display.
- `TrimControls`
  - Start/end/duration controls and quick presets.
- `OutputSettings`
  - FPS and resolution controls.
- `CaptionControls`
  - Top/bottom text inputs and basic styling controls.
- `ExportProgress`
  - Stage/progress UI.
- `GifResultPanel`
  - Preview, metadata, download, reset, and next-tool prompt.

### Suggested Library Boundaries

- `lib/studio/types.ts`
  - `StudioVideoMetadata`, `StudioTrimSelection`, `StudioOutputSettings`, `StudioCaptionSettings`, `StudioExportResult`.
- `lib/studio/resolution.ts`
  - Resolution presets and aspect-ratio calculations.
- `lib/studio/presets.ts`
  - Ported quick duration preset logic.
- `lib/studio/frame-extractor.ts`
  - Local video frame extraction from an `HTMLVideoElement`.
- `lib/studio/captions.ts`
  - Canvas text overlay rendering.
- `lib/studio/gif-exporter.ts`
  - Orchestration from settings to `Blob`.
- `lib/studio/encoders/*`
  - Ported/adapted encoder abstraction and implementations.
- `lib/studio/analytics.ts`
  - Lightweight event wrappers.

### State Machine

The client app should use an explicit state shape rather than scattered booleans:

- `idle`: no file selected.
- `loading-video`: file selected, metadata loading.
- `editing`: video ready and editable.
- `exporting`: frame extraction/encoding in progress.
- `complete`: GIF generated.
- `error`: recoverable error with message and reset option.

The state should store:

- selected file;
- object URL;
- video metadata;
- trim selection;
- output settings;
- captions;
- export progress;
- export result;
- error message.

### Data Flow

All media data stays in browser memory for the MVP.

1. `File` is selected.
2. `URL.createObjectURL(file)` creates a local preview URL.
3. `<video>` loads metadata and becomes the source of truth for duration and dimensions.
4. Export creates an offscreen or hidden canvas.
5. Frame extractor seeks through selected time range and captures frames.
6. Caption renderer draws text onto each frame when needed.
7. Encoder receives `ImageData[]` and settings.
8. Encoder returns a GIF `Blob`.
9. Result panel uses `URL.createObjectURL(blob)` for preview and download.
10. Object URLs are revoked on reset/unmount.

### File Handling

Accept:

- `video/mp4`;
- `video/quicktime`;
- `video/webm`;
- browser-decodable video files even when MIME type is missing, if the file extension and decode test pass.

Initial limits:

- max file size: 250 MB;
- max source duration for MVP: 5 minutes;
- max export duration: 10 seconds;
- max output resolution: 480p;
- max FPS: 15.

These limits keep memory and processing time predictable.

### Error Handling

Handle these cases explicitly:

- unsupported file type;
- browser cannot decode the selected file;
- file too large;
- source video too long for MVP;
- selected clip too long;
- canvas context creation failed;
- frame extraction timed out;
- encoding failed;
- user cancels or resets during export.

Errors should be written in product language, not stack traces. Each error should offer the next action: choose another file, shorten clip, lower resolution, lower FPS, or try again.

## Analytics And Validation

The first build should include lightweight analytics events. The goal is to measure whether visitors do more than click curiosity CTAs.

Recommended events:

- `studio_page_view`;
- `studio_upload_started`;
- `studio_upload_loaded`;
- `studio_upload_failed`;
- `studio_trim_changed`;
- `studio_caption_added`;
- `studio_export_started`;
- `studio_export_succeeded`;
- `studio_export_failed`;
- `studio_download_clicked`;
- `studio_next_tool_selected`.

Important properties:

- source page or referrer;
- file type;
- source duration bucket;
- output duration;
- output FPS;
- output resolution;
- captions enabled;
- output file size bucket;
- error code for failures.

Do not send file names, video content, caption text, or any user media.

### Success Signals

Useful early signals:

- at least 10% of `/studio` visitors start an upload;
- at least 40% of loaded videos start an export;
- at least 60% of exports complete successfully;
- at least 50 downloads in the first month from organic traffic;
- repeated selection of one "coming next" tool in the post-export prompt.

These are directional validation thresholds, not hard launch gates.

## Future Toolkit Directions

Once upload-to-GIF is working and measured, future tools can be selected from observed behavior and search demand.

### GIF Optimizer For Slack And Discord

Job: make a GIF small enough for Slack, Discord, email, or docs.

Why it fits:

- strong autocomplete language around `compress gif for slack`, `resize gif for slack`, and `mp4 to gif for discord`;
- mostly reuses the encoder, resolution, FPS, and file-size estimation work;
- clear success metric: target file size reached.

### Captioned GIF Maker

Job: add readable top/bottom text to a GIF or short video.

Why it fits:

- extension already has text overlay concepts;
- demand exists around `add captions to gif online`, `add caption to gif meme`, and `add caption to gif discord`;
- can be a focused SEO page and a mode inside the main editor.

### Screen Recording To GIF

Job: capture part of a screen and export a GIF for demos, bugs, docs, or tutorials.

Why it fits:

- demand exists around `screen recording to gif`, `screen recorder to gif chrome`, and platform-specific variants;
- useful to builders and support teams;
- can reuse export pipeline after capture.

Why to defer:

- browser screen-capture permissions add UX complexity;
- capture area selection and audio handling can expand scope quickly.

### GIF Hosting And Share Links

Job: upload a GIF and get a shareable link.

Why it fits:

- extension repo already has early auth/upload/profile/trending concepts;
- monetization path through storage, share history, and pro features.

Why to defer:

- requires backend, storage, moderation, spam protection, account UX, abuse handling, and cost controls.

## SEO And Page Framing

The `/studio` page should target terms adjacent to the current traffic without making risky promises.

Primary target:

- video to GIF converter;
- MP4 to GIF converter;
- GIF maker no watermark;
- video to GIF online;
- add captions to GIF;
- private video to GIF.

Avoid primary claims around:

- YouTube URL download;
- ripping YouTube videos;
- bypassing platform restrictions.

The page can mention YTgify's history honestly:

> YTgify started as a Chrome extension for fast GIF clipping. Studio brings the same lightweight editing idea to your own local videos.

## Privacy And Policy

The product should clearly say:

- files are processed locally in the browser for the MVP;
- no user media is uploaded;
- generated GIFs are not stored by YTgify;
- users should only edit videos they own or have rights to use;
- browser limitations may affect very large or unusual files.

This privacy posture is also a marketable differentiator.

## Performance Constraints

The MVP should optimize for reliability over maximum quality.

Defaults:

- 5-second selection;
- 10 FPS;
- 360p;
- max 10-second export;
- default encoder: `gifenc`;
- optional high-quality encoder only if bundle and load behavior remain acceptable.

Expected mitigation:

- warn when selected output may be large;
- recommend lowering FPS/resolution when estimated file size is high;
- allow cancel/reset during export;
- release object URLs and large frame arrays promptly after export/reset.

## Testing Strategy

### Unit Tests

- resolution and aspect-ratio calculations;
- preset calculations near video boundaries;
- file validation and error codes;
- caption rendering inputs;
- encoder wrapper behavior with mocked frames;
- analytics payload redaction.

### Component Tests

- empty upload state;
- valid file load state;
- invalid file error state;
- trim controls update selection;
- caption controls update export settings;
- export button disabled/enabled rules;
- result panel download link appears after success.

### Browser Tests

- load `/studio`;
- upload a small fixture video;
- trim to a short clip;
- export GIF;
- assert result metadata and download link;
- assert no network request uploads the source media.

### Manual QA

- Chrome desktop;
- Safari desktop if supported by the encoder path;
- Firefox desktop if supported by the encoder path;
- small phone-recorded MP4;
- small screen-recorded WebM;
- malformed or unsupported file.

## Implementation Phases

### Phase 1: Web MVP

- Add `/studio`.
- Port minimal local-video frame extraction.
- Port/adapt the `gifenc` encoder path.
- Add trim, FPS, resolution, captions, export, result, and download.
- Add analytics events without media/caption content.
- Link to `/studio` from the homepage.

### Phase 2: Quality And SEO

- Add stronger timeline UI if the simple controls feel limiting.
- Add file-size estimates and recommendations.
- Add a dedicated SEO intro/content section below the tool.
- Add comparison copy around no upload/no watermark.
- Improve cross-browser support and test fixtures.

### Phase 3: Toolkit Expansion

Choose one next tool based on analytics and search opportunity:

- GIF optimizer for Slack/Discord;
- captioned GIF maker;
- screen recording to GIF;
- share links and hosting.

## Acceptance Criteria

The MVP is ready when:

- `/studio` loads without requiring authentication.
- A supported local video can be uploaded and previewed.
- The user can choose a trim range no longer than 10 seconds.
- The user can choose FPS and resolution settings.
- The user can add top and/or bottom caption text.
- The browser can export and download a GIF without uploading source media.
- Clear errors exist for unsupported files, oversized files, extraction failure, and encoding failure.
- Analytics track funnel progress without sending media, filenames, or caption text.
- Homepage includes a visible link to `/studio`.
- Automated tests cover the core conversion path and no-upload guarantee.

## Open Product Decisions Resolved

- `/studio` should live in the current landing page repo.
- `/studio` should begin as one working upload-to-GIF tool, not a multi-tool hub.
- The first build should be a real MVP, not a waitlist-only validation page.
- The future direction is broader creator media toolkit, but the first tool is upload-to-GIF.
- Extension code should be reused selectively, with YouTube and Chrome-specific layers left behind.
