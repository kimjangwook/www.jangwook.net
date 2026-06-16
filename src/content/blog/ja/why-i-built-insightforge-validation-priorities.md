---
title: 'InsightForgeを作った理由: AI消費者リサーチを検証優先度の道具にするまで'
description: 'InsightForgeとは何か、なぜ作ったのか、synthetic panelとSSR的な方法論を責任あるプロダクトにする中で苦労した点をまとめました。'
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
faq:
  - question: "InsightForgeは実際の市場調査を代替しますか。"
    answer: "いいえ。synthetic panelは人の答えを代替せず、次に人に何を聞くべきかを整理します。最終出力は結論ではなく、次に検証すべき優先度です。"
  - question: "平均スコアだけを見てはいけない理由は何ですか。"
    answer: "同じ平均7でも、全員が少し興味なのか、一つのsegmentだけ強く反応するのか、信頼が弱いのかで取るべき行動が全く異なります。だからspread、disagreement、blocker、adoption readinessを併せて見ます。"
  - question: "伝統的なアンケートの方が良いのはどんな時ですか。"
    answer: "転換率や市場規模のように統計的に擁護可能な数字が必要な時、または規制・医療・金融のように誤った結論のコストが大きい領域では、実在の人を標本とする伝統的アンケートの方がはるかに適しています。"
  - question: "最初に使う時はどう入力すべきですか。"
    answer: "市場全体を一度に分析するより、製品コンセプト1つ、target segment1つ、核心的な問い1つに絞って始める方が良いです。入力が広いと結果も一般論に流れます。"
---

InsightForgeは、初期のプロダクトやマーケティング仮説を検証するためのリサーチ支援サービスです。

ユーザーは製品コンセプト、ターゲット顧客、地域、競合、価格仮説、ビジネス上の問いを入力します。InsightForgeはsynthetic panelを作り、personaごとの反応を集め、スコアと理由を比較し、segment reaction map、trigger、blocker、evidence、confidence note、validation questionを含むレポートを生成します。

外から見ると「AI消費者リサーチツール」と呼べます。ただし、作りながら私はもっと慎重に定義することにしました。

> InsightForgeは市場予測マシンではありません。不確実性を検証優先度に変えるワークフローです。

この一文を守ることが、思った以上に難しかったのです。以下は、なぜこのサービスを作り、どこで詰まり、どんな主張を最後までしないと決めたのかの記録です。

## 出発点: アイデアは多いが検証は遅い

一人または小さなチームでプロダクトを作っていると、同じ場面を何度も経験します。

アイデアはあります。ランディングページも作れます。コピーも書けます。機能も実装できます。しかし、すぐに難しい問いが出てきます。

このメッセージは本当に刺さるのか。ターゲットは正しいのか。価格は信じられるのか。人は興味を持つだけなのか、それとも行動するのか。今インタビューをするなら何を聞くべきなのか。

これらは重要ですが、多くの場合、遅れて扱われます。チームは先に作り、メッセージを決め、機能を実装し、その後に仮説が正しかったかを確認します。

私が欲しかったのは、正式な検証の前に使える道具でした。答えを出す道具ではなく、どの仮説が危険で検証すべきかを整理する道具です。一人でSaaSを作ってきた[個人開発者のAI SaaS挑戦記](/ja/blog/ja/individual-developer-ai-saas-journey)でも、同じ漠然とした行き詰まりを何度も繰り返しました。

## 最初に考えた形はもっと単純だった

一番簡単な形は明らかでした。

製品アイデアを入力する。AIがpersonaを作る。それぞれが点数を付ける。平均の市場反応スコアを表示する。

説明しやすく、デモもしやすい。credit、決済、PDFレポートを付ければSaaSらしく見えます。

しかし、実際に回してみると問題が見えました。

平均スコア7.2が出たとして、チームは何をすべきでしょうか。ローンチするのか。価格を上げるのか。メッセージを変えるのか。セグメントを捨てるのか。顧客に聞くのか。

数字はあります。しかし意思決定はまだ曖昧です。さらに、LLMが生成した数字をレポートに載せると、根拠以上に権威があるように見えてしまいます。

そこで、プロダクトの方向を変える必要があると感じました。

## 危険な言葉: AIが消費者を代替する

この領域で一番売りやすい言葉はこれです。

「AIが実際の消費者行動を予測します」

強く、覚えやすく、クリックも増えるかもしれません。しかし、InsightForgeをその主張に依存させたくありませんでした。

synthetic personaは顧客ではありません。競合製品にお金を払ったことも、予算について上司と議論したことも、ツールを切り替えたこともありません。生活文脈も、購買プロセスも、過去の失敗の記憶もありません。

synthetic responseをきれいに見せすぎると、本物の顧客引用のように見えます。ここが一番危険でした。

だから、製品にはいくつかのルールを置きました。

