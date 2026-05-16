---
title: "Claude Managed AgentsのDreaming・Outcomes・Orchestration — エージェントが眠りながら自己改善する仕組みの分析"
description: "2026年5月Code with Claude SFで発表されたDreaming・Outcomes・Multiagent Orchestrationの技術構造を分析する。Harvey 6倍数値の文脈、LLM-as-judge製品化、自己改善ループのガバナンスリスクまで。"
pubDate: '2026-05-16'
heroImage: '../../../assets/blog/claude-managed-agents-dreaming-outcomes-code-with-claude-2026-hero.png'
tags: ['Claude', 'AIエージェント', 'Anthropic', 'Managed Agents']
relatedPosts:
  - slug: 'claude-managed-agents-production-deployment-guide'
    score: 0.93
    reason:
      ko: '4월에 Managed Agents 기본 배포를 다뤘다면, 이 글은 그 위에 추가된 Dreaming·Outcomes·Orchestration이 기술적으로 어떻게 작동하는지를 설명한다.'
      ja: '4月にManaged Agentsの基本デプロイを扱ったなら、この記事はその上に追加されたDreaming・Outcomes・Orchestrationが技術的にどう動くかを解説する。'
      en: 'If you set up Managed Agents in April, this post explains how Dreaming, Outcomes, and Orchestration technically layer on top of that foundation.'
      zh: '如果您在4月部署了Managed Agents基础，这篇文章解释了Dreaming、Outcomes和Orchestration如何在技术层面叠加其上。'
  - slug: 'anthropic-claude-opus-4-7-managed-agents-2026'
    score: 0.88
    reason:
      ko: '4월 Opus 4.7 + Managed Agents 비용 분석에 이어, 5월 Code with Claude에서 발표된 에이전트 인프라 확장을 함께 읽으면 Anthropic 에이전트 전략의 흐름이 보인다.'
      ja: '4月のOpus 4.7 + Managed Agentsコスト分析に続き、5月Code with Claudeで発表されたエージェントインフラ拡張と合わせて読むとAnthropicのエージェント戦略の流れが見える。'
      en: 'Reading the April Opus 4.7 cost analysis alongside the May agent infrastructure expansion reveals how Anthropic is building toward a complete managed AI stack.'
      zh: '将4月Opus 4.7成本分析与5月Code with Claude的代理基础设施扩展结合阅读，可以看出Anthropic代理策略的演进路径。'
  - slug: 'context-engineering-production-ai-agents'
    score: 0.82
    reason:
      ko: 'Dreaming이 메모리 스토어를 어떻게 재구성하는지 이해하려면, 에이전트의 컨텍스트 관리 원리를 먼저 파악하면 도움이 된다.'
      ja: 'Dreamingがメモリストアをどう再構成するかを理解するには、エージェントのコンテキスト管理の原理を先に把握しておくと理解が深まる。'
      en: 'To understand how Dreaming reconstructs memory stores, grounding yourself in production context engineering patterns first makes the mechanism click.'
      zh: '理解Dreaming如何重构内存存储，先了解生产环境中代理的上下文管理原理会很有帮助。'
  - slug: 'ai-agent-cost-reality'
    score: 0.77
    reason:
      ko: 'Dreaming과 Outcomes가 자동화 사이클을 늘릴수록 에이전트 운용 비용도 복잡해진다. 비용 현실 분석을 함께 읽으면 도입 판단에 도움이 된다.'
      ja: 'DreamingとOutcomesが自動化サイクルを増やすほどエージェント運用コストも複雑になる。コスト現実分析と合わせて読むと導入判断の参考になる。'
      en: 'As Dreaming and Outcomes add more automated cycles, agent cost complexity grows. Reading the cost reality analysis alongside helps frame adoption decisions.'
      zh: 'Dreaming和Outcomes增加的自动化循环越多，代理运营成本就越复杂。结合成本现实分析阅读有助于做出引入决策。'
  - slug: 'hindsight-mcp-agent-memory-learning'
    score: 0.73
    reason:
      ko: 'Hindsight MCP가 추구한 "경험 기반 메모리 갱신" 철학과 Dreaming의 접근이 겹친다. 두 구현을 비교하면 에이전트 메모리 설계의 선택지가 더 넓게 보인다.'
      ja: 'Hindsight MCPが追求した「経験ベースのメモリ更新」の哲学とDreamingのアプローチが重なる。二つの実装を比較するとエージェントメモリ設計の選択肢がより広く見える。'
      en: 'The "experience-based memory refresh" philosophy behind Hindsight MCP overlaps with Dreaming. Comparing both implementations broadens your view of agent memory design choices.'
      zh: 'Hindsight MCP追求的"基于经验的内存更新"理念与Dreaming的方法有重叠。比较两种实现方式可以更广泛地看到代理内存设计的选择。'
