---
title: 'Claude APIプロンプトキャッシング実践 — LLMコストを70%削減する4パターン'
description: >-
  実際のプロダクション環境でClaude APIプロンプトキャッシングを適用した経験ベースの完全ガイドです。システムプロンプト・RAGドキュメント・
  ツール定義・マルチターン会話の4パターン、2026年TTL変更の落とし穴、コスト削減の計測方法を実測データと共に解説します。
pubDate: '2026-04-27'
heroImage: >-
  ../../../assets/blog/claude-api-prompt-caching-cost-optimization-guide-hero.png
tags:
  - claude-api
  - cost-optimization
  - prompt-caching
  - llm
  - anthropic
relatedPosts:
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.92
    reason:
      ko: LLM API 가격 구조를 비교한 글인데, 프롬프트 캐싱은 그 가격표를 실제로 줄이는 가장 직접적인 방법이다. 두 글을 함께 읽으면 "어느 모델을 쓸까"와 "어떻게 쓸까"가 모두 해결된다.
      ja: LLM APIの価格構造を比較した記事で、プロンプトキャッシングはその価格を実際に削減する最も直接的な方法だ。両記事を合わせて読むと「どのモデルを使うか」と「どう使うか」が両方解決できる。
      en: The pricing comparison post answers "which model," while this post answers "how to use it." Together they form a complete cost optimization strategy.
      zh: LLM API价格比较文章解答了"用哪个模型"，本文则解答了"如何使用"。两篇合读可以形成完整的成本优化策略。
  - slug: context-engineering-production-ai-agents
    score: 0.88
    reason:
      ko: 컨텍스트 엔지니어링과 프롬프트 캐싱은 사실 같은 문제의 두 얼굴이다. 어떤 정보를 컨텍스트에 담을지 설계하는 작업이 캐싱 효율을 결정한다.
      ja: コンテキストエンジニアリングとプロンプトキャッシングは、実は同じ問題の二つの側面だ。何をコンテキストに含めるかの設計がキャッシング効率を決定する。
      en: Context engineering and prompt caching are two sides of the same coin — what you put in context determines how well caching works.
      zh: 上下文工程和提示缓存本质上是同一问题的两个面。上下文的设计方式决定了缓存的效率。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.85
    reason:
      ko: 추론 비용을 줄이는 접근법을 다룬 글인데, 프롬프트 캐싱이 입력 비용을 줄인다면 이 글은 출력(추론) 비용을 줄이는 방법이다. 둘을 조합하면 총 API 비용을 극적으로 낮출 수 있다.
      ja: 推論コスト削減を扱った記事で、プロンプトキャッシングが入力コストを削減するのに対し、この記事は出力（推論）コストを削減する方法を扱う。両方を組み合わせれば総APIコストを劇的に下げられる。
      en: While this post covers reducing input token costs via caching, the Deep-Thinking Ratio post covers reducing output/reasoning costs — combine both for maximum savings.
      zh: 本文讨论通过缓存降低输入成本，而Deep-Thinking Ratio文章讨论降低输出/推理成本。两者结合可以最大化节省成本。
  - slug: mcp2cli-token-cost-optimization
    score: 0.82
    reason:
      ko: MCP 툴 디스커버리 토큰을 96%까지 줄인 접근법인데, 이 글의 "툴 정의 캐싱" 패턴과 함께 쓰면 MCP 기반 에이전트의 API 비용을 거의 0에 수렴시킬 수 있다.
      ja: MCP ツールディスカバリトークンを96%削減したアプローチで、この記事の「ツール定義キャッシング」パターンと組み合わせると、MCPベースのエージェントのAPIコストをほぼゼロに近づけられる。
      en: The mcp2cli approach reduces tool discovery tokens by 96%; pair it with the tool definition caching pattern here to nearly eliminate MCP-based agent API costs.
      zh: mcp2cli将工具发现token减少96%；与本文的工具定义缓存模式结合使用，可以使基于MCP的Agent API成本趋近于零。
  - slug: heterogeneous-llm-agent-fleet-cost-optimization
    score: 0.80
    reason:
      ko: 이종 LLM 아키텍처로 비용을 90% 줄인 사례인데, 프롬프트 캐싱을 각 모델에 적용하면 추가로 입력 토큰 비용을 70% 더 줄일 수 있다. 두 전략은 상호 보완적이다.
      ja: 異種LLMアーキテクチャでコストを90%削減した事例で、プロンプトキャッシングを各モデルに適用すると、さらに入力トークンコストを70%削減できる。二つの戦略は相互補完的だ。
      en: The heterogeneous fleet approach cuts costs by routing to cheaper models; add prompt caching on top to cut input token costs by another 70%. The strategies stack.
      zh: 异构LLM架构方法通过路由到更便宜的模型来降低成本；在此基础上添加提示缓存，再额外降低70%的输入token成本。两种策略可以叠加使用。
