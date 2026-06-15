---
title: 'Claude Code 実践マスタークラス #1 — コマンド・フック・サブエージェント3ステップ自動化'
description: >-
  スラッシュコマンド(.claude/commands/)でタスクを定義し、settings.jsonフックでイベントに連結し、サブエージェント(.claude/agents/)に委任する3ステップのClaude
  Code自動化パターンを実際のブログ自動化システム構築事例でコード例を交えて解説します。
pubDate: '2026-05-10'
heroImage: ../../../assets/blog/claude-code-masterclass-series-1-prompt-to-agent-hero.jpg
tags:
  - ClaudeCode
  - 自動化
  - サブエージェント
  - ワークフロー
relatedPosts:
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.9
    reason:
      ko: 자동화 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into 자동화.
      ja: 자동화をもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 자동화 主题。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.85
    reason:
      ko: claudecode를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on claudecode experience.
      ja: claudecodeを実際に扱った経験が続く記事です。
      zh: 延续 claudecode 的实战经验。
faq:
  - question: スラッシュコマンドを作るのにプログラミングは必要ですか?
    answer: >-
      いいえ。.claude/commands/ ディレクトリに .md
      ファイルを1つ置くだけで、ファイル名がそのままコマンド名になります。ファイルの中身は自然言語の指示文で、Claudeが各ステップを解釈してツール呼び出しに変換します。
  - question: '--dangerously-skip-permissions フラグは安全に使えますか?'
    answer: >-
      名前の通り危険なフラグで、すべての権限プロンプトをスキップします。許可リストが適切に定義されている状態でのみ使うべきで、本文では個人の自動化プロジェクト以外への使用を勧めていません。
  - question: フックにはどんな種類があり、どれが最も便利でしたか?
    answer: >-
      PreToolUse、PostToolUse、Stop、SessionStart
      の4種類があります。筆者は長い自動化タスクが終わるとTelegramに通知を送るStopフックが最も便利だったと述べています。
  - question: frontmatterのdescriptionフィールドはなぜ重要なのですか?
    answer: >-
      オーケストレーターのClaudeが、どのエージェントをいつ使うべきかを判断するときにこのフィールドを参照するからです。曖昧に書くと、見当違いのエージェントが呼ばれるか、完全に無視されます。
---

今読んでいるこの記事は、今朝11時30分に自動実行されたlaunchdジョブがClaude Codeを起動し、`/daily-tech-blog`スラッシュコマンドを実行し、サブエージェントたちがリサーチと翻訳を分担して作った結果物である可能性が高い。

この数ヶ月、私はこの自動化パイプラインを自分で組み、動かしてきた。完璧ではない。タイムアウトが起きる。ビルドが落ちる。ある言語のバージョンだけ生成されて終わる日もある。それでも、このシステムがなければ毎日4言語で記事を出すのは物理的に無理だった。

このシリーズはその過程で学んだことを整理する。第1回の今回は、核心となる3ステップを最初から作る方法を扱う。<strong>スラッシュコマンド</strong>、<strong>フック</strong>、そして<strong>サブエージェント</strong>だ。

## Step 1: スラッシュコマンド: `.claude/commands/` フォルダがすべて

Claude Codeで`/commit`、`/review`、`/deploy`のようなコマンドを作る方法は驚くほどシンプルだ。`.claude/commands/`ディレクトリに`.md`ファイルを1つ置くだけでいい。

ファイル名がそのままコマンド名になる:

```
.claude/
└── commands/
    ├── commit.md          → /commit
    ├── daily-review.md    → /daily-review
    └── publish.md         → /publish
```

ファイルの中身は自然言語の指示文だ。Markdownに見えるが、コードのように動作する:

```markdown
# Publish Command

Validate and publish the blog post to production.

## Usage
/publish <slug>

## Workflow
1. Run npm run validate:publishing
2. Run npm run build
3. Run git add and commit with the slug
4. Run git push origin main

Report errors clearly with the step number.
```

これだけだ。Claude Codeセッションで`/publish my-post-slug`と入力すれば、上記のワークフローがそのまま実行される。Claudeが各ステップを解釈してツール呼び出しに変換する。

この構造を初めて見たとき驚いたのは、プログラミング言語が要らないという点だった。手順をテキストで書けば、Claudeが状況に合わせて実行してくれる。もちろん意図と違う解釈をされることもあって、この予測しづらさは正直まだ手こずっている。

### コマンド作成のコツ

「何をすべきか」だけでなく、「なぜこの順序か」「どんな状況で違う動作をすべきか」を合わせて書くと、はるかに精度が上がる:

