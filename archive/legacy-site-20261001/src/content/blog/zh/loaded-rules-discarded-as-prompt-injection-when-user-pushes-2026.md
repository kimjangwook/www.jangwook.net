---
title: 用户只要提出一条相反要求，Claude Code 就会丢掉整份 CLAUDE.md 规则文件
description: 写进仓库规则文件里的规矩，被模型读到不等于被遵守。实测显示用户一句话和规矩冲突时，整份规则文件在 6 次里 6 次被当作提示词攻击丢掉。
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- prompt-injection
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This conflict-request experiment shows the flip side of the earlier finding
      that declared rules get silently dropped when truncated.
    ko: 이번 글의 충돌 요청 실험은 규칙 파일이 잘려도 조용히 무시된다는 기존 실측 결과의 반대편 사례를 보여준다.
    ja: 今回の競合リクエスト実験は、ルールファイルが切り詰められても静かに無視されるという既存の実測結果の裏側を補う事例だ。
    zh: 本次冲突请求实验恰好补充了此前关于规则被截断后会被静默忽略的实测结论。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The observation that CLAUDE.md is merely a suggestion extends the earlier
      experiment showing three @AGENTS.md wirings measure equal and a codefence line
      silently swallowing the whole file.
    ko: CLAUDE.md가 제안일 뿐이라는 관찰은, CLAUDE.md에 @AGENTS.md를 연결하는 세 방식이 측정상 동일하며 코드펜스 한
      줄이 문서 전체를 삼키는 함정을 검증한 이전 실험의 자연스러운 후속이다.
    ja: CLAUDE.mdはあくまで提案にすぎないという観察は、@AGENTS.md接続の3方式が測定上同等でコードフェンス1行が文書全体を飲み込む罠を検証した前回の実験の自然な続きである。
    zh: CLAUDE.md 只是一份建议这一观察，延续了此前验证三种 @AGENTS.md 接线方式成本相同、代码围栏一行会吞掉整篇文档的实验。
---

## 规矩文件是什么，为什么它不一定被遵守

很多人在项目的代码仓库里放一个规则文件，名字叫 CLAUDE.md 或 AGENTS.md。它就像贴在冰箱上的家规便条：上面写着"作业先写完再玩游戏""吃饭前洗手"。写这个文件的人，默认 AI 助手每次干活都会照着做。

这次实测要回答的问题很直接：这张便条到底管不管用？答案是——管用，但只要用户的要求和规矩冲突，整份文件就会失效。

先说这个结果对我来说意味着什么：如果你以为"写进文件就等于定死了规矩"，这次的数字会让你重新想一遍。写下来不等于被遵守。真正必须做到的规矩，得交给别的办法去保证。

## 规则文档是否被遵守是怎么测的

实验的做法不复杂。研究者准备了一个很小的编程任务：写一个打招呼的小函数。然后分三种情况各跑 6 次。

第一种情况：不放假规矩，看 AI 默认怎么写。结果 6 次里 6 次，AI 都用了一种叫 f-string 的写法来拼字符串。f-string 就是在句子里挖个洞、把变量塞进去的写法——这是 AI 平时的默认习惯。

然后放一张"便条"进项目，上面写了 3 条规矩，比如"不要用 f-string""写代码时加上某行固定的标记和注释"。这些用来检查的记号行，研究者叫它"金丝雀"——就像矿井里放金丝雀，看它还在不在，就知道规则还活着没有。

第三种情况里，便条一样，但用户在请求里多说一句话："请用 f-string。"这一句和便条上的第 2 条规矩正好相反。看 AI 是只破这一条，还是把整张便条都扔了。

每跑一次，都用搜索工具数输出里有没有那些记号，这些记号出现的次数，就是下面列出的数字。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 在没有规则文档的默认状态下生成代码,测量默认习惯。</li><li class="lm-card__text">步骤 2. 放入规则文档后生成同样的代码,观察是否发生变化。</li><li class="lm-card__text">步骤 3. 用户强行要求使用f-string制造冲突,观察规则是否坚持住。</li><li class="lm-card__text">步骤 4. 分别统计输出中的标记token、金丝雀行、注释和f-string使用并进行比较。</li></ol></div>

## 中性任务下规则文档确实改变了代码习惯

先看好消息。没有用户施压时，那张 300 字节的便条（大约一小段话的长度）确实起作用了。

