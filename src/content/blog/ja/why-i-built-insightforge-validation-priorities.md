---
title: 'InsightForgeを予測ではなく検証優先度の道具にした理由'
description: 'LLMのsynthetic panelを市場予測ツールとして売るのではなく、何を検証すべきかを整理するワークフローとしてInsightForgeを設計した理由。synthetic panelの限界、directional score設計、auditable workflowの哲学を詳しく解説します。'
pubDate: '2026-06-15'
heroImage: ../../../assets/blog/llm-consumer-research-hero.jpg
tags: [ai, startup, product-research, insightforge, synthetic-panel]
relatedPosts:
  - slug: 'ai-agent-persona-analysis'
    score: 0.91
    reason:
      ko: 'AI persona 분석과 synthetic panel의 한계를 함께 이해할 수 있습니다.'
      ja: 'AI persona分析とsynthetic panelの限界を合わせて理解できます。'
      en: 'It connects AI persona analysis with the limits of synthetic panels.'
      zh: '可以把AI persona分析和synthetic panel的限制一起理解。'
  - slug: 'dena-llm-study-part2-structured-output'
    score: 0.84
    reason:
      ko: 'LLM 출력을 제품 기능으로 만들 때 왜 구조화가 필요한지 이어서 볼 수 있습니다.'
      ja: 'LLM出力を製品機能にする時、なぜ構造化が必要なのかを続けて読めます。'
      en: 'It explains why structured output matters when LLM results become product features.'
      zh: '说明了为什么把LLM输出产品化时需要结构化。'
  - slug: 'iterative-review-cycle-methodology'
    score: 0.8
    reason:
      ko: '반복 리뷰와 게이트를 통해 품질을 올리는 방법론이 이어집니다.'
      ja: '反復レビューとゲートで品質を上げる方法論につながります。'
      en: 'It extends the discussion into iterative review and quality gates.'
      zh: '延伸到通过迭代审查和质量门提升质量的方法。'
  - slug: 'self-healing-ai-systems'
    score: 0.76
    reason:
      ko: 'AI 시스템을 운영 가능한 제품으로 만들 때 필요한 방어적 설계를 다룹니다.'
      ja: 'AIシステムを運用可能な製品にするための防御的設計を扱います。'
      en: 'It covers defensive design for making AI systems operational.'
      zh: '讨论了让AI系统成为可运营产品所需的防御性设计。'

---
InsightForgeを作る中で、最初に使わないと決めた言葉があります。

「AIが実際の消費者反応を予測します」

この言葉は売りやすいです。短く、分かりやすく、プロダクトの力を強く見せることができます。しかし、私には危険な言葉に見えました。LLMが生成した反応を、市場の真実のように扱うと、プロダクトは便利に見えても意思決定の道具としては弱くなります。

そこでInsightForgeの中心を、もっと狭く定義しました。

> InsightForgeは市場の正解を出す道具ではなく、何を検証すべきかを整理する道具です。

この記事は、その判断についてのビルドログです。単なるプロダクト紹介ではなく、LLMを使ったリサーチ製品を作る時に、どこに線を引くべきかを整理した記録です。

## 最初に魅力的に見えた方向

一番分かりやすい製品の形は、すぐに思いつきます。

ユーザーが製品アイデアを入力する。システムがpersonaを作る。それぞれのpersonaが点数を付ける。最後に市場反応スコアを表示する。

デモとしては強いです。画面も作りやすいです。数字も出ます。ユーザーはすぐに答えを受け取ったように感じます。

しかし、平均スコア7.2が出た時に、チームは何をすべきでしょうか。

リリースするべきか。価格を上げるべきか。広告を出すべきか。ターゲットを変えるべきか。顧客インタビューをするべきか。

数字は決定的に見えますが、実際の判断に必要な意味を十分に持っていないことが多いです。さらに、その数字がAIによって生成されると、根拠よりも早く確信が生まれます。

## 平均点はインサイトではない

初期のプロダクト判断では、平均点はしばしば一番弱い情報です。

