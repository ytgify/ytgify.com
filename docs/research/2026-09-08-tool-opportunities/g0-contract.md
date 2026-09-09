# G0 — research and implementation contract

September 8, 2026. Experimental target: `codex/gif-tools-experimental`; draft PR #39. No deployment or main merge is authorized before owner review.

## Research decisions

Fresh US/English/Google Keyword Planner groups confirm resizer and animated-GIF-to-MP4 ranges of 10k–100k; crop and resize-online variants are 1k–10k. Screen capture's broad 1k–10k cluster includes named desktop software; exact “record screen as gif,” “screen capture gif,” and Mac variants show only 100–1k. Do not add overlapping rows or use reverse MP4-to-GIF results to inflate GIF-to-MP4 demand. Raw observations are in `remaining-keyword-evidence.json` and `remaining-serp-evidence.json`.

- **Resize/crop:** `/resize-gif`; a pixel-dimension and selected-region task. Broad resizer results lead with Ezgif, RedKetchup, GIFGIFs, Gifgit, and Canva. Crop searches include Ezgif, iLoveIMG, Adobe, and Online GIF Tools; fewer than five distinct tool results were established in that capture. Discord searches blend byte limits with dimensions. Keep both numeric controls and a visual crop, with measured dimension output and a link to compression for byte budgets.
- **GIF to MP4:** `/gif-to-mp4`; actual file conversion with selected opaque background and finite repeats. Three queries show Ezgif, CloudConvert, FreeConvert, Clipy, Canva/Adobe, and smaller browser utilities. Expect an upload/download task; distinguish it from reverse video conversion. Differentiate by correct timing/transparency treatment and no account requirement; do not promise universal codec support.
- **Screen to GIF:** `/screen-to-gif`; record a short demo and hand it to the existing converter. Broad queries include the ScreenToGif GitHub project, community, desktop downloads, and VEED; online-specific results include gifcap and Ezgif. Mac queries are dominated by app recommendations and GIPHY Capture. The broad query also exposed an account-owner Ads preview, which is excluded from organic ranking evidence. Aim at browser recording/tutorial intent; no traffic forecast based on the desktop product's demand.

The twelve query observations (three compressor plus nine remaining) use personalized desktop Google results with uncontrolled location. They are a dated sample, not fixed ranks. Where five organic tools are not visible, record that rather than count duplicate links, image cards, ads, or tutorials as tools. Existing competitor privacy/quality claims remain unverified claims. These gaps constrain traffic estimates, not the ability to implement the four requested experimental tools.

## Corpus and oracle

The corpus now includes six attributed film-derived GIFs with license/source/modification receipts, plus original tutorial/motion/sticker GIFs and diagnostics for disposal 0–3, palettes/transparency, finite/absent/infinite loops, 0/10 ms raw delays, GIF87a, interlace, odd dimensions, crop coordinates, optimized/redundant data, malformed streams, out-of-bounds patches, excessive frame count, and canvas expansion limits. Pillow and the fixture-only gifuct-js adapter must agree. Invalid/oversized cases are not handed to those unbounded decoders; B1 must reject them first. The last two film excerpts are holdouts, not tuning cases.

The oracle includes actual encoded-byte mutations for pixels, delays, and loops and a one-byte budget failure. It is now part of required CI quality checks, including PRs into the experimental branch. A passing oracle establishes test inputs; only later real product exports can establish product acceptance.

## Frozen contract and corrected dependencies

The original A3 wording required benchmarking cancellation and optimization before B3/C2 implemented them. Correct that circular dependency: G0 freezes the test contract and reference environment; B3/C2 and release gates execute the measurements. Thresholds are not waived. Existing plan thresholds remain: 1-second cancellation, 250-ms maximum heartbeat gap, 12 candidates/60 seconds, mean SSIM ≥0.95 with minimum ≥0.90, actual byte-size success, exact normalized cycle timing, correct loop semantics, and independent alpha/geometry checks.

Use conservative admission limits: 25 MB compressed input, 600 frames, 60-second normalized cycle, ≤4096 pixels per side, plus a stricter decoded-workspace admission estimate under 80 MiB. Full input limits are not an assurance that every combination is supported. Account for decoder snapshots, candidate buffers, and output scratch; lower the permitted decoded frame storage if needed to satisfy the same 80 MiB requirement. Do not weaken quality thresholds to make a sample pass.

Reference host: macOS 26.4.1, Apple model Mac17,6, 128 GiB physical memory. That is a high-memory desktop, not evidence of low-end performance. Automated validation uses pinned Playwright Chromium/Firefox/WebKit; installed Chrome supports native UI inspection. Mobile and native Safari evidence is tracked separately and cannot be inferred from desktop tests. Experimental pages must not advertise untested platform support; production acceptance remains open for unavailable tiers.

Raw missing/0/10 ms delays normalize to 100 ms; ≥20 ms remain unchanged. Preserve the raw value and disclose when normalization occurred. Positive loop extension values remain raw repeat counts; absent is once and zero is infinite. MP4 uses a user-selected finite number of complete cycles and an explicit background; its duration tolerance remains one output-frame interval plus 10 ms.

G0 is accepted as a **research/corpus/test-contract gate for experimental implementation**, with no production, performance, or mobile-support gate implied. A1/A2 research and corpus evidence are sufficient to begin B; A3's implementation-dependent measurements are attached to B3/C2 and final platform checks. R2 deployment remains held for the owner's final review.

## Implementation refinements discovered by testing

The [implementation receipt](implementation-receipt.md) records the evidence and rationale. The 80 MiB limit, 12-candidate cap, 60-second timeout and external quality minimums remain unchanged. Decoder admission counts retained input, retained RGBA frames, four canvas-sized scratch buffers and a 4 MiB reserve; transforms and optimization add their own allocation checks before creating buffers. Optimizer admission reserves two candidate frame sets plus 24 candidate-canvas equivalents for quality/encoding work. A candidate that cannot fit is skipped; the original remains an honest baseline.

Selection additionally checks RGB channels rather than luminance alone and applies stricter internal quality cutoffs. MP4 dimensions have an explicitly disclosed 16×16 minimum with even padding, required by the actual H.264 encoder. Experimental native capture acceptance is limited to desktop Chrome tab capture on macOS; native mobile and OS/window/screen permission tiers are not accepted by emulated checks.
