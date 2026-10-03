---
title: AGENTS.md 与 CLAUDE.md 的三种连接方法实测效果相同，真正的陷阱是被代码块包住的一行
description: 让 AGENTS.md 进入 Claude Code 的三种官方做法，实测结果都一样，所以选择的标准不是快慢，而是你环境里的限制。真正要小心的，是一行被当作示例包进代码块的写法，它会让整份规则文档悄无声息地消失。
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- AGENTS.md
- CLAUDE.md
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: All three official ways to wire AGENTS.md into CLAUDE.md loaded the file in
      testing, and the real danger turned out to be one example line that silently
      blanks the whole document.
    ko: AGENTS.md가 CLAUDE.md에 연결되는 세 가지 공식 방법을 실측했고, 한 줄 예시가 문서 전체를 조용히 지워버리는 함정을
      발견했다.
    ja: AGENTS.mdをCLAUDE.mdにつなぐ3つの公式方法を検証し、たった1行の例示がドキュメント全体を静かに消し去る落とし穴を突き止めた。
    zh: 实测了 AGENTS.md 接入 CLAUDE.md 的三种官方方式，并发现其中一行示例竟能悄然抹掉整个文档。
---

家里冰箱上贴一张便条，只有家里人看得到。如果想让来帮忙的邻居也看到，就得想办法把内容转达过去：抄一份给他、或者告诉他去冰箱上自己看。这篇文章说的就是类似的事——怎么让一份规则文档被另一个工具看到，以及哪种转达办法会翻车。

## 规则文档变成两份的问题

先说这是什么。AGENTS.md 是一份写规则的文档，告诉 AI 助手在这个项目里该守什么规矩。Claude Code 是一个 AI 编程工具。

问题是，Claude Code 有自己的规则文件名。官方文档写得很直白：

> Claude Code 读取的是 `CLAUDE.md`，不是 `AGENTS.md`。
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

也就是说，你精心写的 AGENTS.md，Claude Code 根本不会去看。打个比方：你写的东西贴在了他不去看的地方，写得再清楚也等于没写。对使用者的影响很直接：如果两边都用，规则文档就变成两份，要维护两遍。所以需要一个办法，让 CLAUDE.md 这边也能读到 AGENTS.md 的内容。

## 三种连接方法

官方文档给了三个办法。都先解释一下：

1. **导入**。文档里写一行 `@AGENTS.md`，意思是“把这个文件的内容也一起装进上下文”。上下文可以理解成 AI 开工前先读一遍的备忘录。官方的说法是：

> CLAUDE.md 文件可以使用 `@path/to/import` 语法导入其他文件。被导入的文件会在启动时展开，与引用它的 CLAUDE.md 一起装入上下文。
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

2. **符号链接**。就是做一个“捷径”，让 CLAUDE.md 指向 AGENTS.md，看起来是两个文件，实际上只有一份内容。

3. **复制**。把 AGENTS.md 直接复制一份，改名叫 CLAUDE.md。最笨但最不会出错，缺点是以后改了这份，另一份要记得同步。

三种方法的区别只在：导入是引用原文，符号链接是同一个文件的两个名字，复制是各存一份、内容一样。

## 测量方法

光听道理不算数，得动手测。为了知道文档有没有真的被读到，作者在 AGENTS.md 的开头放了一句特定的标记句子。如果模型的输入里出现了这句标记，就说明文档进去了；没出现，就是没进去。同时记录输入的长度，单位叫“标记数”，可以简单理解成 AI 读文本时计费和计量的字数单位。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 准备了一份带有金丝雀标记语句的 AGENTS.md,分别做成六种状态。</li><li class="lm-card__text">步骤 2. 在每种状态下把 Claude Code 各运行三次,观察标记是否出现在输出中。</li><li class="lm-card__text">步骤 3. 在完全没有接入的状态下运行,确认标记不出现,以此建立基准线。</li><li class="lm-card__text">步骤 4. 按接入方式统计标记命中次数,并相互比较。</li><li class="lm-card__text">步骤 5. 对放在代码块里的 import 语句也单独测试,查看它在哪里失效。</li></ol></div>

这份测试文档大小是 9,674 字节，约等于 2,920 个标记。也就是说，一旦连接成功，每次会话 AI 都会多读这么多内容。这个数字后面还要用到。

## 不做连接直接放置的结果

先看最懒的做法：什么都不接，只放 AGENTS.md。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-bare-agents" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">无接入</span><span class="lm-card__text">只放了 AGENTS.md,没有创建 CLAUDE.md。三次都没有在输出中出现标记。结果是文档完全没有进入模型。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">命中 0/3</span></div></div></div>

