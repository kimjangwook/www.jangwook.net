목표: `data/topic-pick.md` 하나만 쓴다. 40줄 이하.

읽을 것 (세 파일. 없으면 없는 대로 진행한다):
1. `data/scout/<오늘>/harvest.verified.json` — 오늘 모은 것 중 URL 이 살아 있는 것만
2. `data/backlog-slate.json` — 백로그와 수집물을 조인한 결과
3. `data/priority-slugs.json` — 주간 전략이 지목한 우선 슬러그

## 결정 절차 — 순서대로 본다

이건 취향이 아니라 순서다. 위에서 걸리면 아래는 보지 않는다.

```
1. priority-slugs.json 에 14일 이상 대기한 미소비 슬러그가 있으면 그것을 고른다.
   pick-source: forced.
   나쁜 선택이라고 판단해도 고른다. 대신 objection: 한 줄을 적는다.
   그 줄은 Telegram 으로 나가고 사람이 판단한다.
2. 아니면 backlog-slate 중 verified 수집물이 하나 이상 붙은 것.  pick-source: backlog
3. 1도 2도 비면 백로그 밖에서 제안해도 된다.
   단, topic-backlog.json 에 먼저 추가한다.               pick-source: new
4. SKIP 은 verified 수집물 0건이고 우선 큐도 비었을 때만.
```

**규칙 1은 셸이 다시 계산해서 네 답과 대조한다.** 어긋나면 파이프라인이 exit 1 로
멈춘다. 프롬프트는 이유를 주고 집행은 셸이 한다 — 하드 블록·우선순위 0 으로
지정해도 4주 연속 밀린 기록이 있다.

`priority-slugs.json` 이 **없거나** `week_of` 가 10일 이상 낡았으면 그 파일을 무시하고
`topic-backlog.json` 의 `priority <= 0` 인 미소비 항목을 우선 큐로 삼는다.

파일이 멀쩡한데 14일 넘은 항목이 없는 경우는 폴백이 아니다. 그건 그냥 강제 대상이
없는 것이고, 규칙 2 로 내려간다. 셸 게이트도 같은 판정을 한다 — 여기서 갈리면
매일 exit 1 이 난다.

## 중복 검사

고른 슬러그가 기존 글과 겹치는지 잰다.

```bash
node --input-type=module -e '
import { jaccardSimilarity } from "./scripts/similarity.js";
const tok = s => s.split("-").filter(w => w.length > 2);
// jaccardSimilarity 는 Set 이 아니라 **배열**을 받는다.
// Set 을 넘기면 setA.filter is not a function 이 난다.
console.log(jaccardSimilarity(tok("<후보-슬러그>"), tok("<기존-슬러그>")));
'
```

`src/content/blog/ko/` 의 슬러그 전부와 재서 가장 높은 값을 `dupe-check:` 에 적는다.
**0.85 이상이면 그 후보를 버리고 차순위로 간다.** 버렸다는 사실은 남기지 않아도 된다.

`calculateSimilarity` 를 쓰지 않는다. 그 함수는 `categoryScores` 와 `difficulty` 를
요구하는데 슬러그에는 그 값이 없다.

## 고른 뒤

`testable:` 는 **이 주제를 확인하거나 반증할 수 있는가**다. 오늘 랩이 이 칸을 보고
셀 3~6개를 만든다. `yes` 면 무엇을 어떻게 재는지 한 줄로 쓴다. 못 재면 `no` 다 —
`no` 라고 해서 글을 못 쓰는 것이 아니다.

`leads:` 는 X 에서 온 단서다. **레퍼런스가 아니다.** `harvest.verified.json` 에서
`verified` 가 `x-lead` 인 항목이 여기 온다. 그 항목의 `reference_url` 이 실제 출처이고,
`sources:` 에는 그쪽을 적는다.

`sources:` 에는 `verified: true` 인 것만 넣는다. `unconfirmed` 는 배경으로 쓸 수 있어도
인용 출처로 못 쓴다.

## 형식

```
slug:
pick-source: forced|backlog|new
backlog_slug:
hook: 날짜가 박힌 사건 한 줄
sources:
  - n: 1
    url:
    publisher:
    fetched_at: YYYY-MM-DD
    verified: true
leads:
  - url:            (X 게시물)
    reference_url:  (그것이 가리키는 1차 출처)
testable: yes|no — 무엇을 어떻게
dupe-check: <가장 가까운 기존 글 slug> score=0.xx
objection:          (pick-source 가 forced 이고 반대할 때만)
```

SKIP 이면 첫 줄을 `SKIP: <이유>` 로 쓰고 끝낸다.

`src/content/blog/` 아래에는 아무것도 쓰지 않는다. `data/topic-pick.md` 와
(pick-source 가 new 일 때만) `data/topic-backlog.json` 외에는 손대지 않는다.

질문하지 않는다.
