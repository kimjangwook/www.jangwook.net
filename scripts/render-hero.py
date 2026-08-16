#!/usr/bin/env python3
"""data/hero-spec.json 으로 히어로 도판을 렌더한다.

이 블로그의 히어로는 생성형 이미지가 아니라 타이포그래피 도판이다. 글자가 또렷해야
값을 하므로, 글자를 뭉개는 이미지 모델 대신 matplotlib 로 결정적으로 그린다.
팔레트는 chart-official-geo-gsc-control.py 와 같다.

이미지 안의 글자는 전부 영어다. ko/ja/en/zh 네 언어가 같은 파일을 공유한다.

Usage:
    render-hero.py --slug <slug> [--spec data/hero-spec.json]
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
import textwrap

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

ROOT = pathlib.Path(__file__).resolve().parent.parent

INK = "#1c1f26"
MUTED = "#6b7280"
DROP = "#b91c1c"
KEEP = "#1f7a4d"
NEUTRAL = "#1d4ed8"
PAPER = "#fbfaf7"
EDGE = "#d8d3c8"

TONES = {
    "drop": (DROP, "#fdf1f1", "×"),
    "keep": (KEEP, "#eef7f1", "+"),
    "neutral": (NEUTRAL, "#eef2fd", "·"),
}

W, H = 16.0, 8.4  # inches at dpi=100 → 1600×840


def _card(ax, x, y, w, h, face):
    ax.add_patch(
        FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0,rounding_size=0.012",
            linewidth=1.1, edgecolor=EDGE, facecolor=face,
            mutation_aspect=1, transform=ax.transAxes, zorder=1,
        )
    )


TOP_CARD = 0.76
BOTTOM_LIMIT = 0.115   # 푸터 위 여백. 카드가 이 아래로 내려가면 안 된다
HEAD_PAD = 0.155       # 카드 위쪽에서 첫 항목 첫 줄까지
FOOT_PAD = 0.050       # 마지막 줄 아래 여백
GAP = 0.020            # 항목 사이

# 폰트를 줄이면 한 줄에 더 들어가고 줄 높이도 낮아진다. 스펙이 길게 와도
# 렌더러가 스스로 맞춘다. 스펙을 믿고 그리면 오늘처럼 카드 밖으로 넘친다.
FIT_STEPS = [(17.0, 0.062), (15.5, 0.057), (14.0, 0.052), (12.5, 0.047), (11.0, 0.042)]


def _wrap(items, w, fontsize):
    chars = max(16, int(w * 66 * (17.0 / fontsize)))
    return [textwrap.fill(str(it), width=chars) for it in items]


def _block_height(wrapped, line):
    return sum((t.count("\n") + 1) * line + GAP for t in wrapped)


def _fit(cols, w):
    """좌우 열이 모두 들어가는 가장 큰 폰트를 고른다. 반환은 (fontsize, line, [wrapped...], height)."""
    avail = TOP_CARD - BOTTOM_LIMIT
    for fontsize, line in FIT_STEPS:
        wrapped = [_wrap(c.get("items", [])[:6], w, fontsize) for c in cols]
        height = HEAD_PAD + max(_block_height(t, line) for t in wrapped) + FOOT_PAD
        if height <= avail:
            return fontsize, line, wrapped, height
    # 가장 작은 폰트로도 안 들어가면 항목을 잘라서라도 카드 안에 둔다.
    fontsize, line = FIT_STEPS[-1]
    wrapped = [_wrap(c.get("items", [])[:6], w, fontsize) for c in cols]
    while max(len(t) for t in wrapped) > 2:
        wrapped = [t[:-1] if len(t) > 2 else t for t in wrapped]
        height = HEAD_PAD + max(_block_height(t, line) for t in wrapped) + FOOT_PAD
        if height <= avail:
            return fontsize, line, wrapped, height
    return fontsize, line, wrapped, avail


def _column(ax, spec, x, w, wrapped, height, fontsize, line):
    tone, face, glyph = TONES.get(spec.get("tone", "neutral"), TONES["neutral"])
    _card(ax, x, TOP_CARD - height, w, height, face)
    ax.text(x + 0.028, TOP_CARD - 0.065, spec.get("heading", ""), transform=ax.transAxes,
            fontsize=21, fontweight="bold", color=tone, va="center")

    y = TOP_CARD - HEAD_PAD
    for text in wrapped:
        n = text.count("\n") + 1
        ax.text(x + 0.040, y, glyph, transform=ax.transAxes,
                fontsize=fontsize, color=tone, va="top", ha="center")
        ax.text(x + 0.062, y, text, transform=ax.transAxes,
                fontsize=fontsize, color=INK, va="top", linespacing=1.35)
        y -= n * line + GAP


def render(spec: dict, out_path: pathlib.Path) -> None:
    fig = plt.figure(figsize=(W, H), dpi=100)
    fig.patch.set_facecolor(PAPER)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor(PAPER)
    ax.set_xticks([])
    ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)

    title = textwrap.fill(spec.get("title", ""), width=58)
    ax.text(0.045, 0.905, title, transform=ax.transAxes,
            fontsize=31, fontweight="bold", color=INK, va="top")

    if spec.get("subtitle"):
        ax.text(0.045, 0.805, spec["subtitle"], transform=ax.transAxes,
                fontsize=17, color=MUTED, va="top")

    left, right = spec.get("left"), spec.get("right")
    if left and right:
        fs, line, (wl, wr), h = _fit([left, right], 0.425)
        _column(ax, left, 0.045, 0.425, wl, h, fs, line)
        _column(ax, right, 0.525, 0.425, wr, h, fs, line)
    elif left:
        fs, line, (wl,), h = _fit([left], 0.905)
        _column(ax, left, 0.045, 0.905, wl, h, fs, line)

    if spec.get("footer"):
        ax.text(0.045, 0.045, spec["footer"], transform=ax.transAxes,
                fontsize=15, color=MUTED, va="center")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, facecolor=PAPER)
    plt.close(fig)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--spec", default=None)
    args = ap.parse_args()

    spec_path = pathlib.Path(args.spec) if args.spec else ROOT / "data" / "hero-spec.json"
    if not spec_path.is_file():
        print(f"ERROR: spec 없음 {spec_path}", file=sys.stderr)
        return 1
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"ERROR: spec 파싱 실패 {e}", file=sys.stderr)
        return 1

    if not spec.get("title") or not spec.get("left", {}).get("items"):
        print("ERROR: spec 에 title 또는 left.items 가 없다", file=sys.stderr)
        return 1

    out = ROOT / "src" / "assets" / "blog" / args.slug / "hero.png"
    render(spec, out)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
