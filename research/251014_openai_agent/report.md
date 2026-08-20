# OpenAI Agent Kit & Agent Builder 연구 보고서

**연구 날짜**: 2025년 10월 14일
**주제**: OpenAI Agent Kit를 활용한 AI 에이전트 구축 및 배포 방법

---

## 목차

1. [Executive Summary](#executive-summary)
2. [Agent Kit 개요](#agent-kit-개요)
3. [Agent Builder 사용법](#agent-builder-사용법)
4. [배포 방법](#배포-방법)
5. [연구 계획](#연구-계획)
6. [실행 로드맵](#실행-로드맵)
7. [참고 자료](#참고-자료)

---

## Executive Summary

### 핵심 발견사항

2025년 10월 6일, OpenAI는 DevDay 2025에서 **AgentKit**을 공식 발표했습니다. AgentKit은 개발자와 기업이 AI 에이전트를 구축, 배포, 최적화할 수 있는 완전한 도구 세트입니다.

**주요 구성요소**:
- **Agent Builder**: 비주얼 캔버스를 통한 멀티 에이전트 워크플로우 생성
- **ChatKit**: 프론트엔드에 임베딩 가능한 채팅 UI 툴킷
- **Connector Registry**: 데이터 및 툴 연결 중앙 관리
- **Evals**: 에이전트 성능 평가 플랫폼
- **Agents SDK**: Python 및 TypeScript 지원

### 핵심 메시지

기존에 에이전트를 구축하려면 복잡한 오케스트레이션, 커스텀 커넥터, 수동 평가 파이프라인, 프롬프트 튜닝, 그리고 수주간의 프론트엔드 작업이 필요했습니다. **AgentKit은 이 모든 것을 통합**하여 개발 시간을 획기적으로 단축시킵니다.

**실제 사례**:
- **Ramp**: 몇 개월 걸리던 작업을 몇 시간으로 단축
- **LY Corporation**: 2시간 만에 첫 멀티 에이전트 워크플로우 구축
- **Canva**: ChatKit으로 2주 이상의 개발 시간 절약

---

## Agent Kit 개요

### 1. Agent Builder

**정의**: 멀티 스텝 에이전트 워크플로우를 시각적으로 생성할 수 있는 캔버스

**주요 기능**:
- 드래그 앤 드롭 노드 시스템
- 템플릿 제공 (일반적인 워크플로우 패턴)
- 실시간 프리뷰 및 디버깅
- 버전 관리 및 인라인 평가 설정
- 완전한 코드 생성 (배포 준비 완료)

**사용 가능한 노드 타입**:
- **Agent nodes**: 특정 작업을 수행하는 에이전트
- **Tool nodes**: 외부 서비스 연결 (MCP, 커넥터)
- **Guardrails**: PII 마스킹, 탈옥 감지 등 안전장치
- **Logic nodes**: If/else, 라우팅, 조건부 로직
- **File search**: 벡터 스토어 검색
- **User approval**: 사람의 승인이 필요한 단계

**워크플로우 생성 프로세스**:

```
1. Agent Builder 접속 (platform.openai.com/agent-builder)
   ↓
2. 템플릿 선택 또는 빈 캔버스에서 시작
   ↓
3. 노드 추가 및 연결 (드래그 앤 드롭)
   ↓
4. 각 노드 설정 (입력/출력, 프롬프트 등)
   ↓
5. 프리뷰 모드에서 테스트
   ↓
6. Evaluate 기능으로 성능 평가
   ↓
7. 워크플로우 퍼블리시 (버전 생성)
```

**예제 워크플로우 - 숙제 도우미**:
```
Start → Jailbreak Guardrail → Classification Agent → If/Else
  ├─ Math Agent → Hallucination Guardrail → End
  ├─ Science Agent → Hallucination Guardrail → End
  └─ Writing Agent → Hallucination Guardrail → End
```

### 2. ChatKit

**정의**: 에이전트를 제품에 임베딩하기 위한 커스터마이징 가능한 채팅 UI 컴포넌트

**두 가지 구현 방식**:

#### A. 권장 방식 (Recommended Integration)
- OpenAI가 백엔드 호스팅 및 스케일링
- 프론트엔드에 ChatKit 임베드
- 빠른 시작 및 간편한 관리

#### B. 고급 방식 (Advanced Integration)
- 자체 인프라에서 ChatKit 실행
- Agents SDK 사용하여 커스텀 백엔드 연결
- 완전한 제어 및 커스터마이징

**ChatKit 특징**:
- 스트리밍 응답 처리
- 스레드 관리
- 생각 과정 시각화
- 파일 첨부 지원
- 툴 호출 표시
- 커스텀 테마 및 브랜딩

### 3. Connector Registry

**정의**: 데이터 소스를 중앙에서 관리하는 관리자 패널

**지원 커넥터**:
- Dropbox
- Google Drive
- SharePoint
- Microsoft Teams
- 서드파티 MCP (Model Context Protocol)

**주요 기능**:
- 여러 워크스페이스와 조직에 걸쳐 통합 관리
- ChatGPT와 API 전반에 걸친 데이터 소스 통합
- 엔터프라이즈 수준의 거버넌스 및 유지 관리

### 4. Evals (평가 플랫폼)

**새로운 기능**:

1. **Datasets**: 처음부터 에이전트 평가 빠르게 구축
2. **Trace grading**: 엔드투엔드 워크플로우 평가 자동화
3. **Automated prompt optimization**: 사람의 주석 및 그레이더 출력 기반 프롬프트 개선
4. **Third-party model support**: 다른 제공업체의 모델도 평가 가능

**성능 향상 사례**:
- Carlyle: 개발 시간 50% 단축, 정확도 30% 향상
- Rippling: 평가 플랫폼으로 에이전트 품질 대폭 개선

### 5. Guardrails

**정의**: 에이전트를 의도하지 않거나 악의적인 동작으로부터 보호하는 모듈식 안전 계층

**기능**:
- PII 마스킹 또는 플래깅
- 탈옥 감지
- 기타 안전장치 적용

**사용 방법**:
- Agent Builder에서 직접 활성화
- Python/JavaScript 라이브러리로 독립 배포
- 오픈소스 (GitHub에서 확인 가능)

---

## Agent Builder 사용법

### Step 1: Agent Builder 접속

**URL**: https://platform.openai.com/agent-builder

**요구사항**:
- OpenAI API 계정
- API 키 (환경변수로 설정)

### Step 2: 워크플로우 설계

#### 2.1 템플릿 선택 또는 빈 캔버스

Agent Builder는 다음 템플릿을 제공합니다:
- Customer service automation
- Research assistant
- Data analysis agent
- Knowledge base assistant
- HR onboarding helper

또는 빈 캔버스에서 처음부터 시작할 수 있습니다.

#### 2.2 노드 추가 및 연결

**좌측 사이드바에서 노드 선택**:
- Agent
- Note
- File search
- Guardrails
- MCP
- User approval
- Logic (If/Else, Router)

**노드 연결**:
1. 노드의 출력 포트를 다음 노드의 입력 포트로 드래그
2. 타입이 일치하는 엣지만 생성 가능
3. 각 연결은 데이터 계약을 명시

#### 2.3 노드 설정

각 노드를 클릭하여 설정:
- **Agent 노드**:
  - Model 선택 (GPT-5, GPT-4o, o4-mini 등)
  - Instructions (프롬프트)
  - Tools 연결
  - Temperature, max tokens 등

- **Guardrails 노드**:
  - Type 선택 (PII, Jailbreak, Hallucination 등)
  - Action (mask, flag, block)

- **Logic 노드**:
  - Condition 설정
  - Branch routing

### Step 3: 프리뷰 및 디버깅

**Preview 모드**:
1. 상단의 "Preview" 버튼 클릭
2. 샘플 입력 제공
3. 각 노드의 실행 관찰
4. 출력 확인

**디버깅 팁**:
- 각 노드의 입력/출력 데이터 확인
- 에러 메시지 확인
- 실행 시간 모니터링

### Step 4: 평가 (Evaluate)

**Evaluate 버튼 클릭**:
1. Trace 선택 (또는 trace 세트)
2. 커스텀 그레이더 실행
3. 전체 워크플로우 성능 평가

### Step 5: 퍼블리시

**Publish 버튼 클릭**:
- 새로운 메이저 버전 생성 (스냅샷)
- Workflow ID 생성
- 이후 ChatKit 또는 SDK에서 사용

**자동 저장**:
- Agent Builder는 작업 중 자동으로 저장
- 이전 버전으로 롤백 가능

---

## 배포 방법

### 방법 1: ChatKit 임베딩 (권장)

이 방법은 OpenAI가 백엔드를 호스팅하며, 가장 빠르고 간편합니다.

#### 1.1 워크플로우 생성

Agent Builder에서 워크플로우를 생성하고 퍼블리시합니다.
- Workflow ID를 기록합니다 (예: `wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1`)

#### 1.2 서버 사이드 설정

**서버에서 ChatKit 세션 생성 엔드포인트 작성**:

```python
# server.py (FastAPI 예제)
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@app.post("/api/chatkit/session")
def create_chatkit_session():
    session = openai_client.chatkit.sessions.create({
        "workflow": {
            "id": "wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1"  # 실제 workflow ID
        },
        "user": "user_device_id"  # 사용자 식별자
    })

    return {
        "client_secret": session.client_secret
    }
```

**또는 TypeScript/JavaScript**:

```typescript
// chatkit.ts
export default async function getChatKitSessionToken(
  deviceId: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      "Authorization": "Bearer " + process.env.OPENAI_API_SECRET_KEY,
    },
    body: JSON.stringify({
      workflow: {
        id: "wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1"
      },
      user: deviceId,
    }),
  });

  const { client_secret } = await response.json();
  return client_secret;
}
```

#### 1.3 프론트엔드 설정

**1) ChatKit React 바인딩 설치**:

```bash
npm install @openai/chatkit-react
```

**2) HTML에 ChatKit 스크립트 추가**:

```html
<!-- index.html -->
<script
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
  async
></script>
```

**3) React 컴포넌트에서 ChatKit 렌더링**:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // 세션 갱신 로직
        }

        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return (
    <ChatKit
      control={control}
      className="h-[600px] w-[320px]"
    />
  );
}
```

#### 1.4 커스터마이징

**테마 설정**:
- 색상, 폰트, 레이아웃 커스터마이징
- 브랜드에 맞게 조정

**위젯 추가**:
- 날씨, 일정, 결제 등 커스텀 위젯
- Widget builder 사용 (https://widgets.chatkit.studio)

**액션 추가**:
- 사용자 액션에 대한 커스텀 핸들러
- 버튼, 폼, 기타 인터랙티브 요소

### 방법 2: 고급 통합 (Advanced Integration)

자체 인프라에서 ChatKit를 실행하고 싶다면 이 방법을 사용합니다.

#### 2.1 Agents SDK 설치

**Python**:
```bash
pip install openai-agents
```

**TypeScript**:
```bash
npm install @openai/agents-sdk
```

#### 2.2 커스텀 백엔드 구축

**Python 예제**:

```python
from openai_agents import Agent, Workflow

# 에이전트 정의
research_agent = Agent(
    name="Research Agent",
    model="gpt-4o",
    instructions="You are a helpful research assistant.",
    tools=[web_search_tool, file_search_tool]
)

# 워크플로우 정의
workflow = Workflow()
workflow.add_node(research_agent)
workflow.add_guardrails(pii_guardrail)

# 실행
result = await workflow.run(user_input="Tell me about AI agents")
```

**TypeScript 예제**:

```typescript
import { Agent, Workflow } from '@openai/agents-sdk';

const researchAgent = new Agent({
  name: "Research Agent",
  model: "gpt-4o",
  instructions: "You are a helpful research assistant.",
  tools: [webSearchTool, fileSearchTool]
});

const workflow = new Workflow();
workflow.addNode(researchAgent);
workflow.addGuardrails(piiGuardrail);

const result = await workflow.run({
  userInput: "Tell me about AI agents"
});
```

#### 2.3 ChatKit 위젯 사용

ChatKit Python/JS SDK를 사용하여 프론트엔드 구축:

```bash
# Python
pip install openai-chatkit-python

# JavaScript
npm install @openai/chatkit-js
```

#### 2.4 배포

- 자체 서버에 배포 (AWS, GCP, Azure 등)
- Docker 컨테이너화
- Kubernetes 오케스트레이션
- 로드 밸런싱 및 스케일링

### 방법 3: Agents SDK만 사용

ChatKit 없이 완전히 커스텀 UI를 구축하려면 Agents SDK만 사용할 수 있습니다.

#### 3.1 API 직접 호출

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 워크플로우 실행
response = client.workflows.run(
    workflow_id="wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1",
    input={
        "message": "Tell me about AI agents"
    }
)

print(response.output)
```

#### 3.2 스트리밍 응답

```python
for chunk in client.workflows.stream(
    workflow_id="wf_...",
    input={"message": "Tell me about AI agents"}
):
    print(chunk.delta, end="")
```

---

## 연구 계획

### Phase 1: 이해 및 학습 (1-2주)

**목표**: Agent Kit 생태계에 대한 깊은 이해

**작업**:
1. 공식 문서 완독
   - Agent Builder 가이드
   - ChatKit 문서
   - Agents SDK 레퍼런스
   - Node reference

2. 튜토리얼 완료
   - Agent Builder quickstart
   - ChatKit quickstart
   - 샘플 앱 클론 및 실행

3. 개념 정리
   - Workflow vs Agent 차이
   - Node 타입별 사용 사례
   - 배포 방법별 장단점

### Phase 2: 프로토타입 개발 (2-3주)

**목표**: 간단한 에이전트 시스템 구축

**작업**:

#### 2.1 Use Case 선정

예시 use case:
- **고객 지원 에이전트**: FAQ 자동 응답, 티켓 라우팅
- **연구 도우미**: 웹 검색, 논문 요약
- **데이터 분석 에이전트**: CSV 분석, 차트 생성
- **코드 리뷰 에이전트**: PR 리뷰, 스타일 체크

#### 2.2 Agent Builder에서 워크플로우 설계

```
예시: 고객 지원 에이전트

Start
  → PII Guardrail (개인정보 마스킹)
  → Classification Agent (문의 유형 분류)
  → If/Else
      ├─ Technical → Technical Support Agent → End
      ├─ Billing → Billing Agent → End
      └─ General → General Agent → End
```

**세부 설정**:
- 각 에이전트의 Instructions 작성
- Tools 연결 (Zendesk, Stripe API 등)
- Guardrails 설정

#### 2.3 로컬 테스트

- Preview 모드에서 다양한 시나리오 테스트
- 에러 케이스 확인
- 응답 시간 측정

#### 2.4 평가 (Evals) 설정

- Dataset 생성 (테스트 케이스 모음)
- Graders 설정 (정확도, 톤, 속도 등)
- Trace grading 실행

### Phase 3: 배포 및 통합 (2-3주)

**목표**: 프로덕션 환경에 배포

**작업**:

#### 3.1 ChatKit 통합

- 개발 서버 설정 (FastAPI 또는 Express.js)
- 세션 관리 엔드포인트 구현
- 프론트엔드에 ChatKit 임베드

#### 3.2 커스터마이징

- 브랜드 테마 적용
- 커스텀 위젯 개발 (필요 시)
- 액션 핸들러 추가

#### 3.3 보안 및 성능

- API 키 보안 (환경변수, 시크릿 관리)
- Rate limiting
- 에러 핸들링
- 로깅 및 모니터링

#### 3.4 배포

- 스테이징 환경 배포
- QA 및 사용자 테스트
- 프로덕션 배포

### Phase 4: 최적화 및 확장 (지속적)

**목표**: 에이전트 성능 개선 및 기능 확장

**작업**:

#### 4.1 성능 모니터링

- Evals 대시보드 모니터링
- 사용자 피드백 수집
- 응답 시간 및 정확도 추적

#### 4.2 Prompt Optimization

- Automated prompt optimizer 사용
- A/B 테스트
- 사용자 주석 기반 개선

#### 4.3 기능 확장

- 새로운 Tools 추가
- 에이전트 추가 (전문화)
- 멀티모달 지원 (이미지, 음성)

#### 4.4 고급 기능

- Reinforcement Fine-tuning (RFT)
- Custom tool calls
- External model integration

---

## 실행 로드맵

### Week 1-2: 준비 및 학습

| 작업 | 소요 시간 | 우선순위 |
|------|----------|----------|
| OpenAI 계정 및 API 키 설정 | 1시간 | 높음 |
| Agent Builder 접속 및 탐색 | 2시간 | 높음 |
| 공식 문서 읽기 | 4-6시간 | 높음 |
| 튜토리얼 비디오 시청 | 2-3시간 | 중간 |
| 샘플 앱 실행 | 2-3시간 | 중간 |

**마일스톤**: Agent Kit 생태계 이해 완료

### Week 3-4: 첫 프로토타입

| 작업 | 소요 시간 | 우선순위 |
|------|----------|----------|
| Use case 선정 및 요구사항 정의 | 2-3시간 | 높음 |
| Agent Builder에서 워크플로우 설계 | 4-6시간 | 높음 |
| 각 노드 설정 및 프롬프트 작성 | 4-6시간 | 높음 |
| Preview 모드 테스트 | 2-3시간 | 높음 |
| 워크플로우 퍼블리시 | 1시간 | 높음 |

**마일스톤**: 첫 번째 작동하는 에이전트 워크플로우 완성

### Week 5-6: 배포 준비

| 작업 | 소요 시간 | 우선순위 |
|------|----------|----------|
| 개발 서버 설정 (FastAPI/Express) | 2-3시간 | 높음 |
| ChatKit 세션 엔드포인트 구현 | 2-3시간 | 높음 |
| 프론트엔드 통합 | 4-6시간 | 높음 |
| 테마 커스터마이징 | 2-3시간 | 중간 |
| 로컬 테스트 | 3-4시간 | 높음 |

**마일스톤**: 로컬 환경에서 완전히 작동하는 시스템

### Week 7-8: 프로덕션 배포

| 작업 | 소요 시간 | 우선순위 |
|------|----------|----------|
| 보안 설정 (환경변수, 시크릿) | 2시간 | 높음 |
| 스테이징 환경 배포 | 3-4시간 | 높음 |
| QA 및 버그 수정 | 4-6시간 | 높음 |
| 프로덕션 배포 | 2-3시간 | 높음 |
| 모니터링 설정 | 2-3시간 | 중간 |

**마일스톤**: 프로덕션 환경에서 라이브

### Week 9+: 최적화 및 확장

| 작업 | 지속적 | 우선순위 |
|------|--------|----------|
| Evals 분석 및 개선 | 주간 | 높음 |
| 사용자 피드백 반영 | 지속적 | 높음 |
| 새로운 기능 추가 | 격주 | 중간 |
| 성능 최적화 | 월간 | 중간 |

**마일스톤**: 지속적인 개선 사이클 확립

---

## 배포 방법 비교

### ChatKit 임베딩 (권장)

**장점**:
- ✅ 빠른 시작 (몇 시간 내 배포 가능)
- ✅ OpenAI가 백엔드 호스팅 및 스케일링
- ✅ 프론트엔드만 관리
- ✅ 자동 업데이트 및 유지보수
- ✅ 간단한 통합 (몇 줄의 코드)

**단점**:
- ❌ OpenAI 인프라 의존
- ❌ 커스터마이징 제한적
- ❌ 데이터가 OpenAI 서버를 통과

**추천 시나리오**:
- MVP 또는 프로토타입
- 빠른 출시가 중요한 경우
- 작은 팀 또는 스타트업
- 백엔드 리소스가 제한적인 경우

### 고급 통합 (Advanced Integration)

**장점**:
- ✅ 완전한 제어 및 커스터마이징
- ✅ 자체 인프라에서 실행
- ✅ 데이터 프라이버시 보장
- ✅ 임의의 백엔드 연결 가능
- ✅ 커스텀 로직 및 워크플로우

**단점**:
- ❌ 복잡한 설정 및 유지보수
- ❌ 인프라 비용
- ❌ 스케일링 직접 관리
- ❌ 긴 개발 시간

**추천 시나리오**:
- 엔터프라이즈 애플리케이션
- 데이터 프라이버시가 중요한 경우
- 복잡한 커스터마이징이 필요한 경우
- 기존 시스템과의 깊은 통합

### Agents SDK만 사용

**장점**:
- ✅ 완전한 자유도
- ✅ 커스텀 UI 구축 가능
- ✅ 임의의 프레임워크 사용 가능

**단점**:
- ❌ ChatKit UI 없음 (직접 구축)
- ❌ 가장 긴 개발 시간
- ❌ 모든 것을 처음부터 구현

**추천 시나리오**:
- 완전히 커스텀 UI가 필요한 경우
- 채팅 이외의 인터페이스 (예: 음성, 대시보드)
- 기존 UI 프레임워크와의 통합

---

## 실전 예제: 고객 지원 에이전트

### Use Case

**목표**: 고객 문의를 자동으로 분류하고 적절한 전문 에이전트에게 라우팅하는 시스템

**요구사항**:
1. PII 보호 (개인정보 마스킹)
2. 문의 유형 자동 분류 (기술, 결제, 일반)
3. 각 유형별 전문 에이전트
4. 응답 품질 검증 (Hallucination 감지)

### 워크플로우 설계

```
[Start]
  ↓
[PII Guardrail] ← 개인정보 마스킹
  ↓
[Classification Agent] ← 문의 유형 분류
  ↓
[If/Else Logic] ← 분류 결과에 따라 분기
  ├─ type == "technical" → [Technical Support Agent]
  ├─ type == "billing" → [Billing Agent]
  └─ type == "general" → [General Agent]
  ↓
[Hallucination Guardrail] ← 응답 검증
  ↓
[End]
```

### Agent Builder 구현

#### 1. PII Guardrail 노드

```yaml
Type: Guardrail
Name: "PII Protection"
Settings:
  - Type: PII
  - Action: mask
  - Entities: [email, phone, ssn, credit_card]
```

#### 2. Classification Agent 노드

```yaml
Type: Agent
Name: "Classification Agent"
Model: gpt-4o-mini
Instructions: |
  You are a customer inquiry classifier.

  Analyze the customer message and classify it into one of these categories:
  - technical: Issues with product functionality, bugs, or technical problems
  - billing: Payment issues, subscription questions, invoices
  - general: General questions, feedback, or other inquiries

  Respond ONLY with a JSON object:
  {
    "type": "technical" | "billing" | "general",
    "confidence": 0.0 to 1.0,
    "reasoning": "brief explanation"
  }

Output:
  - type: string (technical, billing, or general)
```

#### 3. If/Else Logic 노드

```yaml
Type: Logic (If/Else)
Name: "Route by Type"
Conditions:
  - if: type == "technical"
    then: → Technical Support Agent
  - elif: type == "billing"
    then: → Billing Agent
  - else:
    then: → General Agent
```

#### 4. Technical Support Agent

```yaml
Type: Agent
Name: "Technical Support Agent"
Model: gpt-4o
Instructions: |
  You are a technical support specialist.

  Help customers with:
  - Product functionality issues
  - Bug reports
  - Error messages
  - Technical troubleshooting

  Guidelines:
  - Be clear and concise
  - Provide step-by-step instructions
  - Ask clarifying questions if needed
  - Escalate to human if issue is complex

Tools:
  - knowledge_base_search (internal docs)
  - bug_tracking_system (Jira API)
```

#### 5. Billing Agent

```yaml
Type: Agent
Name: "Billing Agent"
Model: gpt-4o
Instructions: |
  You are a billing specialist.

  Help customers with:
  - Payment issues
  - Subscription management
  - Invoice questions
  - Refund requests

  Guidelines:
  - Be empathetic and professional
  - Verify customer identity before sharing billing info
  - Follow company refund policy

Tools:
  - payment_system (Stripe API)
  - subscription_database
```

#### 6. General Agent

```yaml
Type: Agent
Name: "General Agent"
Model: gpt-4o
Instructions: |
  You are a friendly customer service representative.

  Handle general inquiries and provide helpful information.

  Guidelines:
  - Be warm and welcoming
  - Provide accurate information
  - Route to specialized agents if needed

Tools:
  - company_faq
  - product_catalog
```

#### 7. Hallucination Guardrail

```yaml
Type: Guardrail
Name: "Response Verification"
Settings:
  - Type: Hallucination
  - Action: flag
  - Threshold: 0.7
```

### ChatKit 배포

#### 서버 코드 (Python + FastAPI)

```python
# server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@app.post("/api/chatkit/session")
async def create_chatkit_session(user_id: str):
    try:
        session = openai_client.chatkit.sessions.create({
            "workflow": {
                "id": os.environ["WORKFLOW_ID"]  # 워크플로우 ID
            },
            "user": user_id
        })

        return {
            "client_secret": session.client_secret
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### 프론트엔드 코드 (React + TypeScript)

```tsx
// App.tsx
import React from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import './App.css';

function App() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existingSecret) {
        // 기존 세션이 있으면 갱신
        if (existingSecret) {
          console.log("Refreshing session...");
        }

        // 서버에서 새 세션 생성
        const response = await fetch('http://localhost:8000/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 'user_' + Math.random().toString(36).substr(2, 9)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        return data.client_secret;
      },
    },
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>고객 지원 센터</h1>
      </header>

      <main className="chat-container">
        <ChatKit
          control={control}
          className="chatkit-widget"
          theme={{
            primaryColor: '#007bff',
            backgroundColor: '#ffffff',
            textColor: '#333333',
          }}
        />
      </main>
    </div>
  );
}

