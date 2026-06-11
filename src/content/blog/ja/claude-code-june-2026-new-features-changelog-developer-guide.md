---
title: Claude Code 2026年6月アップデート分析 — Safe Mode、Opus 4.8デフォルト、レート制限2倍
description: >-
  2026年6月のClaude Codeの主な変更点をまとめた。Safe Mode、/cdコマンド、Opus
  4.8デフォルト化、/usage細分化、レート制限2倍まで。
pubDate: '2026-06-11'
heroImage: >-
  ../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-hero.png
tags:
  - claude-code
  - ai-tools
  - developer-tools
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.95
    reason:
      ko: '요금 한도가 2배가 됐지만, 에이전트 세션에서 실제 비용이 어떻게 쌓이는지를 이해해야 한다. 이 글은 멀티 에이전트 워크플로우의 실제 비용 구조를 분석한다.'
      ja: レート制限が2倍になったが、エージェントセッションで実際のコストがどう積み重なるか理解が必要だ。この記事はマルチエージェントワークフローの実コスト構造を分析する。
      en: 'Rate limits doubled, but understanding how costs accumulate in agentic sessions matters just as much. This post breaks down the real cost structure of multi-agent workflows.'
      zh: 速率限制翻倍了，但了解agent会话中实际成本如何累积同样重要。这篇文章分析了多agent工作流的实际成本结构。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.95
    reason:
      ko: 'Dynamic Workflows를 현업에서 어떻게 활용하는지 궁금하다면, DeNA가 레거시 코드베이스 마이그레이션에 AI 에이전트를 투입한 실제 사례가 좋은 비교 대상이다.'
      ja: Dynamic Workflowsを実業務でどう活用するか気になるなら、DeNAがレガシーコードベース移行にAIエージェントを投入した実際の事例が良い比較対象だ。
      en: "Wondering how Dynamic Workflows plays out in real production work? DeNA's AI-agent-driven legacy migration is a grounded comparison case."
      zh: 好奇Dynamic Workflows在真实工作中如何落地？DeNA利用AI agent进行遗留代码迁移的案例是很好的参照。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '/usage 세분화로 스킬별 토큰 사용량이 보이기 시작했다. Anthropic 에이전트 스킬의 구조를 이해하면 어떤 스킬이 왜 많은 토큰을 쓰는지 해석하는 데 직접 도움이 된다.'
      ja: /usage細分化でスキル別のトークン使用量が見えるようになった。Anthropicエージェントスキルの構造を理解すると、どのスキルがなぜ多くのトークンを使うか解釈するのに直接役立つ。
      en: '/usage now shows per-skill token consumption. Understanding the Anthropic agent skills structure helps you interpret why certain skills are driving your usage.'
      zh: /usage细分化让每个技能的token用量变得可见。了解Anthropic agent技能结构，有助于解读为什么某些技能消耗较多token。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: 'Claude Code가 Anthropic 에이전트 스킬 표준 위에서 동작한다. Safe Mode로 커스텀 스킬을 끄면 어떤 스킬이 기본인지 알 수 있는데, 이 글이 그 표준을 설명한다.'
      ja: Claude CodeはAnthropicエージェントスキル標準の上で動作する。Safe Modeでカスタムスキルをオフにするとデフォルトのスキルがわかるが、この記事がその標準を説明している。
      en: 'Claude Code runs on top of the Anthropic agent skills standard. Safe Mode strips custom skills. This post explains what the underlying standard actually defines.'
      zh: Claude Code建立在Anthropic agent技能标准之上。Safe Mode关闭自定义技能后，这篇文章解释了底层标准实际定义了什么。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: 'Dynamic Workflows는 백그라운드에서 수십 개의 에이전트를 조율한다. Claude 에이전트 팀 가이드는 그 멀티 에이전트 조율의 기본 패턴을 다루고 있어 이해의 기반이 된다.'
      ja: Dynamic Workflowsはバックグラウンドで数十のエージェントを調整する。Claudeエージェントチームガイドは、そのマルチエージェント調整の基本パターンを扱っており理解の基盤になる。
      en: 'Dynamic Workflows coordinates dozens of agents in the background. The Claude agent teams guide covers the foundational patterns behind that multi-agent orchestration.'
      zh: Dynamic Workflows在后台协调数十个agent。Claude agent团队指南涵盖了这种多agent编排的基础模式，是理解的基础。
