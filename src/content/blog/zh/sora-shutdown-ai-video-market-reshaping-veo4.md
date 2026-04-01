---
title: Sora关停与AI视频市场的急剧重塑 — Google Veo 4瞄准空白
description: >-
  OpenAI宣布关停Sora应用。日亏100万美元、用户跌破50万的全貌，以及Google Veo
  4即将发布、Runway·Kling的崛起如何重塑AI视频市场， 从实战工作流角度进行分析。
pubDate: '2026-04-01'
heroImage: ../../../assets/blog/sora-shutdown-ai-video-market-reshaping-veo4-hero.jpg
tags:
  - ai-video
  - sora
  - google-veo
  - content-creation
  - workflow
relatedPosts:
  - slug: mistral-voxtral-tts-open-weight-speech
    score: 0.88
    reason:
      ko: 'AI 비디오의 음성 레이어에 관심이 있다면, 오픈 웨이트 TTS 모델의 현주소와 일본어 지원 한계를 다룬 이 글이 워크플로우 설계에 도움됩니다.'
      ja: 'AI動画の音声レイヤーに興味があれば、オープンウェイトTTSモデルの現状と日本語対応の課題を扱ったこの記事がワークフロー設計に役立ちます。'
      en: 'If you care about the audio layer of AI video, this post on open-weight TTS models and their language support gaps helps with workflow design.'
      zh: '如果你关注AI视频的音频层，这篇关于开源TTS模型现状和日语支持局限的文章对工作流设计很有帮助。'
  - slug: ai-presentation-automation
    score: 0.85
    reason:
      ko: 'Sora의 비디오 자동화와 유사한 맥락에서, AI를 활용한 발표 자료 제작 자동화의 실전 경험과 비용 절감 효과를 비교해볼 수 있습니다.'
      ja: 'Soraの動画自動化と類似した文脈で、AIを活用したプレゼン資料作成の自動化の実践経験とコスト削減効果を比較できます。'
      en: 'In a similar vein to Sora video automation, compare practical experiences and cost savings from AI-powered presentation creation.'
      zh: '在与Sora视频自动化类似的背景下，可以比较AI驱动的演示文稿制作自动化的实践经验和成本节约效果。'
  - slug: gpt-54-computer-use-1m-context-engineering-impact
    score: 0.82
    reason:
      ko: 'Sora 종료와 동시에 발표된 GPT-5.4의 컴퓨터 사용 기능이 OpenAI의 전략적 피벗을 이해하는 데 핵심적인 맥락을 제공합니다.'
      ja: 'Sora終了と同時に発表されたGPT-5.4のコンピュータ操作機能が、OpenAIの戦略的ピボットを理解する上で重要な文脈を提供します。'
      en: 'GPT-5.4 computer use, announced alongside Sora shutdown, provides crucial context for understanding OpenAI strategic pivot.'
      zh: '与Sora关停同时发布的GPT-5.4计算机使用功能，为理解OpenAI的战略转向提供了关键背景。'
  - slug: kitten-tts-v08-tiny-sota
    score: 0.78
    reason:
      ko: 'AI 비디오 파이프라인에서 TTS는 필수 컴포넌트입니다. 25MB 미만 초소형 TTS 모델의 가능성을 다룬 이 글이 경량 워크플로우 구축에 참고가 됩니다.'
      ja: 'AI動画パイプラインでTTSは必須コンポーネントです。25MB未満の超小型TTSモデルの可能性を扱ったこの記事が軽量ワークフロー構築の参考になります。'
      en: 'TTS is essential in AI video pipelines. This post on sub-25MB SOTA TTS models is relevant for building lightweight video workflows.'
      zh: 'TTS是AI视频管道中的必要组件。这篇关于25MB以下SOTA TTS模型的文章对构建轻量级工作流很有参考价值。'
  - slug: gemini-31-flash-live-realtime-voice-agent
    score: 0.76
    reason:
      ko: 'Veo 4와 같은 Google AI 생태계의 실시간 음성 에이전트 기능을 다뤘는데, Google의 멀티모달 AI 전략의 전체 그림을 이해하는 데 도움됩니다.'
      ja: 'Veo 4と同じGoogleAIエコシステムのリアルタイム音声エージェント機能を扱っており、Googleのマルチモーダル AI戦略の全体像を理解するのに役立ちます。'
      en: 'Covers real-time voice agents in the same Google AI ecosystem as Veo 4, helping you understand the full picture of Google multimodal AI strategy.'
      zh: '介绍了与Veo 4同属Google AI生态的实时语音代理功能，有助于理解Google多模态AI战略的全貌。'
---

OpenAI将于4月26日关停Sora应用。API将维持到9月24日，但这实际上已是撤退宣言。

