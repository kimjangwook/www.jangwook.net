---
title: 'Cloudflare Agents Week 2026分析 — AI智能体成为云基础设施的自主运营者'
description: 'Cloudflare Agents Week 2026全面解析 — Sandboxes GA、Artifacts、Dynamic Workers，以及AI智能体自主提供基础设施的功能。20多项公告深度分析，附@cloudflare/agents SDK本地实验结果。'
pubDate: '2026-05-15'
heroImage: '../../../assets/blog/cloudflare-agents-week-2026-autonomous-infrastructure-hero.png'
tags: ['Cloudflare', 'AI智能体', '智能体基础设施', 'Web平台']
relatedPosts:
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.87
    reason:
      ko: 'Cloudflare의 에이전트 인프라 방식이 LangGraph, CrewAI, Dapr와 어떻게 다른지 비교하고 싶다면 이 글이 직접적인 참조가 된다.'
      ja: 'CloudflareのアプローチがLangGraph、CrewAI、Daprとどう異なるか比較したい場合、この記事が直接の参照になる。'
      en: 'If you want to compare how Cloudflare stacks up against LangGraph, CrewAI, and Dapr for agent infrastructure, this post is the direct reference.'
      zh: '想深入比较Cloudflare与LangGraph、CrewAI、Dapr在智能体基础设施方面的差异？这篇文章提供了逐一框架的详细分析，有助于理解Agents Week的定位。'
  - slug: 'dapr-agents-v1-cncf-production-ai-framework'
    score: 0.83
    reason:
      ko: 'Dapr Agents v1이 Kubernetes에서 상태와 메시징을 어떻게 처리하는지 알면, Cloudflare의 Durable Object 기반 접근과 어느 쪽이 팀에 맞는지 판단하기 훨씬 쉽다.'
      ja: 'Dapr Agents v1がKubernetesで状態とメッセージをどう扱うかを理解すると、CloudflareのDurable Objectベースのアプローチとどちらがチームに合うか判断しやすくなる。'
      en: "Understanding how Dapr Agents v1 handles state and messaging on Kubernetes gives you a concrete basis for deciding whether Cloudflare's Durable Object approach is the better fit."
      zh: 'Dapr Agents是以基础设施为中心的替代方案。对比阅读这两篇文章，能让权衡取舍从抽象变得具体。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.80
    reason:
      ko: 'Cloudflare Agents SDK는 Workers 런타임 전용이다. 런타임 제약 없이 Python/Node에서 에이전트를 만들고 싶다면 Claude Agent SDK가 그 대안이다.'
      ja: 'Cloudflare Agents SDKはWorkersランタイム専用だ。ランタイム制約なしにPython/Nodeでエージェントを作りたいなら、Claude Agent SDKがその代替になる。'
      en: "Cloudflare's SDK is Workers-runtime-only. If you want to build agents in Python or standard Node without that constraint, the Claude Agent SDK is the direct alternative to evaluate."
      zh: 'Cloudflare SDK只能在Workers运行时运行。如果运行时的限制是个障碍，Claude Agent SDK展示了跨运行时智能体开发的实践方式。'
  - slug: 'mcp-server-production-deployment-kubernetes-guide'
    score: 0.76
    reason:
      ko: 'Cloudflare에서 벤더 락인이 싫어서 컨테이너 기반 에이전트 인프라를 고려한다면, MCP 서버를 Kubernetes에 올리는 이 가이드가 비교 기준이 된다.'
      ja: 'CloudflareのロックインよりKubernetesでのコンテナベースの運用を選ぶなら、このMCPサーバーKubernetesデプロイガイドが実践的な参照になる。'
      en: 'If vendor lock-in concerns push you toward container-based agent infrastructure instead of Cloudflare, this Kubernetes MCP deployment guide gives you the concrete alternative.'
      zh: '如果担心Cloudflare厂商锁定而倾向于容器化方案，这篇在Kubernetes上部署MCP服务器的实战指南正好提供了可移植的替代路径。'
---

去年这个时候，谈AI智能体基础设施，大家的第一反应都是Kubernetes + LangGraph的组合。但Cloudflare在4月的Agents Week上展示的图景有些不同。智能体不只是调用API，而是自己创建Cloudflare账户、购买域名、部署代码。"智能体成为云客户"这句话听起来可能像营销语言，但这次他们真的这样做了。

下面是我的看法——什么令人印象深刻，什么让我持怀疑态度。

## Agents Week 2026是什么

Cloudflare于2026年4月宣布了"智能体专属周"，每天都发布多项公告，最终累计20多个新功能和GA转换。整体来看，公司上下押注于"智能体将成为互联网的主要行为者"这一前提，重新规划了基础设施各个领域。

公告列表内容繁多，我重点整理了对实际开发有影响的部分。

## 最大胆的发布 — 智能体直接创建Cloudflare账户

