#!/usr/bin/env python3
"""
Alight — brand asset generator.

Rasterizes the "cream butterfly on a sunset gradient" mark into the PNG app
icons (home-screen / PWA / Apple touch), sampling the *same* cubic Bezier wing
paths as the vector favicon so raster and vector stay identical. Also bakes a
subtle tileable grain texture used to keep the UI's glows smooth (no banding).

Deps: Pillow only.  Run:  python3 scripts/generate_assets.py
"""

import os
import random
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
TEX = os.path.join(PUBLIC, "textures")

# ---- palette (matches src/app/icon.svg) --------------------------------------
GOLD = (0xFF, 0xB0, 0x20)
PINK = (0xFF, 0x3D, 0x8B)
PURPLE = (0xA8, 0x55, 0xF7)
CREAM = (0xFF, 0xF6, 0xEC)
PLUM = (0x3A, 0x11, 0x40)

SS = 4                      # supersample over the 512 design space
N = 512 * SS


def px(v):
    return int(round(v * SS))


def lerp(a, b, t):
    return tuple(int(a[k] + (b[k] - a[k]) * t) for k in range(3))


def sunset(t):
    return lerp(GOLD, PINK, t * 2) if t < 0.5 else lerp(PINK, PURPLE, (t - 0.5) * 2)


# ---- geometry ---------------------------------------------------------------
def cubic(p0, c1, c2, p1, steps=40):
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t**3 * p1[0]
        y = u**3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t**3 * p1[1]
        out.append((px(x), px(y)))
    return out


# each wing = three cubic segments (p0, c1, c2, p1)
WINGS = {
    "ul": [((256, 208), (208, 150), (150, 148), (124, 186)),
           ((124, 186), (102, 220), (138, 260), (188, 256)),
           ((188, 256), (222, 253), (246, 244), (256, 234))],
    "ll": [((256, 256), (222, 260), (176, 278), (172, 320)),
           ((172, 320), (169, 350), (208, 356), (234, 334)),
           ((234, 334), (250, 320), (256, 300), (256, 286))],
    "ur": [((256, 208), (304, 150), (362, 148), (388, 186)),
           ((388, 186), (410, 220), (374, 260), (324, 256)),
           ((324, 256), (290, 253), (266, 244), (256, 234))],
    "lr": [((256, 256), (290, 260), (336, 278), (340, 320)),
           ((340, 320), (343, 350), (304, 356), (278, 334)),
           ((278, 334), (262, 320), (256, 300), (256, 286))],
}


def wing_polygon(key):
    poly = []
    for seg in WINGS[key]:
        poly += cubic(*seg)
    return poly


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def build_icon(rounded=True):
    # diagonal sunset gradient
    small = 128
    g = Image.new("RGB", (small, small))
    gp = g.load()
    for y in range(small):
        for x in range(small):
            gp[x, y] = sunset((x + y) / (2 * (small - 1)))
    img = g.resize((N, N), Image.BILINEAR).convert("RGBA")

    d = ImageDraw.Draw(img)
    # wings
    for key in ("ul", "ll", "ur", "lr"):
        d.polygon(wing_polygon(key), fill=CREAM + (255,))
    # gold eyespots
    for cx in (188, 324):
        d.ellipse([px(cx - 13), px(206 - 13), px(cx + 13), px(206 + 13)], fill=GOLD)
    # body + head
    d.rounded_rectangle([px(246), px(188), px(266), px(338)], radius=px(10), fill=PLUM)
    d.ellipse([px(241), px(173), px(271), px(203)], fill=PLUM)
    # antennae
    for c1, c2, end, tip in (
        ((250, 160), (240, 152), (230, 148), (229, 147)),
        ((262, 160), (272, 152), (282, 148), (283, 147)),
    ):
        d.line(cubic((256, 180), c1, c2, end, 20), fill=PLUM, width=px(7), joint="curve")
        d.ellipse([px(tip[0] - 8), px(tip[1] - 8), px(tip[0] + 8), px(tip[1] + 8)], fill=CREAM)

    if rounded:
        img.putalpha(rounded_mask(N, px(122)))
    return img


def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(PUBLIC, name))
    print(f"  wrote public/{name} ({size}px)")


def build_grain():
    os.makedirs(TEX, exist_ok=True)
    random.seed(7)
    s = 180
    data = bytearray()
    for _ in range(s * s):
        data += bytes((255, 255, 255, random.randint(0, 24)))
    Image.frombytes("RGBA", (s, s), bytes(data)).save(os.path.join(TEX, "grain.png"))
    print("  wrote public/textures/grain.png")


def main():
    print("Rendering butterfly icon...")
    rounded = build_icon(rounded=True)
    full = build_icon(rounded=False)
    save(rounded, "icon-512.png", 512)
    save(rounded, "icon-192.png", 192)
    save(rounded, "apple-touch-icon.png", 180)
    save(full, "maskable-512.png", 512)
    print("Rendering grain texture...")
    build_grain()
    print("Done.")


if __name__ == "__main__":
    main()