export default App;
```

#### CSS 스타일

```css
/* App.css */
.App {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.App-header {
  background-color: #007bff;
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.chatkit-widget {
  width: 400px;
  height: 600px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 평가 (Evals) 설정

#### Dataset 생성

```json
[
  {
    "input": "I can't log into my account. It says 'invalid password' but I'm sure it's correct.",
    "expected_type": "technical",
    "expected_response_contains": ["reset password", "account recovery"]
  },
  {
    "input": "I was charged twice for my subscription this month.",
    "expected_type": "billing",
    "expected_response_contains": ["refund", "duplicate charge"]
  },
  {
    "input": "What are your business hours?",
    "expected_type": "general",
    "expected_response_contains": ["hours", "9am", "5pm"]
  }
]
```

#### Graders 설정

```yaml
Graders:
  - Name: "Classification Accuracy"
    Type: exact_match
    Field: type

  - Name: "Response Quality"
    Type: llm_grader
    Model: gpt-4o
    Instructions: |
      Evaluate the customer support response on:
      1. Accuracy (1-5)
      2. Helpfulness (1-5)
      3. Tone (1-5)
      4. Completeness (1-5)

      Return JSON with scores and explanation.

  - Name: "Response Time"
    Type: metric
    Threshold: 5000  # 5 seconds
```

---

## 보안 및 베스트 프랙티스

### 1. API 키 보안

**절대 하지 말아야 할 것**:
- ❌ 코드에 하드코딩
- ❌ Git에 커밋
- ❌ 클라이언트 사이드에 노출

**올바른 방법**:
- ✅ 환경변수 사용
- ✅ 시크릿 관리 도구 (AWS Secrets Manager, HashiCorp Vault)
- ✅ 서버 사이드에서만 사용

```bash
# .env 파일 (Git에 커밋하지 말 것)
OPENAI_API_KEY=sk-...
WORKFLOW_ID=wf_...
```

```python
# 올바른 사용
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
```

### 2. PII 보호

**필수 조치**:
- 모든 워크플로우에 PII Guardrail 추가
- 마스킹 또는 제거
- 로깅 시 PII 제외

**지원하는 PII 타입**:
- 이메일
- 전화번호
- SSN (주민등록번호)
- 신용카드 번호
- 주소
- 이름 (옵션)

### 3. Rate Limiting

**서버 사이드 구현**:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chatkit/session")
@limiter.limit("5/minute")  # 분당 5회 제한
async def create_chatkit_session():
    # ...
```

### 4. 에러 핸들링

**클라이언트에 상세 에러 노출 금지**:

```python
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    # 로그에는 상세 에러 기록
    logger.error(f"Error: {exc}", exc_info=True)

    # 클라이언트에는 일반 메시지만 전달
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )
```

### 5. 로깅 및 모니터링

**필수 로깅 항목**:
- 요청/응답 시간
- 에러 및 예외
- 사용자 액션
- 워크플로우 실행 결과

**권장 도구**:
- Datadog
- Sentry
- CloudWatch
- Grafana

### 6. 사용자 인증 및 권한

**ChatKit 세션에 사용자 ID 포함**:

```python
@app.post("/api/chatkit/session")
async def create_chatkit_session(current_user: User = Depends(get_current_user)):
    session = openai_client.chatkit.sessions.create({
        "workflow": {"id": workflow_id},
        "user": current_user.id,
        "metadata": {
            "email": current_user.email,
            "role": current_user.role
        }
    })
```

---

## 비용 최적화

### 1. 모델 선택

**가격 비교 (2025년 10월 기준)**:

| 모델 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 추천 용도 |
|------|-------------------|-------------------|----------|
| GPT-4o | $5.00 | $15.00 | 복잡한 작업, 멀티모달 |
| GPT-4o-mini | $0.15 | $0.60 | 간단한 작업, 분류 |
| o4-mini | $3.00 | $12.00 | 추론이 필요한 작업 |
| GPT-5 | $10.00 | $30.00 | 최고 성능 필요 시 |

**최적화 전략**:
- Classification 같은 간단한 작업 → GPT-4o-mini
- 핵심 에이전트만 GPT-4o 또는 GPT-5 사용
- 추론이 필요한 경우 o4-mini

### 2. 프롬프트 최적화

**짧고 명확하게**:
- 불필요한 설명 제거
- 구조화된 출력 (JSON) 사용
- 예제는 최소한으로

**Before**:
```
You are a helpful assistant. Please help the user with their question.
Be polite, professional, and provide accurate information.
Make sure to ask clarifying questions if needed.
...
```

**After**:
```
Classify customer inquiry into: technical, billing, or general.
Output JSON: {"type": "...", "confidence": 0.0-1.0}
```

### 3. 캐싱

**중복 요청 캐싱**:

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def get_cached_response(input_hash):
    # 캐시된 응답 반환
    pass

def process_query(user_input):
    input_hash = hashlib.md5(user_input.encode()).hexdigest()

    # 캐시 확인
    cached = get_cached_response(input_hash)
    if cached:
        return cached

    # 실제 API 호출
    response = workflow.run(user_input)
    return response
```

### 4. 토큰 제한

**각 에이전트에 max_tokens 설정**:

```yaml
Agent:
  model: gpt-4o
  max_tokens: 500  # 응답 길이 제한
```

---

## 문제 해결 (Troubleshooting)

### 문제 1: "Workflow not found" 에러

**원인**:
- 잘못된 Workflow ID
- 워크플로우가 퍼블리시되지 않음

**해결**:
1. Agent Builder에서 워크플로우 퍼블리시 확인
2. Workflow ID 복사 (정확히)
3. 환경변수 확인

### 문제 2: ChatKit이 렌더링되지 않음

**원인**:
- 스크립트 로드 실패
- CORS 에러
- 잘못된 client_secret

**해결**:
1. 브라우저 콘솔 확인
2. 네트워크 탭에서 요청 확인
3. CORS 헤더 확인
4. client_secret 유효성 확인

### 문제 3: 에이전트 응답이 느림

**원인**:
- 복잡한 워크플로우
- 큰 모델 사용
- 많은 Tool 호출

**해결**:
1. Preview 모드에서 각 노드 실행 시간 확인
2. 불필요한 노드 제거
3. 작은 모델로 전환 (가능한 경우)
4. Tool 호출 최소화
5. Streaming 활성화

### 문제 4: 평가 점수가 낮음

**원인**:
- 프롬프트 문제
- 부적절한 모델 선택
- 잘못된 Tool 설정

**해결**:
1. Trace grading 결과 분석
2. 실패한 케이스 확인
3. Prompt optimizer 사용
4. Dataset 확장
5. 모델 업그레이드 고려

---

## 참고 자료

### 공식 문서

1. **AgentKit 공식 발표**
   - URL: https://openai.com/index/introducing-agentkit/
   - 내용: AgentKit 개요, 주요 기능, 고객 사례

2. **Agent Builder 가이드**
   - URL: https://platform.openai.com/docs/guides/agent-builder
   - 내용: 워크플로우 생성, 노드 사용법, 퍼블리시

3. **ChatKit 문서**
   - URL: https://platform.openai.com/docs/guides/chatkit
   - 내용: 통합 방법, 커스터마이징, 예제

4. **Agents SDK**
   - URL: https://platform.openai.com/docs/guides/agents-sdk
   - Python: https://github.com/openai/openai-agents-python
   - TypeScript: https://openai.github.io/openai-agents-js

5. **Node Reference**
   - URL: https://platform.openai.com/docs/guides/node-reference
   - 내용: 모든 노드 타입 및 설정 옵션

6. **Evals 문서**
   - URL: https://platform.openai.com/docs/guides/evals
   - 내용: 평가 플랫폼, Datasets, Graders

### GitHub 리포지토리

1. **ChatKit Python SDK**
   - https://github.com/openai/chatkit-python

2. **ChatKit JS SDK**
   - https://github.com/openai/chatkit-js

3. **ChatKit React**
   - https://github.com/openai/chatkit-react

4. **Guardrails Python**
   - https://openai.github.io/openai-guardrails-python/

5. **Guardrails JavaScript**
   - https://openai.github.io/openai-guardrails-js/

6. **샘플 앱**
   - https://github.com/openai/openai-chatkit-starter-app
   - https://github.com/openai/openai-chatkit-advanced-samples

### 인터랙티브 리소스

1. **ChatKit World** (데모)
   - https://chatkit.world

2. **Widget Builder**
   - https://widgets.chatkit.studio

3. **ChatKit Playground**
   - https://chatkit.studio/playground

4. **Agent Builder** (로그인 필요)
   - https://platform.openai.com/agent-builder

### 튜토리얼 및 가이드

1. **OpenAI DevDay 2025 Keynote**
   - https://www.youtube.com/watch?v=hS1YqcewH0c
   - Sam Altman의 AgentKit 발표

2. **Practical Guide to Building Agents** (PDF)
   - https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf

3. **Composio Guide**
   - https://composio.dev/blog/openai-agent-builder-step-by-step-guide-to-building-ai-agents-with-mcp
   - MCP와 Agent Builder 통합 가이드

4. **Community Tutorial**
   - https://community.openai.com/t/how-to-get-started-with-agent-builder/1361280

### 비디오 튜토리얼

1. **"How To Use OpenAI Agent Builder For Beginners"**
   - https://www.youtube.com/watch?v=wmpKpoK-alc
   - 16분, 초보자용

2. **"Master NEW OpenAI Agent Builder In 1 Hour"**
   - https://www.youtube.com/watch?v=kLd7nSkDxig
   - 1시간 완전 코스

3. **"OpenAI Agent Builder: Beginners Guide"**
   - https://www.youtube.com/watch?v=UlYBHzDJUTQ

### 블로그 및 아티클

1. **TechCrunch - "OpenAI launches AgentKit"**
   - https://techcrunch.com/2025/10/06/openai-launches-agentkit-to-help-developers-build-and-ship-ai-agents/

2. **VentureBeat - "OpenAI unveils AgentKit"**
   - https://venturebeat.com/ai/openai-unveils-agentkit-that-lets-developers-drag-and-drop-to-build-ai

3. **The New Stack - "OpenAI Launches a No-Code Agent Builder"**
   - https://thenewstack.io/openai-launches-a-no-code-agent-builder/

4. **Medium - "OpenAI Launches Agent Builder and AgentKit"**
   - https://themindshift.medium.com/openai-launches-agent-builder-and-agentkit-a-new-era-for-building-and-deploying-ai-agents-e6d649c4f4d7

5. **UX Planet - "Introduction to OpenAI Agent Builder"**
   - https://uxplanet.org/introduction-to-openai-agent-builder-93d74f662f3a

---

## 결론

OpenAI의 Agent Kit는 AI 에이전트 개발의 패러다임을 완전히 바꾸었습니다. **Agent Builder**의 직관적인 비주얼 인터페이스, **ChatKit**의 간편한 배포, 그리고 강력한 **Evals** 플랫폼은 개발 시간을 몇 주에서 몇 시간으로 단축시킵니다.

### 핵심 요약

1. **Agent Builder로 워크플로우 설계**
   - 드래그 앤 드롭 노드 시스템
   - 템플릿 및 프리뷰 기능
   - 버전 관리 및 평가

2. **ChatKit으로 배포**
   - 권장: OpenAI 호스팅 (빠르고 간편)
   - 고급: 자체 인프라 (완전한 제어)

3. **Evals로 최적화**
   - Datasets 및 Graders
   - Trace grading
   - Automated prompt optimization

### 다음 단계

이 보고서를 바탕으로:

1. **즉시 시작**: Agent Builder 접속하여 첫 워크플로우 생성
2. **프로토타입 구축**: 간단한 use case 선정 및 구현
3. **ChatKit 통합**: 로컬 환경에서 테스트
4. **프로덕션 배포**: 스테이징 → 프로덕션
5. **지속적 개선**: Evals로 성능 모니터링 및 최적화

**시작하기 좋은 use case**:
- FAQ 자동 응답 봇
- 고객 지원 에이전트
- 내부 지식베이스 어시스턴트
- 데이터 분석 헬퍼

Agent Kit는 이제 막 시작했습니다. 앞으로 더 많은 기능과 개선이 예정되어 있으며, 커뮤니티의 피드백을 통해 계속 발전할 것입니다.

**Happy Building! 🤖**

---

*이 보고서는 2025년 10월 14일 기준으로 작성되었습니다. 최신 정보는 OpenAI 공식 문서를 참조하세요.*
