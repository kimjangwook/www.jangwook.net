# 파이프라인 재구축 인수인계 — 랩 리포트에서 칼럼으로

작성 2026-08-18. 이 문서 하나로 처음부터 끝까지 실행할 수 있게 쓴다.
읽는 사람은 이 저장소를 모른다고 가정한다.

---

## 0. 왜 이걸 하는가

이 블로그의 목표는 X·뉴스·기술 블로그·기술 사이트에서 최신 소식을 모아 공부하고,
자기 의견을 실어 전문가의 사설(칼럼)을 쓰는 것이다. 참조한 자료는 글 마지막에
레퍼런스로 붙인다. 테스트 가능한 것은 테스트하되, 테스트하지 않은 것을 굳이
고백할 필요는 없다.

지금 시스템은 그걸 못 한다. 소유자 평가는 이렇다.

> 랩에서 실행하며 아는 사람만 아는 혼잣말 수준.
> 너무 강한 프롬프트 제약에 의해 창의성과 글 작성 능력이 완전 죽은 느낌.

원인 셋이 조사로 확인됐다.

1. **주제 공급원이 랩 하나다.** `scripts/prompts/daily-post-core.md` 가
   `data/labs/index.json` 만 읽고 미소비 데이터셋이 없으면 `SKIP` 한다. 랩이 스스로
   질문을 고르고 그 데이터셋이 주제를 정하니, 글이 랩 노트가 되는 것은 배선의
   필연이다. `claude-controller/.claude/skills/daily-tech-blog/SKILL.md` 에 정의된
   레인 B(Source Review)는 실행 경로가 아예 없다.
2. **집필자가 재료를 못 가져온다.** "FACT CORE 밖 숫자·인용 금지"는 사실 안전에는
   옳지만 맥락·비교·비유·업계 관찰까지 함께 막혔다.
3. **제약이 과잉이다.** `daily-post-lang-ko.md` 71줄 중 24줄이 금지다.
   `voice-anti-ai.md` 가 12개를 더한다. 그런데 같은 파일 17행이 인용하는
   arXiv:2505.13360 이 "요구사항이 늘수록 준수율 약 19% 하락"이다. 반대로 갔다.

**목표 형식**은 `src/content/blog/ko/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026.md` 다.
같은 계열 6편(아래 §9)의 제원이 2,275~2,673단어 / H2 6~10개로 일관된다.

---

## 1. 소유자가 확정한 결정 — 임의로 뒤집지 말 것

| 항목 | 결정 | 주의 |
|---|---|---|
| 미검증 고지 문단 | **제거** | 참조 글 3번째 단락("이 글은 Source Review 분석이다…")이 바로 그것이다. 그 단락은 쓰지 않는다. 안 해본 것을 해봤다고 쓰지 않는 규칙만 남긴다 |
| 콜론 금지 | **전면 해제** | 2026-08-16에 8개 프롬프트에 넣은 콜론 조항을 **전부 삭제**한다. 참조 글은 `## 주제: 부제` 와 `**라벨**: 설명` 을 자유롭게 쓴다 |
| 실험 랩 | **주제 종속** | 독립 잡을 없애고, 고른 주제가 요구할 때만 짧게 확인 |
| 이미지 | **5단 체인** | 코드 → agy → gemini무료 → grok → gemini유료. 격하는 감수하되 가시화 |
| 발행 빈도 | **매일** | 월·수·금에서 되돌린다 |
| 집필 모델 | **fable → opus 폴백** | 이미 배선 완료 (§2 참조) |

---

## 2. 이미 끝난 것 — 다시 하지 말 것

전부 미커밋 상태다. 작업을 이어받으면 이것부터 커밋해도 된다.

| 파일 | 상태 | 내용 |
|---|---|---|
| `claude-controller/scripts/gen-image-gemini.py` | 수정 완료 | `--key-env NAME` 인자 추가. 미지정 시 기존 `key_chain()` 순회 유지라 기존 호출자 무영향 |
| `scripts/palette.py` | 신규 완료 | 크림 팔레트 단일 출처. `INK/MUTED/PAPER/EDGE/CARD` + `DROP/KEEP/NEUTRAL/SPLIT/FRAG` + `TONES` + `HERO_W/H/DPI` |
| `scripts/charts/archive/` | 이동 완료 | 옛 `chart-*.py` 5개 + README |
| `scripts/prompts/models/column-model-{ko,ja,en,zh}.md` | 신규 완료 | 본보기 4개 |
| `scripts/verify-urls.sh` | 신규 완료 | URL 실존 확인. 실제 URL 스모크 테스트 통과 |
| `scripts/backlog-merge.mjs` | 신규 완료 | 백로그 조인. dry-run 통과(발행분 3건 자동 done, 슬레이트 12건) |
| `scripts/daily-post-pipeline.sh` | 부분 수정 | `WRITER=fable` 기본값, `CLAUDE_WRITE_MODEL`, `run_claude` 3번째 인자로 모델 오버라이드 |

**fable 폴백의 함정.** Fable 은 사용량 한도에 걸려도 **종료코드 0** 을 준다.
종료코드로는 못 잡고 산출물 부재로만 잡힌다. `write_lang()` 의
`rc -eq 0 이나 파일 없음` 분기가 폴백의 주 경로다. 지우지 말 것.

---

## 3. 남은 작업 — 실행 순서

### 단계 A. 집필 프롬프트 재작성 (최우선)

**이것이 소유자 불만의 직접 원인이다. 다른 것보다 먼저 한다.**

대상: `scripts/prompts/daily-post-lang-{ko,ja,en,zh}.md`
현재: ko 71줄(금지 24) / ja 64줄(금지 29) / en 64줄(금지 10) / zh 66줄(금지 21)
목표: 각 28줄 내외, 제약 10개

#### 남기는 제약 10개 — 이것만 남긴다

기준은 (a) 하류에서 기계로 검사되거나 (b) 이 블로그의 정체성.

