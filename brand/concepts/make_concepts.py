"""NearDrop logo konseptleri (siyah, keşif aşaması). Çıktı: a/b/c-symbol.svg ve a/b/c-lockup.svg"""
import math
import os
import sys

OUT = os.path.dirname(os.path.abspath(__file__))
INK = "#111111"


def drop_path(cx, tip_y, cy, r, k=0.72):
    """Damla: (cx, cy) merkezli r yarıçaplı gövde + tepe noktası. k: omuz eğrisinin dolgunluğu."""
    return (f"M{cx:g} {tip_y:g} C{cx:g} {tip_y:g} {cx - r:g} {cy - r * k:g} {cx - r:g} {cy:g} "
            f"A{r:g} {r:g} 0 0 0 {cx + r:g} {cy:g} C{cx + r:g} {cy - r * k:g} {cx:g} {tip_y:g} {cx:g} {tip_y:g} Z")


def svg(view_w, body, title, view_h=256):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:g} {view_h:g}" width="{view_w:g}" '
            f'height="{view_h:g}" role="img" aria-labelledby="t"><title id="t">{title}</title>{body}</svg>\n')


# ───────────── A · Damla N ─────────────
# Gövde: (128,160) r=82, tepe y=18. N: 45° çapraz, sağ sap soldakinden 12 birim yukarıda (yükselen hareket).
A_DROP = drop_path(128, 18, 160, 82)
A_N = "M98 204 V138 L158 198 V126"


def a_symbol(ink=INK):
    return (f'<defs><mask id="a-n"><rect width="256" height="256" fill="#fff"/>'
            f'<path d="{A_N}" fill="none" stroke="#000" stroke-width="24" stroke-linecap="round" '
            f'stroke-linejoin="round"/></mask></defs>'
            f'<path fill="{ink}" mask="url(#a-n)" d="{A_DROP}"/>')


# ───────────── B · Piksel Allay ─────────────
# 16×16 ızgara (birim 16). Her satır (başlangıç, bitiş) dolu sütun aralığı; gözler (satır 9–10, sütun 6 ve 9 — Allay yüzündeki gibi) delik.
B_ROWS = {
    1: (7, 8), 2: (7, 8), 3: (6, 9), 4: (5, 10), 5: (4, 11), 6: (3, 12), 7: (3, 12), 8: (2, 13),
    9: (2, 13), 10: (2, 13), 11: (2, 13), 12: (2, 13), 13: (3, 12), 14: (5, 10),
}
B_EYES = {(9, 6), (10, 6), (9, 9), (10, 9)}


def b_symbol(ink=INK, unit=16):
    d = []
    for row, (c0, c1) in B_ROWS.items():
        col = c0
        while col <= c1:
            if (row, col) in B_EYES:
                col += 1
                continue
            start = col
            while col <= c1 and (row, col) not in B_EYES:
                col += 1
            d.append(f"M{start * unit} {row * unit}h{(col - start) * unit}v{unit}h{-(col - start) * unit}z")
    return f'<path fill="{ink}" d="{"".join(d)}"/>'


# ───────────── C · Kemer n ─────────────
# Tek kalınlık 28. n: sol sap x=56 (x-yüksekliğine kadar), kemer (128,114) r=72, sağ sap x=200.
# Kemerin altındaki damla: gövde (128,174) r=34, tepe y=94. Dikeyde ortalı (üst/alt 28).
def c_symbol(ink=INK):
    n = (f'<path d="M56 214 V42 M56 114 A72 72 0 0 1 200 114 V214" fill="none" stroke="{ink}" '
         f'stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>')
    drop = f'<path fill="{ink}" d="{drop_path(128, 94, 174, 34)}"/>'
    return n + drop


# ───────────── Tek kalınlık "neardrop" yazısı ─────────────
# x-yüksekliği 96–206 (dış), kalınlık 20 → merkez çizgi yarıçapı R=45, cy=151.
S = 20
R = 45
CY = 151
TOP = CY - R          # x-yüksekliği merkez çizgisi
BASE = CY + R
ASC = 56              # yükselen
DESC = 246            # alçalan
GAP = 30              # harf arası


