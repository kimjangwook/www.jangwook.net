---
title: 'Gemini 2.5 Flash Thinking API 実践ガイド — thinking_budget実験まとめ'
description: 'Gemini 2.5 FlashのThinking BudgetをBudget=0/1024/8000の3パターンで、単純タスク・数学推論・コードレビューに実験した。単純タスクは5倍遅くなり、数学問題では逆に出力トークンを削減する。タスク別最適設定フレームワークを公開する。'
pubDate: '2026-05-17'
heroImage: '../../../assets/blog/gemini-25-flash-thinking-api-developer-guide-2026/hero.png'
tags:
  - gemini
  - llm
  - api
  - thinking
  - tutorial
relatedPosts:
  - slug: gemini-25-flash-api-cost-optimization-guide
    score: 0.92
    reason:
      ko: 'Gemini 2.5 Flash의 비용 최적화 전략을 다룬 글로, Thinking Budget 비활성화가 어떤 상황에서 올바른 선택인지 이 글과 대조해서 읽으면 전략이 완성된다.'
      ja: 'Gemini 2.5 Flashのコスト最適化を扱った記事。Thinking Budgetを無効にするケースと有効にするケースを対比して読むと戦略が明確になる。'
      en: 'The companion cost optimization guide covers when to disable Thinking. Read alongside this post to build a complete decision framework.'
      zh: '这篇成本优化指南介绍何时禁用Thinking。与本文对照阅读，可以建立完整的决策框架。'
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.81
    reason:
      ko: 'Thinking 토큰 비용이 일반 출력 토큰과 같은 요금으로 청구된다는 사실을 LLM API 가격 비교 글과 함께 보면 실제 운영 비용 계산이 가능하다.'
      ja: 'Thinkingトークンのコスト計算はLLM API価格比較記事と合わせて読むと実際の運用コストが見えてくる。'
      en: 'Thinking tokens are billed at the same rate as output tokens — pair this with the LLM pricing comparison to calculate real operational costs.'
      zh: 'Thinking令牌按与输出令牌相同的费率计费，结合LLM API定价比较文章可以计算实际运营成本。'
  - slug: gemini-31-flash-live-realtime-voice-agent
    score: 0.74
    reason:
      ko: 'Gemini 3.1 Flash Live API로 실시간 음성 에이전트를 만든 경험을 담은 글. 같은 Gemini 모델 계열에서 스트리밍과 Thinking의 교집합 지점을 확인할 수 있다.'
      ja: 'Gemini 3.1 Flash LiveでリアルタイムVoice Agentを構築した体験記。Streamingとの交差点が見えてくる。'
      en: 'First-hand experience building a real-time voice agent with Gemini 3.1 Flash Live. Shows where streaming and Thinking intersect in the same model family.'
      zh: '使用Gemini 3.1 Flash Live构建实时语音智能体的经验。展示了流式传输与Thinking在同一模型系列中的交叉点。'
  - slug: ai-agent-cost-reality
    score: 0.70
    reason:
      ko: 'AI 에이전트 운영 비용의 현실을 솔직하게 분석한 글. Thinking 토큰 비용이 누적될 때 어떤 결과를 초래하는지 맥락을 제공한다.'
      ja: 'AI Agentの運用コストを正直に分析した記事。Thinkingトークンが積み重なるとどうなるかのコンテキストになる。'
      en: 'An honest analysis of AI agent operating costs. Provides context for what happens when Thinking token costs accumulate at scale.'
      zh: '对AI智能体运营成本的诚实分析。提供Thinking令牌成本累积时的影响背景。'
---

「Thinking機能をオンにすれば必ず賢くなる」と漠然と思っていた。直接実験してみると、半分だけ正しかった。

Gemini 2.5 Flashの`thinking_budget`パラメータを、単純タスク・数学推論・コードレビューの3シナリオでそれぞれ0・1024・8000に設定して実験した。数字そのものより、結果の解釈が面白かった。

## Thinking APIが実際にやっていること

`thinking_budget`は、モデルが回答前にどれだけの「隠れた推論」ができるかをトークン数で制限するパラメータだ。Budget=0でthinkingを完全に無効化する。Budget=-1はモデルが必要な分だけ自律的に推論する。正の整数を渡すとその値が上限になる（最大24576）。

重要な点がある。thinkingトークンは応答として出力されないが、**コストは同じ料金で課金される**。出力トークンと同じ料金だ。[LLM API価格比較の記事](/ja/blog/ja/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)でも確認できるように、Gemini 2.5 Flashの出力トークン料金は$0.0035/1Kトークン。thinking 1024トークンを使えばその分が追加コストになる。