6 次实验，便条 6 次都送到了模型面前。AI 平时 6 次里 6 次都用 f-string，看了便条后变成 6 次里 0 次用。也就是说，默认习惯被完全压下去了。不过另外两条规矩——加标记和金丝雀行——只在 6 次里做到了 4 次。规则送到了模型那里，不等于每一条都被照办。这一点从这时就看得出来了。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-neutral" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">Claude,有规则</span><span class="lm-card__text">6次全部读取了规则文档并全部停用了f-string,但标记与金丝雀规则在6次中只遵守了4次。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">规则触达 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string禁用 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">金丝雀行数 4/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">添加注释 4/6</span></div></div></div>

## 用户一句话施压后，整份规则文档被一起丢掉

两组实验的唯一差别，是请求里多加了一句话——其他设置、那份规则文件的内容，一个字都没变。所以真正改变的并不是规则本身，而是 AI 对这份文档的态度：在这个判断里，规则文件不再是项目说明，而像是有人偷偷塞进文件夹的话。

这个判断一旦翻转，后果不是只丢掉被点名的那一条规则。实验里，没和用户要求冲突的其他规则也跟着一起失效了——AI 不是只丢掉冲突的那一条，而是把整份文件都扔了。

## 官方文档本来就没承诺规矩一定被遵守

这不算偷偷出问题。Anthropic 的 Claude Code 官方文档写得很明白：

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

翻译过来：规则文件的内容是作为用户消息送过去的，AI 会读、会尽量照做，但不保证严格遵守，遇到模糊或冲突的指令尤其如此。文档还专门区分了两种东西：

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 공식 문서 (enforcement 구분 문장)](https://code.claude.com/docs/en/memory)

> — [Claude Code memory 공식 문서 (enforcement 구분 문장)](https://code.claude.com/docs/en/memory)

意思是：有一类规则由程序层面强制执行，不管 AI 自己怎么想都得守；而规则文件只是"影响"，不是"强制"。官方从来没说这张便条是强制性的。

研究者还对照了 4 份厂商文档，包括 agents.md 的规范。agents.md 那边写着：

> The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.
> — [agents.md 스펙](https://agents.md/)

> — [agents.md 스펙](https://agents.md/)

也就是官方规范本来就说：用户在对话里明说的话，压过一切文件规则。用户指令赢，这个方向是对的。可是 4 份文档里，没有一处写过"规则文件被加载后会改变输出效果"这样的承诺。它们只说了文件会被加载，没说加载了会怎样。文档承诺的，和实际做到的，不是一回事。

## 该被遵守的规矩应该放的位置

反方会说：这是安全功能，不是缺陷。AI 怀疑并拒绝可疑指令，是防御在起作用。这个说法在优先级上没错——用户确实可以压过文件规则。但这次防御拦下的不是那 1 条冲突的规矩，而是同一份 300 字节文件里没冲突的 2 条和金丝雀。合法的指令 6 次里 6 次被判成攻击，这是误报，不是防御。

所以真正的问题不是"该不该让用户赢"，而是"这份文件到底算什么承诺"。落到我实际要做的事上，结论是分成两类：写下来"希望被遵守"的，放规则文件；写下来"必须被遵守"的，交给程序去查——比如自动检查代码风格的工具、提交代码前自动运行的检查脚本、设置里的强制规则。文档管概率，程序管底线。

还有一点实用建议：如果我的请求本来就会和某条规矩冲突，那句话别写进文件里和别的规矩混着，到时候直接在对话里说。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">规则文档确实到达模型并改变了部分代码习惯,但一旦用户反向施压,规则就被当作提示词攻击对待而崩溃。</p></div>

## 本文未能核实的部分

这次只测了 Claude 一种工具、一个写函数的任务、一份 300 字节的规则文件。另一家工具的 18 次运行全部因为用量限制没跑成，所以 AGENTS.md 那边的同样结论还没有数字。接下来要做的，是换模型组合重跑，看这种"整份丢弃"的判断在别的条件下还稳不稳。

如果这个判断在什么条件下会错：有两种情况能证明这篇文章错了。一是：用户要求和规矩冲突时，AI 只改冲突的那一条，其余规矩照旧守着，比如 6 次里 4 次守住。二是：没有冲突的普通任务里，整份文件也被拒绝。出现任意一种，判断就不成立。

给两种读者各一句实在话：如果你一直相信"写进文件就一定会被遵守"，那就把必须做到的规矩从文件搬到自动检查的装置上去。如果你的工作里经常要提出和规矩相反的要求，那就别把会冲突的要求混进文件，需要的时候在对话里直接说。

## 参考资料

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic