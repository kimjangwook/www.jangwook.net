---
title: Claude Managed Agentsを試した — インフラなしでAIエージェントを30分でデプロイ
description: >-
  Anthropicが4月に公開したClaude Managed Agentsを実際に試してみた正直なレビュー。API
  3ステップチェーン、$0.08/時間の実際のコスト計算、ベンダーロックインリスクまでカバー。
pubDate: '2026-04-16'
heroImage: >-
  ../../../assets/blog/claude-managed-agents-production-deployment-guide-hero.jpg
tags:
  - claude
  - managed-agents
  - ai-agent
  - anthropic
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.95
    reason:
      ko: Managed Agents가 단일 에이전트 관리형 실행에 집중하는 반면, 이 글은 여러 에이전트를 tmux로 직접 오케스트레이션하는 방법을 다룬다. 두 접근법을 비교하면 어떤 상황에서 무엇을 선택해야 하는지 판단하기 쉬워진다.
      ja: Managed Agentsが単一エージェントの管理型実行に集中する一方、この記事はtmuxで複数エージェントを直接オーケストレーションする方法を扱う。両アプローチを比較することで、どの状況で何を選択すべきか判断しやすくなる。
      en: Where Managed Agents focuses on managed single-agent execution, this post covers directly orchestrating multiple agents with tmux. Comparing both approaches makes it easier to decide which fits your situation.
      zh: Managed Agents专注于单智能体托管执行，而这篇文章介绍了使用tmux直接编排多个智能体的方法。对比两种方法，更容易判断在什么情况下选择哪种方案。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: Managed Agents의 $0.08/시간 요금이 실제로 합리적인지 판단하려면, 이 글에서 다룬 에이전트 운영 비용 vs 인건비 비교 분석이 실질적인 기준이 된다.
      ja: Managed Agentsの$0.08/時間の料金が実際に合理的かどうか判断するには、この記事で扱ったエージェント運用コストvs人件費の比較分析が実質的な基準になる。
      en: To judge whether Managed Agents' $0.08/hr pricing is actually reasonable, the agent operating cost vs. human labor comparison in this post serves as a practical benchmark.
      zh: 要判断Managed Agents的$0.08/小时费用是否实际合理，这篇文章中分析的智能体运营成本与人力成本比较是实用的参考标准。
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.93
    reason:
      ko: Managed Agents의 단일 에이전트 모델을 이해했다면, 이 글에서 다룬 5가지 오케스트레이션 패턴과 비교해봐야 한다. Managed Agents가 어떤 패턴에 맞는 도구인지 파악하는 데 직접적인 도움이 된다.
      ja: Managed Agentsの単一エージェントモデルを理解したなら、この記事で扱った5つのオーケストレーションパターンと比較してみる価値がある。Managed Agentsがどのパターンに適したツールかを把握するのに直接役立つ。
      en: Once you understand Managed Agents' single-agent model, compare it against the 5 orchestration patterns in this post. It directly helps you figure out which pattern Managed Agents actually fits.
      zh: 理解了Managed Agents的单智能体模型后，应该与这篇文章介绍的5种编排模式进行比较。这直接有助于判断Managed Agents适合哪种模式。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.92
    reason:
      ko: Anthropic의 관리형 에이전트 서비스와 대조적으로, NVIDIA NemoClaw는 엔터프라이즈 자체 인프라 위에서 에이전트를 실행하는 방향이다. 벤더 락인이 걱정된다면 이 방향도 살펴볼 만하다.
      ja: AnthropicのManaged Agentsとは対照的に、NVIDIA NemoClawはエンタープライズ自社インフラ上でエージェントを実行する方向だ。ベンダーロックインが心配なら、この方向も検討する価値がある。
      en: In contrast to Anthropic's managed service, NVIDIA NemoClaw takes the direction of running agents on enterprise-owned infrastructure. If vendor lock-in worries you, this is worth looking into.
      zh: 与Anthropic的托管服务相反，NVIDIA NemoClaw采用在企业自有基础设施上运行智能体的方向。如果供应商锁定让你担忧，这个方向值得了解。
  - slug: context-engineering-production-ai-agents
    score: 0.91
    reason:
      ko: Managed Agents로 에이전트를 배포할 수 있게 됐다면, 실제로 잘 작동하게 만드는 핵심은 컨텍스트 엔지니어링이다. 이 글은 프로덕션 AI 에이전트의 컨텍스트 설계 원리를 다룬다.
      ja: Managed Agentsでエージェントをデプロイできるようになったら、実際にうまく動かす鍵はコンテキストエンジニアリングだ。この記事はプロダクションAIエージェントのコンテキスト設計原理を扱う。
      en: Once you can deploy agents with Managed Agents, what actually makes them work well is context engineering. This post covers the context design principles for production AI agents.
      zh: 一旦能够通过Managed Agents部署智能体，真正让它们运作良好的关键是上下文工程。这篇文章涵盖了生产AI智能体的上下文设计原则。
---

