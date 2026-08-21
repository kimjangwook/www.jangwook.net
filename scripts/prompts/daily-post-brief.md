목표: `data/column-brief.md` 하나만 쓴다. 첫 줄은 `slug: kebab-name` 또는 `SKIP: 이유`.

읽을 것 (이 순서):
1. `docs/persona-kim-jangwook.md`
2. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md`
   (여덟 기둥, 레인 정의, 금액·회사명 금지)
3. `data/topic-pick.md` — 오늘의 주제. **이 파일이 정본이다**
4. `data/topic-pick.md` 의 `sources[]` 에 있는 URL 들

`data/topic-pick.md` 가 없으면 `data/topic-backlog.json` 에서 직접 고른다.
`priority` 가 낮은(0 에 가까운) 미소비 항목 중 1차 출처 URL 이 붙어 있는 것.
이건 임시 경로다. 주제 선정이 `scripts/prompts/topic-pick.md` 로 넘어가면 사라진다.

## 이 파일이 하는 일

네 명의 집필자는 서로를 못 보고 이 파일만 본다. 그래서 이 파일은 두 가지를
동시에 해야 한다. **사실을 잠그고, 재료를 푼다.**

지금까지의 실패는 전부 이 둘을 안 나눈 데서 나왔다. 전부 잠그면 네 편이 같은
문장을 네 언어로 옮긴 것이 되고, 아무것도 안 잠그면 없는 숫자가 생긴다.

그래서 파일을 두 블록으로 물리적으로 나눈다.

- `## LOCKED` — **여기 밖으로 나가면 사실이 아니다.** 집필자는 이 안의 숫자·인용·
  날짜·출처만 쓸 수 있다.
- `## OPEN` — **여기는 재료다.** 집필자가 늘려도 되고, 순서를 바꿔도 되고,
  자기 판단으로 반대해도 된다.

## LOCKED 를 채우는 규칙

`sources[].n` 은 **안정된 참조 번호**다. 네 언어가 같은 번호를 쓰고 각 글의
`## 참고 자료` 가 이 순서 그대로 나온다. 언어마다 레퍼런스가 달라지는 사고를
번호로 막는다. 번호를 매긴 뒤에는 바꾸지 않는다.

`verified` 는 `true` 아니면 `unconfirmed` 다. `unconfirmed` 인 출처는 **인용에
쓸 수 없다.** 봇에 401·403 을 주는 사이트가 여기 들어온다. 배경으로는 쓰되
`quote` 를 달지 않는다.

`facts[].exact` 는 원문에 있는 그대로의 표현이나 수치다. 요약하지 않는다.
집필자가 이 칸만 보고도 원문을 대조할 수 있어야 한다.

`tested` 는 **오늘 실제로 돌린 것**만 적는다. 비어 있어도 된다. 비었다고 해서
글을 못 쓰는 것이 아니다. 안 돌렸으면 안 돌렸다고 비워 두는 것이 이 칸의 값이다.

`not_tested` 는 내부용이다. **본문에 노출할 의무가 없다.** 예전 스키마의
`failed:` 가 매 글에 변명 문단을 만들었다. 여기 적되 집필자에게 쓰라고 하지 않는다.

## OPEN 을 채우는 규칙

`thesis` 는 반박 가능해야 한다. 유능한 독자가 읽고 "아니, 그건 틀렸다"고 말할 수
있어야 한다. 아무도 반대할 수 없는 문장은 주장이 아니라 관찰이다.

- 관찰: `codex 는 루트에서 실행하면 중첩 AGENTS.md 를 읽지 않는다`
- 주장: `모노레포에서 규약을 디렉터리에 흩뿌리는 설계는 실패한다. 규약의 도달
  범위가 도구의 탐색 규칙에 묶여 있고, 그 규칙은 도구마다 다르며 문서가 약속한
  것보다 좁다`

`stance` 는 **조건부 양분**이다. 중립 금지. `A 인 팀에는 X, B 인 팀에는 Y` 의
모양으로 쓴다. "상황에 따라 다르다"는 입장이 아니다.

