# 에이전트 클러스터 정의

## 개요

Deep Agents 패러다임에서 에이전트들은 기능별 클러스터로 조직됩니다. 각 클러스터는 관련 기능을 전문적으로 담당하며, 리더 에이전트가 클러스터 내 조율을 담당합니다.

---

## 클러스터 구조

```
orchestrator (총괄 조율)
│
├── content-creation/ (콘텐츠 생성)
│   ├── writing-assistant (리더)
│   ├── content-planner
│   ├── editor
│   └── image-generator
│
├── research-analysis/ (연구 및 분석)
│   ├── web-researcher (리더)
│   ├── post-analyzer
│   ├── analytics
│   └── analytics-reporter
│
├── seo-marketing/ (SEO 및 마케팅)
│   ├── seo-optimizer (리더)
│   ├── backlink-manager
│   └── social-media-manager
│
├── content-discovery/ (콘텐츠 발견)
│   └── content-recommender (리더)
│
└── operations/ (운영)
    ├── site-manager (리더)
    ├── portfolio-curator
    ├── learning-tracker
    ├── improvement-tracker
    └── prompt-engineer
```

---

## 클러스터 상세

### 1. content-creation (콘텐츠 생성)

#### 역할
블로그 포스트, 문서, 이미지 등 콘텐츠 생성 전반을 담당합니다.

#### 멤버

| 에이전트 | 역할 | 핵심 기능 |
|---------|------|----------|
| **writing-assistant** (리더) | 콘텐츠 작성 | 블로그 포스트 작성, 다국어 현지화, 기술 문서 |
| content-planner | 전략 수립 | 주제 계획, 캘린더 관리, 트렌드 분석 |
| editor | 품질 검토 | 문법, 스타일, 메타데이터 검증 |
| image-generator | 이미지 생성 | 히어로 이미지, 다이어그램, 삽화 |

#### 워크플로우 예시
```
content-planner → writing-assistant → editor
                ↳ image-generator ↗
```

#### 클러스터 내 협업
- writing-assistant가 image-generator에게 이미지 요청
- editor가 writing-assistant에게 수정 요청
- content-planner가 writing-assistant에게 주제 전달

---

### 2. research-analysis (연구 및 분석)

#### 역할
정보 수집, 데이터 분석, 인사이트 도출을 담당합니다.

#### 멤버

| 에이전트 | 역할 | 핵심 기능 |
|---------|------|----------|
| **web-researcher** (리더) | 웹 리서치 | Brave Search 활용, 기술 검증, 최신 정보 |
| post-analyzer | 콘텐츠 분석 | 메타데이터 추출, 카테고리 분류, 난이도 평가 |
| analytics | 트래픽 분석 | GA4 데이터 분석, 성과 측정 |
| analytics-reporter | 리포트 생성 | 분석 결과 문서화, 인사이트 도출 |

#### 워크플로우 예시
```
analytics → analytics-reporter
web-researcher → post-analyzer
```

#### 제약사항
- Brave Search API: 요청 간 2초 지연 필수
- GA4: Property ID 필요

---

### 3. seo-marketing (SEO 및 마케팅)

#### 역할
검색 엔진 최적화 및 마케팅 활동을 담당합니다.

#### 멤버

| 에이전트 | 역할 | 핵심 기능 |
|---------|------|----------|
| **seo-optimizer** (리더) | SEO 최적화 | 메타태그, 사이트맵, 내부 링크 |
| backlink-manager | 백링크 관리 | 백링크 전략, 외부 링크 관리 |
| social-media-manager | 소셜 미디어 | 공유 자동화, 소셜 전략 |

#### 워크플로우 예시
```
seo-optimizer → backlink-manager
             ↳ social-media-manager
```

---

### 4. content-discovery (콘텐츠 발견)

#### 역할
콘텐츠 추천 및 관계 분석을 담당합니다.

#### 멤버

| 에이전트 | 역할 | 핵심 기능 |
|---------|------|----------|
| **content-recommender** (리더) | 추천 생성 | LLM 기반 의미론적 추천, 6차원 분석 |

#### 특징
- TF-IDF 대신 Claude LLM 활용
- 메타데이터 기반 60-70% 토큰 절감

---

### 5. operations (운영)

#### 역할
사이트 관리, 포트폴리오, 추적 및 개선을 담당합니다.

#### 멤버

