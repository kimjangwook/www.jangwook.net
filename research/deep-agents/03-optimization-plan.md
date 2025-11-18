# .claude/ 구조 최적화 계획

## 계획 수립일
2025-11-18

## 목표
현재 .claude/ 구조를 Deep Agents (Agent 2.0) 패러다임에 맞게 최적화하여:
- 복잡한 장기 작업 처리 능력 향상
- 에이전트 간 조율 및 협업 강화
- 상태 관리 및 복구 능력 확보
- 전체 시스템 일관성 및 효율성 개선

---

## Phase 1: 계획 시스템 도입 (Planning System)

### 1.1 계획 가이드라인 작성
**파일**: `.claude/guidelines/planning-protocol.md`

**내용**:
- 계획 생성 프로토콜
- 계획 형식 표준 (마크다운)
- 상태 전이 규칙 (pending → in_progress → completed/failed)
- 재계획 트리거 조건
- 계획 검토 중단점 정의

**예시 형식**:
```markdown
## 작업 계획: [작업명]

### 목표
[작업의 최종 목표]

### 단계
- [ ] 1. [단계 1] (pending)
- [ ] 2. [단계 2] (pending)
- [ ] 3. [단계 3] (pending)

### 의존성
- [단계 2]는 [단계 1] 완료 후 시작

### 리스크 및 대안
- [리스크 1]: [대안 계획]
```

### 1.2 계획 관련 에이전트 업데이트
모든 에이전트에 다음 섹션 추가:
- **Planning Protocol**: 계획 생성/검토/수정 방법
- **Checkpoints**: 계획 검토 중단점
- **Failure Recovery**: 실패 시 재계획 프로토콜

---

## Phase 2: 계층적 구조 도입 (Hierarchical Structure)

### 2.1 Orchestrator Agent 생성
**파일**: `.claude/agents/orchestrator.md`

**역할**:
- 복잡한 작업의 분해 및 할당
- 에이전트 클러스터 조율
- 진행 상황 모니터링
- 결과 합성 및 품질 검증

**주요 기능**:
1. 작업 분석 및 분해
2. 적합한 에이전트/클러스터 선택
3. 서브에이전트 생성 및 위임
4. 중간 결과 수집 및 합성
5. 품질 검증 및 최종 결과 생성

### 2.2 에이전트 클러스터 정의
**파일**: `.claude/guidelines/agent-clusters.md`

**클러스터 구조**:

```
orchestrator (총괄 조율)
│
├── content-creation/ (콘텐츠 생성)
│   ├── content-planner
│   ├── writing-assistant
│   ├── editor
│   └── image-generator
│
├── research-analysis/ (연구 및 분석)
│   ├── web-researcher
│   ├── post-analyzer
│   ├── analytics
│   └── analytics-reporter
│
├── seo-marketing/ (SEO 및 마케팅)
│   ├── seo-optimizer
│   ├── backlink-manager
│   └── social-media-manager
│
├── content-discovery/ (콘텐츠 발견)
│   └── content-recommender
│
└── operations/ (운영)
    ├── site-manager
    ├── portfolio-curator
    ├── learning-tracker
    ├── improvement-tracker
    └── prompt-engineer
```

### 2.3 클러스터별 리더 에이전트 지정
각 클러스터에 리더 에이전트 역할 추가:
- **content-creation**: writing-assistant (리더)
- **research-analysis**: web-researcher (리더)
- **seo-marketing**: seo-optimizer (리더)
- **operations**: site-manager (리더)

리더 역할:
- 클러스터 내 작업 조율
- 클러스터 간 의존성 관리
- 오케스트레이터에게 결과 보고

---

## Phase 3: 상태 관리 시스템 (State Management)

### 3.1 메모리 디렉토리 구조
```
.claude/
└── memory/
    ├── task-state.json      # 현재 작업 상태
    ├── task-history.json    # 작업 이력
    ├── shared-context.json  # 공유 컨텍스트
    └── agents/              # 에이전트별 메모리
        ├── writing-assistant.json
        ├── web-researcher.json
        └── ...
```

### 3.2 task-state.json 스키마
```json
{
  "current_task": {
    "id": "task-2025-11-18-001",
    "name": "블로그 포스트 작성",
    "status": "in_progress",
    "started_at": "2025-11-18T10:00:00Z",
    "plan": {
      "goal": "TypeScript 5.0 기능 블로그 포스트 작성",
      "steps": [
        {"id": 1, "name": "리서치", "status": "completed", "agent": "web-researcher"},
        {"id": 2, "name": "이미지 생성", "status": "in_progress", "agent": "image-generator"},
        {"id": 3, "name": "콘텐츠 작성", "status": "pending", "agent": "writing-assistant"}
      ]
    },
    "context": {
      "topic": "TypeScript 5.0",
      "languages": ["ko", "ja", "en"],
      "tags": ["typescript", "programming"]
    }
  },
  "pending_tasks": [],
  "last_updated": "2025-11-18T10:30:00Z"
}
```