`counter` 는 이 주장에 대한 **가장 강한 반대**다. 약한 반대를 세워 쓰러뜨리는
것은 논증이 아니라 연출이다. 반대가 옳은 범위가 있으면 그 범위를 적는다.
집필자는 이것으로 한 절을 통째로 쓴다.

`mechanism` 은 가장 어려운 칸이고, 관찰과 통찰을 가르는 칸이다.
**무엇이 일어났는가가 아니라 무엇이 그것을 일으켰는가**를 적는다.

- 관찰: `codex 는 32,768 바이트에서 지시문을 자른다`
- mechanism: `codex 는 프로젝트 루트에서 cwd 까지 내려오며 각 디렉터리의 파일을
  합치고, 합계가 project_doc_max_bytes 에 닿는 순간 멈춘다. 그래서 잘리는 지점은
  파일 크기가 아니라 그 파일이 합쳐지는 순서에 달려 있다`

모르면 `unknown` 이라고 적는다. 지어낸 인과가 이 블로그에서 신뢰가 깨지는 자리다.

`axes` 는 비교축이다. 참조 6편이 전부 갖고 있다. 무엇과 무엇을 어떤 기준으로
견주는지 두세 줄.

`cost` 는 가격·쿼터·시간이다. 모르면 `unknown`. 지어내지 않는다.

`fits` 와 `does-not-fit` 은 **대칭 리스트**다. 한쪽만 길면 광고나 험담이 된다.

`beyond` 는 주제를 넘는 관찰 하나다. 집필자의 마지막 문장이 여기서 나온다.
요약도 교훈도 아니다.

## 형식

불릿과 값만. 산문 금지.

```
slug:
pubDate: YYYY-MM-DD
lane: b
backlog_slug:
hero: TODO
hero_kind: plate|illustration
related:
  - slug

## LOCKED            여기 밖으로 나가면 사실이 아니다
sources:
  - n: 1
    title:
    publisher:
    url:
    fetched_at: YYYY-MM-DD
    verified: true|unconfirmed
    quote: "축자 인용"        (있을 때만. unconfirmed 면 달지 않는다)
    quote_lang: en
facts:
  - claim:
    source_n: 1
    exact: "원문에 있는 그대로의 표현·수치"
timeline:
  - 2026-08-12 — 무슨 일 — source_n
tested:              오늘 실제로 돌린 것. 비어도 된다
  - command:
    result:
    env:
not_tested:          내부용. 본문 노출 의무 없음

## OPEN              여기는 재료다. 집필자가 늘려도 된다
thesis:              반박 가능한 한 문장
stance:              조건부 양분. A인 팀에는 X, B인 팀에는 Y (중립 금지)
counter:             가장 강한 반대, 그리고 그것이 옳은 범위
mechanism:           무엇이 그것을 일으켰나 (모르면 unknown)
em_problem_context:  현업(웹 리뉴얼 또는 CDP/DSR/회원/데이터 서비스)에서의 실제 문제와 아키텍처 고뇌
team_systematization: 최신 기술/AI를 2개 팀의 표준 프로세스·린터·게이트로 안착시키는 방법
executive_insight:   CEO/CTO 관점의 비즈니스 임팩트 (단위 비용 절감, 출시 속도, 컴플라이언스, 조직 확장성)
axes:                비교축
cost:                가격·쿼터·시간 (모르면 unknown)
fits:
does-not-fit:
reader:              누가 읽고 내일 무엇을 바꾸는가 (CTO/CEO/리드 엔지니어 관점)
beyond:              주제를 넘는 관찰 하나
open_questions:
```

`thesis`, `stance`, `counter` 가 비면 이 파일은 미완성이다. 채우지 못하겠으면
자료가 아직 논지를 못 받치는 것이다. 억지 주장을 세우지 말고
`SKIP: <slug> lacks a defensible thesis` 로 끝낸다.

`sources` 가 비어 있으면 `SKIP: no verified source` 로 끝낸다. 출처 없는 칼럼은
이 블로그가 쓰지 않는다.

`src/content/blog/` 아래에는 아무것도 쓰지 않는다.

질문하지 않는다.
