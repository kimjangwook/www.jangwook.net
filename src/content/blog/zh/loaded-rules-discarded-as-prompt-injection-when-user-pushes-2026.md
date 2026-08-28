---
title: 用户提示词一句话就让 Claude Code 丢掉了整份 CLAUDE.md 规则
description: 写在 CLAUDE.md 里的规则只是建议，不是保证。实测显示，当请求和其中一条规则冲突时，整份规则文档都会被当成可疑信息丢掉。
pubDate: 2026-08-28
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- ai-rules
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The earlier finding that declared rules fail silently now extends into an
      experiment where a single user prompt makes Claude Code discard the entire CLAUDE.md
      file.
    ko: 선언된 규칙이 침묵 속에 무시된다는 이전 실측이, 이번엔 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 버려지는 실험으로 이어진다.
    ja: 宣言されたルールが黙って無視されるという前回の実測が、今度はユーザープロンプト一行でCLAUDE.md全体が破棄される実験へとつながる。
    zh: 此前实测发现声明规则会被静默忽略，而这次实验进一步表明，一句用户提示就能让 Claude Code 丢弃整个 CLAUDE.md 文件。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: Where the previous post showed a code fence silently erasing AGENTS.md, this
      one digs into why a single user prompt can void the entire CLAUDE.md—because
      rule files are only suggestions in the end.
    ko: AGENTS.md를 조용히 지워버리는 코드펜스 함정을 다뤘다면, 이번 글은 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 무시되는
      이유, 즉 규칙 파일이 어차피 '제안'일 뿐이라는 근본 원리를 파헤친다.
    ja: コードフェンスがAGENTS.mdを静かに消す罠を扱った前編に続き、本稿ではユーザープロンプト一行でCLAUDE.md全体が無視される理由、すなわちルールファイルは結局「提案」にすぎないという根本原理を掘り下げる。
    zh: 上一篇揭示了代码围栏悄悄抹掉 AGENTS.md 的陷阱，本篇则深挖为什么一条用户提示就能让整个 CLAUDE.md 失效——因为规则文件终究只是建议。
---

## CLAUDE.md 规则被读到，不代表会被遵守

很多人在项目的 CLAUDE.md 里写规矩。CLAUDE.md 是一个放在项目文件夹里的说明文件，AI 编程助手开工前会先读它，好知道这个项目有哪些约定。

很多人误以为：写进去了，就等于会被遵守。这次的实测说明不是。

打个比方。你在冰箱上贴一张便条，写着“家人做饭的三条约定”。贴上去只能保证家人看得见，不能保证每次做饭都照做。而且如果某天有人被要求做的事和便条上的一条对不上，最坏的情况不是只忽略那一条，而是整张便条都被当成可疑的小纸条扔掉。

换句话说，你以为写下的规矩在起作用，实际上它随时可能整份失效。

## 测量方法和基准线

这次的测量是在 Claude Code 里做的。Claude Code 是一个 AI 编程工具，你给它任务，它写代码交回来。

一共三组、每组跑 6 次，合计 18 次运行：

1. **对照组**：不写任何规则，直接让它写一个“打招呼”的小函数。6 次里 6 次它都用了一种叫 f-string 的写法，这是它自己偏好的默认写法。
2. **规则组**：放一份 300 字节的规则文档，里面有三条规则，其中一条禁止用 f-string，另外两条是一些和这条无关的小标记要求。任务里没有任何偏向任何一种写法的要求。结果 6 次里 6 次文档都被读到了，两条标记要求各在 4 次里被遵守，f-string 降到了 0 次。规则确实起了作用。
3. **冲突组**：同样的规则文档，只在任务里多加一句话，让用户要求“请用 f-string 写”。结果 f-string 回到 6 次，其余两条完全无关的规则从 4/6 掉到了 0/6。

![用三组合计 18 次运行测出的测量步骤](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-how.png)

基准线很重要：不设对照组，就没法知道“遵守”到底是规则的功劳，还是模型本来就那么做。判断规则有没有用，必须先知道不加规则时模型会怎么做。

## 用户提示词一冲突，遵守率掉到 0/6

