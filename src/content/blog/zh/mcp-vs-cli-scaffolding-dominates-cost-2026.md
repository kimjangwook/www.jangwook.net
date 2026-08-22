---
title: 把智能体成本报表的分组键从模型换成harness，我以为是MCP的噪音挪了位置
description: 一项覆盖七种智能体scaffolding与五个模型的受控实验发现，主导成本的是harness而非MCP与CLI之争，差距达5.0到28倍。这改变了工程组织给智能体工具做预算、审计与审批的方式。
pubDate: '2026-08-22'
heroImage: ../../../assets/blog/mcp-vs-cli-scaffolding-dominates-cost-2026/hero.png
tags:
  - mcp
  - ai-agent
  - llm-cost
relatedPosts:
  - slug: mcp2cli-token-cost-optimization
    score: 0.94
    reason:
      ko: 이 글이 진단 오류로 지목하는 "MCP 토큰 비용은 인터페이스 문제다"라는 프레이밍의 원본이다. 함께 읽어야 논지 전환이 보인다.
      ja: 本稿が診断の誤りとして名指しする「MCPのトークンコストはインターフェースの問題だ」という枠組みの原典。併読して初めて論の転換が見える。
      en: "The original framing this post names as a misdiagnosis: that MCP token cost is an interface problem. Read together, the shift in position is visible."
      zh: 本文指为诊断错误的那套框架的原始出处，即"MCP的token成本是接口问题"。对照阅读才能看清立场的转变。
  - slug: llm-coding-harness-optimization
    score: 0.91
    reason:
      ko: 하네스 계층 자체를 최적화 대상으로 다룬 글. 이 글의 처방(하네스 단일화)의 실행편에 해당한다.
      ja: ハーネス層そのものを最適化対象として扱った記事。本稿の処方(ハーネス単一化)の実行編に当たる。
      en: Treats the harness layer itself as the optimization target, which is the execution side of this post's prescription to standardize on one harness.
      zh: 把harness层本身当作优化对象的文章，对应本文"统一harness"处方的落地部分。
  - slug: anthropic-code-execution-mcp
    score: 0.85
    reason:
      ko: MCP 도구 호출을 코드 실행으로 우회해 컨텍스트를 줄인 사례. CLI 등가물이 없는 도메인에서 쓸 수 있는 제3의 길이다.
      ja: MCPのツール呼び出しをコード実行で迂回し、コンテキストを削った事例。CLI等価物がない領域で使える第三の道。
      en: A case of routing MCP tool calls through code execution to shrink context, which is the third path for domains with no CLI equivalent.
      zh: 用代码执行绕过MCP工具调用以压缩上下文的案例，是无CLI等价物领域可走的第三条路。
---

我想知道：把MCP服务器从智能体环境里拔掉，账单到底会不会真的降下来。这是我手下两个团队反复去拉的那根杠杆。于是我不再找从业者的经验帖，改去找一次受控测量，结果找到了。2026年8月9日提交到arXiv的一篇论文，把同一个固定的软件任务跑遍七种智能体scaffolding和五个语言模型。答案是：我一直在拉错杠杆。接口几乎没有影响，压在它上面的那层harness把成本拉开了5.0到28倍。

如果智能体那条费用科目挂着你的名字，这件事跟你有关。我的判断是：把成本报表的分组键从模型名改成harness名，并且在harness没被固定下来之前，别再把"MCP比CLI贵N倍"当成有意义的数字。这份控诉也包括我自己写过的东西。几个月前我发过一篇文章，把MCP的token成本框定为接口问题。算术没错，诊断层错了。

## 这项实验究竟测了什么

实验设计刻意收窄。任务只有一个并固定不变：对一个私有的线上git仓库做六项操作。七种scaffolding，五个模型，每一格都真跑。

> The dominant effect was the scaffolding. Two of the seven ship no MCP support at all; they completed every run using only the CLI, which shows that MCP is unnecessary for this class of work, and they were 5.0x to 28x cheaper than the five scaffoldings that do support MCP, comparing CLI runs alone with no MCP server attached anywhere.

