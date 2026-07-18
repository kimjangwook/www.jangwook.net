# jangwook 루프 운영 플레이북 (wbai 모델 이식, 2026-07-18)

> 30분 틱 루프의 절차서. wbai(ops/LOOP.md)의 설계 원칙을 계승하되 이 시스템의 조건에 맞게 변형:
> **① 메인 루프는 판단·위임만** — 실작업(리서치·집필·QA·개선)은 전부 백그라운드 에이전트. 토큰 폭발 방지가 제1 원칙.
> **② 배달은 launchd, 두뇌는 루프** — wbai와 달리 발신(X 12슬롯 리마인드·블로그 발행·클로징)은 launchd가 담당하므로 세션이 죽어도 배달은 끊기지 않는다. 루프는 그 위에서 소재 수집·품질 감시·보충·자기 개선을 돈다.
> **③ 페르소나 원천은 정본** — 모든 콘텐츠 에이전트는 `docs/persona-kim-jangwook.md`(4기둥+DNA)를 먼저 읽는다.

## 틱 절차 (매 30분)

```
1. Bash: node scripts/loop-tick.mjs        → 컴팩트 JSON 상태 출력
2. JSON 플래그에 따라 아래 매트릭스의 에이전트를 스폰 (해당 없으면 즉시 종료)
3. 에이전트 결과는 한 줄 요약만 수신. 상세 산출물은 에이전트가 직접 텔레그램 전송
   (claude-controller/sh/send-telegram.sh)
```

**토큰 규율 (메인 루프에서 금지)**: 글 전문 읽기, 웹 검색, 집필, 에이전트 트랜스크립트 읽기. 에이전트 반환은 한 줄.
**텔레그램 규율**: 라벨-본문 분리 금지(캡션 활용), 사이클당 에이전트별 메시지 상한 2건, 수정 재전송 시 "[정정판]" 명시.

## 트리거 매트릭스

| 트리거 (tick JSON) | 에이전트 | 산출물 | 전달 |
|---|---|---|---|
| `xqa_due` — 07:00 생성 후 첫 틱 | ① X 큐 QA | 당일 12본을 페르소나 정본·voice-guide 대조 비평: 톤 이탈·사실 오류·같은 유형 연속·AI티. 문제 본은 직접 재작성 | 수정 요약 텔레그램 |
| `catchup_due` — 08시/18시 이후 첫 틱 | ② 캐치업 스카우트 | 공식 소스 스캔(Search Central·web.dev·W3C/WAI·Chrome release·Anthropic/OpenAI 공식·MCP 블로그). 각 건에 "웹 개발/EM 관점에서 무엇이 바뀌나" 한 줄 통찰. 유효 건 → topic-backlog 후보 + X tip/news 소재 제안 | 텔레그램 브리프 (최대 5건) |
| `post_qa_due` — 15:23 발행 후 신규 블로그 커밋 감지 | ③ 발행 QA | 신규 글의 게이트 상태 + 페르소나 DNA 대조(솔직히·공식인용·in-media-res 도입·CTA) + 4언어 스팟체크. 결함은 직접 수정 커밋 | 판정 요약 텔레그램 |
| `queue_low` — 익일 X 소재 부족 (백로그 queued < 5) | ④ 백로그 보충 | 캐치업 산출물 + 최근 서비스 운영 데이터에서 토픽 3건 브리핑 수준으로 적재 | 적재 요약 |
| `review_due` — 23:30 이후 첫 틱 | ⑤ 자기 리뷰 | 최근 24h 산출물(발행 글·X 12본·클로징 커밋) 비평: 사실 오류, 페르소나 이탈, 반복 패턴, 4기둥 편중(①만 나오고 ②④가 실종 등). 교훈 → 이 파일 "운영 교훈" + 메모리 | 개선점 3줄 |
| `improve_due` — 수요일 첫 틱 (주 1) | ⑥ 웹 개선 | GEO/AIO/SEO/a11y 축 중 하나를 골라 사이트 실측 감사 1건 → 개선 커밋 → 글감이 되면 백로그 적재 (7월 캠페인 플레이북: 측정→수정→게이트) | 감사 요약 |
| `service_pulse_due` — 월요일 첫 틱 (주 1) | ⑦ 서비스 펄스 | 운영 서비스(jangwook.net·effloow·InsightForge·심해식당)의 헬스·지표 훑기. 이상 발견 시만 상세, 콘텐츠 소재(운영 실측 데이터) 후보 채집 | 한 줄/서비스 |
| `repo_changed` — HEAD 변화 감지 | (에이전트 불필요) | 병행 자동화 커밋 확인용 정보 플래그. 게이트 이상 시에만 ③ 스폰 | — |

