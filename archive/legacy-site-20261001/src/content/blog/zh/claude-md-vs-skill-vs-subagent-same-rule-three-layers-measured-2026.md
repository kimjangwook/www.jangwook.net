---
title: "把同一条规则搬过 CLAUDE.md、Skill 和子代理之后，我发现成本不是决策点"
description: "CLAUDE.md、SKILL.md 与子代理解决的是覆盖范围和生命周期的不同问题。通过实测对比三者的行为差异，真正的架构边界在于强制力：没有任何一层是控制面。"
pubDate: 2026-08-24
heroImage: '../../../assets/blog/claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026/hero.png'
tags:
  - AI Engineering
  - Agent Architecture
  - Developer Productivity
relatedPosts: []
---

我想知道，把同一条规则从 CLAUDE.md 挪到 Skill、再挪到子代理，上下文成本到底会不会下降。我先把三条官方加载路径读完，再跑了一次受控的 Claude CLI 命令去验证测量脚本本身，然后才决定信不信任何一个 token 数字。结论是：选哪一层，决定的是覆盖范围、生命周期、隔离性和可强制性，不是省钱。

这件事之所以重要，是因为团队正在把代理指令变成生产环境的作业规程。我的主张很直接：定下放置规则，删掉重复的指导语，把不可让步的管控搬进 hook。

## 一条规则该写在哪，其实不是运维问题

做架构现代化的时候，这个问题总以同一副面孔出现：这条指令放哪儿，代理才会照做？

先是有人往 CLAUDE.md 里加了一条项目规则。文件变长。又有人把那段冗长的流程挪进 SKILL.md。流程看着还是不太可靠，于是专门的子代理出现了。几轮下来，同一条指令存在于三个地方，没人说得清某一次运行里到底加载了哪一份，而后来的一次修改还引入了互相矛盾的表述。

这不只是 token 效率问题。在处理身份、财务记录或个人数据的系统里，它会变成审计问题。「不要把 PII 写进日志」出现在上下文里，并不等于这个动作被阻止过。写进提示词的规则是在影响行为。能够拦住动作的管控，是另一类系统组件。

Claude Code 的文档把这条界线说得很直白：

> "Both are loaded at the start of every conversation. Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

对 EM 来说，这改变了评审时该问的问题。不要只问这条指令写得好不好。要问业务到底是在把它当建议、当流程指引、当隔离手段，还是当一道真正的预防性管控。

## 三层走的是三条不同的加载路径

CLAUDE.md 是常驻上下文。会话一开始就加载，和对话一起吃 token。

> "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

所以 CLAUDE.md 适合放紧凑而稳定的项目事实：仓库约定、不可让步的架构约束，以及少数几条全程真的都用得上的规则。但它不是系统提示词。文档写明它的内容是在系统提示词之后以用户消息的形式送进去的，也就是说，它是上下文，不是强制配置。

Skill 的成本形状不一样。它的 description 常驻索引供代理发现，正文只在被调用时才加载。

> "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

这就是渐进式披露，确实有价值。但「用到之前几乎不花钱」不等于「用到之后也几乎不花钱」。一旦调用，渲染后的 Skill 内容会在这次会话里一直留着。文档对这笔账说得毫不含糊：

> "Once a skill loads, its content stays in context across turns, so every line is a recurring token cost."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

所以 Skill 本身并不便宜。它只是推迟了成本开始计费的时刻。压缩上下文的时候，Claude Code 会把每个 Skill 最近一次调用的内容重新挂在摘要后面，每个保留前 5,000 个 token，合计预算 25,000 个 token。一次会话里调用的 Skill 一多，早先的就可能被整个丢掉。

子代理又是另一类东西。它从隔离的上下文起步，不继承父对话。

> "Each subagent starts with a fresh, isolated context window. It doesn't see your conversation history, the skills you've already invoked, or the files Claude has already read."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

当一项任务本来会污染主工作上下文时，这种隔离很有用。但它不代表子代理是从空白开始的。

## 优化在继承开始的地方失效

常见的迁移叙事是这样的：CLAUDE.md 贵，Skill 懒加载，子代理隔离，所以把指令往下搬，成本就降。

官方给出的机制不支持这条通则。

