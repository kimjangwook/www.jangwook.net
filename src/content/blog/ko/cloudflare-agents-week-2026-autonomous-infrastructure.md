---
draft: true
title: 'Cloudflare Agents Week 2026 분석 — AI 에이전트가 클라우드 인프라를 직접 프로비저닝한다'
description: 'Cloudflare Agents Week 2026 전체 발표 심층 분석 — Sandboxes GA, Artifacts, Dynamic Workers, 에이전트가 직접 인프라를 자율 프로비저닝하는 기능까지. @cloudflare/agents SDK 로컬 실험 결과 포함.'
pubDate: '2026-05-15'
heroImage: '../../../assets/blog/cloudflare-agents-week-2026-autonomous-infrastructure-hero.png'
tags: ['Cloudflare', 'AI 에이전트', '에이전트 인프라', '웹 플랫폼']
relatedPosts:
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.87
    reason:
      ko: 'Cloudflare의 에이전트 인프라 방식이 LangGraph, CrewAI, Dapr와 어떻게 다른지 비교하고 싶다면 이 글이 직접적인 참조가 된다.'
      ja: 'CloudflareのアプローチがLangGraph、CrewAI、Daprとどう異なるか比較したい場合、この記事が直接の参照になる。'
      en: 'If you want to compare how Cloudflare stacks up against LangGraph, CrewAI, and Dapr for agent infrastructure, this post is the direct reference.'
      zh: '如果想了解Cloudflare的方式与LangGraph、CrewAI、Dapr有何不同，这篇文章是直接的参照。'
  - slug: 'dapr-agents-v1-cncf-production-ai-framework'
    score: 0.83
    reason:
      ko: 'Dapr Agents v1이 Kubernetes에서 상태와 메시징을 어떻게 처리하는지 알면, Cloudflare의 Durable Object 기반 접근과 어느 쪽이 팀에 맞는지 판단하기 훨씬 쉽다.'
      ja: 'Dapr Agents v1がKubernetesで状態とメッセージをどう扱うかを理解すると、CloudflareのDurable Objectベースのアプローチとどちらがチームに合うか判断しやすくなる。'
      en: "Understanding how Dapr Agents v1 handles state and messaging on Kubernetes gives you a concrete basis for deciding whether Cloudflare's Durable Object approach is the better fit."
      zh: '了解Dapr Agents v1在Kubernetes中如何处理状态和消息，有助于判断Cloudflare的Durable Object方式哪个更适合你的团队。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.80
    reason:
      ko: 'Cloudflare Agents SDK는 Workers 런타임 전용이다. 런타임 제약 없이 Python/Node에서 에이전트를 만들고 싶다면 Claude Agent SDK가 그 대안이다.'
      ja: 'Cloudflare Agents SDKはWorkersランタイム専用だ。ランタイム制約なしにPython/Nodeでエージェントを作りたいなら、Claude Agent SDKがその代替になる。'
      en: "Cloudflare's SDK is Workers-runtime-only. If you want to build agents in Python or standard Node without that constraint, the Claude Agent SDK is the direct alternative to evaluate."
      zh: 'Cloudflare的SDK只能在Workers运行时中使用。如果你想在Python/Node中不受运行时限制地构建智能体，Claude Agent SDK是直接的替代选项。'
  - slug: 'mcp-server-production-deployment-kubernetes-guide'
    score: 0.76
    reason:
      ko: 'Cloudflare에서 벤더 락인이 싫어서 컨테이너 기반 에이전트 인프라를 고려한다면, MCP 서버를 Kubernetes에 올리는 이 가이드가 비교 기준이 된다.'
      ja: 'Cloudflareのベンダーロックインが気になりコンテナベースのエージェントインフラを検討しているなら、MCPサーバーをKubernetesに乗せるこのガイドが比較の基準になる。'
      en: 'If vendor lock-in concerns push you toward container-based agent infrastructure instead of Cloudflare, this Kubernetes MCP deployment guide gives you the concrete alternative.'
      zh: '如果Cloudflare的厂商锁定让你倾向于基于容器的智能体基础设施，这篇Kubernetes上部署MCP服务器的指南可以作为对比基准。'
---

