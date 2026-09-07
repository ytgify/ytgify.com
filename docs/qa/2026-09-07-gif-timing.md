# GIF timing validation — 2026-09-07

Base: main at `62f76298b19c469f247ff3a6d253053bbfa0c709` (PR #31).

A 3-second, 15 FPS selection previously supplied 67 ms for each of 45 frames.
The encoder's GIF centisecond conversion rounded each delay to 70 ms, totaling
3.15 seconds. Timing now uses differences between rounded cumulative boundaries.
Frame count remains `ceil(duration * fps)`, matching the memory budget. Sampling
is evenly distributed over the trim so fractional lengths do not append an
extra full interval or a very short final frame. The encoder consumes those
allocated millisecond delays directly.

## Failure modes and evidence

1. **Rounding drift at 15 FPS:** the unit suite parses real gifenc output. The
   3-second case contains exactly 45 image frames: 15 at 60 ms and 30 at 70 ms.
   Total: 3.00 seconds. Cumulative boundary error is at most 5 ms.
2. **Fractional lengths overshoot or introduce near-zero delays:** deterministic
   tests cover every 0.1-second duration from 0.1 through 10 seconds at all three
   supported FPS settings. All boundaries stay within 5 ms; every delay is a
   multiple of 10 ms and at least 20 ms. Actual encoded output is also checked
   at 0.1, 0.3, 3, 3.1, 3.137, and 10 seconds. Non-centisecond lengths round once
   to GIF precision (3.137 seconds becomes 3.14 seconds).
3. **Browser capture/decode regressions:** 24 real-video exports passed across
   Chromium, Firefox, WebKit, and mobile Chromium (390 × 844): 5/10/15 FPS at
   3.0/3.1 seconds. Downloads are parsed for frame count, delay spread, minimum
   delay, and total duration. Existing connected decoding-source and missed-seek
   recovery checks also passed. Video preparation, decode readiness, attachment,
   cancellation, and restoration logic remain unchanged.

## Independently inspected downloads

`ffprobe` independently decoded all 24 saved GIFs. Each browser produced the
following results; Chromium/Firefox use the bundled WebM fixture and WebKit uses
its MP4 counterpart.

| FPS | Selection | Frames | Frame delays (count × ms) | Encoded duration |
| --- | --------- | ------ | ------------------------- | ---------------- |
| 5   | 3.0 s     | 15     | 15 × 200                  | 3.00 s           |
| 5   | 3.1 s     | 16     | 10 × 190 + 6 × 200        | 3.10 s           |
| 10  | 3.0 s     | 30     | 30 × 100                  | 3.00 s           |
| 10  | 3.1 s     | 31     | 31 × 100                  | 3.10 s           |
| 15  | 3.0 s     | 45     | 15 × 60 + 30 × 70         | 3.00 s           |
| 15  | 3.1 s     | 47     | 19 × 60 + 28 × 70         | 3.10 s           |

The browser test attaches each GIF and its centisecond delays to the Playwright
report. Local copies of the full report, all 24 downloads, and `ffprobe.json`
were retained at `/tmp/ytgify-gif-timing-evidence` before push smoke tests replace
the working report. To independently inspect any download:

```sh
ffprobe -v error -show_entries format=duration:frame=duration_time -of json downloaded.gif
```

## Validation

- `npm run test:unit`: 63 passed, including 21 timing tests.
- `npm run test:e2e -- --workers=4`: 89 passed, including the 24 timing exports.
- ESLint: no errors; six existing function-size warnings.
- Prettier, TypeScript, Knip production graph, and CI boundary checks passed.
- Production build passed as part of the full browser run.

Residual limits: WebKit automation is not a physical iPhone or iOS simulator run.
Tests verify encoded timing and successful browser exports, not wall-clock
animation playback under operating-system throttling. GIF precision still limits
arbitrary durations to the nearest 10 ms.
