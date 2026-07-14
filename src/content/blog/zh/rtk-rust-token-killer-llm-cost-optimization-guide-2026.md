---
title: '亲测RTK(Rust Token Killer) — 削减LLM Token成本60〜90%的CLI代理'
description: >-
  RTK(Rust Token Killer)是一个在Bash命令输出发送给LLM之前进行压缩的CLI代理。实际安装后，在find命令上测量到90%的削减，ls命令上50%。本文整理了哪些场景有效、哪些无效、如何集成Claude Code，以及诚实的局限性。
pubDate: '2026-05-22'
heroImage: >-
  ../../../assets/blog/rtk-rust-token-killer-hero.png
tags:
  - llm-cost
  - claude-code
  - developer-tools
  - rust
  - token-optimization
relatedPosts:
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.91
    reason:
      ko: 프롬프트 캐싱이 LLM API 호출 비용을 줄인다면, RTK는 에이전트가 실행하는 명령어의 출력 토큰을 줄인다. 두 방식은 다른 레이어를 공략하므로 함께 쓰면 시너지가 있다.
      ja: プロンプトキャッシングがAPIコストを削減するなら、RTKはエージェントのコマンド出力トークンを削減する。異なるレイヤーへのアプローチなので、併用するとシナジーが生まれる。
      en: Prompt caching reduces API call costs; RTK reduces output tokens from shell commands. They target different layers and work well together.
      zh: 提示缓存减少API调用成本，RTK减少命令输出的token。两者针对不同层级，结合使用效果更好。
  - slug: mcp2cli-token-cost-optimization
    score: 0.88
    reason:
      ko: mcp2cli가 MCP 툴 스키마 주입 토큰을 줄인다면, RTK는 셸 명령어 출력 토큰을 줄인다. LLM 에이전트 비용 최적화의 두 축을 나란히 비교해볼 만하다.
      ja: mcp2cliがMCPツールスキーマのトークンを削減するなら、RTKはシェルコマンド出力トークンを削減する。LLMエージェントコスト最適化の両軸を比較してみるとよい。
      en: While mcp2cli cuts MCP schema injection tokens, RTK cuts shell command output tokens — two complementary axes of LLM agent cost optimization.
      zh: mcp2cli削减MCP工具schema注入token，RTK削减shell命令输出token——LLM代理成本优化的两个互补方向。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.83
    reason:
      ko: 이 글에서 다룬 thinking budget 최적화처럼, RTK도 LLM이 소비하는 "불필요한" 토큰을 줄이는 전략이다. 비용 절감의 접근 방식이 상호 보완적이다.
      ja: thinking budget最適化と同様に、RTKもLLMが消費する「不要な」トークンを削減する戦略だ。コスト削減アプローチが相互補完的だ。
      en: Like thinking budget optimization in that post, RTK also reduces "unnecessary" tokens LLMs consume — complementary cost-reduction strategies.
      zh: 与thinking budget优化一样，RTK也是减少LLM消耗"不必要"token的策略，两种成本削减方法相互补充。
  - slug: claude-code-hooks-workflow
    score: 0.80
    reason:
      ko: RTK가 Claude Code에 통합되는 방식이 PreToolUse 훅이다. 이 글에서 훅의 작동 원리를 먼저 이해하면 RTK 통합이 왜 그렇게 설계됐는지 납득이 된다.
      ja: RTKがClaude Codeに統합される仕組みはPreToolUseフックだ。このフックの動作原理を理解すると、RTKの統合設計の意図がよくわかる。
      en: RTK integrates into Claude Code via PreToolUse hooks. Understanding how hooks work explains why RTK is designed the way it is.
      zh: RTK通过PreToolUse hook集成到Claude Code。了解hook工作原理有助于理解RTK的集成设计。
  - slug: ai-agent-cost-reality
    score: 0.79
    reason:
      ko: AI 에이전트를 프로덕션에 돌리면 실제 비용이 예상보다 훨씬 크다는 걸 이 글에서 다뤘다. RTK는 그 비용 중 셸 명령어 출력 부분을 줄이는 구체적인 해법 중 하나다.
      ja: AIエージェントをプロダクションで動かすと実際のコストが予想より大きいことをこの記事で扱った。RTKはそのコストのうちシェルコマンド出力部分を削減する具体的な解法の一つだ。
      en: That post covered how AI agent costs exceed expectations in production. RTK is one concrete solution for the shell command output portion of that cost.
      zh: 那篇文章讨论了AI代理在生产环境中的实际成本远超预期。RTK是减少其中shell命令输出成本的具体解决方案之一。
---

使用Claude Code一个月后打开账单，数字比预想的高出近一倍。不是API调用本身，而是**代理执行的Bash命令输出**塞满了上下文窗口。`find . -name "*.ts"` 产生数百行结果，`cargo test`日志数千行——这些都是token，都要收费。

RTK(Rust Token Killer)就是针对这个问题而生的工具。它坐在AI编程代理和shell之间，在命令输出传给LLM之前进行压缩。官方声称"60〜90%的token削减"，我实测验证了这个说法。