작년 이맘때 AI 에이전트 인프라 얘기를 하면 모두가 Kubernetes + LangGraph 조합을 꺼냈다. 그게 합리적인 선택이었다. 컨테이너가 이미 표준이었고, LangGraph은 상태 관리 추상화를 깔끔하게 제공했으니까. 그런데 Cloudflare가 4월 Agents Week에서 내놓은 그림은 그 전제를 흔든다.

에이전트가 단순히 API를 호출하는 게 아니라, Cloudflare 계정을 스스로 만들고 도메인을 구매하고 코드를 배포한다. "에이전트가 클라우드 고객이 된다"는 말이 과장처럼 들릴 수 있는데, 이번에는 진짜 그렇게 만들어 놨다. 20개 이상의 발표 중에서 실제로 코드를 짜는 개발자에게 영향을 미치는 것들을 추려서, 내가 인상 받은 것과 반신반의하는 것을 같이 정리한다.

직접 `@cloudflare/agents` SDK를 설치해서 로컬에서 돌려봤고, 그 결과도 포함했다.

## Agents Week 2026이란

Cloudflare가 2026년 4월에 "에이전트 전용 한 주"를 선언하고 매일 여러 건씩 발표를 쏟아낸 행사다. 최종 집계로 20개 이상의 새 기능과 GA 전환이 나왔다. 회사 전체가 "에이전트가 인터넷의 주요 행위자가 된다"는 전제 아래 인프라 전 영역을 재편한 느낌이다. 컴퓨팅, 스토리지, 네트워킹, 보안 각 영역에서 에이전트를 주요 행위자로 다시 설계했다고 볼 수 있다.

이 행사를 한 문장으로 요약하면: **Cloudflare는 에이전트가 도구가 아닌 고객이 되는 세계를 기반으로 인프라 전체를 다시 만들고 있다.**

발표 목록이 방대하니, 실제 개발에 영향을 미칠 항목 위주로 추렸다. 과장된 비전 선언보다 "내가 내일 당장 써볼 수 있나"를 기준으로 분류했다.

## 가장 도발적인 발표 — 에이전트가 직접 Cloudflare 계정을 만든다

솔직히 처음 읽었을 때 "이게 진짜야?" 싶었다. 내용은 이렇다. 사용자가 Cloudflare 약관에 최초 동의만 해두면, 이후부터는 에이전트가 자율적으로 다음 과정을 완료한다:

1. Cloudflare 계정 생성
2. 유료 구독 시작 (Stripe 결제 토큰화)
3. 도메인 등록
4. API 토큰 발급
5. 코드 배포

OAuth + OIDC로 에이전트를 "신뢰할 수 있는 행위자"로 인증하는 방식이다. Stripe 파트너십으로 결제 토큰화가 가능해졌고, 사용자가 카드 정보를 매번 입력할 필요 없이 에이전트가 자율적으로 결제까지 처리한다.

이게 의미하는 바를 실제 시나리오로 바꾸면: SaaS를 만드는 팀이 "신규 가입자가 생기면 에이전트가 그 사람 전용 인프라를 자동으로 프로비저닝한다"는 파이프라인을 만들 수 있다. 이전까지 이런 자동화는 AWS Lambda + Terraform 조합처럼 복잡한 설정이 필요했다. Cloudflare 생태계 안에서라면 이걸 에이전트 코드 몇 줄로 처리할 수 있다는 게 핵심이다.

그런데 내가 여기서 멈추고 생각해야 할 것들이 있다.

**비용 제어가 명확하지 않다.** 에이전트가 결제까지 연결된 계정을 만든다는 건, 비용 제어 메커니즘이 정교하지 않으면 예상치 못한 청구가 발생할 수 있다는 뜻이다. Cloudflare의 새 `task_budget` 개념과 같이 써야 할 것 같은데, 아직 이 조합의 실전 사례가 거의 없다.

**법적 책임 귀속이 모호하다.** 에이전트가 만든 계정에서 발생한 행위의 법적 책임이 누구에게 있는가는 정해진 선례가 없다. 서비스 약관에 사용자가 동의한다 해도, 에이전트가 잘못된 도메인을 등록했거나 예상치 못한 유료 서비스를 구독했을 때 분쟁 처리가 어떻게 될지 아직 불분명하다.

