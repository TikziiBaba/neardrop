"""NearDrop Android ikonları — piksel damla.

Kullanım:  python make_android_icons.py <android/app/src/main/res>
Uyarlanabilir ikonda hücre 4 dp: her yoğunlukta (mdpi 4 px … xxxhdpi 16 px) hücreler tam piksele oturur.
Klasik ic_launcher.png ve eski açılış logosu, kitteki karodan (neardrop-logo/png/neardrop-app-icon-1024.png) üretilir.
"""
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RES = sys.argv[1]

ROWS = {
    1: (7, 8), 2: (7, 8), 3: (6, 9), 4: (5, 10), 5: (4, 11), 6: (3, 12), 7: (3, 12), 8: (2, 13),
    9: (2, 13), 10: (2, 13), 11: (2, 13), 12: (2, 13), 13: (3, 12), 14: (5, 10),
}
EYES = {(9, 6), (10, 6), (9, 9), (10, 9)}
GLINTS = {(6, 4), (7, 4), (8, 3)}

ALLAY = (0x62, 0xDC, 0xF5, 255)
GLINT = (0xD4, 0xFB, 0xFF, 255)
DEEP = (0x0B, 0x2D, 0x5C)
NIGHT = (0x06, 0x10, 0x26)


def drop(size, cell, ox, oy, mono=False):
    """Şeffaf tuvalde damla. mono=True: beyaz siluet, gözler delik, parıltı yok (temalı ikon)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for r, (c0, c1) in ROWS.items():
        for c in range(c0, c1 + 1):
            if (r, c) in EYES:
                if mono:
                    continue
                color = DEEP + (255,)
            elif (r, c) in GLINTS and not mono:
                color = GLINT
            else:
                color = (255, 255, 255, 255) if mono else ALLAY
            x, y = ox + c * cell, oy + r * cell
            d.rectangle([x, y, x + cell - 1, y + cell - 1], fill=color)
    return img


def gradient(size):
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = tuple(round(DEEP[i] + (NIGHT[i] - DEEP[i]) * t) for i in range(3)) + (255,)
    return img


def save(img, rel):
    path = os.path.join(RES, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)


tile = Image.open(os.path.join(HERE, "neardrop-logo", "png", "neardrop-app-icon-1024.png")).convert("RGBA")

for name, k in {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}.items():
    size = round(108 * k)
    cell = round(4 * k)
    # Damla kutusu (8, 8) hücre merkezli; tuvalin ortasına, optik olarak 1 dp yukarı
    ox, oy = size // 2 - 8 * cell, size // 2 - 8 * cell - round(k)
    save(gradient(size), f"mipmap-{name}/ic_launcher_background.png")
    save(drop(size, cell, ox, oy), f"mipmap-{name}/ic_launcher_foreground.png")
    save(drop(size, cell, ox, oy, mono=True), f"mipmap-{name}/ic_launcher_monochrome.png")
    legacy = round(48 * k)
    save(tile.resize((legacy, legacy), Image.LANCZOS), f"mipmap-{name}/ic_launcher.png")

# Android 12+ açılış ekranı simgesi: 240 dp tuval, 160 dp daire içinde görünür
save(drop(960, 36, 480 - 8 * 36, 480 - 8 * 36 - 12), "drawable-nodpi/splash_icon.png")
# Android 11 ve öncesi açılış ekranının ortası
save(tile.resize((288, 288), Image.LANCZOS), "drawable-nodpi/splash_logo.png")
print("ok")
