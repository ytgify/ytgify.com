"""Create six attributed real-film GIF holdouts from an explicitly supplied source."""
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageSequence

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tests/fixtures/gif"
source = Path(sys.argv[1])
entries = []
for index, start in enumerate([30, 60, 90, 150, 210, 300], 1):
    name = f"natural-bunny-{index}"
    path = OUT / f"{name}.gif"
    subprocess.run([os.environ.get("FFMPEG", "ffmpeg"), "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", str(start), "-i", str(source), "-t", "2", "-an", "-filter_complex",
                    "fps=10,scale=256:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
                    "-loop", "0", str(path)], check=True)
    with Image.open(path) as image:
        delays, modes = [], set()
        for frame in ImageSequence.Iterator(image):
            delays.append(frame.info.get("duration", 0) // 10)
            modes.add(getattr(frame, "disposal_method", 0))
        metadata = dict(width=image.width, height=image.height, frameCount=image.n_frames,
                        disposalModes=sorted(modes), loop=image.info.get("loop"))
    data = path.read_bytes()
    entries.append(dict(id=name, file=path.name, sha256=hashlib.sha256(data).hexdigest(), bytes=len(data),
                        decodeForOracle=True, expectedOutcome="decode", rawDelaysCs=delays,
                        expectedRgbaSha256=[], features=["real-film", "holdout" if index > 4 else "benchmark"],
                        provenance="(c) copyright 2008, Blender Foundation / www.bigbuckbunny.org; CC-BY-3.0",
                        sourceUrl="https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4.zip",
                        licenseUrl="https://peach.blender.org/about/", startSeconds=start, clipSeconds=2,
                        modifications="2-second extract; 10 FPS; resized to 256 pixels wide; converted to GIF", **metadata))
(OUT / "natural-manifest.json").write_text(json.dumps(dict(schemaVersion=1, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
    fixtures=entries), indent=2) + "\n")
print("Generated six CC-BY-3.0 real-film GIF samples")
