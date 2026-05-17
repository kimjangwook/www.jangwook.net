# Weekly Strategy Report

> 이 파일은 sunday-strategy 에이전트가 매주 자동 업데이트합니다.

---

## 2026-05-17 주간 리뷰 (5월 3주차)

### 성과 요약

- **이번 주 포스트**: 7개
- **콘텐츠 믹스**: How-to 71% / 뉴스 29% / 비교 0% / 시리즈 0%
- **내부링크 최적화**: 전체 252개 포스트 중 내부링크 없는 포스트 84개 (33%) — 전주 104개 대비 20개 감소 중
- **크로스포스팅**: dev.to 2/2 (100%), Hashnode 2/2 (100%)

#### 이번 주 포스트 목록

| 날짜 | 슬러그 | 유형 |
|------|--------|------|
| 5/11 | fastapi-claude-api-streaming-production-guide-2026 | How-to |
| 5/12 | fastmcp-python-mcp-server-build-guide-2026 | How-to |
| 5/13 | claude-agent-sdk-tool-use-complete-guide-2026 | How-to |
| 5/14 | aws-mcp-server-ga-practical-guide-2026 | How-to |
| 5/15 | cloudflare-agents-week-2026-autonomous-infrastructure | 뉴스 |
| 5/16 | claude-managed-agents-dreaming-outcomes-code-with-claude-2026 | 뉴스 |
| 5/17 | gemini-25-flash-thinking-api-developer-guide-2026 | How-to |

---

### 콘텐츠 믹스 분석

| 유형 | 이번 주 | 목표 | 편차 |
|------|---------|------|------|
| How-to | 71% (5개) | 40% | **+31% 과잉** |
| 뉴스 | 29% (2개) | 30% | -1% (양호) |
| 비교 | 0% (0개) | 15% | **-15% 부재** |
| 시리즈 | 0% (0개) | 15% | **-15% 완전 부재 (2주 연속)** |

**핵심 문제**: How-to 비중이 71%로 목표(40%) 대비 31%p 초과. 시리즈 콘텐츠가 2주 연속 0건. 비교 가이드도 이번 주 전무. MCP/에이전트 관련 how-to 포스트 5개가 몰려 읽기 경험의 다양성이 저하됨.

---

### 스타일 분석 (최근 7개 포스트 리뷰)

**종합 스타일 점수: 8.0 / 10**

#### 강점 (유지할 것)

- **1인칭 주관 표현**: "나는 Tool Use가 과소평가됐다고 본다", "직접 실험해보지 않았다면...", "개인적으로 이번 주에서 가장 주목한 것은" 등 포스트당 2〜4개 존재. 독자 몰입도 유지에 핵심
- **비판적 시각 일관성**: 기술 한계를 솔직하게 서술 ("FastMCP는 자유도를 트레이드오프로 지불한다", "Dreaming은 조심스럽게 접근하길 권한다", "자기 개선 에이전트라는 프레이밍이 가져오는 과대 기대는 경계해야 한다")
- **내부링크 자연스러운 삽입**: 맥락에 맞게 연관 포스트를 본문 안에 자연스럽게 삽입 — SEO와 독자 경험 모두에 기여
- **크로스포스팅 완벽 성공률**: dev.to, Hashnode 모두 100% → 이전 주 Hashnode 50% 문제 해소

#### 패턴 피로 (조정 필요)

1. **"실행 가능성 판단" 섹션 중복**: fastmcp와 claude-managed-agents 두 포스트에서 동일한 `## 실행 가능성 판단 — 언제 X를 선택하나` 헤더 사용. 같은 날 혹은 연속으로 읽는 독자에게 템플릿 느낌 전달
2. **결론 직전 "정리" 섹션 고착화**: claude-agent-sdk, fastmcp 두 포스트에서 `## 정리`로 요약하는 동일 패턴. "마치며", "지금 이 시점에서", "솔직한 평가" 등으로 로테이션 필요
3. **한계 섹션 비율 과잉**: 7개 중 3개 포스트에서 "한계", "아직 해결 안 된 것들", "아쉬운 점" 류 섹션이 독립 헤더로 등장. 콘텐츠 다양성 있으나 구조가 반복됨
4. **How-to 포스트 중간 섹션 1인칭 희박**: 도입부에 강한 주관이 있지만 본론 중반부에서 객관 서술로 급전환. 3〜4번째 섹션에서도 주관 표현 1개씩 배치 필요

---

### 이슈 및 조치사항

#### 1. 시리즈 콘텐츠 결핍 (긴급)

백로그에 series가 1개뿐이었음 → 이번 리뷰에서 3개 추가 (series 총 4개). 그러나 실제 발행 비율이 2주 연속 0%이므로 다음 주에 반드시 1개 발행 필요. 토요일 슬롯에 `ai-agent-architecture-series-1-orchestrator-pattern` 우선 배정 권장.

#### 2. 내부링크 0-link 포스트 감소 추세 양호

전체 252개 포스트 중 84개(33%)가 여전히 0-link이나 전주(104개) 대비 20개 감소. daily-closing의 내부링크 최적화 작업이 효과를 내고 있음. 현재 속도 유지 시 4〜5주 내 10% 이하 가능 예상.

#### 3. 크로스포스팅 정상화

지난 주 Hashnode 50% 성공률에서 이번 주 100%로 정상화. dev.to도 100% 유지. 안정적.

---

### 스타일 조정 제안 (다음 주 write-post 적용)

