# Visual timeline fixture

These generated, audio-free 320 × 240 videos contain 60 frames at 10 FPS. MP4
uses H.264; WebM uses VP9. Regenerate both with Python 3 and ffmpeg:

```sh
python3 tests/fixtures/generate-visual-timeline.py
```

CI uses the committed files and does not need Python or ffmpeg.

Each second has a different solid RGB background: (180,40,40), (40,160,40),
(40,40,180), (180,120,30), (140,40,160), then (30,140,160).
Six blocks at y=90–129 encode the zero-based source frame number in binary,
least significant bit first, using dark (10) and light (240) grayscale values.
Block centers are x=32,80,128,176,224,272. The caption regions contain no white.

The E2E test selects 1.1–4.1 seconds at 5 FPS, expecting source frame IDs
11,13,…,39 (allowing one source frame of browser seek boundary variation).
IDs must advance strictly and each frame's background must match its decoded ID.
The test repeats the export with top and bottom captions and verifies new white
pixels in both caption regions on every decoded frame. Color tolerances allow
lossy source encoding and palette quantization without accepting a wrong second.

The six-bit markers prove frame identity without OCR or platform font snapshots.
Caption assertions prove rendered presence and placement, not exact spelling.
Both downloaded GIFs and decoded frame IDs are attached to the Playwright report.