---

5月6日、サンフランシスコのCode with Claudeカンファレンスで、AnthropicがManaged Agentsに三つの新機能を発表したとき、私が最初に思ったのはこの問いだった。「このエージェントは、私が退勤した後、何を学んでいるのだろう？」

Dreaming、Outcomes、Multiagent Orchestration。名前だけ見るとマーケティング的な印象があるが、構造を掘り下げると具体的なエンジニアリングの決定が込められている。特にDreamingについては、初めて聞く人が誤解しやすいポイントがある。「エージェントが学習する」という言い方は正しいが、モデルが改善するわけではない。変わるのはメモリだ。この区別が実際に重要になる。

APIキーがないためDreamingを直接実行することはできなかった。Research Preview段階でもある。この記事は公式ドキュメント、Anthropicブログ、カンファレンス発表資料、そして初期パイロット事例をもとに、三つの機能の構造を分析する。

## Code with Claude 2026 — 新モデルなし、エージェントインフラのみ

5月6日のSFキーノートで最も印象的だったのは、新モデルの発表がなかった点だ。Anthropicはモデル競争ではなく、エージェント実行インフラに注力した。

主な発表内容：

- **Dreaming**：エージェントメモリの自動更新（Research Preview）
- **Outcomes**：成功基準に基づく自己評価・反復（Public Beta）
- **Multiagent Orchestration**：リード-サブエージェント並列実行（Public Beta）
- 使用制限を2倍に拡大（Pro、Max、Team、Enterprise）
- ピーク時間帯のスロットリング廃止（Pro、Max）
- <strong>Claude Security</strong>：コード脆弱性スキャナー（Enterprise、Opus 4.7ベース）
- Remote Agents：スマートフォンでノートPCを制御
- SpaceX Project Colossusパートナーシップ（220,000台以上のGPU）

これらの発表は、昨年に個人開発者向けプレビューとして始まったManaged Agentsが、エンタープライズ規模のワークフローへと進化していることを示している。実際にNotion、Rakuten、Sentry、Harveyがすでにプロダクションで適用中だとAnthropicは述べた。

カンファレンスはSFに続き、ロンドン（5月19日）、東京（6月10日）でも開催される予定だ。

## Dreaming — 眠りながら整理するメモリシステム

AnthropicがDreamingを説明する際に使った比喩が、海馬（hippocampus）のメモリ統合だ。人間が睡眠中に日中の経験を整理し、重要な情報を長期記憶へ移す過程と似ているという。

Dreamingが技術的に行うプロセス：

1. 過去のセッション（最大100件）を確認する
2. 繰り返しのミス、収束したワークフロー、チームの好みなどのパターンを抽出する
3. 既存のメモリストアから重複・古い項目を削除し、新しい項目を追加する
4. 元のセッション記録はそのまま保持する

<strong>重要な点：モデルの重みは変更されない。</strong> Dreamingはファインチューニングではない。変わるのは、エージェントが次のセッション開始時に参照するメモリストアだ。Anthropicも明示的に述べている。"Dreaming does not modify the underlying model weights."

Harvey（法律AI企業）のパイロット結果がよく引用される。タスク完了率が約6倍向上したという。具体的には、Dreaming有効化後、エージェントがファイル形式の特性やツール固有のパターンをセッション間で記憶するようになり、完了率が上昇したとのことだ。

この数値は興味深いが、文脈が重要だと私は思う。Harveyは法律文書処理専門のAI企業だ。同じ種類の契約書、同じツール、反復的なレビューワークフロー — パターンが明確な環境だ。この条件下でメモリ学習がうまく機能するのは合理的だ。しかし、リクエストが毎回異なる汎用エージェント環境で「6倍」を期待するのは難しい。

DreamingはまだResearch Previewのため、公式ドキュメントと初期ユーザーレポートに基づいてのみ分析できる。直接テストしたかのように書くつもりはない。

## Outcomes — LLM-as-judgeパターンの製品化

Outcomesは正直、新しい概念ではない。LLM-as-judge、つまり別のモデルインスタンスがエージェントの出力を評価するパターンは、すでに多くのエージェントシステムで使われている。AnthropicがこれをManaged Agentsに統合した方法が注目ポイントだ。

