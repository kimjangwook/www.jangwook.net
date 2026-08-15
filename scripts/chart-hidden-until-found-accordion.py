#!/usr/bin/env python3
"""Figures for hidden-until-found-find-fragment-accordion-2026.

English labels only (shared across ko/ja/en/zh). Numbers from data/fact-core.md.
"""
from __future__ import annotations

import pathlib

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle

SLUG = "hidden-until-found-find-fragment-accordion-2026"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "blog" / SLUG
OUT.mkdir(parents=True, exist_ok=True)

INK = "#1c1f26"
MUTED = "#6b7280"
OK = "#1f7a4d"
DEAD = "#b91c1c"
SPLIT = "#b45309"
PAPER = "#fbfaf7"
CARD = "#ffffff"
EDGE = "#d8d3c8"


def _card(ax, x, y, w, h, fc=CARD):
    ax.add_patch(
        FancyBboxPatch(
            (x, y),
            w,
            h,
            boxstyle="round,pad=0.12,rounding_size=1.0",
            linewidth=1.1,
            edgecolor=EDGE,
            facecolor=fc,
        )
    )


def hero() -> None:
    fig, ax = plt.subplots(figsize=(10.2, 5.1), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 102)
    ax.set_ylim(0, 51)
    ax.axis("off")

    ax.text(
        3.5,
        47.4,
        "The fragment scrolled. The accordion stayed shut.",
        fontsize=16.5,
        fontweight="bold",
        color=INK,
        va="center",
    )
    ax.text(
        3.5,
        43.4,
        "Chromium 143.0.7499.4  ·  17 hide methods  ·  2026-08-15",
        fontsize=10,
        color=MUTED,
        va="center",
    )

    _card(ax, 3.2, 8.4, 44.8, 31.6, fc="#eef6ff")
    ax.text(5.6, 36.2, "text fragment click", fontsize=11.5, fontweight="bold", color="#1d4ed8")
    left = [
        "#tf-css-maxh",
        "#:~:text=TOKENCSSMAXH",
        "scrollY  →  6083",
        "paragraph height  18px",
        "inView  true",
    ]
    y = 31.4
    for line in left:
        ax.text(5.8, y, line, fontsize=11.2, color=INK, family="monospace", va="center")
        y -= 4.4

    _card(ax, 54.0, 8.4, 44.8, 31.6, fc="#fdf2f2")
    ax.text(56.4, 36.2, "what the box reported", fontsize=11.5, fontweight="bold", color=DEAD)
    right = [
        'data-open  =  "0"',
        "box height  0px",
        "elementFromPoint  BODY",
        "bytes present",
        "paint absent",
    ]
    y = 31.4
    for line in right:
        ax.text(56.6, y, line, fontsize=11.2, color=INK, family="monospace", va="center")
        y -= 4.4

    ax.add_patch(
        FancyArrowPatch(
            (48.2, 24.2),
            (53.6, 24.2),
            arrowstyle="-|>",
            mutation_scale=18,
            lw=2,
            color=SPLIT,
        )
    )

    ax.text(
        3.5,
        4.2,
        "Arrival is not reveal. Ancestor revealing walks details and hidden=until-found only.",
        fontsize=11,
        color=INK,
        va="center",
    )

    fig.tight_layout()
    fig.savefig(OUT / "hero.png", facecolor=PAPER)
    plt.close(fig)


# find / fragment / hash / ax  —  True / False / None (not named in the 6+8 lists)
ROWS = [
    ("visible", True, True, True, True),
    ("hidden=\"\"", False, False, False, False),
    ("hidden=\"hidden\"", False, False, False, False),
    ("until-found", True, True, True, False),
    ("until-found + box", True, True, True, None),
    ("until-found + display:none", False, False, False, None),
    ("until-found + display:inline", True, True, True, True),
    ("details closed", True, True, True, False),
    ("details open", True, True, True, True),
    ("author display:none", False, False, False, False),
    ("visibility:hidden", False, False, True, False),
    ("content-visibility:hidden CSS", False, False, False, False),
    ("aria-hidden", True, True, True, False),
    ("inert", False, False, True, False),
    ("opacity:0", True, True, True, True),
    ("sr-only clip", True, True, True, True),
    ("max-height:0", True, True, True, True),
]


def _mark(value):
    if value is True:
        return "yes", OK
    if value is False:
        return "no", DEAD
    return "—", MUTED


def matrix() -> None:
    fig, ax = plt.subplots(figsize=(10.2, 7.6), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    ax.text(2, 97.2, "Seventeen hide methods, four doors", fontsize=16, fontweight="bold", color=INK)
    ax.text(
        2,
        93.6,
        "window.find  ·  text-fragment inView  ·  hash-to-id inView  ·  CDP AX name has TOKEN",
        fontsize=10,
        color=MUTED,
    )

    headers = [(2, "cell"), (46, "find"), (59, "fragment"), (74, "hash"), (87, "AX name")]
    for x, label in headers:
        ax.text(x, 89.4, label, fontsize=9.5, color=MUTED, fontstyle="italic")

    y = 85.2
    for name, find, frag, hsh, axn in ROWS:
        ax.plot([2, 98], [y + 2.35, y + 2.35], color="#e6e1d6", lw=0.7)
        ax.text(2, y, name, fontsize=9.4, color=INK, va="center", family="monospace")
        for x, value in ((46, find), (59, frag), (74, hsh), (87, axn)):
            text, colour = _mark(value)
            ax.add_patch(Rectangle((x - 0.6, y - 1.45), 11.6, 2.9, fc=colour, ec="none", alpha=0.13))
            ax.text(x, y, text, fontsize=9.4, color=colour, va="center", fontweight="bold")
        y -= 4.55

    ax.plot([2, 98], [y + 2.35, y + 2.35], color="#e6e1d6", lw=0.7)
    ax.text(
        2,
        y - 0.4,
        "10 / 17 find   ·   10 / 17 fragment   ·   12 / 17 hash   ·   6 / 17 AX name.  Dash = not in the named 6 / 8 lists.",
        fontsize=9.6,
        color=INK,
        va="center",
    )

    fig.tight_layout()
    fig.savefig(OUT / "hide-matrix.png", facecolor=PAPER)
    plt.close(fig)


def main() -> None:
    hero()
    matrix()
    print(f"wrote {OUT / 'hero.png'}")
    print(f"wrote {OUT / 'hide-matrix.png'}")


if __name__ == "__main__":
    main()
