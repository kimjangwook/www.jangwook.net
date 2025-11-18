# 상태 관리 프로토콜 (State Management Protocol)

## 개요

Deep Agents에서 상태 관리는 컨텍스트 윈도우 제한을 극복하고 장기 작업을 지원하는 핵심 메커니즘입니다. 외부 저장소를 활용하여 작업 상태, 이력, 공유 컨텍스트를 영구적으로 관리합니다.

---

## 메모리 구조

```
.claude/memory/
├── task-state.json       # 현재 작업 상태
├── task-history.json     # 작업 이력
├── shared-context.json   # 공유 컨텍스트
└── agents/               # 에이전트별 메모리
    ├── orchestrator.json
    ├── writing-assistant.json
    └── ...
```

---

## task-state.json

### 목적
현재 진행 중인 작업의 상태를 추적합니다.

### 스키마

```json
{
  "version": "1.0",
  "current_task": {
    "id": "task-YYYY-MM-DD-NNN",
    "name": "작업명",
    "status": "in_progress",
    "started_at": "ISO-8601",
    "updated_at": "ISO-8601",
    "orchestrator": "orchestrator",
    "plan": {
      "goal": "최종 목표",
      "success_criteria": ["기준 1", "기준 2"],
      "steps": [
        {
          "id": 1,
          "name": "단계명",
          "agent": "에이전트명",
          "cluster": "클러스터명",
          "status": "pending|in_progress|completed|failed",
          "dependencies": [],
          "started_at": null,
          "completed_at": null,
          "output": null,
          "error": null
        }
      ],
      "current_step": 1
    },
    "context": {
      "user_request": "원본 요청",
      "constraints": [],
      "resources": []
    },
    "artifacts": [],
    "issues": []
  },
  "pending_tasks": [],
  "last_updated": "ISO-8601"
}
```

### 상태 값

| 상태 | 설명 |
|------|------|
| `pending` | 시작 대기 |
| `in_progress` | 실행 중 |
| `completed` | 성공 완료 |
| `failed` | 실패 |
| `paused` | 일시 중지 |
| `cancelled` | 취소됨 |

---

## task-history.json

### 목적
완료된 작업의 이력을 보관하여 학습 및 참조에 활용합니다.

### 스키마

```json
{
  "version": "1.0",
  "tasks": [
    {
      "id": "task-YYYY-MM-DD-NNN",
      "name": "작업명",
      "result": "success|failure|partial",
      "started_at": "ISO-8601",
      "completed_at": "ISO-8601",
      "duration_seconds": 300,
      "summary": "작업 결과 요약",
      "artifacts": [
        {
          "type": "file|data",
          "path": "경로",
          "description": "설명"
        }
      ],
      "metrics": {
        "steps_total": 5,
        "steps_completed": 5,
        "retries": 1,
        "tokens_used": 10000
      },
      "lessons": ["배운 점 1", "배운 점 2"]
    }
  ],
  "statistics": {
    "total_tasks": 100,
    "success_rate": 0.95,
    "avg_duration_seconds": 240
  }
}
```

---

## shared-context.json

### 목적
에이전트 간 공유해야 하는 컨텍스트 정보를 저장합니다.

### 스키마

```json
{
  "version": "1.0",
  "session": {
    "id": "session-YYYY-MM-DD-NNN",
    "started_at": "ISO-8601"
  },
  "shared_data": {
    "current_topic": "주제",
    "target_languages": ["ko", "ja", "en"],
    "research_results": {},
    "intermediate_outputs": {}
  },
  "preferences": {
    "tone": "professional",
    "style": "technical"
  },
  "last_updated": "ISO-8601"
}
```

---

## 에이전트별 메모리

### 목적
각 에이전트의 학습 데이터, 선호도, 캐시를 저장합니다.

### 스키마 (예: writing-assistant.json)

```json
{
  "version": "1.0",
  "agent": "writing-assistant",
  "preferences": {
    "default_tone": "친근하면서 전문적",
    "preferred_structure": "표준"
  },
  "cache": {
    "recent_topics": [],
    "common_patterns": []
  },
  "statistics": {
    "posts_written": 50,
    "avg_quality_score": 0.92
  },
  "last_updated": "ISO-8601"
}
```

---

## 상태 관리 프로토콜

### 읽기 프로토콜

```python
# 1. 파일 존재 확인
if not exists('.claude/memory/task-state.json'):
    initialize_state()

# 2. 상태 읽기
state = read('.claude/memory/task-state.json')

# 3. 유효성 검증
validate_state(state)

# 4. 사용
current_task = state['current_task']
```

### 쓰기 프로토콜

```python
# 1. 상태 업데이트
state['current_task']['plan']['steps'][step_id]['status'] = 'completed'
state['last_updated'] = datetime.now().isoformat()

# 2. 유효성 검증
validate_state(state)

# 3. 저장
write('.claude/memory/task-state.json', state)
```

### 트랜잭션 패턴

```python
# 원자적 업데이트를 위한 패턴
def update_state(update_fn):
    state = read('.claude/memory/task-state.json')
    backup = copy(state)

    try:
        updated_state = update_fn(state)
        validate_state(updated_state)
        write('.claude/memory/task-state.json', updated_state)
    except Exception as e:
        # 롤백
        write('.claude/memory/task-state.json', backup)
        raise e
```

---

## 상태 전이

### 작업 상태 전이

```
[없음] → pending → in_progress → completed
                              ↘ failed → [복구] → in_progress
                              ↘ paused → [재개] → in_progress
                              ↘ cancelled
```

### 단계 상태 전이

```
pending → in_progress → completed
                     ↘ failed → retry (max 3) → in_progress
                              ↘ escalate
```

---

## 초기화

### 새 작업 시작 시

```json
{
  "current_task": {
    "id": "task-2025-11-18-001",
    "name": "새 작업",
    "status": "pending",
    "started_at": "2025-11-18T10:00:00Z",
    "plan": {
      "goal": "",
      "success_criteria": [],
      "steps": []
    },
    "context": {}
  }
}
```

### 빈 상태

```json
{
  "version": "1.0",
  "current_task": null,
  "pending_tasks": [],
  "last_updated": "2025-11-18T10:00:00Z"
}
```

---

## 동시성 관리

### 단일 작업 원칙
- 한 번에 하나의 current_task만 활성
- 새 작업 시작 전 현재 작업 완료 필요

### 충돌 방지
- 읽기 후 즉시 쓰기
- 장시간 잠금 지양
- 상태 업데이트 최소화

---

## 정리 및 유지보수

### task-history.json 정리
- 최근 100개 작업만 보관
- 30일 이상 경과 시 요약만 보관

### 캐시 정리
- 에이전트별 캐시 주기적 정리
- 미사용 데이터 제거

### 백업
- 중요 상태 변경 전 백업 생성
- `.claude/memory/backup/` 디렉토리 활용

---

## 오류 처리

### 파일 읽기 실패
1. 백업에서 복원 시도
2. 초기 상태로 시작
3. 사용자에게 알림

### 유효성 검증 실패
1. 오류 위치 식별
2. 자동 수정 시도
3. 수정 불가 시 초기화

### 일관성 오류
1. 상태 불일치 감지
2. task-history와 대조
3. 정상 상태로 복원

---

## 베스트 프랙티스

### DO
- 매 단계 완료 시 상태 업데이트
- 유효성 검증 항상 수행
- 오류 발생 시 상태 저장
- 정기적으로 정리 수행

### DON'T
- 불필요한 상태 업데이트
- 검증 없이 저장
- 오류 무시
- 수동 편집 (스키마 위반 위험)

---

## 관련 문서

- [planning-protocol.md](./planning-protocol.md): 계획 프로토콜
- [recovery-protocol.md](./recovery-protocol.md): 복구 프로토콜
- [orchestrator.md](../agents/orchestrator.md): 오케스트레이터 에이전트