Outcomesの動作方式：

```
1. 開発者が成功基準（rubric）を作成
   例：「契約条項が法的要件A、B、Cをすべて満たすこと」

2. Writer エージェントが出力を生成

3. Graderが別のコンテキストウィンドウでrubricを基準に評価
   - Writerの推論プロセスに影響されない独立した評価
   - 基準ごとの合否判定を出力

4. 不合格項目があれば → Graderが修正指示をWriterに送信

5. Writerが修正して再試行

6. すべての基準をパス → 結果を返す
```

核心設計ポイントは、graderが<strong>完全に別のコンテキストウィンドウ</strong>で実行されることだ。Writerの推論プロセスに汚染されず独立して評価する。単に「自己レビュー」をさせるのとは異なる理由がここにある。同じコンテキスト内でself-reviewをすると、Writerが自分の結果物に対して偏った評価を下す可能性が高い。

Anthropicの内部ベンチマーク結果：Word文書生成品質8.4%向上、PowerPointスライド10.1%向上。

実際の導入では、rubricの設計が核心作業となる。緩すぎるrubricではOutcomesの効果がなく、厳しすぎるとエージェントが無限修正ループに陥る可能性がある。

4月に取り上げた[Managed Agents基本デプロイガイド](/ja/blog/ja/claude-managed-agents-production-deployment-guide)でAPIチェーン設定とセッションあたり$0.08のコスト構造を分析したが、Outcomesを追加するとgrader実行コストが加わる構造だ。実際のコストはrubricの複雑さと再試行回数によって変わる。

## Multiagent Orchestration — 並列処理の標準化

複雑なタスクを一つのエージェントが順次処理するよりも、専門エージェント複数が並列で分担する方が速く品質も高いことは知られた事実だ。[Claude Codeのエージェントワークフロー5パターン](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)でもこの構造を取り上げたことがある。

Multiagent Orchestrationが追加するもの：

- リードエージェントが複雑なタスクを分解し、サブエージェントに委任
- サブエージェントは最大20個まで並列実行
- 各サブエージェントは<strong>独自のモデル、プロンプト、ツール</strong>を組み合わせ可能
- 共有ファイルシステムで成果物を共有
- Claude Consoleで全体フローを追跡可能

```mermaid
graph TD
    A["複雑なタスク"] --> B["リードエージェント\nタスク分解 & 委任"]
    
    subgraph 並列実行 ["並列実行 (最大20個)"]
        B --> C["サブエージェント1\nモデルA + ツールX"]
        B --> D["サブエージェント2\nモデルB + ツールY"]
        B --> E["サブエージェントN\nモデルC + ツールZ"]
    end
    
    C --> F["共有ファイルシステム"]
    D --> F
    E --> F
    F --> G["リードエージェント\n結果統合 & 最終出力"]
```

各サブエージェントが独自のモデルとツールを持てる点が重要だ。例えば、コード生成サブエージェントはClaude Opus 4.7を、高速検証サブエージェントはClaude Haiku 4.5を使うように構成できる。パフォーマンスとコストを同時に最適化できる構成だ。

## 三つの機能が一緒に作る自己改善ループ

Dreaming、Outcomes、Orchestrationをそれぞれ独立して見ると、別々の機能のように見える。一緒に動く方式を見ると構造が見えてくる。

```mermaid
graph TD
    subgraph Cycle ["自己改善サイクル"]
        A["エージェント実行\n(Orchestration: 並列処理)"] --> B["出力生成"]
        B --> C["Outcomes評価\n(Grader: 別コンテキスト)"]
        C -->|"基準未達"| D["修正指示 + 再試行"]
        D --> B
        C -->|"基準クリア"| E["最終出力 & セッション記録"]
    end
    
    E --> F["Dreaming\n(セッション間パターン抽出)"]
    F --> G["メモリストア更新"]
    G --> A
```

Observe：エージェントがタスクを実行する間、セッションデータが蓄積される。

Evaluate：Outcomesのgraderが各タスクを成功基準で評価する。失敗原因が記録される。

Improve：Dreamingが定期的に蓄積されたセッションデータを検討し、メモリを更新する。次のセッションのエージェントはこのメモリを参照する。

このサイクルが繰り返されると、エージェントは新しいスキルを習得したわけではなく、「どの状況で何に注意すべきか」という運用知識が蓄積される。モデルはそのままなのにパフォーマンスが改善する構造だ。

