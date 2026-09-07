# Long source fixture

`long-source-370s.mp4` is an FFmpeg-generated moving test pattern (160×90, 5 FPS, H.264), with no customer media. It tests seeking and exporting beyond the former five-minute source limit.

Regenerate with:

The companion WebM uses VP8 for bundled Chromium, which may lack H.264 decoding. Both fixtures contain the same 370 seconds; the automated long-source test uses WebM.

```sh
ffmpeg -f lavfi -i 'testsrc2=size=160x90:rate=5:duration=370' -c:v libx264 -preset veryfast -crf 35 -g 10 -pix_fmt yuv420p -movflags +faststart tests/fixtures/long-source-370s.mp4
ffmpeg -i tests/fixtures/long-source-370s.mp4 -c:v libvpx -b:v 80k -g 10 tests/fixtures/long-source-370s.webm
```
