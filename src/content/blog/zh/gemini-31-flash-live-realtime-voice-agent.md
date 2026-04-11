---
title: 用Gemini 3.1 Flash Live构建实时语音Agent — 实际体验报告
description: >-
  分析Google发布的Gemini 3.1 Flash
  Live的实时语音和视觉Agent构建功能。涵盖API结构、工具调用、90+语言支持等，从开发者视角探讨其可能性与局限。
pubDate: '2026-03-28'
heroImage: ../../../assets/blog/gemini-31-flash-live-realtime-voice-agent-hero.jpg
tags:
  - ai
  - google
  - voice-agent
  - realtime
  - gemini
  - api
relatedPosts:
  - slug: data-driven-pm-framework
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: meta-ai-agent-platform-sierra-avocado
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-kpi-ethics
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-persona-analysis
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
draft: true
---

Google AI Studio里出现了一个新的模型名称：`gemini-3.1-flash-live-preview`。我差点就直接滑过去了——"又出了一个"——但打开规格表后停住了。一个接收音频输入、直接以音频响应的模型，而且在实时对话中还支持工具调用（function calling）？这个模型于3月26日发布，以下是我实际使用一天后的感受。

## 发生了什么变化

与前代模型2.5 Flash Native Audio相比，核心变化有三点。

**第一，延迟明显降低。** Google没有公布具体数字，但用了"fewer awkward pauses"来描述。实际使用中，响应开始前的体感延迟确实短了不少。

**第二，对话上下文翻倍。** 输入token达131,072个。将整段会议录音输入后实时提问，这个场景变得现实了。

**第三，工具调用在实时对话中可用。** 在ComplexFuncBench Audio基准测试中获得90.8%的分数。用语音说"告诉我今天首尔的天气"，模型就会调用函数，并以语音返回结果——整个过程在一个流中完成。

## API结构概览

| 项目 | 规格 |
|------|------|
| 模型ID | `gemini-3.1-flash-live-preview` |
| 输入 | 文本、图片、音频、视频 |
| 输出 | 文本、音频 |
| 输入token | 131,072 |
| 输出token | 65,536 |
| Function Calling | 支持 |
| Thinking | 支持 (minimal/low/medium/high) |
| Search Grounding | 支持 |
| 支持语言 | 90+ |

`thinkingLevel`参数很有意思。设为`minimal`可以最小化延迟，调到`high`可以进行复杂推理但响应会变慢。对于语音Agent来说，默认值为`minimal`是合理的。

## 实际使用感受

在Google AI Studio中启用Live API，连接麦克风，就可以直接开始对话。我觉得最令人印象深刻的是：不需要任何额外基础设施，在浏览器中就能快速搭建语音Agent原型。我用中文试了试，识别率相当不错。不过长句偶尔会在中间被截断，背景噪音过滤确实比之前版本有了明显改善。

我接入了一个简单的天气API来测试function calling。语音发出请求后，函数被调用，结果以语音形式返回。关键在于这整个流程在一个WebSocket会话中无缝完成。但异步函数调用尚不支持——如果外部API响应慢，用户只能忍受沉默。

## 从2.5迁移的注意事项

如果你正在从2.5 Flash Native Audio升级，需要注意几个变化：

- 更新模型字符串（`gemini-3.1-flash-live-preview`）
- Thinking配置方式变更（使用`thinkingLevel`参数）
- 服务器事件中可能包含多个content part——需要修改解析逻辑
- 异步function calling仍不支持

## 坦诚的局限性

说实话，有几点让我感到遗憾。

**不支持Structured Output。** 即使是语音Agent，后端往往也希望以JSON格式接收数据。目前只能输出文本+音频，需要额外的后处理。

**不支持缓存。** 实时对话中相同问题可能重复出现，没有缓存意味着成本会不断累积。生产环境中需要在前端自建缓存层。

**Preview阶段的不稳定性。** Rate limit是多少、价格是多少，目前都不明确。投入生产还为时尚早。

**竞争格局。** OpenAI的Realtime API已经提供了类似功能，还有传闻称Anthropic也在准备语音接口。目前还缺乏足够的对比基准来断言Flash Live是最优选择。

## 可以用在哪里

现实中可以立即应用的场景：

- **内部语音FAQ机器人**：销售团队通过语音询问产品规格，即时获得回答。通过function calling连接内部数据库。
- **多语言客户服务**：支持90+种语言，适合全球化服务的一线应对。不过不同语言的质量会有差异。
- **实时会议助手**：利用大容量上下文窗口，在会议中实时进行摘要和行动项提取。

另一方面，医疗咨询或金融交易等高可靠性场景还不适用。Preview模型的幻觉风险不是这些领域可以承受的。

## 总结

Gemini 3.1 Flash Live大幅降低了构建语音Agent的门槛。特别是工具调用集成到实时语音流中，这是与前代的决定性差异。但目前仍处于Preview阶段——价格、稳定性和限制条件尚不明朗，structured output和缓存等生产必备功能也缺失。

我认为这个模型目前是语音AI Agent原型开发中最容易上手的选择。生产环境的部署应该等到GA后再重新评估，但现在就可以在Google AI Studio中打开麦克风，确认一下它的可能性——这完全值得一试。