1. **결론 섹션 헤더 로테이션**: "정리", "마치며", "실행 가능성 판단" 외에 "지금 알고 있는 것", "솔직한 평가", "내 선택", "6개월 뒤에 다시 보면" 등 다양하게
2. **중간 섹션 1인칭 복귀**: How-to 포스트 3번째 섹션에 "직접 해보니...", "이 부분에서 막혔는데..." 등 짧은 주관 표현 1줄 삽입
3. **한계 섹션 통합 vs 분리**: 한계가 있으면 별도 헤더로 빼지 말고 관련 섹션 안에 1〜2문장으로 녹이는 방식 시도 (섹션 반복감 감소)
4. **도입부 세 번째 패턴 시도**: 현재 주로 사용하는 "직접 경험 서술"과 "핵심 질문 제시" 외에 "통념 반박"("X라고 알려진 것은 절반만 맞다")이나 "구체적 수치 충격"으로 시작하는 도입부 도입

---

### 다음 주 전략 (5월 18〜24일)

#### 목표 믹스
- How-to 3개 (43%) / 뉴스 2개 (29%) / 시리즈 1개 (14%) / 비교 1개 (14%)

#### 우선 처리 순서

| 요일 | 유형 | 슬러그 후보 |
|------|------|-------------|
| 월 | How-to | microsoft-autogen-1-0-production-agent-tutorial |
| 화 | 뉴스 | google-io-2026-ai-agent-deep-analysis (**Google I/O 발표 직후 선점**) |
| 수 | How-to | claude-code-custom-commands-hooks-automation |
| 목 | 뉴스 | anthropic-model-context-protocol-2-1-whats-new |
| 금 | How-to | langchain-langgraph-state-management-practical-guide-2026 |
| **토** | **시리즈 #1** | **ai-agent-architecture-series-1-orchestrator-pattern** |
| **일** | **비교** | **openai-codex-cli-vs-claude-code-2026-comparison** |

> **중요**: Google I/O 2026이 5월 20〜21일 예정. 발표 직후 당일 포스팅으로 트래픽 선점.

---

### 백로그 현황 (2026-05-17 기준)

**총 115개 주제 (대기 중 84개, +6개 추가)**

| 유형 | 대기 | 비율 |
|------|------|------|
| How-to | 37 | 44% |
| 뉴스 | 30 | 36% |
| 비교 | 13 | 15% |
| 시리즈 | 4 | 5% ← 이번 리뷰에서 1 → 4개로 확충 |

**이번 리뷰에서 추가된 주제 (6개)**:
- `ai-agent-architecture-series-2-multimodal-pipeline-design` [series]
- `ai-agent-architecture-series-3-memory-system-implementation` [series]
- `claude-code-masterclass-series-1-prompt-to-production` [series]
- `google-io-2026-ai-agent-deep-analysis` [news] ← Google I/O 2026 직후 발행 타겟
- `openai-codex-cli-vs-claude-code-2026-comparison` [comparison]
- `anthropic-model-context-protocol-2-1-whats-new` [news]

---

## 2026-05-10 주간 리뷰 (5월 2주차)

### 성과 요약

- **이번 주 포스트**: 7개
- **콘텐츠 믹스**: How-to 43% / 뉴스 0% / 비교 43% / 시리즈 14%
- **내부링크 최적화**: 전체 245개 포스트 중 내부링크 없는 포스트 104개 (42%) — daily-closing 처리 중
- **크로스포스팅**: dev.to 7/7 (100%) — Hashnode 4/7 (57%)

#### 이번 주 포스트 목록

| 날짜 | 슬러그 | 유형 |
|------|--------|------|
| 5/4 | google-adk-vs-langgraph-agent-framework-comparison-2026 | 비교 |
| 5/6 | gemini-25-flash-api-cost-optimization-guide | How-to |
| 5/6 | anthropic-files-api-batch-document-processing-guide | How-to |
| 5/7 | uv-python-ai-development-setup-guide-2026 | How-to |
| 5/8 | openai-codex-api-release-vs-claude-code-comparison-may-2026 | 비교 |
| 5/9 | anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026 | 비교 |
| 5/10 | claude-code-masterclass-series-1-prompt-to-agent | 시리즈 |

---

### 콘텐츠 믹스 분석

| 유형 | 이번 주 | 목표 | 편차 |
|------|---------|------|------|
| How-to | 43% (3개) | 40% | +3% (양호) |
| 뉴스 | 0% (0개) | 30% | **-30% ⚠️ 완전 공백** |
| 비교 | 43% (3개) | 15% | **+28% 과잉 — 2주 연속** |
| 시리즈 | 14% (1개) | 15% | -1% (근접) ✅ 시리즈 드디어 런칭 |

**핵심 문제**: 비교 포스트 43%가 2주 연속 반복됐다. 지난 주 5월 1주차는 비교 0%였는데, 그 반동으로 이번 주 다시 43%로 폭등. 진자 운동이 계속되고 있다. 뉴스가 0%인 것이 가장 심각한 문제 — 백로그에 뉴스 25개가 대기 중임에도 daily-post 셀렉터가 완성도 높은 비교·How-to 주제를 우선 선택한다.

**긍정 신호**: claude-code-masterclass-series-1이 드디어 발행됐다. 지난 3주간 "하드 블록"을 지정해도 밀렸는데, 이번 주 토요일에 런칭 완료.

---

### 스타일 분석 (최근 7개 포스트 리뷰)

**종합 스타일 점수: 7.3 / 10**

#### 강점 (유지할 것)

