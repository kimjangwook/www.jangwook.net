---
title: >-
  Gemma 4をローカルで動かしてみた — 8Bモデルが関数呼び出しまでこなす時代
description: >-
  GoogleがApache 2.0で公開したGemma 4をOllamaで実際にインストールし、日本語・構造化出力・関数呼び出しまでテストした。
  9.6GBのローカルモデルがエージェントパイプラインのビルディングブロックになり得るのか？
pubDate: '2026-04-06'
heroImage: ../../../assets/blog/gemma-4-local-agent-edge-ai-hero.jpg
tags:
  - gemma
  - google
  - open-source
  - local-llm
  - ai-agent
  - function-calling
relatedPosts:
  - slug: qwen3-coder-8gb-vram
    score: 0.88
    reason:
      ko: Qwen3-Coder를 8GB VRAM에서 돌리는 방법을 다뤘다. 제한된 하드웨어에서 로컬 LLM을 활용하는 관점에서 Gemma 4와 직접 비교해볼 수 있다.
      ja: Qwen3-Coderを8GB VRAMで動かす方法を扱った。限られたハードウェアでローカルLLMを活用する観点からGemma 4と直接比較できる。
      en: Covers running Qwen3-Coder on 8GB VRAM. Directly comparable to Gemma 4 from the perspective of utilizing local LLMs on limited hardware.
      zh: 介绍了在8GB VRAM上运行Qwen3-Coder的方法。从在有限硬件上利用本地LLM的角度来看，可以与Gemma 4直接比较。
  - slug: google-turboquant-kv-cache-3bit-compression
    score: 0.85
    reason:
      ko: Gemma 4의 Q4_K_M 양자화가 신경 쓰인다면, Google의 TurboQuant 3-bit KV 캐시 압축 기술이 양자화 품질 문제를 어떻게 접근하는지 참고할 만하다.
      ja: Gemma 4のQ4_K_M量子化が気になるなら、GoogleのTurboQuant 3bit KVキャッシュ圧縮技術が量子化品質問題にどうアプローチしているか参考になる。
      en: If the Q4_K_M quantization of Gemma 4 concerns you, see how Google's TurboQuant 3-bit KV cache compression approaches quantization quality issues.
      zh: 如果你关心Gemma 4的Q4_K_M量化问题，可以参考Google的TurboQuant 3-bit KV缓存压缩技术如何解决量化质量问题。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.82
    reason:
      ko: Gemma 4로 로컬 에이전트를 만들겠다면, 프로덕션 레벨의 에이전트 프레임워크가 필요하다. Dapr Agents가 그 선택지 중 하나다.
      ja: Gemma 4でローカルエージェントを作るなら、プロダクションレベルのエージェントフレームワークが必要だ。Dapr Agentsはその選択肢の一つ。
      en: If you plan to build local agents with Gemma 4, you'll need a production-grade agent framework. Dapr Agents is one such option.
      zh: 如果你打算用Gemma 4构建本地Agent，就需要一个生产级的Agent框架。Dapr Agents就是选择之一。
  - slug: mistral-voxtral-tts-open-weight-speech
    score: 0.80
    reason:
      ko: 오픈 웨이트 모델의 또 다른 사례. Mistral의 음성 합성 모델과 Google의 Gemma 4를 비교하면 오픈소스 AI 생태계의 현주소가 보인다.
      ja: オープンウェイトモデルのもう一つの事例。MistralのTTSモデルとGoogleのGemma 4を比較すると、オープンソースAIエコシステムの現在地が見える。
      en: Another example of open-weight models. Comparing Mistral's TTS model with Google's Gemma 4 reveals the current state of the open-source AI ecosystem.
      zh: 开源权重模型的另一个案例。将Mistral的TTS模型与Google的Gemma 4对比，可以看到开源AI生态系统的现状。
---

`ollama pull gemma4` — このワンライナーで9.6GBのモデルが自分のMacBookに降りてきた。

4月2日、GoogleがGemma 4をApache 2.0ライセンスで公開した。E2Bから31B Denseまで4つのサイズ展開だが、自分が注目したのは基本の8Bモデルだ。「エッジでエージェントを動かす」というマーケティングコピーがどこまで本当なのか、気になったからだ。

## インストールは本当にワンライナーだった

```bash
ollama pull gemma4
# 約9.6GBダウンロード、Q4_K_M量子化
```

`ollama show gemma4`で確認すると、対応機能の一覧が表示される：

```
Capabilities
  completion
  vision
  audio
  tools
  thinking
```

正直驚いた。8Bモデルにビジョン、オーディオ、ツール呼び出し、そしてthinkingまで。Gemma 3にはなかった機能が一気に搭載されている。

## 日本語は使えるレベル、ただし「まあ使える」程度