APIの使い方は、2024年まで使っていた`google.generativeai`パッケージではなく、新しい`google-genai`パッケージを使う必要がある。これは見落としやすいポイントだ。

```python
# ❌ Deprecated（更新なし）
import google.generativeai as genai

# ✅ 現在の標準
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="質問内容",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=1024,
            include_thoughts=True,  # thinkingプロセスを応答に含める
        ),
    ),
)

# 応答からthinkingと実際の回答を分離
for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"[Thinking] {part.text[:100]}...")
    else:
        print(f"[Answer] {part.text}")
```

`include_thoughts=True`にすると、モデルの内部推論プロセスも応答パーツとして確認できる。デバッグに役立つ。

## 実験方法と測定項目

新しいサンドボックスディレクトリを作成して`google-genai`パッケージだけをインストールし、3種類のプロンプトタイプにBudget=0/1024/8000をそれぞれ適用した。

測定項目：
- **応答時間（秒）**: wall clock time
- **出力トークン**: 実際の回答トークン数
- **thinkingトークン**: 内部推論に消費されたトークン数（`usage_metadata.thoughts_token_count`）

プロンプト3種：
1. **単純タスク**: 「Pythonでリストをソートする方法を一文で説明して」
2. **数学推論**: 2桁の正の整数が3条件を満たすものを全て求める問題
3. **コードレビュー**: シンプルなPython関数からバグと改善点を見つける

## 実験結果：数字が語ること

実際に測定した数値だ。飾らずそのまま公開する。

| タスク種別 | Budget=0 | Budget=1024 | Budget=8000 |
|-----------|----------|-------------|-------------|
| 単純タスク | 1.4秒 / 出力54tok | 6.8秒 / 出力61tok / thinking 751tok | 9.0秒 / 出力45tok / thinking 1282tok |
| 数学推論 | 8.8秒 / 出力2143tok | 15.1秒 / 出力1915tok / thinking 918tok | 26.2秒 / 出力1671tok / thinking 4036tok |
| コードレビュー | 6.7秒 / 出力1367tok | 13.1秒 / 出力1126tok / thinking 734tok | 22.6秒 / 出力2055tok / thinking 1824tok |

**単純タスク**: Budget=0で1.4秒だったのに対し、Budget=1024では6.8秒かかった。ほぼ5倍遅い。回答品質は実質同じだった。Budget=8000は1282 thinkingトークンを消費したが、出力はむしろ45トークンに減った。明らかに過剰だ。

**数学推論**: ここで予想外の結果が出た。Budget=0のとき出力トークンが2143個だ。モデルが「声に出して考え」ながら解法プロセスを全て出力したからだ。Budget=1024ではthinking 918トークン + 出力1915トークンで、Budget=0より総消費トークンは似ているが回答の構造がより整っていた。Budget=8000はthinkingが深くなることで出力が1671トークンに減った。

**コードレビュー**: Budget=1024で出力が1367→1126に減った。より集中した回答が出てきた。Budget=8000では2055トークンに増え、より包括的な分析をしていた。使用目的に応じて選択が変わる。

## タスク種別ごとの最適Budget選択

実験を踏まえた実用的なフレームワークを整理した。絶対的な公式ではないが、出発点としては有効だ。

**Budget=0（thinking無効化）**が適切なケース：
- 分類、ラベリング、タグ付け作業
- 要約、翻訳、フォーマット変換
- 単純なQ&A、事実確認
- 高頻度バッチ処理（コスト重視）

Budget=0で単純タスクが1.4秒で応答した。このタスクに1024 budgetを与えると6.8秒待つことになり追加コストも発生する。明らかに無駄だ。

**Budget=1024〜2048（中程度のthinking）**が適切なケース：
- コードレビュー、バグ検出（集中した分析が必要なとき）
- 中程度の推論
- 多段階の判断が必要だが、遅延に敏感なケース

正直に言うと、コードレビューでBudget=1024の結果がBudget=0より回答が短くなったのに、内容は良かった。不要なパディングがなくなり、核心だけが残った。

**Budget=4000〜8000（深いthinking）**が適切なケース：
- 複雑な数学問題、アルゴリズム設計
- 徹底的なアーキテクチャレビュー
- 多段階の計画立案
- 精度がスピードよりはるかに重要な作業

Budget=8000の数学問題では4036 thinkingトークンを消費した。応答時間は26秒。通常の対話型アプリではこの遅延は受け入れがたい。バッチ処理やバックグラウンド分析にのみ使うべきだ。

