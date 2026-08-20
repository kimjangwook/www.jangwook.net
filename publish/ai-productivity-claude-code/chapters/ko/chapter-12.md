# Chapter 12: Deep Agents 아키텍처

## 서론: AI 에이전트 시스템의 진화

2025년, AI 에이전트 시스템은 중요한 전환점을 맞이했습니다. 초기의 단순한 도구 호출 에이전트(Shallow Agents)에서, 복잡한 장기 작업을 수행할 수 있는 Deep Agents로의 진화가 시작되었습니다.

LangChain과 AWS의 Philipp Schmid가 제안한 Deep Agents 패러다임은 다음 네 가지 핵심 기둥으로 구성됩니다:

1. **Explicit Planning (명시적 계획)**: 암묵적 추론이 아닌 구조화된 계획 생성
2. **Hierarchical Delegation (계층적 위임)**: 적합한 전문 에이전트에게 작업 위임
3. **Persistent Memory (영속적 메모리)**: 세션 간 컨텍스트 및 상태 유지
4. **Extreme Context Engineering (극단적 컨텍스트 엔지니어링)**: 모든 관련 정보를 컨텍스트에 포함

이번 장에서는 각 기둥을 실전에서 활용하는 구체적인 레시피를 제공합니다.

---

## Recipe 12.1: Deep vs Shallow Agents

### 문제 (Problem)

기존 AI 에이전트는 5〜15 스텝 이내의 짧은 작업만 수행할 수 있으며, 실패 시 즉각 중단됩니다. 복잡한 장기 작업(예: 다국어 블로그 포스트 작성, 전체 사이트 SEO 감사)을 수행하려면 사람이 여러 차례 개입해야 합니다.

### 해결책 (Solution)

Shallow Agents와 Deep Agents의 차이를 이해하고, 적절한 패러다임을 선택하세요.

#### Shallow Agents (Agent 1.0)

**특징**:
- 단순 ReAct 패턴 (Reasoning → Action → Observation)
- 5〜15 스텝 이내의 짧은 작업
- 실패 시 즉각 중단
- 컨텍스트 비지속적

**적합한 작업**:
- 간단한 정보 조회
- 단일 파일 수정
- 빠른 데이터 변환

**워크플로우**:

```
요청 → 도구 호출 → 결과 → 완료/실패
```

#### Deep Agents (Agent 2.0)

**특징**:
- 100+ 스텝의 장기 작업 수행 가능
- 명시적 계획 및 재계획
- 지속적 상태 관리
- 자동 복구 및 적응

**적합한 작업**:
- 다국어 콘텐츠 생성
- 복잡한 리팩토링
- 데이터 파이프라인 구축
- 전체 프로젝트 분석

**워크플로우**:

```
요청 → 목표 분석 → 계획 수립 → 작업 실행 → 검증 → 재계획 (필요 시) → 완료
```

### 코드/예시 (Code)

#### Shallow Agent 예시: 단일 파일 수정

```markdown
# 사용자 요청
"src/utils/format.ts 파일에서 날짜 포맷 함수를 수정해주세요."

# Shallow Agent 실행
1. Read: src/utils/format.ts
2. Edit: formatDate 함수 수정
3. 완료

# 총 3 스텝, 1분 소요
```

#### Deep Agent 예시: 다국어 블로그 포스트 작성

```markdown
# 사용자 요청
"TypeScript 5.0의 새로운 기능에 대한 심층 분석 블로그 포스트를 작성해주세요.
코드 예제와 성능 벤치마크를 포함하고, 한국어, 영어, 일본어 버전을 모두 만들어주세요."

# Deep Agent 실행 계획
## Phase A: 준비 (병렬, 5분)
1. [web-researcher] TypeScript 5.0 공식 릴리스 노트 조사
2. [web-researcher] 성능 벤치마크 데이터 수집
3. [image-generator] 히어로 이미지 생성

## Phase B: 작성 (순차, 15분)
4. [writing-assistant] 한국어 초안 작성 (2500자+)
5. [writing-assistant] 영어 버전 작성
6. [writing-assistant] 일본어 버전 작성

## Phase C: 검증 (순차, 5분)
7. [editor] 전체 버전 품질 검토
8. [seo-optimizer] 메타데이터 및 키워드 최적화
9. [site-manager] 빌드 검증

# 총 9 스텝, 25분 소요
# 자동 복구: Step 4-6 실패 시 구체적 피드백으로 재작성
```

### 설명 (Explanation)

**Shallow Agents의 한계**:

1. **짧은 컨텍스트 윈도우**: 대화가 길어지면 초기 컨텍스트 손실
2. **상태 미지속**: 실패 시 처음부터 다시 시작
3. **수동 조율 필요**: 복잡한 작업은 사람이 단계별로 지시

**Deep Agents의 강점**:

1. **장기 작업 지원**: 명시적 계획으로 100+ 스텝 관리
2. **자동 복구**: 실패 유형에 따라 재시도, 재계획, 또는 에스컬레이션
3. **상태 지속**: 중단 후 재개 가능
4. **투명성**: 진행 상황 추적 및 예측 가능성 향상

### 변형 (Variations)

#### 하이브리드 접근

간단한 작업은 Shallow Agent로, 복잡한 작업만 Deep Agent로 처리:

```typescript
// 작업 복잡도 평가
function assessComplexity(request: string): 'simple' | 'complex' {
  const indicators = {
    multiStep: /단계|순서|먼저.*다음/.test(request),
    multiFile: /모든|전체|여러/.test(request),
    multiLanguage: /다국어|번역|언어/.test(request),
    longDuration: /분석|리팩토링|최적화/.test(request)
  };

  const score = Object.values(indicators).filter(Boolean).length;
  return score >= 2 ? 'complex' : 'simple';
}

// 적절한 에이전트 선택
if (assessComplexity(userRequest) === 'complex') {
  await deepAgent.execute(userRequest);
} else {
  await shallowAgent.execute(userRequest);
}
```

#### 점진적 업그레이드

기존 Shallow Agent를 Deep Agent로 점진적 변환:

```markdown
# Step 1: 명시적 계획 추가
- 작업 시작 전 간단한 체크리스트 생성

# Step 2: 복구 로직 추가
- 실패 시 재시도 1회

# Step 3: 상태 저장 추가
- 주요 단계마다 진행 상황 기록

# Step 4: 완전한 Deep Agent
- 전체 프로토콜 구현
```

---

## Recipe 12.2: Explicit Planning (명시적 계획)

### 문제 (Problem)

AI 에이전트가 복잡한 작업을 수행할 때 즉흥적으로 진행하면 다음 문제가 발생합니다:
- 중복 작업 수행
- 의존성 무시로 인한 실패
- 병렬 실행 기회 누락
- 진행 상황 추적 불가

### 해결책 (Solution)

모든 복잡한 작업에 대해 명시적이고 구조화된 계획을 먼저 생성하세요.

#### Planning Protocol 구성 요소

```markdown
## 작업 계획 템플릿

### 1. 목표 명확화
- 최종 산출물: [구체적 설명]
- 성공 기준: [측정 가능한 기준]
- 범위 제한: [제외 사항]

### 2. 단계 분해
- 각 단계는 하나의 에이전트가 수행
- 단계당 예상 시간 명시
- 의존성 명확히 표시

### 3. 리소스 할당
- 필요 도구: [도구 목록]
- 필요 컨텍스트: [파일, 데이터]
- 예상 토큰 사용량: [대략적 추정]

### 4. 리스크 평가
- 잠재적 실패 지점: [식별된 리스크]
- 대안 경로: [Plan B]
- 복구 전략: [실패 시 대응]
```

### 코드/예시 (Code)

#### 예시 1: 다국어 블로그 포스트 계획