```markdown
# Daily Tech Blog

Research, write, validate, and publish one daily article.

## Context
- Today's date: use `date +%F`
- Blog repo: ~/Documents/workspace/www.jangwook.net
- Content types: how-to (Mon-Wed), news (Thu-Fri), series (Sat-Sun)

## Failure Handling
- If sandbox test fails: switch to Source Review lane
- If build fails 3 times: stop and report
- Never ask the user — this runs unattended
```

"Never ask the user"の一行が自律実行モードを実現する鍵だ。これがないと、Claudeは不確かな状況のたびに確認を求めて止まる。cronジョブでは致命的になる。

## Step 2: settings.jsonフック: イベント駆動の自動化

スラッシュコマンドが「何をすべきか」を定義するなら、フックは「いつ自動的に動くべきか」を定義する。

`.claude/settings.json`の`hooks`フィールドにイベント-コマンドのペアを登録する:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/send-telegram.sh 'Claudeがタスクを完了しました'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[audit] $(date) — ファイル書き込み発生\" >> ~/.claude/audit.log"
          }
        ]
      }
    ]
  }
}
```

### 4種類のフックタイプ

| タイプ | 実行タイミング | 主な用途 |
|--------|------------|---------|
| `PreToolUse` | Claudeがツールを呼び出す<strong>直前</strong> | 危険なコマンドのブロック、監査ログ |
| `PostToolUse` | ツール呼び出しが<strong>完了した直後</strong> | ファイル保存後のlint、コミット後の通知 |
| `Stop` | Claudeが応答を<strong>完全に停止するとき</strong> | 完了通知、クリーンアップ |
| `SessionStart` | Claudeセッションが<strong>開始するとき</strong> | 時間コンテキストの注入、環境設定 |

私の設定で最も便利だったのは`Stop`フックだ。長い自動化タスク(30分〜1時間)が終わると、Telegramで通知が届く。これを設定してから「まだ終わったかな?」とターミナルを覗き込む習慣が完全になくなった。

### permissionsの設定: 許可リストベースのセキュリティ

フックと合わせて必ず設定すべきなのが`permissions`だ。Claude Codeはデフォルトで、すべてのBashコマンド実行前にユーザーの承認を要求する。自動化環境ではこの動作がパイプラインを止めてしまう。

許可するコマンドを事前に登録しておけば、承認プロンプトなしで実行される:

```json
{
  "permissions": {
    "allow": [
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(npm run build:*)",
      "Bash(npm run validate:*)"
    ]
  }
}
```

<strong>注意</strong>: 許可リストを広く設定しすぎると(`Bash(*)`のように)、意図しないコマンドが実行される可能性がある。実際に必要なコマンドパターンだけを登録するのが安全だ。

フックを実際のコードレビューパイプラインに適用した詳細な事例は、Claude Code Hookで構築する自動化コードレビューシステムで確認できる。

## Step 3: サブエージェント委任: `.claude/agents/` 専門化されたAI

リサーチ + 記事執筆 + SEO最適化 + 翻訳 + ビルドをすべて1つのClaudeに任せると、各分野の集中度が下がる。トークンコンテキストも無駄になる。

サブエージェントは、各役割に特化した別個のClaudeインスタンスを作る概念だ。`.claude/agents/`フォルダにfrontmatterを持つMarkdownファイルとして定義する:

```markdown
---
name: writing-assistant
description: Technical blog post writer. Use when creating multilingual (ko/ja/en/zh) developer content.
tools: Read, Write, WebSearch
---

You are a technical writer specializing in developer-focused content.

Core rules:
- Write for developers who will actually run the code
- Include at least 3 first-person experience references
- Verify technical claims before writing
- Never fabricate benchmarks or logs
```

frontmatterの`description`フィールドが重要だ。オーケストレーターClaudeが「どのエージェントをいつ使うべきか」を判断するときにこのフィールドを参照する。曖昧に書くと、見当違いのエージェントが呼ばれるか、完全に無視される。

`tools`フィールドには、そのエージェントが実際に必要なツールだけを列挙する。`Write`権限のないリサーチエージェントは、誤ってファイルを修正することができない。役割の特化と権限の制限を同時に実現する方法だ。

このブログでは現在19のエージェントが稼働している:

- `writing-assistant`: 4言語の記事執筆
- `seo-optimizer`: メタタグ、内部リンクの最適化
- `web-researcher`: トレンドリサーチとファクトチェック
- `content-recommender`: relatedPostsの生成
- `image-generator`: ヒーロー画像ブリーフの作成

エージェントをチームとして組織するより複雑なパターンは、[Claude Code Agent Teams完全ガイド](/ja/blog/ja/claude-agent-teams-guide)で扱った。

## 3ステップ統合: 実際の自動化パイプライン

理論より実際に動くパイプラインを見た方が理解しやすい。このブログの毎日の自動化フローはこうなっている:

```
macOS launchd (毎日11:30)
    ↓