| 에이전트 | 역할 | 핵심 기능 |
|---------|------|----------|
| **site-manager** (리더) | 사이트 관리 | 빌드, 배포, 성능 최적화 |
| portfolio-curator | 포트폴리오 | 프로젝트 포트폴리오 관리 |
| learning-tracker | 학습 추적 | 학습 목표, 기술 트렌드 |
| improvement-tracker | 개선 추적 | 지속적 개선 사항 추적 |
| prompt-engineer | 프롬프트 최적화 | Verbalized Sampling, 프롬프트 개선 |

#### 워크플로우 예시
```
learning-tracker → content-planner (주제 제안)
improvement-tracker → site-manager (개선 실행)
prompt-engineer → 모든 에이전트 (프롬프트 개선)
```

---

## 리더 에이전트 역할

### 책임

1. **클러스터 내 작업 조율**: 멤버 간 작업 분배 및 순서 관리
2. **품질 관리**: 클러스터 산출물 검증
3. **오케스트레이터 보고**: 결과 합성 및 상위 보고
4. **리소스 관리**: 클러스터 내 리소스 할당

### 추가 프롬프트 섹션

리더 에이전트는 다음 섹션을 포함해야 합니다:

```markdown
## Cluster Leadership

### 클러스터
[클러스터명]

### 멤버 에이전트
- [에이전트 1]: [역할]
- [에이전트 2]: [역할]

### 조율 프로토콜
1. 작업 수신 시 분해 및 할당
2. 멤버 결과 수집 및 검증
3. 결과 합성 및 상위 보고

### 보고 형식
[오케스트레이터에게 보고하는 형식]
```

---

## 클러스터 간 의존성

### 일반적인 의존성 패턴

```
research-analysis → content-creation
                 ↳ seo-marketing

content-creation → content-discovery (메타데이터 생성 후 추천)
                ↳ operations (빌드 및 배포)

analytics (operations) → content-planner (다음 콘텐츠 전략)
```

### 의존성 관리 규칙

1. **명시적 선언**: 의존성은 계획에 명시
2. **데이터 전달**: 의존 데이터는 공유 컨텍스트 또는 파일로 전달
3. **순서 준수**: 의존성 완료 후 다음 단계 실행
4. **병렬 가능**: 독립적인 클러스터는 병렬 실행

---

## 클러스터 통신 형식

### 클러스터 간 요청

```markdown
## 클러스터 요청

### From
[요청 클러스터/에이전트]

### To
[대상 클러스터/에이전트]

### 요청
[작업 설명]

### 필요 입력
- [입력 1]: [설명]

### 예상 출력
- [출력 1]: [형식/위치]

### 우선순위
[높음/중간/낮음]
```

### 클러스터 간 응답

```markdown
## 클러스터 응답

### From
[응답 클러스터/에이전트]

### To
[요청 클러스터/에이전트]

### 상태
[완료/실패/부분]

### 산출물
- [산출물 1]: [경로/내용]

### 비고
[추가 정보]
```

---

## 사용 사례별 클러스터 활용

### 블로그 포스트 작성

```
1. research-analysis (web-researcher): 주제 리서치
2. content-creation (전체): 콘텐츠 생성
3. content-discovery (content-recommender): 추천 생성
4. operations (site-manager): 빌드 검증
```

### GA 분석 리포트

```
1. operations (analytics): 데이터 수집
2. research-analysis (analytics-reporter): 리포트 생성
3. content-creation (writing-assistant): 블로그 포스트화
```

### SEO 전체 최적화

```
1. research-analysis (post-analyzer): 현재 상태 분석
2. seo-marketing (전체): 최적화 실행
3. operations (site-manager): 변경 배포
```

---

## 확장 고려사항

### 새 클러스터 추가 시

1. 클러스터 역할 정의
2. 리더 에이전트 지정
3. 멤버 에이전트 할당
4. 워크플로우 설계
5. 의존성 정의
6. 이 문서 업데이트

### 새 에이전트 추가 시

1. 적합한 클러스터 선택
2. 역할 및 기능 정의
3. 클러스터 내 협업 관계 정의
4. 리더 에이전트와 통신 방식 정의
5. 이 문서 업데이트

---

## 관련 문서

- [orchestrator.md](../agents/orchestrator.md): 오케스트레이터 에이전트
- [planning-protocol.md](./planning-protocol.md): 계획 프로토콜
- 각 에이전트 문서: `.claude/agents/[에이전트명].md`