```markdown
## 작업 계획: TypeScript 5.0 심층 분석 포스트

### 1. 목표 명확화
- **최종 산출물**:
  - 한국어, 영어, 일본어 3개 버전의 블로그 포스트
  - 각 2500자 이상
  - 코드 예제 5개 이상 포함
  - 성능 벤치마크 차트 포함
- **성공 기준**:
  - `npm run build` 성공
  - Frontmatter 스키마 준수
  - SEO description 150-160자
- **범위 제한**:
  - 중국어 버전 제외
  - 비디오 튜토리얼 제외

### 2. 단계 분해

#### Phase A: 준비 (병렬 실행 가능)
- **Step 1** [web-researcher, 3분]
  - 작업: TypeScript 5.0 공식 릴리스 노트 조사
  - 출력: `.claude/memory/research/ts5-release-notes.md`
  - 의존성: 없음

- **Step 2** [web-researcher, 3분]
  - 작업: 커뮤니티 반응 및 사용 사례 수집
  - 출력: `.claude/memory/research/ts5-community.md`
  - 의존성: 없음

- **Step 3** [image-generator, 2분]
  - 작업: 히어로 이미지 생성
  - 출력: `src/assets/blog/typescript-5-hero.jpg`
  - 의존성: 없음

#### Phase B: 작성 (순차 실행)
- **Step 4** [writing-assistant, 8분]
  - 작업: 한국어 초안 작성
  - 입력: Step 1, 2 결과
  - 출력: `src/content/blog/ko/typescript-5-deep-dive.md`
  - 의존성: Step 1, 2, 3 완료

- **Step 5** [writing-assistant, 6분]
  - 작업: 영어 버전 작성
  - 입력: Step 4 구조 참조
  - 출력: `src/content/blog/en/typescript-5-deep-dive.md`
  - 의존성: Step 4 완료

- **Step 6** [writing-assistant, 6분]
  - 작업: 일본어 버전 작성
  - 입력: Step 4 구조 참조
  - 출력: `src/content/blog/ja/typescript-5-deep-dive.md`
  - 의존성: Step 4 완료

#### Phase C: 검증 (순차 실행)
- **Step 7** [editor, 4분]
  - 작업: 전체 버전 품질 검토
  - 검증: 문법, 기술 정확성, 일관성
  - 의존성: Step 4, 5, 6 완료

- **Step 8** [seo-optimizer, 2분]
  - 작업: 메타데이터 최적화
  - 검증: description 길이, 키워드 밀도
  - 의존성: Step 7 완료

- **Step 9** [site-manager, 1분]
  - 작업: 빌드 검증
  - 검증: `npm run build` 성공
  - 의존성: Step 8 완료

### 3. 리소스 할당
- **필요 도구**:
  - WebSearch (Step 1, 2)
  - Image Generator API (Step 3)
  - File System (Step 4-9)
  - Bash (Step 9)
- **필요 컨텍스트**:
  - `CLAUDE.md` (블로그 작성 가이드라인)
  - `src/content.config.ts` (스키마 정의)
  - 기존 TypeScript 관련 포스트 2개 (참고용)
- **예상 토큰 사용량**:
  - Phase A: 15,000 tokens
  - Phase B: 45,000 tokens
  - Phase C: 10,000 tokens
  - 총: 70,000 tokens

### 4. 리스크 평가
- **잠재적 실패 지점**:
  - Step 1-2: 웹 검색 API 제한
    - 대안: Context7 MCP로 공식 문서 조회
  - Step 3: 이미지 생성 API 오류
    - 대안: 기존 TypeScript 이미지 재사용
  - Step 4-6: 분량 부족
    - 복구: 구체적 피드백으로 재작성 요청
  - Step 9: 빌드 실패
    - 복구: 오류 로그 분석 후 수정

### 5. 예상 소요 시간
- Phase A: 3분 (병렬)
- Phase B: 8분 (Step 4) + 병렬 6분 (Step 5, 6)
- Phase C: 7분 (순차)
- **총: 24분**

### 6. 병렬 실행 전략
- **Phase A**: 3개 스텝 병렬 실행
- **Phase B**: Step 5, 6 병렬 실행 (Step 4 참조)
- **Phase C**: 순차 실행 (품질 보장)
```

#### 예시 2: TypeScript 코드로 계획 표현

```typescript
interface ExecutionPlan {
  goal: string;
  successCriteria: string[];
  scope: {
    included: string[];
    excluded: string[];
  };
  phases: Phase[];
  resources: {
    tools: string[];
    context: string[];
    estimatedTokens: number;
  };
  risks: Risk[];
}

interface Phase {
  name: string;
  parallelizable: boolean;
  steps: Step[];
}

interface Step {
  id: number;
  agent: string;
  task: string;
  estimatedDuration: number; // minutes
  dependencies: number[]; // step IDs
  inputs: string[];
  outputs: string[];
}

interface Risk {
  step: number;
  description: string;
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  alternative: string;
}

// 계획 생성 함수
async function createExecutionPlan(
  request: string
): Promise<ExecutionPlan> {
  const analysis = await analyzeRequest(request);
  const steps = await decomposeIntoSteps(analysis);
  const phases = await groupIntoPhases(steps);
  const risks = await identifyRisks(steps);

  return {
    goal: analysis.goal,
    successCriteria: analysis.criteria,
    scope: analysis.scope,
    phases,
    resources: {
      tools: steps.flatMap(s => s.requiredTools),
      context: analysis.requiredContext,
      estimatedTokens: estimateTokenUsage(steps)
    },
    risks
  };
}
```

### 설명 (Explanation)

#### 왜 명시적 계획이 필요한가?

1. **예측 가능성**: 작업 시간과 리소스를 미리 추정 가능
2. **병렬화**: 의존성 분석으로 동시 실행 가능한 단계 식별
3. **복구 가능성**: 실패 지점 예측 및 대안 준비
4. **투명성**: 사용자와 시스템 모두 진행 상황 파악 가능

#### 계획 생성 원칙

1. **SMART 목표**:
   - Specific (구체적): "블로그 포스트 작성" → "2500자 이상, 코드 예제 5개 포함"
   - Measurable (측정 가능): "품질 검토" → "문법 오류 0개, 기술 정확성 95%+"
   - Achievable (달성 가능): 현재 도구와 컨텍스트로 실현 가능
   - Relevant (관련성): 사용자 요청과 직접 연관
   - Time-bound (시간 제한): 각 단계별 예상 시간 명시

2. **의존성 그래프**:
   - 각 단계의 선행 조건 명시
   - 순환 의존성 방지
   - 병렬 실행 가능 단계 식별

3. **리스크 기반 계획**:
   - 각 단계의 실패 가능성 평가
   - 대안 경로 사전 준비
   - 복구 전략 포함

### 변형 (Variations)

#### 동적 계획 조정

실행 중 새로운 정보에 따라 계획 수정:

```typescript
async function executePlanWithAdaptation(
  plan: ExecutionPlan
): Promise<void> {
  for (const phase of plan.phases) {
    const results = await executePhase(phase);

    // 결과에 따라 다음 단계 조정
    if (results.qualityScore < 0.8) {
      // 품질 미달 시 추가 검토 단계 삽입
      const reviewStep = createReviewStep(phase);
      plan.phases.splice(
        plan.phases.indexOf(phase) + 1,
        0,
        { name: 'Additional Review', steps: [reviewStep] }
      );
    }

    // 예상보다 빨리 완료 시 다음 단계 앞당기기
    if (results.duration < phase.estimatedDuration * 0.7) {
      await executePhase(plan.phases[plan.phases.indexOf(phase) + 1]);
    }
  }
}
```

#### 점진적 상세화

초기에는 고수준 계획만 생성하고, 실행 직전에 상세화:

