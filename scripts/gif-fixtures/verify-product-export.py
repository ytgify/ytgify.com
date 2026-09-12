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
