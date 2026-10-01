#!/usr/bin/env python3
"""Render the two figures used by modern-web-guidance-agent-skill-coverage-2026.

Inputs : data/mwg-guide-list.json   (output of `modern-web-guidance list`, v0.0.180)
         data/mwg-query-probe.json  (output of scripts/probe-modern-web-guidance.mjs)
Outputs: src/assets/blog/modern-web-guidance-agent-skill-coverage-2026/{hero,query-probe}.png

All labels are English on purpose: the four language editions share one image file.
"""
import json
import collections
import pathlib

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "src/assets/blog/modern-web-guidance-agent-skill-coverage-2026"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#12161c"
MUTED = "#7b8794"
BAR = "#2f5d8a"
WARN = "#c0562f"
GRID = "#dfe3e8"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.edgecolor": GRID,
    "axes.labelcolor": INK,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
})


def hero():
    guides = json.load(open(ROOT / "data/mwg-guide-list.json"))
    counts = collections.Counter(g["category"] for g in guides)
    counts["search / structured data"] = 0
    items = sorted(counts.items(), key=lambda kv: kv[1])
    labels = [k for k, _ in items]
    values = [v for _, v in items]

    fig, ax = plt.subplots(figsize=(10.2, 5.1), dpi=200)
    colors = [WARN if l in ("accessibility", "search / structured data") else BAR for l in labels]
    bars = ax.barh(labels, values, color=colors, height=0.62)
    for bar, v, c in zip(bars, values, colors):
        ax.text(v + 0.4, bar.get_y() + bar.get_height() / 2, str(v),
                va="center", fontsize=9, color=c if c == WARN else INK,
                fontweight="bold" if c == WARN else "normal")

    ax.set_title("Modern Web Guidance v0.0.180 — 138 guides by category",
                 fontsize=13, fontweight="bold", loc="left", pad=24)
    ax.text(0, 1.015, "measured 2026-08-10 · npx modern-web-guidance@0.0.180 list",
            transform=ax.transAxes, fontsize=8.5, color=MUTED)
    ax.set_xlabel("number of guides", fontsize=9)
    ax.set_xlim(0, max(values) + 3)
    ax.xaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    fig.tight_layout()
    fig.savefig(OUT / "hero.png", facecolor="white")
    plt.close(fig)
    return counts


def probe():
    data = json.load(open(ROOT / "data/mwg-query-probe.json"))
    groups = [("ui", "UI / CSS queries"), ("a11y", "Accessibility queries"),
              ("search", "Search & structured-data queries")]

    rows = []
    for key, title in groups:
        for item in data[key]:
            top = item["results"][0]["sim"] if item["results"] else 0.0
            rows.append((key, item["q"], top, len(item["results"])))

    fig, ax = plt.subplots(figsize=(10.2, 7.4), dpi=200)
    ypos = list(range(len(rows)))[::-1]
    palette = {"ui": BAR, "a11y": "#4a7fb5", "search": WARN}
    for y, (key, q, sim, n) in zip(ypos, rows):
        ax.barh(y, sim, color=palette[key], height=0.6)
        if n == 0:
            ax.text(0.012, y, "no result above the tool's threshold",
                    va="center", fontsize=8.5, color=WARN, style="italic")
        else:
            ax.text(sim + 0.008, y, f"{sim:.3f}  (n={n})", va="center",
                    fontsize=8.5, color=INK)

    ax.set_yticks(ypos)
    ax.set_yticklabels([q for _, q, _, _ in rows], fontsize=9)
    ax.set_xlim(0, 1.0)
    ax.set_xlabel("top-1 similarity returned by `search`", fontsize=9)
    ax.set_title("Same tool, three domains: top-1 similarity per query",
                 fontsize=13, fontweight="bold", loc="left", pad=24)
    ax.text(0, 1.012,
            "22 queries · modern-web-guidance 0.0.180 · Node 22.22 · measured 2026-08-10",
            transform=ax.transAxes, fontsize=8.5, color=MUTED)
    ax.xaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)

    # group separators
    counts = [len(data[k]) for k, _ in groups]
    edge = 0
    for (key, title), c in zip(groups, counts):
        # anchor the group caption on the group's shortest bar so it never collides
        idx = min(range(edge, edge + c), key=lambda i: rows[i][2])
        ax.text(0.99, ypos[idx], title, ha="right", va="center",
                fontsize=9.5, fontweight="bold", color=palette[key])
        edge += c
        if edge < len(rows):
            ax.axhline(len(rows) - edge - 0.5, color=GRID, linewidth=1.2)

    fig.tight_layout()
    fig.savefig(OUT / "query-probe.png", facecolor="white")
    plt.close(fig)
    return rows


if __name__ == "__main__":
    c = hero()
    r = probe()
    print("categories:", dict(c))
    for key, _ in [("ui", 0), ("a11y", 0), ("search", 0)]:
        sims = [s for k, _, s, _ in r if k == key]
        zero = sum(1 for k, _, _, n in r if k == key and n == 0)
        print(f"{key:<7} n={len(sims)} mean_top1={sum(sims)/len(sims):.3f} zero_results={zero}")