---

APIの請求書を初めてちゃんと確認したのは、このブログの自動化パイプラインを設計していた時だった。記事の作成、4言語への翻訳、SEOクロージング、レコメンデーション生成まで、Claude APIを1日数十回呼び出すシステムで、毎リクエストに数千トークンのシステムプロンプトが繰り返し課金されていた。

Anthropicのドキュメントには「90%割引」と書いてある。なのに請求書はなぜ減らないのか?

答えは、キャッシュが作られるタイミングとアクティブになる条件にあった。プロンプトキャッシングは「有効にすれば終わり」ではなく、設計が必要な技術だ。誤って設定するとキャッシュの書き込みコストだけが追加され、肝心の割引が受けられない。

![Claude APIプロンプトキャッシングのコストフロー — 初回リクエストvsキャッシュヒットの比較](../../../assets/blog/claude-api-prompt-caching-cost-optimization-guide-flow.png)

## プロンプトキャッシングが実際に動く仕組み

キャッシングの核心は`cache_control`パラメータだ。特定のコンテンツブロックにこのパラメータを付けると、Anthropicサーバーがそのブロックを別途保存し、以降の同じ内容を含むリクエストで保存済みバージョンを再利用する。

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "あなたは技術サポートエージェントです。\n\n[製品ドキュメント10,000トークン...]",
            "cache_control": {"type": "ephemeral"}  # このブロックをキャッシュ
        }
    ],
    messages=[{"role": "user", "content": "エラーコード429の解決方法は?"}]
)

# キャッシュ利用状況の確認
print(response.usage.cache_creation_input_tokens)  # キャッシュ作成に使ったトークン
print(response.usage.cache_read_input_tokens)       # キャッシュから読んだトークン
```

最初のリクエストでは`cache_creation_input_tokens`にコストが記録される。2回目以降は`cache_read_input_tokens`に90%割引されたコストが記録される。

いくつかの制約条件を先に把握しておきたい。

**最小トークン閾値**: Claude Sonnet 4.6は最低2,048トークン、Claude Opus 4.7は最低4,096トークンを超えないとキャッシュが作られない。短いシステムプロンプトに`cache_control`を付けても無効だ。

**最大キャッシュポイント数**: 1リクエストあたり最大4つの`cache_control`ブロックを指定できる。優先順位を決めて配置する必要がある。

**キャッシュ位置**: キャッシュポイント以降のコンテンツはキャッシュされない。頻繁に変わる内容は必ずキャッシュポイントの後に配置すること。

## 2026年のTTL変更 — この落とし穴を知らないと損をする

正直に言うと、私も最初これを知らず、1ヶ月間キャッシングの効果をまともに受けられなかった。

Anthropicは2026年初めにデフォルトTTL(Time To Live)を1時間から5分に短縮した。この変更がプロダクションワークロードに与える影響は思った以上に大きい。

**TTLオプション別コスト構造 (Claude Sonnet 4.6基準)**:

| 区分 | 価格 (1Mトークンあたり) | 倍率 |
|------|----------------------|------|
| 通常入力 | $3.00 | 1× |
| キャッシュ書き込み (5分) | $3.75 | 1.25× |
| キャッシュ書き込み (1時間) | $6.00 | 2× |
| **キャッシュ読み取り** | **$0.30** | **0.1×** |
| 出力 | $15.00 | 5× |

キャッシングなしで10回リクエストした場合と比較すると:

- キャッシングなし: 10 × 1.0 = コスト10単位
- キャッシング適用: 1.25 + 9 × 0.1 = 2.15単位
- **削減率: 78.5%**

ただし5分TTLの場合、5分以内に同じキャッシュブロックを含むリクエストが2回以上来る必要がある。単発スクリプトや利用者がまばらなサービスではキャッシュヒット率が低くなる可能性がある。

私はこのブログの自動化でTTL問題をこう回避した。時間のかかるバッチ処理(記事の4言語翻訳など)を一つの連続ループ内で実行し、キャッシュが生きている5分以内にすべてのリクエストを送る。この方法で一度のキャッシュ書き込みで4回のキャッシュヒットを得る。

## パターン1: システムプロンプトのキャッシング

最も一般的で効果が確実な方法だ。ほとんどのAIアプリは同じシステムプロンプトをすべてのリクエストに繰り返す。

```python
def create_cached_agent(system_prompt: str):
    """
    システムプロンプトをキャッシュするエージェントファクトリ。
    system_promptが2048トークンを超える時に効果的。
    """
    def chat(user_message: str) -> anthropic.types.Message:
        return client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }
            ],
            messages=[{"role": "user", "content": user_message}]
        )
    return chat
