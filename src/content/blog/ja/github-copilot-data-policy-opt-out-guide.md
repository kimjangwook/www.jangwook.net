---
title: GitHub Copilotが4月から私のコードでAIを学習する — オプトアウトしないと同意したことに
description: >-
  GitHubが3月25日にCopilot
  Free/Pro/Pro+ユーザーのコードスニペットやチャット履歴などのインタラクションデータをAIモデル学習にデフォルトで使用すると発表した。4月24日までに設定を変更しないと自動同意となる。収集データの範囲、オプトアウトの手順、開発者向けの対応ポイントを整理する。
pubDate: '2026-03-27'
heroImage: ../../../assets/blog/github-copilot-data-policy-opt-out-guide-hero.jpg
tags:
  - github
  - copilot
  - privacy
  - ai
  - developer-tools
relatedPosts:
  - slug: ai-era-career-advice-for-juniors
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gemini-31-pro-release
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: kanitts2-voice-cloning
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: openrouter-oss-dominance
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML
        topics.
      zh: 适合作为下一步学习资源，通过AI/ML主题进行连接。
  - slug: windsurf-arena-mode-speed-over-accuracy
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
draft: true
---

3月25日、GitHubのブログにひっそりと投稿された記事が開発者コミュニティを騒がせました。タイトルは控えめでした — 「Updates to our Privacy Statement and Terms of Service.」しかし中身はかなり直接的です。**4月24日からCopilot Free、Pro、Pro+ユーザーのインタラクションデータが、AIモデルの学習にデフォルトで使用されます。**

私はこのニュースをThe Registerの記事で先に目にしましたが、正直な最初の反応は「ついに来たか」でした。無料プランを提供しながらデータを使わないというのは、もともと少し不自然でしたから。

## 具体的に何が変わるのか

GitHubが収集すると明示したデータの種類は、思ったより広範囲です：

- コードスニペット（入力と出力の両方）
- ユーザーが受け入れたり修正した提案コード
- カーソル周辺のコードコンテキスト
- コメントとドキュメント
- ファイル名とリポジトリ構造
- Copilot Chat、インライン提案などの機能別インタラクション
- 提案に対するフィードバック（👍/👎）

重要なのは、これが**デフォルト有効（オプトアウト方式）**だということです。別途オフにしなければ、同意したものとみなされます。

ただし、GitHubはいくつかの点を明確にしています：

1. **Business、Enterpriseプランは対象外** — 組織管理者が設定した既存のポリシーが維持されます
2. **プライベートリポのソースコード自体は学習に使わない** — 「at rest」状態のコードは対象外という意味
3. **サードパーティAIモデルプロバイダーにデータを共有しない** — GitHub/Microsoft内部の学習用途のみ

2番目は少し微妙で、「at rest」状態のコードは使わないと言いつつ、Copilotがそのコードを読んで提案を生成する過程でのデータは収集するわけです。実質的にプライベートコードが学習に間接的に寄与する可能性があるのではないか？この点は個人的に少し気になります。

## オプトアウトの方法

手順はシンプルです：

1. GitHubにログイン
2. **Settings → Copilot → Features** に移動
3. Privacyセクションで **「Allow GitHub to use my data for AI model training」** を無効化

以前「製品改善のためのデータ収集」を既に拒否していたユーザーは、その設定が維持されるとのことです。しかし一度も触ったことがなければ、4月24日からはデフォルトでオンになります。

一つ注意点 — Organization所属の個人アカウントは、組織のポリシーによりこの設定が表示されない場合があります。組織管理者に確認することをお勧めします。

## なぜこれが問題なのか（そしてなぜ大丈夫かもしれないか）

**問題だと見る視点：**

自分が書いたコードスニペットがモデル学習に入るということは、そのコードのパターンが他の人に提案される可能性があるということです。独自のアルゴリズムやビジネスロジックを含むコードであれば、気にせざるを得ません。特にプライベートリポで作業する開発者にとっては、「ソースコード自体は使わない」という言葉がそれほど安心材料にならないかもしれません。

**大丈夫だと見る視点：**

現実的に、Copilotはすでに数十億行の公開コードで学習されており、自分のコードスニペット数行がモデルに統計的に有意な影響を与える可能性は非常に低いです。そしてインタラクションデータを通じた学習は「どの提案が有用か」を改善するために使われるもので、ツール全体の品質向上に貢献します。

私は個人プロジェクトではオプトアウトしないつもりです。Copilotがより良くなることに貢献するわけですから。ただし会社のコードでは必ず確認します。

## より大きな文脈で見ると

このポリシー変更はGitHubだけの話ではありません。AIツールを無料や低価格で提供しながら、ユーザーデータでモデルを改善するパターンは、今や業界標準になりつつあります。GoogleのGemini、Anthropicの[Claude Code](/ja/blog/ja/claude-code-best-practices)も似たようなポリシーがあったり、予定されています。

開発者ツール市場でこれが特に敏感な理由は、コードがそのまま知的財産だからです。[AIが書いたコードの帰属追跡](/ja/blog/ja/cursor-agent-trace-ai-code-attribution)の議論とも文脈が重なります。テキスト会話とコードは性質が異なります。

結局、各自が判断すべき問題です。オプトアウト設定があること自体はありがたいですが、**デフォルトがオプトイン（収集同意）であるという選択**については批判があるのは当然です。ユーザーに能動的に選択させるオプトイン方式ではなく、知らなければ自動同意になるオプトアウト方式を選んだのは残念です。

## チェックリスト：今すぐやること

- [ ] GitHub Settings → Copilot → Featuresでデータ学習設定を確認
- [ ] 組織管理者であればOrganizationポリシーでCopilotデータポリシーをレビュー
- [ ] チームメンバーに4月24日の変更事項を共有
- [ ] プライベートリポでCopilot使用時の機密コード露出範囲を再検討

4月24日までに一度確認するだけで済みます。5分で終わります。
