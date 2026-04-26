# Weekly Strategy Report

> 이 파일은 sunday-strategy 에이전트가 매주 자동 업데이트합니다.

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
