# www.jangwook.net

Astro 5.14 기반의 다국어 기술 블로그 및 포트폴리오 사이트

## 🌟 프로젝트 개요

개발자를 위한 종합 블로그 플랫폼으로, AI 자동화, SEO 최적화, 다국어 콘텐츠 관리를 핵심으로 합니다.

**핵심 특징**:

- 🌏 **다국어 지원**: 한국어, 영어, 일본어
- ⚡ **Islands Architecture**: Astro 기반 초고속 정적 사이트
- 🤖 **AI 자동화**: Claude Code 에이전트 시스템으로 콘텐츠 생성 및 관리
- 📊 **데이터 기반**: Google Analytics MCP 통합 분석
- 🎨 **자동 이미지 생성**: Gemini API 기반 히어로 이미지 자동 생성
- 🔍 **SEO 최적화**: 사이트맵, RSS, Open Graph, Twitter Cards

## 🚀 빠른 시작

### 필수 환경

- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run astro check
```

## 📝 블로그 포스트 현황

**최신 포스트 날짜**: 2025-11-03
**총 포스트 수**: 30개 (한국어 기준)

### 공개된 포스트

1. **Notion+Backlog+Slack+Claude Code를 이용한 신규 프로젝트 매니징 표준화** (2025-11-03)
   - Notion, Backlog, Slack, Claude Code를 통합한 프로젝트 관리 표준화 방법론. 정해진 프로세스를 준수하면 성공적으로 프로젝트를 완수할 수 있는 실전 가이드
   - **핵심 내용**: 4가지 도구별 핵심 기능 (Notion 데이터베이스 아키텍처, Backlog 애자일 스프린트, Slack 실시간 협업, Claude Code AI 개발 지원), 통합 워크플로우 아키텍처 (프로젝트 생성부터 배포까지 자동화), 6단계 표준화 프로세스 (평가 → 설계 → 구현 → 파일럿 → 배포 → 개선), 실전 코드 예제 7개 (Notion API, Backlog Webhook, Slack Bot, MCP 서버 설정), 성공 지표 측정 (시간 절감 50%, 정시 배포율 80%), 프로젝트 실패 원인 11가지와 해결법, 도구 통합 자동화 시나리오 4가지, ROI 계산 및 비용 효율성 분석, 공통 실수 5가지와 성공 요인 4가지, 국제 표준 프레임워크 비교 (PMBOK, ISO 21500, PRINCE2, Agile)

2. **LLM을 활용한 프로젝트 매니저 업무 효율화: AI로 생산성 3배 높이기** (2025-11-01)

   - ChatGPT, Claude, Gemini 등 최신 LLM 도구를 활용하여 프로젝트 관리 업무를 자동화하고 생산성을 극대화하는 실전 가이드
   - **핵심 내용**: 3가지 주요 LLM 도구 비교 (ChatGPT, Claude, Gemini), 자동화 가능한 PM 일일 업무 4가지 (회의 관리 91% 시간 단축, 진행 상황 보고서 87.5% 단축, 이메일 응답 80% 단축, 실시간 리스크 모니터링), 4단계 구현 전략 (파일럿 → 워크플로우 통합 → 고급 자동화 → ROI 측정), 실전 코드 예제 (n8n 워크플로우, Gmail 자동화, BigQuery 리스크 분석), ROI 계산 (연간 78만원 비용으로 780만원 절감, 10,733% ROI), Asana Intelligence 성공 사례 (연간 14,976시간 절감), 베스트 프랙티스 (프롬프트 엔지니어링, 데이터 보안, 팀 교육), 피해야 할 함정 3가지 (과도한 의존, 컨텍스트 부족, 출력 검증 생략), 2025년 트렌드 (Agentic AI, 멀티모달, 실시간 협업), 첫 1주 액션 플랜

2. **Claude Code로 대규모 페이지 테스트 병렬 자동화하기** (2025-10-31)

   - Claude Code 에이전트 병렬 실행과 Playwright로 웹페이지 마이그레이션 테스트를 5-8배 빠르게 수행하는 실전 구현 가이드
   - **핵심 내용**: Claude Code 병렬 실행 아키텍처 (단일 메시지 다중 Task 호출), Playwright 병렬 설정 (fullyParallel + 8 workers), 5가지 테스트 카테고리 동시 실행 (Component, E2E, A11y, Performance, SEO), 실전 TypeScript 코드 예제 (Web Component/E2E/접근성/성능/SEO 테스트), CI/CD 통합 (GitHub Actions 매트릭스 전략), 성능 비교 (순차 41.7시간 → 병렬 5.2시간, 8배 개선), 자동 결과 분석 (data-analyst 에이전트), 베스트 프랙티스 (테스트 격리, 타임아웃 설정, 재시도 전략), 트러블슈팅 가이드

2. **LLM을 활용한 웹페이지 이행 작업의 표준화** (2025-10-30)

   - Claude Code와 웹 컴포넌트를 활용한 페이지 이행(migration) 자동화 완벽 가이드. HTML 추출부터 자동 테스트까지, 프로덕션 환경에서 검증된 표준화 프로세스
   - **핵심 내용**: LLM 기반 마이그레이션 자동화 (Google, Airbnb, Zalando 사례), 웹 컴포넌트 파츠 라이브러리 (Lit vs Stencil 벤치마크), CMS 템플릿 시스템 통합 (Astro/Hugo/11ty), 종합 테스트 자동화 (Playwright, axe-core, Lighthouse, AEO), 실전 워크플로우 (HTML 추출, DOM 분석, LLM 변환, 점진적 배포), 프로젝트 규모별 기술 스택 추천, 2024-2025 최신 벤치마크 및 베스트 프랙티스

2. **Claude Code Hook으로 구축하는 자동화 코드 리뷰 시스템** (2025-10-29)

   - Hook 기반 코딩 규칙 설정부터 CI/CD 통합까지, 실무에서 바로 적용 가능한 자동화 리뷰 프로세스 완전 가이드
   - **핵심 내용**: Hook 시스템 핵심 개념 (종료 코드 기반 제어, JSON 입력/출력), 다양한 Hook 타입 (pre/post-file-write, pre/post-commit), 코딩 규칙 자동 검증 (TypeScript 타입 체크, ESLint, Prettier), 종합 코드 리뷰 Hook (보안 스캔, 타입 체크, 린팅, 테스트 커버리지, 문서화), SOX/SOC2 감사 추적 자동화, PR 자동 검증 시스템, GitHub Actions/N8N/Telegram 통합, 3단계 점진적 도입 전략 (비파괴적 → 경고 → 블로킹), 조건부 실행 및 성능 최적화 (병렬 실행, 캐싱), SOLID 원칙 기반 Hook 설계, 엔터프라이즈급 통합 시스템 아키텍처

3. **BigQuery MCP 서버 구축 가이드: Dataset Prefix 필터링으로 효율적인 스키마 분석** (2025-10-28)

   - TypeScript로 구축하는 프로덕션급 BigQuery MCP 서버. Dataset prefix 필터링으로 조직화된 데이터 접근, AI 에이전트 기반 스키마 분석 및 쿼리 생성 자동화
   - **핵심 내용**: MCP 서버 아키텍처 (Hosts/Servers/Protocol), BigQuery Node.js 클라이언트 연동 (서비스 계정 인증, API 설정), Dataset Prefix 필터링 구현 (클라이언트 사이드 필터링, 와일드카드 패턴), 4개 MCP 도구 설계 (list_datasets, list_tables, get_schema, execute_query), 완전한 TypeScript 구현 (300+ 줄 프로덕션 코드), 보안 최적화 (읽기 전용 쿼리, 액세스 제어, 입력 검증, 레이트 리미팅), 성능 최적화 (캐싱 전략, 병렬 처리, 페이지네이션), Claude Desktop 통합 설정, 실전 테스트 시나리오

4. **Jules를 이용한 오토코딩: Google의 자율 AI 코딩 에이전트 완벽 가이드** (2025-10-27)

   - Google의 혁신적인 AI 코딩 에이전트 Jules로 GitHub 이슈를 자동으로 해결하고 PR을 생성하는 방법을 알아봅니다
   - **핵심 내용**: Jules 소개 (Gemini 2.5 Pro 기반 비동기 자율 에이전트), 5가지 핵심 기능 (GitHub 통합, VM 기반 실행, 투명한 계획, 자동 PR 생성, 전체 코드베이스 이해), 7단계 워크플로우 (Mermaid 다이어그램), 3가지 통합 방법 (Web, CLI, API), 4가지 실전 활용 사례 (버그 수정, 테스트 커버리지, 의존성 업데이트, 리팩토링), AI 코딩 도구 비교 (Jules vs Claude Code vs Copilot vs Cursor), 가격 정책 (Free 15 tasks, Pro $19.99, Ultra $124.99), 제한사항 및 베스트 프랙티스

5. **LangGraph 멀티 에이전트 시스템 완전 가이드** (2025-10-26)

   - 프로덕션 환경에서 입증된 LangGraph로 구축하는 엔터프라이즈급 멀티 에이전트 AI 시스템. LinkedIn, Uber, Replit이 실전 배포한 그래프 기반 오케스트레이션 프레임워크
   - **핵심 내용**: 그래프 기반 아키텍처 (노드와 엣지), 상태 관리 시스템 (Reducer, Checkpointing), 4가지 멀티 에이전트 패턴 (Supervisor, Hierarchical, Network, Swarm), 실전 Python 코드 예제 2개 (기본 시스템 + 계층적 시스템), 프로덕션 배포 가이드 (Persistence, Error Handling, Monitoring), CrewAI/AutoGen 프레임워크 비교, LinkedIn (Text-to-SQL), Uber (Code Generation), Replit (AI Copilot) 사례, LangGraph Platform GA, v1.0 예정 (2025년 10월)

6. **Playwright + AI: 자동화된 E2E 테스트 작성하기** (2025-10-25)

   - Playwright와 AI Codegen을 활용한 E2E 테스트 자동화. TypeScript 기반 실습, GitHub Actions 통합, 시각적 회귀 테스트까지 실무에서 바로 적용 가능한 완벽 가이드
   - **핵심 내용**: Playwright 핵심 개념 (Auto-wait, Multi-browser, Network Interception), AI 테스트 생성 (Codegen, MCP 통합), 실전 구현 가이드 (프로젝트 초기화, 설정 최적화, POM 패턴), 25+ TypeScript 코드 예제 (로그인, E-commerce, 파일 업로드, 드래그앤드롭, 무한 스크롤, WebSocket), GitHub Actions CI/CD 완전 자동화, 시각적 회귀 테스트 (스크린샷 비교, Percy 통합), 베스트 프랙티스 (Selector 전략, Async/Await, Test Isolation), 실무 시나리오 및 트러블슈팅

7. **SSR 방법론으로 블로그 재방문 의향 분석하기** (2025-10-24)

   - LLM 기반 Semantic Similarity Rating으로 225개 평가를 수행한 실험 결과와 통계 분석. ICC 0.83의 높은 신뢰도 검증 및 시각화 포함
   - **핵심 내용**: SSR 방법론 소개 (자유 응답 → 임베딩 → 코사인 유사도 → Softmax → 평점), 15 personas × 5 contents × 3 repetitions 실험 설계, OpenAI API 구현 (gpt-4o-mini + text-embedding-3-small), 평균 평점 3.078/5.0 (97.3%가 4점), Claude Code Best Practices 1위 (3.086), Test-Retest 신뢰도 분석 (ICC 0.833 = Good), 4가지 시각화 (히트맵, 분포, 박스플롯, 상관행렬), 비용 효율성 (평가당 $0.009, 95% 절감), 주요 인사이트 및 콘텐츠 전략 제안

8. **AI가 소비자 행동을 예측하는 새로운 방법: 의미론적 유사도 평가** (2025-10-23)

   - LLM을 활용한 합성 소비자 연구의 혁신, SSR 방법론으로 90% 신뢰도 달성
   - **핵심 내용**: 전통적 소비자 조사의 한계 (패널 편향, 높은 비용), SSR 3단계 프로세스 (텍스트 생성 → 의미론적 매핑 → 앵커 유사도 계산), 9,300개 실제 응답 대비 90% 신뢰도 & KS 유사도 >0.85, 정량적 평가 + 질적 피드백 동시 제공, 실전 활용 사례 (신제품 컨셉 테스트, A/B 테스트 시뮬레이션, 세그먼트 분석), 편향성 문제와 완화 방법, PyMC Labs 오픈소스 구현, 디지털 트윈 소비자 전망

9. **Claude Skills 완벽 가이드: 프로젝트 적용기와 실전 노하우** (2025-10-22)

   - Claude의 새로운 Agent Skills 기능 도입부터 실제 구현까지, 시행착오와 성과를 담은 실전 가이드. 폴더 기반 모듈화로 AI 에이전트를 전문화하는 방법
   - **핵심 내용**: Progressive Disclosure 3단계 정보 공개 시스템, SKILL.md 작성법, 실전 Blog Writing Skill 구현 (날짜 자동 계산, Frontmatter 검증, 슬러그 생성), 5가지 주요 시행착오 해결 (description 명확화, YAML 파싱, 스크립트 권한, 경로 오류, Skill 충돌), allowed-tools로 안전성 확보, 토큰 44% 절감 (18,000→10,000), 작업 시간 90% 단축, Git/Plugin을 통한 팀 공유 전략

10. **OpenAI AgentKit 완벽 가이드 2부: 실전 적용과 고급 패턴** (2025-10-21)

   - 엔터프라이즈급 멀티 에이전트 시스템 설계부터 프로덕션 배포까지, AgentKit 실전 마스터 가이드
   - **핵심 내용**: 3개 엔터프라이즈 아키텍처 패턴 (계층형 Manager-Worker, 이벤트 주도형, Graph 기반 LangGraph), 커스텀 MCP 서버 개발 (Slack 통합 전체 구현), 프로덕션 모니터링 with Evals (A/B 테스트, 자동 프롬프트 최적화), 엔터프라이즈 보안 (멀티테넌시, GDPR 준수, 감사 로깅), 3개 실전 케이스 스터디 (SaaS 온보딩 70% 시간 단축, 데이터 파이프라인 자동 복구 82% MTTR 단축, DevOps 수동 리뷰 94% 감소), 성능 최적화 (병렬 처리, 스트리밍, 배치 처리)

11. **OpenAI AgentKit 완벽 가이드 1부: 핵심 개념과 시작하기** (2025-10-20)

   - 2025년 10월 발표된 OpenAI AgentKit의 핵심 개념부터 실전 튜토리얼까지, AI 에이전트 개발의 모든 것
   - **핵심 내용**: AgentKit 4대 컴포넌트 (Agent Builder, ChatKit, Connector Registry, Evals), Agents/Handoffs/Guardrails 핵심 원칙, 날씨 에이전트 및 멀티 에이전트 고객 지원 시스템 구축 튜토리얼, MCP 프로토콜 통합, 가드레일 설계 패턴, 세션 관리, 비용 최적화 전략, 프로덕션 배포 체크리스트, Clay 10배 성장 사례 등 실전 적용 사례

12. **AI 에이전트에 성별과 페르소나를 부여하면 무슨 일이 일어날까?** (2025-10-19)

    - 120개 이상의 연구로 밝혀진 AI 에이전트 페르소나 설계의 심리학적 효과와 업무별 최적 설계 전략
    - **핵심 내용**: 성별 부여의 편향 강화 효과 (여성 레이블 +18% 착취, 남성 레이블 +23% 불신), 전문성 기반 페르소나의 우수성 (작업 완료율 15%↑), Salesforce 4대 설계 원칙, 5개 업무 유형별 최적 페르소나, 문화적 차이 (개인주의 vs 집단주의), A/B 테스트 프레임워크, 실전 Claude Code 에이전트 설계 가이드

13. **블로그 첫 주 분석 리포트: 31명의 열정적인 얼리어답터와 함께 시작한 여정** (2025-10-14)

    - 블로그 런칭 일주일 후 GA4 데이터 분석, 콘텐츠 성과, 개선 효과 - 투명하게 공유하는 블로그 성장 기록 (2025-10-07~10-14)
    - **핵심 내용**: 31명 방문자 분석, 6명 리피터의 22회 세션 (49%), 4.07 페이지/세션 (136% 달성), 4.3% 오가닉 검색 (SEO 위기), 5가지 핵심 인사이트, 4개 기술 개선 효과 측정, 11개 우선순위별 액션 플랜

14. **추천 시스템 혁신: 78,000 토큰을 제로로 만든 메타데이터 최적화 여정** (2025-10-18)

    - 콘텐츠 추천 시스템의 토큰 사용량을 100% 제거하고 실행 시간을 99% 단축한 메타데이터 기반 알고리즘 최적화 사례
    - **핵심 내용**: 3단계 최적화 과정 (Content Preview 78,000 → Metadata LLM 28,600 → Algorithm 0 토큰), 다차원 유사도 계산 (Jaccard + Cosine), 한국어 전용 분석 최적화, 실전 적용 가이드 및 Break-even 분석, LLM vs 알고리즘 선택 프레임워크

15. **자가 치유 AI 시스템: 인간 개입 없이 자동으로 버그를 수정하는 에이전트 구축하기** (2025-10-17)

    - GitHub, Google, Netflix가 실전 배포한 Self-Healing Systems 완벽 가이드. LangGraph로 에러 감지부터 자동 패치까지 전체 구현
    - **핵심 내용**: 5단계 자가 치유 사이클 (에러 감지 → 근본 원인 분석 → 패치 생성 → 테스트 → 배포), LangGraph 실전 구현, GitHub/Google/Netflix 사례, Agentless vs Multi-Agent 비교 (50.8% vs 33.6%), SWE-bench 2025 벤치마크, 보안 및 한계점

16. **AI 에이전트 협업 패턴: 5개의 전문 에이전트로 풀스택 앱 구축하기** (2025-10-16)

    - Architecture, Coding, Testing, Security, DevOps Agent를 오케스트레이션하여 프로덕션급 애플리케이션을 구축하는 실전 가이드
    - **핵심 내용**: 멀티 에이전트 시스템 아키텍처, 5개 전문 에이전트 역할, 오케스트레이션 패턴 (계층적/이벤트 주도/그래프 기반), MCP & A2A 통신 프로토콜, 에러 처리 및 복원력, 실전 Todo API 구축 예제

17. **AI 시대의 사양 주도 개발: Markdown으로 코드를 작성하는 새로운 패러다임** (2025-10-15)

    - GitHub Spec Kit으로 구현하는 체계적인 AI 개발 방법론. Vibe Coding을 넘어 확장 가능하고 유지보수 가능한 프로덕션 코드 작성 가이드
    - **핵심 내용**: 사양 주도 개발 개념, GitHub Spec Kit 실전 활용, constitution.md 작성법, 전통적 개발 vs Vibe Coding 비교, 실전 예제 (인증 시스템)

18. **정적 블로그의 예약 공개 구현법: Astro + GitHub Actions로 자동화하기** (2025-10-13)

    - Astro와 GitHub Pages를 사용한 정적 블로그에서 WordPress처럼 포스트 예약 공개를 구현하는 실전 가이드
    - **구현 완료**: pubDate 필터링 유틸리티, GitHub Actions 스케줄 워크플로우, JST 시간대 자동 변환

19. **Claude LLM으로 구축하는 지능형 콘텐츠 추천 시스템** (2025-10-12)

    - 단순 태그 매칭을 넘어 의미론적 이해로 정교한 추천을 제공하는 AI 기반 블로그 추천 시스템 구축 가이드
    - **구현 완료**: Claude LLM 기반 의미론적 추천 시스템, RelatedPosts 컴포넌트, 자동 추천 생성

20. **Chrome DevTools MCP로 웹 성능 최적화 자동화하기** (2025-10-11)

    - AI 어시스턴트가 실제 브라우저 데이터로 성능을 측정하고 최적화하는 완벽 가이드

21. **AI 에이전트 시스템 구축 실전 가이드: Notion API MCP와 Claude Code로 자동화 파이프라인 만들기** (2025-10-10)

    - Notion API MCP 통합으로 구축하는 엔터프라이즈급 AI 자동화 시스템

22. **AI를 활용한 반기별 발표 자료 작성 자동화** (2025-10-09)

    - 60시간 업무를 10시간으로 단축한 AI 자동화 프로세스

23. **Claude Code를 활용한 대규모 웹사이트 페이지 자동 생성** (2025-10-08)

    - 31개 HTML 페이지 자동 생성 사례

24. **Claude Code Best Practices** (2025-10-07)

    - Anthropic 공식 가이드 기반 생산성 극대화

25. **블로그 런칭 분석 리포트** (2025-10-06)

    - GA4 데이터 분석 및 3개월 성장 전략

26. **Google Analytics MCP 자동화** (2025-10-05)

    - MCP와 AI 에이전트로 블로그 분석 자동화

27. **LLM과 Claude Code를 활용한 블로그 자동화** (2025-10-04)
    - 11개 전문 에이전트로 블로그 완전 자동화

---

## 📅 향후 콘텐츠 플랜

### 정기 분석 리포트 (데이터 기반)

- **✅ 2025-10-14 발행**: 블로그 런칭 일주일 후 분석 리포트 (2025-10-07~10-14)

  - GA4 초기 데이터 분석, 31명 방문자 심층 분석, 6명 리피터의 49% 세션 기여, SEO 위기 진단, 11개 우선순위별 액션 플랜

- **2025-11-07**: 블로그 런칭 한달 후 분석 리포트 (2025-10-07~11-06)

  - 월간 핵심 지표 달성률, 콘텐츠별 성과 순위, 사용자 여정 맵핑, 4주 추세 분석

- **2026-01-07**: 분기 회고 및 2026년 전략 수립 (2025-10-07~2026-01-06)

  - 3개월 성장 분석, 콘텐츠 효과성 평가, 신규 전략 수립

## 🛠 기술 스택

### Core

- **Astro 5.14.1**: Islands Architecture 기반 정적 사이트 생성
- **TypeScript**: 타입 안전한 개발
- **Tailwind CSS**: 유틸리티 기반 스타일링

### Integrations

- **@astrojs/mdx**: JSX in Markdown 지원
- **@astrojs/sitemap**: 자동 사이트맵 생성
- **@astrojs/rss**: RSS 피드 자동 생성

### AI & Automation

- **Claude Code**: AI 코딩 어시스턴트
- **Model Context Protocol (MCP)**: 외부 데이터 소스 통합
  - Notion API
  - Google Analytics
  - Chrome DevTools
  - Context7 (라이브러리 문서)
  - Playwright (웹 자동화)
- **Gemini API**: 이미지 자동 생성

### Tools & Services

- **Google Analytics 4**: 트래픽 분석
- **GitHub Actions**: CI/CD 파이프라인

## 📂 프로젝트 구조

```
www.jangwook.net/
├── .claude/              # Claude Code 설정
│   ├── agents/          # 전문 에이전트 정의
│   │   ├── web-researcher.md
│   │   ├── content-planner.md
│   │   ├── writing-assistant.md
│   │   ├── editor.md
│   │   ├── seo-optimizer.md
│   │   ├── analytics.md
│   │   └── ...
│   ├── commands/        # 커스텀 슬래시 커맨드
│   └── settings/        # MCP 권한 설정
├── src/
│   ├── assets/          # 정적 자산 (Astro 최적화)
│   │   └── blog/       # 블로그 이미지
│   ├── components/      # Astro 컴포넌트
│   │   ├── BaseHead.astro    # SEO 메타태그
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── BlogCard.astro
│   ├── content/         # Content Collections
│   │   └── blog/
│   │       ├── ko/      # 한국어 포스트
│   │       ├── en/      # 영어 포스트
│   │       └── ja/      # 일본어 포스트
│   ├── layouts/         # 페이지 레이아웃
│   │   ├── Base.astro
│   │   └── BlogPost.astro
│   ├── pages/          # 파일 기반 라우팅
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   └── rss.xml.js
│   ├── styles/         # 전역 CSS
│   ├── consts.ts       # 전역 상수
│   └── content.config.ts  # Content Collections 스키마
├── public/             # 정적 파일 (빌드 시 그대로 복사)
├── CLAUDE.md          # Claude Code 프로젝트 가이드
├── astro.config.mjs   # Astro 설정
└── package.json
```

## 🤖 AI 에이전트 시스템

### 전문 에이전트 (13개)

1. **web-researcher**: Brave Search MCP를 활용한 웹 리서치, 기술 검증, 최신 정보 수집
2. **content-planner**: 콘텐츠 전략 및 주제 계획
3. **writing-assistant**: 블로그 포스트 작성 지원
4. **editor**: 문법, 스타일, 메타데이터 검토
5. **site-manager**: Astro 빌드, 배포, 성능 최적화
6. **seo-optimizer**: 사이트맵, 메타태그, 내부 링크 최적화
7. **analytics**: 트래픽 분석 및 성과 측정
8. **social-media-manager**: 소셜 미디어 공유 자동화
9. **portfolio-curator**: 프로젝트 포트폴리오 관리
10. **learning-tracker**: 학습 목표 및 기술 트렌드 추적
11. **image-generator**: Gemini API 기반 이미지 생성
12. **technical-writer**: 기술 문서 작성 및 코드 설명
13. **content-recommender**: Claude LLM 기반 의미론적 콘텐츠 추천 시스템

### 사용 예시

```bash
# Claude Code에서 에이전트 호출
@writing-assistant "TypeScript 5.0 기능에 대한 블로그 포스트 작성"
@seo-optimizer "최근 포스트들의 내부 링크 최적화"
@analytics-reporter "지난 주 블로그 트래픽 분석 리포트 생성"
@content-recommender "모든 블로그 포스트에 대한 의미론적 추천 생성"
@improvement-tracker "이번 주 액션 플랜을 TODO로 변환해줘"
```

### 커스텀 슬래시 커맨드

```bash
# 블로그 포스트 자동 생성
/write-post "Next.js 15의 새로운 기능" --tags nextjs,react --languages ko,ja,en