[エージェントメモリ学習パターンのより深い分析はHindsight MCPの記事](/ja/blog/ja/hindsight-mcp-agent-memory-learning)で取り上げたことがある。Dreamingが追求する「経験ベースのメモリ更新」の哲学と類似したアプローチだ。

## 批判的に見ると — まだ検証されていない点

いくつかの点が正直気になる。

<strong>第一に、Harvey 6倍数値の一般化可能性。</strong> Harveyは法律文書処理専門のAI企業だ。同じ種類の文書を繰り返し処理する環境でのパターン学習はうまく機能する。しかし「AIエージェントを使えば完了率が6倍になる」という結論は誤解だ。法律文書の反復性が前提となっている数値だ。

<strong>第二に、メモリ汚染（memory poisoning）のリスク。</strong> Dreamingが間違ったパターンを強化する可能性がある。エージェントが繰り返し間違った方向でアプローチしていたなら、Dreamingはその誤ったアプローチをパターンとして記録しうる。Anthropicは「メモリ変更を適用前にレビューできる」オプションを提供すると述べているが、実際にすべてのチームがこれを丁寧にレビューできるかは別の問題だ。

<strong>第三に、ガバナンスの緊張。</strong> エージェントが自ら行動パターンを変えるシステムは監査（audit）が難しい。「6ヶ月前にエージェントがなぜその決定を下したか」を追跡するためには、メモリストアのバージョン管理が必要になる。この点についてAnthropicの公式ガイドはまだ十分ではない。

<strong>第四に、Research Previewの状態。</strong> DreamingはまだResearch Previewだ。Public BetaのOutcomes、Orchestrationと異なり、プロダクションでの安定性はさらなる検証が必要だ。[エージェントコスト現実分析の記事](/ja/blog/ja/ai-agent-cost-reality)でも強調したが、エージェントシステムの運用コストはトークンコストだけではない。ガバナンスコスト、モニタリングコスト、デバッグコストが伴う。

第五に、Outcomesのgrader実行コストだ。graderもエージェントセッションとして実行されるため、rubricが複雑で再試行が多くなるほどコストが線形的に増加する。これに対するコスト予測ツールはまだない。

## 誰に向いているか、そして私の判断

<strong>まずOutcomesを導入することを勧める。</strong> 既にManaged Agentsを使っていて、出力品質の一貫性が課題のチームであれば、rubric設計に時間を投資する価値がある。graderの分離構造はself-reviewの偏りの問題を実際に解決する。Public Betaのため安定性も相対的に高い。

<strong>Multiagent Orchestrationは、単一エージェントが処理するには大きすぎるか、多様な専門知識が必要なタスクに適している。</strong> 大規模レポート生成、コードレビューとドキュメント化の同時進行、複数データソース分析など。ただし、20個のサブエージェントを設計ミスするとオーケストレーションのオーバーヘッドが並列化の恩恵を相殺することがある。

<strong>Dreamingは慎重に取り組むことを勧める。</strong> Research Previewの状態であり、メモリガバナンス体制が整っているチームでのみ試験的に適用する価値がある。エージェントが繰り返し同じ種類のタスクを長期間処理する環境ほど、Dreamingの効果が大きい。毎回異なるリクエストを処理する環境では効果が不明確だ。

三つの機能の組み合わせは興味深いと思う。Observe → Evaluate → Improveのサイクルが明確に設計されている。しかし「自己改善エージェント」というフレーミングが生み出す過大な期待は警戒すべきだ。モデルが改善するのではなく、メモリが改善するのであり、メモリは間違う可能性がある。そしてResearch Preview機能は、Anthropicが直接警告するように、プロダクションでの検証がまだ十分ではない。

## 実行可能性の判断

私が直接再現できた範囲はここまでだ：Anthropic SDKのインストール、基本Messages API接続。Managed AgentsのDreaming、Outcomes、OrchestrationはEnterprise/Betaプランが必要な機能のため、直接実行できなかった。

公式ドキュメントで確認した範囲：
- [New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration](https://claude.com/blog/new-in-claude-managed-agents)
- Outcomes実装例：[Claude Cookbook — managed-agents-cma-verify-with-outcome-grader](https://platform.claude.com/cookbook/managed-agents-cma-verify-with-outcome-grader)
- Code with Claude 2026概要：[Code w/ Claude SF 2026](https://claude.com/blog/code-w-claude-sf-2026-sf)

直接使用したチームの公開レポートが増えれば、特にHarvey以外のドメインでのDreaming効果データが出れば、判断を更新する予定だ。今は「興味深い構造だが、まだ十分に検証されていない機能」という評価が適切だと思う。