非 fork 的子代理带着自己的任务消息和系统上下文启动，但它同样会拿到主对话加载的整套 CLAUDE.md 层级（这套层级在无人值守时到底读到了什么，我在用 @import 和软链接跑了 21 次的实测记录里写过），包括用户级、项目级、本地文件和受管策略文件。文档写明的例外只有内建的 Explore 和 Plan。

启动路径还改写了「预加载 Skill」的含义。在普通会话里，Skill 可以一直不披露正文直到被需要。而给子代理配上 skills 字段之后，完整正文在启动时就注入。

> "Subagents with preloaded skills work differently: the full skill content is injected at startup."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

这就是技术负责人该记住的那一条架构判断：渐进式披露不是文件格式的属性，而是加载路径的属性。

SKILL.md 的可移植性确实变强了，因为它作为[开放标准](/zh/blog/zh/anthropic-agent-skills-standard)发布，被越来越多的代理产品采纳。把可复用流程放在这里是合理的选择。但这并不保证每个运行时都会保留同样的懒加载行为，跨到不同的子代理实现时尤其如此。

> "Discovery: At startup, agents load only the name and description of each available skill... Full instructions load only when a task calls for them, so agents can keep many skills on hand with only a small context footprint."

> — [Agent Skills Overview](https://agentskills.io/home)

做架构治理，「继承了什么」和「什么时候加载」必须写成两列。把它们并成一个心智模型的团队，会同时收获成本意外和合规盲区。

## 最强的反驳意见在某个区间里是对的

最有力的反对是：子代理不接收父对话的历史。在一个跑了很久的会话里，那段历史可能远远大于一份紧凑的 CLAUDE.md。如果子代理只回一段简短摘要，省下的历史传输开销可以大幅盖过继承来的项目指令。

这个论点在三个条件同时成立时是对的：

- 父会话已经积累了相当量的对话历史。
- CLAUDE.md 守住了 200 行这条运维准则。
- 子代理返回的是简洁结果，而不是详细的过程记录。

在这些条件下，用子代理在经济上确实更划算。隔离还能提升产出质量，因为探索性材料、嘈杂的仓库检查和中间推理都被挡在主任务上下文之外。

但这个论点没能证明「把规则搬去子代理通常更便宜」。它在会话早期的短平快委派里就失效了，在 CLAUDE.md 层层叠加又臃肿的 monorepo 里失效，在子代理返回详细结果时也失效。返回路径之所以要算，是因为子代理完成后的结果会进入主对话。

文档直接对这段往返发出了警告：

> "When subagents complete, their results return to your main conversation. Running many subagents that each return detailed results can consume significant context."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

所以子代理的决策要当成一笔完整的工作流事务来评估：启动上下文、隔离中完成的工作、返回给父级的结果。只盯着那扇全新的上下文窗口，等于评估一个分布式服务时只算请求处理器的开销，把序列化、网络传输和响应体全都忽略掉。

## 测量脚本要按生产遥测的标准来写

我没有分层的 token 测量结果可以报告。原计划的一批运行全部以 exit code 0 结束，但解析脚本假定顶层是一个 JSON 对象，而 CLI 返回了数组，于是一个可用的测量值都没产出。正确的结论不是某一层便宜或者贵，而是这次根本没采到数据。

我在一次受控的命令运行中使用 Claude CLI 2.1.241，`claude --output-format json` 返回的顶层是列表，不是字典。列表里依次是 `system`、`assistant`、`rate_limit_event` 和 `result` 四个元素，用量数据在 `result` 元素内部。headless 模式的官方文档对这个格式的描述并不是这样：

> "json: structured JSON with result, session ID, and metadata"

> — [Headless mode](https://code.claude.com/docs/en/headless)

这是个很平常的故障，但它有管理层意义。AI 成本治理不能建立在一批不先检查顶层类型就假定输出结构的脚本上。仪表盘可以显示一个精确的零，而实际上它报告的是一次未测量的运行。这比缺数据更糟，因为它会诱使人带着虚假的确信去做决策。

截至 2026-08-24，官方子代理文档也没有给出每次 spawn 的 token 数字。有二次来源把 4-7x 的倍数归给多代理工作流，但它自称的官方出处，在核验范围内找不到对应的官方页面或表述。这只是个参考点，不是预算模型。

> "Anthropic's own documentation notes that multi-agent workflows use roughly 4-7x more tokens than single-agent sessions"

> — [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)

CFO 和 CTO 应当要求这里适用和云单位经济学一样的标准：实测消耗、文档明确的边界、模型假设、外部主张，这四类不能混为一谈。

## 把分层放置变成团队的运行制度

可落地的答案是一份能在 PR 里被评审的四条放置策略。

| 需求 | 放置层 | 评审时要问的问题 |
| --- | --- | --- |
| 全程都要用到的稳定项目事实 | CLAUDE.md | 这条真的每次会话都需要吗？ |
| 特定工作才用的多步骤流程 | SKILL.md | 流程能不能更短，是不是只在相关时才被调用？ |
| 只需要一个结论摘要的隔离调查 | 子代理 | 隔离带来的收益是否盖过启动和返回的上下文成本？ |
| 必须阻止某个动作的规则 | PreToolUse hook | 这道管控能否脱离模型的配合，被独立测试和审计？ |

我会让这份策略变成制度，而不是愿景。

第一，把 CLAUDE.md 上限定在 200 行，当作团队纪律。数字本身不神奇，做出决定这件事才重要。每一行常驻内容都该经得起一次质询：是每次会话都需要它，还是我们在拿它填补一个缺失的流程、测试、lint 规则或者 hook？

第二，只要子代理预加载了 Skill，就要求 PR 里显式声明正文长度。PR 描述得写清楚：这段 Skill 正文在每次 spawn 时都会在启动阶段注入。这条能在最昂贵的误解流进生产工作流之前把它拦下来。

第三，扫描 CLAUDE.md、Skill 和子代理提示词里的重复规则。重复指令带来的是反复计费的上下文成本，但更严重的问题是分叉。两份副本一旦不同，团队就凭空造出了一套没写进任何文档的优先级体系。

第四，把上下文检视纳入新人上手流程。工程师应该去查实际加载的 memory 文件，而不是从仓库目录结构里推断。这条纪律很简单：分清「本来打算加载什么」和「实际加载了什么」。

最后，把测量脚本当生产工具来做版本管理。解析要有防御，原始产物要留档，遇到结构不匹配就判定为测量失败，而不是当成零成本的结果。

## CEO 和 CTO 要做的是治理，不是提示词优化

这套纪律的商业理由，不是承诺 token 会降多少个百分点。它降的是失控的运维行为。

没有放置策略，指令的体量会随团队规模一起涨。新工程师往最显眼的文件里加规则。专家们各自造出平行的 Skill。自动化的负责人再把它们预加载进子代理。成本变得难以归因，而且当一条关键工作流跑过之后，没人能证明当时到底哪份策略生效了。

有了放置策略，三件事会同时改善。

单位经济学变得可评审，因为常驻上下文、被调用的流程和被 spawn 的工作负载都有了具名的归属和可见的边界。用量涨，成本仍会涨，但它是沿着可观察的决策涨，而不是靠无声的重复堆出来的。

合规变得更站得住脚，因为团队不再把上下文里的指令当成管控。敏感数据限制、生产命令闸门、密钥处理规则，都可以[搬进 hook](/zh/blog/zh/claude-code-hooks-workflow)，让系统去拦截，而不是去请求配合。

上市速度也会改善，因为工程师不必在每一个跟代理相关的 PR 里都从头辩论一遍该放哪层。清晰的运行模型减少设计上的反复，让团队把注意力花在真正的产品或迁移工作上。

我的建议是别再把 CLAUDE.md、SKILL.md 和子代理当成三档价目表。CLAUDE.md 放紧凑的常驻上下文，Skill 放按需调用的流程，子代理用来做隔离，hook 用来做强制。只有当可靠的分层遥测数据显示，重复的、被继承的指令持续比删掉它们更便宜，我才会改这个建议。

## 参考资料

1. [Extend Claude with skills](https://code.claude.com/docs/en/skills)
2. [Subagents](https://code.claude.com/docs/en/sub-agents)
3. [How Claude remembers your project](https://code.claude.com/docs/en/memory)
4. [Agent Skills Overview](https://agentskills.io/home)
5. [Headless mode](https://code.claude.com/docs/en/headless)
6. [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)
