# Tool CI selection and local QA follow-up

The existing PR #39 candidate passed GitHub CI (run 34262461230), including the
104-case media browser suite and enabled analytics privacy check. The following evidence was collected locally before pushing the follow-up.
GitHub checks on the follow-up commit are the authoritative remote result.

## Acceptance evidence

- **Wrong suite skipped:** path-boundary checks cover tool ownership, shared media,
  geometry's compressor/resize dependency, screen recording's editor dependency,
  unknown paths, real Git moves, and merge-base behavior. Playwright enumeration
  confirms all 104 existing cases survive selection. Individual selections contain
  70 video, 33 compressor, 21 resize, 30 MP4, and 15 screen cases; their union equals
  the original suite. Related journeys intentionally overlap.
- **False green CI:** the existing final gate still requires success from every
  selected job and exact skips from unselected jobs. Boundary verification tests
  failure, cancellation, missing outputs, and unexpected skips. The media runner
  rejects empty/unknown selections. Fixture-oracle work is skipped for site/docs
  changes; mandatory quality/unit checks remain.
- **Real tools fail locally:** 12 browser checks passed on the persistent development
  server with Chromium and native Chrome, including real compression, independently
  decoded crop pixels, H.264 export, invalid-input recovery, narrow layouts, denied
  capture, and real canvas recording through editor/export/compressor. The run
  caught and fixed an initial-file import guard that prevented recreation of a
  revoked video URL during React development effect replay. The oracle uses the
  existing `/opt/homebrew/bin/python3` runtime with pinned Pillow 12.2.0.

103 unit tests, lint (existing warnings only), TypeScript, Knip, formatting, and
Git whitespace checks passed. Production build and remote CI were not rerun for
these local changes; the manual QA dev server remains available on port 3001.
Native operating-system capture permission dialogs and deployed hosting behavior
remain separate manual/release checks. See the engineering standards for the
preview deployment recommendation and local runner commands.

## Manual QA fixes

Subsequent owner QA added selected compression presets, useful KB targets,
already-small explanations, and decimal B/KB/MB size displays. Resize now restores
proportions when relocking and explains transparent padding. MP4 settings display
the resulting duration, cycles, and background. Cancelling a replacement screen
capture preserves the previous clip and download.

Final focused local acceptance: 17 browser checks passed (one duplicate H.264
case intentionally limited to native Chrome), including independently inspected
crop/padding pixels, MP4 background pixels and duration, stale-result removal,
and cancelled capture replacement followed by a real GIF download. All 104 unit
tests passed. The selector retains all 119 currently enumerated browser cases.
