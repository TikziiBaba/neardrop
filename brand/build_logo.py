"""NearDrop logo kiti — "Piksel damla" (B konsepti) master dosyaları.

Çalıştırma (Fraunces yazısı için fontTools gerekir):
    python build_logo.py --fonts <Fraunces[...].ttf klasörü>
Çıktı: brand/neardrop-logo/*.svg
"""
import argparse
import os
import re

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "neardrop-logo")

# ───────────── Renkler (Allay paleti, globals.css ile aynı aile) ─────────────
NIGHT = "#061026"      # zemin
DEEP = "#0B2D5C"       # gece mavisi, gözler
ACCENT = "#0D93CD"     # açık zeminde gövde
ALLAY = "#62DCF5"      # koyu zeminde gövde (imza renk)
GLINT = "#D4FBFF"      # parıltı
FOREGROUND = "#F2FBFE"

# ───────────── Sembol geometrisi: 16×16 ızgara, birim 16 (256'lık tuval) ─────────────
UNIT = 16
ROWS = {
    1: (7, 8), 2: (7, 8), 3: (6, 9), 4: (5, 10), 5: (4, 11), 6: (3, 12), 7: (3, 12), 8: (2, 13),
    9: (2, 13), 10: (2, 13), 11: (2, 13), 12: (2, 13), 13: (3, 12), 14: (5, 10),
}
EYES = {(9, 6), (10, 6), (9, 9), (10, 9)}
# Sol omuzda damla parıltısı (yalnızca renkli sürümde)
GLINTS = {(6, 4), (7, 4), (8, 3)}


def cells(exclude=frozenset()):
    """Damlanın dolu hücreleri (satır, sütun)."""
    return {(r, c) for r, (c0, c1) in ROWS.items() for c in range(c0, c1 + 1)} - set(exclude)


def cells_path(cs, unit=UNIT, ox=0, oy=0):
    """Hücreleri satır satır birleşik dikdörtgenlere çevirir (tek yol, ek yeri yok)."""
    d = []
    for r in sorted({r for r, _ in cs}):
        cols = sorted(c for rr, c in cs if rr == r)
        start = prev = cols[0]
        for c in cols[1:] + [None]:
            if c is not None and c == prev + 1:
                prev = c
                continue
            w = (prev - start + 1) * unit
            d.append(f"M{ox + start * unit:g} {oy + r * unit:g}h{w:g}v{unit:g}h{-w:g}z")
            if c is not None:
                start = prev = c
    return "".join(d)


def symbol_body(body, eyes=None, glint=None, unit=UNIT, ox=0, oy=0):
    """eyes=None → gözler delik (tek renk). glint=None → parıltı yok."""
    if eyes is None and glint is None:
        return f'<path fill="{body}" d="{cells_path(cells(EYES), unit, ox, oy)}"/>'
    parts = [f'<path fill="{body}" d="{cells_path(cells(EYES | (GLINTS if glint else set())), unit, ox, oy)}"/>']
    if glint:
        parts.append(f'<path fill="{glint}" d="{cells_path(GLINTS, unit, ox, oy)}"/>')
    # eyes verilmezse göz delikleri gövdede boş kalır
    if eyes:
        parts.append(f'<path fill="{eyes}" d="{cells_path(EYES, unit, ox, oy)}"/>')
    return "".join(parts)


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}" '
            f'role="img" aria-labelledby="title" shape-rendering="crispEdges">'
            f'<title id="title">{title}</title>{body}</svg>\n')


# ───────────── Yazı: Fraunces "Near" + italik "Drop", yollara çevrilmiş ─────────────
AXES = {"wght": 600, "opsz": 48, "SOFT": 0, "WONK": 0}
TRACKING = -0.02  # em; sitedeki tracking-tight'a yakın


def load(path):
    font = TTFont(path)
    axes = {a.axisTag for a in font["fvar"].axes}
    return instantiateVariableFont(font, {k: v for k, v in AXES.items() if k in axes})


def text_paths(font, text, x, baseline, cap_height):
    """Metni (x, baseline) noktasından yollara çevirir; ölçek büyük harf yüksekliğine göre."""
    upm = font["head"].unitsPerEm
    cap = getattr(font["OS/2"], "sCapHeight", 0) or int(upm * 0.7)
    scale = cap_height / cap
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    d = []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        # 2 ondalık yeterli; fazlası dosyayı şişirir
        d.append(re.sub(r"-?\d+\.\d{3,}", lambda m: f"{float(m.group()):.2f}".rstrip("0").rstrip("."), pen.getCommands()))
        x += hmtx[name][0] * scale + TRACKING * upm * scale
    return " ".join(d), x


