---
title: Mistral Voxtral TTS — 3秒ボイスクローニング＋オープンウェイト、しかし日本語非対応
description: >-
  Mistralが公開した4BパラメータオープンウェイトTTSモデルVoxtralを分析する。3秒ボイスクローニング機能を備え人間評価でElevenLabsを超えた実力を持ちながら、日本語・韓国語非対応という致命的な弱点がアジア市場での利用を阻む。CC
  BY NCライセンスの注意点と代替案も解説する。
pubDate: '2026-03-29'
heroImage: ../../../assets/blog/mistral-voxtral-tts-open-weight-speech-hero.jpg
tags:
  - ai
  - tts
  - open-source
  - speech
  - mistral
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-sonnet-46-release
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: functiongemma-270m-tool-calling
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: moltbook-ai-theater-human-control
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-agent-persona-analysis
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

3月26日、Mistral AIがVoxtralというTTSモデルを公開しました。4Bパラメータ、オープンウェイト、3秒の音声サンプルだけでボイスクローニング。スペックだけ見れば、今年のTTSシーンで最もアグレッシブな発表です。

私はちょうどこの2週間、ブログ動画自動化パイプラインでChirp3 HD、Gemini TTS、Edge TTSを比較するのにかなりの時間を費やしていました。だからVoxtralの発表を見た瞬間、「これパイプラインに組み込めるか？」が最初の反応でした。結論から言うと、まだ無理です。理由があります。

## 数字で見るVoxtral

Voxtralのコアスペックをまとめます：

- **パラメータ**: 4B（Hugging Face: `mistralai/Voxtral-4B-TTS-2603`）
- **レイテンシ**: モデル70ms、ストリーミング対応
- **ボイスクローニング**: 3秒のオーディオサンプルでzero-shot/few-shot可能
- **対応言語**: 英語、フランス語、ドイツ語、スペイン語、オランダ語、ポルトガル語、イタリア語、ヒンディー語、アラビア語 — **9言語**
- **ライセンス**: CC BY NC 4.0（非商用利用は無料）
- **商用API**: $0.016 / 1,000文字

人間評価（human evaluation）でElevenLabs Flash v2.5に勝ったとのことです。Mistral側の発表なので独立検証は必要ですが、ブラインドA/Bテストの結果を公開したこと自体は自信の表れでしょう。

4Bというサイズも注目です。最近のスマートフォンNPUは7〜10Bの推論をこなし始めているので、VoxtralはオンデバイスTTSの現実的な候補です。[Kitten TTS](/ja/blog/ja/kitten-tts-v08-tiny-sota)（14M）ほど極端に小さくはありませんが、品質とサイズのバランスが興味深い。

## TTSエンジン比較：実際に使ってみたもの

正直なところ、TTS比較表はスペックだけでは意味がありません。同じ「自然な音声」でもプロソディ、感情表現、言語別の品質差が大きい。それでも、現在私のパイプラインで検討したエンジンとVoxtralを並べてみると：

| 項目 | Voxtral | Gemini TTS (Charon) | ElevenLabs Flash v2.5 | Chirp3 HD |
|------|---------|--------------------|-----------------------|-----------|
| パラメータ | 4B | 非公開 | 非公開 | 非公開 |
| オープンウェイト | O（CC BY NC 4.0） | X | X | X |
| ボイスクローニング | 3秒zero-shot | X | O（即時） | X |
| 日本語 | **X** | O | O | O |
| 韓国語 | X | O | O | O |
| オンデバイス | O（4B） | X | X | X |
| レイテンシ | 70ms | ~200ms | ~100ms | ~300ms |
| 料金（1k文字） | $0.016 | $0.001~ | $0.30 | 無料（制限付き） |

私はこの表で2つが目に入ります。まず、Voxtralだけがオープンウェイトかつオンデバイス対応であること。これは他のエンジンでは得られない価値です。次に、日本語と韓国語が欠けていること。この点は下で詳しく触れます。