이 기능은 "혁신적"이라고 말하기 전에 기업 법무팀과 한 번 통과시켜야 할 것 같다.

## 개발자가 실제로 쓸 수 있는 세 가지

화려한 발표보다 나에게 더 실용적으로 보인 것들이 있다.

### Sandboxes GA

2025년 6월 베타로 시작해서 9개월 만에 GA가 됐다. 에이전트 전용 격리 Linux 환경이다. 구성은 이렇다:

- 실제 셸 (bash, zsh 사용 가능)
- 독립 파일시스템
- 백그라운드 프로세스 실행 가능
- 라이브 프리뷰 URL (외부에서 접근 가능)
- 크리덴셜 인젝션 지원

가장 중요한 특성은 **"picks up exactly where it left off"**다. 에이전트가 중단됐다가 재개될 때 동일한 환경 상태를 이어받는다. 컨테이너가 아니라 Durable Object 기반 영속성을 쓰기 때문에 가능한 특성이다. 코드를 clone 하고, 패키지를 설치하고, 빌드를 돌리고, 결과를 확인한 다음 중단됐다가, 다음 날 다시 시작했을 때 그 상태가 그대로 있다.

컨테이너 스핀업 시간이 밀리초 단위라는 점도 중요하다. 코드 생성 에이전트가 "코드 작성 → 실행 → 결과 확인 → 수정" 루프를 빠르게 돌릴 수 있다는 의미다.

[LangGraph나 CrewAI 같은 프레임워크에서 에이전트 코드 실행 환경을 따로 구성](/ko/blog/ko/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)해야 했다면, Sandboxes는 그 부분을 Cloudflare가 관리해주는 방식이다. 프레임워크를 선택하는 것보다 인프라 레이어를 선택하는 결정에 가깝다. 이 차이가 아직 익숙하지 않을 수 있다.

### Artifacts

Git 호환 버전 관리 스토리지다. 이름만 보면 단순한 파일 스토리지처럼 보이는데, 설계가 에이전트 친화적이다.

- 수천만 개의 레포 생성 가능 (에이전트마다 독립 레포)
- 리모트 소스에서 포크 지원
- 표준 Git 클라이언트로 접근 가능
- 에이전트와 외부 도구 양쪽에서 접근 가능

현실적인 문제 하나를 해결한다. 에이전트가 코드를 생성하면 그 결과물이 대화 컨텍스트 안에만 존재한다. 컨텍스트가 초기화되면 사라진다. Artifacts는 그 결과물에 영구적인 주소를 부여하는 레이어다. Private beta에서 5월 초에 public beta로 열렸다.

### Dynamic Workers

AI가 생성한 코드를 실행하는 격리 런타임이다. 기존 컨테이너 대비 밀리초 단위 스핀업, 수백만 동시 실행 확장 가능을 내세운다. 에이전트가 코드를 만들고 곧바로 실행 결과를 받는 루프가 가능해진다. 아직 초기이고 검증된 사례가 많지 않지만, 방향성은 맞다.

## @cloudflare/agents SDK를 직접 설치해봤다

이론은 충분하니 실제로 돌려봤다.

```bash
mkdir cloudflare-agent-demo && cd cloudflare-agent-demo
npm init -y
npm install @cloudflare/agents
```

설치는 바로 된다. `@cloudflare/agents@0.0.16` 기준으로 주요 export는 세 가지다:

- `Agent` — 기본 에이전트 클래스 (Durable Object 기반)
- `AIChatAgent` — AI 채팅 에이전트 (멀티턴 대화 + 메시지 영속성)
- `routeAgentRequest` — Worker에서 에이전트로 요청 라우팅

기본 에이전트 코드를 작성했다:

