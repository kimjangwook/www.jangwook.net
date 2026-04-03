---
title: MCP Gateway — AI 에이전트의 도구 호출을 누가 통제하고 있는가
description: >-
  MCP가 월 9,700만 다운로드를 돌파하며 사실상 표준이 됐지만, 에이전트가 어떤 도구를 얼마나 호출하는지 통제하는 레이어는 빠져 있다.
  MCP Gateway 패턴으로 이 문제를 풀어본다.
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/mcp-gateway-agent-traffic-control-hero.jpg
tags:
  - mcp
  - security
  - ai-agent
  - architecture
relatedPosts:
  - slug: sqlite-ai-swarm-build
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: adl-agent-definition-language-governance
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

내 Claude Code 세션 하나가 MCP 서버 7개에 연결돼 있다. GitHub, Notion, Google Calendar, Gmail, Chrome DevTools, NotebookLM, 그리고 Telegram. 이 에이전트가 내 이메일을 읽고, 캘린더에 일정을 만들고, 노션 페이지를 수정하고, 크롬 탭을 열 수 있다.

근데 이걸 누가 감시하고 있나?

아무도 없다. 적어도 지금 내 로컬 환경에선 그렇다.

## MCP는 성공했다. 보안 레이어는 아직이다

MCP(Model Context Protocol)의 성장세는 무섭다. Python + TypeScript SDK 합산 월간 다운로드가 9,700만을 넘었고, Anthropic, OpenAI, Google, Microsoft, Amazon이 전부 지원한다. 2024년 말 Anthropic이 만들고, 2025년 12월 Linux Foundation의 AAIF에 기부한 이후로 사실상 "AI 에이전트가 외부 도구를 부르는 방법"의 표준이 됐다.

문제는 이 프로토콜이 **연결**에 집중하고 있지, **통제**에는 별 관심이 없다는 점이다.

MCP 서버를 만들면 도구(tool)를 정의하고, 클라이언트가 그 도구를 호출한다. 인증? OAuth 2.1이 스펙에 들어갔다. 하지만 "이 에이전트가 이 도구를 하루에 몇 번까지 호출할 수 있는가", "민감한 데이터를 반환하는 도구는 승인 없이 호출하면 안 된다" 같은 정책 레이어는 MCP 프로토콜 자체에 없다. 그건 구현하는 쪽의 몫이다.

그래서 나온 개념이 MCP Gateway다.

## MCP Gateway가 뭔가

API Gateway를 생각하면 된다. Kong이나 AWS API Gateway처럼 백엔드 앞에 프록시를 두는 것처럼, MCP 서버들 앞에 프록시를 하나 두는 거다.

에이전트 → **MCP Gateway** → MCP 서버들

Gateway가 하는 일:
- **인증/인가**: 어떤 에이전트가 어떤 도구에 접근 가능한지
- **레이트 리밋**: 도구 호출 빈도 제한
- **감사 로그**: 누가 언제 무슨 도구를 불렀는지 전부 기록
- **정책 적용**: 특정 도구는 사람 승인 후에만 실행
- **트래픽 라우팅**: 요청을 적절한 MCP 서버로 전달

나는 이걸 내 로컬 환경에서 간단하게 테스트해봤다. Node.js로 MCP 프록시를 하나 만들어서 Claude Code와 실제 MCP 서버 사이에 끼워넣는 방식이다.

```typescript
// 가장 단순한 MCP Gateway 뼈대
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const gateway = new Server({ name: "mcp-gateway", version: "0.1.0" }, {
  capabilities: { tools: {} }
});

// 정책 엔진 — 여기서 호출을 허용/거부한다
const policy = {
  "gmail_read_message": { rateLimit: 10, requireApproval: false },
  "gmail_create_draft": { rateLimit: 5, requireApproval: true },
  "gcal_delete_event": { rateLimit: 2, requireApproval: true },
  "notion-update-page": { rateLimit: 20, requireApproval: false },
};

const callCount: Record<string, number> = {};

gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  
  // 레이트 리밋 체크
  callCount[toolName] = (callCount[toolName] || 0) + 1;
  if (rule && callCount[toolName] > rule.rateLimit) {
    return {
      content: [{ type: "text", text: `Rate limit exceeded for ${toolName}` }],
      isError: true,
    };
  }
  
  // 승인 필요 도구는 블록
  if (rule?.requireApproval) {
    console.error(`[GATEWAY] Approval required for: ${toolName}`);
    // 실제로는 여기서 Slack/Telegram으로 승인 요청을 보낸다
  }
  
  // 감사 로그
  console.error(`[AUDIT] ${new Date().toISOString()} | ${toolName} | args: ${JSON.stringify(request.params.arguments)}`);
  
  // 실제 MCP 서버로 포워딩 (여기선 생략)
  return await forwardToUpstream(toolName, request.params.arguments);
});
```