def letter(ch, x, drop_o=False):
    """Harfin sol kenarı x; (svg_path_d, genişlik) döner. Merkez çizgileri stroke ile çizilir."""
    h = S / 2
    if ch == "n":
        l, r = x + h, x + h + 2 * R
        return f"M{l} {BASE} V{TOP} M{l} {CY} A{R} {R} 0 0 1 {r} {CY} V{BASE}", 2 * R + S
    if ch == "e":
        cx = x + h + R
        ex, ey = cx + R * math.cos(math.radians(40)), CY + R * math.sin(math.radians(40))
        return f"M{cx - R} {CY} H{cx + R} A{R} {R} 0 1 0 {ex:.1f} {ey:.1f}", 2 * R + S
    if ch == "a":
        cx = x + h + R
        return (f"M{cx + R} {CY} A{R} {R} 0 1 0 {cx - R} {CY} A{R} {R} 0 1 0 {cx + R} {CY} "
                f"M{cx + R} {TOP} V{BASE}"), 2 * R + S
    if ch == "r":
        l = x + h
        return f"M{l} {BASE} V{TOP} M{l} {CY} A{R} {R} 0 0 1 {l + R} {TOP}", R + S
    if ch == "d":
        cx = x + h + R
        return (f"M{cx + R} {CY} A{R} {R} 0 1 0 {cx - R} {CY} A{R} {R} 0 1 0 {cx + R} {CY} "
                f"M{cx + R} {ASC} V{BASE}"), 2 * R + S
    if ch == "o":
        cx = x + h + R
        if drop_o:
            # Damla "o": gövde x-yüksekliğinde, tepe yükselen çizgisine kadar
            return drop_path(cx, ASC + 6, CY, R), 2 * R + S
        return f"M{cx + R} {CY} A{R} {R} 0 1 0 {cx - R} {CY} A{R} {R} 0 1 0 {cx + R} {CY}", 2 * R + S
    if ch == "p":
        cx = x + h + R
        return (f"M{cx + R} {CY} A{R} {R} 0 1 0 {cx - R} {CY} A{R} {R} 0 1 0 {cx + R} {CY} "
                f"M{cx - R} {TOP} V{DESC}"), 2 * R + S
    raise ValueError(ch)


def wordmark(x0, ink=INK, drop_o=False):
    parts, x = [], x0
    for i, ch in enumerate("neardrop"):
        d, w = letter(ch, x, drop_o=drop_o)
        parts.append(d)
        # r'den sonra optik olarak daha az boşluk
        x += w + (GAP - 12 if ch == "r" else GAP)
    body = (f'<path d="{" ".join(parts)}" fill="none" stroke="{ink}" stroke-width="{S}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')
    return body, x - GAP


def lockup(symbol_body, title, drop_o=False):
    wm, end = wordmark(256 + 56, drop_o=drop_o)
    return svg(end + 8, symbol_body + wm, title)


def main():
    files = {
        "a-symbol.svg": svg(256, a_symbol(), "NearDrop A — Damla N"),
        "b-symbol.svg": svg(256, b_symbol(), "NearDrop B — Piksel Allay"),
        "c-symbol.svg": svg(256, c_symbol(), "NearDrop C — Kemer n"),
        "a-lockup.svg": lockup(a_symbol(), "NearDrop A yatay"),
        "b-lockup.svg": lockup(b_symbol(), "NearDrop B yatay"),
        "c-lockup.svg": lockup(c_symbol(), "NearDrop C yatay", drop_o=True),
    }
    suffix = sys.argv[1] if len(sys.argv) > 1 else ""
    for name, content in files.items():
        if suffix:
            name = name.replace(".svg", f"-{suffix}.svg")
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(content)
        print("wrote", name)


if __name__ == "__main__":
    main()