```markdown
# 초기 계획 (High-Level)
1. 리서치 → 2. 작성 → 3. 검증

# Step 1 실행 직전 상세화
1. 리서치
   1.1. 공식 문서 조사 (web-researcher, 3분)
   1.2. 커뮤니티 반응 수집 (web-researcher, 3분)
   1.3. 벤치마크 데이터 수집 (web-researcher, 2분)
```

---

## Recipe 12.3: Hierarchical Delegation (계층적 위임)

### 문제 (Problem)

모든 작업을 하나의 에이전트가 처리하면 다음 문제가 발생합니다:
- 컨텍스트 오버로드 (너무 많은 책임)
- 전문성 부족 (모든 도메인에 능숙할 수 없음)
- 병렬 실행 불가 (단일 스레드)

### 해결책 (Solution)

복잡한 작업을 계층 구조를 통해 적합한 전문 에이전트에게 위임하세요.

#### 3계층 아키텍처

```
사용자
  ↓
오케스트레이터 (조율자)
  ↓
클러스터 리더 (도메인 전문가)
  ↓
개별 에이전트 (세부 작업 수행자)
```

### 코드/예시 (Code)

#### 클러스터 정의

```yaml
# .claude/guidelines/agent-clusters.md

content-creation:
  leader: writing-assistant
  members:
    - content-planner
    - editor
    - image-generator
  capabilities:
    - 블로그 포스트 작성
    - 콘텐츠 전략 수립
    - 문법/스타일 검토
    - 히어로 이미지 생성
  communication: leader가 작업 조율

research-analysis:
  leader: web-researcher
  members:
    - post-analyzer
    - analytics
    - analytics-reporter
  capabilities:
    - 웹 리서치
    - 콘텐츠 분석
    - 트래픽 분석
    - 데이터 리포트 생성

seo-marketing:
  leader: seo-optimizer
  members:
    - backlink-manager
    - social-media-manager
  capabilities:
    - 사이트맵 최적화
    - 메타태그 관리
    - 백링크 전략
    - 소셜 미디어 공유

content-discovery:
  leader: content-recommender
  members: []
  capabilities:
    - 의미론적 추천
    - 관련 콘텐츠 발견

operations:
  leader: site-manager
  members:
    - portfolio-curator
    - learning-tracker
    - improvement-tracker
    - prompt-engineer
  capabilities:
    - 빌드/배포
    - 포트폴리오 관리
    - 학습 추적
    - 프롬프트 최적화
```

#### 오케스트레이터 구현

```typescript
// .claude/agents/orchestrator.md를 TypeScript로 표현

interface OrchestratorWorkflow {
  // Phase 1: 요청 분석
  async analyze(request: string): Promise<TaskAnalysis> {
    return {
      goals: this.extractGoals(request),
      requirements: this.extractRequirements(request),
      successCriteria: this.defineSuccessCriteria(request),
      complexity: this.assessComplexity(request),
      primaryDomain: this.identifyDomain(request) // 어떤 클러스터?
    };
  }

  // Phase 2: 계획 수립
  async plan(analysis: TaskAnalysis): Promise<ExecutionPlan> {
    const steps = this.decomposeIntoSteps(analysis);
    const agents = this.assignAgents(steps);
    const dependencies = this.identifyDependencies(steps);
    const parallel = this.findParallelOpportunities(dependencies);

    return { steps, agents, dependencies, parallel };
  }

  // Phase 3: 클러스터에 위임
  async execute(plan: ExecutionPlan): Promise<void> {
    for (const phase of plan.phases) {
      // 클러스터별로 그룹화
      const clusterGroups = this.groupByCluster(phase.steps);

      // 클러스터 리더에게 위임
      const results = await Promise.all(
        Object.entries(clusterGroups).map(([cluster, steps]) =>
          this.delegateToClusterLeader(cluster, steps)
        )
      );

      await this.updateState(phase, results);
      await this.qualityCheck(phase, results);
    }
  }

  // 클러스터 리더에게 위임
  async delegateToClusterLeader(
    cluster: string,
    steps: Step[]
  ): Promise<StepResult[]> {
    const leader = this.getClusterLeader(cluster);

    // 위임 컨텍스트 생성
    const context = {
      task: this.summarizeSteps(steps),
      guidelines: this.loadGuidelines(),
      resources: this.gatherResources(steps),
      qualityCriteria: this.defineQualityCriteria(steps)
    };

    return await leader.execute(context);
  }

  // Phase 4: 결과 합성
  async synthesize(results: StepResult[]): Promise<FinalResult> {
    return {
      deliverables: this.collectDeliverables(results),
      summary: this.generateSummary(results),
      metrics: this.calculateMetrics(results),
      nextSteps: this.suggestNextSteps(results)
    };
  }
}
```

#### 위임 컨텍스트 예시

```markdown
## 클러스터 리더 위임 예시

### To: writing-assistant (content-creation 리더)

#### 작업
한국어, 영어, 일본어 블로그 포스트 작성

#### 전달 정보
1. **프로젝트 규칙**:
   - `CLAUDE.md`의 블로그 작성 가이드라인
   - Frontmatter 스키마 (title, description, pubDate, heroImage, tags)
   - pubDate는 'YYYY-MM-DD' 형식 사용

2. **리서치 결과**:
   - TypeScript 5.0 릴리스 노트 요약 (1500자)
   - 커뮤니티 반응 (500자)
   - 성능 벤치마크 데이터 (차트 3개)

3. **참고 포스트**:
   - `src/content/blog/ko/typescript-4-9.md`
   - `src/content/blog/ko/typescript-best-practices.md`

4. **타겟 독자**:
   - 한국어: 중급 이상 개발자
   - 영어: 국제 개발자
   - 일본어: 일본 기업 개발자

5. **SEO 요구사항**:
   - 키워드: "TypeScript 5.0", "타입스크립트", "데코레이터"
   - description: 150-160자

6. **이미지 경로**:
   - heroImage: `../../../assets/blog/typescript-5-hero.jpg`

#### 품질 기준
- Frontmatter 완전성: 필수 필드 모두 포함
- 분량: 각 언어 2500자 이상
- 코드 예제: 5개 이상
- 기술 정확성: 공식 문서 기반
- SEO 최적화: description 길이 준수

#### 하위 작업 위임 권한
writing-assistant는 다음 에이전트에게 추가 위임 가능:
- **editor**: 초안 검토 및 수정 제안
- **image-generator**: 추가 다이어그램 필요 시
- **content-planner**: 구조 개선 제안 필요 시

#### 예상 소요 시간
- 한국어 초안: 8분
- 영어/일본어 번역: 각 6분 (병렬)
- 총: 14분
```

### 설명 (Explanation)

#### 계층적 위임의 장점

1. **컨텍스트 집중**:
   - 오케스트레이터: 전체 계획과 조율에만 집중
   - 클러스터 리더: 도메인 내 작업 조율
   - 개별 에이전트: 세부 작업 수행

2. **전문성**:
   - 각 에이전트는 자신의 도메인에서 최고 성능 발휘
   - 도구와 프롬프트가 특화됨

3. **병렬 실행**:
   - 여러 클러스터가 동시에 작업 가능
   - 클러스터 내에서도 에이전트 간 병렬 실행

4. **확장성**:
   - 새 에이전트 추가 용이 (기존 클러스터에 추가)
   - 새 클러스터 생성 용이 (독립적 도메인)

#### 위임 프로토콜

```typescript
interface DelegationProtocol {
  // 1. 위임 대상 선택
  selectAgent(task: Task): Agent {
    const domain = this.identifyDomain(task);
    const cluster = this.getCluster(domain);
    return cluster.leader;
  }

  // 2. 컨텍스트 패키징
  packageContext(task: Task, agent: Agent): Context {
    return {
      task: this.formatTaskForAgent(task, agent),
      guidelines: this.loadRelevantGuidelines(agent),
      resources: this.gatherResources(task),
      examples: this.findSimilarExamples(task),
      qualityCriteria: this.defineQualityCriteria(task)
    };
  }

  // 3. 위임 실행
  async delegate(agent: Agent, context: Context): Promise<Result> {
    const result = await agent.execute(context);
    await this.validateResult(result, context.qualityCriteria);
    return result;
  }

  // 4. 결과 검증
  async validateResult(result: Result, criteria: Criteria): Promise<void> {
    if (!this.meetsQuality(result, criteria)) {
      throw new QualityError('Result does not meet criteria');
    }
  }
}
```