> — [The Scaffolding Matters More Than the Interface](https://arxiv.org/abs/2608.08654)

这段比较的形状本身就在说话，值得慢读一遍。它不是MCP运行对CLI运行。它是"根本不会说MCP的scaffolding的纯CLI运行"，对上"会说MCP的scaffolding的纯CLI运行"，两边都没挂任何服务器。贵的那一组，是在做和便宜那一组完全相同的事情时贵出来的。

作者本来想做的那种严格按接口配对的比较，反而垮了：十三对严格配对的MCP对CLI比值散布在0.43倍到29倍之间，两端都有离群点。两端都有。也就是说某些配对里MCP更便宜。谁要是给你报一个"MCP开销是几倍"的单一数字，他报的只是这张散布里的某一格。

harness、任务、验证方式和完整数据集全部开源，这一点已经强过它所替代的那些估算。论文对自己在替代什么讲得很直白：现有的公开估算彼此相差一个数量级以上，而依据只是无法复现的从业者自述。

## 让旧数字失效的是测量方式的改变

这里有两项发现是因果性的，其余是推断，我把它们分开讲。

第一，作者不再相信智能体的自述，而是检查仓库状态来判定任务是否完成。旧共识就死在这一处改动上。如果你按智能体自己说做完了什么来打分，你测的是模型宣布胜利的倾向性，而这个倾向性本身随harness而变。过去被算到接口头上的方差，很大一部分其实是"完成"这件事判定口径的方差。

第二项发现让我真正不安：智能体经常无视分配给它的接口。也就是说，一个不去核验实际触发了哪些工具调用的A/B测试，测的是两条臂以未知比例混在一起的东西。我见过的、在内部流传的每一份MCP与CLI成本对比，包括那些我当时点头认可的，都没有做这层核验。

我说不清的是：为什么支持MCP的scaffolding在跑CLI时反而更贵。听起来合理的解释是，MCP的管道、工具schema的槽位、发现层、审批流，无论服务器挂没挂上，每一轮都要重新常驻进上下文。这个说法说得通，但我手上没有证据。论文没有把成本拆成轮数与每轮输入token，机制仍是敞开的。最极端的那条结果也一样：一个本地运行的270亿参数模型，成本在不同scaffolding之间差了139倍，而它在每一种scaffolding下都完成了任务。论文只报告了离散度，成因未知。

## 三条轴，以及大家正在拧的那一条

研究里有三个变量，按"移动了多少"和"你能控制多少"来排一遍是值得的。

接口，MCP对CLI。论文为之而建的那条轴，几乎没有分离出差异。两条臂的失败频率一模一样，初次运行如此，重复运行也如此。它只在一件事上分开了：失败的代价。MCP运行花掉的钱里有12.9%没换来任何完成的工作，CLI这边是2.2%。失败率相同，每次失败的浪费接近六倍。如果你的仪表盘只跟踪完成率，这个差别对你完全不可见。

scaffolding，那七种harness。主导性的一条。模型与任务固定不变，5.0到28倍。

模型，那五个。主要作为敏感度的放大系数在起作用。越小的模型对harness选择越敏感，270亿那台的139倍就是这么来的。

你真正能控制的顺序是：先scaffolding，其次接口，最后模型。我接触到的大多数团队都在倒着做，一边跟供应商谈费率、一边调提示词，而harness在旁边自由漂移。

## 我认真对待的那条反驳：这个场子本来就为CLI而设

反对这一切最强的论证是：样本选择决定了结论。一个任务。对仓库做六项git操作。git在命令行上打磨了二十年，大概是我们这行CLI成熟度最高的一块地面。证明CLI在git上赢，接近于证明锤子在钉子上赢。

我愿意给这条反驳多于一段的篇幅，因为它不是抬杠，而且弹药是论文自己递过来的。5.0到28倍那个数字根本不是接口比较，它是两组scaffolding之间的比较：不支持MCP的两种，对上支持MCP的五种。分组身份与MCP支持相关，同时也与这七个工具在其他所有方面的构造相关，默认的上下文处理、重试逻辑、系统提示的体量。真正能隔离接口的那组配对比较，结果是0.43倍到29倍，那不是发现，那是耸肩。

所以我让步的地方在这里，我让的是适用范围，不是措辞。有三类场景不该照搬这篇论文的处方。

没有CLI等价物的领域。我那个数据服务团队想向智能体开放的东西，绝大部分都属于这一类。会员记录、档案数据、同意历史。这些调用的授权决策活在文件系统边界之外，去为它们造一个CLI，等于在某个人的笔记本上造一个持有凭证的二进制。这不是成本问题。

没有harness决定权的团队。如果安全评审或采购已经指定了harness，这项研究里的主导变量就不归你动，论文的建议对你只剩一句牢骚。

与"六项git操作"形态不同的任务。跨多服务的长链编排，那些审批往返与交互确认理应落在工具层的工作流。样本之外。在那里，接口选择是一个穿着成本外衣的用户体验决定。

顶住了这条反驳的部分，是完全不依赖git的那部分：在接口效应本该最显眼的任务上，harness仍以大约一个数量级压过接口，而完成判定靠的是产物而非自述。就算你认定git给接口比较做了局，它没给变量排序做局。我的结论站得住，只是收窄了：凡是已有成熟命令行的工作，就统一到纯CLI的harness上。其余场景，MCP留着，但harness照样要先修。

## 真正的架构问题落在哪儿

同一个需求换了身衣服，从我两个团队各来了一次。改版团队想让智能体跑仓库操作、构建、lint。数据服务团队想让智能体读会员与同意数据。我们对两边的条件反射式答案是同一个：搭一台MCP服务器。

论文把这个反射劈开了，但真正告诉我这一刀切在哪里的，是第二份材料。

> The harness guides what an agent tries. The infrastructure controls what an agent can do. Both are necessary; only one is authoritative.

> — [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)

MCP进程、插件、模型指挥的代码，全都跑在harness边界之内。一个被设计成可修改的层，没办法可靠地约束针对它自身的修改。这就把整个问题重新定了框。它从来不是MCP对CLI。它是：某一次工具调用的授权决策，坐在harness里面还是外面。坐在里面，你造出来的就是长得像控制的引导，而且它在审计里会一直被读成控制，直到读不成的那一天。

仓库操作的授权本来就在外面：git凭证、分支保护规则、CI门禁。shell历史就是审计轨迹。在那里加一台MCP服务器，买来的是多一样要维护的东西，外加收窄了harness选项，控制力一分没涨。会员与同意数据这边，授权同样必须落在harness之外，也就是落在API边界和它自己的日志上，而MCP或类似的东西只是传输层。传输不是控制。我此前一直把这两者揉成了一团。

## 我要加的三道门

不是建议。是门。因为这类洞察最典型的失效方式，就是一位资深工程师照做了，而其他人毫不知情。

第一道，harness标准化。每个团队一套harness，版本锁定。这是最无聊的一条，也是整个发现本身。只要harness还在漂，任何成本报表都读不出东西，任何A/B也都不作数，因为每次有人升级工具，你都在重新测量那个主导变量。

第二道，工具注册评审。新增一台MCP服务器，现在需要一页纸回答两个问题。这项工作有没有成熟的CLI？有，驳回，去用它。授权决策在harness外面吗？如果在里面，它得先回到基础设施层，再谈工具定义的事。

第三道，完成判定的核验，这条我预计会痛。我们的CI在汇总智能体运行结果时，采信的是运行自己报告的内容。论文的结论正是在停止这么做的那一刻改变的，同样的弱点原封不动地躺在我们的流水线里，没人查过。完成与否改由产物状态判定：仓库diff、测试通过、schema校验。

除了这三道门，团队仪表盘上加一个指标，并且提到一等公民的位置：烧掉却没换来完成工作的token占比。12.9对2.2这道分界，就是两种接口之间全部的实际差别，而它恰恰是成功率图表最擅长藏起来的东西。我们现在的报表里，没有一行叫"花在失败上的钱"。

## CTO应该从中带走什么

结论不是"别用MCP"。结论是你的成本诊断瞄低了一层。

如果在模型与任务完全相同的前提下换掉scaffolding就能让支出动5到28倍，小型本地模型上动139倍，那么你的智能体预算上最大的一根可用杠杆，既不是跟供应商谈费率，也不是调提示词，而是harness标准化。推论让人不舒服：如果每个团队各选各的harness，你跨团队的成本方差会拉开到个位数倍率，而这份方差会以"模型定价波动"的名义出现在财务报表里。你会在错的那一列里找漏水点。

上市速度指向同一个方向，而这里的证据来自一家没有理由替这个论点说话的供应商：

> Harness design can materially change results: on ARC-AGI-3, retained reasoning and context compaction raised GPT-5.6 Sol's score from 13.3% to 38.3% while reducing output tokens sixfold.

> — [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform)

同一个模型。只改harness。分数接近三倍，输出token只剩六分之一。两个互相独立的来源，一个学术一个商业，同时收敛到几乎没人认领的那一层。

合规这边的结论正好相反，我要把它讲明白，而不是让成本论调独自撑完全篇。把授权决策放进harness，你拿到的是引导，不是控制。可审计的强制执行属于基础设施层。这就是为什么面对敏感系统时，即便更贵，也要保留一条边界清晰的MCP路径，那个成本倍数不构成反对它的理由。

如果明天只改一件事，就把智能体成本报表的分组键从模型名换成harness名。这是一次查询改写。一天之内它就会告诉你，那些你一直算在模型头上的方差，究竟有没有一次真的跟模型有关。

我的立场，直说。凡是已有成熟命令行的地面，git、容器、云工具链、构建链，MCP是额外开销，我不会挂它。凡是授权活在文件系统边界之外的内部系统，留着它，锁死harness，并且把失败的成本单独立预算。

什么能证明我错：把同样的比较放到一个跨多服务的长链编排任务上跑，核验实际触发的工具调用，如果scaffolding的离散度塌到远小于一个数量级，而接口的离散度反而拉开，那么主导变量从头到尾都是任务，是我从git上过度外推了。

这篇论文摇得最狠的不是MCP的名声。是那个习惯：用智能体自己的证词给它打分。我们这行称为"测量"的东西，大多是一次没有控制的运行外加一个故事，而其中有些是我写的。

## 参考资料
- [The Scaffolding Matters More Than the Interface: A Controlled Comparison of MCP and CLI Tool Use Across Seven Agent Scaffoldings, Five Language Models, and One Software Task](https://arxiv.org/abs/2608.08654)
- [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)
- [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform)