- synthetic responseを実顧客の引用のように見せない
- confidenceを統計的信頼度のように見せない
- 平均スコアを結論にしない
- findingにはevidenceとlimitationを一緒に出す
- レポートは市場の真実ではなくvalidation questionで終える

これらは売り文句を弱くします。しかし、信頼性は強くします。

## 難しかったこと: それっぽさと有用性は違う

LLMプロダクトで一番怖いのは、それっぽい出力が簡単に出ることです。

初期のレポートも見た目は良かったです。文章は自然で、要約も論理的で、表もきれいでした。しかし内容を読むと、便利さが重要、信頼が重要、価格が重要、segmentごとに反応が違う、という一般論が多くありました。

間違ってはいません。でも、それだけでは意思決定に足りません。

私が欲しかったのは、もっと具体的な情報でした。

- どのsegmentがなぜ違う反応をしたのか
- どのobjectionが繰り返されたのか
- feature interestとadoption readinessは分かれているのか
- 価格問題に見えて実は信頼問題ではないか
- どのclaimにはproofが必要か
- 次の顧客インタビューで何を聞くべきか

そのために、workflowを構造化しました。persona generation、question generation、response capture、scoring、insight generation、reportingを一つの大きなpromptにしない。各stageに役割と制約を持たせる必要がありました。複数のエージェントを段階に分けて調整する中で経験した試行錯誤は、[マルチエージェント・オーケストレーション改善記](/ja/blog/ja/multi-agent-orchestration-improvement)に詳しく書いています。

これは単なるprompt engineeringではありません。生成されたものをプロダクト内でどの地位に置くかを決める作業でした。

## 平均スコアとの戦い

最初はscoreを中心にしたくなりました。ユーザーは数字を理解しやすく、画面も作りやすいからです。

しかしテストを重ねるほど、平均スコアは危険に見えました。

同じ平均でも、背後はまったく違います。

| 隠れたパターン | 平均だけで見ると | チームがすべきこと |
| --- | --- | --- |
| 全員が少し興味を持つ | 悪くない | ポジショニングを鋭くする |
| 一部segmentだけ強く反応 | 悪くない | 最初のtargetを狭める |
| 機能は良いが信頼が弱い | 悪くない | proofとrisk messageを検証する |
| 興味は高いが緊急度が低い | 良く見える | 今行動する理由を探す |

そのため、レポートは平均よりspread、disagreement、blocker、adoption readinessを重視する方向に変えました。

単純さは少し失われましたが、実務的な価値は上がりました。

## 失敗した実行もあった

すべてのresearch runが成功したわけではありません。

あるsurvey型の実行では、sample sizeが足りないような失敗になりました。しかし実際には、単純な件数不足ではなく、response varianceやconfidence gateの問題であることもありました。UIが「sampleが小さい」とだけ言うと、本当の原因を隠してしまいます。

別の実行では、回答が滑らかすぎました。異なるpersonaなのに、似た語調で似た不安を話します。これは安定しているのではなく、モデルが安全な一般論に収束しているだけかもしれません。

web evidenceを付けることも簡単ではありませんでした。検索結果を増やすとレポートは強そうに見えます。しかしevidenceが特定の結論を支えていなければ、ただの装飾です。

さらに、決済、credit、queue、provider cost、失敗時の扱い、DeepSeek残高通知、adminでの使用状況確認など、運用の問題もありました。リサーチ製品はレポート生成器ではありません。実際のサービスにするなら、各runにはコスト、失敗、期待値があります。1回のレポートが複数段階のLLM呼び出しで構成されるため費用が急速に積み上がり、この点は[AIエージェントのコストの現実](/ja/blog/ja/ai-agent-cost-reality)で扱った問題とそのまま重なりました。

この苦労が、InsightForgeをデモではなくプロダクトに近づけました。

## SSR的な考えをプロダクトの言葉にする

InsightForgeの中心には、Semantic Similarity Ratingに近い考え方があります。

重要なのはAIが市場を魔法のように知っていることではありません。concept、claim、persona response、evidence、rating anchorの関係を、構造化された意味的workflowとして比較することです。

製品メッセージでは、次の問いが重要になります。

- このmessageはどのpersonaのproblemに近いか
- どのclaimがどのobjectionと衝突するか
- purchase interestよりproof requirementが強いか
- alternativesと比べて差別化が理解されているか
- 同じscoreでも理由は違うか

これを論文ではなく、プロダクトレポートにする必要がありました。チームが次に何をするか分からなければ意味がありません。

だから出力はfinal answerではなくvalidation prioritiesを中心にしました。

## 正しい最初の使い方

最初から「市場全体を分析して」と使うべきではありません。入力が広いと出力も広くなります。

最初は狭く使う方が良いです。

- 製品コンセプトを1つ
- target segmentを1つ
- 地域または市場を1つ
- 価格仮説を1つ
- 競合代替を数個
- business questionを1つ

