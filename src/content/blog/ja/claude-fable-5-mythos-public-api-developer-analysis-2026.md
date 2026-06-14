---
draft: true
title: "Claude Fable 5リリース分析 — MythosがついにGA、API費用2倍は払う価値があるか"
description: "Anthropicが2026年6月9日にClaude Fable 5をリリース。SWE-bench Pro 80.3%、コスト$10/$50/MTok。Mythos Previewの一般公開版であるFable 5が、実際の開発ワークフローでOpus 4.8より価値があるか。API変更点、安全ルーティング機構、コスト構造から分析する。"
pubDate: '2026-06-12'
heroImage: '../../../assets/blog/claude-fable-5-mythos-public-api-developer-analysis-2026-hero.png'
tags:
  - anthropic
  - claude-fable-5
  - ai-model
  - llm-api
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.95
    reason:
      ko: "Mythos Preview가 제한 공개였을 때 왜 일반 배포가 불가능하다고 했는지 알면, Fable 5가 그 문제를 어떻게 해결했는지 직접 비교할 수 있다"
      ja: "Mythos Previewが制限公開だった理由を知ることで、Fable 5がその問題をどう解決したかを直接比較できる"
      en: "Understanding why Mythos Preview was restricted-access helps you directly compare how Fable 5 resolved those concerns"
      zh: "了解Mythos Preview为何限制访问，有助于直接比较Fable 5如何解决了那些顾虑"
  - slug: claude-opus-4-8-dynamic-workflows-parallel-agents-guide
    score: 0.91
    reason:
      ko: "Fable 5로 업그레이드할지 고민 중이라면, 현재 Opus 4.8의 Dynamic Workflows와 병렬 에이전트 성능을 먼저 파악하는 것이 전환 비용 계산에 직접적인 기준이 된다"
      ja: "Fable 5へのアップグレードを検討しているなら、Opus 4.8のDynamic WorkflowsとパラレルAgent性能を把握することが切り替えコスト計算の基準になる"
      en: "If you're considering upgrading to Fable 5, understanding Opus 4.8's Dynamic Workflows and parallel agent performance is the direct baseline for calculating migration cost"
      zh: "如果考虑升级到Fable 5，了解Opus 4.8的Dynamic Workflows和并行Agent性能是计算迁移成本的直接基准"
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.87
    reason:
      ko: "Fable 5의 $10/$50 요금이 경쟁사 대비 어느 위치에 있는지, 성능 대비 비용 효율을 가장 넓은 시야로 보고 싶다면 이 비교 가이드가 출발점이다"
      ja: "Fable 5の$10/$50料金が競合他社と比較してどの位置にあるか、パフォーマンス対コスト効率を最も広い視点で見たいなら、この比較ガイドが出発点になる"
      en: "To see where Fable 5's $10/$50 pricing sits against competitors and evaluate cost-per-performance at the widest view, this comparison guide is the starting point"
      zh: "要了解Fable 5的$10/$50定价在竞争对手中的位置，并从最广视角评估性能成本比，这份比较指南是起点"
  - slug: anthropic-claude-opus-4-7-managed-agents-2026
    score: 0.82
    reason:
      ko: "Opus 4.7에서 Fable 5로 이어지는 Anthropic 모델 진화를 이해하면, task_budget 설계나 managed agent 아키텍처가 새 모델에서 어떻게 달라지는지 파악하기 쉽다"
      ja: "Opus 4.7からFable 5へのAnthropicモデル進化を理解することで、task_budgetの設計やmanaged agentアーキテクチャが新モデルでどう変わるかが把握しやすくなる"
      en: "Understanding the Anthropic model evolution from Opus 4.7 to Fable 5 makes it easier to grasp how task_budget design and managed agent architecture change in the new model"
      zh: "了解Anthropic模型从Opus 4.7到Fable 5的演进，有助于掌握新模型中task_budget设计和managed agent架构的变化"
---

[AnthropicがProject GlasswingでMythos Previewを公開した2026年4月](/ja/blog/ja/claude-mythos-preview-glasswing-ai-cybersecurity)、私はこのモデルがいつ一般公開されるのか正直なところ半信半疑だった。SWE-bench 93.9%という数字を持ちながら12社限定の制限配布という決断が、巧みなマーケティングなのか本物の安全懸念なのか判断しかねていた。

それから2か月。2026年6月9日、Anthropicが<strong>Claude Fable 5</strong>を一般公開した。Mythosの大衆化バージョンだ。`claude-fable-5`というモデルIDでAPIから直接使えるようになった。

公開直後、TwitterとHacker Newsには「ついに」と「もう出たのか」が混在した。私は公式リリースノート、APIドキュメント、ベンチマークデータを2日間かけて確認した。<strong>Opus 4.8の2倍というAPIコストを払う価値があるか</strong>を判断するのがこの記事の目的だ。

実際にAPIを呼び出して比較はできていない。代わりに公式ドキュメント、SDKマイグレーションガイド、開発者コミュニティの反応を基に「今Fable 5に移行すべきか」を分析した。

