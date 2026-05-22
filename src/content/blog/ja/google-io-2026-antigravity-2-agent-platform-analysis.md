---
title: 'Google I/O 2026: Antigravity 2.0 — Gemini CLI終了とエージェントIDE戦争'
description: >-
  Google が I/O 2026 で Antigravity 2.0 を発表し、Gemini CLI を 6 月 18 日に終了する。実際にインストール済みのアプリの拡張構造と Gemini 3.5 Flash API を直接分析し、Claude Code と比較する。
pubDate: '2026-05-21'
heroImage: ../../../assets/blog/google-io-2026-antigravity-hero.png
tags:
  - google
  - antigravity
  - ai
  - developer-tools
  - gemini
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.92
    reason:
      ko: AI 코딩 IDE 3파전(Cursor, Claude Code, Windsurf)을 다룬 이 글을 읽었다면, Antigravity 2.0이 새 경쟁자로 어떻게 자리잡는지 맥락이 생긴다.
      ja: AIコーディングIDE 3社対決(Cursor, Claude Code, Windsurf)を扱った記事を読んでいれば、Antigravity 2.0が新たな競合としてどう位置づけられるかの文脈が生まれる。
      en: If you read this piece on the three-way AI coding IDE battle (Cursor, Claude Code, Windsurf), Antigravity 2.0's entry as a new contender makes much more sense in context.
      zh: 如果你读过这篇关于AI编码IDE三强争霸（Cursor、Claude Code、Windsurf）的文章，就能更好理解Antigravity 2.0作为新竞争者的定位。
  - slug: gemini-31-pro-release
    score: 0.88
    reason:
      ko: Gemini 3.1 Pro를 분석한 이 글과 이어서 읽으면, Gemini 모델이 3.1→3.5로 이동하면서 API 가격과 성능이 어떻게 변화했는지 추적할 수 있다.
      ja: Gemini 3.1 Proを分析したこの記事と併せて読むと、Geminiモデルが3.1→3.5へ移行する中でAPIの価格と性能がどう変化したか追跡できる。
      en: Read alongside this Gemini 3.1 Pro analysis to track how the model's API pricing and performance evolved from 3.1 to 3.5.
      zh: 与这篇Gemini 3.1 Pro分析文章一起阅读，可以追踪Gemini模型从3.1到3.5的API价格和性能变化。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.85
    reason:
      ko: Claude Code로 병렬 에이전트를 실행하는 방법을 이미 알고 있다면, Antigravity 2.0의 parallel subagent 설계가 어디서 다르고 어디서 비슷한지 더 정확히 판단할 수 있다.
      ja: Claude Codeで並列エージェントを実行する方法を知っていれば、Antigravity 2.0のparallel subagent設計がどこで違いどこで似ているかをより正確に判断できる。
      en: If you already know how to run parallel agents in Claude Code, you can more precisely judge where Antigravity 2.0's parallel subagent design diverges and where it converges.
      zh: 如果你已经了解如何在Claude Code中运行并行代理，就能更准确地判断Antigravity 2.0的并行子代理设计在哪里不同、哪里相似。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.83
    reason:
      ko: 2026년 주요 LLM API 가격을 비교한 이 글과 함께 보면, Gemini 3.5 Flash의 $1.50/MTok이 경쟁 가격 대비 어떤 위치인지 직접 숫자로 비교할 수 있다.
      ja: 2026年の主要LLM API価格を比較したこの記事と合わせると、Gemini 3.5 Flashの$1.50/MTokが競合価格対比でどの位置にあるか直接数字で比較できる。
      en: Read alongside this 2026 LLM API pricing comparison to place Gemini 3.5 Flash's $1.50/MTok in direct numerical context against competitors.
      zh: 与这篇2026年主要LLM API价格对比文章一起看，可以直接用数字比较Gemini 3.5 Flash的$1.50/MTok在竞争价格中的位置。
  - slug: multi-agent-orchestration-routing
    score: 0.81
    reason:
      ko: 멀티 에이전트 오케스트레이션 라우팅 패턴을 다룬 이 글의 개념들이 Antigravity 2.0의 parallel subagent 설계에 그대로 적용된다.
      ja: マルチエージェントオーケストレーションのルーティングパターンを扱ったこの記事の概念が、Antigravity 2.0のparallel subagent設計にそのまま適用される。
      en: The multi-agent orchestration routing patterns covered here map directly onto Antigravity 2.0's parallel subagent design.
      zh: 本文中关于多代理编排路由模式的概念直接适用于Antigravity 2.0的并行子代理设计。
