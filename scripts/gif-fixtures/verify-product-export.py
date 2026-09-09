"""Independently inspect product downloads; Pillow/FFmpeg never use production GIF code."""
import json
import os
import subprocess
import sys
from PIL import Image, ImageSequence

mode, source_path, output_path, *args = sys.argv[1:]
source = Image.open(source_path)
frames = [frame.convert('RGBA') for frame in ImageSequence.Iterator(source)]
if mode == 'crop':
    left, top, width, height = map(int, args)
    output = Image.open(output_path)
    actual = [frame.convert('RGBA') for frame in ImageSequence.Iterator(output)]
    assert len(actual) == len(frames)
    for original, exported in zip(frames, actual, strict=True):
        assert original.crop((left, top, left + width, top + height)).tobytes() == exported.tobytes(), 'crop pixel mismatch'
    print(json.dumps({'frames': len(actual), 'exactCropPixels': True}))
elif mode == 'mp4':
    cycles = int(args[0])
    probe = json.loads(subprocess.check_output([os.environ.get('FFPROBE', 'ffprobe'), '-v', 'error', '-show_frames', '-select_streams', 'v', '-of', 'json', output_path]))
    packets = probe['frames']
    assert len(packets) == len(frames) * cycles, 'frame count/order lost'
    timestamps = [float(frame['best_effort_timestamp_time']) for frame in packets]
    assert all(b > a for a, b in zip(timestamps, timestamps[1:])), 'non-monotonic timestamps'
    width = max(16, (source.width + 1) // 2 * 2)
    height = max(16, (source.height + 1) // 2 * 2)
    raw = subprocess.check_output([os.environ.get('FFMPEG', 'ffmpeg'), '-v', 'error', '-i', output_path, '-fps_mode', 'passthrough', '-enc_time_base', '1:1000', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
    stride = width * height * 3
    assert len(raw) == stride * len(packets)
    errors = []
    for index in range(len(packets)):
        image = Image.frombytes('RGB', (width, height), raw[index * stride:(index + 1) * stride])
        # The padded area must use the selected default white matte (small H.264 chroma error allowed).
        if source.width < width and source.height < height:
            assert min(image.getpixel((width - 1, height - 1))) >= 235, 'transparency/padding matte differs'
        expected = Image.new('RGBA', source.size, 'white')
        expected.alpha_composite(frames[index % len(frames)])
        a = image.crop((0, 0, source.width, source.height)).tobytes()
        b = expected.convert('RGB').tobytes()
        errors.append(sum(abs(x - y) for x, y in zip(a, b, strict=True)) / len(a))
    # Chroma subsampling affects tiny color diagnostics; this catches blank/shifted frames without claiming lossless MP4.
    assert max(errors) < 65, 'decoded MP4 frame color/ordering differs excessively'
    print(json.dumps({'frames': len(packets), 'monotonicTimestamps': True, 'maximumRgbMeanAbsoluteError': max(errors), 'meanRgbMeanAbsoluteError': sum(errors) / len(errors)}))
else:
    raise ValueError('unknown verification mode')