## Fable 5の実体：安全フィルターを乗せたMythos

`claude-fable-5`と`claude-mythos-5`は同一の基盤モデルだ。ウェイトが同じで、推論能力も同じ。違いは一つ、<strong>安全ルーティング</strong>だ。

Fable 5にはサイバーセキュリティ、生物・化学合成、AIモデル蒸留(distillation)に関するリクエストを検出する分類器が搭載されている。この分類器に引っかかるクエリはFable 5が直接応答せず、自動的に<strong>Claude Opus 4.8にルーティング</strong>される。レスポンスはOpus 4.8が生成し、料金もOpus 4.8基準($5/$25/MTok)で課金される。ルーティングの有無はレスポンスヘッダーで確認できる。

Mythos 5はこの分類器なしで動作する。Project Glasswingに登録されたサイバー防衛・重要インフラ企業のみアクセス可能で、2026年6月時点でも招待制だ。

開発者視点で不便なのは<strong>ルーティング基準の不透明さ</strong>だ。どのクエリが分類器に引っかかるか事前にわからない。セキュリティ監査コード、CVE分析パイプライン、タンパク質構造データ処理、モデル圧縮実験のような合法的な一般的な作業が分類器に引っかかる可能性がある。2.6倍のコストを払っているのに実際にはOpus 4.8のレスポンスを受け取る状況が生じうる。

## ベンチマーク95%の文脈と落とし穴

Anthropicが公開した主要数値をまとめると：

| モデル | SWE-bench Verified | SWE-bench Pro |
|--------|-------------------|---------------|
| Claude Fable 5 | 95.0% | 80.3% |
| Claude Opus 4.8 | 88.6% | 69.2% |
| GPT-5.5 | 78.2% | 58.6% |
| Gemini 3.1 Pro | 80.6% | 54.2% |

SWE-bench Pro基準でFable 5とOpus 4.8の差は11.1ポイントだ。SWE-bench Proは実際のオープンソースPRから抽出した問題で、単純なコード補完ではなく複雑なバグ修正とリファクタリングを要求する。この差が本当のコーディング能力の違いを反映しているなら、マルチファイルコードベースでの複雑な修正作業で体感差が出るはずだ。

ただしベンチマーク数値をそのまま信用する前にいくつか考慮点がある。

まず<strong>ベンチマーク特化チューニング問題</strong>だ。SWE-benchリーダーボード競争が激化する中、一部のモデルがベンチマークパターンに過学習しているという疑惑がコミュニティで上がっている。95%が私の実際のプロダクションコードベースでも同等に出るかは直接確認前にはわからない。

またHebbia Finance Benchmarkでは文書ベースの推論、チャート・表の解釈、問題解決で大きな差を示したという点は、<strong>金融、法務、研究文書分析エージェント</strong>に特に意味がある数値だ。純粋なコーディングエージェントで同等の差が出るかは別問題だ。

## APIで必ず確認すべき変更点

Fable 5はOpus系列とAPIインターフェースが異なる。マイグレーション前に見落とすとプロダクションでエラーが出る。

<strong>Thinkingパラメータの変更：</strong>
Opus 4.8では`thinking: {type: "disabled"}`で推論をオフにできた。Fable 5ではこの設定が<strong>400エラー</strong>を返す。Thinkingは常にオンだ。`{type: "adaptive"}`のみ許容される。`temperature`、`top_p`、`top_k`も全て削除されている。

```python
# ❌ Opus 4.8では動作するがFable 5では400エラー
client.messages.create(
    model="claude-fable-5",
    thinking={"type": "disabled"},  # 400エラー！
    temperature=0.7,                # 400エラー！
    max_tokens=4096,
    messages=[...]
)

# ✅ Fable 5の正しい書き方
client.messages.create(
    model="claude-fable-5",
    # thinkingパラメータは省略（常にadaptive）
    output_config={"effort": "high"},
    max_tokens=4096,
    messages=[...]
)
```

<strong>refusal stop_reasonの追加：</strong>
Fable 5は安全分類器がリクエストを拒否する際にHTTP 200で`stop_reason: "refusal"`を返す。`content`配列が空になる。既存コードが`response.content[0]`を直接読んでいるとインデックスエラーが出る。`stop_reason`チェックを先に行う必要がある。

<strong>30日データ保持義務：</strong>
Fable 5はZDR(Zero Data Retention)設定の組織では使用できない。医療、金融などZDR契約を結んでいる企業はすぐに使えない点に注意が必要だ。

<strong>トークナイザー差異によるコスト再計算：</strong>
Fable 5はOpus系列と異なるトークナイザーを使う。同一のプロンプトがFable 5で約30%多いトークン数で処理される。単価が2倍なだけでなくトークン数も増えるため、Opus 4.8で測定した`max_tokens`値をそのまま使うのは危険だ。

## エージェントワークフローでのFable 5活用パターン