結果はresearch planning documentとして読むべきです。

「この製品が成功する証明か」ではなく、「次に実顧客へ何を聞くべきか」。

「このmessageが正解か」ではなく、「proofなしでは危険なclaimはどれか」。

「このsegmentが買うか」ではなく、「このsegmentの最大blockerは何か」。

ここでInsightForgeは一番役に立ちます。

## 実際のサービスへのリンク

この記事で説明したworkflowは、現在 [InsightForge](https://insightforge.effloow.com/) という実サービスとして運用しています。

サービスではFocus studyとSurvey studyを実行できます。製品コンセプト、target customer、競合代替、価格仮説、地域、business questionを入力し、構造化されたレポートを生成します。最初に使う場合は、市場全体を分析するよりも、1つの製品コンセプトと1つの狭いsegmentから始める方が適しています。

方法論を先に確認したい場合は、[InsightForge Research Method Guide](https://insightforge.effloow.com/) とsample reportの流れを見るのが良いです。実際に試す場合は、小さなFocus studyから始め、その結果を顧客インタビューやmessage testの準備に使うのが安全です。

このリンクは単なるCTAではありません。この記事で説明したvalidation priorities、synthetic evidence、limitation、next validation questionが、実際のレポート構造にどう入っているかを確認するための接続点です。

## 作りたいのはoracleではない

もっと強い言葉を使いたくなる誘惑はあります。

AIが市場を予測する。数分で消費者リサーチ。インタビューなしでvalidation。

マーケティングコピーとしては強いかもしれません。しかし、それは製品に必要な信頼を壊します。

私が作りたいのはoracleではありません。人間が検証すべき問いをより良く準備する道具です。初期プロダクトチームが盲目的に作らないように、危険な仮説、強いobjection、proof requirementを早く見せる道具です。

この定義は地味ですが、長く使える方向だと思っています。

## 参考にした研究背景

この方向性には、いくつかの研究が影響しています。

- [Out of One, Many: Using Language Models to Simulate Human Samples](https://arxiv.org/abs/2209.06899) は、条件付きsynthetic sampleを調べる価値を示しています。
- [Large Language Models as Simulated Economic Agents](https://arxiv.org/abs/2301.07543) は、LLMをsimulated agentsとして見る時の可能性と限界を示しています。
- [Using GPT for Market Research](https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf) は、市場調査workflowにおけるGPT型ツールの使い方を扱っています。
- [Synthetic Replacements for Human Survey Data?](https://www.cambridge.org/core/journals/political-analysis/article/synthetic-replacements-for-human-survey-data-the-perils-of-large-language-models/B92267DC26195C7F36E63EA04A47D2FE) は、synthetic responseをhuman surveyの代替として扱う危険を警告しています。

私の結論は実務的です。この研究方向はプロダクトチームに役立ちます。ただし、出力を人間による検証の代替ではなく、その準備として扱う場合に限ります。

## いつ使い、いつ避けるべきか

InsightForgeのようなマルチエージェントsynthetic panelは万能ではありません。向いている場面と、選ぶべきでない場面がはっきりあります。

向いているのはこういう時です。

- まだ顧客リストがなく、正式なインタビューやアンケートをかける相手そのものがいない初期段階
- コンセプト、メッセージ、価格仮説が複数あり、何から検証するか優先順位を決めたい時
- インタビュー設計の前に、どの仮説が危険かを先に洗い出したい時
- 安く速く方向感をつかみ、その後で必ず実際の人に確認するつもりがある時

逆に避けた方がよいのはこういう時です。

- ローンチや価格の最終判断の根拠が必要な時。これは実購買データや実ユーザーインタビューが答えるべきです。
- 転換率、市場規模、有意なsegment比率のような統計的に擁護可能な数字が必要な時。標本が実在の人である伝統的アンケートの方がはるかに適しています。
- 規制、医療、金融のように誤った結論のコストが大きい領域。synthetic responseのハルシネーションリスクは許容できません。
- すでに十分な実ユーザートラフィックがあり、A/Bテストで直接測定できる時。測定できるなら、シミュレーションより実測が速く正確です。

要するに、人に何を聞くべきか分からない段階では役に立ち、人の答えを置き換えようとした瞬間に危険になります。

## 機能ではなく境界を引く作業だった

InsightForgeを作る過程は、機能を増やすことよりも境界線を引くことの連続でした。

AIがリサーチを代替すると言わない。synthetic responseを顧客の声として包装しない。scoreを市場の真実のように見せない。その代わり、次に人間が検証すべきassumption、segment、objection、proof requirementを見えるようにする。

これがInsightForgeを作った理由です。

今でも、この製品の中心文はこれだと思っています。

> 曖昧な市場不確実性を、人間が検証できる優先度に変える道具。
