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
      ko: MCP Gateway가 에이전트의 도구 호출을 중앙에서 통제하듯, 멀티 에이전트 스웜에서도 각 에이전트의 리소스 접근과 작업 범위를 제어하는 오케스트레이션이 핵심입니다.
      ja: MCP Gatewayがエージェントのツール呼び出しを一元管理するように、マルチエージェントスウォームでも各エージェントのリソースアクセスと作業範囲を制御するオーケストレーションが鍵になります。
      en: Just as MCP Gateway centralizes control over agent tool calls, multi-agent swarms face the same challenge of orchestrating resource access and task boundaries for each agent.
      zh: 正如MCP Gateway集中控制Agent的工具调用，多Agent蜂群同样需要编排每个Agent的资源访问和任务边界。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: MCP Gateway의 인증/인가, 감사 로그, 정책 적용은 결국 NIST가 정의한 AI 에이전트 보안 표준을 런타임에서 구현하는 것과 같습니다.
      ja: MCP Gatewayの認証・認可、監査ログ、ポリシー適用は、NISTが定義したAIエージェントセキュリティ標準をランタイムで実装することに他なりません。
      en: The authentication, audit logging, and policy enforcement in MCP Gateway are essentially a runtime implementation of the AI agent security standards defined by NIST.
      zh: MCP Gateway的认证授权、审计日志和策略执行，本质上是在运行时落地NIST定义的AI Agent安全标准。
  - slug: adl-agent-definition-language-governance
    score: 0.94
    reason:
      ko: MCP Gateway가 런타임에서 도구 호출을 통제한다면, ADL은 에이전트의 권한과 행동 범위를 선언적으로 정의하는 설계 시점의 거버넌스입니다. 둘을 조합하면 완전한 에이전트 통제 체계가 됩니다.
      ja: MCP Gatewayがランタイムでツール呼び出しを制御するなら、ADLはエージェントの権限と行動範囲を宣言的に定義する設計時のガバナンスです。両者を組み合わせれば完全なエージェント制御体系になります。
      en: If MCP Gateway controls tool calls at runtime, ADL defines agent permissions and behavioral boundaries declaratively at design time. Combining both creates a complete agent governance stack.
      zh: 如果MCP Gateway在运行时控制工具调用，ADL则在设计时以声明式方式定义Agent的权限和行为边界。两者结合才构成完整的Agent治理体系。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.94
    reason:
      ko: 엔터프라이즈 에이전트 플랫폼에서 MCP Gateway 같은 통제 레이어가 어떻게 제품화되는지 보여주는 사례입니다. 개인 프록시 vs 상용 플랫폼의 차이를 비교해볼 수 있습니다.
      ja: エンタープライズエージェントプラットフォームにおいて、MCP Gatewayのような制御レイヤーがどのように製品化されるかを示す事例です。個人プロキシと商用プラットフォームの違いを比較できます。
      en: Shows how an enterprise agent platform productizes the kind of control layer that MCP Gateway provides. Useful for comparing a DIY proxy approach against a commercial platform solution.
      zh: 展示了企业级Agent平台如何将MCP Gateway式的控制层产品化。可以对比自建代理与商业平台方案的差异。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.94
    reason:
      ko: Dapr Agents가 CNCF 생태계 위에서 에이전트를 운영하듯, MCP Gateway도 클라우드 네이티브 인프라 패턴(사이드카, 서비스 메시)을 활용합니다. 프로덕션 배포 아키텍처의 공통점이 많습니다.
      ja: Dapr AgentsがCNCFエコシステム上でエージェントを運用するように、MCP Gatewayもクラウドネイティブインフラパターン（サイドカー、サービスメッシュ）を活用します。プロダクション配置アーキテクチャの共通点が多いです。
      en: Just as Dapr Agents runs agents on the CNCF ecosystem, MCP Gateway leverages cloud-native infrastructure patterns like sidecars and service meshes. The two share significant overlap in production deployment architecture.
      zh: Dapr Agents在CNCF生态上运行Agent，MCP Gateway也利用Sidecar和服务网格等云原生基础设施模式。两者在生产部署架构上有很多共同点。
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

## 내가 다음에 해볼 것

지금은 로컬에서 프로토타입 수준으로만 테스트했다. 다음 단계로는:

- Telegram 봇과 연동해서 `requireApproval: true`인 도구 호출이 들어오면 Telegram으로 승인 요청을 보내는 워크플로우를 만들어볼 생각이다
- 감사 로그를 SQLite에 저장해서 "이번 주에 내 에이전트가 가장 많이 부른 도구 Top 10" 같은 통계를 뽑아보고 싶다

AI 에이전트에게 도구를 줄 때 "무엇을 할 수 있는가"만큼 "무엇을 못하게 할 것인가"가 중요하다. MCP Gateway는 후자를 위한 가장 현실적인 시작점이다. 다만 이게 영원한 답은 아니라는 것도 기억해두자.
