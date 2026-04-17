---
title: Anthropic悄悄降低Claude性能的争议——权力用户反弹的真实背景
description: >-
  2026年3月，Anthropic悄悄将Claude默认effort调低为"medium"。本文分析权力用户反弹、价格上涨争议，以及这一事件揭示的AI服务信任危机。
pubDate: '2026-04-17'
heroImage: >-
  ../../../assets/blog/anthropic-claude-performance-decline-controversy-april-2026-hero.jpg
tags:
  - anthropic
  - claude
  - ai-performance
  - llm
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.94
    reason:
      ko: Anthropic이 Mythos 개발에 컴퓨트를 집중하면서 기존 Claude 성능이 조정됐다는 추측이 있다. Mythos 미리보기가 궁금하다면 이 글이 그 맥락을 제공한다.
      ja: AnthropicがMythos開発にコンピュートを集中する一方、既存Claudeの性能が調整されたという推測がある。Mythosのプレビューに興味があれば、このポストがその背景を理解する助けになる。
      en: There's speculation Anthropic shifted compute toward Mythos development while quietly adjusting existing Claude performance. If you're curious about Mythos, this post provides useful context for that theory.
      zh: 有猜测称Anthropic将算力集中于Mythos开发，同时悄悄调整了现有Claude的性能。如果你对Mythos感兴趣，这篇文章为该理论提供了有用的背景。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: 이 글에서 다룬 effort 레벨 변경이 실제 Claude Code 사용량에 어떤 영향을 주는지, 사용량 분석 글에서 더 자세히 파악할 수 있다.
      ja: このポストで扱ったeffortレベル変更が実際のClaude Code使用量にどう影響するか、使用量分析ポストでより詳しく把握できる。
      en: The effort level change discussed in this post had direct effects on Claude Code token usage. The usage analysis post breaks down exactly what that shift looked like in practice.
      zh: 这篇文章讨论的effort级别变更对Claude Code实际使用量产生了直接影响。使用量分析文章详细分析了这种变化在实践中的具体表现。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: AI 코딩 도구의 실제 사용 패턴과 한계를 정량적으로 분석한 글로, Claude 성능 논란과 비교해 읽으면 AI 코딩 도구 업계 전체 흐름을 파악하는 데 도움이 된다.
      ja: AIコーディングツールの実際の使用パターンと限界を定量的に分析したポストで、Claude性能論争と比較して読むとAIコーディングツール業界全体の流れを把握するのに役立つ。
      en: This Greptile report quantifies how developers actually use AI coding tools — the limitations it documents help contextualize why the effort level change hit power users harder than casual users.
      zh: 这份Greptile报告定量分析了开发者实际使用AI编码工具的方式——它记录的局限性有助于理解为什么effort级别变更对重度用户的影响比普通用户更大。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: effort 레벨을 명시적으로 설정하는 방법이 궁금하다면, Claude Opus 4.6 설정 가이드에서 구체적인 파라미터 설정 방법을 확인할 수 있다.
      ja: effortレベルを明示的に設定する方法が気になるなら、Claude Opus 4.6セットアップガイドで具体的なパラメータ設定方法を確認できる。
      en: If you want to pin effort levels explicitly as this post recommends, the Claude Opus 4.6 setup guide shows exactly which parameters to configure and how.
      zh: 如果你想按照本文建议明确设置effort级别，Claude Opus 4.6设置指南详细说明了需要配置哪些参数以及如何配置。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: 단일 공급자 의존 리스크를 줄이는 방법으로 로컬 LLM 활용이 있다. Gemma 4로 오프라인 에이전트를 구축하는 방법이 대안적 선택지를 보여준다.
      ja: 単一プロバイダー依存リスクを減らす方法としてローカルLLM活用がある。Gemma 4でオフラインエージェントを構築する方法が代替的な選択肢を示している。
      en: Reducing single-provider dependency is one of this post's core recommendations. Building offline agents with Gemma 4 is a concrete example of what that alternative looks like in practice.
      zh: 减少单一提供商依赖是本文的核心建议之一。使用Gemma 4构建离线代理是该替代方案在实践中的具体示例。
---

"为什么Claude突然变得奇怪了？"

3月中旬起，这样的声音在AI开发者社区频繁出现。Reddit的r/ClaudeAI、Hacker News和X上堆积了类似的抱怨。有报告称模型忽略指令，或在以前能够处理的复杂工作流中出现更多错误。最初大多数人以为是自己的提示词写得不好而置之不理。我也是其中之一。