```typescript
// src/index.ts
import { Agent, routeAgentRequest } from "@cloudflare/agents";

interface TaskState {
  processedCount: number;
  lastHeartbeat: string;
}

interface Env {
  TASK_AGENT: DurableObjectNamespace<TaskAgent>;
}

export class TaskAgent extends Agent<Env, TaskState> {

  // 에이전트 생성 시 초기화
  async onStart() {
    this.setState({ processedCount: 0, lastHeartbeat: new Date().toISOString() });
    // 외부 cron 서비스 없이 에이전트 안에서 스케줄 등록
    await this.schedule("0 * * * *", "heartbeat", {});
  }

  // cron 콜백: 내장 SQLite 쿼리
  async heartbeat() {
    const count = this.sql<{ n: number }>`
      SELECT COUNT(*) as n FROM tasks WHERE status = 'pending'
    `;
    this.setState({
      processedCount: count[0]?.n ?? 0,
      lastHeartbeat: new Date().toISOString()
    });
    console.log(`[heartbeat] pending tasks: ${this.state?.processedCount}`);
  }

  // HTTP 요청 처리
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/status") {
      return Response.json({ state: this.state, ok: true });
    }

    if (url.pathname === "/task" && request.method === "POST") {
      const { description } = await request.json() as { description: string };
      this.sql`
        INSERT INTO tasks (id, description, status, created_at)
        VALUES (${crypto.randomUUID()}, ${description}, 'pending', ${Date.now()})
      `;
      return Response.json({ queued: true });
    }

    return new Response("Not Found", { status: 404 });
  }

  // 에이전트가 직접 이메일 수신 — Workers Email Routing 연동
  async onEmail(email: ForwardableEmailMessage) {
    this.sql`
      INSERT INTO tasks (id, description, status, created_at)
      VALUES (${crypto.randomUUID()}, ${`[email from] ${email.from}`}, 'pending', ${Date.now()})
    `;
  }
}

// Worker 진입점
export default {
  fetch: async (req: Request, env: Env): Promise<Response> => {
    const routed = await routeAgentRequest(req, env);
    return routed ?? new Response("Cloudflare Agent Demo Running", { status: 200 });
  }
};
```

`wrangler.toml` 설정:

```toml
name = "my-task-agent"
main = "src/index.ts"
compatibility_date = "2026-05-01"

[[durable_objects.bindings]]
name = "TASK_AGENT"
class_name = "TaskAgent"

# 이 한 줄로 에이전트 인스턴스마다 SQLite가 자동으로 생성
[[migrations]]
tag = "v1"
new_sqlite_classes = ["TaskAgent"]
```

`wrangler dev`를 실행하면 로컬에서 바로 돌아간다:

```
⛅️ wrangler 4.91.0
───────────────────
Your Worker has access to the following bindings:
Binding                         Resource            Mode
env.TASK_AGENT (TaskAgent)      Durable Object      local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:9998
[wrangler:info] GET / 200 OK (7ms)
```

Cloudflare 계정 없이도 로컬 개발은 가능하다. 중요한 점 하나: `@cloudflare/agents`는 `cloudflare:workers` 런타임 전용이라 일반 Node.js로는 실행이 안 된다. `ERR_UNSUPPORTED_ESM_URL_SCHEME` 에러가 뜬다. Wrangler를 통해서만 실행해야 한다. [Claude Agent SDK처럼 Python/Node에서 직접 import하는 방식](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)에 익숙한 개발자라면 이 점이 처음엔 낯설다.

## 아키텍처적으로 인상적인 설계 선택들

코드를 보면서 Cloudflare의 설계 의도가 몇 가지 눈에 들어왔다.

**SQLite 내장**: `new_sqlite_classes` 하나만 선언하면 Agent 인스턴스마다 SQLite가 붙는다. 별도 DB 설정 없이 `this.sql` 로 쿼리가 된다. Durable Object의 격리성 덕분에 멀티테넌시 구조가 자연스럽게 된다. 에이전트 인스턴스마다 독립된 DB를 갖는다는 게 처음엔 낭비처럼 보이는데, 상태 격리 측면에서는 꽤 깔끔하다. 레디스 같은 외부 캐시 레이어 없이 빠른 읽기가 가능하다.

**스케줄링 내장**: `cron` 형식 스케줄을 에이전트 안에서 직접 등록한다. 외부 cron 서비스가 필요 없다. Durable Object의 알람 API를 래핑한 것인데, 에이전트 코드 안에서 스케줄과 상태 관리가 함께 있으니 응집도가 높다. 에이전트가 자신의 주기적 동작을 코드 레벨에서 완전히 제어한다.

