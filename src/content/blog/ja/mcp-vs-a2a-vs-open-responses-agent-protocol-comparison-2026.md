---
title: 'MCP vs A2A vs Open Responses — AIエージェント通信プロトコル3つ巴、実戦で何を使うべきか'
description: 'MCP、A2A、Open Responsesの設計目的と生態系を比較します。2026年の実際のエージェントプロジェクトで各プロトコルをいつ・どう組み合わせるか、OpenAI・Google・Anthropicが繰り広げるエージェント通信標準競争の核心を整理しました。'
pubDate: '2026-04-25'
heroImage: '../../../assets/blog/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026-hero.jpg'
tags: ['MCP', 'A2A', 'AIエージェント', 'プロトコル比較']
relatedPosts:
  - slug: 'a2a-mcp-hybrid-architecture-production-guide'
    score: 0.92
    reason:
      ko: 'MCP와 A2A 각각의 역할을 이해했다면, 두 프로토콜을 함께 쓰는 프로덕션 아키텍처 설계가 다음 단계다'
      ja: 'MCPとA2Aそれぞれの役割を理解したなら、両プロトコルを組み合わせたプロダクションアーキテクチャ設計が次のステップだ'
      en: 'If you understand what MCP and A2A each do, the next question is how to combine them in a production architecture'
      zh: '理解了MCP和A2A各自的角色之后，下一步就是在生产架构中如何组合使用这两个协议'
  - slug: 'openai-open-responses-agentic-standard'
    score: 0.87
    reason:
      ko: 'Open Responses 스펙이 처음 발표됐을 때 어떤 맥락이었는지, 에이전틱 표준 경쟁에서 OpenAI의 포지션을 확인할 수 있다'
      ja: 'Open Responsesがどんな文脈で発表されたか、エージェンティック標準競争でOpenAIのポジションを確認できる'
      en: 'Context on how Open Responses was announced and what OpenAI is positioning itself as in the agentic standards landscape'
      zh: '了解Open Responses最初发布的背景，以及OpenAI在智能体标准竞争中的定位'
  - slug: 'claude-code-agentic-workflow-patterns-5-types'
    score: 0.80
    reason:
      ko: '프로토콜 레이어 아래에서 Claude Code 에이전틱 워크플로우가 실제로 어떤 패턴으로 구현되는지 구체적으로 살펴볼 수 있다'
      ja: 'プロトコルレイヤーの下でClaude Codeエージェンティックワークフローが実際にどんなパターンで実装されるかを具体的に見られる'
      en: 'See how Claude Code agentic workflows are actually implemented — the patterns that sit below the protocol layer'
      zh: '深入了解在协议层之下，Claude Code智能体工作流的具体实现模式'
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.77
    reason:
      ko: '프레임워크 선택이 MCP와 A2A 지원 수준에 어떤 영향을 미치는지, LangGraph vs CrewAI vs Dapr 비교에서 확인할 수 있다'
      ja: 'フレームワーク選択がMCPとA2Aのサポートレベルにどう影響するか、LangGraph vs CrewAI vs Dapr比較で確認できる'
      en: 'How your framework choice affects MCP and A2A support levels — the LangGraph vs CrewAI vs Dapr breakdown'
      zh: '了解框架选择如何影响MCP和A2A的支持程度——LangGraph vs CrewAI vs Dapr的详细比较'
  - slug: 'anthropic-agent-skills-standard'
    score: 0.74
    reason:
      ko: 'MCP와 맞물리는 Anthropic Agent Skills 표준이 에이전트 역량 확장 방식을 어떻게 바꾸는지 들여다볼 수 있다'
      ja: 'MCPと組み合わさるAnthropicのAgent Skills標準が、エージェント能力拡張の方法をどう変えるかを掘り下げられる'
      en: "Anthropic's Agent Skills standard works with MCP to redefine how agent capabilities are extended and composed"
      zh: 'Anthropic的Agent Skills标准与MCP协同，重新定义了智能体能力的扩展和组合方式'
---

2025年後半から、AIエージェント関連の標準が一気に出揃い始めた。AnthropicがMCPをLinux Foundationに寄贈し、GoogleがA2Aを発表し、OpenAIはOpen Responsesの仕様を公開した。開発者にとっては良いニュースだが、問題がある。三つがそれぞれ何をするのか、競合関係なのか、それとも一緒に使うべきなのかが不明確なのだ。

「またスタンダード戦争か」と最初は思った。しかしMCPサーバーを自分でいくつか実装し、A2Aの仕様書を読み込んでから考えが変わった。この三つは競合ではなく、**異なるレイヤーを担当している**。混乱の原因は、名前だけ見るとどれも「エージェント通信標準」に聞こえるからだ。

このエントリでは三つのプロトコルをそれぞれ解剖し、実戦でいつ何を使うべきかを整理する。

---

## MCP: エージェントに「手」を与える標準

MCP(Model Context Protocol)は、Anthropicが2024年末に公開し、2025年12月にLinux FoundationのAgentic AI Initiative(AAIF)に寄贈したプロトコルだ。核心的な目的は一つ: **AIモデルが外部ツールやデータにアクセスする方法を標準化すること。**