---

Google I/O 2026 から 2 日が過ぎた。キーノートの動画を見返しながら、ふとターミナルを開いた。Antigravity がすでにインストールされているかどうか確かめたくなったからだ。

```bash
$ defaults read /Applications/Antigravity.app/Contents/Info.plist CFBundleShortVersionString
1.23.2
```

インストールされていた。バージョン 1.23.2。そのまま中身を調べてみた。この記事はその過程で確認したことをまとめたものだ。

## Antigravity 2.0 とは何か — 一言で

Google I/O 2026 で発表された Antigravity 2.0 は「エージェント優先の開発プラットフォーム」だ。デスクトップ IDE、CLI（`agy`）、SDK、Managed Agents API ティア、エンタープライズ向け展開パスを一つの製品群としてまとめた。以前の Antigravity が Cursor のクローンに近い AI コーディング IDE だったとすれば、2.0 からはマルチエージェントオーケストレーションをプラットフォームレベルで統合しようとしている。

そして Gemini CLI は 2026 年 6 月 18 日に終了する。AI Pro、AI Ultra、無料ユーザーすべてが対象だ。オープンソースを閉じ、使用量制限のあるクローズドソフトウェアへの強制移行である。Google は「全員 Antigravity に来い」と宣言したようなものだ。

### 注目すべき 3 つの理由

正直、最初は「また別の Cursor クローン」と流しかけた。だが 3 点が引っかかった。

**Gemini CLI の終了**: Gemini CLI はオープンソースだった。数十万の開発者が使っていたツールをクローズドソフトウェアで置き換えることは、戦略的な宣言だ。Google が開発者ツールを収益モデルに本格的に組み込もうとしているシグナルだ。

**GEMINI.md と `.agents/` ディレクトリ**: Claude Code の `CLAUDE.md` と `.claude/agents/` を見たことがあれば馴染みがあるだろう。Antigravity も同じパターンを使う。エージェント定義ファイルがプロジェクト内に置かれ、ビルドシステムのように動作する。

**Gemini 3.5 Flash**: $1.50/MTok 入力、$9.00/MTok 出力。1M トークンコンテキスト。この価格表が Antigravity 製品群の競争力を左右する。

## 直接調べた: 拡張構造から読むアーキテクチャ

ターミナルからアプリの内部を開いた。Antigravity は Electron アプリで、VS Code 1.107 ベースだ。

```bash
$ cat /Applications/Antigravity.app/Contents/Resources/app/product.json
# version: 1.107.0
# nameShort: Antigravity
```

拡張リストで目についたもの:

```
/Extensions/antigravity/              ← コア エージェント拡張 (v0.2.0)
/Extensions/antigravity-code-executor/    ← Cascade が生成したコードの実行
/Extensions/antigravity-dev-containers/   ← リモートコンテナ対応
/Extensions/antigravity-remote-openssh/   ← SSH リモート作業
```

そして `package.json` の `jsonValidation` 項目が興味深かった:

```json
{
  "fileMatch": "**/mcp_config.json",
  "url": "./schemas/mcp_config.schema.json"
}
```

MCP 設定ファイルのスキーマが内蔵されている。Antigravity が MCP エコシステムをサポートするということだ。エージェントツールを MCP で拡張できる構造だ。

コマンドリストにも面白い項目があった:

```
antigravity.importCursorSettings      ← Cursor 設定インポート
antigravity.importWindsurfSettings    ← Windsurf 設定インポート
antigravity.importVSCodeSettings      ← VS Code 設定インポート
antigravity.importCiderSettings       ← Cider（Google 内部 IDE）設定インポート
```

4 つの競合製品の設定インポートをビルトインでサポートしている。「移行コストをなくす」という意図は明確だ。