同じ平均点でも、背景はまったく違うことがあります。

| パターン | 同じ平均になり得るか | より良い判断 |
| --- | --- | --- |
| 全員が少し興味を持つ | はい | ポジショニングを鋭くする |
| 一部セグメントだけが強く反応する | はい | 最初のbeachhead segmentを探す |
| 機能は良いが導入に不安がある | はい | 信頼や証拠のメッセージを検証する |

平均は差を隠します。しかし初期リサーチで知りたいのは、差そのものです。

私がInsightForgeで見たかったのは、次のような問いでした。

- どのpersonaが強く反応したのか
- どの反対理由が繰り返されたのか
- 価格の問題なのか、信頼の問題なのか、緊急度の問題なのか
- 機能への好意と導入意思は分かれているのか
- どのclaimにはproofが必要なのか
- 次の顧客インタビューで何を聞くべきか

これらは市場の正解ではありません。しかし、次の検証を良くします。

## synthetic panelは顧客ではない

一番重要な境界線は、synthetic respondentは顧客ではないということです。

そのpersonaは製品を使っていません。競合製品にお金を払っていません。予算、社内政治、切り替えコスト、生活文脈を持っていません。反応パターンをシミュレーションすることはできますが、実際にサンプリングされた人間にはなりません。

この境界線は、製品の言葉を変えます。

synthetic responseを顧客の引用のように見せてはいけない。directional confidenceを統計的信頼区間のように見せてはいけない。レポートは「市場はこれを望んでいる」で終わるべきではなく、「次に検証すべき仮説はこれです」で終わるべきです。

この制約は製品を地味にします。しかし、より信頼できる道具にします。

## 論文を読んで決めた基準

synthetic human samplesやsimulated economic agentsに関する研究は、LLMがpersonaや文脈の制約の下で、一定の反応パターンを生成できることを示しています。これはpre-research toolとしては十分に価値があります。

一方で、synthetic survey dataをhuman surveyの代替として扱うことへの批判も重要です。分布が歪むことがあります。反応が滑らかになりすぎることがあります。実際の人間データにあるノイズや矛盾が消えることがあります。

そこで私が採用したルールはこうです。

> synthetic panelはvalidation priorityを作るために使い、validation resultとは呼ばない。

Semantic Similarity Rating的な考え方も、この方針に合っています。市場需要を正確に予測しようとするのではなく、concept、claim、response、evidenceの関係を方向性として比較する。どのclaimがどのsegmentに合うのか。どのobjectionが繰り返されるのか。どのproofがなければ導入されないのか。

## 意図的に入れた制約

InsightForgeでは、機能よりも制約が重要な部分があります。

| リスク | 入れた制約 |
| --- | --- |
| 一般的なAI助言になる | persona条件と質問構造を固定する |
| 点数が真実に見える | directional scoreとして扱う |
| 平均が差を隠す | segment spreadとdisagreementを出す |
| 要約が過信を生む | evidenceとinterpretationを分ける |
| synthetic quoteが実顧客の声に見える | synthetic evidenceであることを明記する |
| レポートが最終結論に見える | human validation questionで終える |

LLM製品で難しいのは、テキストを生成することではありません。生成されたものにどんな地位を与えるかです。下書きなのか、仮説なのか、シミュレーションされた反応なのか、検証結果なのか。ここを混ぜると、製品は危険になります。

## 実際に役に立つと感じた瞬間

この方法が役に立つと感じたのは、点数が高く出た時ではありません。

むしろ、興味と導入意思が分かれた時でした。ユーザーはアイデアを良いと思いながら、切り替えないことがあります。機能を理解しても、買わないことがあります。価値提案に同意しても、信頼や証拠がなければ動かないことがあります。

例えば金融サービスでは、便利な機能への反応は良くても、メイン口座を切り替える意思は弱いかもしれません。SaaSのワークフロー製品では、創業者チームは強く反応しても、operations teamはintegration riskを重く見るかもしれません。

この時に必要なのは「ポジティブかネガティブか」ではありません。