1. LOCKED 블록 밖 숫자·인용·날짜를 만들지 않는다
2. 인용 블록 바로 아래 출처 링크 (`validate-publishing.mjs` 의 `validateVerbatimCitations` 가 집행)
3. H2 는 이 언어만의 것 (`scripts/h2-independence.mjs` 가 `pubDate >= 2026-08-14` 에서 빌드 실패시킴)
4. 마지막 H2 는 `## 참고 자료` — LOCKED `sources[]` 번호 순서 그대로
5. 한 절을 통째로 `counter` 에 쓴다 (명시적 반대 한 절)
6. 마지막 절을 요약·교훈·`반드시 ~해야 한다` 로 닫지 않는다
7. 균형으로 닫지 않는다 — 한쪽을 고르고 틀릴 조건 한 줄
8. 괄호 용어 설명 글당 3개까지
   (근거: 2026-08-15 ko A/B. 형식을 지정한 ko 만 19개, 미지정 ja·en 은 0개)
9. 연결어미 뒤 쉼표 금지 (ko 전용. 사람 4.10% vs AI 19.83%)
10. `relatedPosts` 의 `reason.{ko,ja,en,zh}` 는 각각 그 언어로

**콜론 관련 조항은 전부 삭제한다.** 현재 ko 3개·ja 5개·en 5개·zh 4개가 박혀 있다.

#### 빼는 약 30개는 지우지 말고 옮긴다

목적지는 `scripts/prompts/daily-post-polish-{ko,ja,en,zh}.md`.
수행/진행/실시 금지, 주어는 사람, `~를 통해` 금지, 한자어 옆 고유어, 유보 연달아
금지 — 전부 **발견하면 고치는 규칙**이고 발견은 편집자의 일이다.
`daily-post-pipeline.sh` 285행 주석이 이미 그렇게 적어 놓았다.

#### 새 집필 프롬프트 뼈대

```
1. 역할과 독자      결정을 앞둔 사람이 처음부터 끝까지 읽는다. 개발자만이 아니다
2. 산출물          src/content/blog/<lang>/{{SLUG}}.md 하나만
3. 읽을 것         data/column-brief.md
                   scripts/prompts/models/column-model-<lang>.md   ← 본보기
                   scripts/prompts/voice-anti-ai.md
4. 본보기 지정      "이 글의 호흡을 빌린다" — models/ 파일을 명시적으로 열게 한다
5. 골격            9블록 중 6~8개. 순서는 집필자가 정한다 (강제 아님)
6. 잠금과 자유      LOCKED 의 숫자·인용·날짜만 잠긴다. 나머지는 자유
7. 분량            2,200~2,700단어, H2 6~10개
8. 제약 10개
9. 마지막 H2 는 ## 참고 자료
```

#### 6번 항목의 정확한 문구 — 이게 핵심이다

```
브리프의 LOCKED 블록에 있는 숫자·인용·날짜만 잠겨 있다. 그 밖은 전부 네 몫이다.
맥락을 넓히고, 비교를 만들고, 비유를 하나 쓰고, 독자의 상황을 상정해도 된다.
업계에서 무슨 일이 있었는지 아는 것을 써도 된다.

안 해본 것을 해봤다고 쓰지만 않으면 된다.
```

**9블록은 강제할 수 없다.** 네 언어에 같은 순서를 주면 `h2-independence.mjs` 가
`matched.length >= 3` 에서 빌드를 깬다. 메뉴로 준다.

> 아홉 중 여섯에서 여덟을 고른다. 순서는 네가 정한다. 넷 이하면 얕고,
> 아홉을 다 쓰면 목차가 된다. 다른 언어와 순서가 겹치지 않게 고른다.

9블록: 사실정리 / 메커니즘·구조 / 숫자검증 / 비용 / 비교축 / **명시적 반대(필수)** /
실행가능성 / 누구에게 맞나(대칭 리스트) / 한계(선택)

#### polish 를 바닥 인식형으로

`daily-post-polish-{lang}.md` 는 지금 무조건 20~30% 삭감이라 2,400단어 초고가
1,700단어로 착지한다. 다음을 넣는다.

> 2,200단어 아래로는 자르지 않는다. 이미 그 아래면 자르지 말고 패턴만 고친다.

`daily-post-pipeline.sh` 의 `polish_lang()` (약 289~314행)에 단어 수 로그를 추가한다.
지금은 바이트만 남는다.

**polish 가 보호해야 할 것** (이미 들어 있음, 지우지 말 것): 재현 명령·코드블록·
측정 출력, 저자가 남긴 실패·유보, **인과를 설명하는 문단**.

---

### 단계 B. 브리프 스키마 — `column-brief.md`

`data/fact-core.md` → `data/column-brief.md` 로 대체한다.
**개명은 의도적이다.** "FACT CORE" 라는 이름 자체가 모델에게 측정 로그를 지시한다.
참조 지점: 파이프라인 12곳(`FACT_CORE` 변수), 프롬프트 16개 파일.
치환 후 `grep -rn "fact-core\|FACT_CORE" scripts/ | wc -l` 이 0이어야 한다.

**파일을 두 블록으로 물리적으로 나눈다. 이게 설계의 핵심이다.**

```
slug: / pubDate: / lane: b / backlog_slug: / hero: TODO / hero_kind: / related:

## LOCKED            여기 밖으로 나가면 사실이 아니다
sources:
  - n: 1
    title: / publisher: / url: / fetched_at: / verified: true|unconfirmed
    quote: "축자 인용"        (있을 때만)
    quote_lang: en
facts:
  - claim: / source_n: 1 / exact: "원문에 있는 그대로의 표현·수치"
timeline:
  - 2026-08-12 — 무슨 일 — source_n
tested:              오늘 실제로 돌린 것. 비어도 된다
  - command: / result: / env:
not_tested:          내부용. 본문 노출 의무 없음

## OPEN              여기는 재료다. 집필자가 늘려도 된다
thesis:              반박 가능한 한 문장
stance:              조건부 양분. A인 팀에는 X, B인 팀에는 Y (중립 금지)
counter:             가장 강한 반대, 그리고 그것이 옳은 범위
mechanism:           무엇이 그것을 일으켰나 (모르면 unknown)
axes:                비교축. 참조 6편이 전부 갖고 있다
cost:                가격·쿼터·시간 (모르면 unknown)
fits: / does-not-fit:   대칭 리스트
reader:              누가 읽고 내일 무엇을 바꾸는가
beyond:              주제를 넘는 관찰 하나. 마무리가 여기서 끝난다
open_questions:
```

