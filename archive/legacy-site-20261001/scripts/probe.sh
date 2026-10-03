#!/bin/bash
# probe.sh <slug> — 오늘 쓸 주제를 겨냥한 짧은 실험.
#
# run-lab.sh 의 셀 실행 기계를 그대로 쓴다. 그 기계는 잘 만들어져 있다 —
# 셀당 타임아웃, 예산 캡, 반복, bash 실행 + agy 판정 분리, 부분 실패 내성.
# 여기서 하는 일은 그것을 **축소 예산으로 부르는 것**뿐이다.
#
# 예산이 다른 이유. 자유 탐색 랩은 마감이 없어서 2시간 30분을 쓴다.
# 프로브는 09:10 에 돌아 15:23 발행에 재료를 대야 하고, 실패해도 글은 나가야 한다.
# 그래서 25분에서 끊는다. 빈 tested[] 는 정상이다.
set -uo pipefail

SLUG="${1:-}"
[ -n "$SLUG" ] || { echo "usage: $0 <slug>" >&2; exit 2; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 25분 / 셀당 2분. run-lab 의 9000s / 180s 에서 내렸다.
export LAB_EXEC_BUDGET_SEC="${LAB_EXEC_BUDGET_SEC:-1500}"
export LAB_CELL_TIMEOUT_SEC="${LAB_CELL_TIMEOUT_SEC:-120}"
export LAB_ID="${LAB_ID:-probe-$(date +%Y-%m-%d)-$SLUG}"

exec bash "$PROJECT_DIR/scripts/run-lab.sh" --for "$SLUG"