이 코드가 실제로 프로덕션에 쓸 만한가? 솔직히 아직 아니다. 하지만 핵심 아이디어는 이것만으로 충분히 전달된다. 에이전트의 도구 호출은 반드시 한 곳을 거쳐야 하고, 그 한 곳에서 정책을 걸 수 있어야 한다.

## 실제로 돌려보니 빠진 게 보인다

위 코드를 Claude Code에 끼워넣고 돌려봤다. 결과부터 말하면 — 그대로는 안 된다.

첫 번째 문제는 <strong>도구 목록 동기화</strong>다. Gateway가 `CallToolRequest`를 가로채려면, 먼저 클라이언트(Claude Code)에게 "나한테 이런 도구들이 있어"라고 알려줘야 한다. 위 코드에는 `listTools` 핸들러가 없다. upstream MCP 서버에 연결해서 도구 목록을 가져오고, 그걸 그대로 클라이언트에게 전달하는 부분을 직접 만들어야 한다.

```typescript
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

gateway.setRequestHandler(ListToolsRequestSchema, async () => {
  // upstream MCP 서버에서 도구 목록을 가져와서 그대로 전달
  const upstreamTools = await fetchToolsFromUpstream();
  return { tools: upstreamTools };
});
```

이것만으로도 동작하긴 하는데, upstream 서버가 여러 개면 도구 이름이 충돌할 수 있다. 내 환경에선 Gmail과 Google Calendar가 둘 다 `list` 같은 generic한 이름의 도구를 노출하고 있어서, 네임스페이스를 붙여야 했다.

두 번째 문제는 <strong>레이트 리밋의 수명</strong>이다. 위 코드에서 `callCount`는 메모리에 있다. 프로세스를 재시작하면 카운트가 0으로 돌아간다. Claude Code는 세션마다 MCP 서버를 새로 띄우니까, 세션이 바뀔 때마다 리밋이 초기화된다. "하루 10번"이라는 정책을 제대로 지킬 수 없다는 뜻이다.

세 번째로, `requireApproval`을 `console.error`로 찍는 건 아무 의미가 없었다. stderr 로그를 실시간으로 보고 있는 사람이 없으니까. 실제로 승인을 받으려면 외부 채널(Telegram, Slack)로 요청을 보내고 응답이 올 때까지 블록해야 하는데, stdio 기반 MCP에서 비동기 대기를 구현하려면 상당히 번거롭다.

이 세 가지를 한 번에 해결하는 방법이 뭔가 생각해봤는데, 적어도 첫 번째와 두 번째는 답이 단순하다. <strong>감사 로그를 파일이나 메모리가 아니라 SQLite에 쓰면 된다.</strong>

## 감사 로그를 SQLite로

`console.error`로 흘려보내던 감사 로그를 SQLite 테이블에 저장하면, 레이트 리밋의 수명 문제도 같이 풀린다. 프로세스가 재시작돼도 DB는 남아있으니까.

```typescript
import Database from "better-sqlite3";

const db = new Database("mcp-audit.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    tool_name TEXT NOT NULL,
    args TEXT,
    result_status TEXT DEFAULT 'ok',
    latency_ms INTEGER,
    blocked INTEGER DEFAULT 0,
    block_reason TEXT
  )
`);