## 3秒ボイスクローニングの意味

Voxtralのzero-shotボイスクローニングは、3秒の音声サンプル1つで話者の音色、イントネーション、速度を複製します。few-shotならさらに精度が上がります。

```python
# Voxtral APIによるボイスクローニング例
import requests

response = requests.post(
    "https://api.mistral.ai/v1/audio/speech",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "voxtral-4b-tts-2603",
        "input": "Hello, this is a voice cloning demonstration.",
        "voice_sample": "base64_encoded_3sec_audio",  # 3秒サンプル
        "language": "en",
        "stream": True
    }
)
```

以前取り上げた[KaniTTS2](/ja/blog/ja/kanitts2-voice-cloning)が3GB VRAMでボイスクローニングを実現したのに対し、VoxtralはAPI一行で済みます。もちろんローカルで動かすならHugging Faceからウェイトをダウンロードして自前で推論する必要がありますが、4Bモデルなので8GB VRAMで十分でしょう。

率直に言って、3秒クローニングの品質が実際にどのレベルかは直接聴いてみないとわかりません。Mistralのデモページのサンプルは印象的でしたが、デモというのは常にベストケースを見せるものです。

## 致命的な空白：日本語と韓国語

ここが本題です。9つの対応言語に日本語がありません。韓国語もありません。

私のように日本市場をメインターゲットにコンテンツを作っている人間にとって、これは「残念」というレベルではなく「使えない」という意味です。ブログ動画パイプラインは4言語（ko、ja、en、zh）の音声が必要ですが、Voxtralはこのうち英語1つしかカバーしません。中国語もありません。

Mistralはフランスの会社で、対応言語リストを見るとヨーロッパ言語＋ヒンディー語＋アラビア語という構成です。市場の優先順位が明確です。アジア言語対応はロードマップにあるでしょうが、今すぐ私たちのパイプラインに統合することはできません。

これがVoxtralに対する私の最大の不満です。モデル自体の品質やアーキテクチャではなく、言語カバレッジのせいで評価すらまともにできない。

## ライセンスの落とし穴

CC BY NC 4.0というライセンスにも注意が必要です。「オープンウェイト」だからといって自由に商用化できるわけではありません。

- **非商用**: 無料、自由に使用可能
- **商用**: 必ずMistral API（$0.016/1k文字）を使用する必要あり
- **ファインチューニング**: ウェイトをダウンロードして研究・個人用のファインチューニングは可能だが、成果物を商用配布するとライセンス違反

これはMetaのLlama（コミュニティライセンス）やStability AIのモデル（オープンライセンス）とは異なる戦略です。Mistralはオープンウェイトをマーケティングツールとして使いながら、実際の収益はAPIで得るという構造です。悪い戦略ではありませんが、「オープン」という言葉への期待値を調整する必要があります。

## 誰が使うべきか

結論として、Voxtralは以下の条件が合う人に魅力的です：

1. **英語中心のプロジェクト**: 英語TTSの品質が最優先で、オープンウェイトが必要な場合
2. **オンデバイスTTSが必要な場合**: 4Bサイズはモバイル/エッジ展開に現実的
3. **ボイスクローニングがコア機能の場合**: 3秒zero-shotは競争力がある
4. **ヨーロッパ多言語対応**: フランス語、ドイツ語、スペイン語などが必要なら良い選択

一方、日本語・韓国語・中国語が必要なプロジェクトなら、現時点ではGemini TTSやElevenLabsが現実的です。私は当面、動画パイプラインでEdge TTS（無料、多言語対応）とGemini TTS（最高品質）を併用する予定です。Voxtralがアジア言語を追加した時に改めて評価するつもりです。

オープンウェイトTTSという方向性自体は応援しています。音声合成分野もLLMのようにオープンモデルが商用サービスを追い上げる流れが生まれており、Voxtralはその流れの最も力強いシグナルです。ただし、シグナルと実戦投入の間にはまだ距離があります。