daily-tech-blog.sh
    ↓
claude --dangerously-skip-permissions "/daily-tech-blog"
    ↓
/daily-tech-blog スラッシュコマンド実行
    ├── トレンドリサーチ (サブエージェント: web-researcher)
    ├── サンドボックステスト (mktemp)
    ├── 4言語記事執筆 (サブエージェント: writing-assistant)
    ├── npm run validate:publishing
    ├── npm run build
    └── git push origin main
    ↓
Stopフック → send-telegram.sh → Telegram通知
```

最も重要なファイルは`daily-tech-blog.sh`だ。Claudeを呼び出すコア部分:

```bash
run_with_timeout "$MAX_TIMEOUT" claude --dangerously-skip-permissions \
  "/daily-tech-blog" \
  < /dev/null >> "$LOG_FILE" 2>&1 || CLAUDE_EC=$?
```

`--dangerously-skip-permissions`はすべての権限プロンプトをスキップする。名前が示すように危険だ。許可リストが適切に定義されている状態でのみ使うべきで、個人の自動化プロジェクト以外への使用は勧めない。

`< /dev/null`はstdinを閉じ、Claudeが対話型入力を待ち続けるのを防ぐ。cronコンテキストでは必須だ。

実際の実行ログはこのようになっている:

launchd plistの設定も参考になる:

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>11</integer>
    <key>Minute</key>
    <integer>30</integer>
</dict>
<key>StandardOutPath</key>
<string>/Users/jangwook/logs/launchd-daily-tech-blog.log</string>
```

ログをファイルにリダイレクトしておくと、「なぜ今日の記事が公開されなかったのか」をデバッグするときに非常に役立つ。

## 実際に始める方法: 最小設定5分

この3ステップを初めて導入する人のために、最小限の動作サンプルをまとめる。既存のプロジェクトにそのまま適用できる。

**1. フォルダ構造の作成**

```bash
mkdir -p .claude/commands .claude/agents
```

**2. 最初のスラッシュコマンド** (`.claude/commands/review.md`)

```markdown
# Review Command

Review recent changes before committing.

## Steps
1. Run git diff --staged to see staged changes
2. Check for: hardcoded secrets, console.log, TODO comments
3. Suggest improvements or approve with "LGTM"

For detailed security analysis, delegate to @checker agent.
```

**3. 完了通知フックの設定** (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(npm:*)"]
  },
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "say 'Claudeがタスクを完了しました'"
      }]
    }]
  }
}
```

**4. 最初のエージェント定義** (`.claude/agents/checker.md`)

```markdown
---
name: checker
description: Code quality reviewer. Use when checking files for issues before commit.
tools: Read, Grep
---