```

適用前後を比較してみよう。10,000トークンのシステムプロンプトを100回呼び出す場合:

- **キャッシングなし**: 100 × 10,000トークン = 100万トークン → $3.00
- **キャッシング適用**: 10,000(書き込み) + 99 × 10,000(読み取り) = $0.0375 + $0.297 = **$0.334**
- **削減率: 89%**

このブログの自動化ではCLAUDE.mdファイルが約8,000〜12,000トークンある。1日30回以上このファイルをコンテキストに含めるが、キャッシングなしでは1日240万〜360万トークンが消費される。キャッシング適用後の実際の課金トークンは10%未満に減った。

## パターン2: RAGドキュメントのキャッシング

RAG(検索拡張生成)システムで同じドキュメントを複数の質問に繰り返し使用する時に特に効果的だ。

```python
def cached_rag_qa(docs: list[str], questions: list[str]) -> list[str]:
    """
    同じドキュメントセットに複数の質問をする時にドキュメントをキャッシュ。
    同じセッション内5分以内に質問が続く必要がある。
    """
    doc_content = "\n\n---\n\n".join(docs)
    answers = []
    
    for question in questions:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"参考ドキュメント:\n\n{doc_content}",
                            "cache_control": {"type": "ephemeral"}  # ドキュメントをキャッシュ
                        },
                        {
                            "type": "text",
                            "text": f"\n質問: {question}"
                            # 質問は毎回変わるのでキャッシュしない
                        }
                    ]
                }
            ]
        )
        answers.append(response.content[0].text)
    
    return answers
```

カスタマーサポートシステムを例に挙げると、製品マニュアル(50,000トークン)を1日1,000回参照する場合、キャッシングなしでは$150だが、キャッシング後は$18.4程度になる。1日$131の節約だ。

[コンテキストエンジニアリングの観点から何をキャッシュするかを設計する方法](/ja/blog/ja/context-engineering-production-ai-agents)を理解すると、RAGキャッシング戦略がより明確になる。

## パターン3: ツール定義のキャッシング

ツール(関数呼び出し)を多く定義するエージェントで見落としがちな部分だ。Claude APIにツールを10〜20個登録するとそのスキーマだけで数千トークンになり、これがすべてのリクエストに繰り返される。

```python
tools = [
    {
        "name": "search_web",
        "description": "ウェブから最新情報を検索します",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "max_results": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        }
    },
    # ... 追加ツール定義
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    system=[
        {
            "type": "text",
            "text": "あなたは強力なリサーチエージェントです。以下のツールを活用してください。",
            "cache_control": {"type": "ephemeral"}  # システム + ツールコンテキストをキャッシュ
        }
    ],
    messages=[{"role": "user", "content": user_request}]
)
```

MCPベースのエージェントなら[mcp2cliのトークン最適化アプローチ](/ja/blog/ja/mcp2cli-token-cost-optimization)と組み合わせることで、ツールディスカバリコストをほぼなくせる。

## パターン4: マルチターン会話のキャッシング

長い会話を続けるカスタマーサポートやコーディングアシスタントで有効だ。

```python
def multiturn_with_caching(history: list, new_message: str) -> tuple:
    """
    マルチターン会話のキャッシング: 直前の交換までの記録はキャッシュ、新メッセージのみ新鮮。
    """
    messages = history.copy()
    
    if messages and messages[-1]["role"] == "user":
        last = messages[-1]
        messages[-1] = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": last["content"] if isinstance(last["content"], str)
                            else last["content"][0]["text"],
                    "cache_control": {"type": "ephemeral"}
                }
            ]
        }
    
    messages.append({"role": "user", "content": new_message})
    
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=messages
    )
    
    updated_history = messages + [
        {"role": "assistant", "content": response.content[0].text}
    ]
    return response, updated_history