Antigravity CLI（`agy`）は 2026-05-21 時点でまだ公開されていない。npm にも `@google/antigravity` パッケージはない。Homebrew Cask でインストールできるのは IDE アプリのみだ。Source Review に切り替えて以降を分析する。

## Antigravity 2.0 の発表内容 — 公式ドキュメントと公開例ベース

### マルチエージェント並列実行

一つの lead agent が高レベルの目標を受け取り、複数の specialist subagent に委任する。各サブエージェントは独立したコンテキストウィンドウ、モデル、プロンプト、ツールセットを持つ。Google の公開例で言及されたサブエージェントの種類:

- **Architect Agent**: アーキテクチャと設計パターン
- **Coding Agent**: 実装の詳細
- **Testing Agent**: ユニットテスト、回帰テスト
- **Documentation Agent**: 技術ドキュメントの自動更新

これは [Claude Code でサブエージェントを並列実行する方法](/ja/blog/ja/claude-code-parallel-sessions-git-worktree)と本質的に同じパターンだ。違いは Google がこれを IDE の GUI として提供している点だ。

### GEMINI.md と .agents/ ディレクトリ

プロジェクトルートに `GEMINI.md` を置くと、すべてのエージェントが共通ルールを参照する。`.agents/` ディレクトリに `agents.md` と `skills.md` を置くと、サブエージェント定義と再利用可能なスキルを宣言できる。

[マルチエージェントオーケストレーションのルーティングパターン](/ja/blog/ja/multi-agent-orchestration-routing)で整理した概念がここでも直接適用される。

### Antigravity CLI（agy）

Google は `agy` という新しい CLI を発表した。Gemini CLI から移行される概念で、`agy` コマンドでターミナルからエージェントを作成・実行できるとされる。Gemini CLI が持っていた Agent Skills、Hooks、Subagents、Extensions 機能を引き継ぐ。

問題はまだ配布されていないことだ。The Register は「[開発者が Antigravity へ追いやられている](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)」と表現した。機能の準備が整う前にマイグレーションの期限を設定したという批判だ。

## Gemini 3.5 Flash API — 価格分析

Antigravity 2.0 のエンジンは Gemini 3.5 Flash だ。2026 年 5 月 19 日に GA。

| 項目 | 数値 |
|------|------|
| 入力価格 | $1.50 / 1M トークン |
| 出力価格 | $9.00 / 1M トークン |
| コンテキストウィンドウ | 1,048,576 トークン（≈786K 単語）|
| 最大出力 | 65,536 トークン |
| 速度 | 比較モデル対比 4 倍高速 |

Claude Opus 4.7（$15/$75 per MTok）と比べると、入力ベースで 10 倍安い。モデル性能の差はあるが、Gemini 3.5 Flash は Gemini 3.1 Pro を 5 つのベンチマークで上回る。

Terminal-Bench 2.1 で 76.2%、MCP Atlas 83.6% という公開数値を見ると、コーディングエージェント用モデルとして競争力のある位置づけだ。私はこの価格表が Antigravity エコシステムの核心的な競争力だと見ている。

## GEMINI.md vs CLAUDE.md — 2 つのプラットフォームの類似したアプローチ

私は Claude Code を日常的に使っている。`CLAUDE.md` にプロジェクトルールを書き、`.claude/agents/` にサブエージェントを定義し、`.claude/skills/` に再利用可能なスキルを置く。Antigravity が `GEMINI.md`、`.agents/`、`skills.md` で同じ構造を採っていることは、このコンベンションが収束していることを意味する。

**実行モデル**: Claude Code はターミナル中心の CLI ツールだ。GUI なしでコードとプロンプトでエージェントを組み合わせる。Antigravity は GUI が中心だ。並列エージェントが画面に視覚的に表示される。

**エコシステム結合度**: Claude Code は Anthropic API への依存が強い。Antigravity は MCP サポートを内蔵しているため、外部ツールの統合がより柔軟だ。その代わり Gemini モデルとの結合度が強い。

## Windsurf と同じ名前の Cascade — 偶然ではない