# 콘텐츠 추천 생성
/generate-recommendations  # 모든 포스트에 대한 추천 자동 생성

# 정기 GA 분석 리포트 생성 (NEW!)
/write-ga-post 2025-10-14                    # 주간 리포트
/write-ga-post 2025-10-31 --period monthly   # 월간 리포트
/write-ga-post 2025-12-31 --period quarterly # 분기 리포트
```

### 정기 분석 리포트 자동화 워크플로우

`/write-ga-post` 커맨드는 다음 작업을 자동으로 수행합니다:

1. **데이터 수집**: @analytics-reporter 에이전트가 GA4 데이터 수집 및 분석
2. **컨텍스트 통합**:
   - improvement-history.astro에서 해당 기간 개선사항 추출
   - README.md에서 신규 블로그 포스트 현황 파악
3. **종합 리포트 생성**:
   - GA 데이터 + 개선 효과 + 콘텐츠 성과를 종합한 분석 리포트
   - 3개 언어 버전 자동 생성 (ko, ja, en)
   - SEO 최적화된 메타데이터 및 히어로 이미지 생성
4. **문서 업데이트**: README.md 자동 업데이트
5. **액션 플랜**: @improvement-tracker 에이전트로 TODO 생성

**사용 예시**:

```bash
# 매주 월요일 실행
/write-ga-post 2025-10-14