**이메일 핸들러**: `onEmail` 메서드 하나로 이메일을 직접 처리할 수 있다. Workers Email Routing과 연동된다. "이메일 → 태스크" 패턴을 별도 이메일 파싱 서비스 없이 구현할 수 있다.

**Voice Pipeline (실험적)**: 약 30줄의 서버 코드로 WebSocket 기반 실시간 음성 상호작용을 구현할 수 있다고 한다. STT + TTS를 에이전트 안에서 처리하는 구조다. 아직 실험적이지만 방향이 흥미롭다.

[Dapr Agents가 Kubernetes에서 사이드카 패턴으로 상태와 메시지를 관리하는 방식](/ko/blog/ko/dapr-agents-v1-cncf-production-ai-framework)과 비교하면, Cloudflare의 접근은 인프라를 덜 만지고 코드를 더 쓰는 쪽이다. Dapr은 인프라 독립성이 높지만 설정이 복잡하고, Cloudflare는 간단하지만 플랫폼에 깊이 묶인다. 팀의 상황에 따라 선택이 달라진다.

## 솔직한 평가

좋은 점부터.

에이전트를 위한 인프라 레이어를 처음부터 새로 설계했다는 점이 일관성 있어 보인다. Durable Object 위에 상태, 스케줄, 이메일, SQLite를 올린 구조가 "에이전트에 필요한 게 뭔지 알고 설계했다"는 느낌을 준다. 로컬 개발 환경이 바로 된다는 것도 장점이다. wrangler dev 명령 하나로 Durable Object, SQLite, 스케줄링을 로컬에서 완전히 모사한다.

**20+ 발표 전체에서 보이는 방향성**: Cloudflare는 단순히 CDN이나 Serverless 플랫폼이 아니라 에이전트가 존재하는 전체 인터넷 레이어가 되려고 한다. 인증 (Signed Agents), 에이전트 트래픽 구분, 이메일, 음성, 스토리지, 컴퓨팅을 한 플랫폼 안에 묶는다. 이 통합성이 진지한 사용자에겐 매력이다.

불안한 점은 두 가지다.

**첫째, 벤더 락인이 강하다.** `cloudflare:workers`에서만 돌아가고, Durable Object의 설계를 그대로 따른다. 나중에 플랫폼을 바꾸고 싶으면 에이전트 코드를 상당 부분 다시 써야 한다. [MCP 서버를 Kubernetes에 올리는 방식](/ko/blog/ko/mcp-server-production-deployment-kubernetes-guide)처럼 컨테이너 기반으로 가면 이 문제는 없는데, 그 대신 인프라 복잡도가 올라간다. 이 트레이드오프를 의식적으로 선택해야 한다.

**둘째, 에이전트 간 통신 패턴이 아직 얕다.** 발표된 내용을 보면 단일 에이전트가 훨씬 강해졌는데, 여러 에이전트가 복잡하게 협력하는 패턴은 SDK 레벨에서 아직 얇다. A 에이전트가 B 에이전트에게 작업을 위임하고 결과를 받는 패턴, 에이전트 간 공유 메모리 같은 구조는 직접 만들어야 한다. Project Think 프레임워크로 개선 중이라고 하는데 아직 초기다.

**SDK 성숙도**: `@cloudflare/agents@0.0.16`이다. 1.0 미만이다. API 표면이 바뀔 수 있다는 위험을 감수해야 한다.

## 언제 Cloudflare로 가야 하는가

나는 이렇게 정리한다.

**맞는 케이스**: Edge 응답 속도가 중요한 에이전트 (지연 시간이 핵심인 실시간 상호작용), Cloudflare Workers 기반으로 이미 뭔가 운영 중인 팀, "배포는 최대한 단순하게, 코드에 집중하고 싶다"는 방향, 다수의 독립 에이전트가 각자 상태를 갖는 멀티테넌시 구조, SaaS 제품에서 고객별 독립 에이전트 인스턴스가 필요한 경우.

**맞지 않는 케이스**: 복잡한 멀티 에이전트 오케스트레이션이 핵심인 경우 (이미 LangGraph나 CrewAI 팀이라면), 특정 클라우드 인프라(AWS, GCP)에 묶여 있는 팀, Python 런타임이 필수인 ML 파이프라인, Node.js나 기타 환경에서 에이전트를 직접 실행해야 하는 요구사항.

