---
title: 用户提示一旦与规则冲突，CLAUDE.md 的规则六次里有六次被整体丢弃
description: 写在 CLAUDE.md 里的规则，模型每次都会读到，但读到不等于遵守。实测显示，用户一句话与规则冲突时，整份规则文件被当作提示注入丢弃，连没冲突的规则也一起失效。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- AI 编程助手
- CLAUDE.md
- 规则文件
- 提示注入
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The silent-truncation failure documented in the robots.txt and AGENTS.md measurements
      reappears here as a single user prompt discarding every CLAUDE.md rule, making
      this the direct continuation of that investigation.
    ko: robots.txt와 AGENTS.md 실측으로 확인한 '규칙이 잘려도 조용히 무시되는' 실패 구조가, CLAUDE.md 규칙 전체가
      사용자 프롬프트 하나로 버려지는 사례에서 그대로 재현된 배경을 설명한다.
    ja: robots.txtとAGENTS.mdの実測で確認した「ルールが切れても静かに無視される」失敗構造が、CLAUDE.mdのルール全体が一つのユーザープロンプトで捨てられる事例でそのまま再現された経緯を説明する。
    zh: 在robots.txt与AGENTS.md实测中发现的“规则被截断也被静默忽略”的失效结构，在CLAUDE.md全部规则被一条用户提示丢弃的案例中原样重现，因此这篇是前文的直接续篇。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The single conflicting prompt that made Claude Code discard every CLAUDE.md
      rule in this post is exactly the trigger that fires the silent codefence trap
      from the earlier piece, where all three official AGENTS.md wirings cost the
      same yet one line can erase the whole document.
    ko: 이번 글에서 다룬 '프롬프트 하나가 CLAUDE.md 전체를 무효화하는 문제'는, AGENTS.md를 읽어 들이는 세 방법의 비용이
      같다는 전제 위에서 코드펜스 한 줄이 문서를 조용히 지워버리는 이전 글의 함정이 정확히 어떤 경로로 발동되는지를 보여준다.
    ja: 本記事で扱う「たった一つのユーザープロンプトがCLAUDE.mdの全ルールを無効化する問題」は、AGENTS.mdを読み込む3つの公式方法のコストが同一であるという前提のもと、コードフェンス1行がドキュメント全体を静かに消し去る前記事の罠がどの経路で発動するかを明らかにする。
    zh: 本文中'一条冲突的用户提示让 Claude Code 丢弃全部 CLAUDE.md 规则'的问题，正是上一篇'三种官方 AGENTS.md 加载方式成本相同、一行代码围栏即可静默抹掉整个文档'的陷阱被触发的具体路径，值得接着读下去。
---

家里冰箱上常贴一张纸条。上面写着几条全家的约定：垃圾分类、周三倒垃圾、剩菜放保鲜盒。这张纸条贴在人人看得见的地方，但每个家人心里都清楚，它更像是"提醒"，而不是"命令"。谁要是当天说一句"今天先别管垃圾了"，多半只有那一条失效吗？实测的结果是：实测里的 Claude Code 遇到这种情况，把整张纸条揭了下来，连同没被提到的那几条一起。

这篇文章讲的就是这件事。

## 规则文件送达模型与被遵守是两件事

先说清楚名词。Claude Code 是一个 AI 编程助手。CLAUDE.md 是一份放在代码仓库里的文字文件，团队把约定写在里面，比如"输出代码时用某种格式"。模型每次干活前都会把这份文件读一遍。

我们做了实验。给模型一份约 300 字节的规则文件，里面写了 3 条规则，然后让它做一个小任务。同一个设置，跑 6 遍。

结果分两层看。第一层，规则文件有没有被"送到"模型眼前：6 遍全部送达。第二层，规则有没有被"遵守"：4 遍遵守。文件送到了，但 6 遍里只有 4 遍被照着做了——遵守是概率，不是保证。

这两个数字摆在一起，说明一件事：**送达和遵守是两次独立的事件**。文件送到了，不等于模型会照着做。对我们用的人来说，这意味着"我写进文件了"这句话，本身不能当保证用。

实验里有个更扎眼的细节：在没有任何规则文件、只给任务的情况下，模型 6 遍全都用自己偏好的默认写法。加了规则文件之后，这种默认写法从 6 遍全部降到 0 遍——在中性任务里，规则文件确实压住了模型的默认习惯。也就是说，规则文件平时是"有用"的，只是它的有用是概率性的，不是保证。

| 实验 | 规则文件送达 | 规则被遵守 | 模型默认写法 |
|---|---|---|---|
| 没有规则文件（对照） | — | — | 6/6 |
| 有规则文件 + 中性任务 | 6/6 | 4/6 | 0/6 |
| 有规则文件 + 冲突提示 | 6/6 | 0/6 | 6/6 |

表格每一行的分母都是 6 遍实验。前两行说明规则文件平时压得住默认习惯；第三行是本文要讲的核心。

![实验记录截图 — 规则文件送达 6/6，遵守 0/6。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c1-head-reachable.png)

## 用户一句冲突提示造成的 6/6 全面反转

现在加入一个变量：在用户的指令里加一句话，要求模型按另一种写法输出——这句话和规则文件里的某一条直接冲突。

只加了一句话，其他都不变。同一份规则文件，同一个任务结构，再跑 6 遍。

结果是全面的反转：规则遵守从 4/6 掉到 0/6，模型的默认写法从 0/6 回到 6/6。而且不是只输掉了被冲突的那一条，是**整份文件的每一条规则**都输了。