### 3.3 상태 관리 가이드라인
**파일**: `.claude/guidelines/state-management.md`

**내용**:
- 상태 파일 읽기/쓰기 프로토콜
- 상태 전이 규칙
- 동시성 처리 (락/트랜잭션)
- 복구 절차

---

## Phase 4: 복구 및 재계획 프로토콜 (Recovery Protocol)

### 4.1 실패 유형 정의
1. **도구 실패**: API 오류, 네트워크 문제
2. **검증 실패**: 품질 체크 실패
3. **의존성 실패**: 선행 작업 실패
4. **컨텍스트 실패**: 정보 부족

### 4.2 복구 프로토콜
**파일**: `.claude/guidelines/recovery-protocol.md`

**복구 절차**:
```
1. 실패 감지 및 분류
2. 상태 저장 (현재까지 진행 상황)
3. 복구 전략 선택:
   - 재시도: 일시적 오류
   - 대안 경로: 영구 오류
   - 재계획: 구조적 문제
   - 에스컬레이션: 해결 불가
4. 복구 실행
5. 상태 업데이트
```

### 4.3 재계획 트리거
- 3회 연속 재시도 실패
- 의존성 변경
- 사용자 요청 변경
- 리소스 제약 발생

---

## Phase 5: 에이전트 프롬프트 강화 (Agent Enhancement)

### 5.1 공통 섹션 추가
모든 에이전트에 다음 섹션 표준화:

```markdown
## Orchestration Protocol

### 오케스트레이터로부터 호출 시
- 작업 컨텍스트 확인
- 계획 단계 파악
- 필요 리소스 확인

### 결과 보고 형식
- 결과 요약 (100자 이내)
- 성공/실패 상태
- 생성된 아티팩트 목록
- 다음 단계 제안

### 상태 업데이트
- 작업 시작 시 상태 변경
- 진행률 주기적 업데이트
- 완료/실패 시 상태 저장

## Recovery Behavior

### 실패 시 행동
1. 오류 로깅
2. 상태 저장
3. 복구 시도 (최대 3회)
4. 실패 시 상위 에이전트 보고

### 컨텍스트 부족 시
- 명시적으로 요청
- 기본값 사용 시 명시
- 가정 사항 기록
```

### 5.2 에이전트별 클러스터 정보 추가
각 에이전트에 클러스터 메타데이터 추가:
```markdown
## Cluster Information

- **클러스터**: content-creation
- **역할**: primary / support
- **협업 에이전트**: editor, image-generator
- **리더**: writing-assistant
```

---

## Phase 6: Commands 업데이트 (Command Enhancement)

### 6.1 오케스트레이션 패턴 적용
기존 Commands를 오케스트레이터 패턴으로 업데이트:

**변경 전**:
```
/write-post → writing-assistant 직접 호출
```

**변경 후**:
```
/write-post → orchestrator → 클러스터 조율 → 에이전트 실행
```

### 6.2 상태 관리 통합
Commands에 상태 관리 로직 추가:
- 작업 시작 시 task-state.json 생성
- 진행 중 상태 업데이트
- 완료 시 task-history.json에 기록

---

## 구현 우선순위

### 높음 (Phase 1-2)
1. 계획 가이드라인 작성
2. Orchestrator Agent 생성
3. 클러스터 정의

### 중간 (Phase 3-4)
4. 메모리 디렉토리 구조 생성
5. 상태 관리 가이드라인
6. 복구 프로토콜

### 낮음 (Phase 5-6)
7. 에이전트 프롬프트 강화
8. Commands 업데이트

---

## 예상 효과

### 정량적
- 복잡한 작업 처리 능력: 5-15단계 → 100+ 단계
- 실패 복구율: 향상 (재계획으로 대응)
- 컨텍스트 관리 효율: 개선 (상태 외부화)

### 정성적
- 에이전트 간 조율 개선
- 작업 추적 가능성 향상
- 장기 작업 안정성 확보
- 학습 데이터 축적 가능

---

## 리스크 및 대응

### 리스크 1: 복잡성 증가
**원인**: 계층 구조, 상태 관리 추가
**대응**: 점진적 도입, 문서화 철저

### 리스크 2: 성능 오버헤드
**원인**: 상태 읽기/쓰기 추가
**대응**: 필요 시만 상태 업데이트, 비동기 처리

### 리스크 3: 기존 워크플로우 호환성
**원인**: 구조 변경
**대응**: 하위 호환성 유지, 점진적 마이그레이션

---

## 다음 단계

1. Phase 1 계획 가이드라인 작성 시작
2. Orchestrator Agent 프로토타입 개발
3. 파일럿 테스트 (단순 워크플로우)
4. 점진적 확장