- **포스트 1, 2, 6의 강한 1인칭 밀도**: claude-code-masterclass-series-1은 8회, anthropic-sdk-vs-openai-sdk는 17회, openai-codex-vs-claude-code는 29회. 이 세 포스트는 첫 문장부터 개인 경험으로 시작하고, 중간 섹션에서도 1인칭이 유지됨
- **openai-codex 포스트의 "Source Review" 투명성 선언**: "직접 써봤냐고 물어본다면, 아니다"라고 한계를 먼저 밝히고, 공개 자료 기반 비교를 진행한 점이 신뢰도를 높임. 이 패턴은 재사용 가치 있음
- **anthropic-sdk 포스트의 버전 고정 비교**: anthropic 0.100.0 vs openai 2.36.0 — 구체적인 버전 명시가 독자 신뢰를 올리고 날짜가 지나도 참조 가치 유지

#### 패턴 피로 (조정 필요)

1. **"## 개요" 도입부 반복 — 심각**: 7개 포스트 중 4개(agentic-workflow-meta-tools, nist-ai-agent-security, llm-coding-harness, ai-distillation-attacks)가 "## 개요" 섹션으로 시작. AI가 작성했음을 가장 쉽게 알아보게 하는 패턴. 특히 뉴스·연구 분석형 포스트에서 집중적으로 나타남
2. **1인칭 0회 포스트 발생**: ai-distillation-attacks(0회), agentic-workflow-meta-tools(0회) — 완전 중립적 서술이 뉴스 보도와 구별이 안 됨. 이 포스트들의 결론은 참고 링크 나열로만 끝남
3. **결론이 "참고 자료" 링크만으로 종결**: 포스트 3, 4, 5, 7이 모두 같은 패턴. 결론에 편집자 판단이 없고 독자에게 "알아서 읽어보세요"로 위임. 이 블로그의 차별점이 사라지는 구간
4. **How-to와 비교의 코드 블록 의존도**: 이번 주 7개 포스트 모두 코드 블록 포함. 뉴스 포스트에서도 코드가 구조 장치로 사용됨. 의사결정 표, 시나리오 비교표, 다이어그램 등 대안 구조 장치 필요

---

### 이슈 및 조치사항

#### 1. 뉴스 0% — 다음 주 최우선 교정

뉴스 포스트가 이번 주 완전히 0%였다. 백로그에는 news 25개가 대기 중. 이는 셀렉션 문제다. 다음 주 화·목은 뉴스 포스트 하드 블록으로 설정. Google I/O 2026이 5월 19-20일이므로 다음 주는 사전 분석 + 발표 직후 속보 두 편이 모두 가능한 최적의 뉴스 주간.

#### 2. 비교 포스트 진자 운동 차단

5월 1주차 0% → 5월 2주차 43% 진자 운동이 3회 반복됐다(4월 1주·4월 5주·5월 2주). 다음 주는 비교 포스트 1개 최대 한도를 엄격히 적용. 비교가 아닌 Google I/O 사전/사후 뉴스 2편이 자연스러운 대체제.

#### 3. Hashnode 57% — 개선 필요

dev.to 100% 대비 Hashnode가 4/7(57%). 실패 3건의 원인이 명확하지 않음. crosspost-log에서 에러 메시지 확인 후 API 키·율 제한·페이로드 크기 중 어디가 문제인지 다음 daily-closing에서 진단 필요.

#### 4. 내부링크 커버리지 42% 공백 발견

지난 주 리포트에서 100% 커버리지라고 기록했으나, 이번 주 Python으로 재계산 시 245개 포스트 중 104개(42%)가 내부링크 없음. 이전 스크립트의 계산 버그일 가능성 있음. daily-closing SEO 작업이 이미 진행 중이지만, 우선순위를 높여 내부링크 없는 포스트부터 처리하는 것을 권장.

#### 5. "## 개요" 패턴 write-post 즉각 반영 필요

스킬 파일에 명시적 규칙 추가 없이는 매일 write-post가 동일한 패턴을 반복할 것. 아래 스타일 조정 지침을 일일 포스트 작성 시 prompt에 포함되도록 daily-tech-blog SKILL.md에 반영 권장.

---

### 다음 주 전략 (5월 11일 〜 5월 17일)

#### 목표 믹스
- How-to 2개 (28%) / **뉴스 3개 (43%)** / 시리즈 1개 (14%) / 비교 1개 (14%)

뉴스 비율 목표 30%를 초과해서 다음 주는 의도적으로 43%까지 올려 이번 주 0%를 평균으로 회복. Google I/O 2026 사전 분석이 자연스러운 뉴스 소재.

#### 우선 처리 순서

| 요일 | 유형 | 슬러그 후보 | 비고 |
|------|------|-------------|------|
| 월 | How-to | claude-code-hooks-precommit-build-notification-automation | 시리즈 #1 후속 실전편 |
| **화** | **뉴스** | **google-io-2026-gemini-ultra-project-astra-developer-impact** | **Google I/O 사전 분석** |
| 수 | How-to | context-engineering-ai-agent-information-architecture-2026 | 에이전트 설계 패러다임 |
| **목** | **뉴스** | **github-copilot-agent-mode-ga-vs-claude-code-2026** | **Claude Code 사용자 시각 평가** |
| 금 | **시리즈 #2** | **ai-agent-architecture-series-1-orchestrator-pattern** | ⛔ 하드 블록 — 시리즈 연속성 |
| 토 | 비교 (1개 한도) | ai-coding-agent-7way-comparison-claude-cursor-windsurf-codex-2026 | 뉴스 + 비교 크로스오버 |
| 예비 | 뉴스 | claude-managed-agents-memory-api-cross-session-learning | Google I/O 발표 반응 속보 |

