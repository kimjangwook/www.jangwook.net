#!/usr/bin/env python3
"""Figures for robots-meta-head-body-parser-placement-2026.

Reads data/robots-meta-placement.json (parse5 8.0.1 tree-construction probe)
and renders two English-labelled PNGs into src/assets/blog/<slug>/.
"""
import json
import pathlib

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle

SLUG = "robots-meta-head-body-parser-placement-2026"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "blog" / SLUG
OUT.mkdir(parents=True, exist_ok=True)

INK = "#1c1f26"
MUTED = "#6b7280"
OK = "#1f7a4d"
MOVED = "#b45309"
GONE = "#b91c1c"
FRAG = "#5b21b6"
PAPER = "#fbfaf7"


def hero() -> None:
    fig, ax = plt.subplots(figsize=(10.2, 5.1), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 50)
    ax.axis("off")

    ax.text(4, 45.5, "Where the parser actually puts <meta name=\"robots\">",
            fontsize=17, fontweight="bold", color=INK, va="center")
    ax.text(4, 41.4, "parse5 8.0.1 tree construction, scripting enabled",
            fontsize=10.5, color=MUTED, va="center")

    # source column
    ax.add_patch(Rectangle((4, 6), 40, 31, fc="white", ec="#d8d3c8", lw=1.2))
    ax.text(6, 34, "what you wrote", fontsize=10, color=MUTED, fontstyle="italic")
    src = [
        ("<head>", INK, 0),
        ("<title>…</title>", INK, 1),
        ("<div>oops</div>", GONE, 1),
        ("<meta name=\"robots\">", MOVED, 1),
        ("</head>", INK, 0),
    ]
    y = 29.5
    for text, colour, indent in src:
        ax.text(6.5 + indent * 2.4, y, text, fontsize=11.5, color=colour,
                family="monospace", va="center")
        y -= 4.4

    # result column
    ax.add_patch(Rectangle((56, 6), 40, 31, fc="white", ec="#d8d3c8", lw=1.2))
    ax.text(58, 34, "what the parser built", fontsize=10, color=MUTED, fontstyle="italic")
    res = [
        ("<head>", INK, 0),
        ("<title>…</title>", INK, 1),
        ("</head>", INK, 0),
        ("<body>", INK, 0),
        ("<div>oops</div>", MUTED, 1),
        ("<meta name=\"robots\">", MOVED, 1),
    ]
    y = 30.2
    for text, colour, indent in res:
        ax.text(58.5 + indent * 2.4, y, text, fontsize=11, color=colour,
                family="monospace", va="center")
        y -= 3.9

    ax.add_patch(FancyArrowPatch((45.5, 21), (54.5, 21), arrowstyle="-|>",
                                 mutation_scale=22, lw=2, color=MOVED))
    ax.text(50, 24.2, "one stray\nelement", fontsize=9.5, color=MOVED,
            ha="center", va="center", linespacing=1.3)

    ax.text(4, 2.4,
            "Google Search respects it in either place. Your own head-scoped checks do not.",
            fontsize=11, color=INK, va="center")

    fig.tight_layout()
    fig.savefig(OUT / "hero.png", facecolor=PAPER)
    plt.close(fig)


def matrix(rows) -> None:
    labels = {
        "head": ("stays in head", OK),
        "body": ("moved to body", MOVED),
        "fragment": ("template fragment", FRAG),
        "text": ("became text", GONE),
    }

    def classify(cell):
        if not cell["elementFound"]:
            return "text"
        segments = cell["location"].split(" > ")
        if "template" in segments:
            return "fragment"
        return "head" if "head" in segments else "body"

    fig, ax = plt.subplots(figsize=(10.2, 6.4), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    ax.text(2, 96, "Ten placements, two scripting flags", fontsize=16,
            fontweight="bold", color=INK)
    ax.text(2, 91.5, "parse5 8.0.1 - identical markup, identical parser, only the scripting flag differs",
            fontsize=10, color=MUTED)

    ax.text(2, 85, "markup as authored", fontsize=9.5, color=MUTED, fontstyle="italic")
    ax.text(58, 85, "scripting = on", fontsize=9.5, color=MUTED, fontstyle="italic")
    ax.text(80, 85, "scripting = off", fontsize=9.5, color=MUTED, fontstyle="italic")

    y = 79
    for row in rows:
        ax.plot([2, 98], [y + 4.4, y + 4.4], color="#e6e1d6", lw=0.8)
        ax.text(2, y, row["fixture"], fontsize=10.5, color=INK, va="center")
        for x, key in ((58, "scriptingOn"), (80, "scriptingOff")):
            kind = classify(row[key])
            text, colour = labels[kind]
            ax.add_patch(Rectangle((x - 0.8, y - 1.9), 19, 3.8, fc=colour,
                                   ec="none", alpha=0.13))
            ax.text(x, y, text, fontsize=10, color=colour, va="center",
                    fontweight="bold" if kind in ("text", "fragment") else "normal")
        y -= 7.4

    ax.plot([2, 98], [y + 4.4, y + 4.4], color="#e6e1d6", lw=0.8)
    ax.text(2, y - 0.5,
            "Only \"stays in head\" and \"moved to body\" are directives Google reads.",
            fontsize=10.5, color=INK, va="center")

    fig.tight_layout()
    fig.savefig(OUT / "placement-matrix.png", facecolor=PAPER)
    plt.close(fig)


def main() -> None:
    data = json.loads((ROOT / "data" / "robots-meta-placement.json").read_text())
    hero()
    matrix(data["rows"])
    print(f"wrote {OUT/'hero.png'}")
    print(f"wrote {OUT/'placement-matrix.png'}")


if __name__ == "__main__":
    main()
