#!/bin/bash
# verify-urls.sh <harvest.json> — 수집된 URL 이 실제로 살아 있는지 확인한다.
#
# 이 일을 셸이 하는 이유. 모델에게 "확인해라"라고 시키면 확인했다고 말하는 것까지가
# 모델의 출력이다. 죽은 URL 을 근거로 단 글은 그 글의 신뢰를 통째로 깎으므로,
# 여기만은 사람이 읽을 수 있는 종료코드로 판정한다.
#
# 판정
#   2xx                  verified: true. 최종 URL 로 치환
#   401 / 403 / 3xx / 429  unconfirmed. 후보로는 남지만 인용 출처로 못 쓴다
#   404 / 000 / 타임아웃    버린다. dropped.txt 에 기록
#
# 429 · 000 · 5xx 는 **한 번 재시도한다.** 일시적 실패를 부재로 취급하면
# 1차 출처가 조용히 사라지고, topic-pick 의 규칙 2 가 그만큼 굶는다.
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

check_once() {   # $1=url  → "code<TAB>final_url"
  # ★ `curl ... || printf` 로 쓰면 안 된다.
  #
  # curl 은 `-w` 출력을 **먼저 내고** 그 다음 종료코드로 실패를 알린다. 302 를
  # 따라가다 실패하는 경우가 그렇다 — stdout 에 `302<TAB>url` 이 이미 찍힌 뒤
  # rc != 0 이 되고, `||` 폴백이 `000<TAB>url` 을 **덧붙인다.**
  # 그러면 한 줄에 필드가 5개가 되고, 아래 파서의 `len(parts) == 4` 가 그 행을
  # 조용히 버린다. 그 출처는 verified 에도 dropped 에도 남지 않는다 —
  # 로그의 카운터에만 세어지고 실제로는 증발한다.
  #
  # 2026-08-18 실측. ai.google.dev/gemini-api/docs/changelog 가 OAuth 로 302 되며
  # 이 모양을 만들었고, 그래서 출력 항목이 0건이었다.
  local out
  out="$(curl -sSL -o /dev/null --max-time 12 -A "$UA" \
              -w '%{http_code}\t%{url_effective}' "$1" 2>/dev/null)"
  # curl 이 아무것도 못 냈을 때만 폴백한다. 낸 것이 있으면 그것이 정보다.
  if [ -z "$out" ]; then
    printf '000\t%s' "$1"
  else
    printf '%s' "$out"
  fi
}

# 일시적 실패를 죽은 URL 로 버리지 않는다.
#
# 2026-08-18 첫 실물 실행에서 네 건이 폐기됐는데 그중 둘이 살아 있는 문서였다.
#   https://github.com/anthropics/claude-code/.../CHANGELOG.md (429)  ← 봇 레이트리밋
#   https://ai.google.dev/gemini-api/docs/changelog (302)             ← 재시도하면 200
# 429 는 "나중에 오라"이고 302 는 "여기가 아니라 저기"다. 둘 다 부재가 아니다.
#
# 폐기가 조용히 비싸다. topic-pick 의 규칙 2 는 "verified 수집물이 하나 이상 붙은 것"을
# 요구하므로, 1차 출처를 버리면 그 주제가 후보에서 빠지고 그 사실은 아무 데도 안 남는다.
check() {
  local r code
  r="$(check_once "$1")"; code="${r%%	*}"
  case "$code" in
    429|000|5*)
      # 한 번만 다시 본다. 두 번 이상은 파이프라인을 늦추기만 한다 —
      # 24건 × 12초 타임아웃이 이미 최악 5분이다.
      sleep 2
      r="$(check_once "$1")"
      ;;
  esac
  printf '%s' "$r"
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
    # 401·403 은 봇 차단이고 3xx 는 -L 을 따라가도 리다이렉트로 끝난 것이다.
    # 셋 다 "문서가 없다"가 아니라 "내용을 확인 못 했다"다. 배경으로는 쓰되
    # 인용 출처로는 못 쓴다.
    401|403|3*) echo "$IDX	unconfirmed	$FINAL	$CODE" >> /tmp/verify-out.$$; UNC=$((UNC+1)) ;;
    # 429 는 재시도 뒤에도 남은 경우다. 살아 있는 문서가 확실하므로 버리지 않는다.
    429)       echo "$IDX	unconfirmed	$FINAL	$CODE" >> /tmp/verify-out.$$; UNC=$((UNC+1)) ;;
    *)         echo "$URL ($CODE)" >> "$DROPPED"; DROP=$((DROP+1)) ;;
  esac
done < /tmp/verify-rows.$$

/usr/bin/python3 - "$IN" "$OUT" /tmp/verify-out.$$ <<'PY'
import json, sys, datetime
src, dst, res = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(src))
items = d.get('items') or d.get('candidates') or []
verdict = {}
malformed = []
for line in open(res):
    parts = line.rstrip('\n').split('\t')
    if len(parts) == 4:
        verdict[int(parts[0])] = parts[1:]
    elif line.strip():
        # 읽을 수 없는 행을 조용히 버리지 않는다. 그 항목은 verified 에도
        # dropped 에도 안 남아서, 출처가 증발한 사실이 어디에도 보이지 않는다.
        malformed.append(line.rstrip('\n')[:200])
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
if malformed:
    d['malformed_rows'] = malformed
    print(f'verify: 읽을 수 없는 판정 행 {len(malformed)}건 — 그만큼 출처가 빠졌다',
          file=sys.stderr)
json.dump(d, open(dst, 'w'), ensure_ascii=False, indent=2)
PY

rm -f /tmp/verify-rows.$$ /tmp/verify-out.$$
log "총 ${TOTAL} · 확인 ${OK} · 미확인 ${UNC} · 폐기 ${DROP} → $(basename "$OUT")"
[ "$OK" -gt 0 ] || { log "살아 있는 출처가 하나도 없다"; exit 1; }
exit 0