「AI版USB-C」という比喩がよく合う。USB-C以前はノートPCごとに充電端子が違った。MCP以前はClaude用ツール接続とGPT用ツール接続が別々だった。MCPが共通コネクターを作った。

MCPが標準化するのは三つだ:
- **Tools**: エージェントが実行できる関数やアクション (例: ファイル読み込み、API呼び出し、コード実行)
- **Resources**: エージェントが読み取れるデータ (例: ドキュメント、DBレコード、ファイルシステム)
- **Prompts**: サーバーが提供する再利用可能なプロンプトテンプレート

2026年4月時点でMCPサーバーは5,000個を超えた。GitHub Actions、Notion、PostgreSQL、Brave Search、ブラウザ自動化まで、主要なツールのほぼすべてにMCPサーバーが存在する。

自分のブログ自動化システムにMCPを最初に組み込んだとき、最も驚いたのは**フレームワーク非依存性**だ。Claude Codeで使っていたMCPサーバーを、他のMCP互換クライアントでもそのまま使える。実際にはクライアントごとにサポートする機能範囲が異なるため100%互換ではないが、方向性は正しい。

### MCPの2026ロードマップの核心的変化

2026年のMCPロードマップで注目すべき変化は、**水平スケーリング問題の解決**だ。現在のStreamable HTTPトランスポートはステートフルなセッションを維持するが、これがロードバランサーと衝突する。リクエストごとに異なるサーバーインスタンスにルーティングされるとセッションが切れる。ロードマップはこの問題を解決し、MCPサーバーを真のステートレスサービスとして運用できるようにすることを目指している。

もう一つは`.well-known`エンドポイントによる**ディスカバリーの標準化**だ。今はMCPサーバーに実際に接続しないと何を提供しているか分からないが、今後は接続なしにメタデータだけでサーバー機能を把握できるようになる。

[WebMCPを通じてMCPサーバーの実装詳細を確認した記事](/ja/blog/ja/webmcp-chrome-146-ai-tool-server)も参考になる。

---

## A2A: エージェント同士が話し始めた

A2A(Agent2Agent)は、Googleが2025年4月に発表し、2025年6月にLinux Foundationに寄贈したプロトコルだ。目的がMCPと異なる: **エージェント間の通信と協調を標準化すること。**

MCPが「エージェント ↔ ツール」の関係なら、A2Aは「エージェント ↔ エージェント」の関係だ。

A2Aが解決しようとする問題はこうだ。旅行予約エージェントがいて、ホテル検索専門エージェント、航空券検索専門エージェントが別にいるとしよう。旅行予約エージェントがこの二つの専門エージェントにタスクを委任するにはどうすればいいか? MCPはこの問題を扱わない。それがA2Aの領域だ。

### A2A v1.0の核心概念

2026年初にリリースされたA2A v1.0の核心構成:

**Agent Card**: エージェントが自分の能力をJSON形式で広告するドキュメント。他のエージェントが「この仕事を任せられるエージェントは誰だ?」を把握する際にAgent Cardを読む。

**タスクベース通信**: エージェント間の通信はTask単位で行われる。タスクがすぐに完了する場合もあれば、長時間実行される場合は進捗状態を同期するメカニズムがある。

**Signed Agent Cards (v1.0の核心)**: 暗号化署名でAgent Cardの真正性を検証できる。「このエージェントは本当にこのドメインが発行したものだ」という信頼基盤を作る。分散エージェント生態系での偽エージェント排除メカニズムだ。

2026年4月時点で150以上の組織がA2Aを採用しており、Microsoft、AWS、Salesforce、SAP、ServiceNowでプロダクション展開が進んでいる。

正直に言うと、A2A仕様書を初めて読んだとき「これはどれだけ実用的なのか」と懐疑的だった。エージェントが互いに直接通信するという概念自体は面白いが、これを安全に運用するには信頼モデルが複雑になる。v1.0のSigned Agent Cardsがその方向を固めつつあるが、プロダクションで完全に信頼するにはまだ初期段階だと見ている。

[A2AとMCPをプロダクション環境で組み合わせるアーキテクチャパターン](/ja/blog/ja/a2a-mcp-hybrid-architecture-production-guide)を別途まとめたが、レイヤーをどう分けるかが核心だ。

---

## Open Responses: API互換性を標準化しようとするOpenAIの試み

Open Responsesは2026年2月にOpenAIが公開したオープン仕様だ。性質がMCPやA2Aと異なる。それらは**エージェントがどう通信するか**を扱うが、Open Responsesは**エージェントワークフローをどうAPIとして公開するか**を扱う。

OpenAIのResponses APIをベースに作られた仕様で、基本的な考え方はこうだ: Chat Completions APIからResponses APIへの移行で生まれた標準をオープンにして、他のモデルプロバイダーも同じインターフェースでエージェンティックワークフローを提供できるようにしよう、というもの。

サポート生態系: Hugging Face、Vercel、OpenRouterが採用しており、Ollama、vLLM、LM Studioのようなローカル推論ツールでも対応している。つまり、OpenAI APIで書いたエージェンティックコードがローカルモデルでも動くというのが核心的な価値提案だ。