坦白说，第一次读到这个消息时我的反应是："这是真的吗？"具体内容是这样的：用户只需一次性同意Cloudflare的服务条款，此后智能体就能自主完成创建Cloudflare账户、开通付费订阅、注册域名、获取API令牌、部署代码的全流程。通过与Stripe的合作实现了支付令牌化，并通过OAuth + OIDC将智能体认证为"可信任的行为者"。

这意味着什么？影响相当深远。以往AI智能体的角色是"在人类创建好的基础设施中执行任务"。而这次，智能体自身成为基础设施的提供者。对于构建SaaS产品的团队来说，"智能体负责处理新客户的全流程入驻"这个场景变得切实可行。

但我有两点疑虑。第一，智能体连接了实际的计费账户，如果缺乏明确的费用控制机制，风险会很大。Cloudflare新推出的`task_budget`概念似乎正是为此设计的，但目前两者结合使用的实践案例还很少。第二，智能体创建账户的法律责任归属也没有先例。即使用户同意了服务条款，当智能体注册了错误的域名时，责任归属依然模糊。

## 开发者实际可用的三项发布

比那些吸引眼球的发布更实用的是这三项。

**Sandboxes GA**：从2025年6月的Beta到9个月后的GA。这是智能体专用的隔离Linux环境，有Shell、文件系统和后台进程，按需启动。关键特性是"picks up exactly where it left off"——智能体中断后恢复时，能接续之前的环境状态。容器启动时间在毫秒级。代码生成智能体可以真正执行代码并测试，形成完整闭环。

[如果之前在LangGraph或CrewAI等框架旁边单独配置智能体代码执行环境](/zh/blog/zh/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)，那么Sandboxes就是让Cloudflare帮你管理这部分。这更接近于选择基础设施层，而非选择框架。

**Artifacts**：面向智能体的Git兼容版本管理存储。可创建数千万个仓库，支持从远程源fork，支持标准Git客户端访问。从私有Beta到5月初的公开Beta。用途是让智能体生成的代码有持久化存储和版本管理，即使上下文丢失，成果物依然保留。

**Dynamic Workers**：AI生成代码的隔离运行时。相比现有容器，启动时间在毫秒级，可扩展到数百万并发执行。让智能体生成代码后立即获得执行结果并进入下一步的循环变得可能。

## 我亲自安装了@cloudflare/agents SDK

理论已经够多了，我实际动手测试了。

```bash
mkdir cloudflare-agent-demo && cd cloudflare-agent-demo
npm init -y
npm install @cloudflare/agents
```

安装很顺畅。`@cloudflare/agents@0.0.16`版本的主要导出是`Agent`、`AIChatAgent`和`routeAgentRequest`三个。

我写了一个基本的智能体代码：

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
  async onStart() {
    this.setState({ processedCount: 0, lastHeartbeat: new Date().toISOString() });
    // 内置cron调度 — 无需外部调度服务
    await this.schedule("0 * * * *", "heartbeat", {});
  }

  async heartbeat() {
    const count = this.sql<{ n: number }>`SELECT COUNT(*) as n FROM tasks`;
    this.setState({
      processedCount: count[0]?.n ?? 0,
      lastHeartbeat: new Date().toISOString()
    });
  }

  async onRequest(request: Request): Promise<Response> {
    return Response.json({ state: this.state });
  }

  // 智能体直接接收邮件
  async onEmail(email: ForwardableEmailMessage) {
    this.sql`
      INSERT INTO tasks (id, content, created_at)
      VALUES (${crypto.randomUUID()}, ${email.from}, ${Date.now()})
    `;
  }
}

export default {
  fetch: async (req: Request, env: Env): Promise<Response> => {
    const routed = await routeAgentRequest(req, env);
    return routed ?? new Response("OK", { status: 200 });
  }
};
```

运行`wrangler dev`，本地立即启动：

```
⛅️ wrangler 4.91.0
Your Worker has access to the following bindings:
  env.TASK_AGENT (TaskAgent)   Durable Object   local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:9998