---

6月上旬、Claude Codeがかなりの変更を加えた。ある日 `claude --version` を打つと 2.1.172 と表示され、リリースノートを開くとSafe Mode、/cdコマンド、Opus 4.8デフォルト化、/usage細分化が一度に入っていた。個々の変更は小さくても、積み重なると違いが出る。

この記事では、6月アップデートの中で実際に使えそうな機能をCLIで直接確認しながらまとめた。公式リリースノートをそのまま転記するのではなく、ヘビーユーザーの立場から「これが実際に何を変えるのか」に絞った。実際に `claude --safe-mode` を実行し、`claude agents --help` の出力も確認した。

---

## 今回のアップデート、一言評価から

<strong>ヘビーユーザーには意味のあるアップデート、ライトユーザーは実感しにくい。</strong>

Safe Modeと/cdは設定が壊れた時に使うもので、/usage細分化はマルチプラグイン・エージェント構成を運用するチームで輝く。レート制限2倍が最もインパクトが大きいが、すでに制限に頻繁にかかっていないユーザーには実感しにくい。

Opus 4.8のデフォルト化だけは全ユーザーに即座に適用される — ただしこれはモデルアップデートであり、Claude Codeのアップデートというよりはモデルポリシーの変更に近い。

残念な点もある。/cdコマンドは「ディレクトリを変えてもプロンプトキャッシュが壊れない」と言うが、複雑なマルチリポ構成では依然として新しいセッションを開く方が安全だ。Safe Modeは「なぜ今頃」という気持ちが強い。2025年を通じて「MCP設定の競合でセッションが起動しない」という問題が繰り返されていたのに、解決策がこんなに遅かったのは正直残念だ。

---

## Safe Modeと/cd — 設定が壊れた時の救命ロープ

Safe Modeは `--safe-mode` フラグ一つで有効にできる。

```bash
claude --safe-mode
```

何を無効にするのか？ CLAUDE.md、スキル、プラグイン、フック、MCPサーバー、カスタムコマンド、エージェント、アウトプットスタイル、ワークフロー、テーマ、キーバインディング。要するにユーザーが追加した全カスタマイズを無効にして、純粋なデフォルト状態で起動する。`CLAUDE_CODE_SAFE_MODE=1` 環境変数でも同様に設定できる。

実際に `claude --help` の出力で確認した内容だ：

```
  --safe-mode     Start with all customizations
                  (CLAUDE.md, skills, plugins, hooks, MCP
                  servers, custom commands and agents,
                  output styles, workflows, custom themes,
                  keybindings, and more) disabled — useful
                  for troubleshooting a broken
                  configuration. Sets CLAUDE_CODE_SAFE_MODE=1.
```

私はMCPサーバーを複数接続し、フックもいくつか設定している。特定のMCPサーバーの設定が間違っていたり、フックが予期しない動作をする時に、セッション起動時からエラーが出ることがあった。以前は設定ファイルを一つずつコメントアウトするか、`.claude/settings.json` をバックアップして一時的に空にしなければならなかった。今は `--safe-mode` で即座に診断モードに入れる。

重要な点として、管理者ポリシー設定はSafe Modeでも維持される。チーム・エンタープライズ環境でセキュリティルールが迂回されることはない。`--bare` フラグとも似ているが違う。`--bare` はOAuth認証すら無効にする極端な最小モードで、Safe Modeは設定だけを切り、認証とモデル選択は正常に機能する。

<strong>/cdコマンド</strong>はセッション中に作業ディレクトリを変更できる。以前は別のディレクトリに移るには新しいセッションを開く必要があり、その過程で積み上げてきたプロンプトキャッシュが消えた。/cdはキャッシュを維持したままディレクトリだけを変える。

フロントエンドとバックエンドの2リポを行き来する状況では便利だ。ただ実際に使ってみた感覚は「あると便利だが、なくて深刻に困っていたわけでもない」という程度だ。

---

## Opus 4.8デフォルト化とDynamic Workflows

Opus 4.8は5月28日にリリースされ、Claude Codeではv2.1.170（6月9日）からデフォルトモデルになった。

Anthropicの公式発表によると、Opus 4.7比でコーディング・エージェントタスク・専門業務での改善があるとのことだ。「控えめだが体感できる改善」という評価が多い。私が実際に使ってみた感覚では、複雑なリファクタリングやマルチファイル修正でミスが少し減った印象はあるが、劇的に変わったわけではない。

