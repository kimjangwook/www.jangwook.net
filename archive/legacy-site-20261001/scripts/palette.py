"""jangwook.net 도판 팔레트 단일 출처.

크림 페이퍼 계열이 현행 정본이다. `chart-official-geo-gsc-control.py` 이후의
도판이 전부 이 값을 쓰고, `render-hero.py` 와 `render-figure.py` 가 여기서 읽는다.

값을 바꾸면 앞으로 그리는 모든 도판이 바뀐다. 이미 발행된 글의 PNG 는 그대로
남으므로, 색을 바꿀 때는 과거 도판과 나란히 놓였을 때를 먼저 본다.

`scripts/charts/archive/` 의 옛 스크립트 중 둘(modern-web-guidance, speakable-selectors)은
흰 배경 구세대 팔레트를 쓴다. 그건 되살리지 않는다.
"""

INK = "#1c1f26"      # 본문 글자
MUTED = "#6b7280"    # 부제·각주
PAPER = "#fbfaf7"    # 배경
EDGE = "#d8d3c8"     # 카드 테두리
CARD = "#ffffff"     # 카드 바탕(중립)

DROP = "#b91c1c"     # 사라진 것, 실패, 버리는 것
KEEP = "#1f7a4d"     # 남는 것, 통과, 지키는 것
NEUTRAL = "#1d4ed8"  # 스위치, 분기, 판단이 필요한 것
SPLIT = "#b45309"    # 갈라진 것, 옮겨진 것
FRAG = "#5b21b6"     # 조각, 파편

# 톤 이름 → (글자색, 카드 바탕, 글머리 기호)
# 도판 스펙 JSON 의 `tone` 값이 이 키를 쓴다.
TONES = {
    "drop": (DROP, "#fdf1f1", "×"),
    "keep": (KEEP, "#eef7f1", "+"),
    "neutral": (NEUTRAL, "#eef2fd", "·"),
    "split": (SPLIT, "#fdf4e7", "→"),
}

# 히어로 규격. 1600×840 @ dpi=100.
HERO_W, HERO_H, HERO_DPI = 16.0, 8.4, 100


# ── 폰트 ───────────────────────────────────────────────────────────────
# matplotlib 기본 폰트(DejaVu Sans)에는 한글·일본어·중국어 글리프가 없다.
# 없는 글리프는 경고 한 줄을 내고 **두부(□)로 그려진다.** 렌더는 성공하고
# 종료코드도 0 이라, 도판이 깨졌다는 사실이 파이프라인 어디에도 안 남는다.
#
# 지금까지 안 터진 이유는 히어로 스펙이 전부 영문이었기 때문이다. 본문 도판은
# 한국어 글의 일부라 그 관례가 통하지 않는다.
import warnings as _warnings

_CJK_CANDIDATES = [
    "AppleSDGothicNeo-Regular",
    "Apple SD Gothic Neo",
    "AppleGothic",
    "Hiragino Sans GB",
    "Noto Sans CJK KR",
]


def use_cjk_font() -> str | None:
    """CJK 를 그릴 수 있는 폰트를 rcParams 에 세운다. 세운 이름을 돌려준다.

    못 찾으면 None 이다. 그때는 두부가 나오므로 **부르는 쪽이 경고를 띄워야 한다.**
    조용히 넘어가면 깨진 도판이 그대로 발행된다.
    """
    from matplotlib import font_manager, rcParams

    available = {f.name for f in font_manager.fontManager.ttflist}
    for name in _CJK_CANDIDATES:
        if name in available:
            rcParams["font.family"] = "sans-serif"
            rcParams["font.sans-serif"] = [name, "DejaVu Sans"]
            rcParams["axes.unicode_minus"] = False
            return name

    # 이름으로 못 찾으면 파일 경로로 등록해 본다. macOS 의 .ttc 는
    # font_manager 가 자동으로 안 집는 경우가 있다.
    import pathlib as _pathlib

    for path in (
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    ):
        p = _pathlib.Path(path)
        if not p.is_file():
            continue
        try:
            font_manager.fontManager.addfont(str(p))
        except Exception:
            continue
        name = font_manager.FontProperties(fname=str(p)).get_name()
        rcParams["font.family"] = "sans-serif"
        rcParams["font.sans-serif"] = [name, "DejaVu Sans"]
        rcParams["axes.unicode_minus"] = False
        return name

    return None


def require_cjk_font(where: str) -> None:
    """CJK 폰트를 세우고, 못 세우면 stderr 에 크게 남긴다."""
    import sys as _sys

    name = use_cjk_font()
    if name is None:
        print(
            f"WARN[{where}]: CJK 폰트를 못 찾았다. 한글·일문·중문이 두부(□)로 그려진다.",
            file=_sys.stderr,
        )
        return
    # 그래도 빠지는 글리프가 있으면 알아야 한다. 경고를 삼키지 않는다.
    _warnings.filterwarnings("always", message=".*missing from font.*")
