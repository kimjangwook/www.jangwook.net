---
title: "AGENTS.md vs CLAUDE.md loading across 76 runs"
description: "AGENTS.md in a monorepo failed to load where expected. These 76 runs measure the directory walk and fixes."
pubDate: '2026-08-16'
tags:
  - ai
  - coding-agent
  - agents-md
  - claude-code
  - developer-tools
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.88
    reason:
      ko: "저 글은 지시문이 성공률과 비용에 미치는 효과를 실증 논문으로 다뤘고, 이 글은 그 지시문 파일이 각 CLI에 실제로 로드되는 경로를 실측했다."
      ja: "あちらは指示ファイルが成功率とコストに与える効果を実証論文から扱い、本稿はそのファイルが各CLIに実際にロードされる経路を実測した。"
      en: "That post examines whether instructions improve task success and cost from an empirical paper; this post measures whether the instruction files actually get loaded by each CLI in practice."
      zh: "那篇从实证论文探讨指令文件对成功率与成本的影响，本文则实测各 CLI 实际上如何加载这些指令文件。"
  - slug: modern-web-guidance-agent-skill-coverage-2026
    score: 0.72
    reason:
      ko: "에이전트에게 팀 규칙을 주입하는 스킬과 문서의 범위를 비교할 때 함께 읽기 좋다."
      ja: "エージェントにチーム規約を注入するスキルと文書の適用範囲を比較する際に合わせて読みたい。"
      en: "A good companion when evaluating how agent skills and instruction files differ in delivering team conventions."
      zh: "评估通过技能与文档向 Agent 传递团队规范时的覆盖范围时适合对照阅读。"
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.65
    reason:
      ko: "에이전트가 규칙을 무시하거나 잘못 로드할 때 팀에 쌓이는 인지 부채를 연결해서 볼 수 있다."
      ja: "エージェントが規約を無視または誤로드했을 때 팀에 쌓이는 인지 부채를 연결해서 볼 수 있다."
      en: "Connects the silent failure of agent instructions to the cognitive debt accumulated across an engineering team."
      zh: "将 Agent 忽略或未加载规则时的隐性故障与团队累积的认知负债联系起来。"
---

An empty repository, a root `AGENTS.md`, and one line in `packages/api/note.txt`. If you maintain Codex and Claude Code instructions in a monorepo, half may not load where you think. Across 76 runs on 2026-08-16, I measured how both CLIs walk the filesystem and why they drop nested rules. I tested two fixes.

`AGENTS.md` told the agent to append `ZZROOT7` to every reply. From the repository root, I asked both tools to print the first line and nothing else. `codex exec` returned `BLUEBERRY-9182` followed by `ZZROOT7` in 12.1 seconds. `claude -p` returned `BLUEBERRY-9182` and stopped in 10.1 seconds without loading `AGENTS.md`.

## Neither CLI reads the other file by default

On 2026-08-16, I ran both tools using `codex-cli` 0.147.0 and `claude` 2.1.233. Runs read `packages/api/note.txt` from a clean git repository and took 8.8 to 16.0 seconds across 36 runs.

| Tool | Instruction file present | Target canary token | Success rate |
| --- | --- | --- | --- |
| Codex | Root `AGENTS.md` | `ZZROOT7` | 3/3 |
| Codex | Root `CLAUDE.md` | `ZZROOT7` | 0/3 |
| Claude Code | Root `CLAUDE.md` | `ZZROOT7` | 9/9 |
| Claude Code | Root `AGENTS.md` | `ZZROOT7` | 0/3 |
| Both (Control) | None | Canary absent | 0/3 and 0/3 |

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`."

## Codex stops walking at your current working directory

I placed `packages/api/AGENTS.md` with canary `ZZNEST7` and ran `codex exec` from the repository root. Codex returned 0 out of 3.

Then I ran `cd packages/api` and used the same command against `note.txt`. Codex returned `ZZNEST7` on 3 out of 3 runs. The file never moved. Only my shell changed.

With `ZZROOT7` at root and `ZZNEST7` in `packages/api`, root runs produced `ZZROOT7` in 3 out of 3 and `ZZNEST7` in 0 out of 3 runs.

> "Starting at the project root (typically the Git root), Codex walks down to your current working directory."

> "In each directory along the path, it checks for `AGENTS.override.md`, then `AGENTS.md`, then any fallback names in `project_doc_fallback_filenames`."

## Claude Code nested loading depends on tool choice

> "Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories."

With `packages/api/CLAUDE.md` and canary `ZZNEST7`, the token appeared in 7 out of 12 root runs (3 out of 6 and 4 out of 6). Regular guidelines still yielded 4 out of 6 runs.

The variation came from tool selection. Claude used `Read` or `Bash` with `sed` or `cat` to inspect the file.

```bash
# Force the Read tool by disallowing Bash
claude -p "Print the first line of packages/api/note.txt. Nothing else." \
  --permission-mode bypassPermissions --model sonnet --disallowedTools Bash