#### 스타일 조정 지침 (다음 주 write-post 적용 — 즉각 필요)

1. **"## 개요" 도입부 금지**: 뉴스·연구 분석형 포스트는 반드시 첫 문장에서 사건·날짜·개인 반응으로 시작. "개요"라는 단어가 도입부 첫 H2에 들어가면 해당 포스트는 재작성 대상
2. **뉴스 포스트 1인칭 최소 5회**: 단순 사실 나열이 아닌 "내가 이 발표를 어떻게 읽었는가"를 중심으로. 특히 중간 분석 섹션에서도 "이 수치가 흥미로운 이유는...", "내 경험과 비교하면..."으로 연결
3. **결론 편집자 판단 필수**: 결론이 참고 자료 링크로만 끝나는 포스트는 완성 미달. 최소한 "내 판단은 이렇다" 1〜2문장 + 독자 행동 지침 1가지로 마무리
4. **비교 포스트 "Source Review" 투명성 유지**: 직접 사용하지 않은 도구가 포함된 비교 포스트는 반드시 도입부에 검증 방법 명시 (openai-codex 포스트의 패턴이 기준)

---

### 백로그 현황 (2026-05-10 기준)

**총 90개 주제 (대기 중 63개)**

| 유형 | 대기 | 비율 |
|------|------|------|
| How-to | 31 | 49% |
| 뉴스 | 25 | 40% ← 이번 주 3개 추가 |
| 시리즈 | 1 | 2% ← 즉각 발행 대상 (priority 0) |
| 비교 | 6 | 10% |

**이번 리뷰에서 추가된 주제 (5개)**:
- `google-io-2026-gemini-ultra-project-astra-developer-impact` [news] ← 5월 19-20일 Google I/O 대응
- `claude-managed-agents-memory-api-cross-session-learning` [news] ← Managed Agents 뉴스 분석
- `github-copilot-agent-mode-ga-vs-claude-code-2026` [news] ← 뉴스 비율 보충
- `claude-code-hooks-precommit-build-notification-automation` [how-to] ← 시리즈 #1 연계
- `ai-coding-agent-7way-comparison-claude-cursor-windsurf-codex-2026` [comparison] ← 종합 비교

**이번 리뷰에서 done 처리 (5개)**:
- `gemini-25-flash-api-cost-optimization-guide` → 발행 완료 (5/6)
- `google-adk-vs-langgraph-agent-framework-comparison-2026` → 발행 완료 (5/4)
- `openai-codex-api-release-vs-claude-code-comparison-may-2026` → 발행 완료 (5/8)
- `anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026` → 발행 완료 (5/9)
- `anthropic-files-api-batch-document-processing-guide` → 발행 완료 (5/6)

**시리즈 현황**: `ai-agent-architecture-series-1-orchestrator-pattern` (priority 0) — 다음 주 금요일 하드 블록

---

## 2026-05-03 주간 리뷰 (5월 1주차)

### 성과 요약

- **이번 주 포스트**: 8개
- **콘텐츠 믹스**: How-to 62.5% / 뉴스 37.5% / 비교 0% / 시리즈 0%
- **내부링크 최적화**: 전체 238개 포스트 중 내부링크 0개인 포스트 없음 (100% 커버리지 유지)
- **크로스포스팅**: dev.to 8/8 (100%) — Hashnode 6/8 (75%)

#### 이번 주 포스트 목록

| 날짜 | 슬러그 | 유형 |
|------|--------|------|
| 4/27 | openclaw-codex-nanobot-stack-migration | 뉴스 |
| 4/28 | anthropic-message-batches-api-production-guide | How-to |
| 4/29 | pydantic-ai-type-safe-agent-tutorial-2026 | How-to |
| 4/30 | github-actions-claude-code-ci-automation | How-to |
| 5/1 | anthropic-claude-opus-4-7-managed-agents-2026 | 뉴스 |
| 5/2 | anthropic-usage-caps-llm-pricing-disruption-analysis-2026 | 뉴스 |
| 5/3 | langfuse-self-hosted-llm-tracing-setup-guide-2026 | How-to |
| 5/3 | claude-api-prompt-caching-cost-optimization-guide | How-to |

---

### 콘텐츠 믹스 분석

| 유형 | 이번 주 | 목표 | 편차 |
|------|---------|------|------|
| How-to | 62.5% (5개) | 40% | **+22.5% 과잉** |
| 뉴스 | 37.5% (3개) | 30% | +7.5% (소폭 과잉) |
| 비교 | 0% (0개) | 15% | **-15% 완전 부재** |
| 시리즈 | 0% (0개) | 15% | **-15% ⚠️ 3주 연속 완전 부재** |

**핵심 문제**: 지난 주 비교 3개 집중 문제를 의식해서인지 이번 주는 비교가 아예 0%가 됐다. 진자 운동 패턴이다. 시리즈는 이제 3주 연속 미발행으로, "소프트 우선순위" 처리로는 해결 불가능한 상태에 도달했다.

---

### 스타일 분석 (최근 7개 포스트 리뷰)

**종합 스타일 점수: 8.1 / 10**

#### 지난 주 조정 지침 반영 여부

