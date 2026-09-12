# GIF compressor handoff

Branch: `codex/gif-compressor`. Base: `main` at extraction (`89563c8`).
Source preserved separately: `codex/gif-tools-foundation` / PR #39.

This branch exposes only the new `/gif-compressor` tool alongside the existing
site and Video to GIF converter. Resize, MP4, and screen capture remain deferred.
The compressor's optional smaller dimensions still require the internal GIF
geometry helper; it does not expose a resize tool. No MP4 encoding dependency is
included.

## Continue locally

```
git fetch origin
git switch --track origin/codex/gif-compressor
npm ci
npm run test:browsers:install
make start-dev-bg YTGIFY_DEV_PORT=3002 YTGIFY_DEV_TMUX_SESSION=ytgify-compressor-dev
```

Open `http://localhost:3002/gif-compressor`. Port 3001 may still serve the original
multi-tool worktree. Use a unique tmux session when running both checkouts.

## Scope and acceptance

Included: selected size presets, KB options for small files, B/KB/MB displays,
already-under-target messaging, real compression with optional resizing/frame
reduction, cancellation, replacement, preview/download, and privacy filtering.

CI has an independent compressor browser job. Compressor-owned changes skip site
and video browser suites; shared and unknown changes select all applicable suites.
The final gate requires every selected job to succeed. Production route checks
reject the deferred tool routes.

`npm run test:gif-compressor` covers real downloads, size targets, GIF timing and
loop preservation, invalid-input recovery, resource lifecycle, and replacement.
The six natural GIFs exercise measured quality and compression targets. Independent
inspection uses FFmpeg and Pillow from `scripts/gif-fixtures/requirements.txt`;
set `GIF_ORACLE_PYTHON` to the prepared interpreter. `npm run test:gif-privacy`
builds with a local-only PostHog key and checks allowed payloads. Stop this
worktree's dev server before builds.

This PR is a starting point for focused compressor refinement, not a claim of
final UX/release acceptance. Continue manual target/input/preview comparison QA,
mobile layout checks, and final release verification before merging. Keep the
other new tools deferred.

## Extraction verification

- Scope leakage: production route verification confirms the compressor and existing
  Video to GIF route exist; deferred resize, MP4, and screen-capture routes are
  absent. No mediabunny dependency is present.
- Broken media behavior after extraction: all 25 compressor browser checks passed
  against the standalone static build, across Chromium, Firefox, WebKit, and mobile
  Chromium layouts. This includes 18 natural-fixture exports plus lifecycle and
  replacement checks. Independent Pillow/gifuct fixture verification passed.
- Privacy or CI coverage regression: the enabled PostHog privacy browser test passed;
  path selection and all required-gate failure/skip combinations passed. Compressor
  paths select its dedicated job, and shared privacy changes select both media jobs.

109 unit tests and coverage, TypeScript, ESLint (warnings only), formatting,
production dependency analysis, and the static build passed locally. GitHub checks
on this PR provide the remote candidate result. The Knip configuration includes
worker dependencies; small existing studio export visibility annotations accompany
that stricter dependency check without changing converter behavior.