`sources[].n` 은 **안정된 참조 번호**다. 네 언어가 같은 번호를 쓰고
`## 참고 자료` 가 이 순서 그대로 나온다. 언어마다 레퍼런스가 달라지는 사고를
구조로 막는다.

`not_tested` 는 LOCKED 에 두되 **본문 노출 의무를 뗀다.** 지금 `failed:` 가
매 글에 변명 문단을 만들고 있다.

**만들 파일**
- 신규 `scripts/prompts/daily-post-brief.md` (레인 B). `data/topic-pick.md` 를 읽고 위 스키마를 쓴다
- 개명 `daily-post-core.md` → `daily-post-core-lab.md` (레인 A 전용, 새 스키마로)
- 수정 `daily-post-refact.md` — 새 스키마로. **안 하면 `--redo` 가 조용히 옛 모양을 만든다**

---

### 단계 C. 주제 선정

#### C-1. `scripts/scout.sh` (신규)

판단 없이 모으기만 한다. 두 모드.

**x 모드** — `/Users/jangwook/.grok/bin/grok -p` 호출.
`scripts/x-scout.sh` 의 호출부를 가져오되 프롬프트를 교체한다.
출력에 **`points_to`**(그 게시물이 가리키는 1차 출처 URL)를 반드시 포함시킨다.
grok CLI 에 X 전용 검색 도구는 없다. `web_search` + 자연어 지시에 의존한다.

**web 모드** — `agy --print`(실패 시 claude) + WebSearch.
소스 목록은 `claude-controller/.claude/skills/daily-tech-blog/SKILL.md` 의
레인 B 목록을 프롬프트에 축자로 박는다.

**402 쿼터 가드를 복원한다.** `/Users/jangwook/workspace/wbai/scripts/x_scout.sh`
41~49행을 이식. 패턴 `usage balance exhausted|status 402 Payment Required`.
매치되면 `QUOTA_EXHAUSTED` 찍고 exit 0. 수집 실패는 비치명이다 — web 모드만으로도 하루는 돈다.

출력: `data/scout/<date>/harvest.json`, 형식 `{"items":[{url, points_to, claim, ...}]}`

#### C-2. `scripts/verify-urls.sh` — **완료됨**

사용법 `bash scripts/verify-urls.sh data/scout/<date>/harvest.json`
→ `harvest.verified.json` + `dropped.txt`

**이 일을 셸이 하는 이유.** 모델에게 확인하라고 시키면 확인했다고 말하는 것까지가
모델의 출력이다.

판정: 2xx=`true` / 401·403=`unconfirmed`(인용 출처로 못 씀) / 그 외 폐기.
**x.com 은 봇에 403 을 준다.** X 는 레퍼런스가 아니라 단서다. X 항목은 자신의
`points_to` 1차 출처가 2xx 일 때만 살아남고, 그때 `reference_url` 이 실제 출처가 된다.

#### C-3. `scripts/backlog-merge.mjs` — **완료됨**

사용법 `node scripts/backlog-merge.mjs <harvest.verified.json> --out <slate.json> [--dry]`

하는 일 셋: 발행된 백로그 항목 자동 `done` 처리 / queued 에 수집물 조인 /
안 쓰인 신규 수집물을 백로그에 append.
점수 = 수집물 매칭 0.55 + `source` 품질 0.30 + 우선순위 0.15.
`source` 품질은 길이·URL 포함·확인 날짜로 잰다 — 옛 항목은 `source` 가 빈약해
상위로 오면 안 된다.

#### C-4. `data/priority-slugs.json` (신규)

`data/strategy-report.md` 가 이미 진단했다.

> 문체 규칙(SKILL.md에 박은 것)은 지켰고, 발행 대상 선택(리포트에만 적은 것)은
> 또 무시됐다 — 주제 피커에만 해당한다. / 3주 연속 우선 슬러그 미소비

1,860줄 리포트 파싱은 취약하니 기계가독 계약 파일을 만든다.

```json
{ "week_of": "2026-08-16", "slugs": [{"slug": "...", "since": "2026-07-26", "reason": "..."}] }
```

`claude-controller/.claude/skills/sunday-strategy/SKILL.md` 가 매주 이 파일을 쓰게 수정한다.
없거나 10일 이상 낡으면 `topic-backlog.json` 의 `priority <= 0` 으로 폴백.

#### C-5. `scripts/prompts/topic-pick.md` (신규)

읽는 파일 3개(`harvest.verified.json`, `backlog-slate.json`, `priority-slugs.json`),
산출 `data/topic-pick.md` 40줄 이하.

게이트를 **순서 있는 결정 절차**로 박는다.

```
1. priority-slugs.json 에 14일 이상 대기한 미소비 슬러그가 있으면 그것을 고른다.
   pick-source: forced. 나쁜 선택이라 판단해도 고르고 objection: 한 줄을 적는다.
   그 줄은 Telegram 으로 나가고 사람이 판단한다.
2. 아니면 backlog-slate 중 verified 수집물이 하나 이상 붙은 것.  pick-source: backlog
3. 1도 2도 비면 백로그 밖 제안 가능. topic-backlog.json 에 먼저 추가. pick-source: new
4. SKIP 은 verified 수집물 0건 + 우선 큐도 비었을 때만.
```

**프롬프트만으로는 부족하다.** 하드 블록·우선순위 0 으로 지정해도 4주 연속 밀린
기록이 있다. `daily-post-pipeline.sh` 가 **규칙 1을 셸에서 재계산해 모델의 답과
대조하고, 불일치면 exit 1** 한다. 프롬프트는 이유를 주고 셸이 집행한다.

중복은 `scripts/similarity.js` 의 `calculateSimilarity` 로 재고 0.85 이상이면
자동 탈락 → 차순위. **주의: `jaccardSimilarity` 는 Set 이 아니라 배열을 받는다.**