日本語で自己紹介をさせてみた。

> こんにちは。ユーザーの皆様のご質問に正確かつ迅速にお答えするAIです。

文法的には正確だ。140言語対応を謳っているが、日本語の品質はClaudeやGPT-5系と比べるとまだ差がある。複雑な文脈やニュアンスが求められる質問では、表面的な回答にとどまるケースが多い。ただ、ローカルでオフライン動作する8Bモデルという点を考慮すれば悪くない。

## 本当に驚いたのはFunction Callingだ

今回のGemma 4で最も意義のある変化は、ネイティブなfunction callingだと自分は考えている。実際にOllama APIを通じてテストしてみた：

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "gemma4",
  "messages": [{"role": "user", "content": "東京の天気を教えて"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "都市の現在の天気を取得",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string", "description": "都市名"}
        },
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'
```

レスポンス：

```json
{
  "role": "assistant",
  "content": "",
  "thinking": "1. ユーザーが東京の天気を聞いている...\n2. get_weatherツールが適切だ...",
  "tool_calls": [{
    "function": {
      "name": "get_weather",
      "arguments": {"city": "Tokyo"}
    }
  }]
}
```

注目すべき点が2つある：
1. **thinkingフィールドが同時に返ってくる** — モデルがなぜこのツールを選んだのか、推論過程が見える
2. **ツール呼び出しがクリーンだ** — パラメータを正しいJSON形式で出力している

これがなぜ重要かというと、これまでローカルLLMでエージェントを作ろうとすると、function callingをプロンプトエンジニアリングで迂回する必要があった。「以下の形式で出力してください」というシステムプロンプトを書き、出力をパースし、失敗したらリトライする——そんなやり方だった。Gemma 4ならその手間が不要になる。

## 構造化出力もしっかり動く

JSON形式の出力もテストしてみた：

```bash
echo 'Answer in JSON: {"capital": "<answer>"}. What is the capital of France?' \
  | ollama run gemma4
# → {"capital": "Paris"}
```

個人的に、この程度ならMCPサーバーのローカルバックエンドとして使えそうだという手応えがある。外部API呼び出しなしで社内データを処理するエージェントを作る場合、セキュリティが重要な環境で特に価値がある。

## で、実際に何が作れるのか

自分が考える現実的な活用シナリオは3つだ：

**1. オフラインコードレビューエージェント**
— Git diffを入力にしてコードレビューコメントを生成するローカルエージェント。ソースコードが外部に出てはいけない環境で重宝する。

**2. 社内ドキュメント検索＋要約**
— RAGパイプラインのLLM部分をGemma 4で置き換える。128Kのコンテキストウィンドウがあるので、かなり長い文書も処理できる。

**3. IoT/エッジデバイスの自然言語インターフェース**
— E2B（2B）モデルはRaspberry Pi 5でも動くとされている。スマートホームコントローラーに自然言語コマンドを追加するようなプロトタイプが現実味を帯びてくる。

## 正直に言って物足りない点

Gemma 4をもって「ローカルエージェントの時代が来た」と宣言するのは、まだ時期尚早だと自分は思う。

第一に、**8Bモデルの推論品質の限界**が明確にある。単純なツール呼び出しはうまくいくが、マルチステップ推論が必要な複雑なエージェントタスクではミスが頻発するだろう。Arena AIリーダーボードで31Bモデルがオープンモデル3位とのことだが、8Bと31Bの差はかなり大きい。

第二に、**ベンチマークと実戦のギャップ**。OSWorldやArenaのスコアが良くても、実際の業務環境での安定性は別問題だ。特に日本語のような英語以外の言語では、体感性能がさらに落ちる。

第三に、**量子化の品質問題**。自分がダウンロードしたのはQ4_K_M量子化バージョンだが、オリジナルのFP16と比べてどの程度性能が落ちるか、公式データが公開されていない。4-bit量子化の品質劣化は、推論能力が求められるタスクでより大きく感じられる可能性がある。

## 結論の代わりに

Gemma 4を半日触ってみた所感はこうだ：**「ついにローカルLLMもエージェントツールとして使えるようになった。ただし、まだ補助的な役割にとどまる。」**

自分のワークフローで今すぐ適用できそうな場面を挙げるなら、セキュリティが重要な内部データ処理や、オフライン環境でのシンプルなエージェントタスクあたりだ。メインのエージェントをClaudeやGPT-5.4からGemma 4に切り替えるというのは、まだ無理がある。

それでも、Apache 2.0ライセンスでネイティブfunction callingをサポートする8Bモデルが登場したという事実そのものに意味がある。1年前にはこのレベルの機能をローカルに期待するのは難しかった。`ollama pull gemma4`のワンライナーで誰でも始められるので、実際に動かして自分のユースケースで判断することをおすすめする。