结果是 3 次运行里标记出现了 0 次，输入长度和控制组（放一份谁都不会读的无关文件）几乎一样，只差 2 个标记。这说明没有连接，文档就完全没有被装载。也就是说，文档放在那里，但工具根本不会去读它。

## 三种连接方法的实测结果

三种连接做法各测了 3 次，结果全部是 3 次命中。输入标记数分别是：

- 导入：17,978
- 捷径：17,856
- 复制：17,862

三者最大差距是 122 个标记，而一份文档本身就约 2,920 个标记，这个差距约为 4%。顺便说，导入比复制只多 116 个标记，说明导入那行本身几乎不重复计费——文档没有被算两次。

换句话说，真正要紧的是：三种方法都能把规则送到 AI 面前，表现上几乎没差别。

## 被示例代码包住的一行的陷阱

这才是整篇文章的重点。有一个人写 CLAUDE.md 时，想教别人“怎么写导入”，就把 `@AGENTS.md` 这一行作为例子，用代码块包了起来（代码块是文档里专门展示示例的排版框，程序会知道“这只是展示，不是指令”）。结果——

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-fenced-import" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">代码块 import</span><span class="lm-card__text">把 @AGENTS.md 放进了代码块内。三次都没有出现标记。import 语句在这个位置没有被解析,整份文档都没有进入模型。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">命中 3/3</span></div></div></div>

这一格对应的原始测量记录是：标记 0/3 次出现，输入 15,081 个标记——和“完全没连接”的水平几乎一样（差 141 个标记，即那些代码框符号本身的分量）。也就是说，例子被包起来的那一刻，整份 9,674 字节的文档一个字节都没进入 AI。

这不是事故，是官方写明的规则：

> 导入解析会跳过 Markdown 代码片段和围栏代码块。要在 CLAUDE.md 中提到某个路径但不想触发导入，可以用反引号包住它：写成 \`@README\` 会保持字面文本，而反引号外的 @README 会导入文件。
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

要点是：连接本身不容易出错，会静悄悄翻车的，是为了举例而包起来的一行。出错的表现不是“报错”，而是“规则不见了”——没有人会提醒你。

## 选择连接方法的标准

既然三种方法结果一样，选择标准就不是快慢，而是你环境里的限制：

- **符号链接**最省事：不重复维护文档，标记数最低。但有一个明确的限制——

> 在 Windows 上，创建符号链接需要管理员权限或开发者模式，所以请改用 `@AGENTS.md` 导入。
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

- **导入**适合 Windows 环境，或者需要在 CLAUDE.md 里添加 Claude 专属说明的人，代价是多约 116 个标记。
- **复制**最稳，但要记得两边同步。

有一个诚实的保留意见：每种情况只测了 3 次，而且同一实验里反复出现一次原因不明的、恰好 109 个标记的上下波动。所以“三者完全等同”这个说法在统计上说得过满；更稳的说法是“三者都可用且差距很小（122 个标记以内）”。但如果你的目标本来就不是省 4% 的成本，这就不是要紧的分歧。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">@import、符号链接和复制这三种方法都给模型输入了相同的文档内容,而没有接入时文档则完全没有进入。</p></div>

落到行动上是两句话：如果你的规则文档不需要添加 Claude 专属内容、或者环境上有权限限制，那就选三种连接里最省心的一种，设好就别再惦记它。如果你需要在文档里写路径示例，那就在保存前检查一遍：示例有没有用反引号包好——就这一眼，能防止整份规则无声消失。

## 本文未能核实的部分

这次每格只测了 3 次，罕见的小概率偏差可能没被捕捉；代码块陷阱只在 9,674 字节的小文档上验证过，更大的文档上是否同样成立还要再测；Windows 上符号链接的权限问题也只是引用了官方文档，没有实机验证。所以下一步要核实的，是换更长的文档重跑同样的测量。

最后一句话说清这个判断什么时候会错：把同样的测量重跑一遍，如果某一种连接方法 3 次里 3 次都读不进文档，或者三种方法的标记差距明显超出 122，那这篇文章的判断就不成立。

## 参考资料

1. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs — Anthropic (code.claude.com)](https://code.claude.com/docs/en/memory)
2. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (import syntax) — Anthropic (code.claude.com)](https://code.claude.com/docs/en/memory)
3. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader) — Anthropic (code.claude.com)](https://code.claude.com/docs/en/memory)
4. [AGENTS.md — agents.md](https://agents.md/)