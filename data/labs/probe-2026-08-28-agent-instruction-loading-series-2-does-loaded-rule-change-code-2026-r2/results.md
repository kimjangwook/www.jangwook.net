# probe-2026-08-28-agent-instruction-loading-series-2-does-loaded-rule-change-code-2026-r2

question: LLM CLI를 전혀 실행하지 않고, '로드된 지시문이 생성 코드를 바꾼다'는 시리즈 2편의 전제를 (a) 벤더 문서의 로딩·잘림 선언과 (b) 하네스 연구 저장소의 공개 측정 방법론 대조만으로 검증할 수 있는가

## cells
- cell-spec-loading-guarantee — hits=0/3 usable=3/3 — exit 0,0,0 — agents.md 스펙은 3회 실행(종료 코드 모두 0)에서 'Agents automatically read the nearest file in the directory tree, so the closest one takes precedence'라는 최근접 파일 자동 로딩과 우선순위, 중첩 AGENTS.md 구성을 선언하는 문장 4개를 히트했으나, 로드된 규칙이 산출물 코드에 미치는 효과 선언은 히트 0으로 발견되지 않았다.
- cell-codex-doc-limit-override — hits=0/3 usable=3/3 — exit 0,0,0 — Codex 문서 점검 3회 실행(종료 코드 모두 0)에서 max_bytes 키, 32KiB 한도, override 파일, truncation 언급이 모두 false로 확인되어, 점검 항목 범위 내에서는 크기 한도·재정의·잘림 선언이 발견되지 않았다.
- cell-claude-doc-agents-md-support — hits=0/3 usable=3/3 — exit 0,0,0 — Claude Code 문서 점검 3회 실행(종료 코드 모두 0)에서 agents_md, claude_md, loading_timing, hierarchy 네 항목이 모두 true로, AGENTS.md 지원과 로딩 시점·계층 구조 선언이 확인되었다.
- cell-harness-repo-methodology — hits=0/3 usable=3/3 — exit 0,0,0 — 하네스 학습 저장소 점검 3회 실행(종료 코드 모두 0)에서 repeated_runs는 true로 태스크 반복 방법론이 문서화되어 있었으나, paper_pointfive와 paper_kailos 두 논문 표지 및 compliance_metric은 false로 기대한 논문 인용·준수율 지표는 확인되지 않았다.

## boundary
이 실험은 LLM CLI를 전혀 실행하지 않았으므로(대조 셀 cell-effect-claim-crosswalk는 0회 실행, exclusion 사유 'LLM CLI 의존 — P20 범위 제외') '로드된 지시문이 생성 코드를 바꾼다'는 인과 효과 그 자체는 검증하지 못하며, 4개 셀 모두 효과 주장 히트 0인 가운데 로딩 선언(있음)과 효과 선언(없음)의 어긋남을 문서·방법론 수준에서만 확인할 수 있다.

## quotes
- text: Agents automatically read the nearest file in the directory tree, so the closest one takes precedence and every subproject can ship tailored instructions.
  url: https://agents.md/
  bears_on: 로딩 스코프·우선순위 선언은 있으나 코드 효과 선언은 없음을 보여주는 스펙 문장
- text: Large monorepo? Use nested AGENTS.
  url: https://agents.md/
  bears_on: 로딩 스코프 선언(중첩 지시문 구성) 확인
- text: {"max_bytes_key":false,"limit_32kib":false,"override_file":false,"truncation_mentioned":false}
  url: https://platform.openai.com/docs/codex
  bears_on: Codex 문서에서 크기 한도·override·잘림 선언 미발견을 기록한 셀 결과
- text: {"agents_md":true,"claude_md":true,"loading_timing":true,"hierarchy":true}
  url: https://code.claude.com/docs/en/claude-code/memory
  bears_on: Claude Code 문서의 AGENTS.md 지원·로딩 시점·계층 선언 확인을 기록한 셀 결과
- text: {"paper_pointfive":false,"paper_kailos":false,"repeated_runs":true,"compliance_metric":false}
  url: https://raw.githubusercontent.com/
  bears_on: 하네스 저장소 README의 반복 실행 방법론 문서화와 준수율 지표·논문 인용 미확인을 기록한 셀 결과

## anomalies
기대와 달리 Codex 문서에서는 32KiB 한도·override·truncation 선언이 모두 미발견(3회 일관 false)이었고, 하네스 저장소에서는 repeated_runs만 true이고 기대했던 두 논문 인용 표지와 compliance_metric은 false로 나타나 방법론 문서화가 기대보다 불완전했다.

## missing cells
- cell-effect-claim-crosswalk — LLM CLI 의존 — P20 범위 제외