```python
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security and performance.",
    tools=[{"type": "agent_toolset_20260401"}],
)
```

これで終わり。エージェント作成完了。

もちろんこのコード1行がすべてなら、この記事を書く必要はない。本当の問題はその次だ — 環境設定、セッション管理、ストリーミングイベント処理、そして何より「これをプロダクションで使ったら実際にいくらかかるのか。」

Anthropicが4月8日にClaude Managed Agentsのパブリックベータを開始した。エージェントインフラを自分で構築しなくても使える管理型サービスだ。エージェントループを自前で実装したことがある人なら、この言葉の重みが違って聞こえるだろう。私もその一人なので、APIを直接試してみた。

## エージェントループをスクラッチで書くときに起きること

ツール実行結果を再びモデルに渡すループ、エラー時のリトライ戦略、コンテキストウィンドウが溢れたときの圧縮方法、タイムアウト処理、サンドボックス環境の分離。これが全部「エージェントを作る」前に解決すべきインフラの問題だ。私の経験では、実際のエージェントロジックよりもこの周辺コードのほうが時間がかかった。

[Claude Codeのエージェンティックワークフローパターン5種類](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)でオーケストレーター・サブエージェントパターンを取り上げたことがあるが、パターンが明確でも実際のコードで実装して維持するのはまた別の話だ。

Managed Agentsは、このインフラ部分をAnthropicが引き受けるという宣言だ。

## 動作原理：3つの概念があれば十分

核心概念は**エージェント(Agent)**、**環境(Environment)**、**セッション(Session)**の3つだ。

エージェントはシステムプロンプト＋許可ツールセットの再利用可能な組み合わせ。環境はエージェントが実行される隔離されたサンドボックス。セッションは実際の実行単位だ。

```python
from anthropic import Anthropic

client = Anthropic()

# ステップ1：エージェント定義（一度作って再利用）
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# ステップ2：実行環境の作成
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# ステップ3：セッション開始（実際の実行単位）
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

セッションが作成されたら、SSEストリームでメッセージをやり取りする。

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "このPythonファイルをレビューして: ..."}],
        }],
    )
    for event in stream:
        if event.type == "agent.message":
            print(event.content)
```

すべてのエンドポイントには`managed-agents-2026-04-01`ベータヘッダーが必要だが、Python SDKが自動的に処理してくれる。

実際に試してみて感じたのは、インターフェース自体は思ったよりすっきりしているということだ。`agent_toolset_20260401`内蔵ツールセット一つで、ファイル読み取り、ウェブ検索、コード実行が一度に有効になる。ツールを一つずつ定義していた頃と比べると、体感的な差は大きい。

## コスト：自分で計算する必要がある

$0.08/時間という数字は、最初見ると安く感じる。でも24時間稼働させると$1.92、1ヶ月で$57.6だ。ここにトークンコストが加わる。

コードレビューエージェントを1日10件処理するシナリオで計算すると：
- セッションあたり平均5分 × 10件 = 50分/日
- 月間ランタイム：約25時間 → $2
- セッションあたりSonnet 4.6トークンコスト：〜$0.05〜0.15
- <strong>月間総コスト予想：$20〜50程度</strong>

この程度なら納得できる。問題は常時待機エージェントだ。24/7稼働ならランタイムコストだけで月$58になり、トークンコストがそこに積み重なる。トラフィックが予測可能なバッチ処理でなければ、イベントドリブン設計でセッションを必要なときだけ開くのがコスト管理の鍵だ。

## 気になる2つのこと

使えると思いながらも、2つのことが引っかかっている。

<strong>ベンダーロックイン。</strong>エージェント設定、セッション形式、環境コンテナの仕様がすべてAnthropicの方式に縛られる。後で別のモデルやインフラに移行しようとすると再実装が必要だ。今月だけでも、AnthropicはClaude Pro/Maxサブスクライバーのサードパーティツールアクセスを遮断するポリシー変更を行った。インフラを任せるということは、その決定を一緒に受け入れるということでもある。

<strong>パブリックベータの実際の範囲。</strong>発表で最も興味深かったマルチエージェント調整と自己評価機能はパブリックベータにない。リサーチプレビューアクセスを別途申請する必要がある。[エージェントチームを直接構成して運用する方法](/ja/blog/ja/claude-agent-teams-guide)と比べると、現在のManaged Agentsは単一エージェントの管理型実行が核心だ。

## いつ使うと良いか

エージェントインフラに投資するエンジニアリングリソースがないチームなら、今試す価値がある。2人チームがエージェントループのメンテナンスに時間を使うより、管理型サービスの方が適した選択だ。

逆に、マルチモデル戦略を使っていたり、自前のオーケストレーションロジックがすでにあるなら、急ぐ必要はない。パブリックベータがGAに移行し、マルチエージェント機能が一般公開されたときに再評価しても遅くない。

APIを直接試すのに30分あれば十分だ。既存のAPIカスタマーは無料でベータを利用できる。プロダクションの意思決定はその後でいい。