## RTK到底是什么

一句话：**命令输出过滤器**。它接收`git status`、`find`、`ls -la`等命令的结果，只保留LLM理解项目状态所需的信息，其余全部丢弃。

四种策略协同工作：

- **智能过滤**：删除不相关的行（进度条、时间戳、重复标题等）
- **分组**：将相似项目合并表示（如`28 .ts files`）
- **截断**：超过阈值的输出被截断，标记为`...(truncated)`
- **去重**：删除重复的输出模式

与Claude Code的集成通过`PreToolUse` hook实现。了解[Claude Code的hook系统](/zh/blog/zh/claude-code-hooks-workflow)的话，设计逻辑一目了然——`rtk init -g`一条命令就自动注册到`~/.claude/hooks/`下。之后Claude Code执行`git status`时，hook会拦截并将其重写为`rtk git status`。Claude Code对这个过程毫不知情。

支持的代理：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot CLI、Gemini CLI、Antigravity、Hermes。单一Rust二进制文件，零运行时依赖。

## 实际安装并测量

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

需要Rust工具链。在我的M3 Mac上编译耗时约1分40秒。验证安装：

```bash
rtk --version
# rtk 0.40.0
```

集成Claude Code之前，我先手动对各命令的削减率进行了基准测试。测试对象是我运营的博客仓库（Astro架构，258个文件）。

**测试1：`find`命令**

```
find src/content/blog/ko/ -name "*.md" -type f
```

- 原始输出：**15,360 chars**
- RTK输出：**2,070 chars**
- 削减率：**86.5%（token换算99.9%）**

RTK的find输出长这样：

```
28F 1D:

./ claude-agent-sdk-subagents-orchestration-tutorial-2026.md
claude-api-prompt-caching-cost-optimization-guide.md
claude-code-agentic-workflow-patterns-5-types.md
...
```

用文件数摘要（`28F 1D: 28 files, 1 directory`）替代并压缩路径前缀。find输出中大部分都是重复的路径段，这正是极大削减的来源。

**测试2：`ls -la`（大型目录）**

```
ls -la src/content/blog/ko/
```

- 原始输出：**23,848 chars**（含权限、所有者、时间戳的完整输出）
- RTK输出：**12,069 chars**
- 削减率：**49.4%**

去掉权限字符串（`drwxr-xr-x`）、所有者（`jangwook staff`）和精确时间戳，只保留文件名和大小。合理——LLM通常只需要这些信息。

**测试3：`git status`（小规模输出）**

- 原始：**274 chars**
- RTK：反而变得更大（展开了追踪文件的详细列表）
- 削减率：**无（反效果）**

这是重要发现。`git status`这样的短输出，RTK反而会让它*膨胀*。

**测试4：`git log --oneline -20`**

- 削减率：**0%**（直接透传）

短的、已结构化的输出会直接透传不做处理。

**全量统计（`rtk gain`）**：

```
RTK Token Savings (Global Scope)
════════════════════════════════════════════════════════════

Total commands:    6
Input tokens:      9.1K
Output tokens:     3.8K
Tokens saved:      5.5K (60.6%)
Total exec time:   153ms (avg 25ms)
Efficiency meter: ███████████████░░░░░░░░░ 60.6%

By Command
  rtk ls:    49.4% saved
  rtk find:  99.9% saved（token换算）
  rtk git:   0% saved
```

6次命令执行中平均削减60.6%。但这次测试偏向于大输出命令（find、ls），所以数字比真实混合工作负载更好看。

## 有效场景与无效场景

说实话，宣传的"60〜90%"并不是每次都能达到。效果因命令类型而有明显差异。

**RTK效果显著的命令**：

| 命令 | 原因 |
|------|------|
| `find` | 大部分是重复的路径前缀 → 摘要时极大压缩 |
| `ls -la`（大型目录） | 删除权限和所有者信息效果明显 |
| `cargo test` | 删除成功用例，只保留失败 |
| `npm test` / `jest` | 测试摘要压缩 |
| `docker ps` | 压缩长容器ID和端口信息 |
| `grep -r`（大量结果） | 删除上下文行 |

**RTK效果微乎其微的命令**：

| 命令 | 原因 |
|------|------|
| `git status`（小规模变更） | 输出已经很短 → 无压缩余地 |
| `git log --oneline` | 已经是压缩格式 |
| `cat`（单个文件） | 内容本身就是目的 → 无法压缩 |
| `echo`、`pwd`等简单命令 | 透传 |

项目特性决定效果。TypeScript monorepo频繁运行`tsc --noEmit`？RTK可能有明显帮助。主要是API调用和小文件修改的项目？节省可能微乎其微。

## 如何集成Claude Code

两个步骤。

**第一步：安装**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**第二步：注册Claude Code hook**

```bash
rtk init -g
```

`-g`表示全局配置（`~/.claude/`）。如果只想用于单个项目，去掉`-g`。运行时会询问：