const insertLog = db.prepare(`
  INSERT INTO audit_log (tool_name, args, result_status, latency_ms, blocked, block_reason)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// 레이트 리밋도 DB 기반으로
const countToday = db.prepare(`
  SELECT COUNT(*) as cnt FROM audit_log
  WHERE tool_name = ? AND timestamp > datetime('now', '-1 day') AND blocked = 0
`);
```

기존 `callCount` 딕셔너리 대신 `countToday` 쿼리를 쓰면, 세션이 바뀌어도 "오늘 Gmail 읽기를 몇 번 호출했는지"를 정확히 추적할 수 있다. Gateway 핸들러는 이렇게 바뀐다:

```typescript
gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  const start = Date.now();

  // DB 기반 레이트 리밋
  if (rule) {
    const { cnt } = countToday.get(toolName) as { cnt: number };
    if (cnt >= rule.rateLimit) {
      insertLog.run(toolName, JSON.stringify(request.params.arguments),
        "blocked", 0, 1, "rate_limit");
      return {
        content: [{ type: "text",
          text: `Rate limit exceeded: ${toolName} (${cnt}/${rule.rateLimit} today)` }],
        isError: true,
      };
    }
  }

  const result = await forwardToUpstream(toolName, request.params.arguments);
  const latency = Date.now() - start;

  insertLog.run(toolName, JSON.stringify(request.params.arguments),
    "ok", latency, 0, null);
  return result;
});
```

## 쌓인 로그로 뭘 할 수 있나

며칠 돌려보니 `mcp-audit.db`에 데이터가 쌓였다. 이걸로 할 수 있는 게 생각보다 많다.

<strong>도구별 호출 빈도</strong> — 어떤 도구가 가장 많이 불리는지 한 눈에 보인다.

```sql
SELECT tool_name, COUNT(*) as calls, ROUND(AVG(latency_ms)) as avg_ms
FROM audit_log WHERE blocked = 0
GROUP BY tool_name ORDER BY calls DESC LIMIT 10;
```

내 경우 `notion-search`가 압도적 1위였다. 에이전트가 뭔가를 하기 전에 일단 Notion을 검색하는 패턴이 있더라. 이걸 보고 Notion 검색 결과를 캐싱하는 게 의미 있겠다는 생각이 들었다.

<strong>차단 비율</strong> — 레이트 리밋에 걸린 호출이 전체의 몇 퍼센트인지.

```sql
SELECT tool_name,
  SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked,
  COUNT(*) as total,
  ROUND(100.0 * SUM(blocked) / COUNT(*), 1) as block_rate
FROM audit_log GROUP BY tool_name HAVING blocked > 0;
```

차단 비율이 높으면 두 가지 중 하나다. 리밋이 너무 빡빡하거나, 에이전트가 같은 도구를 반복 호출하는 비효율적인 패턴을 갖고 있거나. 후자라면 프롬프트를 손보는 게 맞다.

<strong>시간대별 패턴</strong> — 에이전트가 언제 가장 활발한지.

```sql
SELECT strftime('%H', timestamp) as hour, COUNT(*) as calls
FROM audit_log GROUP BY hour ORDER BY hour;
```

당연한 결과이긴 한데, 내 크론 작업이 도는 11시~12시에 호출이 몰린다. 팀 환경이라면 이 데이터로 MCP 서버의 부하 분산 시점을 잡을 수 있을 거다.

이 데이터의 진짜 가치는 <strong>정책 튜닝의 근거</strong>가 된다는 점이다. "Gmail 읽기는 하루 10번이면 충분할까?" 같은 질문에 감으로 답하는 게 아니라, 실제 사용 패턴을 보고 판단할 수 있다. 내 경우 `gmail_read_message`를 하루 평균 3번밖에 안 쓰고 있어서 리밋 10은 넉넉했다. 반면 `notion-search`는 하루 40번 가까이 불리고 있어서 리밋 20으로는 부족했고, 30으로 올렸다.

## 실제로 필요한 순간

"우리 팀은 아직 MCP를 그렇게 많이 안 쓰는데요" — 이 말이 통하던 시절이 끝나가고 있다.

내가 직접 겪은 케이스를 하나 들자면, Claude Code에서 Notion MCP로 페이지를 수정하다가 의도치 않게 다른 팀의 페이지를 건드린 적이 있다. 에이전트가 검색 결과에서 비슷한 제목의 페이지를 골랐고, 나는 승인 버튼을 별 생각 없이 눌렀다. 데이터가 날아간 건 아니지만 민망했다.

이런 일이 1명의 개발자 로컬에서 일어나면 민망한 수준이다. 하지만 팀 50명이 에이전트를 쓰고, 각 에이전트가 5~10개 MCP 서버에 연결돼 있으면? 감사 로그도 없이? 누가 무슨 도구를 불렀는지 추적도 안 되면?

엔터프라이즈에서 MCP Gateway가 필요한 진짜 이유는 보안보다 **가시성**이다. 에이전트가 뭘 하는지 보여야 한다.

## 이미 나오고 있는 솔루션들

MCP Gateway라는 이름으로 등장하는 오픈소스와 상용 프로젝트가 이미 있다. 찾아본 바로는 크게 두 가지 접근이 있다.

**1. 프록시 방식** — 에이전트와 MCP 서버 사이에 리버스 프록시를 둔다. 기존 API Gateway와 아키텍처가 같다. 설정이 간단하고 기존 인프라를 재활용할 수 있다는 장점이 있다.

**2. 사이드카 방식** — 각 MCP 서버에 정책 엔진을 붙인다. 서비스 메시(Istio, Linkerd)의 사이드카 패턴과 동일하다. 더 세밀한 제어가 가능하지만 운영 복잡도가 올라간다.

나는 소규모 팀이라면 프록시 방식이면 충분하다고 본다. 사이드카까지 가는 건 MCP 서버가 20개 이상이고 팀마다 다른 정책이 필요한 경우인데, 그 규모면 이미 전담 플랫폼 엔지니어가 있을 거다.

## 하지만 이건 과도기적 해법이다

여기서 비판적으로 생각해봐야 할 게 있다.

MCP Gateway가 필요하다는 건, MCP 프로토콜 자체에 거버넌스 레이어가 빠져있다는 뜻이다. HTTP 위에 API Gateway를 올리는 건 HTTP가 인증을 안 해서가 아니라 비즈니스 로직과 트래픽 관리가 필요해서다. MCP도 마찬가지로 프로토콜 레벨에서 정책을 정의할 수 있는 확장이 나올 가능성이 높다.

그때 지금 만든 Gateway가 레거시가 된다.

개인적으로는 6개월 안에 MCP 스펙에 policy extension 같은 게 추가될 거라고 본다. Linux Foundation에 기부된 이후 거버넌스 관련 논의가 활발한 걸 보면, 이미 방향은 잡혀 있는 것 같다. 하지만 그 6개월 동안 아무 통제 없이 에이전트를 돌리는 건 위험하니까, Gateway는 그 사이를 매우는 **브릿지 솔루션**이다.

또 하나 — Gateway를 도입하면 에이전트의 응답 속도가 느려진다. 프록시를 한 단계 거치니까 당연하다. 로컬에서 테스트해보니 도구 호출당 50~100ms 정도 오버헤드가 추가됐다. 대부분의 경우 체감이 안 되지만, LLM이 한 태스크에서 도구를 20~30번 호출하는 패턴에서는 전체 1~2초가 추가되고, 이건 사용자 경험에 영향을 줄 수 있다.

## 아직 안 풀린 것

SQLite로 로그를 쌓고 정책을 튜닝하는 것까지는 혼자서도 된다. 하지만 `requireApproval` — 사람의 승인을 받는 부분은 아직 제대로 구현 못했다.

내가 다음에 시도할 건 Telegram 봇 연동이다. `requireApproval: true`인 도구 호출이 들어오면 Telegram으로 승인 요청을 보내고, 사용자가 "OK"를 누를 때까지 Gateway가 요청을 홀딩하는 방식. 아이디어는 간단한데, stdio 기반 MCP에서 이걸 비동기로 처리하려면 구조를 좀 바꿔야 한다. 지금은 요청이 들어오면 바로 응답해야 하는 동기 구조라서.

그리고 근본적으로, 이건 개인 개발자의 로컬 환경에서만 의미 있는 수준이다. 팀 단위로 쓰려면 Gateway 자체의 인증, 멀티테넌시, 정책 관리 UI 같은 게 필요하고, 그쯤 되면 직접 만드는 게 아니라 제품을 쓰는 게 맞다.

AI 에이전트에게 도구를 줄 때 "무엇을 할 수 있는가"만큼 "무엇을 못하게 할 것인가"가 중요하다. MCP Gateway는 후자를 위한 가장 현실적인 시작점이고, SQLite 하나만 붙여도 "내 에이전트가 뭘 하고 있는지"가 보이기 시작한다. 거기서부터 정책은 데이터로 결정할 수 있다.
