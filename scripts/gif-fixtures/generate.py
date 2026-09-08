"""Generate original, redistributable GIF inputs and independent canvas goldens."""

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw

from gif_writer import PALETTE, write_gif

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tests/fixtures/gif"
ENTRIES = []


def frame(color, width=16, height=12, **kwargs):
    return dict(width=width, height=height, pixels=[color] * (width * height), **kwargs)


def canvas(color, width=16, height=12):
    return Image.new("RGBA", (width, height), (*PALETTE[color], 255))


def rectangle(image, box, color):
    result = image.copy()
    ImageDraw.Draw(result).rectangle(box, fill=(*PALETTE[color], 255))
    return result


def register(name, data, goldens, delays, loop, features, valid=True):
    (OUT / f"{name}.gif").write_bytes(data)
    hashes = []
    for index, image in enumerate(goldens):
        image = image.convert("RGBA")
        image.save(OUT / "goldens" / f"{name}-{index:03}.png")
        hashes.append(hashlib.sha256(image.tobytes()).hexdigest())
    metadata = {}
    if valid:
        with Image.open(OUT / f"{name}.gif") as image:
            modes = set()
            for index in range(image.n_frames):
                image.seek(index)
                modes.add(getattr(image, "disposal_method", 0))
            metadata = dict(width=image.width, height=image.height, frameCount=image.n_frames,
                            disposalModes=sorted(modes))
    ENTRIES.append(dict(id=name, file=f"{name}.gif", sha256=hashlib.sha256(data).hexdigest(),
                        bytes=len(data), decodeForOracle=valid, features=features, rawDelaysCs=delays,
                        expectedOutcome="decode" if valid else "reject-before-unbounded-decode", **metadata,
                        loop=loop, expectedRgbaSha256=hashes,
                        provenance="Original deterministic test artwork; CC0-1.0"))


def diagnostics():
    for disposal in range(4):
        frames = [frame(3), frame(1, 6, 4, left=2, top=2, dispose=disposal),
                  frame(2, 3, 3, left=10, top=7)]
        first = canvas(3)
        second = rectangle(first, (2, 2, 7, 5), 1)
        third = second if disposal < 2 else rectangle(first, (2, 2, 7, 5), 0) if disposal == 2 else first
        register(f"disposal-{disposal}", write_gif(16, 12, frames, 0),
                 [first, second, rectangle(third, (10, 7, 12, 9), 2)], [10] * 3, 0,
                 ["partial-patches", f"disposal-{disposal}", "nonzero-origin"])
    # Transparent patch leaves green outside its red center. Local palette changes red to blue.
    patch = frame(0, 6, 4, left=2, top=2, transparent=0,
                  palette=[PALETTE[0], PALETTE[2], PALETTE[1], PALETTE[3]])
    for y in range(1, 3):
        for x in range(1, 5):
            patch["pixels"][y * 6 + x] = 1
    register("local-palette-alpha", write_gif(16, 12, [frame(3), patch]),
             [canvas(3), rectangle(canvas(3), (3, 3, 6, 4), 2)], [10, 10], None,
             ["local-palette", "transparent-patch"])
    for name, loop in [("loop-absent", None), ("loop-finite", 2), ("loop-infinite", 0)]:
        register(name, write_gif(16, 12, [frame(1), frame(2)], loop),
                 [canvas(1), canvas(2)], [10, 10], loop, ["loop-semantics"])
    delays = [0, 1, 2, 7, 23]
    register("variable-delays", write_gif(16, 12, [frame(i % 4, delay=d) for i, d in enumerate(delays)], 0),
             [canvas(i % 4) for i in range(5)], delays, 0, ["raw-delay-edge-cases"])
    register("gif87a-no-delay", write_gif(16, 12, [frame(1, gce=False)], version=b"87a"),
             [canvas(1)], [None], None, ["gif87a", "missing-gce", "single-frame"])
    pixels = [y % 4 for y in range(13) for _ in range(17)]
    expected = Image.new("RGBA", (17, 13))
    expected.putdata([(*PALETTE[p], 255) for p in pixels])
    register("interlaced-odd", write_gif(17, 13, [dict(width=17, height=13, pixels=pixels, interlace=True)]),
             [expected], [10], None, ["interlace", "odd-dimensions"])
    register("transparent-single-pixel", write_gif(1, 1, [frame(0, 1, 1, transparent=0)]),
             [Image.new("RGBA", (1, 1), (255, 255, 255, 0))], [10], None,
             ["fully-transparent", "single-frame", "1x1"])
    redundant = [frame(3, 64, 48) for _ in range(12)]
    register("compressible", write_gif(64, 48, redundant, 0),
             [canvas(3, 64, 48)] * 12, [10] * 12, 0, ["redundant-encoding"])
    good = write_gif(16, 12, [frame(1)])
    register("truncated", good[:35], [], [], None, ["truncated-subblocks"], False)
    bomb = bytearray(good)
    bomb[6:10] = b"\xff\xff\xff\xff"
    register("huge-canvas", bytes(bomb), [], [], None, ["65535-square-canvas", "reject-before-allocation"], False)
    register("false-signature", b"not a gif", [], [], None, ["deceptive-extension"], False)


def authored_artwork():
    for kind in ["tutorial", "motion", "sticker"]:
        images = []
        for index in range(24):
            image = Image.new("RGBA", (160, 96), (0, 0, 0, 0) if kind == "sticker" else (22, 29, 42, 255))
            draw = ImageDraw.Draw(image)
            if kind == "tutorial":
                draw.rectangle((5, 5, 154, 90), fill=(240, 243, 249))
                draw.text((10, 10), "GIF export tutorial", fill=(20, 30, 50))
                draw.text((10, 28), f"Step {index // 8 + 1}: export", fill=(20, 30, 50))
                draw.rectangle((10, 52, 10 + index * 5, 65), fill=(40, 130, 190))
                draw.text((10, 73), f"Frame {index:02}", fill=(20, 30, 50))
            elif kind == "motion":
                for y in range(0, 96, 4):
                    for x in range(0, 160, 4):
                        draw.rectangle((x, y, x + 3, y + 3), fill=((x * 5 + index * 7) % 256, (y * 7) % 256, (x + y) % 256))
                x = 5 + index * 5
                draw.ellipse((x, 30, x + 30, 60), fill=(250, 240, 30))
                draw.text((5, 5), f"FRAME {index:02}", fill="white")
            else:
                x = 5 + index * 4
                draw.rounded_rectangle((x, 20, x + 55, 75), radius=10, fill=(230, 60, 140, 255))
                draw.text((x + 10, 40), "GIF!", fill="white")
            images.append(image)
        path = OUT / f"original-{kind}.gif"
        images[0].save(path, save_all=True, append_images=images[1:], duration=100, loop=0, disposal=2, optimize=False)
        data = path.read_bytes()
        # Authored artwork is an integration sample; no self-decoded pixel oracle is declared.
        register(f"original-{kind}", data, [], [10] * 24, 0, ["original-artwork", kind])


if __name__ == "__main__":
    (OUT / "goldens").mkdir(parents=True, exist_ok=True)
    diagnostics()
    authored_artwork()
    (OUT / "manifest.json").write_text(json.dumps(dict(schemaVersion=1, fixtures=ENTRIES), indent=2) + "\n")
    print(f"Generated {len(ENTRIES)} real GIF files and independent diagnostic PNG goldens")