### 변형 (Variations)

#### 동적 클러스터 구성

작업에 따라 임시 클러스터 생성:

```typescript
async function createAdHocCluster(task: Task): Promise<Cluster> {
  const requiredCapabilities = analyzeRequiredCapabilities(task);
  const agents = selectAgentsByCapabilities(requiredCapabilities);
  const leader = electLeader(agents); // 가장 적합한 에이전트를 리더로

  return {
    name: `adhoc-${task.id}`,
    leader,
    members: agents.filter(a => a !== leader),
    capabilities: requiredCapabilities
  };
}
```

#### 에이전트 간 직접 통신

리더를 거치지 않고 에이전트 간 직접 협업:

```typescript
// editor가 writing-assistant에게 직접 피드백
const feedback = await editor.review(draft);
const revised = await writingAssistant.revise(draft, feedback);

// 오케스트레이터에게는 최종 결과만 보고
return revised;
```

---

## Recipe 12.4: Persistent Memory (영속적 메모리)

### 문제 (Problem)

세션이 종료되면 모든 컨텍스트가 사라집니다. 장기 작업 중 중단되면 처음부터 다시 시작해야 하며, 이전 작업 결과를 재사용할 수 없습니다.

### 해결책 (Solution)

작업 상태, 컨텍스트, 중간 결과를 파일 시스템에 지속적으로 저장하세요.

### 코드/예시 (Code)

#### 상태 관리 디렉토리 구조

```
.claude/
└── memory/
    ├── task-state.json          # 현재 작업 상태
    ├── task-history.json        # 작업 이력
    ├── context-cache/           # 컨텍스트 캐시
    │   ├── research/            # 리서치 결과
    │   ├── drafts/              # 초안
    │   └── reviews/             # 검토 결과
    └── recovery-points/         # 복구 포인트
        ├── checkpoint-001.json
        ├── checkpoint-002.json
        └── ...
```

#### task-state.json 스키마

```typescript
interface TaskState {
  current_task: {
    id: string;                  // "task_20251118_001"
    started_at: string;          // ISO 8601 timestamp
    updated_at: string;
    goal: string;
    status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'failed';
    plan: ExecutionPlan;
    progress: {
      total_steps: number;
      completed_steps: number;
      current_step: number;
    };
    context: Record<string, any>;
  };
  recovery_points: RecoveryPoint[];
  metrics: {
    token_usage: number;
    elapsed_time: number;       // seconds
    retries: number;
  };
}

interface RecoveryPoint {
  id: string;
  step: number;
  timestamp: string;
  state_snapshot: string;       // JSON stringified state
  artifacts: string[];          // paths to saved files
}

// 예시 데이터
const exampleState: TaskState = {
  current_task: {
    id: "task_20251118_001",
    started_at: "2025-11-18T10:00:00Z",
    updated_at: "2025-11-18T10:15:00Z",
    goal: "TypeScript 5.0 다국어 블로그 포스트 작성",
    status: "in_progress",
    plan: {
      phases: [
        {
          name: "Phase A: 준비",
          steps: [
            {
              id: 1,
              agent: "web-researcher",
              task: "TypeScript 5.0 조사",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-release-notes.md",
              completed_at: "2025-11-18T10:03:00Z"
            },
            {
              id: 2,
              agent: "web-researcher",
              task: "커뮤니티 반응 수집",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-community.md",
              completed_at: "2025-11-18T10:05:00Z"
            },
            {
              id: 3,
              agent: "image-generator",
              task: "히어로 이미지 생성",
              status: "completed",
              output_path: "src/assets/blog/typescript-5-hero.jpg",
              completed_at: "2025-11-18T10:07:00Z"
            }
          ]
        },
        {
          name: "Phase B: 작성",
          steps: [
            {
              id: 4,
              agent: "writing-assistant",
              task: "한국어 초안 작성",
              status: "in_progress",
              progress: 60,
              started_at: "2025-11-18T10:10:00Z"
            },
            {
              id: 5,
              agent: "writing-assistant",
              task: "영어 버전 작성",
              status: "pending"
            },
            {
              id: 6,
              agent: "writing-assistant",
              task: "일본어 버전 작성",
              status: "pending"
            }
          ]
        }
      ]
    },
    progress: {
      total_steps: 9,
      completed_steps: 3,
      current_step: 4
    },
    context: {
      research_summary: "TypeScript 5.0은 데코레이터 표준화, const 타입 파라미터 등 도입...",
      target_audience: "중급 이상 개발자",
      keywords: ["TypeScript 5.0", "타입스크립트", "데코레이터"]
    }
  },
  recovery_points: [
    {
      id: "checkpoint-001",
      step: 3,
      timestamp: "2025-11-18T10:07:00Z",
      state_snapshot: "{...}",
      artifacts: [
        ".claude/memory/context-cache/research/ts5-release-notes.md",
        ".claude/memory/context-cache/research/ts5-community.md",
        "src/assets/blog/typescript-5-hero.jpg"
      ]
    }
  ],
  metrics: {
    token_usage: 25000,
    elapsed_time: 900,  // 15 minutes
    retries: 0
  }
};
```

#### 상태 관리 함수

```typescript
// 상태 읽기
async function readTaskState(): Promise<TaskState | null> {
  const path = '.claude/memory/task-state.json';
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 상태 업데이트
async function updateTaskState(
  updates: Partial<TaskState['current_task']>
): Promise<void> {
  const state = await readTaskState() || createNewState();

  state.current_task = {
    ...state.current_task,
    ...updates,
    updated_at: new Date().toISOString()
  };

  await fs.writeFile(
    '.claude/memory/task-state.json',
    JSON.stringify(state, null, 2)
  );
}

// 단계 완료 기록
async function completeStep(
  stepId: number,
  output: any
): Promise<void> {
  const state = await readTaskState();

  // 해당 단계 찾기
  const step = findStepById(state.current_task.plan, stepId);

  step.status = 'completed';
  step.output = output;
  step.completed_at = new Date().toISOString();

  // 진행률 업데이트
  state.current_task.progress.completed_steps += 1;
  state.current_task.progress.current_step = stepId + 1;

  // 복구 포인트 생성 (5단계마다)
  if (stepId % 5 === 0) {
    await createRecoveryPoint(state, stepId);
  }

  await saveTaskState(state);
}

// 복구 포인트 생성
async function createRecoveryPoint(
  state: TaskState,
  stepId: number
): Promise<void> {
  const checkpoint: RecoveryPoint = {
    id: `checkpoint-${String(stepId).padStart(3, '0')}`,
    step: stepId,
    timestamp: new Date().toISOString(),
    state_snapshot: JSON.stringify(state.current_task),
    artifacts: collectArtifacts(state, stepId)
  };

  state.recovery_points.push(checkpoint);

  // 별도 파일로도 저장 (안전성)
  await fs.writeFile(
    `.claude/memory/recovery-points/${checkpoint.id}.json`,
    JSON.stringify(checkpoint, null, 2)
  );
}

// 작업 재개
async function resumeTask(): Promise<void> {
  const state = await readTaskState();

  if (!state || state.current_task.status === 'completed') {
    console.log('재개할 작업이 없습니다.');
    return;
  }

  console.log(`작업 재개: ${state.current_task.goal}`);
  console.log(`진행률: ${state.current_task.progress.completed_steps}/${state.current_task.progress.total_steps}`);

  // 현재 단계부터 계속
  const currentStep = state.current_task.progress.current_step;
  const remainingSteps = getRemainingSteps(state.current_task.plan, currentStep);

  for (const step of remainingSteps) {
    await executeStep(step);
  }
}

// 이전 복구 포인트로 롤백
async function rollbackToCheckpoint(checkpointId: string): Promise<void> {
  const state = await readTaskState();
  const checkpoint = state.recovery_points.find(cp => cp.id === checkpointId);

  if (!checkpoint) {
    throw new Error(`Checkpoint ${checkpointId} not found`);
  }

  // 상태 복원
  state.current_task = JSON.parse(checkpoint.state_snapshot);
  state.current_task.status = 'paused';

  console.log(`Checkpoint ${checkpointId} (Step ${checkpoint.step})로 롤백`);

  await saveTaskState(state);
}
```