[Claude Codeエージェントワークフロー5パターン](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)で紹介した並列エージェントパターンが、Opus 4.8のDynamic Workflowsと直結する。

Dynamic Workflowsは、Claudeに「この作業をワークフローにしてください」と依頼すると、数十〜数百のエージェントを調整してバックグラウンドで大規模な作業を処理する機能だ。Anthropicが今回強調したポイントは2つある：

- Fast ModeでOpus 4.8が従来モデル比2.5倍高速
- Opus 4.8のFast Mode価格が従来モデルの3分の1程度に下がった

Fast Mode価格の引き下げは思ったより意味がある。Opusシリーズは元々快速モードでも高価だったが、今回かなり下がった。ただしDynamic Workflows自体が個人開発者にとって実用的かどうかは、まだ判断するには早い。数十のエージェントを同時に調整するワークフローは、大規模コードベースや企業レベルの複雑な作業でより輝くだろう。

---

## /usage細分化 — 何がトークンを消費しているか、ついに見える

今回のアップデートで個人的に最も実用的だと感じた変更だ。5月Week 21のアップデートで入り、6月バージョンで完全に安定した。

以前の `/usage` コマンドは全体の使用量しか表示しなかった。「今月Xトークン使いました」というレベル。プラグインを複数、MCPサーバーを複数設定していると、どこでトークンが消えているか全くわからなかった。

今は `/usage` がカテゴリ別に分類してくれる：

- スキル別使用量
- サブエージェント別使用量
- プラグイン別使用量
- 個別MCPサーバー別使用量

[Claude Codeプラグイン完全ガイド](/ja/blog/ja/claude-code-plugins-complete-guide)でプラグイン構造を詳しく扱ったが、プラグイン一つがスキル・フック・MCPサーバーをバンドルとして含めることができる。そのうちどのコンポーネントがどれだけトークンを使うかが、今や分離して見えるのが核心だ。

自分の設定で実際に確認したら、Google Analytics MCPサーバーが予想より多くのトークンを消費していた。自動呼び出しが多かったためで、これがようやく見えたのでMCPサーバーの設定で呼び出し頻度を減らす調整をすぐに行えた。

また `/extra-usage` が `/usage-credits` に名称変更された。些細に見えるが「extra」という言葉が超過使用を連想させていたのが、「credits」で明確になった。

---

## レート制限2倍 — SpaceX契約の実質的な意味

5月6日、AnthropicがSpaceXとコンピューティングインフラ契約を締結した。メンフィスのColossus 1データセンターで300MWの容量、22万台以上のNVIDIA GPUへのアクセス権を得たという。

この契約の直接的な結果がレート制限2倍だ：

![Claude Codeレート制限変更比較](../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-rate-limits.png)

数字で見ると、APIティア1基準で毎分入力トークンが3万から50万に急増した。Pro/Max/Team/Enterpriseすべてで5時間ローリングウィンドウ制限が2倍になり、ピーク時スロットリングも廃止された。

実際に影響を体感するには2つの条件が必要だ。以前に制限に引っかかった経験があること、そして長いエージェントセッションを頻繁に使うこと。

私は午前の業務時間にClaude Codeを集中的に使うが、以前は時々「レート制限超過」メッセージが出てセッションが切れることがあった。ピーク時スロットリングがなくなったのが特に実質的だ。今は午前10〜12時のような忙しい時間帯でも速度低下なしに使える。

---

## Safe Mode実践活用シナリオ — いつ使い、いつ使わないか

Safe Modeを使うと良い状況と使うべきでない状況がある。

<strong>使うと良い状況：</strong>

新しいMCPサーバーを追加した後にセッションが起動時からエラーを吐く時。CLAUDE.mdがあるプロジェクトでClaudeが奇妙な動作をする時、CLAUDE.mdの問題かどうか確認したい時。プラグインアップデート後に予期しない動作が生じた時、どのプラグインが原因か切り分けたい時。

<strong>使うべきでない状況：</strong>

日常的な開発作業。Safe Modeで使うと、CLAUDE.mdで定義したプロジェクトコンテキストも消え、普段使っているスキルも使えない。問題診断の用途にのみ使うべきだ。