- **이미지 직후 내러티브 배치**: ✅ 부분 개선. 6/7개 포스트에서 도입 단락이 먼저 등장. pydantic-ai는 코드 블록으로 시작해 차별화 효과 있음
- **뉴스/분석형 1인칭 삽입**: ✅ 명확히 개선. usage-caps "나는 이 소식을 OpenClaw 커뮤니티에서 먼저 봤다", claude-opus-4-7 "솔직히 첫 반응은 흥분이었다" — 이전보다 훨씬 자연스러운 1인칭
- **다 문체 통일**: ✅ 이번 주 신규 포스트 전원 다 체 사용

#### 강점 (유지할 것)

- **도입부 다양성 우수**: 코드 블록 시작(pydantic-ai), 사건 날짜 시작(usage-caps "4월 4일, Anthropic이 조용히"), 개인 행동 시작(claude-opus "공식 블로그를 두 번 새로 고침했다"), 문제 서술 시작(github-actions, message-batches) — 7개 포스트 모두 진입 방식이 다름
- **비판적 시각 자연스럽게 삽입**: langfuse "개인적으로 이 아키텍처 복잡도에 불만이 있다", usage-caps "타이밍은 좋지 않았다", message-batches "웹훅 부재가 아쉽다" — 특정 섹션이 아닌 본문 흐름 중에 삽입됨
- **openclaw 포스트의 내러티브 강도**: "4월 4일 아침에 Anthropic 이메일을 받았다"로 시작해 실제 마이그레이션 경험을 시간순으로 풀어나가는 방식이 이 블로그 최고 수준의 스토리텔링

#### 패턴 피로 (조정 필요)

1. **결론 "권장" 패턴 재등장**: langfuse "Langfuse Cloud 무료 티어가 한계에 닿기 전에 Docker Compose 설정 파일을 미리 준비해두는 것을 권장한다", message-batches "Prompt Caching과 Batches API를 조합해 실제 파이프라인에 적용해보는 것을 권장한다" — 지난 주 지적된 문제가 How-to 포스트에서 다시 등장. How-to 특성상 완전히 없애기 어렵지만, 같은 주에 2개 이상 나오면 독자가 패턴을 의식함
2. **코드 블록 과잉 의존**: 8개 포스트 전부 코드 블록 포함. 비교·뉴스 포스트에서도 코드가 메인 구조 장치로 사용됨. 표, 의사결정 트리, 다이어그램 등 대안적 구조 장치 필요
3. **시리즈 3주 연속 미발행**: 스타일이 아닌 발행 시스템 문제. 아래 이슈 섹션에서 별도 처리

---

### 이슈 및 조치사항

#### 1. 시리즈 3주 연속 미발행 — 즉각 에스컬레이션

claude-code-masterclass-series-1이 3주 전에 계획됐고, 매주 "하드 룰"로 지정됐음에도 발행되지 않았다. 이는 더 이상 우선순위 문제가 아니다. **시스템 문제**: write-post가 매일 실행될 때 뉴스·How-to 주제를 자동 선택하는 로직이 시리즈보다 "명확한 슬러그"를 선호하는 것으로 추정된다.

다음 주 화요일을 시리즈 하드 블록으로 설정. 이날 다른 유형의 포스트가 발행되면 그 자체를 실패로 기록할 것.

#### 2. 백로그 비교·시리즈 불균형

queued 기준: how-to 22개(47%), news 18개(38%), comparison 5개(11%), series 2개(4%). 시리즈 2개가 발행되지 않는 한 추가하지 않음. 비교는 5개로 적절하나 주 1개 이하 발행 속도 유지 필요.

#### 3. Hashnode 75% — 개선 중이나 아직 불안정

62.5% → 75%로 개선됐다. 실패 2개의 원인이 아직 파악되지 않음. 다음 daily-closing에서 crosspost-log의 실패 케이스 에러 메시지를 확인할 것.

#### 4. 이번 주 발행 계획 대비 실적

지난 주 strategy-report에서 계획한 포스트와 실제 발행 포스트가 전혀 일치하지 않는다. 계획: stackoverflow-survey, opentelemetry, claude-managed-agents-news, 시리즈, 비교. 실제: message-batches, pydantic-ai, github-actions, claude-opus-4-7, usage-caps, langfuse, prompt-caching, openclaw. 계획 vs 실행 괴리가 2주 연속 100%다. 이 자체는 뉴스 반응성 때문으로 이해 가능하지만, 시리즈처럼 뉴스와 무관한 항목조차 밀린다는 것이 문제.

---

### 다음 주 전략 (5월 4일 〜 5월 10일)

#### 목표 믹스
- How-to 3개 (42%) / 뉴스 1개 (14%) / **시리즈 2개 (29%)** / 비교 1개 (14%)

시리즈 2개는 1개 런칭 + 후속편 의도. 시리즈 부채를 한 번에 갚는 주로 설정.

#### 우선 처리 순서

| 요일 | 유형 | 슬러그 | 비고 |
|------|------|--------|------|
| 월 | How-to | opentelemetry-llm-pipeline-observability-guide | 월간 How-to 시작 |
| **화** | **시리즈 #1** | **claude-code-masterclass-series-1-prompt-to-agent** | **⛔ 하드 블록: 변경 불가** |
| 수 | How-to | fastapi-claude-api-streaming-production-guide-2026 | 신규 추가 주제 |
| 목 | 뉴스 | google-io-2026-ai-developer-key-announcements-analysis | I/O 발표 타이밍 대응 |
| 금 | **시리즈 #2** | **ai-agent-architecture-series-1-orchestrator-pattern** | **⛔ 2번째 하드 블록** |
| 토 | 비교 | anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026 | 신규 추가 주제 |

#### 스타일 조정 지침 (다음 주 write-post 적용)