Antigravity のエージェントパネルの名前は Cascade だ。Windsurf の AI エージェント機能の名前も Cascade だ。公式ドキュメントで直接確認した。これが偶然であるはずがない。

Windsurf は元々 Codeium が作った IDE で、Cascade によるエージェントコーディングで Cursor と差別化した。Antigravity が同じ名前を使うということは、Google が Windsurf のユーザー層を直接狙っているというシグナルだ。確認した設定インポートリストに `antigravity.importWindsurfSettings` があることも同じ文脈だ。

この IDE 戦争がどこへ向かうか予測は難しいが、競争激化は開発者にとっていいことだ。[Cursor、Claude Code、Windsurf の比較分析](/ja/blog/ja/cursor-3-vs-claude-code-vs-windsurf-2026)を書いた時は 3 社だったが、今や Antigravity が 4 番目として参入した。次の比較分析が必要になりそうだ。

## Gemini Code Assist エンタープライズユーザーは例外

重要な例外条件がある。Gemini CLI の終了はすべてのユーザーに適用されるわけではない。

Gemini Code Assist Standard や Enterprise ライセンスで Gemini CLI を使用している組織は、今回の変更の影響を受けない。Google Cloud 経由の Gemini Code Assist for GitHub も同様だ。

これが意味することは 2 つだ。まず Google は企業収益には手を付けない。次に Antigravity へのマイグレーション圧力は個人開発者と小規模チームに集中する。オープンソースの Gemini CLI を最も積極的に使っていた層がまさにこれだ。

## 批判: Gemini CLI の退役は判断ミスだ

正直、これが一番引っかかる。

Gemini CLI はオープンソースだった。開発者たちが貢献し、フォークし、カスタマイズした。それをクローズドソフトウェアで置き換えながら 6 月 18 日の期限を設けたことは信頼の問題だ。

さらに深刻なのは使用量制限だ。コミュニティの報告によれば、週次クォータが急速に消費される。Gemini CLI でほぼ無制限に使えていた人々が Antigravity CLI に移行すると、この壁にぶつかる。

技術的により優れた製品を作っても、この方法で移行を進めれば開発者コミュニティの信頼を損なう。Google はこのコストを過小評価する傾向がある。

## 最終判断 — Google が本気になったのは確かだ

Cursor クローンを作っていた初期の Antigravity とは今は違う。マルチエージェントオーケストレーションを IDE レベルで統合し、Gemini 3.5 Flash という低コスト高性能エンジンを搭載し、MCP で外部ツールを接続する構造は正しい方向だ。

ただし実行の問題がある。Gemini CLI を代替の準備なしに退役させ、使用量制限をかけ、CLI もまだ配布せずに期限を設けることは、製品より戦略が先行している状況だ。

私はこれを今すぐメインツールとして切り替えない。ただし Gemini 3.5 Flash API はすぐに試す価値がある。入力価格がこのレベルなら、プロトタイピングモデルとして十分だ。Antigravity 2.0 自体は `agy` CLI が出て、使用量ポリシーが安定したら再評価するつもりだ。

Google がエージェント開発プラットフォームの競争に本気で乗り出したことは確かだ。この競争が Claude Code、Cursor、Windsurf すべてに圧力をかければ、最終的に開発者が利益を得る。その観点からは Antigravity 2.0 の登場を歓迎する。しかし、オープンソース政策の後退は別の問題だ。技術的に優れていても、信頼を失えば開発者エコシステムは離れやすい。

---

**実行可能性の判断（Source Review 基準）:**

- Antigravity 2.0 デスクトップアプリ: インストール確認（v1.23.2）、内部構造を直接分析
- `agy` CLI: 2026-05-21 現在未配布
- Gemini 3.5 Flash API: 公式価格 $1.50/$9.00 per MTok 確認済み
- マルチエージェント機能: 公式発表文および Google Codelabs ベース、直接実行は不可

**公開ソース:**
- [Google I/O 2026 Developer Highlights](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)
- [Gemini CLI → Antigravity 公式移行ガイド](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [Gemini 3.5 Flash 公式紹介](https://deepmind.google/models/gemini/flash/)