def wordmark(fonts_dir, x, baseline, cap_height, near_fill, drop_fill):
    roman = load(os.path.join(fonts_dir, "Fraunces[SOFT,WONK,opsz,wght].ttf"))
    italic = load(os.path.join(fonts_dir, "Fraunces-Italic[SOFT,WONK,opsz,wght].ttf"))
    near, x2 = text_paths(roman, "Near", x, baseline, cap_height)
    # İtalik D, düz r'nin sağ üst boşluğuna biraz yaslanır (optik aralık)
    drop, end = text_paths(italic, "Drop", x2 - cap_height * 0.02, baseline, cap_height)
    body = f'<path fill="{near_fill}" d="{near}"/><path fill="{drop_fill}" d="{drop}"/>'
    return body, end


# ───────────── Dosyalar ─────────────
def build(fonts_dir):
    os.makedirs(OUT, exist_ok=True)
    files = {}

    # Sembol
    files["neardrop-symbol-dark-bg.svg"] = svg(256, 256, symbol_body(ALLAY, DEEP, GLINT), "NearDrop")
    files["neardrop-symbol-light-bg.svg"] = svg(256, 256, symbol_body(ACCENT, NIGHT, ALLAY), "NearDrop")
    files["neardrop-symbol-black.svg"] = svg(256, 256, symbol_body("#000000"), "NearDrop")
    files["neardrop-symbol-white.svg"] = svg(256, 256, symbol_body("#FFFFFF"), "NearDrop")

    # Uygulama ikonu karosu: gece mavisi degrade; sembol karo yüksekliğinin %60'ı, optik merkezde (biraz yukarıda)
    tile = (f'<defs><linearGradient id="tile" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="{DEEP}"/><stop offset="1" stop-color="{NIGHT}"/></linearGradient></defs>'
            f'<rect width="256" height="256" rx="56" fill="url(#tile)"/>'
            f'{symbol_body(ALLAY, DEEP, GLINT, unit=11, ox=40, oy=38)}')
    files["neardrop-app-icon.svg"] = svg(256, 256, tile, "NearDrop")
    # Kenarlara taşan kare karo (iOS köşeleri kendisi yuvarlar; maskable ikonda sembol %40 güvenli dairenin içinde)
    square = (f'<defs><linearGradient id="tile" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">'
              f'<stop offset="0" stop-color="{DEEP}"/><stop offset="1" stop-color="{NIGHT}"/></linearGradient></defs>'
              f'<rect width="256" height="256" fill="url(#tile)"/>'
              f'{symbol_body(ALLAY, DEEP, GLINT, unit=10, ox=48, oy=46)}')
    files["neardrop-icon-full-bleed.svg"] = svg(256, 256, square, "NearDrop")

    # Yatay yerleşim: sembol 256, yazının büyük harf yüksekliği 104, gövde ortasına hizalı
    cap, base = 104, 184
    for suffix, near_fill, drop_fill, body, eyes, glint in (
        ("dark-bg", FOREGROUND, ALLAY, ALLAY, DEEP, GLINT),
        ("light-bg", NIGHT, ACCENT, ACCENT, NIGHT, ALLAY),
    ):
        wm, end = wordmark(fonts_dir, 256 + 40, base, cap, near_fill, drop_fill)
        files[f"neardrop-horizontal-{suffix}.svg"] = svg(round(end + 24), 256, symbol_body(body, eyes, glint) + wm,
                                                          "NearDrop")
        # Dikey yerleşim: sembol üstte ortalı, yazı altta
        _, wm_end = wordmark(fonts_dir, 0, 0, cap, near_fill, drop_fill)
        width = max(256, wm_end) + 48
        sx = (width - 256) / 2
        wm2, _ = wordmark(fonts_dir, (width - wm_end) / 2, 256 + 24 + cap, cap, near_fill, drop_fill)
        files[f"neardrop-stacked-{suffix}.svg"] = svg(round(width), 256 + 24 + cap + 48,
                                                       symbol_body(body, eyes, glint, ox=sx) + wm2, "NearDrop")
        # Yalnızca yazı
        wm3, end3 = wordmark(fonts_dir, 16, cap + 40, cap, near_fill, drop_fill)
        files[f"neardrop-wordmark-{suffix}.svg"] = svg(round(end3 + 16), cap + 80, wm3, "NearDrop")

    for name, content in files.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(content)
        print("wrote", name)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--fonts", required=True, help="Fraunces değişken font dosyalarının klasörü")
    build(ap.parse_args().fonts)