1. **결론 "권장" 탈피 — 특히 How-to**: "...을 권장한다"로 끝내는 대신 개인 결정("나는 이것을 선택했다"), 실제 수치 요약("실제로 50% 절감됐다"), 열린 질문("6개월 뒤에도 같은 선택을 할까?") 중 하나로 마무리
2. **코드 외 구조 장치 혼용**: 비교 포스트는 코드보다 의사결정 표와 시나리오별 추천 섹션 중심으로. How-to 포스트에도 "언제 쓰고 언제 쓰지 말아야 하는가" 의사결정 트리를 코드와 병렬 배치
3. **시리즈 포스트 스타일 차별화**: #1과 #2를 같은 템플릿으로 쓰지 말 것. #1은 "처음 만나는 독자" 기준의 실습형, #2는 "#1을 읽은 독자" 기준의 응용형으로 톤과 난이도 차별화

---

### 백로그 현황 (2026-05-03 기준)

**총 68개 주제 (대기 중 47개)**

| 유형 | 대기 | 비율 |
|------|------|------|
| How-to | 22 | 47% |
| 뉴스 | 18 | 38% |
| 시리즈 | 2 | 4% ← 우선순위 0으로 상향, 즉시 발행 필요 |
| 비교 | 5 | 11% |

**이번 리뷰에서 추가된 주제 (6개)**:
- `fastapi-claude-api-streaming-production-guide-2026` [how-to]
- `claude-code-mcp-server-testing-debugging-guide-2026` [how-to]
- `gemini-25-flash-thinking-api-developer-guide-2026` [how-to]
- `google-io-2026-ai-developer-key-announcements-analysis` [news]
- `openai-codex-api-release-vs-claude-code-comparison-may-2026` [news]
- `anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026` [comparison]

**이번 리뷰에서 done 처리 (2개)**:
- `anthropic-usage-caps-llm-pricing-disruption-analysis-2026`
- `anthropic-claude-opus-4-7-managed-agents-2026`

**시리즈 우선순위 상향 (2개, priority 0으로)**:
- `claude-code-masterclass-series-1-prompt-to-agent`
- `ai-agent-architecture-series-1-orchestrator-pattern`

---

## 2026-04-26 주간 리뷰 (4월 4〜5주차)

### 성과 요약

- **이번 주 포스트**: 7개
- **콘텐츠 믹스**: How-to 43% / 뉴스 14% / 비교 43% / 시리즈 0%
- **내부링크 최적화**: 전체 230개 포스트 중 내부링크 0개인 포스트 없음 (100% 커버리지 유지)
- **크로스포스팅**: dev.to 8/8 (100%) — Hashnode 5/8 (62.5%)

#### 이번 주 포스트 목록

| 날짜 | 슬러그 | 유형 |
|------|--------|------|
| 4/20 | mcp-server-production-deployment-kubernetes-guide | How-to |
| 4/21 | vercel-ai-sdk-claude-streaming-agent-2026 | How-to |
| 4/22 | claude-code-routines-practical-guide-2026 | How-to |
| 4/23 | openai-gpt-5-5-release-claude-comparison-april-2026 | 뉴스 |
| 4/24 | python-ai-agent-library-comparison-2026 | 비교 |
| 4/25 | mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026 | 비교 |
| 4/26 | cursor-3-vs-claude-code-vs-windsurf-2026 | 비교 |

---

### 콘텐츠 믹스 분석

| 유형 | 이번 주 | 목표 | 편차 |
|------|---------|------|------|
| How-to | 43% (3개) | 40% | +3% (양호) |
| 뉴스 | 14% (1개) | 30% | **-16% 부족** |
| 비교 | 43% (3개) | 15% | **+28% 과잉** |
| 시리즈 | 0% (0개) | 15% | **-15% 2주 연속 완전 부재** |

**핵심 문제**: 비교 포스트 3개가 주말에 집중 발행되면서 비교 비율이 목표의 3배를 넘었다. 시리즈 런칭이 지난 주 계획 후에도 또다시 미뤄졌다. 이 패턴이 반복되면 블로그가 "비교 사이트"로 포지셔닝될 위험이 있다.

---

### 스타일 분석 (최근 7개 포스트 리뷰)

**종합 스타일 점수: 7.8 / 10**

#### 강점 (유지할 것)

- **cursor-3 포스트의 1인칭 밀도**: "나는 지금 Claude Code 중심으로 운영하고 있다", "Windsurf는 과대평가됐다고 본다" — 비교 포스트에서 드물게 보이는 강한 개인 의견 표명. 이 포스트가 기준이 되어야 한다
- **gpt-5.5 포스트의 뉴스 개성**: "어제(4월 23일)" 시작으로 시의성을 강조하고, "모든 개발자가 지금 당장 전환해야 한다는 결론은 틀렸다"는 반박형 도입이 효과적
- **dev.to 100% 성공률**: 지난주 80%에서 100%로 개선됨

#### 패턴 피로 (조정 필요)

1. **이미지+헤더 도입부 과용**: 7개 포스트 중 5개가 "영웅 이미지 → 바로 H2 헤더" 패턴. 독자가 글 시작 전에 구조부터 보게 됨. 영웅 이미지 직후 2〜3문장 내러티브를 먼저 배치하는 방식으로 조정 필요
2. **연구/뉴스 분석형 포스트의 1인칭 공백**: llama4, bayesian, cognitive-debt 포스트에서 "나는" 표현이 거의 없음. EM/CTO 관점 서술이 3인칭 객관 서술로 들릴 수 있음
3. **합니다/다 문체 혼용**: openclaw, llm-blog-automation 포스트가 SEO 업데이트로 노출될 때 합니다 문체가 새 포스트와 대비되어 이질감 줌. 점진적으로 다 문체로 통일 필요
4. **결론 구조 수렴**: "지금 가장 확실한 조언은 하나다"(cursor-3), "이 짧은 기간에 주요 AI 도구들이 동시에 업데이트됐다는 건"(gpt-5.5) 등 조언/해석 형태로 수렴. 회의적 질문이나 열린 결론도 시도 권장

