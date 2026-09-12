"""Small fixture-only GIF writer. Deliberately simple LZW, not production code."""

import struct


PALETTE = [(255, 255, 255), (220, 30, 30), (30, 60, 220), (20, 170, 70)]


def subblocks(data):
    return b"".join(bytes([len(data[i:i + 255])]) + data[i:i + 255]
                    for i in range(0, len(data), 255)) + b"\0"


def literal_lzw(pixels):
    # Clear before every literal keeps code width at three bits throughout.
    codes = [code for pixel in pixels for code in (4, pixel)] + [5]
    packed, bits, value = bytearray(), 0, 0
    for code in codes:
        value |= code << bits
        bits += 3
        while bits >= 8:
            packed.append(value & 255)
            value >>= 8
            bits -= 8
    if bits:
        packed.append(value)
    return bytes(packed)


def write_gif(width, height, frames, loop=None, version=b"89a"):
    data = bytearray(b"GIF" + version)
    data += struct.pack("<HHBBB", width, height, 0x81, 0, 0)
    data += bytes(channel for color in PALETTE for channel in color)
    if loop is not None:
        data += b"!\xff\x0bNETSCAPE2.0\x03\x01" + struct.pack("<H", loop) + b"\0"
    for frame in frames:
        transparent = frame.get("transparent")
        if frame.get("gce", True):
            flags = (frame.get("dispose", 1) << 2) | int(transparent is not None)
            data += b"!\xf9\x04" + struct.pack("<BHB", flags, frame.get("delay", 10), transparent or 0) + b"\0"
        palette = frame.get("palette")
        flags = (0x81 if palette else 0) | (0x40 if frame.get("interlace") else 0)
        data += b"," + struct.pack("<HHHHB", frame.get("left", 0), frame.get("top", 0),
                                    frame["width"], frame["height"], flags)
        if palette:
            data += bytes(channel for color in palette for channel in color)
        pixels = frame["pixels"]
        if frame.get("interlace"):
            rows = [y for start, step in [(0, 8), (4, 8), (2, 4), (1, 2)]
                    for y in range(start, frame["height"], step)]
            pixels = [p for y in rows for p in pixels[y * frame["width"]:(y + 1) * frame["width"]]]
        data += b"\x02" + subblocks(literal_lzw(pixels))
    return bytes(data + b";")
