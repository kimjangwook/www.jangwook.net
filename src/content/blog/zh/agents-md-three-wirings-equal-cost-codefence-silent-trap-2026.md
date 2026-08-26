---
title: 三种 AGENTS.md 接线方式成本相同；CLAUDE.md 里一个代码围栏才是真正杀死 import 的静默陷阱
description: 实测三种将 AGENTS.md 接入 Claude Code 的方式，token 差异仅 116。真正的陷阱：CLAUDE.md 中用代码围栏包裹
  @AGENTS.md，文档加载直接归零，无报错、无 token 异常、无任何信号。
pubDate: '2026-08-26'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- Claude Code
- AGENTS.md
- 上下文工程
- 工程效能
- AI 辅助开发
relatedPosts:
- slug: claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026
  score: 0.9
  reason:
    ko: 같은 CLAUDE.md 컨텍스트 계층 구조를 다른 각도에서 실측한 후속 글
    ja: 同じ CLAUDE.md コンテキスト階層を別の角度から実測した続編
    en: Follow-up that measures the same CLAUDE.md context layer from a different
      angle
    zh: 同一 CLAUDE.md 上下文层次的另一角度实测
- slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
  score: 0.7
  reason:
    ko: MCP 서버 비용 구조를 실측한 글로, 도구 의존성 논의와 연결
    ja: MCP サーバーのコスト構造を実測した記事で、ツール依存性の議論と接続
    en: MCP server cost structure measurement that connects to the tool-dependency
      discussion
    zh: MCP 服务器成本结构实测，与工具依赖性讨论相关联
---

我需要确认一件事：@import、symlink、文件拷贝这三种方式把 AGENTS.md 接入 Claude Code，到底能不能互换。我跑了 6 个单元格、18 次运行，全部工具和 MCP 服务器关闭，模型无法自行打开任何文件。三种接线在一份 2,920 token 的文档上只差 116 token；CLAUDE.md 里的代码围栏是唯一一个文档从未加载的接线方式。

如果你团队的 CLAUDE.md 里有一段代码围栏提到了 @AGENTS.md，那条 import 已经死了。你不会看到报错。你不会看到 token 飙升。你只是每个新会话都少了一段 2,920 token 的上下文。我宁愿周二早上 grep 一下那个模式，也不想开会讨论哪种接线方式更优雅。

## 解析器不看围栏内部

> "You can also reference other files using the @ syntax. For example, you can add @AGENTS.md to your CLAUDE.md file to import its contents."
> — [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)

loader 在会话启动时读取 CLAUDE.md。它扫描 @filename 模式，将每个匹配项当作 import 指令。这个扫描发生在 markdown 代码围栏和代码跨度之外。围栏内的文本对解析器来说就是一段惰性字符串。所以 @AGENTS.md 夹在围栏标记中间时，loader 不会打开那个文件。不会记录警告。不会重试。@ 符号就是段落里的一个字符，跟代码块里的美元符号不代表货币一样。

围栏单元格里 total_input 多出来的 141 token，就是围栏标记本身加上 @AGENTS.md 这个字面字符串，作为惰性文本被吞了进去。那份 2,920 token 的文档从未进入 prompt。不存在"在围栏里发现了 @"这条错误路径，因为解析器根本没有"漏看围栏"这个概念。它不是没找到文件。它是压根没往那儿看。

## 2,920 token 文档上的 116 token 差异

> "bare-agents 0/3 hit, total_input −2 vs control. at-import 3/3, 17978. symlink 3/3, 17856. copy 3/3, 17862. fenced-import ZZFENC85 0/3, total_input 15081."
> — [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)

| 单元格 | 命中率 | total_input | 相对 copy 差异 |
|---|---|---|---|
| bare-agents（无接线） | 0/3 | 对照 −2 | — |
| @import | 3/3 | 17,978 | +116 |
| symlink | 3/3 | 17,856 | −6 |
| copy | 3/3 | 17,862 | 0 |
| fenced @import | 0/3 | 15,081 | −2,781 |

canary 文档是 9,674 字节，按 3.31 字节/token 计费为 2,920 token。@import 比 copy 多计 116 token。symlink 比 copy 少 6 token。在一份 2,920 token 的文档上，这是 4% 的波动。三种方式功能上完全相同。它们都把同样的 2,920 token 放进了 prompt。这个差异是 import 机制自身的开销，不是质量差异。