```

## コスト削減を測定する方法

```python
def calculate_cost(usage, model: str = "claude-sonnet-4-6") -> dict:
    prices = {
        "claude-sonnet-4-6": {
            "input": 3.00, "cache_read": 0.30,
            "cache_write": 3.75, "output": 15.00
        }
    }
    p = prices[model]
    M = 1_000_000
    
    cache_read = getattr(usage, 'cache_read_input_tokens', 0)
    cache_write = getattr(usage, 'cache_creation_input_tokens', 0)
    fresh_input = getattr(usage, 'input_tokens', 0)
    output = getattr(usage, 'output_tokens', 0)
    
    actual = (
        (cache_read / M) * p["cache_read"] +
        (cache_write / M) * p["cache_write"] +
        (fresh_input / M) * p["input"] +
        (output / M) * p["output"]
    )
    no_cache = (
        ((cache_read + cache_write + fresh_input) / M) * p["input"] +
        (output / M) * p["output"]
    )
    return {"actual_usd": actual, "no_cache_usd": no_cache,
            "savings_pct": (no_cache - actual) / no_cache * 100}
```

実際のシミュレーション結果:

```
10,000トークンキャッシュヒット時:
  実際のコスト: $0.0098
  キャッシングなし: $0.0365
  削減: 73.0%
```

## 実行可能性の判断 — キャッシングが合わない状況

キャッシングが常に得をもたらすわけではない。私は最初すべてのリクエストにキャッシングを適用してかえってコストが上がった経験がある。

**キャッシングが合わない状況**:
- 単発スクリプト: 一度実行して終わる処理
- 頻繁に変わるコンテキスト: ユーザー別にカスタマイズされた長いシステムプロンプト
- 短いシステムプロンプト: 2,048トークン未満はキャッシュ自体が作られない
- スパイクトラフィック: 5分間にリクエストが集中した後しばらく間が空く場合

**キャッシングがよく合う状況**:
- 同じ長いシステムプロンプトを分当たり2回以上使用
- 同じ参照ドキュメントで複数の質問を受けるFAQ/サポートシステム
- エージェントパイプラインでツール定義が固定されている場合
- このブログのように同じ運用指針を繰り返し参照する自動化

## このブログの自動化での適用例

このブログの自動化(daily post、SEOクロージング、週次戦略)にキャッシングを導入した際の方法を共有する。

核心は**一つのバッチ実行内ですべてのリクエストを5分以内に処理する**ことだった。CLAUDE.mdファイルが約10,000トークンで、記事作成 → 4言語翻訳 → リリースノート生成まで7〜8回の連続APIコールが発生する。

この過程を一つの連続ループに束ねることで:
1. 最初のリクエストでCLAUDE.mdをキャッシュとして作成
2. 以降7回のリクエストはキャッシュヒットで0.1×のコストのみ
3. 5分以内にすべて完了するのでキャッシュが失効しない

結果として入力トークンコストが約65%減少した。[LLM APIの価格比較2026](/ja/blog/ja/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)で扱ったように、さらに削減するには作業種別に異なるモデルを使う異種アーキテクチャを組み合わせる必要がある。

最後に正直に一言。プロンプトキャッシングは「設定すれば自動的に節約できる」感覚の機能ではない。どのブロックをキャッシュするか、リクエストパターンがTTLと合っているか、キャッシュヒット率をどう測定するかを設計しなければならない。最初は面倒に見えるが、一度きちんと設定すればAPIコストが目に見えて変わる。私はその差を直接見た。
