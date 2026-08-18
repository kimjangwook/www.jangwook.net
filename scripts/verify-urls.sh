#!/bin/bash
# verify-urls.sh <harvest.json> — 수집된 URL 이 실제로 살아 있는지 확인한다.
#
# 이 일을 셸이 하는 이유. 모델에게 "확인해라"라고 시키면 확인했다고 말하는 것까지가
# 모델의 출력이다. 죽은 URL 을 근거로 단 글은 그 글의 신뢰를 통째로 깎으므로,
# 여기만은 사람이 읽을 수 있는 종료코드로 판정한다.
#
# 판정
#   2xx            verified: true. 최종 URL 로 치환
#   401 / 403      unconfirmed. 후보로는 남지만 인용 출처로 못 쓴다
#   404 / 000 / 타임아웃  버린다. dropped.txt 에 기록
#
# x.com 은 봇에 403 을 준다. 그래서 X 는 판정 대상이 아니라 단서다.
# X 항목은 자신의 points_to 1차 출처가 2xx 일 때만 살아남는다.
set -uo pipefail

IN="${1:-}"
[ -s "$IN" ] || { echo "usage: $0 <harvest.json>" >&2; exit 2; }

OUT="$(dirname "$IN")/harvest.verified.json"
DROPPED="$(dirname "$IN")/dropped.txt"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
: > "$DROPPED"

log() { echo "[$(date '+%H:%M:%S')] verify: $*" >&2; }

check() {   # $1=url  → "code<TAB>final_url"
  curl -sSL -o /dev/null --max-time 12 -A "$UA" \
       -w '%{http_code}\t%{url_effective}' "$1" 2>/dev/null || printf '000\t%s' "$1"
}

TOTAL=0; OK=0; UNC=0; DROP=0

# 항목을 한 줄 JSON 으로 뽑아 셸에서 확인하고, 결과를 다시 붙여 넣는다.
/usr/bin/python3 -c "
import json,sys
d=json.load(open('$IN'))
items=d.get('items') or d.get('candidates') or []
for i,it in enumerate(items):
    print(json.dumps({'i':i,'url':it.get('url',''),'points_to':it.get('points_to','')}, ensure_ascii=False))
" > /tmp/verify-rows.$$ 2>/dev/null || { log "harvest 파싱 실패"; exit 1; }

: > /tmp/verify-out.$$
while IFS= read -r row; do
  [ -n "$row" ] || continue
  IDX=$(/usr/bin/python3 -c "import json,sys;print(json.loads(sys.argv[1])['i'])" "$row")
  URL=$(/usr/bin/python3 -c "import json,sys;print(json.loads(sys.argv[1])['url'])" "$row")
  PT=$(/usr/bin/python3 -c "import json,sys;print(json.loads(sys.argv[1])['points_to'])" "$row")
  TOTAL=$((TOTAL+1))

  # X 는 봇을 막으므로 확인 자체를 시도하지 않는다. points_to 로 판정한다.
  case "$URL" in
    *x.com/*|*twitter.com/*)
      if [ -n "$PT" ]; then
        R="$(check "$PT")"; CODE="${R%%	*}"; FINAL="${R#*	}"
        case "$CODE" in
          2*) echo "$IDX	x-lead	$FINAL	200" >> /tmp/verify-out.$$; OK=$((OK+1)) ;;
          *)  echo "$URL (points_to $PT → $CODE)" >> "$DROPPED"; DROP=$((DROP+1)) ;;
        esac
      else
        echo "$URL (points_to 없음 — X 단독은 레퍼런스가 못 된다)" >> "$DROPPED"
        DROP=$((DROP+1))
      fi
      continue
      ;;
  esac

  R="$(check "$URL")"; CODE="${R%%	*}"; FINAL="${R#*	}"
  case "$CODE" in
    2*)        echo "$IDX	true	$FINAL	$CODE" >> /tmp/verify-out.$$; OK=$((OK+1)) ;;
    401|403)   echo "$IDX	unconfirmed	$FINAL	$CODE" >> /tmp/verify-out.$$; UNC=$((UNC+1)) ;;
    *)         echo "$URL ($CODE)" >> "$DROPPED"; DROP=$((DROP+1)) ;;
  esac
done < /tmp/verify-rows.$$

/usr/bin/python3 - "$IN" "$OUT" /tmp/verify-out.$$ <<'PY'
import json, sys, datetime
src, dst, res = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(src))
items = d.get('items') or d.get('candidates') or []
verdict = {}
for line in open(res):
    parts = line.rstrip('\n').split('\t')
    if len(parts) == 4:
        verdict[int(parts[0])] = parts[1:]
kept = []
today = datetime.date.today().isoformat()
for i, it in enumerate(items):
    if i not in verdict:
        continue
    state, final, code = verdict[i]
    it['verified'] = 'x-lead' if state == 'x-lead' else (True if state == 'true' else 'unconfirmed')
    it['fetched_at'] = today
    it['http_code'] = code
    if state == 'x-lead':
        # X 는 단서다. 인용 출처는 그것이 가리킨 1차 출처다.
        it['reference_url'] = final
    else:
        it['url'] = final
    kept.append(it)
d['items'] = kept
d['verified_at'] = today
json.dump(d, open(dst, 'w'), ensure_ascii=False, indent=2)
PY

rm -f /tmp/verify-rows.$$ /tmp/verify-out.$$
log "총 ${TOTAL} · 확인 ${OK} · 미확인 ${UNC} · 폐기 ${DROP} → $(basename "$OUT")"
[ "$OK" -gt 0 ] || { log "살아 있는 출처가 하나도 없다"; exit 1; }
exit 0