这个博客由Claude自动化运行——研究、文章写作、内部链接插入、多语言翻译、构建、部署。3月中旬起，我明显发现跳过指令、翻译质量突然下滑、内部链接条件遗漏的情况增多。每次都重新查看SKILL.md，修改提示词结构。重新更清晰地写了指令，减少了文件量，整理了上下文。没有效果。

4月14日，Fortune发表了关于这一现象的报道。两天后，Axios发布了补充分析。VentureBeat也以"Anthropic在nerfing Claude吗？"为题加入讨论。Gizmodo则用了相当直接的标题："Anthropic Is Jacking Up the Price for Power Users Amid Complaints Its Model Is Getting Worse"。这时拼图才拼上了。

不是我的提示词问题。你的可能也不是。

## 3月，Anthropic悄悄改了什么

3月初，Anthropic悄悄将Claude的默认"effort"级别降低了。原来的默认值是"high effort"，改为了"medium effort"。

公开承认这一事实的是负责Claude Code的Anthropic高管Boris Cherny。他表示，这一变更是因为"用户反馈Claude使用了过多token"。他补充说，这一变更"已在changelog中公开，并通过对话框显示给了用户"，是"明显且明确的变更，而非偷偷摸摸"。

这个解释在技术上可能是正确的。但许多用户错过了那个对话框，或者根本没有阅读changelog。这一事实本身就意味着沟通的失败。"我们公开了"与"用户实际知晓了"是两回事。

让我们先梳理一下effort级别是什么。Claude有一个内部参数，控制生成响应时"思考"的深度。<strong>High effort使用更多计算，更仔细地遵循指令，更好地处理复杂请求。</strong>Medium effort更快、更便宜，但更容易简化或跳过指令。这个参数可以由使用API的开发者显式设置。问题在于默认值变了。没有明确指定"high effort"的人被自动降级到了medium。

有一个重要的关键点。从拥有企业合同的公司客户角度考虑：数十名员工在工作中使用Claude，每个团队都建立了不同的工作流。在这种情况下，期望所有人都注意到API默认值的变化并调整设置是不现实的。用户没有亲自修改的默认值，理应"保持不变"——这是正常的信任基础。

从这次变更有多悄无声息来看，在Cherny直接在Reddit上回复这个问题之前，官方渠道并没有主动通知"Anthropic进行了什么变更"的行动。直到用户提出问题、媒体报道之后，高管才亲自出来解释。这个顺序给许多人留下了"偷偷修改"的印象。

## "Medium Effort"在实际工作流中意味着什么

可能听起来很抽象，让我举个具体例子。

假设你让Claude Code处理复杂的重构任务。在high effort模式下，它会仔细追踪文件间的依赖关系，把握变更的影响范围后再进行修改，提前检查类型错误是否会传播到多个模块，变更是否会破坏测试。Medium effort模式呢？"大概改这个文件就够了吧"这样的判断增多了。运行测试才能发现的bug就此产生。

我也有亲身体验。这个博客的自动化工作流有相当复杂的指令体系。文章写作规则、内部链接插入标准、各语言翻译方式分布在多个文件中。3月中旬之后，这些指令被部分忽略的频率增加了。"最少2个内部链接"的条件被遗漏，翻译感觉机械化，文章长度突然缩短。当时我的判断是"提示词是不是太长了，后半部分没有被好好读到？"现在回想起来，与3月初effort级别变更的时机完全吻合。

还有一个有趣的悖论。部分权力用户报告称，在此期间token消耗反而增加了4倍到10倍。原因很简单：<strong>性能下降导致回答不准确，重试增多。</strong>如果模型没有正确遵循指令，用户就必须再次请求，这个过程消耗了更多token。为了"节省token"而降低effort，反而出现了相反结果的案例。The Register还另外发表了"Anthropic admits Claude Code quotas running out too fast"一文。Anthropic方面也承认"远比预期更快达到使用上限是团队的首要问题"。

在自动化管道中检测这种异常行为很困难。不是单次请求中出现明显错误，而是长时间内输出质量逐渐下降的形式出现。快速发现这一变化的人，大多数情况下都是有定期对输出进行基准测试或拥有质量评估自动化的人。