[wrangler:info] GET / 200 OK (7ms)
```

不需要Cloudflare账户也可以本地开发。有一个重要注意事项：`@cloudflare/agents`是Workers运行时专用的，在普通Node.js中无法运行，会抛出`ERR_UNSUPPORTED_ESM_URL_SCHEME`错误，因为它使用了`cloudflare:`协议导入。只能通过Wrangler运行。[如果你习惯于像Claude Agent SDK那样直接在Python/Node.js中导入使用的方式](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)，这一点一开始会比较陌生。

## 值得关注的架构设计选择

看代码时，Cloudflare的几个设计意图变得清晰起来。

**内嵌SQLite**：在`wrangler.toml`中声明`new_sqlite_classes`，每个Agent实例就自带SQLite。无需配置外部数据库，直接用`this.sql`查询。得益于Durable Object的隔离性，多租户架构自然成型——每个智能体实例拥有独立的数据库。初看可能觉得浪费，但从状态隔离角度来看相当简洁。

**内置调度**：直接从智能体代码内部注册cron格式的调度任务，无需外部cron服务。这是对Durable Object的Alarm API的薄封装，调度与状态管理共置于智能体代码内，凝聚度高。

**邮件处理器**：一个`onEmail`方法就能让智能体直接处理邮件，通过Workers Email Routing集成。智能体接收邮件并将其转化为任务的模式，写起来非常自然。

[Dapr智能体通过Kubernetes Sidecar模式管理状态和消息的方式](/zh/blog/zh/dapr-agents-v1-cncf-production-ai-framework)与此形成有趣的对比。Cloudflare的方式更注重代码，Dapr则更注重基础设施。两者各有适用场景。

## 坦诚的评价

先说好的地方。从一开始就为智能体重新设计基础设施层，这一点体现出一致性。在Durable Object之上叠加状态、调度、邮件、SQLite的结构，给人一种"理解了智能体需要什么然后进行设计"的感觉。本地开发环境即开即用也是优点。

有两点让我担忧。

第一，**厂商锁定相当强**。只能在`cloudflare:workers`运行时上运行，且与Durable Object的设计深度绑定。如果以后想换平台，需要大幅重写智能体代码。[像在Kubernetes上部署MCP服务器](/zh/blog/zh/mcp-server-production-deployment-kubernetes-guide)这样的容器化方案没有这个问题，代价是基础设施复杂度上升。

第二，**多智能体协作模式尚浅**。单个智能体的功能大幅增强，但多个智能体进行复杂协作的模式在SDK层面还比较薄弱。如果要认真构建多智能体编排，需要额外搭建大量结构。Project Think框架正在改善这一问题，但目前仍处于初期阶段。

## 什么情况下应该选择Cloudflare

我的判断如下。

**适合的场景**：边缘响应速度对智能体至关重要的场景；团队已经在运营Cloudflare Workers的情况；希望尽量简化部署、专注于智能体逻辑的方向；多个独立智能体各自持有状态的多租户架构。

**不适合的场景**：需要复杂多智能体编排且已深度使用LangGraph的团队；被绑定在特定云基础设施（AWS、GCP）上的团队；智能体需要在Python或标准Node.js环境中直接运行的需求。

Agents Week传递的整体方向很清晰。Cloudflare在争夺AI智能体时代的基础设施标准地位——就像Kubernetes在容器时代所做的那样。SDK还处于v0阶段，生产环境应用需谨慎，但设计思路是一致的。值得自己搭建一遍环境、亲身体验后形成判断。

## 签名智能体：为智能体流量赋予加密身份

有一项发布关注度不高，但我觉得很值得注意：Signed Agents（签名智能体）。其原理是：智能体发出的HTTP请求附带加密签名，证明"这是由智能体发出的请求"。

目前互联网上没有标准方法来区分智能体流量和人类流量。User-Agent字符串和IP模式只是推测。签名智能体为服务器提供可验证的信号——通过验证签名，可以对智能体流量单独设置速率限制、计费规则或访问控制。目前仍处于早期阶段，但方向正确。当智能体成为独立流量类型时，加密身份会成为基础设施，而不只是一个功能特性。

## 邮件服务公开测试版

Agents Week期间，Workers邮件服务升级到公开测试版。无需接入SendGrid或AWS SES等第三方服务，智能体现在可以直接发送邮件。

结合SDK中已有的`onEmail`处理器，智能体现在可以在Cloudflare的技术栈内完整处理邮件的收发。客服智能体、通知流水线、基于邮件的任务管理——都可以在不依赖外部邮件服务的情况下实现。

## 总结

整体来看，Agents Week与其说是功能发布，不如说是定位声明。20多项发布都指向同一个方向：Cloudflare正在争夺AI智能体时代的基础设施标准地位，就像Kubernetes在容器时代所做的那样。

这次活动中，我最想实际动手构建的是Sandboxes。不是那个"智能体直接创建账户"的头条新闻，而是专为智能体代码执行提供的持久化隔离Linux环境。对任何代码生成或代码测试智能体来说，这是立即可用的实用功能，不存在法律或财务上的新风险。

`@cloudflare/agents@0.0.16`说明了生产环境适用性的现状。但如果你在认真评估智能体基础设施的选择，建议自己搭建一遍本地环境，亲身感受后再下判断。20分钟，无需Cloudflare账户。

---

**测试环境**：`@cloudflare/agents@0.0.16`、`wrangler@4.91.0`、Node.js v22.22.0、macOS 14  
**注意**：智能体自主创建账户功能需要真实的Cloudflare账户和Stripe集成，超出本地测试范围。  
**原始发布**：[Cloudflare Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/)