まだ仕様とコンフォーマンステストツールがopenresponses.orgにあり、大規模プロダクション検証事例は多くない。Hugging FaceとVercelのサポートは意味があるが、「他のベンダーがOpenAIのAPI設計を標準として受け入れる」という前提がどれだけ現実化するかは様子を見る必要がある。

率直な評価: Open ResponsesはMCPやA2Aと異なるレイヤーにあるため「競合」というよりも補完関係だ。しかし今すぐ実戦でこの仕様を追いかける理由はそれほど大きくない。MCPとA2Aの方がより汎用的で生態系が成熟している。

---

## 三つのプロトコルを並べると

以下の表が核心だ:

| | MCP | A2A | Open Responses |
|---|---|---|---|
| **設計目的** | エージェント ↔ ツール接続 | エージェント ↔ エージェント協調 | APIエージェンティックループ標準化 |
| **比喩** | USB-C (共通コネクター) | HTTP (エージェント間通信) | REST API設計標準 |
| **主導** | Anthropic → AAIF | Google → Linux Foundation | OpenAI |
| **現行バージョン** | 2025-11-25 | v1.0 (2026年初) | Beta |
| **生態系成熟度** | 高 (5,000+サーバー) | 高 (150+組織) | 低 (初期) |
| **トランスポート** | Streamable HTTP, stdio | JSON-RPC, gRPC | WebSocket, HTTP |
| **セキュリティモデル** | OAuth, サーバー別認証 | Signed Agent Cards | 仕様策定中 |
| **いつ使うか** | ツールアクセスが必要な常時 | マルチエージェント委任時 | OpenAI互換ワークフロー |

一点強調したいことがある: **MCPとA2AはOR関係ではなくAND関係だ。** 2026年の実プロダクションマルチエージェントシステムは、ほとんどこの二つを一緒に使う。各エージェントは自分のツールをMCPで接続し、エージェント間の協調はA2Aで行う。

---

## 実戦の階層構造: どう組み合わせるか

実際のプロダクションアーキテクチャでこの三つのプロトコルがどう位置するかを例にとると:

**シナリオ: 自動化リサーチシステム**

```
オーケストレーターエージェント
├── (A2A) → ウェブリサーチ専門エージェント
│   └── (MCP) → Brave Search MCPサーバー
│   └── (MCP) → ウェブスクレイピングMCPサーバー
├── (A2A) → ドキュメント分析専門エージェント
│   └── (MCP) → ファイルシステムMCPサーバー
│   └── (MCP) → PDF処理MCPサーバー
└── (MCP) → 結果ストレージMCPサーバー
```

オーケストレーターがA2Aで専門エージェントに委任し、各専門エージェントはMCPで自分のツールにアクセスする。

[Claude Codeのエージェンティックワークフローパターン5種](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)で、この階層構造の実装例をより詳しく扱っている。

---

## 今すぐ何を学ぶべきか

各プロトコルの優先順位を率直にまとめると:

**即座に学ぶべき: MCP**

今エージェント開発をしているなら、MCPから始めるべきだ。理由:
- 5,000個を超えるサーバー生態系がすでに存在
- Claude Code、OpenAI Agents SDK、LangGraphなど主要フレームワークがすべてサポート
- Streamable HTTPが標準となり、仕様が十分安定
- [Anthropic Agent Skillsの標準](/ja/blog/ja/anthropic-agent-skills-standard)と組み合わさって、より強力なパターンが生まれている

**中期的に: A2A**

マルチエージェントシステムをプロダクションに展開する計画があるなら、A2Aを学ぶべきだ。150組織採用、Linux Foundationガバナンス、v1.0の安定性。準備は整っている。ただし、Signed Agent Cardsベースの信頼モデルが実務でどれだけ検証されているかは、まだ見守っている段階だ。

**様子見: Open Responses**

現在の構成でOpenAI互換性が必要でなければ、急ぐ理由はない。仕様は興味深いが、大規模プロダクション事例がない。

もう一点: MCPとA2AはどちらもLinux Foundation傘下にある。標準戦争ではなく、同じ財団の下で異なる問題を解決する方向に整理されている。これが2024年との最大の違いだ。

---

## 私の結論

MCPは今すぐ使うべきツールだ。エージェントに外部世界へのアクセス方法を与えるレイヤーであり、生態系が十分に成熟している。A2Aはマルチエージェントシステムを真剣に考えているなら、v1.0から学ぶべきだ。Open Responsesはポートフォリオとして知っておくが、すぐにアーキテクチャ決定に反映するには早い。

三つを「プロトコル標準戦争」として見ると疲弊する。それぞれ異なる問題を解いており、三つすべてが必要なシステムも十分にある。私の実用的な結論: MCPから始め、A2Aは必要なときに、Open Responsesはアップデートを購読するレベルでフォロー。

そして[AIエージェントフレームワーク選定](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)も、このプロトコル選択と絡み合う問題だ。どのフレームワークを使うかによってMCPとA2Aのサポートレベルが異なるためだ。