`data/topic-pick.md` 형식:
```
slug: / pick-source: forced|backlog|new / backlog_slug:
hook: 날짜 박힌 사건 한 줄
sources:  - n: 1 / url / publisher / fetched_at / verified
leads:    X에서 온 단서. 레퍼런스 아님
testable: yes|no + 무엇을 어떻게
dupe-check: <가장 가까운 기존 글 slug> score=0.xx
objection: (pick-source가 forced이고 반대할 때만)
```

---

### 단계 D. 테스트를 주제 종속으로

**배선을 뒤집는다. 주제가 실험을 정한다.**

| | 지금 | 뒤 |
|---|---|---|
| 실행 | 매일 09:10 독립 잡 | 09:10 잡 안, 주제 확정 **뒤** |
| 질문 출처 | `lab-plan.md` 가 스스로 고름 | `topic-pick.md` 의 `testable:` |
| 예산 | `LAB_EXEC_BUDGET_SEC=9000` | **1500 (25분)** |
| 셀 | 17+ | 3~6 |
| 셀 타임아웃 | 180s | 120s |
| 실패 시 | 재고 없음 → SKIP | 빈 `tested[]` → **그냥 계속** |

- 신규 `scripts/scout-and-probe.sh` — 09:10 엔트리포인트.
  `scout.sh` → `verify-urls.sh` → `backlog-merge.mjs` → topic-pick → `probe.sh`
- 신규 `scripts/probe.sh` — `run-lab.sh` 의 셀 실행 기계(109~166행)를
  `--for <slug>` 와 축소 예산으로 부르는 얇은 래퍼.
  **그 기계는 잘 만들어져 있다. 버리지 않는다.**
- 수정 `scripts/prompts/lab-plan.md` — "네가 궁금한 것"에서
  "`topic-pick.md` 의 주장을 반증하거나 확인할 셀 3~6개"로
- `data/labs/` 는 아카이브로 보존. 이미 발행된 글의 근거다

**중첩 에이전트 함정** (2026-08-16 실사고, `run-lab.sh` 주석에 기록):
agy 안에서 codex 를 부르면 codex 가 `failed to load configuration` 으로 죽는다.
같은 명령을 bash 에서 돌리면 멀쩡하다. **명령 실행은 bash 가, 판정은 agy 가** 한다.

#### 침묵은 허용, 사칭은 차단

집필 프롬프트에서 `failed:` 관련 지시를 전부 뺀다. 대신
`scripts/prompts/daily-post-seal-check.md` 에 검사를 추가한다.

> 본문의 1인칭 실행 동사(돌려봤다 / 재봤다 / 확인해봤다 / 설치했다 / I ran /
> 実行した / 我运行了)를 전부 찾아라. 각각이 LOCKED `tested[]` 의 항목으로
> 매핑되지 않으면 그 언어를 REWRITE 로 지목한다.

grep 가능한 규칙이라 나중에 `validate-publishing.mjs` 로도 옮길 수 있다.

---

### 단계 E. 이미지 5단 체인

#### 격하를 먼저 줄이고, 남은 격하는 가시화한다

1단은 **글자가 값인 타이포그래피 도판**이고 2~5단은 전부 "글자 금지" 프롬프트다.
폴백이 아니라 다른 자산 클래스다. 같은 파일명으로 조용히 바꿔치기하면 안 된다.

1. **1.5단 신설 — `render-hero.py --repair`.** 1단 실패의 대부분은 스펙 불량
   (`left.items` 누락, 항목 초과)이고 지금은 그냥 에러다. 항목을 6개·46자로
   클램프하고 다시 그린다. **이 한 줄이 2단 진입의 대부분을 없앤다.**
2. **`hero_kind` 를 브리프에 기록한다.** `plate`(1단) / `illustration`(2~5단).
   Telegram 에도 나간다. 조용한 격하를 없앤다.
3. **격하에 대가를 붙인다.** `hero_kind == illustration` 이면 `seal-check` 가
   본문에 도판이나 코드블록이 최소 하나 있는지 요구한다.

#### 체인 — `scripts/gen-hero.sh` 재작성

멱등 가드(`[ -s "$OUT" ]`), `.env` 2중 로딩, 실패해도 파이프라인 계속은 유지한다.

```
S1   결정적 렌더  /opt/anaconda3/bin/python3 scripts/render-hero.py --slug --spec
S1.5 복구 렌더    같은 스크립트 --repair
S2   agy         /Users/jangwook/.local/bin/agy --print       [일 10장 쿼터]
S3   gemini 무료  gen-image-gemini.py --key-env GEMINI_API_KEY
S4   grok        scripts/gen-image-grok.sh                    [유료 티어 게이트]
S5   gemini 유료  gen-image-gemini.py --key-env GEMINI_API_KEY_PAID
```

각 단이 `data/hero.log` 에 `stage=Sn rc= bytes= path=` 한 줄씩 남긴다.

**S2 (agy)** — CLI 플래그가 아니라 **에이전트 내부 툴** `generate_image` 다.
모델은 `gemini-3.1-flash-image-preview`(폴백 `gemini-2.5-flash-image-preview`)로
바이너리에 고정돼 있다. 접근은 `agy -p "..."` 뿐이다.

- **PATH**: 파이프라인 PATH 에 `~/.local/bin` 이 없다. 절대경로 고정 + `[ -x ]` 체크
- **코드 드로잉 방지**: 프롬프트에
  `using your image GENERATION tool only (code/SVG drawing forbidden)` 를 축자로 박는다.
  (2026-07-29 agy 가 SVG 로 그려서 가짜 결과물이 나온 사고)
- **타임아웃 ≠ 실패**: `--print-timeout 12m`, **rc 무관하게 `[ -s "$OUT" ]` 검사**.
  agy 는 응답 타임아웃이 나도 파일은 저장되는 경우가 있다
- **크기 게이트 150KB**: 미달이면 코드 드로잉 의심 → 1회 재생성, 그래도 미달이면 S3.
  (etf-swing-social 의 400KB 는 4컷 만화 기준이다. 크림 배경 평면 16:9 는 정당하게
  더 작다. **첫 5회 실측으로 재보정할 것**)
- **쿼터 회계**: 신규 `data/img-quota-agy.txt` (`YYYY-MM-DD count`). 8장 이상이면
  S2 건너뜀. 남은 2장은 `etf-swing-social` 몫 —
  **지금 두 잡이 같은 일 10장을 조율 없이 나눠 쓰고 있다**
