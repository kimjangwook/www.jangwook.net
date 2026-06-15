---
title: Mastra.ai 实战指南 — 用TypeScript在5分钟内运行AI代理
description: >-
  我亲自安装了Mastra.ai TypeScript AI代理框架，将其连接到Google
  Gemini并构建了一个天气代理。从安装到实际工具调用的完整实验记录。
pubDate: '2026-06-14'
heroImage: ../../../assets/blog/mastra-ai-typescript-agent-framework-guide-2026-hero.jpg
tags:
  - mastra
  - typescript
  - ai-agent
  - gemini
  - llm
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.9
    reason:
      ko: ai-agent 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into ai-agent.
      ja: ai-agentをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 ai-agent 主题。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.85
    reason:
      ko: LLM를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on LLM experience.
      ja: LLMを実際に扱った経験が続く記事です。
      zh: 延续 LLM 的实战经验。
  - slug: dena-llm-study-part3-model-training
    score: 0.8
    reason:
      ko: 같은 LLM 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same LLM track.
      ja: 同じLLMの流れで併せて読むと役立ちます。
      zh: 在同一 LLM 脉络中可一并阅读。
faq:
  - question: "Mastra.ai是什么样的框架?"
    answer: "它是Gatsby.js团队打造的TypeScript-first AI代理框架，将代理、工作流、记忆和可观测性整合到单一SDK中。它底层基于Vercel AI SDK运行，并于2026年1月发布了v1.0。"
  - question: "真的能在5分钟内运行代理吗?"
    answer: "通过npm create mastra@latest安装大约需要2〜3分钟，加上首个代理运行总共约5〜10分钟。连接Google Gemini的天气代理在约5.8秒内返回了首尔与东京的天气对比结果。"
  - question: "在Mastra中使用Memory需要什么?"
    answer: "Memory必须配置LibSQL或DuckDB等存储后端。单独运行代理时若包含Memory，会立即抛出Memory requires a storage provider错误。"
  - question: "Mastra支持哪些LLM提供商?"
    answer: "支持Vercel AI SDK覆盖的几乎所有模型，包括OpenAI、Anthropic、Google Gemini和Meta Llama。切换提供商只需更改model字段的字符串，例如把google/gemini-2.5-flash换成anthropic/claude-sonnet-4-6即可正常运行。"
---

"TypeScript开发者的选择无非就是LangChain.js或Vercel AI SDK。"每次想用JavaScript构建AI代理，我都会听到这句话。我自己也没怎么怀疑就接受了。直到今年初，我了解到Mastra.ai。这是一个通过YC W25批次获得1300万美元融资、发布了v1.0的框架。

名字早有耳闻，但从未亲自试用。今天我下决心装了一遍。把它接到Google Gemini，跑了一个能调用工具的代理。我想知道的就一件事："5分钟内运行"这个宣传到底是不是真的。

## Mastra.ai是什么

Mastra是由Gatsby.js团队创建的TypeScript优先AI代理框架。2024年10月公开发布，15个月内在GitHub获得22,000颗星，每周npm下载量超过30万次，并于2026年1月发布v1.0。

核心定位是"用一个SDK提供代理、工作流、内存、可观察性"。如果说LangChain是各种包的组合，那么Mastra选择了单一技术栈完成所有事情的方式。

支持的LLM提供商包括OpenAI、Anthropic、Google Gemini、Meta Llama等，几乎覆盖了Vercel AI SDK支持的所有模型。Mastra内部以Vercel AI SDK为基础，所以如果你有使用Vercel AI SDK构建Claude流式代理的经验，那么对底层已经很熟悉了。

### 为什么现在出现TypeScript代理框架

坦白说，与Python代理库相比，TypeScript方面一直有2〜3年的滞后感。LangGraph、CrewAI、PydanticAI在Python生态中快速成熟，但TypeScript阵营一直停留在Vercel AI SDK的水平。

Mastra是在TypeScript中填补这一空白的尝试。我原以为会失望，但实际使用后发现完成度比预期要高。当然也有遗憾的地方。

## 安装：`npm create mastra@latest`

按照官方文档的快速入门进行。我的环境是Node.js v22.22.0。

```bash
npm create mastra@latest mastra-lab -- --components agents,tools --llm google --example
```

`--components agents,tools`包含代理和工具组件，`--llm google`指定Google Gemini为LLM提供商，`--example`包含天气代理示例。