Claude Code开发者之间分享了具体案例。多文件重构中跳过了以前不会遗漏的依赖更新、不更新测试文件只改源码、将错误处理代码简化掉等情况被报告出来。一位用户表达道："以前自动处理的边缘情况，现在必须自己明确指定了。"给人模型不再"主动"的印象。

这种差异在简单任务中几乎感觉不到。在拥有复杂指令体系的工作流、经过多个步骤的自动化管道以及跨越数十个文件的任务中才会显现。换言之，支付最多费用、最复杂地使用Claude的人受到了最大的打击。

## 权力用户愤怒的原因——透明度问题

比技术变更本身让更多人愤怒的是透明度问题。

使用LLM服务意味着在某种程度上接受"黑盒"合约。即使不知道模型确切如何工作，也要在维持预期性能水平的前提下支付订阅费、建立工作流。培训团队、整合工具、设计流程。

Anthropic在没有通知的情况下改变了这个预期水平。不是用户自己设置的。公司降低了默认值，将这一事实埋在了changelog里。

正如我在[Claude Code使用量分析](/zh/blog/zh/claude-code-insights-usage-analysis)中整理的那样，Claude Code越是整合到生产工作流中，模型行为的可预测性就越是关键要素。如果昨天和今天的结果不同，调试是我的代码问题还是模型变更就需要花费时间。对于自动化管道来说，这个成本更大。

Boris Cherny的反驳产生了反效果。在他说"obvious and explicit"的时候，已经有数百名用户公开表示"不知道"。从公司的角度来看，"已经公开"这一事实可能很重要，但它是否真正传达给了用户才是更重要的问题。这是两回事。

许多企业客户不会每周阅读changelog。他们相信"调用API会像以前一样正常工作"的隐性约定。这次变更打破了这个约定。更准确地说，这次让许多人意识到：这个约定从一开始就不存在。

社区反应中出现了一个有趣的模式。许多人讲述了"发现这次变化的方法"，大多数情况下，都是先发现输出结果有问题，然后回溯找原因。"让它做代码审查，感觉比以前肤浅了"、"让它总结复杂文档，重要内容被遗漏了"这样的经历反复出现，之后才通过搜索了解到effort级别变更的事实。用户几乎没有追踪模型行为变化的工具，这一次再次得到了确认。

## 价格上涨火上浇油

时机选得最糟糕。

就在性能下降争议最激烈的4月16日，Anthropic宣布了企业订阅政策的变更。原来是每用户每月最高200美元的固定费用，改为"每用户每月20美元基本费 + 基于计算使用量的费用"。

The Register将此表述为"Anthropic ejects bundled tokens from enterprise seat deal"。取消了捆绑token，转换为按量计费。对于使用量可预测且有限的团队来说可能反而更便宜，但对于重度用户或大规模运营自动化管道的团队来说，费用可能大幅上涨。

性能降低了，费用体系却变得更复杂，大规模使用时可能更贵。Gizmodo的标题准确地表达了许多用户的感受："Anthropic Is Jacking Up the Price for Power Users Amid Complaints Its Model Is Getting Worse。"

当然，我也能理解Anthropic的立场。固定费用结构对重度用户绝对有利，从服务提供者的角度来看可能无法持续。向按量计费转变本身可能是合理的商业决策。按使用量付费的结构从长期来看比难以预测使用量的固定费用模式更公平，这样的逻辑也有道理。问题在于顺序。在信任已经动摇的时期宣布价格上涨，其合理性就无法得到正确传达。

如果时机不同会怎样呢？充分公告effort级别变更，反映用户反馈后再改善默认值，然后单独宣布价格政策变更，会怎样？这三个问题就不会同时爆发了。每个决定都有机会被单独评估。现在三件事被捆绑在一起，被解读为"Anthropic在退步"的框架。

## 计算资源不足说与AI服务的结构性压力

这场争议还有一个更大的背景。

LLM基础设施业务是烧钱的生意。Anthropic、OpenAI、Google DeepMind都在向数据中心容量的确保投入数十亿美元。据Fortune的报道，有分析认为Anthropic相比竞争对手数据中心的确保规模相对较小。这一点是我无法直接确认的内容，也不是官方公告，而是分析。Anthropic的官方财务公示和基础设施投资详情是非公开的。不过，Fortune和Axios这样的媒体将这一背景一起报道，值得关注。不是单纯的社区推测，而是基于行业采访的分析。