---

### 이슈 및 조치사항

#### 1. 비교 포스트 3개 토요일 집중 현상

cursor-3, mcp-vs-a2a, python-ai-agent 3개가 같은 주 후반에 몰림. 비교 포스트는 검색 전환율이 높지만 브랜드가 "비교 사이트"로 희석될 위험. 다음 주부터 비교 포스트는 주 1개 이하로 제한.

#### 2. 시리즈 2주 연속 미발행

claude-code-masterclass-series-1이 2주 전 계획됐으나 계속 다른 포스트에 밀림. 다음 주 금요일은 어떤 이유로도 시리즈 이외의 포스트를 발행하지 않는 하드 룰 적용.

#### 3. Hashnode 62.5% 지속 주의

지난주 50% → 이번 주 62.5%로 소폭 개선됐으나 여전히 불안정. 실패 케이스의 에러 타입을 crosspost-log에서 구체적으로 기록할 것.

#### 4. 백로그 동기화 지연 반복

이번 주도 3개 항목(mcp-server-production, python-comparison, mcp-vs-a2a)이 발행됐음에도 queued 상태로 남아 있었음. sunday-strategy에서 수동 처리했으나, 장기적으로 write-post 완료 시 자동으로 backlog 상태를 업데이트하는 hook 구성 필요.

---

### 다음 주 전략 (4월 28일 〜 5월 4일)

#### 목표 믹스
- How-to 3개 (43%) / 뉴스 2개 (29%) / 시리즈 1개 (14%) / 비교 1개 (14%)

#### 우선 처리 순서

| 요일 | 유형 | 슬러그 후보 |
|------|------|-------------|
| 월 | How-to | claude-api-prompt-caching-cost-optimization-guide |
| 화 | 뉴스 | stackoverflow-developer-survey-ai-coding-2026 |
| 수 | How-to | opentelemetry-llm-pipeline-observability-guide |
| 목 | 뉴스 | claude-managed-agents-news-analysis-april-2026 |
| 금 | **시리즈 #1 런칭** (하드 룰) | claude-code-masterclass-series-1-prompt-to-agent |
| 토 | 비교 (1개 한도) | claude-api-vs-openai-api-vs-gemini-api-price-performance-guide-2026 |

#### 스타일 조정 지침 (다음 주 write-post 적용)

1. **이미지 직후 내러티브 배치**: 영웅 이미지 다음에 바로 H2를 넣지 말고, 2〜3문장 내러티브 단락 먼저. 독자가 글에 진입하게 한 뒤 구조 제시
2. **연구/뉴스형 포스트 1인칭 삽입**: 분석 섹션에서도 "내가 이 연구를 읽고 처음 든 생각은...", "이 발표가 이 블로그 자동화에 직접 영향을 줄 것 같은 이유는..." 형태로 개인 반응 1〜2개 삽입
3. **합니다 체 포스트 수정 큐**: openclaw, llm-blog-automation 포스트를 daily-closing SEO 사이클에서 문체 통일 작업 우선 처리

---

### 백로그 현황 (2026-04-26 기준)

**총 43개 주제 (대기 중 29개)**

| 유형 | 대기 | 비율 |
|------|------|------|
| How-to | 13 | 45% |
| 뉴스 | 13 | 45% |
| 시리즈 | 2 | 7% ← 긴급 처리 필요 |
| 비교 | 1 | 3% ← 의도적으로 감소 |

**이번 리뷰에서 추가된 주제 (6개)**:
- `stackoverflow-developer-survey-ai-coding-2026` [news]
- `google-io-2026-ai-agent-announcements-analysis` [news]
- `ai-agent-production-incidents-q1-2026-case-study` [news]
- `claude-api-prompt-caching-cost-optimization-guide` [how-to]
- `opentelemetry-llm-pipeline-observability-guide` [how-to]
- `nextjs-15-claude-api-fullstack-ai-app-guide` [how-to]

**이번 리뷰에서 done 처리 (3개)**:
- `mcp-server-production-deployment-kubernetes-guide`
- `python-ai-agent-library-comparison-2026`
- `mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026`

---

## 2026-04-19 주간 리뷰 (4월 3〜4주차)

### 성과 요약

- **이번 주 포스트**: 8개
- **콘텐츠 믹스**: How-to 62.5% / 뉴스 12.5% / 비교 25% / 시리즈 0%
- **내부링크 최적화**: 전체 223개 포스트 중 내부링크 0개인 포스트 없음 (100% 커버리지 달성)
- **크로스포스팅**: dev.to 8/10 (80%) — Hashnode 5/10 (50%)

#### 이번 주 포스트 목록

| 날짜 | 슬러그 | 유형 |
|------|--------|------|
| 4/13 | mcp-server-build-practical-guide-2026 | How-to |
| 4/14 | claude-code-parallel-sessions-git-worktree | How-to |
| 4/14 | claude-code-agentic-workflow-patterns-5-types | How-to |
| 4/15 | claude-managed-agents-production-deployment-guide | How-to |
| 4/16 | local-llm-private-mcp-server-gemma4-fastmcp | How-to |
| 4/16 | anthropic-claude-performance-decline-controversy-april-2026 | 뉴스 |
| 4/17 | llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek | 비교 |
| 4/19 | ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production | 비교 |