安装完成约需2〜3分钟。CLI按顺序引导每个步骤：

```
◇  Project structure created
◇  npm dependencies installed
◇  Mastra CLI installed
◇  Mastra dependencies installed
◇  .gitignore added
└  Project created successfully

◇  Mastra initialized successfully!

   Rename .env.example to .env
   and add your GOOGLE_API_KEY

   To start your project:
    cd mastra-lab
    npm run dev
```

生成的`package.json`主要依赖：

```json
{
  "dependencies": {
    "@mastra/core": "^1.42.0",
    "@mastra/memory": "^1.20.3",
    "@mastra/libsql": "^1.13.0",
    "@mastra/observability": "^1.14.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

使用TypeScript 6.0.3和Zod v4很值得关注。两者都在2026年上半年发布了主要版本，Mastra跟进最新版本是个好信号。

## 生成的项目结构

```
mastra-lab/
├── src/
│   └── mastra/
│       ├── index.ts          # Mastra实例初始化
│       ├── agents/
│       │   └── weather-agent.ts  # 代理定义
│       └── tools/
│           └── weather-tool.ts   # 工具定义
├── .env.example
├── package.json
└── tsconfig.json
```

层次分离清晰。`agents/`负责代理定义，`tools/`处理外部API接口，`index.ts`将两者组合成Mastra实例。

## 代码结构：代理与工具

查看生成的代码可以了解Mastra的设计理念。

### 工具定义

```typescript
// src/mastra/tools/weather-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  },
});
```

用Zod schema定义I/O类型的方式，与[PydanticAI类型安全代理](/zh/blog/zh/pydantic-ai-type-safe-agent-tutorial-2026)中使用Pydantic BaseModel在结构上很相似。语言不同，但"类型即文档即验证逻辑"的理念是一致的。

天气工具使用的Open-Meteo API是免费的，不需要API密钥。通过geocoding将城市名转换为经纬度，再调用天气预报API获取当前天气。

### 代理定义

```typescript
// src/mastra/agents/weather-agent.ts
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `You are a helpful weather assistant...`,
  model: 'google/gemini-2.5-pro',
  tools: { weatherTool },
  memory: new Memory(),
});
```

在`model`字段写上`'google/gemini-2.5-pro'`这样的字符串，Mastra会自动使用对应提供商的SDK。底层是`@ai-sdk/google`在工作。

## 实际运行：首尔与东京天气比较

我直接运行了代理。Memory配置需要存储后端，先排除在外测试基本代理。

```typescript
const agent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: '简洁提供天气信息的助手',
  model: 'google/gemini-2.5-flash',
  tools: { weatherTool },
});

