"""Check actual GIF files through Pillow, gifuct-js, and authored canvas goldens."""

import hashlib
import io
import json
import platform
import subprocess
import tempfile
import time
from pathlib import Path

import PIL
from PIL import Image, ImageSequence

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "tests/fixtures/gif"


def digest(image):
    # RGB values under alpha=0 are invisible and decoder-dependent.
    pixels = bytearray(image.convert("RGBA").tobytes())
    for i in range(0, len(pixels), 4):
        if pixels[i + 3] == 0:
            pixels[i:i + 3] = b"\0\0\0"
    return hashlib.sha256(pixels).hexdigest()


def inspect_pillow(data):
    image = Image.open(io.BytesIO(data))
    assert image.width * image.height <= 4096 * 4096, "unsafe canvas"
    loop = image.info.get("loop")
    hashes, delays = [], []
    for frame in ImageSequence.Iterator(image):
        hashes.append(digest(frame))
        delay = frame.info.get("duration")
        delays.append(None if delay is None else delay // 10)
    return dict(hashes=hashes, rawDelaysCs=delays, loop=loop, bytes=len(data),
                width=image.width, height=image.height)


def assert_contract(actual, expected, maximum_bytes=None):
    for field in ["hashes", "rawDelaysCs", "loop", "width", "height"]:
        assert actual[field] == expected[field], f"{field}: actual differs from oracle"
    if maximum_bytes is not None:
        assert actual["bytes"] <= maximum_bytes, "target exceeded"


def must_fail(callback, field):
    try:
        callback()
    except AssertionError as error:
        assert field in str(error), f"wrong rejection reason: {error}"
        return
    raise AssertionError(f"Harness accepted deliberately wrong {field}")


def negative_controls():
    data = (CORPUS / "loop-finite.gif").read_bytes()
    expected = inspect_pillow(data)
    timing = bytearray(data)
    control = data.index(b"!\xf9\x04")
    timing[control + 4] += 1
    must_fail(lambda: assert_contract(inspect_pillow(timing), expected), "rawDelaysCs")
    looping = bytearray(data)
    loop = data.index(b"NETSCAPE2.0") + 13
    looping[loop] += 1
    must_fail(lambda: assert_contract(inspect_pillow(looping), expected), "loop")
    color = bytearray(data)
    color[16] = 0  # Global palette entry 1 red channel; actual decoded pixels change.
    must_fail(lambda: assert_contract(inspect_pillow(color), expected), "hashes")
    must_fail(lambda: assert_contract(expected, expected, len(data) - 1), "target exceeded")
    return ["actual palette corruption", "actual delay corruption", "actual loop corruption", "one-byte-over budget"]


def main():
    started = time.perf_counter()
    manifest = json.loads((CORPUS / "manifest.json").read_text())
    valid = [entry for entry in manifest["fixtures"] if entry["decodeForOracle"]]
    paths = [str(CORPUS / entry["file"]) for entry in valid]
    second = json.loads(subprocess.check_output(["node", str(ROOT / "scripts/gif-fixtures/inspect-gifuct.mjs"), *paths]))
    results = []
    for entry, decoded in zip(valid, second, strict=True):
        data = (CORPUS / entry["file"]).read_bytes()
        assert hashlib.sha256(data).hexdigest() == entry["sha256"], entry["id"]
        actual = inspect_pillow(data)
        assert_contract(actual, decoded)
        assert actual["rawDelaysCs"] == entry["rawDelaysCs"], entry["id"]
        assert actual["loop"] == entry["loop"], entry["id"]
        assert [actual["width"], actual["height"]] == [entry["width"], entry["height"]], entry["id"]
        assert len(actual["hashes"]) == entry["frameCount"], entry["id"]
        if entry["expectedRgbaSha256"]:
            goldens = sorted((CORPUS / "goldens").glob(entry["id"] + "-*.png"))
            assert len(goldens) == len(actual["hashes"])
            for path, recorded_hash in zip(goldens, entry["expectedRgbaSha256"], strict=True):
                assert hashlib.sha256(Image.open(path).convert("RGBA").tobytes()).hexdigest() == recorded_hash
            assert actual["hashes"] == [digest(Image.open(path)) for path in goldens], entry["id"]
        results.append(dict(id=entry["id"], frames=len(actual["hashes"]), bytes=len(data),
                            independentDecodersAgree=True, authoredGoldens=bool(entry["expectedRgbaSha256"])))
    for entry in manifest["fixtures"]:
        if not entry["decodeForOracle"]:
            data = (CORPUS / entry["file"]).read_bytes()
            assert hashlib.sha256(data).hexdigest() == entry["sha256"]
    receipt = dict(status="fixture harness passed; product gates remain open", platform=platform.platform(),
                   python=platform.python_version(), pillow=PIL.__version__, fixtures=results,
                   negativeControls=negative_controls(), elapsedSeconds=round(time.perf_counter() - started, 3),
                   limitations=["Invalid fixtures inventoried, not product-rejection tested", "No compressor implemented",
                                "Desktop inspection runtime is not browser performance", "Real mobile hardware not tested"])
    with tempfile.TemporaryDirectory() as temporary:
        # Prove the receipt serializes without relying on browser state or generated UI.
        path = Path(temporary) / "receipt.json"
        path.write_text(json.dumps(receipt, indent=2))
        print(path.read_text())


if __name__ == "__main__":
    main()