- 是否自动修改`~/.claude/settings.json`（推荐y）
- 是否创建`~/.claude/RTK.md`（Claude识别rtk用法的文件）

重启Claude Code后，所有Bash工具调用都会自动通过RTK重写。用Claude Code执行`git status`，查看`rtk gain`中是否有新记录——有的话集成成功。

一个注意事项：hook只对**Bash工具调用**生效。Claude Code内置的Read、Grep、Glob工具绕过hook，不受RTK影响。实际节省效果取决于代理通过Bash进行文件探索的频率。

还有一点：存在另一个同名的Rust工具——[reachingforthejack/rtk](https://github.com/reachingforthejack/rtk)（Rust Type Kit）。安装后`rtk gain`不工作，可能是名称冲突导致的。

## 在开发者成本优化框架中的定位

削减LLM代理成本有三个层级：

1. **模型选择**：切换到更便宜的模型（Haiku、Flash等）
2. **API层**：[提示缓存](/zh/blog/zh/claude-api-prompt-caching-cost-optimization-guide)、批处理API、[MCP schema压缩](/zh/blog/zh/mcp2cli-token-cost-optimization)
3. **Shell层**：RTK（命令输出压缩）

RTK属于第3层。如果这一层还没有优化，很可能有实际节省空间。但如果已经通过模型选择和缓存控制了成本，RTK的边际贡献就会相对较小。

我真正喜欢的地方：**完全透明**。`rtk init -g`一次，搞定。不需要改变写提示词的方式，不需要手动在每个命令前加`rtk`。继续像以前一样使用Claude Code即可。这种零行为变化的优化心理阻力很低。

## 诚实的局限性

实际使用几天后感受到的不便之处。

**第一**：RTK的压缩有时会删掉重要信息。遇到过失败测试的错误堆栈跟踪被部分截断的情况。可以用`rtk err <command>`或`rtk proxy <command>`查看原始输出，但Claude Code无法自动判断何时需要完整输出。

**第二**：安装需要Rust工具链。截至v0.40.0没有官方二进制发布版。对于团队中没有Rust的环境，入门门槛是个现实问题。

**第三**：不要被基准数字误导。我实际Claude Code成本的很大一部分来自Read、Grep和代码生成——RTK不涉及的领域。"60〜90%"是find/ls密集测试的数字，在真实混合工作负载中，10〜30%才是更诚实的估计。

我不认为RTK是被过度吹捧的工具。但"帮你把Claude Code账单减半"的期望也请放弃。**文件遍历或测试运行频繁的项目**，效果会相当明显。否则，可能只有个位数的节省。

## 发现遗漏的节省：`rtk discover`

一个容易被忽视的功能是`discover`。它分析现有的Claude Code会话历史，反向计算"如果那些命令通过RTK运行，能节省多少"。

```bash
rtk discover
```

我的情况是，历史中消耗token最多的TOP3是`find`、`npm install`（verbose日志）和`docker logs`。其中只有`find`通常通过Claude Code的Bash工具执行，其余两个我直接在终端运行，不在hook的范围内。

还可以查看每个会话的统计：

```bash
rtk session
```

显示每个Claude Code会话的总token节省和hook重写率。对于了解自己使用Bash密集型操作还是原生工具的实际模式，出人意料地有参考价值。

## 与其他token优化方法的对比

从成本优化角度定位RTK：

| 方法 | 层级 | 适用范围 | 实现复杂度 | 预期节省 |
|------|------|---------|---------|--------|
| 模型降级（Haiku/Flash） | 定价 | 所有API调用 | 低 | 5〜20倍（价格差） |
| 提示缓存 | API | 重复的系统提示 | 中 | 40〜70% |
| MCP schema压缩（mcp2cli） | API | MCP工具注入 | 中 | 96〜99% |
| RTK | Shell | Bash命令输出 | 低 | 0〜90%（因命令而异） |

[提示缓存](/zh/blog/zh/claude-api-prompt-caching-cost-optimization-guide)在重复工作流程中很强大。[MCP schema压缩](/zh/blog/zh/mcp2cli-token-cost-optimization)在运行大量MCP工具的环境中可以实现显著节省。RTK的实现阻力最低，完全不改变现有工作流程，更像是"先装上再说"的工具。

代理成本是多个因素复合叠加的结构。RTK处理其中"shell命令输出"这一部分，并透明地完成这项工作。正确的定位是"成本优化栈中的又一层"，而非银弹。

## 该不该安装？

我的判断：**安装试试，但保持合理预期**。`cargo install`花1分40秒，`rtk init -g`一条命令。一周后打开`rtk gain`——如果节省超过10%就继续用，否则`rtk init -g --uninstall`卸载就好。

RTK本身是一个做得不错的工具。支持50+命令，代理集成干净，跟踪功能完善。关键在于调整期望：这是"锦上添花的优化层"，不是"把账单砍半"的操作。

MIT许可证，免费，开源。没有任何损失。

GitHub: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)  
官方网站: [rtk-ai.app](https://www.rtk-ai.app/)