- 호출당 5~10분. 백그라운드 실행 금지, 포그라운드로 끝까지 대기

**S3 / S5** — `gen-image-gemini.py --key-env` 는 **이미 구현돼 있다**(§2).
`env -u` 마스킹 대신 명시 인자를 고른 이유는 `gen-hero.sh` 가 `set -a` 로 `.env`
둘을 소싱해 마스킹이 조용히 새기 때문이다.

**S4 (grok)** — 신규 `scripts/gen-image-grok.sh`. 내부 툴 `image_gen`(xAI Imagine API).

- **유료 티어 게이트**: SuperGrok 전용이고, 실패 시 바이너리가
  `Do not retry this tool` 을 지시한다. 호출 1회. 402 패턴과 그 문구를 검사해
  매치되면 센티넬 `data/img-grok-disabled.txt` 에 날짜를 쓰고 **7일간 S4 를 건너뛴다**
- **`--out` 없음**: 세션 상대경로 `images/N.jpg` 에 저장하고 절대경로를 반환한다.
  스크래치 `data/.grok-img/<slug>/` 에서 `cd` 후 실행. 회수는 **독립적인 두 경로** —
  ① stdout 에서 `[A-Za-z0-9._/-]+\.(jpg|jpeg|png)` 마지막 매치
  ② 실패 시 호출 시각보다 mtime 이 새로운 파일 `find`.
  문서화되지 않은 포맷을 정규식 하나로 믿으면 언젠가 깨진다
- **JPG**: `sips -s format png`(macOS 내장, 의존성 0) + 1600×840 규격 맞춤
- `--tools image_gen` 화이트리스트를 거는 패턴이
  `claude-controller/sh/run-grok-skill.sh` 에 이미 있다

#### 본문 도판

`chart-*.py` 5개는 전부 슬러그 하드코딩 1회용이다. **일반화하지 않는다** —
범용 차트 DSL 은 별도 프로젝트고 회수가 낮다. 이미 `scripts/charts/archive/` 로
옮겨 뒀다.

신규 `scripts/render-figure.py --slug <slug> --spec <json>` — 참조 6편이 실제로
쓰는 세 가지만 지원한다. 2열 대조 카드 / 라벨 매트릭스 / before-after 막대쌍.
팔레트는 `scripts/palette.py` 에서 import.

---

### 단계 F. 파이프라인과 launchd

#### `scripts/daily-post-pipeline.sh`

- `--lane a|b` 추가, 기본 `b`. 레인 A(랩 주도)는 죽이지 않고 소수 경로로 남긴다
- 1단계를 topic-pick 검증 + brief 로 교체
- 규칙 1(강제 슬러그) 셸 재계산 후 모델 답과 대조, 불일치 시 exit 1
- `FACT_CORE` → `BRIEF` 변수 개명
- 랩 소비 처리 블록(약 601~624행)을 레인 A 조건부로
- `polish_lang()` 에 단어 수 로그 추가

**손대지 말 것** — 언어 격리(`hold_siblings`, 약 173~182행), 원자적 잠금
(`mkdir $LOCK_DIR`), `trap cleanup`, 엔진 래퍼 3종.

#### launchd

| 잡 | 지금 | 뒤 |
|---|---|---|
| `net.jangwook.lab` | 매일 09:10 → `run-lab.sh` | `net.jangwook.scout` 로 개명, → `scout-and-probe.sh` |
| `net.jangwook.daily-post` | 월·수·금 15:23 | **매일 15:23** |

plist 는 `~/Library/LaunchAgents/`. 변경 후 `launchctl bootout` → `bootstrap` 필요.
`plutil -lint` 로 먼저 검사할 것.

---

## 4. 게이트 갱신

### `scripts/prompts/daily-post-insight-gate.md` — 레인 B 판으로

지금 5문이 랩 리포트 기준이다. 칼럼 기준으로 바꾼다.
- Q2 "랩이 한 대에서 쟀다" → "출처에 날짜가 있고 주장이 그걸 넘지 않는가"
- Q5 신설 — "입장이 있는가, 아니면 균형으로 도망갔는가"

판정은 `PUBLISH` / `REWRITE: ko,ja — <한 줄>` / `HOLD: <한 줄>` 그대로 유지.
**REWRITE 는 실행형 지시여야 한다.** "더 통찰력 있게"가 아니라
"ko — mechanism 이 2절에 없다, 숫자 나열 뒤에 넣으라".
재판정은 한 번뿐이고 두 번째도 REWRITE 면 HOLD 로 떨어뜨린다.

### `scripts/validate-publishing.mjs`

추가할 검사:
- 단어수 소프트 게이트 (하한 2,000 / 상한 3,200)
- `## 참고 자료`(또는 언어별 대응) 존재
- 본문의 모든 외부 URL 이 브리프 `sources[]` 안에 있는지

기존 게이트 3종은 유지한다 (2026-08-16 추가분, `QUALITY_GATE_FROM` 날짜 컷 방식):
인용 있는데 링크 0 / description 하한(언어별) / relatedPosts reason 언어 혼입.
**날짜 컷 방식을 그대로 따를 것.** 전량 error 로 두면 기존 코퍼스에서 빌드가 멈춘다.

---

## 5. 삭제·개명·신규 전체 목록

**삭제**
- `scripts/prompts/daily-post-lang.md` (스텁, 134B — 참조처 확인 후)
- `data/fact-core.md` (→ `column-brief.md`)

**개명**
- `scripts/prompts/daily-post-core.md` → `daily-post-core-lab.md`
- `scripts/x-scout.sh` → `scripts/social/x-scout.sh`
  (소셜 교류용이며 **여전히 어디에도 안 붙는다**. 요청 없는 잡을 만들지 말 것)
- launchd `net.jangwook.lab` → `net.jangwook.scout`

**신규**

