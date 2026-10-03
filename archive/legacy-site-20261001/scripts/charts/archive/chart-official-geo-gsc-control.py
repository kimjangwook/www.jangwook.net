#!/usr/bin/env python3
"""Figures for official-geo-subtraction-gsc-control-2026.

English labels only (shared across ko/ja/en/zh).
"""
from __future__ import annotations

import json
import pathlib

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

SLUG = "official-geo-subtraction-gsc-control-2026"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "blog" / SLUG
DATA = ROOT / "data" / "official-geo-gsc-control-probe-2026.json"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#1c1f26"
MUTED = "#6b7280"
DROP = "#b91c1c"
KEEP = "#1f7a4d"
SWITCH = "#1d4ed8"
PAPER = "#fbfaf7"
CARD = "#ffffff"
EDGE = "#d8d3c8"


def _card(ax, x, y, w, h, fc=CARD):
    ax.add_patch(
        FancyBboxPatch(
            (x, y),
            w,
            h,
            boxstyle="round,pad=0.15,rounding_size=1.2",
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
        47.2,
        "Official GEO is a subtraction list + one switch",
        fontsize=16.5,
        fontweight="bold",
        color=INK,
        va="center",
    )
    ax.text(
        3.5,
        43.2,
        "Google Search Central  ·  AI optimization guide (updated 2026-07-10)",
        fontsize=10,
        color=MUTED,
        va="center",
    )

    _card(ax, 3.2, 6.2, 44.5, 34.2, fc="#fdf2f2")
    ax.text(5.4, 36.6, "DROP from the GEO backlog", fontsize=11.5, fontweight="bold", color=DROP)
    drops = [
        "llms.txt / special AI files",
        "Chunking pages for models",
        "Rewrite copy only for AI",
        "Special schema.org for AI Overviews",
        "Inauthentic web mentions",
    ]
    y = 31.8
    for item in drops:
        ax.text(6.2, y, "×   " + item, fontsize=11, color=INK, va="center")
        y -= 4.6

    _card(ax, 54.0, 6.2, 44.8, 34.2, fc="#eef8f2")
    ax.text(56.2, 36.6, "KEEP as engineering work", fontsize=11.5, fontweight="bold", color=KEEP)
    keeps = [
        "Snippet-eligible HTML (no stray nosnippet)",
        "Crawlable, indexable pages",
        "Search Console include (default)",
        "Semantic HTML / accessibility tree",
        "Inspect served robots.txt, not only git",
    ]
    y = 31.8
    for item in keeps:
        ax.text(57.0, y, "+   " + item, fontsize=11, color=INK, va="center")
        y -= 4.6

    ax.text(
        3.5,
        2.6,
        "Structured data does not guarantee ranking or AI citations  ·  official",
        fontsize=9.2,
        color=MUTED,
    )
    fig.savefig(OUT / "hero.png", dpi=200, bbox_inches="tight", facecolor=PAPER)
    plt.close(fig)


def layers() -> None:
    fig, ax = plt.subplots(figsize=(10.2, 6.4), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 102)
    ax.set_ylim(0, 64)
    ax.axis("off")

    ax.text(
        3.5,
        60.6,
        "Three layers that actually decide AI-feature eligibility",
        fontsize=15.5,
        fontweight="bold",
        color=INK,
    )
    ax.text(
        3.5,
        56.8,
        "Live fetch of jangwook.net on 2026-08-14  ·  Search Console UI not inspected",
        fontsize=10,
        color=MUTED,
    )

    layers_spec = [
        (
            40.8,
            SWITCH,
            "#eef2ff",
            "Layer 1  ·  Search Console property",
            "Search generative AI control  ·  default INCLUDE  ·  inherits to child properties",
        ),
        (
            26.4,
            "#b45309",
            "#fff7ed",
            "Layer 2  ·  served robots.txt",
            "Live file was 106 lines / 2,937 B  ·  git file 45 lines / 1,101 B",
        ),
        (
            12.0,
            KEEP,
            "#eef8f2",
            "Layer 3  ·  per-page HTML",
            "8/8 sample URLs HTTP 200  ·  0 robots meta  ·  0 data-nosnippet attributes",
        ),
    ]
    for y, color, fc, title, body in layers_spec:
        _card(ax, 3.2, y, 95.2, 12.4, fc=fc)
        ax.add_patch(
            FancyBboxPatch(
                (5.0, y + 3.2),
                1.4,
                6.0,
                boxstyle="round,pad=0.05,rounding_size=0.4",
                linewidth=0,
                facecolor=color,
            )
        )
        ax.text(8.4, y + 8.6, title, fontsize=12.2, fontweight="bold", color=INK, va="center")
        ax.text(8.4, y + 4.8, body, fontsize=11, color=INK, va="center")

    ax.annotate(
        "",
        xy=(51, 38.8),
        xytext=(51, 40.8),
        arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=1.4),
    )
    ax.annotate(
        "",
        xy=(51, 24.4),
        xytext=(51, 26.4),
        arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=1.4),
    )
    ax.text(
        3.5,
        3.4,
        "A parent-property exclude can empty Layer 1 even when Layers 2 and 3 look clean.",
        fontsize=10,
        color=MUTED,
    )
    fig.savefig(OUT / "three-layers.png", dpi=200, bbox_inches="tight", facecolor=PAPER)
    plt.close(fig)


def robots_compare() -> None:
    data = json.loads(DATA.read_text())
    fig, ax = plt.subplots(figsize=(10.2, 5.4), dpi=200)
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")

    ax.text(0.3, 5.55, "What git has is not what Googlebot fetches", fontsize=15.5, fontweight="bold", color=INK)
    ax.text(0.3, 5.15, "https://jangwook.net/robots.txt   vs   public/robots.txt", fontsize=10, color=MUTED)

    bars = [
        (data["robotsTxt"]["repoLines"], "git  45 lines", 2.7),
        (data["robotsTxt"]["liveLines"], "live  106 lines", 1.35),
    ]
    max_v = 106
    for value, label, y in bars:
        ax.barh([y], [value / max_v * 7.8], height=0.85, left=0.4, color="#93c5fd" if "live" in label else "#cbd5e1", edgecolor=EDGE)
        ax.text(0.55, y, f"{label}", fontsize=12, color=INK, va="center")
        ax.text(8.4, y, str(value), fontsize=13, fontweight="bold", color=INK, va="center")

    ax.text(0.4, 0.55, "CDN-managed prefix present: yes", fontsize=11, color=INK)
    ax.text(0.4, 0.15, "llms.txt HTTP status: 404   ·   sample pages with robots meta: 0 / 8", fontsize=11, color=INK)
    fig.savefig(OUT / "robots-live-vs-git.png", dpi=200, bbox_inches="tight", facecolor=PAPER)
    plt.close(fig)


if __name__ == "__main__":
    hero()
    layers()
    robots_compare()
    print("wrote", OUT)
