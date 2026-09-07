"""Regenerate the six-second visual oracle with Python 3 and ffmpeg (not needed in CI)."""
from pathlib import Path
import subprocess

folder = Path(__file__).parent
colors = [(180, 40, 40), (40, 160, 40), (40, 40, 180),
          (180, 120, 30), (140, 40, 160), (30, 140, 160)]
command = ['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pixel_format', 'rgb24',
           '-video_size', '320x240', '-framerate', '10', '-i', 'pipe:0', '-an',
           '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
           str(folder / 'visual-timeline.mp4'), '-an', '-c:v', 'libvpx-vp9', '-crf', '12',
           '-b:v', '0', '-pix_fmt', 'yuv420p', str(folder / 'visual-timeline.webm')]
process = subprocess.Popen(command, stdin=subprocess.PIPE)
for frame in range(60):
    pixels = bytearray(bytes(colors[frame // 10]) * (320 * 240))
    # Six spatial bits encode the source frame number, least significant first.
    for bit in range(6):
        value = 240 if frame & (1 << bit) else 10
        for y in range(90, 130):
            for x in range(16 + bit * 48, 48 + bit * 48):
                offset = (y * 320 + x) * 3
                pixels[offset:offset + 3] = bytes([value] * 3)
    process.stdin.write(pixels)
process.stdin.close()
assert process.wait() == 0