| 파일 | 역할 | 상태 |
|---|---|---|
| `scripts/scout.sh` | X·웹 수집, 402 가드 | 미착수 |
| `scripts/verify-urls.sh` | URL 실존 확인 | **완료** |
| `scripts/backlog-merge.mjs` | 백로그 조인 | **완료** |
| `scripts/scout-and-probe.sh` | 09:10 엔트리포인트 | 미착수 |
| `scripts/probe.sh` | 축소 예산 프로브 래퍼 | 미착수 |
| `scripts/gen-image-grok.sh` | S4 | 미착수 |
| `scripts/palette.py` | 팔레트 단일 출처 | **완료** |
| `scripts/render-figure.py` | 본문 도판 3종 | 미착수 |
| `scripts/prompts/topic-pick.md` | 주제 선정 게이트 | 미착수 |
| `scripts/prompts/daily-post-brief.md` | 레인 B 브리프 | 미착수 |
| `scripts/prompts/models/column-model-{ko,ja,en,zh}.md` | 본보기 | **완료** |
| `data/priority-slugs.json` | 우선순위 계약 | 미착수 |
| `data/img-quota-agy.txt` | agy 쿼터 회계 | 미착수 |

**손대지 않을 것**
`daily-post-seal-publish.md`, `daily-post-lang-fix.md`, `h2-independence.mjs`,
`similarity.js`, `run-lab.sh` 의 셀 실행 기계(109~166행),
파이프라인의 잠금·hold·trap, `src/content.config.ts`

---

## 6. frontmatter 스키마 — 어기면 빌드가 깨진다

`src/content.config.ts` 기준.

필수 3: `title`(string), `description`(string), `pubDate`(Date coerce)
선택: `updatedDate`, `heroImage`(Astro `image()`, **상대경로** `../../../assets/blog/<slug>/hero.png`),
`tags[]`, `relatedPosts[]`, `noindex`, `draft`, `faq[{question,answer}]`

```yaml
relatedPosts:
  - slug: <string>            # 필수
    score: 0.91               # 필수, 0~1 강제
    reason:                   # 필수, ko/ja/en/zh 전부 필수
      ko: "..." / ja: "..." / en: "..." / zh: "..."
```

**`reason` 은 4언어 전부 필수다. 하나라도 빠지면 빌드가 깨진다.**

---

## 7. 엔진 역할 원칙

**claude 는 지시와 판단, agy gemini-3.7-flash 는 손발.**
무엇을 왜 하는지는 비싼 쪽이 정하고, 손이 많이 가는 실행은 싸고 빠른 쪽이 한다.

| 단계 | 엔진 |
|---|---|
| 주제 선정·브리프·게이트·발행 | claude opus (effort high~xhigh) |
| 집필 | **fable** → 실패 시 claude opus xhigh |
| 편집·1차 리뷰 | 집필과 다른 모델 |
| 랩 셀 실행 | **bash** (에이전트 아님) |
| 랩 판정 | agy gemini-3.7-flash-medium |

집필에 낮은 추론량을 쓰는 이유: 추론량을 올릴수록 산문이 균일해지고 그 균일함이
AI 문체로 읽힌다. 2026-08-15 ko A/B 측정 — 프롬프트 고정하고 codex effort 를
max→high 로만 바꿨을 때 설명성 괄호 18→8, 유보 4→2, 소요 18분→6분.

**집필과 편집·리뷰는 항상 다른 모델이 맡는다.** 모델은 자기 문장을 지나쳐 읽는다.

---

## 8. 검증 절차

```bash
# 1. 문법
bash -n scripts/*.sh
node --check scripts/*.mjs
/opt/anaconda3/bin/python3 -c "import ast;ast.parse(open('scripts/render-hero.py').read())"

# 2. 개명 잔여 확인
grep -rn "fact-core\|FACT_CORE" scripts/ | wc -l      # 0 이어야 한다

# 3. 수집·검증 단독
bash scripts/scout.sh web > data/scout/$(date +%F)/harvest.json
bash scripts/verify-urls.sh data/scout/$(date +%F)/harvest.json
#   → X 항목이 points_to 없이 살아남지 않는지 확인
node scripts/backlog-merge.mjs data/scout/$(date +%F)/harvest.verified.json --dry

# 4. 주제 선정 — 셸 재계산과 모델 답이 일치하는지, 불일치 시 exit 1 하는지

# 5. ko 한 언어만 집필 후 확인
#   - 본문에 콜론이 자유롭게 쓰이는지        (금지 해제 확인)
#   - 2,200~2,700 단어
#   - ## 참고 자료 로 끝나는지
#   - 미검증 고지 문단이 없는지
#   - 1인칭 실행 동사가 전부 tested[] 에 매핑되는지

# 6. 이미지 각 단 독립 실행. 특히 grok 티어 프로브와 JPG→PNG

# 7. 게이트와 빌드
npm run validate:publishing
npm run build

# 8. 전체 1회 완주 후
curl -sL -o /dev/null -w '%{http_code}\n' https://www.jangwook.net/ko/blog/ko/<slug>/
curl -sL https://www.jangwook.net/ko/blog/ko/<slug>/ | grep -o 'og:image[^>]*'
#   → og:image 가 사이트 기본값 og-home.jpg 가 아니라 이 글의 히어로인지
```

---

## 9. 참조 자료

**목표 형식 6편** (전부 `src/content/blog/ko/`)
- `amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026` — 대표. 2,673단어 H2 8
- `openai-codex-api-release-vs-claude-code-comparison-may-2026` — 2,542단어 H2 6
- `google-io-2026-antigravity-2-agent-platform-analysis` — 2,275단어 H2 10
- `anthropic-claude-opus-4-7-managed-agents-2026` — 2,377단어 H2 10
- `claude-fable-5-mythos-public-api-developer-analysis-2026` — 2,612단어 H2 9
- `claude-code-masterclass-series-1-prompt-to-agent` — 실제로는 레인 A

**주의**: 이 6편은 현행 문체 계약보다 앞선다. `---` 섹션 구분선과 4언어 공유 H2
순서는 지금 빌드를 깬다. **뼈대만 가져오고 조판은 현행 규칙을 따른다.**

**문체 리서치 원자료**: `docs/writing-research/2026-08-15/`
(general / ko / ja / en / zh / colon-typography / structure-signals / topic-landscape)

**python**: google.genai 와 matplotlib 를 둘 다 가진 인터프리터는
`/opt/anaconda3/bin/python3` 하나뿐이다. PATH 기본 `python3` 는
`.venv-vllm-metal` 이라 anaconda 를 가린다. 절대경로로 고정할 것.