- どんなproofがあれば信じられるのか
- 最初に試すsegmentはどこか
- salesやinterviewで確認すべきobjectionは何か
- 魅力的だが信じられていないmessageはどれか
- interestからactionに進む条件は何か

この問いを作れるなら、AI-assisted researchには価値があります。

## ChatGPTプロンプトだけでは足りない理由

良いプロンプトは初期探索に役立ちます。すべてを製品化する必要はありません。

ただし、製品にするなら別の問題を解く必要があります。

- 実行ごとに比較可能な出力が必要
- personaの前提を明示する必要
- scoreが偽の精密さに見えないようにする必要
- evidenceをレビューできる形で残す必要
- limitationを結論と一緒に出す必要
- reportが次の行動につながる必要

InsightForgeの差別化は、モデルにアクセスできることではありません。LLMの出力を、panel construction、structured questioning、pattern aggregation、evidence trail、confidence note、limitation、validation recommendationを含むauditable workflowに変えることです。[AIサービスをひとりで立ち上げた経験](/ja/blog/ja/individual-developer-ai-saas-journey)からも同じ結論でした—モデル選択より構造と再現性が重要です。

## 最初の使い方

最初から市場全体を分析しようとしない方が良いです。

最初は狭く使うべきです。

- 製品コンセプトを1つ
- ターゲットセグメントを1つ
- 市場または地域を1つ
- ビジネス質問を1つ
- 競合代替を数個
- 価格仮説を1つ

そして結果を「証明」ではなく、research planning documentとして読むべきです。

最初の成功指標は、レポートが賢く見えることではありません。次の顧客インタビュー、メッセージテスト、ランディングページ実験が鋭くなることです。

## まだ残っている課題

まだ難しい問題があります。

directional confidenceを、統計的なものに見せずにどう説明するか。同じ条件で複数回実行した時、どの程度安定していればvalidation priorityにできるか。滑らかすぎるsynthetic responseをどう検出するか。実際の顧客インタビューと照らした時、どのパターンが残り、どのパターンが消えるか。

これらは実装の細部ではなく、製品の誠実さに関わる問題です。[AIエージェントの実際の運用コスト](/ja/blog/ja/ai-agent-cost-reality)が予想以上に複雑であることも、同じ文脈にあります。

避けたい方向は「AIがリサーチを全部やってくれる」です。信頼できる方向は「AIが次に何をリサーチすべきかを整理してくれる」です。

## 結論

InsightForgeを予測ツールではなく検証優先度ツールとして作った理由は、この方が有用で、かつ正直だからです。

初期のプロダクトチームに必要なのは、偽のoracleではありません。曖昧な市場不確実性を、実際の人間で検証できる仮説、反対理由、segment、質問に変えることです。

synthetic panelはその作業を助けることができます。しかし、それを顧客として売り始めた瞬間に、価値よりもリスクが大きくなります。

InsightForgeでは、この線を守りたいと思っています。

## 参考にした研究背景

この記事はビルドログですが、方向性を決める時に参考にした研究の流れがあります。

- [Out of One, Many: Using Language Models to Simulate Human Samples](https://arxiv.org/abs/2209.06899) は、条件付けされたsynthetic sampleをLLMで作る可能性を示しています。
- [Large Language Models as Simulated Economic Agents](https://arxiv.org/abs/2301.07543) は、LLMをsimulated agentsとして考える時の可能性と限界を考えさせます。
- [Using GPT for Market Research](https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf) は、マーケットリサーチの文脈でGPT型ツールをどう使えるかを扱っています。
- [Synthetic Replacements for Human Survey Data?](https://www.cambridge.org/core/journals/political-analysis/article/synthetic-replacements-for-human-survey-data-the-perils-of-large-language-models/B92267DC26195C7F36E63EA04A47D2FE) は、synthetic responseをhuman surveyの置き換えとして扱う危険を示しています。

私の結論は実務的です。この研究の流れはプロダクトチームに役立ちます。ただし、出力を人間による検証の代替ではなく、より良い検証を準備するための材料として扱う場合に限ります。
