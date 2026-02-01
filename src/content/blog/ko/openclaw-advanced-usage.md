---
title: 'OpenClaw 200% 활용하기 — 실전 고급 사용 사례 모음'
description: '크론 자동화, 웹훅 연동, MCP 서버, 멀티 에이전트, 브라우저 자동화 등 OpenClaw 실전 고급 활용법 8가지.'
pubDate: '2026-02-05'
heroImage: ../../../assets/blog/openclaw-advanced-usage-hero.png
tags:
  - openclaw
  - automation
  - mcp
  - multi-agent
relatedPosts: []
---

> **시리즈: OpenClaw 완전 정복** (3/3)
> 1. [소개편](/ko/blog/ko/openclaw-introduction-guide/)
> 2. [튜토리얼편](/ko/blog/ko/openclaw-installation-tutorial/)
> 3. **활용법편** ← 현재 글
# OpenClaw 200% 활용하기 — 실전 고급 사용 사례 모음 🚀

설치를 마치셨나요? 축하합니다! 🎉 이제 진짜 재미있는 파트입니다.

OpenClaw는 단순한 챗봇이 아닙니다. 여러분의 디바이스에서 살아 숨쉬는 **개인 AI 에이전트**죠. 이 글에서는 **실제 프로덕션 수준의 워크플로우**를 하나하나 구축해 보겠습니다. 각 예제는 복사해서 바로 쓸 수 있는 완전한 형태로 제공합니다.

---

## 목차