---

## 10. 알려진 함정

- **h2-independence 실패율 상승 가능성.** 9블록 메뉴는 네 언어가 같은 순서로
  수렴할 확률을 올린다. 본보기에 "다른 언어와 겹치지 않게"를 박고 현행 격리를
  유지한다. 그래도 잦으면 브리프가 언어별 시작 블록을 지정하는 방식을 추가한다.
- **agy 150KB 임계치는 추정이다.** 첫 5회 실측으로 재보정한다.
- **grok 경로 파싱은 문서화되지 않은 포맷에 기댄다.** 두 회수 경로를 두는 이유이고
  그래도 깨질 수 있다. S4 실패는 비치명이며 S5 로 넘어간다.
- **408건 백로그의 옛 항목은 `source` 가 빈약하다.** 점수에 이미 반영했다.
- **`--redo` 는 `data/` 상태를 공유한다.** 수동 실행 시각을 15:23 과 겹치지 않게.
- **`similarity.js` 의 `jaccardSimilarity` 는 배열을 받는다.** Set 을 넘기면
  `setA.filter is not a function` 이 난다.
- **Fable 은 사용량 한도에서 종료코드 0 을 준다.** 산출물 부재로만 잡힌다.

---

# 부록 A. 새 집필 프롬프트 완성본 (ko)

**이것을 그대로 `scripts/prompts/daily-post-lang-ko.md` 에 넣는다.**
ja·en·zh 는 이 구조를 그 언어로 옮기되, 아래 "언어별로 갈리는 것"만 바꾼다.

지어내지 말고 이 본문을 쓸 것. 이번 실패의 원인이 프롬프트를 매번 새로 쓰면서
제약이 40개까지 불어난 것이었다.

```markdown
역할: 김장욱이다. 일본에 사는 웹 개발자가, 요즘 벌어진 일 하나를 놓고 자기 판단을
쓴다. 읽는 사람은 이걸 읽고 무언가를 결정한다. 개발자만이 아니다. 기획자, 팀장,
경영 쪽도 처음부터 끝까지 읽을 수 있어야 한다.

산출물: `src/content/blog/ko/{{SLUG}}.md` 하나만. frontmatter + 본문.

읽을 것 (이 순서):
1. `docs/persona-kim-jangwook.md`
2. `scripts/prompts/models/column-model-ko.md`  ← 본보기다. 반드시 연다
3. `data/column-brief.md`
4. `scripts/prompts/voice-anti-ai.md`

본보기의 호흡을 빌린다. 도입 두 단락, 본문 여섯에서 여덟 블록, H2 없는 마무리
세 박자. 그 글이 어떻게 입장을 잡고 어떻게 끝내는지를 본다.

## 잠긴 것과 자유로운 것

브리프의 `## LOCKED` 블록에 있는 숫자·인용·날짜·출처만 잠겨 있다.
그 밖은 전부 네 몫이다.

맥락을 넓히고, 비교를 만들고, 비유를 하나 쓰고, 독자의 상황을 상정해도 된다.
업계에서 무슨 일이 있었는지 아는 것을 써도 된다. 이 도구가 왜 지금 나왔는지,
비슷한 시도가 전에 어떻게 됐는지, 네 판단으로는 어디로 갈 것 같은지 — 다 써라.

안 해본 것을 해봤다고 쓰지만 않으면 된다.

`## OPEN` 블록은 재료지 대본이 아니다. 거기 적힌 순서대로 옮겨 적지 마라.

## 골격

아홉 중 여섯에서 여덟을 고른다. 순서는 네가 정한다.
넷 이하면 얕고, 아홉을 다 쓰면 목차가 된다.
다른 언어와 순서가 겹치지 않게 고른다.

사실정리 / 메커니즘·구조 / 숫자검증 / 비용 / 비교축 /
**명시적 반대(한 절 통째로, 필수)** / 실행가능성 / 누구에게 맞나 / 한계

분량 2,200~2,700단어, H2 6~10개.

## 쓰기

- 첫 단락은 날짜가 박힌 사건이나 실제로 들은 질문으로 연다.
- 둘째 단락에서 결론을 먼저 준다. 뒤를 읽을 이유를 만드는 것이지 요약이 아니다.
- 안 해본 것을 고백하는 문단은 쓰지 않는다. "직접 못 써봤다", "샌드박스를 못
  돌렸다" 같은 자기 고지는 매번 붙으면 그 자체로 템플릿이 된다.
- LOCKED 밖 숫자·인용·날짜를 만들지 않는다.
- 인용 블록 바로 아래에 출처 링크를 붙인다. `> — [문서 이름](URL)` 한 줄이면 된다.
- 한 절을 통째로 브리프의 `counter` 에 쓴다. 약하게 요약해 쓰러뜨리지 않는다.
  그 반대가 옳은 범위를 인정하고, 그럼에도 왜 네 판단이 서는지 쓴다.
- 균형으로 닫지 않는다. 한쪽을 고르고, 그 선택이 틀릴 조건을 한 줄 적는다.
- 마지막 절을 요약·교훈·`반드시 ~해야 한다`로 닫지 않는다. 마지막 문장은
  주제를 넘는 관찰이다.
- 괄호로 용어를 풀어 쓰는 것은 글 전체에서 세 개까지. 나머지는 쉬운 말로 바꾸거나
  하는 일을 문장 안에서 보여준다.
- 연결어미 뒤에 쉼표를 찍지 않는다. `하지만,` `~하고,` `~하면서,` 전부.
- H2는 이 한국어 글만의 것. 다른 언어 목차를 옮기지 않는다.
- `relatedPosts` 의 `reason.ko`·`reason.ja`·`reason.en`·`reason.zh` 는 각각 그
  언어로 쓴다.
- 마지막 H2는 `## 참고 자료`. LOCKED `sources[]` 번호 순서 그대로 링크 목록을 낸다.
- 다른 언어 폴더를 열지 않는다.

다 쓰면 소리 내어 읽는다. 입으로 안 나오는 문장은 고친다.

