#!/usr/bin/env python3
"""Red and blue per screenful (Spec 23.1), measured on the full-page screenshots of scripts/walkthrough.py.

Usage: scripts/color_balance.py [shots_dir] [max_ratio]
  shots_dir  default: /tmp/pfp-hub-walkthrough
  max_ratio  default: 3 (a screenful fails when one color has more than this many times the pixels of the other)

Each screenshot is cut into screenfuls (1440x900 or 390x844, every half screen down the page). A screenful further
down also holds the sticky top bar with its ribbon, so its pixels count there too. Counted: strongly red and strongly
blue pixels (the hub's two colors, their hover shades and anti-aliased edges; pale tints don't count). A screenful
with little color of either (under 0.05% of its pixels) passes: the top bar's ribbon is in it anyway. Prints the worst
screenful of every screenshot; exit 1 if any fails. Needs numpy and Pillow.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

SHOTS = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/pfp-hub-walkthrough")
MAX_RATIO = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
QUIET = 0.0005  # share of a screenful's pixels below which its color doesn't matter


def masks(img):
    rgb = img.astype(np.float32) / 255
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    strong = (sat >= 0.45) & (mx >= 0.3)
    red = strong & (r == mx) & (g < 0.5 * r) & (b < 0.6 * r)
    blue = strong & (b == mx) & (r < 0.5 * b) & (g < 0.8 * b) & (g > 0.15 * b)
    return red, blue


def top_bar(img, red, blue):
    """The top bar's rows (below the black prototype bar, down to the end of its ribbon), or None (the email)."""
    h, w = red.shape
    rows = np.where(red[:, w // 4] & blue[:, 3 * w // 4])[0]
    rows = rows[rows < 400]
    if not len(rows):
        return None
    light = np.where(img[:, 2].max(axis=1) > 60)[0]  # the first row below the prototype bar
    return int(light[0]), int(rows.max()) + 1


def main():
    files = sorted(SHOTS.glob("*.png"))
    if not files:
        sys.exit(f"No screenshots in {SHOTS}")
    failed = 0
    for f in files:
        img = np.asarray(Image.open(f).convert("RGB"))
        h, w, _ = img.shape
        vh = {780: 1688, 390: 844}.get(w, 900)  # the walkthrough's phone screenshots are at device scale 2
        red, blue = masks(img)
        r_rows, b_rows = red.sum(axis=1), blue.sum(axis=1)
        bar = top_bar(img, red, blue)
        starts = list(range(0, max(h - vh, 0) + 1, vh // 2))
        if starts[-1] + vh < h:
            starts.append(h - vh)
        worst = None
        for s in starts:
            if s and bar:  # scrolled: the sticky top bar covers the top of the screenful
                top, end = bar
                cover = end - top
                rr = r_rows[top:end].sum() + r_rows[s + cover : s + vh].sum()
                bb = b_rows[top:end].sum() + b_rows[s + cover : s + vh].sum()
            else:
                rr, bb = r_rows[s : s + vh].sum(), b_rows[s : s + vh].sum()
            quiet = rr + bb < QUIET * w * vh
            ratio = max(rr, bb) / max(min(rr, bb), 1)
            if worst is None or (not quiet and ratio > worst[0]) or worst[3]:
                worst = (ratio, rr, bb, quiet, s)
        ratio, rr, bb, quiet, s = worst
        bad = not quiet and ratio > MAX_RATIO
        failed += bad
        more = "red" if rr > bb else "blue"
        print(f"{'FAIL' if bad else 'ok  '} {f.name:44} worst at y={s:5}: red {rr:7} blue {bb:7}  {ratio:5.1f}x {more}{' (quiet)' if quiet else ''}")
    print(f"{failed} of {len(files)} screenshots have a screenful over {MAX_RATIO}x")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
