---
heroImage: ../../../assets/blog/anthropic-vibe-physics-ai-research-assistant-hero.jpg
title: Vibe Physics — 物理学教授がClaudeに論文を書かせてみた
description: >-
  Anthropic Science ブログの初投稿で、ハーバード物理学教授 Matthew Schwartz が Claude
  を「大学院生」として指導した実験を分析します。110回のドラフト、36Mトークン、そして2週間で完成した論文。
pubDate: '2026-03-25'
tags:
  - ai-ml
  - anthropic
  - science
  - llm
relatedPosts:
  - slug: functiongemma-270m-tool-calling
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: agents-md-effectiveness
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-agent-cost-reality
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-self-generated-skills-myth
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
draft: true
---

2週間で理論物理学の論文が1本完成した。通常なら1年かかる作業だ。

3月23日、AnthropicがScience ブログを新たに開設した。最初の記事のタイトルがなかなか挑発的だ — 「Vibe Physics: The AI Grad Student」。ハーバード大学の物理学教授 Matthew Schwartz が [Claude Opus 4.5](/ja/blog/ja/anthropic-claude-performance-decline-controversy-april-2026) を直接指導し、理論物理学の計算を実行させた実験記録である。

正直、タイトルを見て「またAIが科学を革新するという話か」と思ったが、読んでみるとかなり違うテイストの記事だった。成功談ではなく、**指導日誌**に近い。

## 110回のドラフト、36Mトークン

Schwartz教授がやったことはシンプルだ。ファイルを直接触らず、Claudeに理論物理の計算をさせた。結果として：

- **110以上のドラフト**を生成
- **36Mトークン**を消費（GPT-4基準で約2,700万語相当）
- **40時間以上のローカルCPU演算**
- 最終成果物：技術的に厳密な高エネルギー理論物理学論文1本

1年かかる作業が2週間に短縮された。数字だけ見れば凄い。しかし Schwartz 教授の結論は意外にも冷静だ。

## 「G2レベル」— 大学院2年生

Schwartz は現在のLLMの理論物理能力を**G2（大学院2年生）**レベルと評価した。「速くて、疲れ知らずで、言われたことは熱心にやる。しかしかなり雑だ」。原文そのまま「impressively capable, but also sloppy enough that domain expertise was essential」。

私はこの評価が物理学だけに当てはまるとは思わない。コードを書かせても、文章を書かせても似た感触を受ける。80%までは驚くほど速いが、残りの20%で専門家の目が必要になる。「vibe coding」という表現が流行しているのも同じ文脈だ — なんとなく動いているようだが、本当に正しいかは人間が確認しなければならない。

これは重要な示唆を含む。AIが研究を「代行」するのではなく、**[専門家の生産性を増幅](/ja/blog/ja/ai-agent-cost-reality)**するツールだということだ。物理学を知らない人がClaudeに論文を書かせれば、もっともらしいが間違った結果が出る可能性が高い。

## 同時公開された実践パターン：Ralph Loop

Science ブログの2つ目の記事はより実用的だ。Anthropic Discovery チームの Siddharth Mishra-Sharma が書いた「Long-running Claude for scientific computing」で、ここで紹介された **Ralph Loop** パターンが目を引く。

```bash
# Ralph Loop — 成功条件を満たすまで繰り返し実行
while true; do
  claude --print "CHANGELOG.mdを読んで、まだ完了していない
    タスクを続けてください。すべてのテストが通ったら
    DONE.mdファイルを作成してください。"

  if [ -f "DONE.md" ]; then
    echo "作業完了"
    break
  fi

  echo "未完了、リトライ..."
done
```

核心は2つだ：

1. **CHANGELOG.mdを長期メモリとして活用** — エージェントが毎回前回の進捗を読んで続きから作業
2. **Test Oracle** — リファレンス実装やテストスイートがあってこそ、エージェントが「進んでいるのか、迷走しているのか」を判断できる

このパターンを見て、私たちのチームで使っているCI/CDパイプラインが頭に浮かんだ。結局エージェントに長時間作業を任せるには、**検証可能な中間チェックポイント**が必要だということだ。

## なぜAnthropicは「Scienceブログ」を別に作ったのか

Anthropicにはすでに Research ブログがある。それなのに別途 Science ブログをローンチしたのには意味がある。

既存の Research ブログが「モデル自体の研究」に集中しているのに対し、Science ブログは「モデルをツールとして使う科学者たちの話」にフォーカスしている。Claude for Life Sciences（2025年10月）、Claude for Healthcare（2026年1月）に続き、AI for Science プログラムまで — Anthropic が「汎用AIアシスタント」から「科学研究インフラ」へとポジショニングを拡張しているシグナルだ。

個人的にこの方向性は期待もあるし心配もある。科学研究におけるAIの「雑さ」が生むリスクは、コーディングミスとは次元が違う。論文に微妙な計算エラーが混入すれば、それが他の研究の基礎として広がりかねない。Schwartz 教授のようにドメイン専門家が丁寧に検証する場合は問題ないが、「vibe physics」が普及すれば検証なしで通過するケースも増えるだろう。

## エンジニアが持ち帰れること

物理学の論文を書く予定はなくても、この実験から学べることは明確だ。

**AIに長時間の作業を任せるパターンが確立されつつある。** [CLAUDE.md](/ja/blog/ja/agents-md-effectiveness)でプロジェクトコンテキストを与え、CHANGELOG.mdで状態を追跡し、test oracleで品質を検証する構造。これは物理研究でも、データパイプラインでも、大規模リファクタリングでも同様に適用できる。

ただし「G2レベル」という評価を忘れてはいけない。熱心だが監督が必要な大学院生。その前提なしに成果物をそのまま使えば、速く作った分だけ速く問題が発生する。