Agents Week의 전체적인 방향은 분명하다. Cloudflare는 AI 에이전트 인프라 표준 자리를 노리고 있다. Kubernetes가 컨테이너 시대의 기반이 됐던 것처럼 에이전트 시대의 기반이 되겠다는 의도다. SDK가 아직 v0 수준이라 프로덕션 적용에는 신중할 필요가 있다. 하지만 에이전트 전용 인프라 설계를 진지하게 고민 중이라면, 지금 한 번 직접 돌려보고 판단하는 게 맞다. 로컬 테스트는 Cloudflare 계정 없이도 완전히 가능하다.

## 에이전트 보안: Signed Agents

발표 중 상대적으로 덜 주목 받았지만 흥미로운 게 있다. **Signed Agents** — 에이전트가 생성한 트래픽에 암호학적 서명을 붙이는 기능이다.

현재 인터넷에서 에이전트 트래픽과 사람 트래픽을 구분하는 표준 방법이 없다. Cloudflare는 에이전트가 보내는 HTTP 요청에 고유 서명을 넣어 "이건 에이전트가 보낸 것"임을 증명할 수 있게 한다. 서버 측에서 이 서명을 검증해서 에이전트 전용 레이트 리밋이나 접근 제어를 적용할 수 있다.

인프라 관점에서 이건 꽤 중요한 primitive다. 지금은 "AI 봇인지 아닌지"를 User-Agent 문자열이나 IP 패턴으로 추측하는 식이다. Signed Agents가 표준이 되면 에이전트 트래픽 분류, 요금 체계 분리, 보안 정책 적용이 명확해진다.

아직 프리뷰 단계고 광범위한 채택까지는 시간이 걸리겠지만, 에이전트가 인터넷의 주요 행위자가 된다는 전제에서 이런 인프라 프리미티브는 조만간 필요해진다.

## 에이전트 이메일 서비스 (Public Beta)

Agents Week 기간 중 Workers Email Service가 공개 베타로 전환됐다. 애플리케이션과 에이전트가 직접 이메일을 보낼 수 있다. 기존에는 SendGrid, AWS SES 같은 서드파티 이메일 서비스가 필요했다.

에이전트 관점에서 의미가 있는 건 **이메일 수신과 발신 모두** 에이전트 코드 안에서 처리 가능해진다는 점이다. 앞서 보여준 `onEmail` 메서드로 수신을 처리하고, Workers Email API로 발신을 처리하면 이메일 기반 에이전트 워크플로우를 외부 서비스 없이 구현할 수 있다. 고객 지원 에이전트, 알림 에이전트, 이메일 기반 태스크 관리 에이전트 같은 유형에 바로 써볼 수 있다.

## 정리하며

Cloudflare의 Agents Week를 전체적으로 보면, 이건 기능 릴리스가 아니라 포지셔닝 선언이다. "에이전트 시대에 인터넷 인프라를 새로 짜겠다"는 의도가 20개 이상의 발표 전체에서 일관되게 보인다.

개인적으로 이번 주에서 가장 주목한 것은 Sandboxes GA다. 화려한 "에이전트가 직접 계정을 만든다"보다, 에이전트가 코드를 실행하고 결과를 검증하는 루프를 Cloudflare가 직접 관리해주는 게 더 즉각적인 실용 가치가 있다.

SDK가 `v0.0.16`이라는 버전 번호가 말해주는 것처럼, 아직 프로덕션에 올리기에는 이르다. 하지만 에이전트 인프라가 어떤 방향으로 가야 하는지를 고민하는 팀이라면, 지금 직접 설치하고 로컬에서 돌려보는 게 낫다. 20분 투자로 방향성을 파악할 수 있다.

---

**테스트 환경**: `@cloudflare/agents@0.0.16`, `wrangler@4.91.0`, Node.js v22.22.0, macOS 14  
**참고**: 에이전트 자율 계정 생성 기능은 실제 Cloudflare 계정과 Stripe 연동이 필요하며 로컬 테스트 범위 밖이다.  
**원본 발표**: [Cloudflare Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/)