#### 컨텍스트 캐싱

```typescript
// 리서치 결과 캐싱
async function cacheResearchResult(
  topic: string,
  content: string
): Promise<string> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  await fs.writeFile(path, content);

  return path;
}

// 캐시된 리서치 결과 재사용
async function getRearchResult(topic: string): Promise<string | null> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 사용 예시
const cachedResult = await getResearchResult('typescript-5-release-notes');
if (cachedResult) {
  console.log('캐시된 리서치 결과 사용 (토큰 절감!)');
  return cachedResult;
} else {
  const newResult = await webResearcher.research('TypeScript 5.0 릴리스 노트');
  await cacheResearchResult('typescript-5-release-notes', newResult);
  return newResult;
}
```

### 설명 (Explanation)

#### 영속적 메모리의 이점

1. **중단 후 재개**:
   - 작업 중 오류나 중단 발생 시 처음부터 다시 시작할 필요 없음
   - 완료된 단계의 결과 재사용

2. **컨텍스트 재사용**:
   - 이전 리서치 결과, 초안 등을 다른 작업에서 재사용
   - 토큰 사용량 절감

3. **이력 관리**:
   - 작업 완료 후에도 이력 보존
   - 학습 및 개선에 활용

4. **투명성**:
   - 진행 상황 추적 가능
   - 병목 지점 식별

#### 메모리 설계 원칙

1. **계층적 저장**:
   - 핫 데이터 (task-state.json): 자주 업데이트
   - 웜 데이터 (context-cache/): 가끔 참조
   - 콜드 데이터 (task-history.json): 보관용

2. **증분 업데이트**:
   - 전체 상태를 매번 저장하지 말고 변경된 부분만
   - 복구 포인트는 전체 스냅샷

3. **TTL (Time To Live)**:
   - 오래된 캐시 자동 삭제
   - 완료된 작업은 history로 이동

### 변형 (Variations)

#### 분산 메모리

여러 에이전트가 독립적으로 메모리 접근:

```typescript
// 에이전트별 메모리 공간
.claude/memory/
├── agents/
│   ├── writing-assistant/
│   │   ├── drafts/
│   │   └── templates/
│   ├── web-researcher/
│   │   └── research-cache/
│   └── ...
└── shared/
    ├── task-state.json
    └── context-cache/
```

#### 외부 스토리지 통합

파일 시스템 대신 데이터베이스 사용:

```typescript
// Redis를 사용한 메모리 저장
import Redis from 'ioredis';

const redis = new Redis();

async function saveTaskState(state: TaskState): Promise<void> {
  await redis.set(
    `task:${state.current_task.id}`,
    JSON.stringify(state),
    'EX',
    86400  // 24시간 TTL
  );
}

async function readTaskState(taskId: string): Promise<TaskState | null> {
  const data = await redis.get(`task:${taskId}`);
  return data ? JSON.parse(data) : null;
}
```

---

## Recipe 12.5: Extreme Context Engineering (극단적 컨텍스트 엔지니어링)

### 문제 (Problem)

AI 에이전트가 불완전한 정보로 작업하면 다음 문제가 발생합니다:
- 잘못된 가정으로 인한 오류
- 품질 기준 미달
- 반복적인 수정 요청
- 컨텍스트 누락으로 인한 일관성 결여

### 해결책 (Solution)

작업 수행에 필요한 모든 관련 정보를 컨텍스트에 포함시키세요.

### 코드/예시 (Code)

#### 컨텍스트 체크리스트

```markdown
## 위임 컨텍스트 체크리스트

### 필수 항목
- [ ] 작업 목표 (명확하고 측정 가능)
- [ ] 성공 기준 (품질 기준, 검증 방법)
- [ ] 프로젝트 규칙 (CLAUDE.md, 스타일 가이드)
- [ ] 스키마/타입 정의 (필요 시)
- [ ] 예시 (유사한 작업의 결과물)

### 도메인별 추가 항목

#### 블로그 작성
- [ ] 타겟 독자 (경험 수준, 관심사)
- [ ] SEO 요구사항 (키워드, description 길이)
- [ ] 리서치 결과 (조사한 정보)
- [ ] 참고 포스트 (기존 관련 포스트)
- [ ] 이미지 경로 (heroImage 위치)
- [ ] 다국어 요구사항 (어떤 언어?)

#### 코드 리팩토링
- [ ] 현재 코드베이스 구조
- [ ] 리팩토링 목표 (성능? 가독성?)
- [ ] 테스트 커버리지 요구사항
- [ ] 브레이킹 체인지 허용 여부
- [ ] 코딩 컨벤션 (ESLint, Prettier 설정)

#### SEO 최적화
- [ ] 타겟 키워드 목록
- [ ] 경쟁사 분석 결과
- [ ] 현재 SEO 메트릭 (순위, 트래픽)
- [ ] 기술적 제약 (프레임워크, CDN)
- [ ] 지역/언어 타겟
```

#### 컨텍스트 패키징 함수

```typescript
interface TaskContext {
  task: {
    goal: string;
    successCriteria: string[];
    constraints: string[];
  };
  projectRules: {
    guidelines: string;      // CLAUDE.md 내용
    schema: any;             // 스키마 정의
    styleGuide: string;      // 코딩/작성 스타일
  };
  domainKnowledge: {
    research: string[];      // 리서치 결과 경로
    examples: string[];      // 유사 작업 예시 경로
    references: string[];    // 참고 문서
  };
  qualityCriteria: {
    required: string[];      // 필수 요구사항
    preferred: string[];     // 선호 사항
    validation: string[];    // 검증 방법
  };
  resources: {
    tools: string[];         // 사용 가능한 도구
    apis: string[];          // API 키/엔드포인트
    data: Record<string, any>; // 참조 데이터
  };
}

async function packageContextForAgent(
  task: Task,
  agent: Agent
): Promise<TaskContext> {
  return {
    task: {
      goal: task.goal,
      successCriteria: defineSuccessCriteria(task),
      constraints: identifyConstraints(task)
    },

    projectRules: {
      guidelines: await loadGuidelines(),
      schema: await loadSchema(task.domain),
      styleGuide: await loadStyleGuide(agent.domain)
    },

    domainKnowledge: {
      research: await gatherResearchResults(task),
      examples: await findSimilarExamples(task),
      references: await loadReferences(task.domain)
    },

    qualityCriteria: {
      required: defineRequiredCriteria(task),
      preferred: definePreferredCriteria(task),
      validation: defineValidationMethods(task)
    },

    resources: {
      tools: listAvailableTools(agent),
      apis: getApiConfiguration(agent),
      data: loadReferenceData(task)
    }
  };
}
```

#### 실전 예시: 블로그 작성 컨텍스트