## 에이전트 프롬프트 공통 헤더

```
작업 디렉토리 ~/Documents/workspace/www.jangwook.net (X 관련은 ~/Documents/workspace/web.effloow.com).
먼저 docs/persona-kim-jangwook.md를 읽고 4기둥·DNA·금지 목록을 장착할 것.
텔레그램: ~/Documents/workspace/claude-controller/sh/send-telegram.sh "텍스트".
빌드 검증 시 npm run validate:publishing && npm run build (게이트 10종 통과 필수).
최종 응답은 한 줄 요약만.
```

## 유형별 프롬프트 요점

**① X 큐 QA**: "web.effloow.com/contents/<오늘>/x/daily/post-1..12.md를 읽고 3중 대조 — (a) 페르소나 정본 5절 금지 목록 (b) voice-guide 문체(口語常体·태그≤1·계몽조 금지) (c) 믹스 규칙(같은 유형 2연속 금지·light에 사실 주장 금지). 위반 본은 파일을 직접 재작성. 반환: `수정 N건|사유 요약`"

**② 캐치업 스카우트**: "WebSearch/WebFetch로 [공식 소스 목록]의 최근 48h 발표를 수집. 각 건을 페르소나 4기둥 중 어디에 착지하는지 분류하고 '웹 개발자/EM에게 바뀌는 것' 한 줄 통찰을 붙여라. 뉴스 요약 봇 금지 — 통찰 없는 건은 버린다. 백로그 후보는 data/topic-backlog.json 형식(source에 브리핑 수준 상세)으로 제안만(적재는 ④). 텔레그램 브리프 전송."

**⑤ 자기 리뷰**: "최근 24h: 블로그 신규 글(git log), X 12본(sent/), 클로징 커밋을 읽고 비평 — 사실 오류·페르소나 DNA 이탈(2절 수치 감각으로)·4기둥 편중·AI티 재발. wbai 교훈 준용: 재생성 시 직전 리뷰 정정의 회귀 여부를 반드시 확인. 시스템 교훈은 ops/LOOP.md '운영 교훈' 최상단에 추가. 개선점 3줄 텔레그램."

## 상태 관리

- `ops/loop_state.json` (gitignore): last_xqa / last_catchup(am|pm) / last_post_qa / last_review / last_improve / last_service_pulse / last_head — 틱이 due 보고와 동시에 마킹.
- 루프 등록: `/loop 30m` (세션 내 유효). 세션 재시작 시 이 파일 기준으로 재등록.
- launchd 의존성: morning-daily-x(07:00)·x-reminders(12슬롯)·daily-post(15:23)·daily-closing(23:07)·sunday-strategy — 루프가 죽어도 이들은 돈다. 루프는 품질·소재·개선 레이어만 담당.

## 메모리 라우팅 (wbai 규칙의 이 시스템 판)

| 정보 유형 | 저장소 |
|---|---|
| 페르소나·보이스 (헌장) | `docs/persona-kim-jangwook.md` — 분기 재측정 외 수정 최소화 |
| 운영 교훈 (프로세스) | 이 파일 "운영 교훈" 섹션 (append-only, 최신 위) |
| 토픽·소재 (정형) | `data/topic-backlog.json` (source 필드 = 브리핑) |
| 품질 불변식 | `scripts/validate-*.mjs` (게이트 코드가 곧 문서) |
| 세션 간 컨텍스트 | Claude 메모리 (`project_*` 파일) |
| X 산출물 | web.effloow.com `contents/<ymd>/x/daily/` (게시 후 정리는 effloow 쪽 관행) |

## 자기 개선 회로

⑤ 리뷰의 교훈 → 이 파일 운영 교훈 → 다음 틱·에이전트가 로드 → 산출물 반영. 페르소나 차원의 이탈이 반복되면 정본을 고치지 말고 파이프라인 프롬프트를 고친다 (정본은 코퍼스 재측정으로만 갱신 — wbai의 "헌법 불변" 원칙 준용).

## 운영 교훈 (append-only, 최신이 위)

- 2026-07-18: 시스템 설계. wbai에서 이식한 검증된 규칙 3건을 초기 교훈으로 등재 — ① 재생성 에이전트는 직전 리뷰 정정 목록을 체크리스트로 재적용(회귀 방지) ② 시효성 소재("오늘/本日" 서술)는 큐 뒤에 넣지 말 것 — 지연되면 거짓이 된다 ③ 수치가 담긴 산출물은 전송 전 원본 데이터와 전건 대조.
