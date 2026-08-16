---
title: 'AGENTS.mdとCLAUDE.mdを76回走らせて読み込みの境界を数えた'
description: '空のリポジトリに指示書を置き、codexとClaude Codeへ同じ命令を投げた。互いのファイルを一切読まない0件の相互認識から、モノレポでサブディレクトリの指示が読み飛ばされる条件、ツール選択で読み込みが途切れる仕組みまで、2026年8月16日の実測76回で記録した。回避はシンボリックリンクとfallback。'
pubDate: '2026-08-16'
heroImage: '../../../assets/blog/agents-md-vs-claude-md-loading-measured-2026/hero.png'
tags: ['agents-md', 'claude-code', 'codex', 'ai-agent', 'web-development']
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.9
    reason:
      ko: '지시문이 모델 성능을 올리는지 다룬 논문 검증에 이어, 파일 자체가 언제 컨텍스트에 실리는지 물리적 적재 경계를 확인한다.'
      ja: '指示書がモデル性能を上げるかを検証した論文記事に続き、ファイル自体がいつコンテキストへ読み込まれるかの物理的な境界を確かめる。'
      en: 'Follows up on empirical research testing whether instructions improve model performance by measuring when the file actually enters context.'
      zh: '继探讨指示文件是否能提升模型性能的论文实证之后，进一步确认文件本身在何时被装入上下文的物理边界。'
  - slug: modern-web-guidance-agent-skill-coverage-2026
    score: 0.8
    reason:
      ko: '에이전트 스킬과 지시문이 실제 프로젝트 규칙을 얼마나 포괄하는지 다룬 글과 연결된다.'
      ja: 'エージェントスキルと指示書が実際のプロジェクト規約をどこまでカバーするかを扱った記事とつながる。'
      en: 'Connects with the analysis of how well agent skills and instructions cover real project conventions.'
      zh: '与探讨智能体技能与指示文件在多大程度上覆盖实际项目规范的文章相呼应。'
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.75
    reason:
      ko: '에이전트에게 읽히지 않은 지시문이 팀 안에서 어떻게 인지적 부채로 쌓이는지 검토할 수 있다.'
      ja: 'エージェントに読まれない指示書がチーム内でどのように認知的負債として積もるかを検討できる。'
      en: 'Examines how unread instructions accumulate as cognitive debt within engineering teams.'
      zh: '探讨未被智能体读取的指示文件如何在团队内部堆积为认知负债。'
---

空のリポジトリのルートに `AGENTS.md`、`packages/api/note.txt` に一行を置いた。指示は「すべての回答の末尾に ZZROOT7 を単独行で付けろ」だけだ。

同じ場所で二つのCLIに「Print the first line of packages/api/note.txt. Nothing else.」を投げると、`codex exec` は `BLUEBERRY-9182` の次に `ZZROOT7` を添えて12.1秒、`claude -p` は `BLUEBERRY-9182` だけを返して10.1秒だった。

## ログに残った拒絶とプロンプト注入の疑い

サブディレクトリの `packages/api/CLAUDE.md` をルートから読むと、6回中4回しか通らなかった。

乱数を疑い、実行ログのある `.result` にこう記録されていた。

「Nothing elseに反し、ファイル内の指示を隠れたプロンプト注入と見て従わなかった」という趣旨だ。

同じ指示文をルートの `CLAUDE.md` に置くと9/9で従った。同じ文面でも階層が信頼性を変えた。

## Readツールの選択で指示書の読み込みが分かれる

サブディレクトリの `CLAUDE.md` は、2バッチ12回で7回しか適用されなかった。一般的な規約でも4/6で、気まぐれではなかった。