# 실행 결과:
# ✅ src/content/blog/ko/weekly-analytics-2025-10-14.md
# ✅ src/content/blog/ja/weekly-analytics-2025-10-14.md
# ✅ src/content/blog/en/weekly-analytics-2025-10-14.md
# 📊 5개 액션 아이템 → improvement-tracker로 TODO 생성
```

## 📝 블로그 포스트 작성 가이드

### 다국어 파일 구조

```
src/content/blog/
├── ko/post-title.md    # 한국어
├── en/post-title.md    # 영어
└── ja/post-title.md    # 일본어
```

**중요 규칙**:

- 모든 언어 버전은 **동일한 파일명** 사용
- **pubDate는 'YYYY-MM-DD' 형식**으로 작성 (작은따옴표 필수)
- heroImage는 모든 언어 버전에서 동일한 경로 사용

### Frontmatter 템플릿

```markdown
---
title: "포스트 제목 (60자 이하 권장)"
description: "SEO 최적화된 설명 (150-160자 권장)"
pubDate: "2025-10-10"
heroImage: "../../../assets/blog/image.jpg"
tags: ["tag1", "tag2", "tag3"] # 최대 3-5개 권장
---

# 포스트 내용

Markdown 또는 MDX 형식으로 작성...
```

### 자동 이미지 생성

```bash
# Gemini API로 히어로 이미지 생성
node generate_image.js src/assets/blog/hero.jpg "Modern tech blog hero image"

