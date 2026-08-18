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