```markdown
## To: writing-assistant

### 작업 목표
TypeScript 5.0 심층 분석 블로그 포스트 작성 (한국어, 영어, 일본어)

### 성공 기준
1. **분량**: 각 언어 2500자 이상
2. **구조**: 서론, 본론 (기능별), 실전 예시, 결론
3. **코드 예제**: 5개 이상, 문법 하이라이팅 포함
4. **기술 정확성**: 공식 문서 기반, 검증된 정보만
5. **SEO**: description 150-160자, 키워드 자연스럽게 포함
6. **빌드**: `npm run build` 성공

### 제약 조건
- 중국어 버전 제외
- 비디오 튜토리얼 제외
- 실험적 기능 제외 (안정화된 기능만)

---

### 프로젝트 규칙

#### CLAUDE.md 발췌
\```markdown
## 블로그 포스트 작성 워크플로우

### 파일 위치
- 한국어: `src/content/blog/ko/[slug].md`
- 영어: `src/content/blog/en/[slug].md`
- 일본어: `src/content/blog/ja/[slug].md`

### Frontmatter 필수 필드
\```yaml
title: "명확하고 간결한 제목 (60자 이하)"
description: "SEO를 고려한 설명 (150-160자)"
pubDate: '2025-11-22'  # YYYY-MM-DD 형식, 작은따옴표
heroImage: ../../../assets/blog/[filename].jpg
tags: ["tag1", "tag2", "tag3"]  # 최대 5개
relatedPosts: [...]  # 관련 포스트 (별도 제공)
\```

### 마크다운 작성 규칙
1. **볼드 텍스트**: `<strong>텍스트</strong>` HTML 태그 사용
2. **범위 표기**: 전각 틸드 (`〜`) 사용
3. **코드 블록**: 언어 지정 필수
\```

#### Content Schema
\```typescript
// src/content.config.ts
{
  title: string,           // 필수
  description: string,     // 필수, 150-160자
  pubDate: Date,          // 필수, YYYY-MM-DD
  heroImage: ImageMetadata, // 선택
  tags: string[],         // 선택, 최대 5개
  relatedPosts: Array<{   // 필수
    slug: string,
    score: number,
    reason: { ko, en, ja, zh }
  }>
}
\```

---

### 도메인 지식

#### 리서치 결과 1: TypeScript 5.0 릴리스 노트 요약
\```markdown
# TypeScript 5.0 주요 기능

## 1. 데코레이터 표준화
- Stage 3 ECMAScript 데코레이터 지원
- 기존 실험적 데코레이터와 호환 불가
- `@decorator` 문법 공식 지원

\```typescript
function logged(target: any, key: string) {
  const original = target[key];
  target[key] = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
}

class Example {
  @logged
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
\```

## 2. const 타입 파라미터
- 타입 파라미터를 `const`로 선언 가능
- 타입 추론 개선

\```typescript
function identity<const T>(value: T): T {
  return value;
}

const arr = identity([1, 2, 3]); // type: readonly [1, 2, 3]
\```

## 3. 성능 개선
- 빌드 속도 10-20% 향상
- 메모리 사용량 30% 감소
- 대규모 프로젝트에서 체감 효과 큼

[... 1500자 더 ...]
\```

#### 리서치 결과 2: 커뮤니티 반응
\```markdown
# TypeScript 5.0 커뮤니티 반응

- Reddit r/typescript: 데코레이터 표준화에 긍정적
- HackerNews: 성능 개선 호평
- Twitter: Angular/NestJS 개발자들 환영
- GitHub Issues: 마이그레이션 가이드 요청 많음

주요 관심사:
1. 기존 데코레이터 코드 마이그레이션 방법
2. 프레임워크 지원 일정 (Angular, NestJS)
3. 성능 벤치마크 상세 결과

[... 500자 더 ...]
\```

#### 참고 포스트 1: `src/content/blog/ko/typescript-4-9.md`
\```markdown
---
title: TypeScript 4.9의 새로운 기능 완벽 가이드
description: satisfies 연산자부터 향상된 타입 체크까지, TypeScript 4.9의 모든 것
pubDate: '2024-08-15'
heroImage: ../../../assets/blog/typescript-4-9-hero.jpg
tags: ["typescript", "javascript", "type-system"]
---

## 서론
TypeScript 4.9는 타입 시스템의 안전성과 개발자 경험을 크게 개선한 버전입니다...

[구조 참고용]
\```

#### 참고 포스트 2: `src/content/blog/ko/typescript-best-practices.md`
\```markdown
[톤앤매너 참고용]
- 친근하면서도 전문적인 어조
- 코드 예제 → 설명 → 실전 팁 순서
- "이렇게 하면 됩니다" 보다 "이렇게 할 수 있습니다" 선호
\```

---

### 품질 기준

#### 필수 요구사항
1. ✅ Frontmatter 완전성: 모든 필수 필드 포함
2. ✅ 분량: 한국어/영어/일본어 각 2500자 이상
3. ✅ 코드 예제: 5개 이상, TypeScript 문법 하이라이팅
4. ✅ 기술 정확성: 리서치 결과 기반, 추측 금지
5. ✅ 빌드 성공: `npm run build` 오류 없음

#### 선호 사항
1. 💡 실전 팁: "주의할 점", "Best Practice" 섹션
2. 💡 비교표: 기존 버전과 차이점 표로 정리
3. 💡 다이어그램: Mermaid로 개념 시각화 (선택)
4. 💡 마이그레이션 가이드: 기존 코드 업그레이드 방법

#### 검증 방법
1. **자동 검증**:
   - `npm run astro check` (타입 체크)
   - `npm run build` (빌드 성공)
   - Frontmatter 스키마 준수 여부

2. **수동 검증** (editor 에이전트):
   - 문법 오류 0개
   - 기술 정확성 95%+
   - 코드 예제 실행 가능 여부

---

### 리소스

#### 사용 가능한 도구
- Read: 파일 읽기
- Write: 파일 쓰기
- Edit: 파일 수정
- WebSearch: 추가 정보 검색 (필요 시)
- Bash: npm run build 실행

#### 이미지 경로
- heroImage: `../../../assets/blog/typescript-5-hero.jpg` (이미 생성됨)

#### 참조 데이터
\```json
{
  "targetAudience": {
    "ko": "중급 이상 TypeScript 사용자, 3년+ 경력",
    "en": "Intermediate+ TypeScript developers",
    "ja": "中級以上のTypeScriptユーザー"
  },
  "keywords": ["TypeScript 5.0", "타입스크립트", "데코레이터", "const 타입 파라미터"],
  "relatedPosts": [
    {
      "slug": "typescript-4-9",
      "score": 0.92,
      "reason": {
        "ko": "이전 버전인 TypeScript 4.9와 비교하여 변경사항을 이해할 수 있습니다",
        "en": "Helps understand changes by comparing with previous version TypeScript 4.9",
        "ja": "以前のバージョンTypeScript 4.9と比較して変更点を理解できます",
        "zh": "通过与之前的TypeScript 4.9版本对比理解变化"
      }
    }
  ]
}
\```

---

### 하위 작업 위임 권한

writing-assistant는 다음 에이전트에게 추가 위임 가능:

1. **editor** (초안 검토):
   - 작성 완료 후 품질 검토 요청
   - 피드백 기반으로 수정

2. **image-generator** (추가 다이어그램):
   - 복잡한 개념 시각화 필요 시
   - 예: 데코레이터 실행 순서 다이어그램

3. **web-researcher** (추가 조사):
   - 리서치 결과에 없는 정보 필요 시
   - 예: 특정 프레임워크 지원 일정

---

### 예상 소요 시간
- 한국어 초안: 8분
- 영어 번역: 6분 (한국어 구조 참조)
- 일본어 번역: 6분 (한국어 구조 참조)
- 총: 20분 (병렬 실행 시 14분)

### 시작 신호
준비 완료. 위 컨텍스트를 기반으로 작업 시작하세요.
```

### 설명 (Explanation)

#### 극단적 컨텍스트 엔지니어링의 핵심

