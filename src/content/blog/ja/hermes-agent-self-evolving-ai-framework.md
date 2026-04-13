---
title: Hermes Agent — タスクをこなすたびに自ら進化するオープンソースAIエージェント
description: >-
  NousResearchのHermes Agent v0.7.0をインストールしてみた。タスク完了ごとにスキルドキュメントを自動生成し、
  次回実行時にそれを参照する自己進化ループが実際に機能するか確認した記録。
pubDate: '2026-04-12'
heroImage: ../../../assets/blog/hermes-agent-self-evolving-ai-framework-hero.jpg
tags:
  - ai-agent
  - open-source
  - self-evolution
  - nous-research
  - automation
relatedPosts:
  - slug: ai-presentation-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: multi-agent-swe-bench-verdent
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: sora-shutdown-ai-video-market-reshaping-veo4
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

`pip install hermes-agent`を打ってから30分で「これはちょっと違う」と感じた。

AIエージェントフレームワークが毎日のように登場する昨今、Hermes AgentがGitHubトレンディング週間ランキングで2週連続Top 5を維持しているのは単なるマーケティングではない。核心は**自己進化ループ（self-evolution loop）** — タスクを完了するたびにエージェントが自らスキルドキュメントを生成し、次に似たようなタスクが来たときにそのドキュメントを参照してより速く正確に処理する。

## Hermes Agentとは

NousResearchがMITライセンスで公開したAIエージェントフレームワークだ。2026年2月の初回リリースから2ヶ月でGitHubスター33,000、フォーク4,200、コントリビューター142名を達成した。4月3日にv0.7.0「The Resilience Release」がリリースされた。

核心コンセプトは3つ：

- **スキル自動生成**：複雑なタスクを完了すると再利用可能なスキルドキュメントを自動作成する
- **プラグインメモリ**：セッション間の記憶を保持しつつ、バックエンドを差し替えられるプラグイン構造
- **マルチプラットフォーム**：CLI、Telegram、Discord、Slack、WhatsApp、Signal、Email全対応

正直、機能リストだけ見ると「また一つのエージェントフレームワークか」と思える。私も最初はそうだった。

## インストールして動かしてみた

インストールは意外にクリーンだ。

```bash
# ワンライナーインストール — Python, Node.js, ripgrep, ffmpegなど依存関係を自動処理
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# またはpipで直接
pip install hermes-agent

# 初回実行
hermes
```

インストーラーがPython仮想環境、依存関係、グローバル`hermes`コマンドまで一括セットアップしてくれる。LLMプロバイダー設定は初回実行時にインタラクティブに聞かれるが、OpenRouterを選べば200以上のモデルがすぐ使える。`hermes model`コマンドでモデル切り替えも可能で、コード修正なしにNous Portal、OpenAI、Kimi、MiniMaxなどを自由に行き来できる。

## 自己進化ループは本当に機能するのか

ここが核心だ。多くのエージェントフレームワークが「学習する」と言うが、実際にはプロンプトキャッシングや会話履歴程度に留まるケースが多い。

Hermesのアプローチは異なる：

1. 複雑なタスクを完了すると、エージェントがその過程を**スキルドキュメント**として自動整理する
2. スキルドキュメントは`~/.hermes/plugins/`または`.hermes/plugins/`に保存される
3. 次に類似のタスクが来ると、ツールディスカバリー段階でこのドキュメントを参照する

個人的にこのパターンが興味深かったのは、私が毎日使っているClaude CodeのCLAUDE.mdと構造的に似ているからだ。CLAUDE.mdに「このプロジェクトではこのルールに従え」と書いておくと次のセッションでエージェントがそれを読んで行動するように、Hermesはそのプロセス自体を自動化したわけだ。エージェントがセッション間でコンテキストを保持する別のアプローチについては、[Hindsight MCPエージェントメモリアーキテクチャの分析](/ja/blog/ja/hindsight-mcp-agent-memory-learning)で比較できる。

ただ正直に言えば、「自動生成されたスキルドキュメントの品質」がまだ均一ではない。単純なファイル操作やAPI呼び出しのようなタスクではかなり使えるスキルが作られるが、コンテキストに大きく依存する複雑なタスクでは核心を見逃すケースもあった。v0.7.0でNousResearch/hermes-agent-self-evolutionリポにDSPy + GEPAベースの進化的自己改善が追加されたが、これはまだ実験段階に近い。