# Force Bash by disallowing the Read tool
claude -p "Print the first line of packages/api/note.txt. Nothing else." \
  --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

Disallowing Bash gave `Read` compliance of 4 out of 4. Disallowing `Read` gave `Bash` compliance of 0 out of 4.

Claude Code attaches subdirectory instructions to file-reading calls. Shell commands bypass the hook and keep them out of context.

In my local execution log from one failed nested run, Claude explained the refusal. The user had specified "Nothing else", and the instruction inside `packages/api/CLAUDE.md` looked like hidden prompt injection. At the root, Claude obeyed the same sentence in 9 out of 9 runs. A nested rule carried less trust.

## Two one-line fixes bring both tools to one file

For Claude Code, Anthropic recommends a root symbolic link from `CLAUDE.md` to `AGENTS.md` at `https://code.claude.com/docs/en/memory`.

A symlink also works without Claude-specific content.

```bash
ln -s AGENTS.md CLAUDE.md
```

The symlink made Claude Code follow `AGENTS.md` in 3 out of 3 runs.

For Codex, configure fallback filenames or pass them on the command line.

```bash
codex exec -c 'project_doc_fallback_filenames=["CLAUDE.md"]' \
  --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
```

With this fallback, Codex loaded `CLAUDE.md` and followed the instructions in 3 out of 3.

## Commands to reproduce all 76 runs

```bash
# Setup sandbox
SANDBOX_DIR="$(mktemp -d "${TMPDIR:-/tmp}/agents-md-lab.XXXXXX")"
trap 'rm -rf "$SANDBOX_DIR"' EXIT
mkdir -p "$SANDBOX_DIR/repo/packages/api"
cd "$SANDBOX_DIR/repo" && git init -q .
printf 'BLUEBERRY-9182\nsecond line\n' > packages/api/note.txt

# 1. Root AGENTS.md test
printf '# Repo rules\n\nEvery reply must end with the exact token ZZROOT7 on its own line.\n' > AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet

# 2. Nested directory walk test
rm -f AGENTS.md
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
(cd packages/api && codex exec --skip-git-repo-check -C . "Print the first line of note.txt. Nothing else.")

# 3. Tool restriction tests for Claude Code
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/CLAUDE.md
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Bash
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

Eight initial runs were discarded because `--disallowedTools Bash "Prompt"` made the variadic parser swallow the prompt and produce `Permission deny rule "Print" matches no known tool`. Putting the prompt after `-p` fixed it.

## Limits of this benchmark

This snapshot used `claude` 2.1.233 and `codex-cli` 0.147.0 on 2026-08-16. File discovery can change between releases.

Sample sizes were 3 to 6 runs per cell across 76 valid runs out of 84 attempts. The 0 out of 3 and 3 out of 3 results show direction. The 7 out of 12 result is an observed sample, not a fixed probability.

Canary tokens test whether a file is loaded into the prompt context and obeyed, not whether an agent writes better code or follows code architecture.

All Claude runs included my global user-level instruction file at `~/.claude/CLAUDE.md` in every test condition.

I did not measure `AGENTS.override.md`, behavior beyond the 32 KiB `project_doc_max_bytes` limit, gitless directories without `--skip-git-repo-check`, token cost, or third-party tools such as Cursor, Windsurf, Copilot, or Gemini CLI.