1. **완전성**: 에이전트가 추가 질문 없이 작업 수행 가능한 수준
2. **구조화**: 작업, 규칙, 지식, 품질, 리소스로 명확히 분리
3. **구체성**: "블로그 작성" → "2500자 이상, 코드 예제 5개, SEO description 150-160자"
4. **예시 중심**: 유사한 작업의 결과물을 컨텍스트에 포함

#### 컨텍스트 최적화 원칙

```typescript
// 나쁜 예: 불완전한 컨텍스트
const badContext = {
  task: "TypeScript 블로그 작성"
  // ❌ 목표 불명확
  // ❌ 성공 기준 없음
  // ❌ 참고 자료 없음
};

// 좋은 예: 완전한 컨텍스트
const goodContext = {
  task: {
    goal: "TypeScript 5.0 심층 분석 포스트 작성 (한국어, 영어, 일본어)",
    successCriteria: [
      "각 언어 2500자 이상",
      "코드 예제 5개 이상",
      "npm run build 성공"
    ],
    constraints: ["중국어 제외", "실험적 기능 제외"]
  },
  projectRules: {
    guidelines: "...",  // CLAUDE.md 전문
    schema: {...},      // 스키마 정의
    styleGuide: "..."   // 작성 스타일
  },
  domainKnowledge: {
    research: ["리서치 결과 1500자"],
    examples: ["참고 포스트 2개"],
    references: ["공식 문서 링크"]
  },
  qualityCriteria: {
    required: ["필수 요구사항 5개"],
    preferred: ["선호 사항 4개"],
    validation: ["검증 방법 명시"]
  }
};
```

#### 컨텍스트 크기 vs 품질 트레이드오프

| 컨텍스트 크기 | 장점 | 단점 | 적합한 경우 |
|--------------|------|------|------------|
| 작음 (< 1000 토큰) | 빠름, 저렴 | 품질 저하, 반복 수정 | 간단한 작업 |
| 중간 (1000-5000) | 균형적 | - | 일반적 작업 |
| 큼 (5000-20000) | 고품질, 1회 완성 | 느림, 비쌈 | 복잡한 작업 |
| 극대 (20000+) | 완벽한 품질 | 매우 비쌈 | 중요한 작업 |

**권장**: 복잡한 작업은 큰 컨텍스트로 1회 완성하는 것이 반복 수정보다 경제적

### 변형 (Variations)

#### 점진적 컨텍스트 확장

처음에는 최소 컨텍스트로 시작하고, 에이전트가 질문하면 추가:

```typescript
async function executeWithProgressiveContext(
  task: Task,
  agent: Agent
): Promise<Result> {
  let context = createMinimalContext(task);
  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  while (attempt < MAX_ATTEMPTS) {
    const result = await agent.execute(context);

    if (result.status === 'success') {
      return result;
    }

    if (result.status === 'needs_more_context') {
      // 에이전트가 요청한 추가 정보 제공
      context = await expandContext(context, result.questions);
      attempt++;
    } else {
      throw new Error(`Failed after ${attempt} attempts`);
    }
  }
}
```

#### 컨텍스트 템플릿

작업 유형별로 미리 정의된 템플릿 사용:

```typescript
const contextTemplates = {
  'blog-writing': {
    sections: [
      'task',
      'projectRules',
      'domainKnowledge',
      'qualityCriteria',
      'resources'
    ],
    requiredFields: [
      'task.goal',
      'task.successCriteria',
      'projectRules.guidelines',
      'domainKnowledge.research',
      'qualityCriteria.validation'
    ]
  },
  'code-refactoring': {
    sections: [
      'task',
      'codebaseStructure',
      'testRequirements',
      'constraints',
      'qualityCriteria'
    ],
    requiredFields: [
      'task.goal',
      'codebaseStructure.architecture',
      'testRequirements.coverage',
      'constraints.breakingChanges'
    ]
  }
};

function createContextFromTemplate(
  type: string,
  data: any
): TaskContext {
  const template = contextTemplates[type];
  const context = {};

  for (const section of template.sections) {
    context[section] = data[section];
  }

  // 필수 필드 검증
  for (const field of template.requiredFields) {
    if (!getNestedValue(context, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return context;
}
```

---

## 실전 예시: 종합 적용

### 시나리오: 전체 사이트 SEO 감사 및 최적화

이 작업은 Deep Agents의 4가지 기둥을 모두 활용하는 복잡한 장기 작업입니다.

#### 사용자 요청

```
"블로그 사이트의 전체 SEO를 감사하고 최적화해주세요.
모든 포스트의 메타태그, 내부 링크, 사이트맵을 점검하고 개선하세요."
```

#### 1단계: 명시적 계획 (Explicit Planning)

```markdown
## 작업 계획: 전체 사이트 SEO 최적화

### 목표
- 모든 블로그 포스트 (120개)의 SEO 점수 90+ 달성
- 사이트맵 최신화
- 내부 링크 최적화 (고아 페이지 0개)

### Phase A: 현황 분석 (10분)
1. [seo-optimizer] 모든 포스트 메타태그 검사
2. [seo-optimizer] 내부 링크 그래프 분석
3. [seo-optimizer] 사이트맵 검증

### Phase B: 우선순위 결정 (5분)
4. [seo-optimizer] SEO 점수 낮은 포스트 20개 선정
5. [seo-optimizer] 고아 페이지 식별
6. [seo-optimizer] 중복 메타태그 탐지

### Phase C: 최적화 실행 (60분, 병렬)
7. [seo-optimizer] 메타태그 일괄 수정 (20개 포스트)
8. [seo-optimizer] 내부 링크 추가 (고아 페이지 해소)
9. [seo-optimizer] 사이트맵 재생성

### Phase D: 검증 (10분)
10. [site-manager] 빌드 검증
11. [seo-optimizer] 최종 SEO 점수 측정
12. [seo-optimizer] 리포트 생성

### 총 예상 시간: 85분
### 예상 토큰: 150,000
```

#### 2단계: 계층적 위임 (Hierarchical Delegation)

```typescript
// Orchestrator → SEO-Marketing Cluster
await orchestrator.delegateToCluster('seo-marketing', {
  task: '전체 사이트 SEO 감사 및 최적화',
  plan: executionPlan,
  resources: {
    allPosts: await getCollection('blog'),
    sitemapConfig: await loadConfig('sitemap'),
    seoGuidelines: await loadGuidelines('seo')
  }
});

// SEO-Optimizer (Cluster Leader) → 하위 에이전트들
await seoOptimizer.delegateToTeam([
  {
    agent: 'seo-optimizer',
    task: '메타태그 검사',
    scope: 'all posts'
  },
  {
    agent: 'backlink-manager',
    task: '내부 링크 분석',
    scope: 'all posts'
  },
  {
    agent: 'social-media-manager',
    task: 'OG 태그 검증',
    scope: 'all posts'
  }
]);
```

#### 3단계: 영속적 메모리 (Persistent Memory)

```json
// .claude/memory/task-state.json
{
  "current_task": {
    "id": "task_seo_audit_001",
    "started_at": "2025-11-18T14:00:00Z",
    "goal": "전체 사이트 SEO 최적화",
    "status": "in_progress",
    "progress": {
      "total_steps": 12,
      "completed_steps": 7,
      "current_step": 8
    },
    "context": {
      "total_posts": 120,
      "low_score_posts": [
        "typescript-basics",
        "javascript-intro",
        // ... 18개 더
      ],
      "orphan_pages": ["old-tutorial", "draft-post"],
      "average_seo_score_before": 75,
      "average_seo_score_after": 88
    }
  },
  "recovery_points": [
    {
      "id": "checkpoint-005",
      "step": 5,
      "timestamp": "2025-11-18T14:25:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/seo-audit-report.md",
        ".claude/memory/low-score-posts.json"
      ]
    },
    {
      "id": "checkpoint-010",
      "step": 10,
      "timestamp": "2025-11-18T15:10:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/optimized-posts.json",
        ".claude/memory/internal-links-added.json"
      ]
    }
  ]
}
```

