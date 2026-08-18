#!/usr/bin/env python3
"""본문 도판. 참조 6편이 실제로 쓰는 세 가지만 그린다.

    two-column   2열 대조 카드   무엇이 사라지고 무엇이 남았나
    matrix       라벨 매트릭스   두 축을 교차한 hit/miss 격자
    before-after before-after 막대쌍

**일반화하지 않는다.** 범용 차트 DSL 은 별도 프로젝트고 회수가 낮다.
옛 chart-*.py 다섯 개는 전부 슬러그 하드코딩 1회용이었고 `scripts/charts/archive/`
로 옮겨 뒀다. 여기 없는 그림이 필요하면 그 글 전용 스크립트를 하나 더 쓰는 편이
이 파일에 네 번째 종류를 넣는 것보다 낫다.

사용
    render-figure.py --slug <slug> --spec <json> [--name figure-1]

스펙
    {"kind": "two-column", "title": "...", "left": {...}, "right": {...}}
    {"kind": "matrix", "title": "...", "rows": [...], "cols": [...], "cells": [[...]]}
    {"kind": "before-after", "title": "...", "unit": "bytes", "pairs": [...]}
"""
import argparse
import json
import pathlib
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from palette import CARD, EDGE, INK, MUTED, PAPER, TONES, require_cjk_font  # noqa: E402

# 본문 도판은 한국어 글의 일부다. 기본 폰트로 그리면 전부 두부가 된다.
require_cjk_font("render-figure")

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, DPI = 12.0, 6.75, 100  # 1200×675. 본문 폭에 맞는 16:9


def _canvas(title, subtitle=None):
    fig = plt.figure(figsize=(W, H), dpi=DPI)
    fig.patch.set_facecolor(PAPER)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.set_facecolor(PAPER)
    y = 0.93
    if title:
        ax.text(0.045, y, title, fontsize=21, color=INK, va="top", ha="left", weight="bold")
        y -= 0.075
    if subtitle:
        ax.text(0.045, y, subtitle, fontsize=13, color=MUTED, va="top", ha="left")
    return fig, ax


def _card(ax, x, y, w, h, face, edge):
    ax.add_patch(
        FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.006,rounding_size=0.012",
            linewidth=1.1, edgecolor=edge, facecolor=face,
        )
    )


def two_column(ax, spec):
    """2열 대조 카드. 왼쪽이 잃은 것, 오른쪽이 남은 것이라는 뜻이 팔레트에 실려 있다."""
    cols = [spec.get("left"), spec.get("right")]
    cols = [c for c in cols if c]
    if not cols:
        raise ValueError("two-column 은 left 또는 right 가 있어야 한다")
    top, bottom = 0.72, 0.07
    gap = 0.03
    w = (0.91 - gap * (len(cols) - 1)) / len(cols)
    for i, col in enumerate(cols):
        x = 0.045 + i * (w + gap)
        fg, bg, bullet = TONES.get(col.get("tone", "neutral"), TONES["neutral"])
        _card(ax, x, bottom, w, top - bottom, bg, EDGE)
        ax.text(x + 0.022, top - 0.05, col.get("heading", ""), fontsize=15,
                color=fg, va="top", ha="left", weight="bold")
        yy = top - 0.13
        for item in list(col.get("items", []))[:7]:
            ax.text(x + 0.022, yy, bullet, fontsize=13, color=fg, va="top", ha="left")
            ax.text(x + 0.05, yy, str(item), fontsize=12.5, color=INK,
                    va="top", ha="left", wrap=True)
            yy -= 0.085