## アーキテクチャを見てみる

コア構造は思ったよりシンプルだ：

```
run_agent.py    → AIAgent — コア会話ループ
cli.py          → HermesCLI — ターミナルUI
model_tools.py  → ツールディスカバリー＆ディスパッチ
hermes_state.py → SQLiteセッション/状態DB（FTS5全文検索）
```

ツールディスカバリーは3つのソースから取得する：
- `~/.hermes/plugins/` — ユーザープラグイン
- `.hermes/plugins/` — プロジェクト別プラグイン
- pip entry points — パッケージとしてインストールされたプラグイン

v0.7.0で最大の変化はメモリがプラグインシステムに変わったことだ。以前はセッション終了時にコンテキストがリセットされていたが、今ではメモリバックエンドを差し替えたり、エージェント間でメモリを共有したり、カスタムメモリプロバイダーを自作できる。

## v0.7.0で変わったこと

| 変更点 | 説明 |
|--------|------|
| プラグインメモリ | メモリバックエンド差し替え・共有可能 |
| ボタンベース承認UI | 危険な操作実行前に確認 |
| インラインdiffプレビュー | ファイル変更前に差分表示 |
| APIサーバーセッション永続化 | ゲートウェイ再起動後もセッション保存 |
| Camofoxブラウザ | 内蔵ブラウザエージェント |

## 他のフレームワークと比較すると

これがすべてを置き換える銀の弾丸だとは思わない。比較すると：

**Claude Code/OpenClaw** — コーディング特化、IDE統合が強み。CLAUDE.mdベースのプロジェクトルールは手動だがそれだけ制御可能。コード作成が主目的ならやはりClaude Codeが上。

**LangChain/CrewAI** — ワークフローオーケストレーションに強いが、「エージェントが自ら成長する」という概念はない。決められたグラフに沿って実行する構造。マルチエージェント協業がベンチマーク性能にどう影響するかは[SWE-benchマルチエージェント性能分析](/ja/blog/ja/multi-agent-swe-bench-verdent)で確認できる。

**Hermes Agent** — 汎用エージェントとして自己改善が核心。コーディングよりは日常自動化、リサーチ、コミュニケーションハブに適している。マルチプラットフォーム対応が特に強い。エンタープライズ規模でのエージェント展開については[Stripeの自律コーディングエージェントが1,300件のPRを処理した事例](/ja/blog/ja/stripe-minions-autonomous-coding-agents-1300-prs)が参考になる。

正直「自己進化」という言葉は少し過大評価される可能性があると見ている。現在のレベルは「作業記録をドキュメント化して再利用」に近く、人間が経験から学ぶように本質的に変わるわけではない。ただ、その「ドキュメント化の自動化」自体にすでにかなりの価値があることは認めざるを得ない。

## 誰に向いているか

- 複数のチャットプラットフォームで一つのエージェントで作業を処理したい個人開発者
- 反復的な業務を自動化したいが、毎回プロンプトを書き直すのが嫌なチーム
- エージェントフレームワークを自分でカスタマイズしたいが、LangChainの抽象化レイヤーが過剰だと感じる人
- Claude Codeでコーディングはするが、コーディング以外の自動化は別のエージェントに任せたい場合

MITライセンスで、モデルロックインがない点も良い。OpenRouter一つで200以上のモデルが使えるので、コスト最適化も柔軟にできる。

## まとめ

Hermes Agentが「革命的」だとか「パラダイムを変える」とまで言うつもりはない。ただ「タスク → スキル生成 → 再利用」というループをフレームワークレベルで自動化したのは明確に意義がある。2ヶ月で33Kスターを達成したのにはそれなりの理由がある。

個人的にはv0.7.0のプラグインメモリシステムが最も期待している。エージェント間のメモリ共有が本格的に始まれば、今の「一つの会話窓＝一つのコンテキスト」の限界を超えられそうだ。もちろんそのときまでこのプロジェクトがモメンタムを維持できるかが鍵だが。