#### 4단계: 극단적 컨텍스트 (Extreme Context Engineering)

```markdown
## To: seo-optimizer (SEO-Marketing Cluster Leader)

### 작업 목표
모든 블로그 포스트 (120개)의 SEO 최적화

### 현황 분석 결과
\```json
{
  "total_posts": 120,
  "average_seo_score": 75,
  "issues": {
    "missing_description": 15,
    "description_too_short": 23,
    "missing_og_tags": 8,
    "orphan_pages": 2,
    "broken_internal_links": 12
  },
  "low_score_posts": [
    {
      "slug": "typescript-basics",
      "score": 52,
      "issues": ["description 짧음 (80자)", "내부 링크 0개", "OG 이미지 없음"]
    },
    // ... 19개 더
  ]
}
\```

### 프로젝트 SEO 가이드라인
\```markdown
## SEO 최적화 기준

### 메타태그
- title: 50-60자 (초과 시 잘림)
- description: 150-160자 (필수)
- OG tags: title, description, image 모두 포함

### 내부 링크
- 각 포스트는 최소 3개 이상의 내부 링크
- 고아 페이지 (incoming link 0개) 금지
- 관련 포스트 자동 추천 활용

### 이미지
- heroImage 필수
- alt 텍스트 필수
- OG 이미지 1200x630 권장
\```

### 기존 포스트 예시
\```markdown
---
title: TypeScript 5.0의 새로운 기능 완벽 가이드
description: 데코레이터 표준화부터 const 타입 파라미터까지, TypeScript 5.0의 모든 변화를 실전 예제와 함께 알아봅니다. # 150자
heroImage: ../../../assets/blog/typescript-5-hero.jpg
tags: ["typescript", "javascript"]
---

본문 중 내부 링크 예시:
- [TypeScript 4.9 기능](./typescript-4-9)
- [타입스크립트 Best Practices](./typescript-best-practices)
\```

### 최적화 전략
1. **일괄 수정 우선**:
   - description 누락/짧음 → 자동 생성 (본문 첫 문단 활용)
   - OG 태그 누락 → Frontmatter에서 자동 추출

2. **개별 검토 필요**:
   - SEO 점수 50 이하 포스트 (5개)
   - 고아 페이지 (2개) → 관련 포스트 찾아 링크 추가

3. **자동화**:
   - 사이트맵 재생성 스크립트 실행
   - 내부 링크 검증 스크립트 실행

### 품질 기준
- SEO 점수 평균 90+ 달성
- 고아 페이지 0개
- 모든 포스트 description 150-160자
- 빌드 성공

### 사용 가능한 도구
- Read, Edit, Write: 포스트 수정
- Bash: 스크립트 실행
- Grep: 패턴 검색

### 하위 에이전트 위임 권한
- backlink-manager: 내부 링크 전략
- social-media-manager: OG 태그 최적화

### 시작!
```

#### 5단계: 자동 복구

```typescript
// Step 8 실행 중 오류 발생
try {
  await seoOptimizer.optimizeMetaTags(lowScorePosts);
} catch (error) {
  if (error.type === 'ValidationError') {
    // 품질 기준 미달 → 재시도
    const feedback = analyzeError(error);
    await seoOptimizer.optimizeMetaTags(lowScorePosts, { feedback });
  } else if (error.type === 'FileNotFound') {
    // 파일 누락 → 스킵하고 계속
    await logWarning(`Skipped missing file: ${error.file}`);
    await continueToNextStep();
  } else {
    // 복구 불가능 → 마지막 체크포인트로 롤백
    await rollbackToCheckpoint('checkpoint-005');
    throw error;
  }
}
```

#### 최종 결과

```markdown
## SEO 최적화 완료 리포트

### 요약
- 작업 시간: 82분 (계획 85분 대비 3분 단축)
- 토큰 사용: 148,000 (계획 150,000 대비 절감)
- 수정된 포스트: 38개
- 추가된 내부 링크: 45개

### 성과
| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| 평균 SEO 점수 | 75 | 92 | +23% |
| description 누락 | 15개 | 0개 | 100% |
| 고아 페이지 | 2개 | 0개 | 100% |
| 평균 내부 링크 수 | 1.8개 | 4.2개 | +133% |

### 자동 복구 이벤트
- Step 7: 1개 포스트 description 생성 실패 → 재시도 성공
- Step 8: 2개 이미지 파일 누락 → 스킵 (수동 확인 필요)

### 다음 단계
1. 누락된 이미지 2개 추가
2. 1개월 후 SEO 성과 측정
3. 신규 포스트 작성 시 자동 SEO 검증 추가
```

---

## 마치며

Deep Agents 패러다임은 AI 에이전트 시스템을 단순한 도구 사용자에서 자율적 협업 파트너로 진화시킵니다.

### 핵심 요약

| 기둥 | 핵심 개념 | 적용 방법 |
|------|----------|----------|
| Explicit Planning | 명시적이고 구조화된 계획 | 작업 시작 전 단계별 계획 생성, 의존성 명시 |
| Hierarchical Delegation | 전문 에이전트에게 위임 | 클러스터 구조로 조직, 리더 중심 조율 |
| Persistent Memory | 세션 간 상태 유지 | task-state.json, 복구 포인트, 컨텍스트 캐싱 |
| Extreme Context | 모든 관련 정보 포함 | 체크리스트 기반 완전한 컨텍스트 패키징 |

### 도입 로드맵

#### Phase 1: 기초 구축 (1주)
- [ ] orchestrator.md 작성 및 기본 위임 구현
- [ ] 클러스터 정의 (.claude/guidelines/agent-clusters.md)
- [ ] 기존 에이전트에 클러스터 정보 추가

#### Phase 2: 계획 프로토콜 (1주)
- [ ] planning-protocol.md 작성
- [ ] 계획 생성 함수 구현
- [ ] 복잡한 작업 1개로 테스트

#### Phase 3: 메모리 시스템 (2주)
- [ ] .claude/memory/ 디렉토리 구조 생성
- [ ] state-management.md 작성
- [ ] task-state.json 스키마 정의 및 구현
- [ ] 복구 포인트 자동 생성 구현

#### Phase 4: 복구 프로토콜 (1주)
- [ ] recovery-protocol.md 작성
- [ ] 실패 유형별 대응 로직 구현
- [ ] 롤백 및 재시도 메커니즘 테스트

#### Phase 5: 최적화 (지속적)
- [ ] 컨텍스트 템플릿 라이브러리 구축
- [ ] 토큰 사용량 모니터링 및 최적화
- [ ] 에이전트별 성과 지표 추적

### 기대 효과

**정량적**:
- 최대 작업 스텝: 5〜15 → 100+
- 자동 복구율: 0% → 90%+
- 컨텍스트 재사용: 0% → 80%+
- 병렬 실행 효율: 10% → 60%+

**정성적**:
- 장기 작업 지원 (다국어 콘텐츠, 전체 리팩토링)
- 자율적 문제 해결 (재시도, 재계획)
- 투명한 진행 상황 (명시적 계획)
- 중단 후 재개 가능 (영속적 메모리)

Deep Agents는 이론이 아닌 현실입니다. 지금 바로 `.claude/` 디렉토리에 적용하여 진정한 자율 AI 시스템을 구축하세요.

---

**다음 장 예고**: Chapter 13에서는 Claude Code의 성능 최적화 및 토큰 절감 전략을 다룹니다. 메타데이터 아키텍처, 증분 처리, 3계층 캐싱 시스템을 통해 60-70% 비용 절감을 달성하는 방법을 배웁니다.