Review the provided files for syntax errors, obvious bugs, and security issues.
Rate: SAFE / CAUTION / CRITICAL
```

この4つのファイルが最小動作単位だ。これだけで`/review`がステージング済みの変更を分析し、作業終了時に音声通知を受け取り、詳細な検査が必要な場合は`checker`エージェントに委任できる。

## この3ステップ自動化をいつ使い、いつ避けるべきか

3ステップすべてを構築してから、ようやく見えてきたことがある。このパターンは万能ではない。ある作業には過剰で、ある作業には不十分だ。

<strong>向いているケース</strong>:

- 毎日または毎週<strong>繰り返される多段階の作業</strong>があるとき。リサーチ → 執筆 → 検証 → 公開のように手順が固定されていて、毎回手でやるのが面倒な流れが代表例だ。
- 作業が<strong>複数の専門的な役割に自然に分かれるとき</strong>。リサーチと執筆とSEOを1つのコンテキストに詰め込むと品質が落ちる。サブエージェントに分離すれば、それぞれの集中度が上がる。
- 結果が<strong>客観的に検証可能なとき</strong>。`npm run build`や`astro check`のように合否が明確なゲートがあれば、LLMの非決定性をQAループで囲い込める。
- <strong>非対話的な実行</strong>が必要なとき。cronやlaunchdで人なしに回すパイプラインなら、スラッシュコマンドとフックの組み合わせがよく合う。

<strong>避けたほうがよいケース</strong>:

- <strong>一度きりの作業</strong>。一回限りの作業にコマンドファイルとエージェントを作るのは割に合わない。直接プロンプトを打つほうが速い。
- <strong>決定論的な出力が必須の作業</strong>。会計の照合、決済処理、マイグレーションスクリプトのように、毎回同じ出力が保証されるべき仕事にはLLMベースの自動化は不向きだ。通常のコードで書くべきだ。
- <strong>失敗コストが大きい作業</strong>。本番DBの変更や外部に送られるメールのように、間違えると元に戻しにくい作業は人間の最終承認を通すのが正しい。`--dangerously-skip-permissions`を絶対に付けてはいけない領域だ。
- <strong>要件が毎回変わる作業</strong>。コマンドファイルは安定した手順を自動化するときに輝く。毎回条件が変わる作業はむしろ対話的にやるほうがよい。

判断基準を一行にまとめるとこうだ。<strong>「この手順を来月もほぼ同じ形で繰り返すか、そして結果を自動で検証する方法があるか」</strong>。両方「はい」なら自動化し、どちらか1つでも「いいえ」なら手でやるほうがたいてい速く安全だ。

並列で複数の作業を同時に回したい段階まで来たなら、[git worktreeでClaude Codeセッションを並列実行するパターン](/ja/blog/ja/claude-code-parallel-sessions-git-worktree)が次の拡張方向として自然だ。

## 正直な評価: うまくいかないこと

このシステムを3ヶ月運用した結果、いくつかの現実的な制約に直面した。

<strong>コストの問題</strong>: 4言語で2,500語以上の記事を毎日自動生成すると、月々のAPIコストが予想以上に積み上がる。Anthropic Maxサブスクリプションでなんとか管理しているが、このコストを受け入れずにこの規模の自動化は難しい。

<strong>タイムアウト処理</strong>: ビルドが遅かったり、サブエージェントのチェーンが長くなると、60分のタイムアウトに引っかかる。記事が半分だけ生成された状態で中断する。タイムアウト検知後のクリーンアップロジックがなければ、リポジトリの状態が壊れる。

<strong>エージェント品質の非決定性</strong>: 同じコマンドを2回実行しても結果が異なることがある。記事の品質、内部リンクの位置、relatedPostsの選択。どれも日によって変わる。これはLLMの性質上避けられず、QAループ(validate:publishing、astro check、build)で最低限の品質基準を保つのが現実的だ。

正直に言えば、このシステムを「プロダクションレディ」と呼ぶのは時期尚早だ。私の基準では「個人の自動化には十分安定しているレベル」だ。チーム規模で使うには、エラー回復、状態管理、監査ログをより堅固に設計する必要がある。

エージェントワークフローを体系的に考えるフレームワークが必要なら、Claude Code エージェントワークフローパターン5種類が参考になる。

## 次回: #2 MCPサーバー連携

第1回は`.claude/`フォルダ内で完結する自動化を扱った。

第2回ではさらに一歩進む。<strong>MCPサーバーを自作してClaude Codeに外部ツールを接続する方法</strong>だ。Notionデータベースを読み込み、Slackにメッセージを送り、PostgreSQLにクエリを投げる。こうした外部システム連携がスラッシュコマンド1つで可能になる構造を解説する。

MCPサーバーを構築した経験があるなら、MCPサーバー構築実践ガイドが良い事前読書になる。

## 公式ドキュメントで確認する

この記事のスラッシュコマンド、フック、サブエージェントの動作はすべてClaude Codeの公式ドキュメントに明記されている。バージョンが上がるとfrontmatterのフィールドやフックのタイプが変わることがあるので、実際に構築する前に以下の一次情報を確認することを勧める。

- [スラッシュコマンド公式ドキュメント](https://code.claude.com/docs/en/slash-commands) — `.claude/commands/`のファイル形式と引数処理
- [フックリファレンス](https://code.claude.com/docs/en/hooks) — `PreToolUse`、`PostToolUse`、`Stop`、`SessionStart`など全イベントタイプとペイロード
- [サブエージェント定義ガイド](https://code.claude.com/docs/en/sub-agents) — `name`、`description`、`tools`のfrontmatterフィールドと`/agents`コマンド
- [Claude Code公式ドキュメントホーム](https://code.claude.com/docs/en/overview) — インストール、設定、MCPまでの全体概要

---

*この記事の`.claude/`ディレクトリ構造とシェルスクリプトのサンプルは、実際のjangwook.netブログ自動化システムから直接取得したものです。*
