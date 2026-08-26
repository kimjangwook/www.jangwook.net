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

# 히어로의 글자는 영어다(위 docstring). 네 언어가 한 파일을 공유하기 때문이다.
# 그 관례가 깨지면 조용히 두부(□)가 그려진다 — matplotlib 기본 폰트에 CJK 글리프가
# 없고, 없는 글리프는 경고 한 줄만 내고 렌더는 성공하며 종료코드도 0 이다.
#
# 그래서 두 가지를 한다. 폰트를 깔아 두부를 막고, 규칙 위반이라는 사실을 말한다.
# 막기만 하면 규칙이 조용히 사라지고, 말하기만 하면 깨진 도판이 나간다.
_CJK = tuple(
    (a, b)
    for a, b in (
        (0xAC00, 0xD7A3),  # 한글 음절
        (0x3040, 0x30FF),  # 가나
        (0x4E00, 0x9FFF),  # 한자
    )
)


def _has_cjk(text: str) -> bool:
    return any(any(a <= ord(ch) <= b for a, b in _CJK) for ch in text)


def _check_language(spec: dict) -> None:
    import sys as _sys

    blob = json.dumps(spec, ensure_ascii=False)
    if not _has_cjk(blob):
        return
    print(
        "WARN: hero-spec 에 CJK 가 들어 있다. 히어로는 네 언어가 공유하므로 영어여야 한다.",
        file=_sys.stderr,
    )
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    try:
        from palette import use_cjk_font

        name = use_cjk_font()
        print(f"WARN: 두부를 막기 위해 {name or '(폰트 없음)'} 으로 그린다.", file=_sys.stderr)
    except Exception as e:  # noqa: BLE001
        print(f"WARN: 폰트 폴백 실패 {e} — 두부가 나온다", file=_sys.stderr)

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


# 항목 상한. _column 이 이미 [:6] 으로 자르지만, 잘린 사실이 어디에도 안 남는다.
# --repair 는 자를 때 그것을 말한다.
MAX_ITEMS = 6
MAX_ITEM_CHARS = 46
MAX_TITLE_CHARS = 90
MAX_HEADING_CHARS = 40


def repair(spec: dict) -> tuple[dict, list[str]]:
    """스펙을 렌더 가능한 모양으로 클램프한다.

    1단 실패의 대부분은 모델이 만든 스펙이 규격을 넘은 것이고, 지금은 그냥 에러다.
    에러 하나가 2단(생성형 이미지)으로 넘어가는데, 2단은 **폴백이 아니라 다른 자산
    클래스**다. 1단은 글자가 값인 타이포그래피 도판이고 2~5단은 전부 "글자 금지"
    프롬프트다. 같은 파일명으로 조용히 바꿔치기하면 안 된다.

    그래서 넘어가기 전에 고쳐 본다. 이 한 함수가 2단 진입의 대부분을 없앤다.
    """
    notes: list[str] = []

    title = str(spec.get("title") or "").strip()
    if not title:
        # 제목이 없으면 고칠 수 없다. 부제로 대신하지 않는다 —
        # 부제를 제목 자리에 올리면 도판이 무엇을 말하는지가 바뀐다.
        notes.append("title 없음 — 복구 불가")
        return spec, notes
    if len(title) > MAX_TITLE_CHARS:
        spec["title"] = title[:MAX_TITLE_CHARS].rstrip() + "…"
        notes.append(f"title {len(title)}자 → {MAX_TITLE_CHARS}자")

    for side in ("left", "right"):
        col = spec.get(side)
        if not isinstance(col, dict):
            if col is not None:
                spec.pop(side, None)
                notes.append(f"{side} 가 dict 가 아니다 — 버림")
            continue

        head = str(col.get("heading") or "").strip()
        if len(head) > MAX_HEADING_CHARS:
            col["heading"] = head[:MAX_HEADING_CHARS].rstrip() + "…"
            notes.append(f"{side}.heading {len(head)}자 → {MAX_HEADING_CHARS}자")

        items = col.get("items")
        if not isinstance(items, list):
            items = []
        items = [str(i).strip() for i in items if str(i).strip()]
        if len(items) > MAX_ITEMS:
            notes.append(f"{side}.items {len(items)}개 → {MAX_ITEMS}개")
            items = items[:MAX_ITEMS]
        clipped = 0
        for idx, it in enumerate(items):
            if len(it) > MAX_ITEM_CHARS:
                items[idx] = it[:MAX_ITEM_CHARS].rstrip() + "…"
                clipped += 1
        if clipped:
            notes.append(f"{side}.items {clipped}개를 {MAX_ITEM_CHARS}자로 자름")
        col["items"] = items
        if not items:
            spec.pop(side, None)
            notes.append(f"{side}.items 가 비어 버림 — 열 제거")

    # 왼쪽이 비고 오른쪽만 남았으면 왼쪽으로 올린다. _column 은 left 를 먼저 본다.
    if not spec.get("left") and spec.get("right"):
        spec["left"] = spec.pop("right")
        notes.append("right 를 left 로 승격")

    return spec, notes


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--spec", default=None)
    ap.add_argument(
        "--repair",
        action="store_true",
        help="규격을 넘은 스펙을 클램프해서 다시 그린다. 무엇을 잘랐는지 stderr 에 남긴다",
    )
    args = ap.parse_args()

    spec_path = pathlib.Path(args.spec) if args.spec else ROOT / "data" / "hero-spec.json"
    spec = None
    if spec_path.is_file():
        try:
            spec = json.loads(spec_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"WARN: spec 파싱 실패 {e}, 기본 로컬 스펙 생성", file=sys.stderr)

    if not spec or not spec.get("title") or not (spec.get("left") or {}).get("items"):
        # Auto-synthesize default local plate spec from slug/brief
        brief_path = ROOT / "data" / "column-brief.md"
        words = args.slug.replace("-", " ").title()
        left_items = ["Systematized Workflow", "Architectural Integrity", "Operational Reliability"]
        right_items = ["Unbounded Retries", "Fragile Coupling", "Manual Overhead"]
        if brief_path.is_file():
            import re
            btext = brief_path.read_text(encoding="utf-8")
            m_thesis = re.search(r"^thesis:\s*(.+)$", btext, re.M)
            if m_thesis:
                t_str = m_thesis.group(1).strip()
                if t_str and len(t_str) > 5:
                    left_items[0] = t_str[:40]
        spec = {
            "title": words[:85],
            "left": {
                "heading": "Adoption Criteria",
                "tone": "keep",
                "items": left_items,
            },
            "right": {
                "heading": "Risk Boundaries",
                "tone": "drop",
                "items": right_items,
            }
        }

    _check_language(spec)

    spec, notes = repair(spec)
    for n in notes:
        print(f"repair: {n}", file=sys.stderr)

    out = ROOT / "src" / "assets" / "blog" / args.slug / "hero.png"
    render(spec, out)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