const result = await agent.generate(
  'Compare the current weather in Seoul and Tokyo. Which city is hotter right now?'
);
console.log(result.text);
```

**运行结果（2026-06-14，响应时间：5866ms）：**

```
It is 27.3°C and feels like 30.1°C in Seoul with mainly clear conditions.
In Tokyo, it is 25.6°C and feels like 27.1°C with overcast conditions.
Seoul is hotter right now.
```

代理分别对两个城市调用了`get-weather`工具，综合结果给出了比较回答。在不到6秒内完成了两次外部API调用和LLM推理。

工具调用本身是准确的。"Seoul"被正确映射到坐标（37.566, 126.978）。

### 遇到的错误：Memory存储设置

第一次包含Memory运行时，立即出现以下错误：

```
MastraError: Memory requires a storage provider to function.
Add a storage configuration to Memory or to your Mastra instance.
https://mastra.ai/en/docs/memory/overview
```

官方示例包含Memory，但使用Memory需要单独配置LibSQL或DuckDB等存储后端。对新用户来说，这个错误信息不够直观。

## Mastra架构组成

![Mastra架构图](../../../assets/blog/mastra-ai-architecture-diagram.png)

Mastra的整体结构分为4个层次：

**1. Agent层**
调用LLM并决定是否执行工具。一次`generate()`调用内部可以多次在LLM和工具之间往返。

**2. Tools/集成**
Zod类型化的外部API、数据库、文件系统接口。LLM按照schema填充参数。

**3. Memory系统**
管理对话历史、语义搜索和工作记忆。需要LibSQL或PostgreSQL作为存储。

**4. 可观察性**
基于OpenTelemetry记录代理执行的跟踪、span和日志。

## 与其他框架的比较

在TypeScript生态中，与Mastra最接近的是Vercel AI SDK。如果说Vercel AI SDK专注于LLM调用和流式传输，那么Mastra在其基础上增加了代理生命周期管理、内存和可观察性。

在[Google ADK与LangGraph比较](/zh/blog/zh/google-adk-vs-langgraph-agent-framework-comparison-2026)中，两者都是Python中心的。Mastra正在TypeScript中尝试占据相同的位置。

| | Mastra | Vercel AI SDK | LangGraph.js |
|---|---|---|---|
| 语言 | TypeScript | TypeScript | TypeScript |
| 代理循环 | ✅ 内置 | ⚠️ 手动实现 | ✅ 内置 |
| 内存 | ✅ 内置（需存储） | ❌ | ⚠️ 手动实现 |
| 工作流 | ✅ 图形化 | ❌ | ✅ 图形化 |
| 可观察性 | ✅ OpenTelemetry | ❌ | ⚠️ 需外部工具 |
| 学习曲线 | 中等 | 低 | 高 |

## 两点不足

第一是Memory设置门槛。如前所述，单独使用代理时包含Memory会立即报错。这个错误对新用户不够直观，官方示例代码与实际单独运行代码之间存在差距。

第二是Mastra Studio与生产部署的概念还是分离的。Studio是开发工具，但关于如何将代理部署到生产环境的文档仍然薄弱，Vercel以外的部署方式需要自行摸索。

## 何时该用Mastra，何时该避开

这是我实际使用后总结的判断标准。工具选择终究取决于具体场景。

**适合用Mastra的情况**

- 在TypeScript/JavaScript项目中首次引入代理时。如果团队已经熟悉Node生态，引入成本比新搭一套Python技术栈更低。
- 想把代理循环、内存、可观察性都放在一个SDK里完成时。这能减少自己拼接多个库的工作量。
- 需要工作流（基于图的多步骤管道）的场景。`.then()` / `.branch()` / `.parallel()`的类型安全组合是其强项。
- 处于频繁切换LLM提供商做实验的阶段。只改model字符串就能在OpenAI、Anthropic、Gemini之间切换。成本与响应速度的权衡，我在[AI代理成本的现实](/zh/blog/zh/ai-agent-cost-reality)中有更详细的探讨。

**最好避开的情况**

- 需要今天就把它投入关键性生产服务时。v1.0发布还不到半年，API稳定性和第三方集成生态还达不到LangChain的水平。
- Python库生态（LangGraph、CrewAI、PydanticAI）的成熟度和社区插件是决定因素时。选项对比可参考[Python AI代理库比较](/zh/blog/zh/python-ai-agent-library-comparison-2026)。
- 需要立即在Vercel以外的环境（Docker、自建服务器）搭建复杂部署管道时。官方部署文档在这方面仍然薄弱。
- 仅需调用一两次LLM就够用的场景。那样只用Vercel AI SDK就足够，代理抽象层是不必要的开销。

如果只想纯粹对比工具调用的模式，把它和[Claude Agent SDK工具使用指南](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)放在一起看，设计上的差异会更清晰。

## 现在值得尝试Mastra吗？

我认为是的，但有条件。

如果你正在用TypeScript启动一个新的代理项目，Mastra绝对值得认真考虑。从安装到运行第一个代理只需5〜10分钟。框架结构也没什么让人犯迷糊的地方。

但立即投入生产还为时过早，生态系统还比较薄弱。v1.0发布还不到半年，完全信任其API稳定性尚早。

个人项目或内部工具：现在就用。生产服务：等到v1.5左右再重新评估。

```bash
# 开始的方式
npm create mastra@latest my-agent-app -- --components agents,tools --llm google --example
cd my-agent-app
# 在.env中添加GOOGLE_API_KEY
npm run dev
# → 在http://localhost:4111打开Mastra Studio
```

TypeScript AI代理生态终于有了一个真正的竞争者。虽然还没完全成熟，但这是我在TypeScript领域见过的最有前途的尝试。

## 参考资料

- [Mastra官方网站](https://mastra.ai/) — 框架介绍、功能概览、定价
- [Mastra官方文档](https://mastra.ai/docs) — 代理、工作流、内存、可观察性指南
- [Mastra GitHub仓库](https://github.com/mastra-ai/mastra) — 源代码、Issue、发布说明
- [Open-Meteo API](https://open-meteo.com/) — 天气工具使用的免费天气数据API