질문하지 않는다.
```

## 언어별로 갈리는 것

| | ko | ja | en | zh |
|---|---|---|---|---|
| 문체 | 해라체 하나로 | だ体, 敬体와 섞지 않음 | 1인칭, 축약형 섞어서 | 书面为主, 夹短句 |
| 고유 금지 | 연결어미 뒤 쉼표 | 体言止め 연타, 영어 명사열 잔존 | — | 虚化动词(进行/开展/予以), 被字句 |
| 마지막 H2 | `## 참고 자료` | `## 参考資料` | `## References` | `## 参考资料` |
| 본보기 | `models/column-model-ko.md` | `-ja.md` | `-en.md` | `-zh.md` |

**넷 다 공통으로 지킬 것**: 잠금 범위는 LOCKED 뿐. 고지 문단 없음. 콜론 자유.
명시적 반대 한 절. 균형으로 안 닫음. 2,200~2,700단어.

---

# 부록 B. polish 프롬프트에 넘길 규칙

집필 프롬프트에서 뺀 것들이다. `daily-post-polish-{lang}.md` 의 점검 목록에 넣는다.
전부 "발견하면 고치는" 규칙이라 편집자의 일이다.

ko 기준. 다른 언어는 그 언어의 대응 항목으로.

```
수행·진행·실시·처리·`~를 통해` → 구체 동사로
주어를 사람이나 팀으로. `이 글은 ~을 말한다`, `~되어지고 있다` 제거
문두의 또한/게다가/따라서 제거
한 개념에 한 단어. 반복 피하려고 개명하지 않기
한자어 옆에 손에 잡히는 고유어 동사
유보(`~것은 아니다`)가 한 절에 둘 이상이면 하나로
절 끝이 부정으로 닫히는 절이 연달아 오면 하나는 판단이나 다음 동작으로
근거 없는 형용: 강력한·혁신적·매우·상당히·핵심적
지시어가 가리키는 대상이 흐린 곳 → 실제 이름으로
피동 → 능동
같은 말을 다르게 반복한 문단 → 뒤엣것 삭제
고유명사 초출 외의 볼드 → 해제
절 사이 `---`, 헤딩의 이모지, 키보드에 없는 기호(`─ → ⚠`) 제거
```

**polish 가 절대 지우면 안 되는 것** (이미 들어 있음, 유지):
- 재현 명령·코드블록·측정 출력
- 저자가 남긴 실패·유보·모른다는 고백
- **인과를 설명하는 문단** — 이 글이 파는 것이 그 대목이다.
  "줄일 곳은 설명 문장"이라는 지침은 배경·정의·반복을 가리키는 말이지
  무엇이 무엇을 일으켰는지 푸는 문단이 아니다

**삭감 목표**: 2,200단어 아래로는 자르지 않는다. 이미 그 아래면 패턴만 고친다.

---

# 부록 C. 작업 순서 체크리스트

```
[x] gen-image-gemini.py --key-env
[x] scripts/palette.py
[x] chart-*.py → scripts/charts/archive/
[x] models/column-model-{ko,ja,en,zh}.md
[x] scripts/verify-urls.sh          (스모크 테스트 통과)
[x] scripts/backlog-merge.mjs       (dry-run 통과)
[x] WRITER=fable + opus 폴백 배선

[x] A-1  daily-post-lang-ko.md 재작성      ← 부록 A 를 그대로
[x] A-2  ja / en / zh 세 개 (부록 A 표 참조)
[x] A-3  daily-post-polish-{lang}.md 에 규칙 인수 + 바닥선 (언어별 실측 재보정)
[x] A-4  polish_lang() 에 단어 수 로그 (+ 글자수, 바닥선 WARN)

[x] B-1  daily-post-brief.md 신규 (LOCKED/OPEN 두 블록)
[x] B-2  fact-core → column-brief 전면 치환 (16파일 78건). grep 잔여 0 확인
[x] B-3  daily-post-core.md → daily-post-core-lab.md 개명 (+ 새 스키마)
[x] B-4  daily-post-refact.md 를 새 스키마로

[x] C-1  scripts/scout.sh (x·web 모드, 402 가드)
[x] C-2  data/priority-slugs.json + sunday-strategy SKILL 수정
[x] C-3  scripts/prompts/topic-pick.md
[x] C-4  파이프라인에 규칙 1 셸 재계산·대조 (scripts/check-forced-slug.py)

[ ] D-1  scripts/probe.sh (예산 1500s, 셀 3~6)
[ ] D-2  scripts/scout-and-probe.sh
[ ] D-3  lab-plan.md 를 topic-pick 종속으로
[x] D-4  seal-check 에 실행동사↔tested[] 매핑 검사  (A 와 함께 앞당김)

[ ] E-1  render-hero.py --repair
[ ] E-2  scripts/gen-image-grok.sh (센티넬·경로 파싱·JPG 변환)
[ ] E-3  gen-hero.sh 5단 확장 + hero_kind 기록
[ ] E-4  data/img-quota-agy.txt 회계
[ ] E-5  scripts/render-figure.py

[~] F-1  파이프라인 --lane a|b  (인자·프롬프트 선택만. 나머지는 C 이후)
[ ] F-2  daily-post 매일로 — **plist 가 아니라 life-manager 원장이다.**
         cutover(2026-08-18 14:43) 이후 plist 는 아무것도 몰지 않는다.
         `lm schedule set <job-id> <expr>` 를 먼저 만들 것. 마감 08-20
[ ] F-3  insight-gate 레인 B 판
[ ] F-4  validate-publishing 검사 3종 추가

[ ] 최종  §8 검증 절차 전체
```

**A·B·C 완료 (2026-08-18).** 다음은 D.

발행 빈도는 원장에서 되돌렸다 — `lm schedule set jangwook-net.daily-post "23 15 * * *"`.
C-5 의 `calculateSimilarity` 는 쓸 수 없다. 그 함수는 `categoryScores`·`difficulty` 를
요구하는데 주제 선정 시점에 그 값이 없다. `jaccardSimilarity` 로 갔다.

**A 를 먼저 한다.** 소유자 불만의 직접 원인이고, A만 끝나도 다음 글의 문체가
달라진다. B~F 는 그 뒤에 순서대로.
