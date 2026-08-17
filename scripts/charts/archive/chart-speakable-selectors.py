#!/usr/bin/env python3
"""Render the two figures used by speakable-cssselector-pointer-rot-2026.

Input : data/speakable-selector-probe.json (jsdom probe over the built dist, 2026-08-11)
Output: src/assets/blog/speakable-cssselector-pointer-rot-2026/{hero,paragraph-owners}.png

All labels are English on purpose: the four language editions share one image file.
"""
import json
import pathlib

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "src/assets/blog/speakable-cssselector-pointer-rot-2026"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#12161c"
MUTED = "#7b8794"
BAR = "#2f5d8a"
WARN = "#c0562f"
OK = "#2e7d5b"
GRID = "#dfe3e8"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.edgecolor": GRID,
    "axes.labelcolor": INK,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
})

data = json.loads((ROOT / "data/speakable-selector-probe.json").read_text())
rows = data["rows"]
n = len(rows)


def total(group, key):
    return sum(r[group][key] for r in rows)


def median(group, key):
    vals = sorted(r[group][key] for r in rows)
    return vals[len(vals) // 2]


# ---------------------------------------------------------------- figure 1
labels = [
    "article h1",
    "article h2",
    "article p:first-of-type",
    ".article-summary",
    ".article-shell__header h1",
    ".article-prose > p:first-of-type",
]
groups = ["old"] * 4 + ["new"] * 2
values = [median(g, s) for g, s in zip(groups, labels)]
colors = [BAR, BAR, WARN, WARN, OK, OK]

fig, ax = plt.subplots(figsize=(10.2, 5.1))
bars = ax.barh(range(len(labels)), values, color=colors, height=0.62)
ax.set_yticks(range(len(labels)))
ax.set_yticklabels(labels, fontsize=11)
ax.invert_yaxis()
ax.set_xlabel("DOM nodes matched per page (median of 20 sampled pages)", fontsize=10)
ax.set_title(
    "speakable cssSelector: what the pointer actually reaches",
    fontsize=14, weight="bold", pad=14, loc="left",
)
ax.axvline(1, color=MUTED, linestyle=":", linewidth=1)
for rect, value in zip(bars, values):
    note = "  0 — selector matches nothing" if value == 0 else f"  {value}"
    ax.text(rect.get_width() + 0.12, rect.get_y() + rect.get_height() / 2,
            note, va="center", fontsize=10,
            color=WARN if value == 0 else INK)
ax.annotate("intended: 1 node", xy=(1, len(labels) - 0.35), xytext=(1.6, len(labels) - 0.35),
            color=MUTED, fontsize=9, va="center",
            arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
for spine in ("top", "right"):
    ax.spines[spine].set_visible(False)
ax.set_xlim(0, max(values) * 1.35)
fig.text(0.012, 0.02,
         f"jsdom 29.1.1 over the built dist · {data['pages_with_speakable']:,} of "
         f"{data['dist_blog_pages']:,} blog pages carry SpeakableSpecification · sample n={n}",
         fontsize=8.5, color=MUTED)
fig.tight_layout(rect=(0, 0.045, 1, 1))
fig.savefig(OUT / "hero.png", dpi=150)
plt.close(fig)

# ---------------------------------------------------------------- figure 2
owners = data["parent_of_matched_paragraphs"]
pretty = {
    "li": "li (list items)",
    "div.item-content": "div.item-content (related-post cards)",
    "blockquote": "blockquote (quotes)",
    "header.article-shell__header": "header (post header)",
    "div.article-prose": "div.article-prose (the actual lede)",
    "div.text-center": "div.text-center (chrome)",
    "div.flex-1": "div.flex-1 (chrome)",
}
items = sorted(owners.items(), key=lambda kv: kv[1], reverse=True)
names = [pretty.get(k, k) for k, _ in items]
counts = [v for _, v in items]
colors2 = [OK if k == "div.article-prose" else BAR for k, _ in items]

fig, ax = plt.subplots(figsize=(10.2, 4.6))
bars = ax.barh(range(len(names)), counts, color=colors2, height=0.6)
ax.set_yticks(range(len(names)))
ax.set_yticklabels(names, fontsize=10.5)
ax.invert_yaxis()
ax.set_xlabel(f"paragraphs matched by 'article p:first-of-type' across {n} pages", fontsize=10)
ax.set_title(
    "Only 20 of 272 matched paragraphs were the article's own lede",
    fontsize=14, weight="bold", pad=14, loc="left",
)
for rect, value in zip(bars, counts):
    ax.text(rect.get_width() + 1.2, rect.get_y() + rect.get_height() / 2,
            str(value), va="center", fontsize=10)
for spine in ("top", "right"):
    ax.spines[spine].set_visible(False)
ax.set_xlim(0, max(counts) * 1.2)
fig.tight_layout()
fig.savefig(OUT / "paragraph-owners.png", dpi=150)
plt.close(fig)

print("wrote", OUT / "hero.png", "and", OUT / "paragraph-owners.png")