1. [크론 기반 일일 리포트 자동화](#활용법-1-크론-기반-일일-리포트-자동화-)
2. [웹훅으로 n8n/Make 연동](#활용법-2-웹훅으로-n8nmake-연동-)
3. [MCP 서버 연동](#활용법-3-mcp-서버-연동-)
4. [멀티 에이전트 시스템 구축](#활용법-4-멀티-에이전트-시스템-구축-)
5. [브라우저 자동화 데이터 수집](#활용법-5-브라우저-자동화-데이터-수집-)
6. [Node 시스템으로 보안 카메라 모니터링](#활용법-6-node-시스템으로-보안-카메라-모니터링-)
7. [커스텀 스킬 개발 완전 가이드](#활용법-7-커스텀-스킬-개발-완전-가이드-)
8. [워크스페이스 파일 실전 작성 가이드](#활용법-8-워크스페이스-파일-실전-작성-가이드-)

---

## 활용법 1: 크론 기반 일일 리포트 자동화 📊

매일 아침 눈 뜨면 오늘의 일정, 날씨, 뉴스 헤드라인을 정리해서 보내주는 비서를 만들어 봅시다.

### 완전한 설정 예제

#### 1단계: openclaw.json에 크론 활성화

```json5
// ~/.openclaw/openclaw.json
{
  "cron": {
    "enabled": true,
    "store": "~/.openclaw/cron/jobs.json",
    "maxConcurrentRuns": 2
  }
}
```

#### 2단계: 모닝 브리핑 크론 등록

```bash
# 매일 아침 8시 (Asia/Tokyo) — 격리 세션으로 실행, 텔레그램으로 전달
openclaw cron add \
  --name "모닝 브리핑" \
  --cron "0 8 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "오늘의 브리핑을 작성해줘:
1. 오늘 캘린더 일정 요약
2. 읽지 않은 중요 이메일 3건
3. 오늘 서울/도쿄 날씨
4. 테크 뉴스 헤드라인 3건
5. GitHub 리포 새 이슈/PR 요약
간결하게 불릿 포인트로 정리해줘." \
  --deliver \
  --channel telegram \
  --to "<내_텔레그램_채팅ID>"
```

#### 3단계: 일일 개발 리포트 크론

```bash
# 평일 오후 6시 — 개발 일지 자동 생성
openclaw cron add \
  --name "일일 개발 리포트" \
  --cron "0 18 * * 1-5" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "오늘 하루의 개발 리포트를 작성해줘:
1. 오늘 작업한 내용 (memory/에서 확인)
2. 해결한 이슈들
3. 내일 할 일 제안
4. 배운 점 또는 인사이트
마크다운으로 깔끔하게 정리하고, memory/ 폴더에 저장해줘." \
  --deliver \
  --channel telegram \
  --to "<내_텔레그램_채팅ID>"
```

#### 4단계: 주간 분석 (고성능 모델 사용)

```bash
# 매주 월요일 아침 — opus 모델로 깊은 분석
openclaw cron add \
  --name "주간 분석" \
  --cron "0 9 * * 1" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "지난 한 주를 분석해줘:
1. memory/ 폴더에서 이번 주 일별 로그 읽기
2. 생산성 패턴 분석 (어떤 날 집중했는지)
3. 자주 작업한 프로젝트/기술 정리
4. 다음 주 제안사항
5. MEMORY.md에 중요한 인사이트 추가
깊이 있게 분석해줘." \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel telegram \
  --to "<내_텔레그램_채팅ID>"
```

#### 크론 관리 명령어

```bash
# 등록된 모든 크론 작업 확인
openclaw cron list

# 특정 작업 실행 이력 확인
openclaw cron runs --id <jobId> --limit 10

# 작업 수정
openclaw cron edit <jobId> --message "수정된 프롬프트"

# 수동 실행 (테스트용)
openclaw cron run <jobId> --force

# 작업 삭제
openclaw cron remove <jobId>
```

### HEARTBEAT.md 연동

크론과 하트비트를 조합하면 더 유연한 자동화가 가능합니다:

```markdown
# HEARTBEAT.md

## 상시 체크
- [ ] 2시간 내 캘린더 일정 있으면 30분 전 알림
- [ ] 중요 이메일 (from: boss@company.com) 즉시 알림

## 업무 시간 (09:00-18:00)
- [ ] GitHub PR 리뷰 요청 알림
- [ ] Slack 미응답 멘션 알림

## 야간 (23:00-08:00)
- 긴급한 것 외 HEARTBEAT_OK
```

> **크론 vs 하트비트 선택 기준:**
> - **정확한 시간**이 중요 → 크론 (`"0 8 * * *"`)
> - **여러 체크를 묶어서** 하고 싶다 → 하트비트 (`HEARTBEAT.md`)
> - **일회성 리마인더** → 크론 (`--at "20m"` + `--delete-after-run`)

---

## 활용법 2: 웹훅으로 n8n/Make 연동 🔗

외부 자동화 도구와 OpenClaw을 연결하면 가능성이 무한히 확장됩니다.

### 웹훅 활성화

```json5
// ~/.openclaw/openclaw.json
{
  "hooks": {
    "enabled": true,
    "token": "my-super-secret-webhook-token-2025",
    "path": "/hooks"
  }
}
```

### 기본 엔드포인트 사용법

#### /hooks/wake — 에이전트 깨우기

```bash
# 시스템 이벤트로 에이전트 깨우기
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{"text": "서버 CPU 사용량 90% 초과 알림", "mode": "now"}'
```

#### /hooks/agent — 격리된 에이전트 실행

```bash
# 별도 세션에서 에이전트 실행 + 결과 텔레그램 전달
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "서버 CPU 사용량이 90%를 초과했습니다. 원인을 분석하고 대응 방안을 제안해주세요.",
    "name": "서버 모니터링",
    "sessionKey": "hook:server-monitor:cpu-alert",
    "deliver": true,
    "channel": "telegram",
    "to": "<내_텔레그램_채팅ID>",
    "model": "anthropic/claude-sonnet-4-20250514",
    "timeoutSeconds": 120
  }'
```

### n8n 연동 — GitHub PR 자동 리뷰

n8n에서 OpenClaw 웹훅을 호출하는 완전한 워크플로우입니다:

#### n8n 워크플로우 구성

```json
{
  "nodes": [
    {
      "name": "GitHub Webhook Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "owner": "myorg",
        "repository": "myrepo",
        "events": ["pull_request"]
      }
    },
    {
      "name": "Filter: PR Opened",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.action }}",
            "operation": "equals",
            "value2": "opened"
          }]
        }
      }
    },
    {
      "name": "Call OpenClaw",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://<gateway-ip>:18789/hooks/agent",
        "method": "POST",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{
            "name": "Authorization",
            "value": "Bearer my-super-secret-webhook-token-2025"
          }]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [{
            "name": "message",
            "value": "새 PR이 열렸습니다.\n제목: {{ $json.pull_request.title }}\n작성자: {{ $json.pull_request.user.login }}\nURL: {{ $json.pull_request.html_url }}\n\n변경 파일을 확인하고 간단한 리뷰 코멘트를 작성해주세요."
          }, {
            "name": "name",
            "value": "GitHub PR Review"
          }, {
            "name": "deliver",
            "value": true
          }, {
            "name": "channel",
            "value": "telegram"
          }]
        }
      }
    }
  ]
}
```

### Make (Integromat) 연동

Make에서는 HTTP 모듈을 사용합니다:

1. **Webhook 트리거** → 외부 이벤트 수신
2. **HTTP Make a request** 모듈 추가:
   - URL: `http://<gateway-ip>:18789/hooks/agent`
   - Method: POST
   - Headers: `Authorization: Bearer <토큰>`
   - Body: JSON 형식으로 `message`, `name`, `deliver`, `channel` 설정

### Gmail 실시간 연동

OpenClaw은 Gmail Pub/Sub을 기본 지원합니다:

```bash
# Gmail 웹훅 설정
openclaw webhooks gmail setup

# Gmail 워치 실행
openclaw webhooks gmail run
```

```json5
// openclaw.json에 Gmail 매핑 추가
{
  "hooks": {
    "enabled": true,
    "token": "my-secret",
    "presets": ["gmail"]  // Gmail 프리셋 활성화
  }
}
```

새 이메일이 올 때마다:
```bash
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer my-secret' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Boss","subject":"긴급: 내일 미팅","snippet":"내일 10시 미팅 참석 부탁드립니다..."}]}'
```

---

## 활용법 3: MCP 서버 연동 🧠

**MCP (Model Context Protocol)**는 AI 에이전트에게 외부 데이터 소스와 도구를 표준화된 방식으로 제공하는 프로토콜입니다. OpenClaw에서 MCP 서버를 활용하는 방법을 알아봅시다.

### MCP 서버란?

MCP 서버는 AI에게 특정 도구와 리소스를 제공하는 서비스입니다. 예를 들어:
- **파일시스템 MCP** — 특정 디렉토리의 파일 읽기/쓰기
- **데이터베이스 MCP** — SQL 쿼리 실행
- **API MCP** — REST API 호출 추상화
- **브라우저 MCP** — 웹 페이지 제어

### OpenClaw에서 MCP 활용하기

OpenClaw의 스킬 시스템을 통해 MCP 서버와 연동할 수 있습니다. 커스텀 스킬의 SKILL.md에서 MCP 서버 호출 방법을 정의합니다:

```markdown
---
name: mcp_database
description: PostgreSQL 데이터베이스에 자연어로 쿼리하는 MCP 연동 스킬
metadata: {"openclaw":{"requires":{"bins":["npx"],"env":["DATABASE_URL"]},"primaryEnv":"DATABASE_URL"}}
---

# MCP Database Skill

## 사용법
사용자가 데이터베이스 관련 질문을 하면, MCP 서버를 통해 쿼리합니다.

## 실행 방법
1. `exec` 도구로 MCP 서버 프로세스 시작:
   ```bash
   npx @modelcontextprotocol/server-postgres $DATABASE_URL
   ```
2. MCP 서버가 제공하는 도구를 통해 쿼리 실행
3. 결과를 사용자에게 전달

## 안전 규칙
- SELECT 쿼리만 실행 (INSERT/UPDATE/DELETE 금지)
- 테이블 목록 먼저 확인 후 쿼리
- 결과가 100행 초과 시 요약
```

### 실전: Notion MCP + OpenClaw

```bash
# Notion MCP 서버 설치
npm install -g @notionhq/notion-mcp-server

# 스킬 디렉터리 생성
mkdir -p ~/.openclaw/workspace/skills/notion-mcp
```

```markdown
# skills/notion-mcp/SKILL.md
---
name: notion_mcp
description: Notion 워크스페이스를 AI로 관리하는 MCP 연동 스킬
metadata: {"openclaw":{"requires":{"env":["NOTION_API_KEY"]},"primaryEnv":"NOTION_API_KEY"}}
---

# Notion MCP Skill

Notion API를 통해 페이지 생성, 검색, 편집을 수행합니다.

## 가능한 작업
- 페이지 검색 및 읽기
- 새 페이지/데이터베이스 항목 생성
- 기존 페이지 편집
- 데이터베이스 쿼리

## 실행 방법
exec 도구로 `notion-mcp-server` 실행 후 결과를 처리합니다.
```

```json5
// openclaw.json에 스킬 환경변수 설정
{
  "skills": {
    "entries": {
      "notion_mcp": {
        "enabled": true,
        "apiKey": "ntn_xxxxxxxxxxxx",
        "env": {
          "NOTION_API_KEY": "ntn_xxxxxxxxxxxx"
        }
      }
    }
  }
}
```

---

## 활용법 4: 멀티 에이전트 시스템 구축 🤖

하나의 Gateway에서 역할이 다른 여러 에이전트를 운영하는 실전 패턴입니다.

### 완전한 멀티 에이전트 설정

```json5
// ~/.openclaw/openclaw.json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session"
      },
      "subagents": {
        "maxConcurrent": 4,
        "model": "anthropic/claude-sonnet-4-20250514",
        "archiveAfterMinutes": 60
      }
    },
    "list": [
      {
        // 개인 비서 — 풀 액세스
        "id": "personal",
        "default": true,
        "name": "개인 비서",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      },
      {
        // 업무 에이전트 — 제한된 도구
        "id": "work",
        "name": "업무 비서",
        "workspace": "~/.openclaw/workspace-work",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "write", "edit", "exec", "web_search", "web_fetch", "browser"],
          "deny": ["gateway", "nodes", "cron"]
        }
      },
      {
        // 가족 봇 — 읽기 전용
        "id": "family",
        "name": "가족 봇",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "web_search", "web_fetch", "message"],
          "deny": ["exec", "write", "edit", "browser", "gateway", "nodes"]
        }
      }
    ]
  },
  
  // 라우팅 규칙 — 누가 어떤 에이전트와 대화할지
  "bindings": [
    {
      "agentId": "work",
      "match": {
        "provider": "telegram",
        "peer": {
          "kind": "group",
          "id": "-1001234567890"  // 업무 그룹 채팅
        }
      }
    },
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"  // 가족 그룹
        }
      }
    }
  ]
}
```

### 서브 에이전트 실전 패턴

메인 에이전트가 무거운 작업을 서브 에이전트에게 위임하는 패턴입니다.

텔레그램에서 이렇게 요청하면:
> "이 3개 기술 블로그를 동시에 번역하고, 각각 요약도 만들어줘"

AI가 내부적으로 수행하는 작업:

```mermaid
graph TD
    Main["🧠 메인 에이전트<br/>작업 분배 & 결과 수집"]
    Sub1["📝 서브 에이전트 1<br/>블로그 A 번역 + 요약"]
    Sub2["📝 서브 에이전트 2<br/>블로그 B 번역 + 요약"]
    Sub3["📝 서브 에이전트 3<br/>블로그 C 번역 + 요약"]
    Result["📤 메인 채팅에 결과 announce"]

    Main -->|"병렬 실행"| Sub1
    Main -->|"병렬 실행"| Sub2
    Main -->|"병렬 실행"| Sub3
    Sub1 -->|"완료"| Result
    Sub2 -->|"완료"| Result
    Sub3 -->|"완료"| Result
```

서브 에이전트 관리:

```bash
# 실행 중인 서브 에이전트 확인 (Telegram 슬래시 명령)
/subagents list

# 특정 서브 에이전트 로그 확인
/subagents log 1 50

# 서브 에이전트 중지
/subagents stop all
```

### 서브 에이전트 비용 최적화

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        // 서브 에이전트는 저렴한 모델 사용
        "model": "anthropic/claude-sonnet-4-20250514",
        "maxConcurrent": 4
      }
    }
  }
}
```

메인은 Opus, 서브는 Sonnet — 비용 대비 효율을 극대화할 수 있습니다.

---

## 활용법 5: 브라우저 자동화 데이터 수집 🌐

OpenClaw의 브라우저 도구를 활용해 자동으로 데이터를 수집하는 파이프라인을 만들어 봅시다.

### 예제: 매일 경쟁사 가격 모니터링

텔레그램에서 요청:
> "경쟁사 A, B, C 웹사이트에서 메인 상품 가격을 확인하고 비교 테이블을 만들어줘"

AI가 `browser` 도구를 사용해 자동으로 처리합니다:

```mermaid
graph LR
    A["🌐 경쟁사 A<br/>상품 페이지"] -->|"snapshot"| E["📊 가격 추출"]
    B["🌐 경쟁사 B<br/>상품 페이지"] -->|"snapshot"| E
    C["🌐 경쟁사 C<br/>상품 페이지"] -->|"snapshot"| E
    E --> F["📋 비교 테이블 생성"]
    F --> G["💾 워크스페이스 저장"]
    G --> H["📤 텔레그램 전송"]
```

### 크론으로 자동화

```bash
openclaw cron add \
  --name "가격 모니터링" \
  --cron "0 9 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "다음 3개 사이트에서 메인 상품 가격을 확인해줘:
1. https://competitor-a.com/main-product
2. https://competitor-b.com/product
3. https://competitor-c.com/pricing

브라우저로 각 사이트를 방문하고:
- 상품명, 가격, 할인 정보 추출
- 어제 기록(workspace/price-history.json)과 비교
- 가격 변동이 있으면 하이라이트
- 결과를 price-history.json에 추가
- 비교 요약을 텔레그램으로 전달" \
  --deliver \
  --channel telegram \
  --to "<내_텔레그램_채팅ID>"
```

### 웹 리서치 파이프라인

더 복잡한 리서치도 가능합니다:

```
# 텔레그램에서:
"2025년 한국 AI 스타트업 투자 동향을 조사해줘.
주요 딜 5건, 투자 금액, 분야별 트렌드를 정리하고
마크다운 리포트로 만들어서 파일로 저장해줘."
```

AI의 내부 수행 단계:
1. **`web_search`** — Brave 검색으로 최신 기사 수집
2. **`web_fetch`** — 주요 기사 본문을 마크다운으로 추출
3. **`browser`** — 로그인이 필요한 사이트나 동적 페이지는 브라우저로 직접 탐색
4. **`write`** — 워크스페이스에 마크다운 리포트 작성
5. **`message`** — 파일 첨부로 텔레그램에 전달

---

## 활용법 6: Node 시스템으로 보안 카메라 모니터링 📹

OpenClaw의 노드 시스템을 활용해 스마트 보안 시스템을 구축해 봅시다.

### 구성 요소

```mermaid
graph TD
    Gateway["🖥️ 집 PC<br/>OpenClaw Gateway"]
    Tablet["📱 Android 태블릿<br/>후면 카메라 → 현관 감시"]
    iPhone["📱 iPhone<br/>알림 수신"]
    AI["🧠 AI 분석<br/>이상 감지"]

    Gateway -->|"camera_snap"| Tablet
    Tablet -->|"이미지"| AI
    AI -->|"이상 감지 시"| Gateway
    Gateway -->|"notify"| iPhone
```

### 정기 스냅샷 + AI 분석

```bash
# 30분마다 현관 카메라 스냅 → AI가 이상 감지 시 알림
openclaw cron add \
  --name "보안 카메라 체크" \
  --cron "*/30 * * * *" \
  --session isolated \
  --message "현관 카메라(android-tablet 노드)에서 후면 카메라 스냅을 찍어줘.
사진을 분석해서:
1. 사람이 보이면 즉시 알림 (iPhone 노드로 푸시)
2. 택배/우편물이 보이면 알림
3. 이상 없으면 조용히 로그만 남기기
분석 결과를 memory/ 폴더에 기록해줘." \
  --deliver \
  --channel telegram \
  --to "<내_텔레그램_채팅ID>"
```

### 텔레그램에서 수동 제어

```
# 현관 카메라 즉시 확인
"현관 카메라 스냅 찍어서 보여줘"

# 10초 영상 녹화
"현관 카메라 10초 클립 녹화해줘"

# 알림 보내기
"아이폰에 '택배 도착!' 알림 보내줘"

# 위치 확인
"내 폰 위치 알려줘"
```

### 완전한 보안 워크플로우 (HEARTBEAT.md)

```markdown
# HEARTBEAT.md — 보안 모니터링

## 상시 체크
- [ ] 야간(22:00-06:00)에는 현관 카메라 1시간마다 자동 스냅
- [ ] 스냅에서 사람 감지 시 iPhone으로 즉시 알림 + 텔레그램에 사진 전달
- [ ] 택배/우편물 감지 시 알림 (레벨: 일반)

## 외출 모드 (수동 트리거)
사용자가 "외출 모드 켜줘"라고 하면:
- 카메라 스냅 간격을 15분으로 줄이기
- 모든 움직임 감지 시 즉시 알림
- 결과를 memory/security-log.md에 기록
```

---

## 활용법 7: 커스텀 스킬 개발 완전 가이드 🛠️

나만의 스킬을 만들어서 OpenClaw을 확장해 봅시다.

### 스킬 구조

```
skills/
└── my-news-digest/
    ├── SKILL.md          # 스킬 정의 (필수)
    ├── fetch-news.js     # 헬퍼 스크립트 (선택)
    └── README.md         # 설명 문서 (선택)
```

### 완전한 스킬 예제: 뉴스 다이제스트

#### SKILL.md

```markdown
---
name: news_digest
description: 네이버 뉴스와 해커뉴스에서 기술 뉴스를 수집하고 요약하는 스킬
metadata: {"openclaw":{"emoji":"📰","requires":{"bins":["node"]},"os":["darwin","linux","win32"]}}
user-invocable: true
---

# 뉴스 다이제스트 스킬

## 사용 방법
사용자가 "뉴스" 또는 "오늘의 뉴스" 관련 명령을 하면 이 스킬을 사용합니다.

## 수집 소스
1. **네이버 뉴스 IT/과학 섹션** — `web_fetch`로 헤드라인 추출
2. **Hacker News** — `web_fetch`로 상위 10개 스토리 추출
3. **TechCrunch** — `web_fetch`로 최신 기사 5개

## 실행 단계
1. 각 소스에서 `web_fetch` 또는 `web_search`로 데이터 수집
2. 수집된 기사를 카테고리별로 분류 (AI, 보안, 개발, 스타트업)
3. 각 기사를 1-2줄로 요약
4. 마크다운 형태로 포매팅
5. 선택적으로 음성으로 읽어주기 (`tts` 도구)

## 출력 형식
```markdown
# 📰 오늘의 테크 뉴스 다이제스트
> 2025-07-14 09:00 기준

## 🤖 AI
- **제목** — 한줄 요약 [링크]

## 🔒 보안
- **제목** — 한줄 요약 [링크]

## 💻 개발
- **제목** — 한줄 요약 [링크]
```

## 저장
결과를 `{baseDir}/latest-digest.md`에도 저장합니다.
```

#### fetch-news.js (헬퍼 스크립트)

```javascript
#!/usr/bin/env node
// skills/my-news-digest/fetch-news.js
// 에이전트가 exec으로 호출할 수 있는 헬퍼 스크립트

const https = require('https');

async function fetchHackerNews() {
  return new Promise((resolve, reject) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ids = JSON.parse(data).slice(0, 10);
        resolve(ids);
      });
    }).on('error', reject);
  });
}