一つコツ：Safe Modeで問題が再現しなければ、問題の原因はカスタマイズのどこかにある。その次はプラグインを一つずつ無効にしながら絞り込めばいい。Safe Modeは出発点であり、最終診断ツールではない。

---

## HooksのMCPツール直接呼び出し — 実務でどう使うか

[Claude Code Hooksワークフロー](/ja/blog/ja/claude-code-hooks-workflow)で扱ったフックシステムが今回のアップデートでさらに強力になった。注目すべき2つの変更がある。

<strong>MCPツールタイプフック</strong>

フックで `type: "mcp_tool"` を使うと、すでに接続されているMCPサーバーのツールを直接呼び出せる。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "mcp_tool",
        "server": "my-validation-server",
        "tool": "validate_before_edit"
      }
    ]
  }
}
```

以前はフックから外部プロセスをspawningしてMCPサーバーに間接的にアクセスする必要があった。今はすでに接続されているサーバーを直接再利用できる。コード編集前にリンティングサーバーを呼び出すなど、様々な活用が可能だ。

<strong>MessageDisplayフックイベント</strong>

アシスタントメッセージが画面に表示される時に横取りして変換・非表示にできる。v2.1.152で追加された機能だ。

```json
{
  "hooks": {
    "MessageDisplay": [
      {
        "type": "command",
        "command": "message-filter.sh"
      }
    ]
  }
}
```

チーム環境での出力フィルタリングやSlackへのメッセージ転送などに活用できる。個人開発者には今すぐ使う機会が多くないかもしれないが、チームワークフローをカスタマイズする立場では強力なフックポイントだ。

---

## 見逃しやすい細かな変更

`claude agents --json --all` が追加された。基本的に現在実行中のバックグラウンドエージェントのみをJSONで出力し、`--all` を付けると完了したセッションも含む。実際に `claude agents --help` で確認した内容だ：

```
  --all    With --json: include completed sessions
           (the full agent view list)
```

```bash
# 現在実行中のバックグラウンドエージェントのみ
claude agents --json

# 完了したセッションも含む
claude agents --json --all
```

起動時のバナーから「bashコマンドがサンドボックス化されます」のメッセージが削除された。サンドボックス状態は `/status` で確認でき、コマンドがブロックされる際は依然として表示される。毎セッション表示されていたバナーがなくなり、ターミナルがすっきりした。

---

## 私の評価：良かったこと、残念なこと、次に見たいこと

<strong>良かったこと：</strong>

Safe Modeは遅かったが歓迎だ。設定問題の診断がどれだけ面倒だったかを考えると、今でも入ってよかった。/usage細分化はすぐに実用的に使えた。どのMCPサーバーがトークンを多く消費しているかを初めて確認できた。ピーク時スロットリング廃止も業務時間の効率に直接影響する。

<strong>残念なこと：</strong>

Safe Modeがなぜ今頃になって追加されたのか依然として疑問だ。設定競合の問題は2025年から繰り返されていた。Dynamic Workflowsはまだ個人開発者が「これだ！」と活用するには使用シナリオが狭い。

<strong>次に見たいこと：</strong>

/usage細分化ができたのだから、次の自然なステップは「特定のMCPサーバーやプラグインにトークン予算を設定する機能」だ。全体の制限管理はできるが、コンポーネント別の上限を設定することはできない。

全体的に今回の6月アップデートは「静かだが実務を磨く」アップデートだ。Claude Codeを一日中使う人には確実に体感できる変化がある。ただし「革新的な機能」を期待してリリースノートを開いたなら失望するかもしれない。それがこのアップデートの性格だ。

リリースチャンネルを定期的に確認したい場合は公式ドキュメントの [What's new](https://code.claude.com/docs/en/whats-new)を参照するか、npmレジストリで `@anthropic-ai/claude-code` の最新バージョンを直接確認するのが最速だ。今回確認したところ、npm基準の最新バージョンは2.1.173だった。アップデートは `claude update` コマンドで自動的に受け取れる。

一つ付け加えるなら、今回のアップデートたちの共通点は「使用量が増えるほど必要だったもの」という点だ。1年前にClaude Codeを使い始めた頃はSafe Modeのような機能はほとんど必要なかった。MCPサーバーを1〜2個しか使わず、プラグインもフックもない頃だったから。今は設定が複雑になった分、こういった診断ツールとモニタリング機能の価値が高まった。Claude Codeの成熟の方向性を示すアップデートだと見ている。