说实话，看到这个消息我的第一反应是"果然如此"。Sora首次公开时的demo视频确实令人震惊，但实际使用起来完全是另一回事。生成时间长，要获得满意的结果需要太多试错。更关键的是，月费$20的订阅很难生成令人满意质量的视频。

## 日亏100万美元的真相

据TechCrunch报道，Sora在高峰期付费用户也未超过50万。日运营成本约100万美元，仅GPU基础设施成本就难以为继。

有趣的是OpenAI的战略转向。他们从消费者视频生成领域撤出，转而专注于企业级编程代理（Codex）。配合GPT-5.4的发布，向"平台型公司"的转型正在加速。

我个人认为这是合理的判断。AI视频生成距离成为独立"产品"还为时尚早。任何人都能用一行文字制作电影级视频的愿景很吸引人，但现实是：提示词工程30分钟、生成5分钟、修改又30分钟。

## Google Veo 4瞄准空白

时机很微妙。就在Sora宣布关停之后，有传言称Google DeepMind将在I/O 2026前后发布Veo 4。NotebookLM的Video Overview功能已搭载Veo 3，质量相当不错。

当前AI视频生成工具的格局如下：

| 工具 | 状态 | 优势 | 劣势 |
|------|------|------|------|
| Sora | 4/26应用关停，9/24 API关停 | 高视频质量 | 生成慢、成本高 |
| Google Veo 3/4 | Veo 3运行中，Veo 4即将发布 | Google生态整合、NotebookLM联动 | 尚无独立应用 |
| Runway Gen-4 | 运行中 | 编辑器整合、精细控制 | 价格昂贵 |
| Kling 2.0 | 运行中 | 性价比高、生成快 | 质量波动大 |
| Pika 2.5 | 运行中 | 易用性 | 长视频能力弱 |

## "产品 vs 功能" — Sora失败的结构性原因

很难简单地用"技术不够"来解释Sora的失败。技术本身令人印象深刻。问题在于商业模式。

AI视频生成作为**集成到现有工作流中的功能**，其价值远大于作为独立产品。NotebookLM将Video Overview作为"功能"嵌入，Runway在视频编辑工具中包含AI生成，都是这个方向的例证。

而Sora则是将"文本→视频"这个单一功能作为独立应用提供。这就像只为"AI图像生成"构建一个独立应用一样——对比DALL-E通过集成到ChatGPT中获得成功。Sora没有深度集成到ChatGPT中而是保持独立，最终在用户留存上失败了。

不过这种分析也有局限。Runway同样是独立应用但运营良好。差别在于Runway将AI融入了视频编辑这个明确的工作流中。

## 从Sora迁移的开发者/创作者工作流

如果你在使用Sora API，需要在9月前完成迁移。我推荐的替代方案因用途而异：

**技术内容制作（博客→视频）**
- NotebookLM Video Overview + Gemini TTS自动生成
- Remotion添加品牌片头/片尾
- 这个组合不需要专门的视频生成AI也能产出相当不错的成果

**营销/广告视频**
- Runway Gen-4目前最稳定
- 需要精细帧控制时的唯一选择

**社交媒体短视频**
- Kling 2.0性价比最高
- 15秒以下的片段质量完全足够

```bash
# NotebookLM + Remotion 工作流示例
# 1. 通过NotebookLM生成视频
nlm studio_create --notebook-id $NB_ID --artifact-type video

# 2. 等待生成完成
nlm studio_status --notebook-id $NB_ID --artifact-id $ART_ID

# 3. 下载后用Remotion合成片头/片尾
nlm download_artifact --notebook-id $NB_ID --artifact-id $ART_ID
npx remotion render src/index.ts MainVideo --props='{"videoPath":"./downloaded.mp4"}'
```

## 未来6个月的看点

坦率地说，AI视频市场仍处于早期阶段，预测赢家为时尚早。但有几个确定的趋势：

1. **集成胜于独立**：嵌入现有平台的AI视频功能比独立应用更能存活
2. **实时生成是关键**：等5分钟才能得到一个视频的体验难以实现大众化
3. **Google的有利位置**：YouTube + NotebookLM + Veo的垂直整合非常强大

我并不期望Veo 4会成为颠覆者。但Google显然处于最能快速填补Sora空白的位置。特别是NotebookLM已经提供Video Overview，这意味着Google无需发布独立应用就能自然地吸收现有用户。

如果你正在生产环境中使用AI视频生成工具，现在的明智之举是**标准化输出格式，构建易于更换工具的管道**，而不是把所有筹码押在某个特定供应商上。正如Sora的案例所示，没人知道这个市场中哪个工具能活到明年。