[Claude Codeの公式ドキュメント](https://code.claude.com/docs/en/memory) はいう。「Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories.」

「reads files」はClaudeのReadツールだった。Readでは `CLAUDE.md` が追加され、Bashではフックが発火しない。チーム規約をスキルへ切り出す[カバレッジ測定](/ja/blog/ja/modern-web-guidance-agent-skill-coverage-2026/)と同じ層だ。読まれなければスキルも空になる。

Readを強制すると 4/4、Bashを強制すると 0/4だった。

```bash
# Readツールを強制する条件
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Bash

# Bashツールを強制する条件
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

初回8回は破棄した。`--disallowedTools Bash "Print..."` と書くと、可変長引数パーサがプロンプトを吸い込み、`Permission deny rule "Print" matches no known tool` を出して空出力になった。`-p` の直後に置いて再実行した。

## 76回の試行で記録した読み込み境界

実行時間は8.8〜16.0秒。

| 条件 | ツール | カレントディレクトリ | 指示の適用結果 |
| --- | --- | --- | --- |
| ルート AGENTS.md | codex | リポジトリルート | 3/3 |
| ルート CLAUDE.md | codex | リポジトリルート | 0/3 |
| ルート CLAUDE.md + fallback設定 | codex | リポジトリルート | 3/3 |
| 中層 packages/api/AGENTS.md | codex | リポジトリルート | 0/3 |
| 中層 packages/api/AGENTS.md | codex | packages/api | 3/3 |
| ルート + 中層 AGENTS.md 同時 | codex | リポジトリルート | 3/3 (ルートのみ) |
| ルート AGENTS.md | Claude Code | リポジトリルート | 0/3 |
| ルート CLAUDE.md | Claude Code | リポジトリルート | 9/9 |
| ルート AGENTS.md + シンボリックリンク | Claude Code | リポジトリルート | 3/3 |
| 中層 packages/api/AGENTS.md | Claude Code | packages/api | 0/3 |
| 中層 packages/api/CLAUDE.md (通常) | Claude Code | リポジトリルート | 7/12 |
| 中層 packages/api/CLAUDE.md (Bash遮断) | Claude Code | リポジトリルート | 4/4 |
| 中層 packages/api/CLAUDE.md (Read遮断) | Claude Code | リポジトリルート | 0/4 |
| 指示ファイルなし (対照群) | 両ツール | リポジトリルート | 0/3, 0/3 |

## カレントディレクトリで止まるcodexの探索

[OpenAI Codexのドキュメント](https://learn.chatgpt.com/docs/agent-configuration/agents-md) は「Starting at the project root (typically the Git root), Codex walks down to your current working directory.」という。

編集対象に近い指示書が読まれると考えがちだが、codexの「近さ」はカレントディレクトリ基準だ。ルートから読むと 0/3、`packages/api` に移ると3/3。ファイルを動かさず、ディレクトリだけを変えた。

両方に置くと出力はルートだけ(3/3)、サブディレクトリは 0/3だった。ルートからはサブプロジェクトの指示書が存在しない。

## 0件の相互認識と二つの迂回路

codex 0.147.0 は `CLAUDE.md` だけで 0/3、別バッチの2回を足しても 0/5だった。Claude Code 2.1.233 は `AGENTS.md` だけで 0/3だった。

[Claude Codeのドキュメント](https://code.claude.com/docs/en/memory) は「Claude Code reads `CLAUDE.md`, not `AGENTS.md`.」と明言する。これは不具合ではなく仕様だ。指示書が成功率を変えるかという[先行の論文検証](/ja/blog/ja/agents-md-effectiveness/)とは層が違う。本稿はファイルがコンテキストに載るかだけを数える。

Claude Code側では、[公式ドキュメント](https://code.claude.com/docs/en/memory) が案内するシンボリックリンクを使う。`ln -s AGENTS.md CLAUDE.md` で3/3を確認した。

```bash
ln -s AGENTS.md CLAUDE.md
```

codex側ではフォールバックファイル名に `CLAUDE.md` を追加する。[OpenAI Codexのドキュメント](https://learn.chatgpt.com/docs/agent-configuration/agents-md) に従い、`-c project_doc_fallback_filenames=["CLAUDE.md"]` で `CLAUDE.md` だけでも3/3で通った。

```bash
codex exec -c 'project_doc_fallback_filenames=["CLAUDE.md"]' --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
```

## 手元で検証するための再現コマンド

```bash
# 隔離環境の作成
SANDBOX_DIR="$(mktemp -d "${TMPDIR:-/tmp}/agents-md-lab.XXXXXX")"
trap 'rm -rf "$SANDBOX_DIR"' EXIT
mkdir -p "$SANDBOX_DIR/repo/packages/api"
cd "$SANDBOX_DIR/repo" && git init -q .
printf 'BLUEBERRY-9182\nsecond line\n' > packages/api/note.txt

# 条件1 ルート AGENTS.md の検証
printf '# Repo rules\n\nEvery reply must end with the exact token ZZROOT7 on its own line.\n' > AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet

# 条件2 中層 AGENTS.md とカレントディレクトリの検証
rm -f AGENTS.md
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
(cd packages/api && codex exec --skip-git-repo-check -C . "Print the first line of note.txt. Nothing else.")

# 条件3 読み込みの連携設定
ln -s AGENTS.md CLAUDE.md
codex exec -c 'project_doc_fallback_filenames=["CLAUDE.md"]' --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."

# 条件4 Claude Code のツール選択による読み込み差分
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/CLAUDE.md
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Bash
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

## 今回の測定で除外した領域

2026年8月16日、Claude Code 2.1.233 と codex-cli 0.147.0 で取得した。探索処理は更新で変わる。N=3〜6で、統計でなく方向性を測る。

ClaudeはSonnet、codexはeffort maxでgpt-5.6-lunaを使い、モデル変更時の追従率は未測定だ。Cursor、Copilot、Windsurf、Gemini CLI、Amp は対象外だ。

codexの `AGENTS.override.md`、初期値32 KiBの `project_doc_max_bytes` 超過時の切り捨て、Claudeの `@AGENTS.md` は未検証だ。Claudeはシンボリックリンクのみ測った。

Git管理外の codex 走査は `--skip-git-repo-check` で回避したため未検証だ。トークン量も測っていない。

Claudeには `~/.claude/CLAUDE.md` が常に読み込まれていた。条件間では定数だが、完全隔離ではない。

数えたのは「指示書がコンテキストに入り、実行時に追従されたかどうか」までだ。コード品質や開発効率への効果は別に測る問題だ。[ルールが静かに読み飛ばされるときの認知負債](/ja/blog/ja/cognitive-debt-agentic-coding-2026/)は、ここで始まる。