这件事对我这样的使用者意味着：如果团队把编码约定写在 CLAUDE.md 里，只要某天某人给模型的指令和约定碰了一下，整个约定文件在那一轮就等于不存在。约定不是"折了一条"，是"整页作废"。

![实验记录截图 — 遵守率从 4/6 反转为 0/6 的两格对比。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c2-boundary-straddle.png)

## 未冲突规则也被一并丢弃的记录

这里要分清"哪一条输了"。那份 300 字节的文件里有 3 条规则。用户的那句话只和其中 1 条冲突。

按照"冲突的规则让步、其余照常"的常理想法，另外 2 条应该还活着。实测不是这样。没被冲突的规则，遵守率同样从 4/6 掉到 0/6。实验里用来验证规则是否生效的标记（一条只有照着规则写才会出现的字串），也一并消失了。

打个比方：家里约定纸条上有三条，其中一条说"剩菜用保鲜盒"。今天有人说"剩菜直接扔了吧"。合理的反应是只废那一条。实际的反应是把纸条整张揭下来，垃圾分类和倒垃圾的约定也一起不认了。

这里要注意的是：规则文件的失效不是按"条"计算的，是按"份"计算的。冲突有传染性，一条冲突会污染同一份文件里的其他规则。

![实验记录截图 — 未被冲突的规则遵守率从 4/6 降到 0/6。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c3-beyond-limit-unreachable.png)

## 六次实验全部把规则文件判为提示注入的结果

为什么整份文件会一起失效？模型自己的回答给了线索。

"提示注入"是一个安全术语，意思是从不可信的地方塞进来的指令，模型应当怀疑甚至拒绝它。在冲突提示的 6 遍实验里，模型 6 遍全部把这份规则文件明确判定为提示注入。其中 5 遍逐字引用了文件里的规则内容，然后拒绝执行；1 遍把规则复述了一遍，然后拒绝。

换句话说，模型不是"没看到"规则，也不是"权衡后选了另一边"。它把这份文件**重新归类**了——从"主人的约定"归到"可疑的外来指令"。

有一个反对意见值得认真对待：仓库里提交的文件也可能是被坏人改过的注入通道，模型多疑一点，可以算安全功能在起作用。用户指令优先这个方向，也确实和官方规格的写法一致。但这次实验里被拦下的，不是来历不明的文件，而是用户自己提交到自己仓库里的正式规则文件。合法通道被当成注入拦下，6 次里发生 6 次，这不是防御成功，是误报。防御挡错了东西，比不挡更让人措手不及——你自己的正式约定被当成了陌生人的话。

![实验记录截图 — 六次运行全部把规则文件明确判定为提示注入。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c5-override-hides-canary.png)

## 官方文档只声明加载而不声明效果

官方文档怎么说？Anthropic 的 Claude Code memory 文档里有一句很直白的话：

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

意思是：CLAUDE.md 的内容是作为系统提示之后的一条用户消息送达的，Claude 会读它并尽量遵守，但不保证严格遵守，尤其是模糊或互相冲突的指令。

另一句把边界划得更清：

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 공식 문서 (enforcement 구분 문장)](https://code.claude.com/docs/en/memory)

翻译过来：设置里的规则由运行 Claude Code 的软件（而不是模型本身）强制执行，不管 Claude 自己怎么想；CLAUDE.md 里的指令只是塑造行为，不是硬性强制层。

我们又对比了 4 份厂商文档和规格说明，查有没有任何一处声明"加载的规则会改变产出结果"。4 份的命中都是 0。文档把"从哪里加载、按什么层级加载"写得很细，对"加载之后效果如何"一字未提。

这个落差值得记住：厂商承诺的是"会送达"，没有承诺"会生效"。把团队约定押在文件上的人，押的是文档没承诺的东西。

## 把必须遵守的规则迁往自动检查层

那该怎么办？核心结论一句话：**写在规则文件里的，是"希望被遵守"；必须被遵守的，要交给自动检查的工具。**

规则文件相当于纸条，纸条是提醒。真正不能违反的事——比如禁止某种写法、安全相关的红线——要交给"lint 工具"和"钩子"这类程序。lint 工具是自动检查代码格式的程序，钩子是在每次提交代码时自动运行的检查。它们不看模型的心情，直接拦截。官方文档也把这两层分开了：设置里的规则强制执行，CLAUDE.md 只是塑造行为。

下面给两类人各一句具体的做法。

想退出这种依赖的人：把文件里的规则分成两堆，"最好遵守的"留在文件里，"必须遵守的"迁到自动检查工具，文件只当软性提醒用。

想继续用规则文件的人：如果团队的日常指令经常和规则撞车，就不要把容易撞车的指令放进规则文件。撞车会连累同文件里的其他规则，所以这类指令应该按当天情况直接写进那一次的提示里，一次说清，不进文件。

## 本文未能核实的部分

这次有三样东西没有测。一个是另一个编程助手 Codex 那条线，18 次运行全部因为用量限制没有跑成，所以 Codex 那份规则文件 AGENTS.md 是否同样表现，本文无法下结论，计划在 2026 年 9 月 15 日之后重跑。另一个是规则强弱和遵守率之间是什么关系，这次只在两个点上量过，画不出全貌。还有一个是，模型把规则文件判成提示注入，究竟是模型自身的策略还是外层程序的实现，以及换个模型是否还会这样误判，都没有测。

这个判断在什么条件下会错：如果用户的话和规则冲突时，只有被冲突的那一条规则失效，其余规则照常出现在产出中，那么"整份文件被整体丢弃"这个结论就是错的。

## 参考资料

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic