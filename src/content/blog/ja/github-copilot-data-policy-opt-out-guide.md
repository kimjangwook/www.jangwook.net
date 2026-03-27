---
title: GitHub Copilotが4月から私のコードでAIを学習する — オプトアウトしないと同意したことに
description: >-
  GitHubが3月25日にCopilot
  Free/Pro/Pro+ユーザーのインタラクションデータをAIモデル学習に使用すると発表しました。オプトアウト方法と実際の影響を整理します。
pubDate: '2026-03-27'
heroImage: ../../../assets/blog/github-copilot-data-policy-opt-out-guide-hero.jpg
tags:
  - github
  - copilot
  - privacy
  - ai
  - developer-tools
relatedPosts:
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.88
    reason:
      ko: "Copilot의 데이터 정책이 걱정된다면, 이 글에서 다룬 Copilot 프롬프트 인젝션 보안 취약점도 함께 읽어보세요."
      ja: "Copilotのデータポリシーが気になるなら、この記事で取り上げたCopilotプロンプトインジェクションの脆弱性も併せてお読みください。"
      en: "If Copilot's data policy concerns you, also check out this analysis of Copilot prompt injection security vulnerabilities."
      zh: "如果你关心Copilot的数据政策，也建议阅读这篇关于Copilot提示注入安全漏洞的分析。"
  - slug: llm-deanonymization-privacy-risk-defense
    score: 0.82
    reason:
      ko: "AI 도구의 데이터 수집이 걱정된다면, LLM이 익명성을 무너뜨리는 메커니즘을 다룬 이 글도 관련이 있습니다."
      ja: "AIツールのデータ収集が心配なら、LLMが匿名性を崩すメカニズムを扱ったこの記事も関連があります。"
      en: "If AI tool data collection worries you, this article on how LLMs can break anonymity is directly relevant."
      zh: "如果担心AI工具的数据收集，这篇关于LLM如何打破匿名性的文章也很相关。"
  - slug: patent-strategy-llm-era
    score: 0.78
    reason:
      ko: "코드의 지적 재산권 보호에 관심이 있다면, LLM 시대의 특허 전략 변화도 읽어볼 만합니다."
      ja: "コードの知的財産権保護に関心があるなら、LLM時代の特許戦略の変化も一読の価値があります。"
      en: "If you're concerned about code IP protection, the evolving patent strategies in the LLM era are worth reading."
      zh: "如果你关注代码知识产权保护，LLM时代专利策略的变化也值得一读。"
  - slug: gpt-oss-120b-uncensored
    score: 0.75
    reason:
      ko: "GitHub의 데이터 정책 변경과 오픈소스 AI 모델의 무검열 논쟁은 'AI 학습 데이터의 윤리'라는 같은 축에서 연결됩니다."
      ja: "GitHubのデータポリシー変更とオープンソースAIモデルの無検閲論争は、「AI学習データの倫理」という同じ軸で繋がります。"
      en: "GitHub's data policy change and the uncensored open-source AI debate connect on the same axis of AI training data ethics."
      zh: "GitHub的数据政策变更与开源AI模型的无审查争论，在'AI训练数据伦理'这同一轴线上相互关联。"
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.72
    reason:
      ko: "Copilot이 코드 데이터를 수집하는 것과 AI 모델 증류 공격은 모두 'AI가 학습한 데이터의 소유권' 문제를 다룹니다."
      ja: "CopilotがコードデータをCollectするのとAIモデル蒸留攻撃は、どちらも「AIが学習したデータの所有権」問題を扱います。"
      en: "Copilot collecting code data and AI distillation attacks both deal with the ownership of data AI models learn from."
      zh: "Copilot收集代码数据与AI模型蒸馏攻击，都涉及'AI学习数据的所有权'问题。"
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

このポリシー変更はGitHubだけの話ではありません。AIツールを無料や低価格で提供しながら、ユーザーデータでモデルを改善するパターンは、今や業界標準になりつつあります。GoogleのGemini、AnthropicのClaudeも似たようなポリシーがあったり、予定されています。

開発者ツール市場でこれが特に敏感な理由は、コードがそのまま知的財産だからです。テキスト会話とコードは性質が異なります。

結局、各自が判断すべき問題です。オプトアウト設定があること自体はありがたいですが、**デフォルトがオプトイン（収集同意）であるという選択**については批判があるのは当然です。ユーザーに能動的に選択させるオプトイン方式ではなく、知らなければ自動同意になるオプトアウト方式を選んだのは残念です。

## チェックリスト：今すぐやること

- [ ] GitHub Settings → Copilot → Featuresでデータ学習設定を確認
- [ ] 組織管理者であればOrganizationポリシーでCopilotデータポリシーをレビュー
- [ ] チームメンバーに4月24日の変更事項を共有
- [ ] プライベートリポでCopilot使用時の機密コード露出範囲を再検討

4月24日までに一度確認するだけで済みます。5分で終わります。