Fable 5がOpus 4.8対比で最も明確な価値を発揮できるのは<strong>長時間マルチステップエージェント作業</strong>だ。単一APIコールよりも、エージェントが数十〜数百回ツールを呼び出しながら長時間自律実行する場合、ステップ毎のエラー率の差が最終結果品質に複利のように積み重なる。

コードベースリファクタリングエージェントが100ステップ実行する際、ステップ毎の成功率が99%なら最終成功率は37%、99.5%なら61%だ。モデル品質が1ポイント高くなるだけで実際の成功率の差は大きい。

```python
# エージェントループでのFable 5活用パターン
response = client.messages.create(
    model="claude-fable-5",
    output_config={
        "effort": "high",
        "task_budget": {"type": "tokens", "total": 200_000}
    },
    thinking={"type": "adaptive", "display": "summarized"},
    max_tokens=16_000,
    tools=[...],
    messages=conversation_history
)
```

[Opus 4.8のDynamic Workflowsのように並列エージェントを運用する場合](/ja/blog/ja/claude-opus-4-8-dynamic-workflows-parallel-agents-guide)、サブエージェントに`effort: "low"`を適用し、最終合成ステップのみ`high`を使う戦略でコスト効率を高められる。

## Fable 5 vs Opus 4.8：いつ乗り換えるか

コスト構造を整理すると：

| 項目 | Opus 4.8 | Fable 5 | 倍率 |
|------|----------|---------|------|
| 入力 /1Mトークン | $5.00 | $10.00 | 2倍 |
| 出力 /1Mトークン | $25.00 | $50.00 | 2倍 |
| トークナイザーオーバーヘッド | 基準 | +30% | — |
| 実効入力コスト比較 | 基準 | 約2.6倍 | — |
| ZDRサポート | ✓ | ✗ | — |

月のOpus 4.8コストが$500だった場合、Fable 5に全面移行すると$1,300以上になる計算だ。

<strong>移行する価値がある場合：</strong>
- コンテキストが100Kトークンを超える大型コードベースでの複雑なリファクタリング自動化
- 金融文書、法律契約書、研究論文の精密な分析
- エージェント実行失敗のコストがモデルコストを上回る場合
- Claude Codeのようなツールヘビーエージェントで長時間作業を実行する場合

<strong>まだ待つ理由がある場合：</strong>
- RAGパイプラインの単純な要約・分類・感情分析
- トークン数が多いバッチ処理
- ZDR契約組織
- セキュリティ・化学・蒸留関連ワークフロー（安全ルーティングでOpus 4.8に切り替わる可能性）

## 実行可能性の判断

<strong>直接API呼び出しの可否：</strong>この分析ではFable 5 APIを直接呼び出していない。Opus 4.8対比の実際のコーディング品質差、ルーティング分類器がどのクエリでトリガーされるか、レスポンス遅延の差は実際の環境での再現可能な範囲外だ。

<strong>私が再現できた範囲：</strong>APIドキュメントでbreaking changeを確認し、SDKマイグレーションガイドのエラーパターンを分析した。`thinking: {type: "disabled"}`が400を返すこと、`stop_reason: "refusal"`処理が必要なこと、トークナイザー差異によるコスト再測定の必要性は公式ドキュメントで明確に確認された内容だ。

## 私の判断：今すぐ使う人とまだ待つ人

正直なところ、<strong>今すぐOpus 4.8をFable 5に全面移行する理由はあまりないと思う。</strong>

Opus 4.8はわずか3週間前に出たモデルだ。SWE-bench Pro 69.2%も6か月前の基準ではフロンティア性能だった。11ポイントの差が自分の実際の作業で体感できるかは直接A/Bテストなしにはわからない。

API変更点もかなりある。既存Opus用コードをそのまま持ってくるとすぐエラーが出る。マイグレーション作業自体がタダではない。

何より<strong>安全ルーティングの不透明さ</strong>が最も不便に感じる部分だ。2.6倍のコストを払っているのに一部はOpus 4.8が処理している可能性がある。これはユーザーが制御できない部分だ。

<strong>私の推奨アプローチ</strong>は全面移行ではなく選択的利用だ。Pro/Max/TeamサブスクライバーはJune 22まで無料で試せる。今が最もコスト効率よく体験できるタイミングだ。最も複雑なタスク一つにFable 5を使ってみて、Opus 4.8対比の差を直接感じてから判断するのが合理的だ。

## Source Reviewの限界についての注記

この記事はAnthropicの公式リリースノート、APIドキュメント、SDKマイグレーションガイド、コミュニティベンチマークデータを基に作成した。Fable 5 APIを直接呼び出してOpus 4.8と比較はしていない。「ベンチマーク上の11ポイント差が自分の実際のコードベースでも出る」という主張は私には検証できない。性能差を判断するには、自分の実際のクエリでA/Bテストを直接行う必要がある。

参考ソース：[Anthropic公式発表](https://www.anthropic.com/news/claude-fable-5-mythos-5)、[APIドキュメント](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5)、[SWE-bench Proリーダーボード](https://www.morphllm.com/swe-bench-pro)
