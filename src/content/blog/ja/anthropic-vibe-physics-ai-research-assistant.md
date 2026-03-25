---
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
  - slug: gpt52-theoretical-physics-discovery
    score: 0.96
    reason:
      ko: GPT-5.2가 이론 물리학에서 새로운 발견을 했다는 사례와 직접 비교할 수 있습니다. Claude의 G2 수준 평가와 대조해보세요.
      ja: GPT-5.2が理論物理学で新発見をした事例と直接比較できます。ClaudeのG2評価と対照してみてください。
      en: Directly comparable to the GPT-5.2 theoretical physics discovery case. Contrast it with Claude's G2-level assessment.
      zh: 可以与GPT-5.2在理论物理学中的新发现案例直接对比。请与Claude的G2水平评估进行对照。
  - slug: alphaevolve-ramsey-ai-research-partner
    score: 0.94
    reason:
      ko: AlphaEvolve가 수학 난제를 풀어낸 사례입니다. AI가 과학 연구의 파트너가 되는 흐름을 다른 각도에서 보여줍니다.
      ja: AlphaEvolveが数学の難問を解いた事例です。AIが科学研究のパートナーになる流れを別の角度から示します。
      en: The case of AlphaEvolve solving a math conjecture. Shows AI as a science research partner from a different angle.
      zh: AlphaEvolve解决数学难题的案例。从不同角度展示了AI成为科学研究伙伴的趋势。
  - slug: agents-md-effectiveness
    score: 0.92
    reason:
      ko: 이 글에서 다룬 CLAUDE.md + CHANGELOG.md 패턴의 효과를 데이터로 검증한 포스트입니다.
      ja: この記事で取り上げたCLAUDE.md + CHANGELOG.mdパターンの効果をデータで検証した記事です。
      en: Validates the CLAUDE.md + CHANGELOG.md pattern discussed here with actual effectiveness data.
      zh: 用数据验证了本文讨论的CLAUDE.md + CHANGELOG.md模式的实际效果。
  - slug: karpathy-autoresearch-overnight-ml-experiments
    score: 0.90
    reason:
      ko: Karpathy의 자동 연구 실험과 Schwartz의 물리학 실험은 "AI에게 연구를 맡기는 패턴"이라는 점에서 같은 흐름입니다.
      ja: Karpathyの自動研究実験とSchwartzの物理学実験は「AIに研究を任せるパターン」という点で同じ流れです。
      en: Karpathy's auto-research experiments and Schwartz's physics experiment share the same theme of delegating research to AI.
      zh: Karpathy的自动研究实验和Schwartz的物理学实验在"将研究委托给AI的模式"这一点上属于同一趋势。
  - slug: claude-code-best-practices
    score: 0.88
    reason:
      ko: Ralph Loop과 test oracle 패턴을 실무에 적용하려면, Claude Code 베스트 프랙티스를 함께 읽어보는 것이 좋습니다.
      ja: Ralph Loopとtest oracleパターンを実務に適用するなら、Claude Codeのベストプラクティスも併せて読むことをお勧めします。
      en: If you want to apply the Ralph Loop and test oracle patterns in practice, pair it with these Claude Code best practices.
      zh: 如果想在实际工作中应用Ralph Loop和test oracle模式，建议配合阅读Claude Code最佳实践。
---

2週間で理論物理学の論文が1本完成した。通常なら1年かかる作業だ。

3月23日、AnthropicがScience ブログを新たに開設した。最初の記事のタイトルがなかなか挑発的だ — 「Vibe Physics: The AI Grad Student」。ハーバード大学の物理学教授 Matthew Schwartz が Claude Opus 4.5 を直接指導し、理論物理学の計算を実行させた実験記録である。

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

これは重要な示唆を含む。AIが研究を「代行」するのではなく、**専門家の生産性を増幅**するツールだということだ。物理学を知らない人がClaudeに論文を書かせれば、もっともらしいが間違った結果が出る可能性が高い。

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

**AIに長時間の作業を任せるパターンが確立されつつある。** CLAUDE.mdでプロジェクトコンテキストを与え、CHANGELOG.mdで状態を追跡し、test oracleで品質を検証する構造。これは物理研究でも、データパイプラインでも、大規模リファクタリングでも同様に適用できる。

ただし「G2レベル」という評価を忘れてはいけない。熱心だが監督が必要な大学院生。その前提なしに成果物をそのまま使えば、速く作った分だけ速く問題が発生する。