def matrix(ax, spec):
    """라벨 매트릭스. 셀 값은 문자열 그대로 찍는다 — 숫자로 해석하지 않는다."""
    rows = spec.get("rows") or []
    cols = spec.get("cols") or []
    cells = spec.get("cells") or []
    if not rows or not cols:
        raise ValueError("matrix 는 rows 와 cols 가 있어야 한다")

    left, top, bottom, right = 0.20, 0.70, 0.09, 0.96
    cw = (right - left) / len(cols)
    ch = (top - bottom) / len(rows)

    for j, c in enumerate(cols):
        ax.text(left + cw * (j + 0.5), top + 0.035, str(c), fontsize=12.5,
                color=MUTED, ha="center", va="bottom")
    for i, r in enumerate(rows):
        ax.text(left - 0.015, top - ch * (i + 0.5), str(r), fontsize=12.5,
                color=MUTED, ha="right", va="center")

    for i in range(len(rows)):
        for j in range(len(cols)):
            try:
                cell = cells[i][j]
            except (IndexError, TypeError):
                cell = None
            if isinstance(cell, dict):
                text, tone = str(cell.get("text", "")), cell.get("tone", "neutral")
            else:
                text, tone = ("" if cell is None else str(cell)), "neutral"
            fg, bg, _ = TONES.get(tone, TONES["neutral"])
            x, y = left + cw * j, top - ch * (i + 1)
            _card(ax, x + 0.004, y + 0.006, cw - 0.008, ch - 0.012,
                  bg if text else CARD, EDGE)
            if text:
                ax.text(x + cw / 2, y + ch / 2, text, fontsize=13,
                        color=fg, ha="center", va="center", weight="bold")


def before_after(ax, spec):
    """before-after 막대쌍. 축을 안 그린다 — 값을 막대 끝에 직접 쓴다.

    참조 글들이 비교하는 것은 추세가 아니라 두 값이다. 축과 눈금은 읽을 것을
    늘리기만 한다.
    """
    pairs = spec.get("pairs") or []
    if not pairs:
        raise ValueError("before-after 는 pairs 가 있어야 한다")
    unit = spec.get("unit", "")
    vals = [max(float(p.get("before", 0)), float(p.get("after", 0))) for p in pairs]
    top_val = max(vals) or 1.0

    # 막대 오른쪽 끝을 0.93 이 아니라 0.80 에 둔다. 값 라벨이 막대 밖에 붙는데,
    # 최장 막대가 0.93 까지 가면 그 라벨이 캔버스를 넘어가 잘린다.
    # (첫 렌더에서 `311,296 by` 로 끊겼다)
    left, right = 0.30, 0.80
    top, bottom = 0.70, 0.09
    span = (top - bottom) / len(pairs)
    bar_h = min(0.055, span * 0.30)

    drop_fg, _, _ = TONES["drop"]
    keep_fg, _, _ = TONES["keep"]

    for i, pr in enumerate(pairs):
        base = top - span * (i + 1) + span * 0.5
        ax.text(left - 0.02, base, str(pr.get("label", "")), fontsize=12.5,
                color=INK, ha="right", va="center")
        for k, (key, color, off) in enumerate(
            (("before", drop_fg, bar_h * 0.62), ("after", keep_fg, -bar_h * 0.62))
        ):
            v = float(pr.get(key, 0))
            w = (right - left) * (v / top_val)
            ax.add_patch(
                FancyBboxPatch(
                    (left, base + off - bar_h / 2), max(w, 0.002), bar_h,
                    boxstyle="round,pad=0,rounding_size=0.004",
                    linewidth=0, facecolor=color, alpha=0.85 if k == 0 else 1.0,
                )
            )
            label = f"{v:,.0f} {unit}".strip()
            ax.text(left + max(w, 0.002) + 0.012, base + off, label,
                    fontsize=11.5, color=MUTED, ha="left", va="center")

    ax.text(left, bottom - 0.005, "위 = 전, 아래 = 후", fontsize=11, color=MUTED,
            ha="left", va="top")


KINDS = {"two-column": two_column, "matrix": matrix, "before-after": before_after}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--spec", required=True)
    ap.add_argument("--name", default="figure-1")
    args = ap.parse_args()

    spec_path = pathlib.Path(args.spec)
    if not spec_path.is_file():
        print(f"ERROR: spec 없음 {spec_path}", file=sys.stderr)
        return 1
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"ERROR: spec 파싱 실패 {e}", file=sys.stderr)
        return 1

    kind = spec.get("kind")
    draw = KINDS.get(kind)
    if not draw:
        print(f"ERROR: 모르는 kind '{kind}'. 지원: {', '.join(KINDS)}", file=sys.stderr)
        return 1

    fig, ax = _canvas(spec.get("title"), spec.get("subtitle"))
    try:
        draw(ax, spec)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        plt.close(fig)
        return 1

    if spec.get("footer"):
        ax.text(0.045, 0.035, spec["footer"], fontsize=11, color=MUTED,
                va="center", ha="left")

    out = ROOT / "src" / "assets" / "blog" / args.slug / f"{args.name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=DPI, facecolor=PAPER)
    plt.close(fig)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