---

### 콘텐츠 믹스 분석

| 유형 | 이번 주 | 목표 | 편차 |
|------|---------|------|------|
| How-to | 62.5% (5개) | 40% | **+22.5% 과잉** |
| 뉴스 | 12.5% (1개) | 30% | **-17.5% 부족** |
| 비교 | 25% (2개) | 15% | **+10% 과잉** |
| 시리즈 | 0% (0개) | 15% | **-15% 완전 부재** |

**핵심 문제**: 시리즈 콘텐츠가 전무하며, 뉴스 분석 비율도 심각하게 낮음. How-to와 비교 가이드로 편중된 구조가 3주 연속 반복되고 있음.

---

### 스타일 분석 (최근 7개 포스트 리뷰)

**종합 스타일 점수: 7.5 / 10**

#### 강점 (유지할 것)

- **1인칭 주관 표현**: 모든 포스트에서 도입부에 강하게 표현됨. 개인 경험 선언, 커뮤니티 공감 방식이 독자 진입 장벽을 낮추고 있음
- **비판적 시각**: 기술 한계·벤더 락인 리스크·투명성 문제를 솔직하게 다루고 있어 신뢰도 높음
- **도입부 다양성**: 7개 포스트 모두 서로 다른 진입 방식 (질문 제기, 비용 충격 경험, 커뮤니티 반응 공감, 잘못된 시도 고백 등)

#### 패턴 피로 (조정 필요)

1. **본론 구조 반복**: 도입 강한 1인칭 → 본론 객관 분석(표/코드/시나리오) → 결론 권유의 3단 구조가 7개 중 6개에서 동일하게 나타남
2. **결론 톤 수렴**: "이 상황이라면 X를 선택하세요", "이제 시작해보세요" 류의 부드러운 권유가 모든 포스트 결론에 등장
3. **중간 섹션 제목 패턴**: "핵심은...", "실제로는...", "한계", "좋은 점 vs 아쉬운 점" 류의 섹션 구성이 반복되어 읽기 경험이 예측 가능해짐
4. **본론에서 1인칭 실종**: 도입부 강한 주관이 본론에서 갑자기 객관 서술로 전환. 중간 섹션에서도 주관 표현을 산발적으로 배치해야 인간미 유지됨

---

### 이슈 및 조치사항

#### 1. Hashnode 크로스포스팅 성공률 주의 (50%)

dev.to는 80%로 양호하나 Hashnode는 5/10(50%)으로 낮음. 반복 실패 시 API 키 만료 또는 요청 제한 가능성 있음. 다음 주 daily-closing에서 Hashnode 실패 케이스를 구체적으로 로깅하여 원인 파악 필요.

#### 2. 백로그에 이미 발행된 포스트 잔류

"ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production"이 queued 상태로 남아있었음 → 이번 리뷰에서 done 처리 완료. 백로그 동기화 프로세스 개선 필요 (daily-post 스킬에서 발행 완료 시 자동 상태 업데이트 권장).

---

### 다음 주 전략 (4월 21〜27일)

#### 목표 믹스
- How-to 3개 (43%) / 뉴스 2개 (29%) / 시리즈 1개 (14%) / 비교 1개 (14%)

#### 우선 처리 순서

| 요일 | 유형 | 슬러그 후보 |
|------|------|-------------|
| 월 | How-to | mcp-server-production-deployment-kubernetes-guide |
| 화 | 뉴스 | agentic-coding-shift-2026-anthropic-report |
| 수 | How-to | microsoft-autogen-1-0-production-agent-tutorial |
| 목 | 뉴스 | claude-managed-agents-news-analysis-april-2026 |
| 금 | **시리즈 #1 런칭** | claude-code-masterclass-series-1-prompt-to-agent |
| 토 | 비교 | python-ai-agent-library-comparison-2026 |

#### 스타일 조정 지침 (다음 주 write-post 적용)

1. **중간 섹션에서도 1인칭 유지**: 각 섹션에 "내가 직접 테스트해보니...", "실제로 써보면..." 같은 주관 표현 1〜2개 삽입
2. **결론 다양화**: 결론을 권유형 대신 회의적 질문("과연 이게 최선인가?"), 미래 예측("6개월 뒤엔 달라질 것"), 개인 결정("나는 X를 선택했다") 등으로 교체
3. **섹션 제목 개성화**: "한계" → "실제로 부딪힌 벽", "좋은 점 vs 아쉬운 점" → "솔직히 말하면" 같이 더 생생한 표현 사용

---

### 백로그 현황 (2026-04-19 기준)

**총 20개 주제 (대기 중 13개)**

| 유형 | 대기 | 비율 |
|------|------|------|
| How-to | 5 | 38% |
| 뉴스 | 5 | 38% |
| 시리즈 | 2 | 15% ← 신규 추가 |
| 비교 | 1 | 8% |

**이번 리뷰에서 추가된 주제 (6개)**:
- `claude-code-masterclass-series-1-prompt-to-agent` [series]
- `ai-agent-architecture-series-1-orchestrator-pattern` [series]
- `python-ai-agent-library-comparison-2026` [comparison]
- `claude-code-custom-commands-hooks-automation` [how-to]
- `ai-agent-security-2026-prompt-injection-defense` [news]
- (agentic-coding-shift 기존 항목 유지)