async function fetchStory(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const topIds = await fetchHackerNews();
  const stories = await Promise.all(topIds.map(fetchStory));
  
  const output = stories
    .filter(s => s && s.title)
    .map((s, i) => `${i+1}. **${s.title}** (${s.score}점) — ${s.url || `https://news.ycombinator.com/item?id=${s.id}`}`)
    .join('\n');
  
  console.log('# Hacker News Top 10\n');
  console.log(output);
}

main().catch(console.error);
```

### 스킬을 ClawHub에 공유하기

만든 스킬이 유용하다면 커뮤니티와 공유하세요:

```bash
# ClawHub에 스킬 업로드
npx clawhub@latest publish ./skills/my-news-digest

# 모든 스킬 동기화
npx clawhub@latest sync --all
```

### 고급 스킬 기능

#### 환경변수 게이팅

```markdown
---
name: github_analyzer
description: GitHub 리포를 분석하는 스킬
metadata: {"openclaw":{"requires":{"env":["GITHUB_TOKEN"],"bins":["gh"]},"primaryEnv":"GITHUB_TOKEN"}}
---
```

이 스킬은 `GITHUB_TOKEN` 환경변수와 `gh` CLI가 있을 때만 활성화됩니다.

#### 도구 직접 디스패치

```markdown
---
name: quick_search
description: 빠른 웹 검색 단축 명령
command-dispatch: tool
command-tool: web_search
command-arg-mode: raw
---
```

`/quick_search AI 뉴스` → 모델을 거치지 않고 바로 `web_search` 도구 호출

---

## 활용법 8: 워크스페이스 파일 실전 작성 가이드 📝

워크스페이스 파일들은 에이전트의 "뇌"를 구성합니다. 잘 작성하면 에이전트의 성능이 비약적으로 좋아집니다.

### AGENTS.md — 에이전트 행동 규칙서

```markdown
# AGENTS.md

## 매 세션 시작 시
1. SOUL.md 읽기 — 나의 정체성
2. USER.md 읽기 — 사용자 정보
3. memory/오늘.md + memory/어제.md 읽기 — 최근 맥락
4. 메인 세션이면 MEMORY.md도 읽기

## 안전 규칙
- 개인 데이터 외부 유출 절대 금지
- 파괴적 명령(rm, drop 등)은 반드시 확인 후 실행
- `trash` > `rm` (복구 가능한 삭제 우선)
- 확신이 없으면 질문하기

## 외부 커뮤니케이션
자유롭게 할 수 있는 것:
- 파일 읽기, 탐색, 정리
- 웹 검색, 캘린더 확인
- 워크스페이스 내 작업

먼저 물어볼 것:
- 이메일, 트윗, 공개 게시물 발송
- 기계 밖으로 나가는 모든 것

## 메모리 관리
- memory/YYYY-MM-DD.md에 일별 로그 작성
- 중요한 결정, 인사이트는 MEMORY.md에 추가
- "기억해줘"라고 하면 → 파일에 기록 (멘탈 노트 금지!)

## 그룹 채팅 참여 규칙
- 직접 멘션됐을 때만 응답
- 의미 있는 기여가 가능할 때만 발언
- 대화 흐름 방해하지 말기
- 반응(이모지)은 가볍게 활용

## 하트비트
HEARTBEAT.md를 읽고 체크리스트 실행.
할 일이 없으면 HEARTBEAT_OK 응답.
야간(23:00-08:00)에는 긴급한 것만.
```

### SOUL.md — 에이전트 인격 정의

```markdown
# SOUL.md

## 나는 누구인가
이름: 클로 (Claw)
기반: OpenClaw 🦞
역할: 김재현의 개인 AI 비서

## 성격
- 친근하지만 프로페셔널 — 반말이 아닌 존댓말
- 유머 감각 있지만 TMI는 피함
- 기술적으로 정확하되, 비전문가도 이해할 수 있게 설명
- 이모지 적당히 사용 (과하지 않게)
- 한국어 기본, 기술 용어는 영어 그대로

## 커뮤니케이션 스타일
- 짧고 핵심적인 답변 선호
- 코드는 항상 복사 가능한 완전한 형태로
- 불확실한 건 솔직하게 "잘 모르겠습니다" 
- 여러 옵션이 있으면 추천과 함께 나열

## 하지 말아야 할 것
- 사용자의 말을 그대로 따라하지 말 것
- 과도한 칭찬이나 아부하지 말 것
- 불필요한 면책 조항 달지 말 것
- "~에 대해 도움이 필요하시면 말씀해주세요" 같은 뻔한 맺음 금지
```

### MEMORY.md — 장기 기억

```markdown
# MEMORY.md — 장기 기억 저장소

## 사용자 선호
- TypeScript > JavaScript (항상 TS로 코드 작성)
- VSCode를 주 에디터로 사용
- 커피는 아메리카노, 매일 아침 스타벅스
- 주말에는 보통 카페에서 사이드 프로젝트

## 프로젝트
- **my-saas**: Next.js + Supabase 기반 SaaS (2025.03 시작)
  - 현재 MVP 개발 중
  - 우선순위: 결제 시스템 > 대시보드 > 이메일 알림
- **blog**: 기술 블로그 (Astro + MDX)
  - 매주 1편 목표

## 중요 결정 로그
- 2025.07.10: 데이터베이스를 PostgreSQL에서 PlanetScale로 이전 결정
- 2025.07.08: CI/CD를 GitHub Actions에서 Dagger로 변경 검토 중

## 반복되는 패턴
- 월요일에 주간 계획 세우는 걸 좋아함
- 금요일 오후에는 코드 리뷰 집중
- 저녁 7시 이후에는 보통 응답이 느림 (운동/저녁)

## 주의사항
- boss@company.com 이메일은 항상 즉시 알려줄 것
- 매달 15일은 카드 결제일 — 미리 알림 필요
```

### 실전 HEARTBEAT.md

```markdown
# HEARTBEAT.md

## 긴급 (항상 체크)
- [ ] boss@company.com에서 읽지 않은 이메일 → 즉시 알림
- [ ] 서버 다운 알림 → 즉시 알림
- [ ] 1시간 내 캘린더 일정 → 미리 알림

## 정기 (업무시간 09-18)
- [ ] GitHub PR 리뷰 요청 → 알림
- [ ] Slack에 미응답 멘션 → 요약 전달
- [ ] 오늘 할 일 중 미완료 항목 리마인드

## 배경 (하루 2-3회)
- [ ] 날씨 변화 (비 예보 시 우산 알림)
- [ ] memory/ 정리 + MEMORY.md 업데이트
- [ ] 진행 중인 프로젝트 git status 확인

## 야간 (23:00-08:00)
- 긴급 항목만 체크, 나머지 HEARTBEAT_OK
- 알림은 조용히 (silent: true)
```

---

## 보너스: 운영 팁 모음 🎯

### 1. Tailscale로 어디서나 접속

```bash
# Gateway를 Tailscale 네트워크에 바인딩
openclaw gateway --bind tailnet --token <토큰>

# 이제 tailscale IP로 어디서나 접속 가능
# http://100.x.y.z:18789/ (대시보드)
```

### 2. 멀티 인스턴스 운영

```bash
# 두 번째 Gateway (다른 프로필)
OPENCLAW_CONFIG_PATH=~/.openclaw/work.json \
OPENCLAW_STATE_DIR=~/.openclaw-work \
openclaw gateway --port 19001
```

### 3. 토큰 사용량 모니터링

```bash
# 토큰 사용 현황 확인
openclaw status --all

# 모델별 비용은 config에서 설정
# models.providers.*.models[].cost
```

### 4. 보안 체크리스트

- [ ] `dmPolicy: "pairing"` 설정 확인
- [ ] 웹훅 토큰 설정 (`hooks.token`)
- [ ] Gateway 토큰 설정 (비-로컬 바인딩 시)
- [ ] 민감한 에이전트는 Docker 샌드박스 적용
- [ ] `exec` 승인 시스템 검토 (`tools.elevated`)

### 5. 음성 대화 모드 🎙️

macOS 앱에서 Voice Wake + Talk Mode를 활성화하면 키보드 없이 대화할 수 있습니다. 서브 에이전트의 결과도 음성으로 들을 수 있어요.

---

## 마무리 — OpenClaw로 만드는 나만의 AI 생태계 🌐

여기까지 3편에 걸쳐 OpenClaw의 소개, 설치, 그리고 실전 고급 활용법을 살펴보았습니다.

정리하면, OpenClaw는:

- 🤖 **AI 비서** — 크론+하트비트로 알아서 챙겨주고
- 🔗 **자동화 허브** — 웹훅으로 n8n/Make/GitHub/Gmail 연동
- 🧠 **MCP 브릿지** — 외부 데이터 소스와 표준화된 연결
- 💻 **개발 파트너** — 서브 에이전트로 병렬 작업 처리
- 🏠 **스마트홈 컨트롤러** — 노드 시스템으로 카메라·알림·위치
- 🌐 **데이터 수집기** — 브라우저 자동화로 웹 모니터링
- 🧩 **확장 플랫폼** — 스킬 개발하고 ClawHub에서 공유
- 📝 **기억하는 동반자** — MEMORY.md로 세션을 넘어 기억

**올인원 AI 에이전트 플랫폼**입니다.

가장 중요한 건 **시작하는 것**입니다. 오늘 하나만 골라서 설정해보세요:

1. 🌅 **모닝 브리핑 크론** — 매일 아침 오늘의 정보 요약
2. 📝 **HEARTBEAT.md** — 파일 하나로 자동 비서 체크리스트
3. 🔗 **웹훅 하나** — GitHub/Gmail 알림을 텔레그램으로 전달

한 번 맛보면, 점점 더 많은 것을 맡기게 될 겁니다. 🦞

궁금한 점이 있다면 [OpenClaw Discord](https://discord.gg/clawd)에서 만나요! 🙌

---

*OpenClaw 완전 정복 시리즈*
- [1편: OpenClaw이 뭔가요?](/ko/blog/ko/openclaw-introduction-guide/)
- [2편: 설치부터 첫 대화까지](/ko/blog/ko/openclaw-installation-tutorial/)
- **3편: 실전 고급 활용법** ← 지금 읽은 글