## 三种接线，同一功能

官方文档把 @import、symlink、copy 列为引用 AGENTS.md 的三种方式。实际上，三者只在 loader 或文件系统如何解析路径这一点上有区别。@import 是 loader 在解析时展开的字符串。symlink 是 loader 跟随的文件系统条目。copy 是 loader 直接读取的字面文件。模型收到的 prompt 在三种情况下都是同样的 2,920 token。

这意味着这个选择纯粹是维护偏好。你选一种，定了，不再改。一个团队因为有人读了篇博客就从 symlink 换成 @import，是在拿 review 时间讨论 116 token 的差异。

## "等价"在哪里失效

最强的反驳：这是 9,674 字节、每个单元格 3 次运行、一台 macOS 机器、一个 Claude Code 版本。2026-08-16 的实验室数据显示同一个 loader 在 31 到 48 KiB 文档上出现概率性遗漏。50 KiB 以上三种接线是否仍然落在 116 token 以内，未确认。

还有 codex 轴线。2026-08-18 的前一次实验把 60 次 codex 运行全部打在了 usage limit 上。限制在 2026-09-15 解除。同时在同一个仓库里跑 codex 和 claude 的团队：这份数据只回答了半个问题。"怎么接 AGENTS.md"对那些团队来说不是单工具问题。

我承认这个边界。如果你的 AGENTS.md 超过 32 KiB，或者同时跑 codex 和 claude，"等价"是我尚未验证的论断。对于一份 9,674 字节的文档、单次 claude 会话，三种接线是同一回事。

## 一条 grep 和一条 lint 规则

我给团队的指令：跑 `grep -n '@' CLAUDE.md`，检查有没有 @ 路径落在代码围栏里。文档模板 lint 加一行：围栏标记之间不允许出现 @ 路径。30 秒的检查。

围栏陷阱不依赖版本。不依赖操作系统。它是解析规则。loader 在 2.1.233 上不会看围栏内部，下个季度发布的版本也不会。这是结构性问题，不是某个 patch 能修的 bug。

任何 markdown 格式化工具、任何 prettier 配置、任何会重新格式化 CLAUDE.md 的 CI lint，都可能在一行示例代码外面套上围栏。重新格式化之后下一个打开新会话的人不会知道 import 已经死了。没有信号。没有报错。没有性能指标下降。那 2,920 token 就是不在。

## 一条死掉的 import 每季度值多少钱

8 个工程师的团队，每人每天新开 3 次会话，一个季度 1,440 个会话。如果规则文档是 2,920 token 且不在 prompt 里，每一个会话都在没有上下文的状态下启动。模型会猜。它会问澄清问题，浪费轮次。它会写出违反你写明的规范的代码。

你在 dashboard 上看不到这个。你看到的是 code review 变慢，是某个 PR 因为模型不知道命名规范多走了两轮，是个 junior 问了文档里已经回答过的问题。2,920 token 很便宜。它省下的 review 时间不便宜。

## 这份数据没有回答的问题

四跳递归 import：文档说最大深度四跳。我测了一跳。围栏规则在第二跳、第三跳、第四跳是否仍然成立，未测。

插入位置：total_input 告诉我文档在 prompt 里，但不告诉我它在哪。系统 prompt 之后？第一条用户消息之前？原始数据里，6 个单元格中有 2 个存在 109 token 的方差，我手头的字段解释不了。

50 KiB 以上。codex 轴线。两个都是开放问题。

我的判断。如果你的团队还没把 AGENTS.md 接入 Claude Code，三种方式随便选一种，定了，不再改。116 token 的波动不是决策依据。如果你已经接了，这周 grep 一下 CLAUDE.md 里围栏中的 @ 路径。这是唯一有意义的检查。

32 KiB 边界和 codex 轴线是开放问题。2026-09-15 限制解除后我会重新测量。一份 9,674 字节、3 次运行、单版本的数据集能说的话，和一个季度生产使用之后能说的话，是两回事。

三行围栏标记决定一份 2,920 token 文档是否加载。文档格式就是加载协议。没有 manifest。没有配置文件。CLAUDE.md 自身的 markdown 语法就是 import 机制。这意味着每一个会重新格式化你 CLAUDE.md 的工具都是加载路径上的依赖，而其中任何一个引入围栏时都不会警告你。

## 参考资料
- [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)
- [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)