[Gemini 2.5 Flash コスト最適化ガイド](/ja/blog/ja/gemini-25-flash-api-cost-optimization-guide)でも述べたが、thinkingトークンの料金が出力トークンと同じという点は必ず覚えておくべきだ。Budget=8000を無闇に使うとコストが数倍に膨らむ。

## 実際のコード：thinkingトークン追跡パターン

本番環境でthinking使用量を追跡するパターンを共有する。

```python
from google import genai
from google.genai import types
import time

def generate_with_thinking(
    client: genai.Client,
    prompt: str,
    budget: int = 1024,
    model: str = "gemini-2.5-flash",
) -> dict:
    """thinking使用量を追跡しながら応答を生成する。"""
    start = time.perf_counter()
    
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=budget,
            include_thoughts=False,  # 本番環境ではFalse
        ),
    )
    
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    
    elapsed = time.perf_counter() - start
    usage = response.usage_metadata
    
    return {
        "text": response.text,
        "latency_s": round(elapsed, 2),
        "input_tokens": usage.prompt_token_count,
        "output_tokens": usage.candidates_token_count,
        "thinking_tokens": getattr(usage, "thoughts_token_count", 0) or 0,
        "total_tokens": (
            usage.prompt_token_count
            + usage.candidates_token_count
            + (getattr(usage, "thoughts_token_count", 0) or 0)
        ),
    }

# 使用例
client = genai.Client(api_key="YOUR_API_KEY")

result = generate_with_thinking(
    client,
    "このコードの潜在的なメモリリークを見つけてください: ...",
    budget=2048,
)

print(f"遅延: {result['latency_s']}s")
print(f"thinkingトークン: {result['thinking_tokens']}")
print(f"総コストトークン: {result['total_tokens']}")
```

`usage_metadata.thoughts_token_count`が実際に0を返すことがある。`budget=0`のとき、またはモデルがthinkingなしで十分だと判断したときだ。この値をモニタリングに含めると、実際にthinkingがどれだけ発動しているか把握できる。

## 残念だった点

正直に言うと、Thinking APIに失望した部分もある。

第一に、**動的モード（Budget=-1）が予測不能**だ。モデルが自律的にbudgetを決めるのは便利に見えるが、単純タスクでもthinkingを発動させることがある。私の実験した単純タスクでBudget=-1がBudget=1024とほぼ同じ時間（6.8秒程度）を使った。遅延とコストが予測しにくいのは本番環境では大きなデメリットだ。

第二に、**thinking_budgetとthinking_levelを同時に設定すると400エラー**になる。Gemini 3.x系は`thinking_level`を使い、2.5系は`thinking_budget`を使う。移行中のコードでこの部分を混用するとエラーが発生する。公式ドキュメントには明記されているが、エラーメッセージが直感的でないため初めて遭遇すると戸惑う。

第三に、**thinkingトークンがキャッシュされない。** Context Cachingで長いシステムプロンプトのコストを削減しても、thinkingトークンは毎回新たに課金される。[AIエージェントのコスト現実分析](/ja/blog/ja/ai-agent-cost-reality)でも触れたように、エージェントループを回すとthinkingコストが予想より早く膨らむ。

## 私の最終的な立場

Thinking APIが過大評価されているわけではない。でも「オンにすればいい」という直感も間違っている。

私の結論はシンプルだ。**Budget=0をデフォルトとして使い、複雑な推論が必要なときだけBudget=1024〜2048を明示的に有効化する。** Budget=8000はバッチ処理や精度が極めて重要なオフライン分析にのみ使う。

動的モード（Budget=-1）は便利だが、コストと遅延が不規則だ。本番APIでは予測可能性が利便性より重要だ。明示的なbudgetを使うほうがいいと思う。

ひとつ意外だった発見：数学推論のような複雑なタスクでは、thinkingを無効化してもモデルが出力の中で「声に出して考え」ながら2143トークンを使う。Budget=1024を与えるとthinkingが内部で行われ、出力が短くなる。総コストの差が思ったより小さいこともある。タスクの特性を見て判断すべきだ。

## おわりに

直接実験していなければ「Thinking = 無条件に良い」という単純な結論を出していただろう。測定してみると違った。

Gemini 2.5 Flash Thinking APIはうまく使えば強力なツールだ。特に複雑な推論タスクで出力トークンをむしろ削減するという逆説的な効果がある。しかし単純なタスクに無闇に適用するとコストと遅延だけが増える。

`thinking_budget`を設定するときは、常にこの問いから始めるべきだ：「このタスクは本当に深い推論を必要としているか？」ほとんどの場合、答えは「ノー」だ。

---

*実験に使用したコード全体はこの記事に含まれるスニペットで再現可能です。google-genai パッケージ 0.8.x 基準で作成しました。*