由此产生的推测是"Anthropic因计算资源不足而调整了effort级别"。内部向Mythos等下一代模型开发集中投入算力，通过降低现有服务的effort级别来削减运营成本——这是一种解释。Anthropic没有正式否认这一推测。

我无法确认这一点。但"因成本压力而悄悄调整服务质量"在这个行业几乎是不被讨论的领域，这是事实。

在撰写[Claude Code的5种智能体工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)时也有所体会，智能体系统构建得越复杂，模型的细微性能变化对整个工作流的影响就呈指数级增长。将多层orchestrator-subagent结构叠加，一个effort级别的变化就可能降低整个管道的可靠性。这次许多Claude Code用户亲身证实了这一点。

用户期待"模型升级会越来越好"。实际上，成本压力可能导致服务质量发生变化。这两个事实可以同时成立。新版本模型可能变得更强大，同时，当前运行版本的服务质量也可能因成本原因而被调整。版本没有升级，只是基本行为方式悄悄改变——AI服务行业如何应对这个结构性差距，将成为决定这个行业未来可信度的关键变量。

## 开发者现在应该做的事

从这次事件中提取实际教训，有三点。

第一，<strong>显式设置effort级别。</strong>如果直接调用Claude API，不要依赖默认值，通过参数明确指定effort。例如，在Claude Code的设置文件中，可以通过`default-model-settings`中的`"thinking": { "type": "enabled", "budget_tokens": 10000 }`等方式明确固定处理深度。这次确认了默认值随时可能改变。越是重要的工作流，就越应该显式固定所有参数。

第二，<strong>定期测量输出质量。</strong>要在LLM服务质量悄悄变化时快速检测，需要有基准点。定期自动运行关键任务样本，与之前的输出进行比较，仅凭简单的基准测试就能比这次早得多地发现问题。不需要完美的评估系统。例如，只需一个自动检查"指定条件是否都反映在输出中"的脚本，这次争议中就能提前两周发现异常。目的是变化检测，所以不需要建立过度复杂的系统。

第三，<strong>认真考虑分散服务商依赖度。</strong>将所有工作流依赖于单一LLM提供商，该提供商的价格政策或性能调整就直接成为我的基础设施风险。目前许多团队还在用"Claude或OpenAI"单一化运营。这短期内很方便，但长期来看既没有议价能力，也没有风险对冲。不需要所有都双重化，但最好将至少一个关键工作流设计成也能在其他模型上运行。像这次主要提供商调整性能或改变价格时，有替代方案在谈判中是有利的，在故障应对中也是有利的。使用LiteLLM这样的抽象层可以大幅降低切换提供商的成本。

## 我的立场：没有透明度，就没有信任

我对这一事件有明确的立场。

<strong>比Anthropic的技术决策本身，沟通这一决策的方式更有问题。</strong>

理解为了响应用户反馈减少token使用量而采取的理由。降低effort级别可以减少token，这也是对的。很难认为这个决定是出于恶意。但当默认值改变时，尤其是直接影响性能的默认值改变时，应该通过电子邮件通知所有用户，或通过产品内横幅明确告知。仅凭changelog一行作为全部沟通，达不到标准。降低现有用户期望的变更，无论出于何种理由，都需要积极的通知。Anthropic可能会在这次事件后重新设立这个标准。

更根本的问题在别处。AI服务提供商可以在用户不知情的情况下调整性能与成本之间的权衡，这个结构本身的问题。这不只是Anthropic的问题。OpenAI和Google也都有类似的结构。我们在深度依赖单一提供商的AI基础设施上构建应用，即使该提供商悄悄改变服务级别，也几乎没有检测和应对的手段。

这次争议会悄然平息。Anthropic只需更明确地提供effort级别设置选项，或强化默认值变更时的用户通知政策即可。据报道，已经宣布了一些改进措施。几个月后，这次事件大概会作为"曾经有过争议"的注脚被记住。

但如果你是构建AI基础设施的人，应该将这次事件视为一个信号。在LLM API之上构建生产系统已经成为日常。随之而来的责任也正在成为日常。自行监控服务商SLA正在从可选项变为必选项。

"AI越来越好"的叙事是正确的。同时，"正在使用的AI可能悄悄改变"也是正确的。这两个故事可以共存。随着LLM服务成为基础设施，对基础设施适用的管理原则——变化检测、SLA监控、服务商多样化——也应该同样适用。这次争议证明了这两个故事的共存。