# 환경 변수 필요
# GEMINI_API_KEY=your_api_key
```

## 🔧 개발 가이드

### Content Collections 스키마

`src/content.config.ts`에서 정의:

```typescript
{
  title: string           // 필수
  description: string     // 필수
  pubDate: Date          // 필수 (자동 변환)
  updatedDate?: Date     // 선택
  heroImage?: ImageMetadata  // 선택
  tags?: string[]        // 선택
}
```

### 이미지 최적화

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.jpg';
---

<!-- 자동 최적화 (WebP, 반응형) -->
<Image src={myImage} alt="설명" width={600} height={400} />
```

### 타입 체크

```bash
# 빌드 전 필수
npm run astro check
```

## 🌐 배포

### 빌드 프로세스

```bash
# 타입 체크 및 빌드
npm run astro check && npm run build

# 빌드 결과: ./dist/
# - 정적 HTML
# - 최적화된 자산
# - 사이트맵 (sitemap-index.xml)
```

### 호스팅

정적 사이트이므로 다음 플랫폼에서 호스팅 가능:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 📊 성능

- **Lighthouse 스코어**: 100/100 (Performance)
- **빌드 시간**: ~2분 (이미지 최적화 포함)
- **페이지 로딩**: < 1초 (정적 HTML)

## 🤝 Contributing

### Commit Message Convention

```
<type>(<scope>): <subject>

Types:
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 리팩토링
- perf: 성능 개선
- test: 테스트
- chore: 빌드, 설정
```

**예시**:

```bash
feat(blog): add claude code best practices post
fix(seo): correct og:image path
docs(readme): update project structure
```

### Branch Strategy

```
main              # 프로덕션
├── feature/*     # 새 기능
├── fix/*         # 버그 수정
└── docs/*        # 문서
```

## 📚 참고 자료

### 공식 문서

- [Astro 문서](https://docs.astro.build)
- [Claude Code 문서](https://docs.claude.com/claude-code)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering)

### Best Practices

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [The Think Tool](https://www.anthropic.com/engineering/claude-think-tool)

## 📄 License

MIT License

## 👤 Author

**Jangwook**

- Website: [www.jangwook.net](https://www.jangwook.net)
- GitHub: [@jangwook](https://github.com/jangwook)

---

**Last Updated**: 2025-11-03 (Notion+Backlog+Slack+Claude Code를 이용한 신규 프로젝트 매니징 표준화 포스트 발행)

**Built with** ❤️ **using Astro & Claude Code**
