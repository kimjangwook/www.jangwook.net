---
title: PrismML Bonsai — 1.15GBの8Bモデルってアリなの?
description: >-
  Caltechチームが作ったPrismML Bonsaiは、重みを{-1, +1}だけで表現する1-bit LLMだ。
  8Bモデルが1.15GBに収まり、フル精度の8倍速いという。実際に確認してみた。
pubDate: '2026-04-08'
heroImage: ../../../assets/blog/prismml-bonsai-1bit-llm-edge-ai-hero.jpg
tags:
  - 1-bit-llm
  - edge-ai
  - prismml
  - model-compression
  - local-llm
relatedPosts:
  - slug: ai-model-rush-february-2026
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gemini-31-pro-release
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: kanitts2-voice-cloning
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: windsurf-arena-mode-speed-over-accuracy
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: deepseek-v4-release
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
draft: true
---

先週の金曜日、PrismMLというステルススタートアップが$16.25Mのシードラウンドとともに姿を現した。Caltechの研究者が創業し、引っさげてきたのはBonsaiという1-bit LLMファミリーだ。8Bパラメータのモデルが1.15GB。数字だけ見ると何かが間違っているような気がする。

普通、8Bモデルといえば FP16ベースで16GB前後を食う。Q4量子化をかけても4〜5GBは必要だ。なのに1.15GB? 14倍小さいということだが、これで本当に実用的なクオリティが出るのかどうか——それが核心の問いだ。

## まず「1-bit」って何?

名前がちょっと誤解を招く。「1-bit」と言われると0と1だけを使うイメージだが、実際には重みを{-1, +1}の二値だけで表現する。符号一つ。掛け算が消えて足し算と引き算だけになる。行列積（MatMul）が事実上ビット演算に置き換わるから、計算量が劇的に減る。

このアイデア自体は新しくない。Microsoft ResearchのBitNet論文が2023年に出ていて、2024年にはBitNet b1.58がternary（{-1, 0, +1}）方式でフォローアップ研究を発表している。PrismMLがやったのは、それを実際に使えるモデルとして仕上げたことだ。

## 公開されたモデルラインナップ

PrismMLが出してきたのは三種類だ:

- **Bonsai 8B** — 1.15GB、Llama 3 8B級の性能を目標
- **Bonsai 4B** — 0.5GB、軽めのタスク向け
- **Bonsai 1.7B** — 0.24GB、240メガバイト。ラズベリーパイでも動く

HPCwireの報道によると、フル精度比で14倍小さく、8倍速く、エネルギー効率は5倍とのこと。ベンチマークの詳細数値が一部未公開なので、そこはもう少し様子を見る必要がある。

## 懐疑的な部分

この技術は面白いと思っているが、いくつかがまだ不透明だと感じている。

**一つ目、ベンチマークが足りない。**「Llama 3 8B級の性能」という表現は何度も出てくるのに、MMLUやHumanEvalといった標準ベンチマークでの比較が限定的だ。1-bit量子化での品質劣化がどの程度か、特に推論（reasoning）タスクでどれだけ落ちるのかが抜けている。$16Mのシードを調達した会社がベンチマークを出し渋るのは、あまりいいサインじゃないかもしれない。

**二つ目、「1-bitで十分な」タスクの範囲が狭い可能性がある。**単純な分類や感情分析、簡単な要約くらいならいけそうだ。だが、複雑なマルチターン会話やコード生成で1-bitモデルがQ4量子化モデルに勝てる理由が、正直まだ見えない。サイズが小さいのは明確なアドバンテージだが、その代わりに何を失っているのかが、まだ透明に開示されていない。

## それでも意味がある理由

懐疑的な話をしたけど、この方向性自体は正しいと思っている。

今のLLMエコシステムで最大のボトルネックはGPUメモリだ。ローカルでモデルを動かしたくても VRAMの制約で量子化をかけて、それでも無理なら小さいモデルに切り替える——そういう流れが当たり前になっている。1.15GBなら、この制約を根本から回避できる。M1 MacBook Airのユニファイドメモリで余裕で動くし、スマートフォンでも現実的な話になる。

ちょうどGoogleが一昨日（4月7日）、LiteRT-LMというエッジデバイス向けのLLM推論フレームワークを公開した。Android、iOS、ウェブ、デスクトップ、IoTをすべてカバーし、GPU/NPUアクセラレーションにも対応している。PrismMLのような超軽量モデルと、LiteRT-LMのようなランタイムが組み合わさると、「オフラインで動くLLM」が単なるデモじゃなく、本物のプロダクトになれる環境が整ってくる。

個人的に一番期待しているのはプライバシーのユースケースだ。医療データや社内文書をクラウドに送らずデバイス上で処理するというのは、規制が厳しい業界でのLLM導入における最大の障壁を取り除くことを意味する。

## 今後確認すべきこと

BonsaiモデルがHugging Faceに上がったら、実際に動かしてみるつもりだ。特に気になるのは:

- Q4_K_Mで量子化した同サイズのモデル（例: Phi-3 mini 3.8B）と品質を比べたらどうか
- 日本語・韓国語のような非英語圏の言語でどれだけ性能が落ちるか
- ファインチューニングができるかどうか、できるなら1-bit重みでどうやってグラジエントを伝播させるのか

1-bit LLMが汎用モデルを置き換えるとは思っていない。でも「このくらいのクオリティで十分」というユースケースが思っているより多ければ、モデルデプロイの前提が変わるかもしれない。クラウドAPIコール一回に数十ミリ秒かかるレイテンシーの代わりに、デバイス上で数ミリ秒で応答する世界。それが1.15GBで実現できるなら、無視はできない。

PrismMLが本格的にベンチマークを公開するタイミングが、本当の評価の分岐点になるだろう。