关键发现在冲突组。三条规则里，用户的请求到底撞上了几条？其实只撞上了 f-string 那一条。按常理，模型最多只丢那一条，剩下两条照守。

实际结果：6 次运行里，遵守率从 4/6 掉到了 0/6。不但 f-string 禁令没守住，那两条完全没被点名的规则也一起消失了。

![规则文档前部的 token 在输出中出现的样子，到达 6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c1-head-reachable.png)

背后的原因更值得注意：6 次运行全部把整份规则文档判定成了“提示词注入”。提示词注入是一种攻击手法，指有人把恶意指令混进 AI 读的材料里。也就是说，模型没有把用户自己写在项目里的规则文件当成规矩，而是当成了可疑的攻击材料，整份丢弃。

![用户表示反对后改用 f-string 的运行，6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c5-override-hides-canary.png)

这里要注意：一次冲突污染的不是一条规则，而是同一份文件里的所有规则。

和冰箱便条不同的地方在这里：冰箱上的便条即使某一条被质疑，别的几条通常还在。但这次的实测里，一句话就把整张便条整个拿走了。

## 最说得通的反驳和它的边界

有一种反驳听起来很有道理：这其实是安全功能，不是缺陷。项目文件里提交的指令也可能被坏人利用，模型起了疑心并拒绝，恰恰说明防御在起作用。而且 agents.md 这份项目规则文件的官方规范里也写了，用户的对话指令优先于一切。

> The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.
> — [agents.md 스펙](https://agents.md/)

这个反驳在前半段是对的：用户指令赢过文档规则，方向本身符合官方预期。官方的 Claude Code 文档也写得明白：

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

但边界在于准确度。被当成攻击材料丢掉的，不只是冲突的那一条，而是用户亲手提交到自己项目里的整份合法规则文件。模型自认为识别出了攻击，却把合法文件也一并当成攻击丢弃，6 次里 6 次如此——这不是防御成功，更像是误报：把合法文件也错杀了。

## 文档规则和强制规则的区别

官方文档其实早就分了两层：

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

翻译成日常的话：有一种规则像门锁，不管家里人的想法如何，门就是打不开；另一种像冰箱上的便条，看的人心情好就照做。CLAUDE.md 属于后者。

这次的数据印证了这一点：文档 6/6 被读到，但遵守率随任务上下文在 4/6 和 0/6 之间跳。写下来的规则不是保证，只是大概率会被遵守的建议。

![文档到达 6/6、遵守 0/6 的结论图](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-takeaway.png)

对我来说，有两件事明天就能做：

- **想让某条规则一定被遵守的人**：别把它写在 CLAUDE.md 里，把它挪到会自动检查、自动拦下的那一层，比如保存时自动检查代码格式的工具。
- **规则文档和日常请求经常打架的团队**：预计会冲突的指令不要放进规则文档，只写在当次任务的请求里。

写在文档里的规则只是“请照做”的请求，真正必须执行的规矩，要交给自动检查的工具。

## 本文未能核实的部分

这次没有测别的工具。我本来想对另一款同类工具也测 18 次，但因为用量限制没跑成。所以没法比较不同工具之间是否一样。AGENTS.md 那边的同样实验也没做，结论只在 CLAUDE.md 这一个渠道上成立。接下来我会在用量恢复后补上工具对比，并确认“整份丢弃”在不同模型和设置下是否稳定。

这个判断在什么情况下会错？如果冲突之后，那两条没被点名的规则依然被遵守，也就是遵守率守住 4/6，这篇文章就错了。但实测是掉到了 0/6。

## 参考资料

1. [Claude Code memory 공식 문서 — Anthropic](https://code.claude.com/docs/en/memory)
2. [Claude Code memory 공식 문서 (enforcement 구분 문장) — Anthropic](https://code.claude.com/docs/en/memory)
3. [agents.md 스펙 — agents.md](https://agents.md/)
4. [Claude Code security 공식 문서 — Anthropic](https://code.claude.com/docs/en/security)
5. [agents.md 스펙 (최근접 로딩 문장) — agents.md](https://agents.md/)