---
title: 'Running Claude Code in Parallel — Git Worktree Guide for Simultaneous Tasks'
description: >-
  How to combine Git Worktree with Claude Code to develop multiple features
  simultaneously. Covers Plan Mode, session isolation, and conflict-free
  parallel workflows based on hands-on experience.
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/claude-code-parallel-sessions-git-worktree-hero.jpg
tags:
  - ClaudeCode
  - Git
  - Productivity
  - Tutorial
  - AICoding
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: 'Claude Code를 여러 worktree에서 동시에 실행할 때, 각 세션에 다른 MCP 도구 조합을 연결하면 더 특화된 병렬 작업이 가능합니다. MCP 서버 생태계를 파악해두면 세션별 도구 설정이 수월해집니다.'
      ja: 複数のworktreeでClaude Codeを同時実行する際、各セッションに異なるMCPツールの組み合わせを接続すると、より特化した並列作業が可能になります。MCPサーバーのエコシステムを把握しておくと、セッションごとのツール設定が楽になります。
      en: 'When running Claude Code across multiple worktrees simultaneously, connecting different MCP tool combinations to each session enables more specialized parallel work. Knowing the MCP server ecosystem makes per-session tool configuration much easier.'
      zh: 在多个worktree中同时运行Claude Code时，为每个会话连接不同的MCP工具组合可以实现更专业的并行工作。了解MCP服务器生态系统有助于简化各会话的工具配置。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: 'OpenClaw는 Claude Code의 원격·자동화 레이어인데, worktree 병렬 세션과 결합하면 여러 브랜치를 원격에서 동시에 자율 실행하는 패턴으로 자연스럽게 이어집니다.'
      ja: OpenClawはClaude Codeのリモート・自動化レイヤーであり、worktreeの並列セッションと組み合わせると、複数のブランチをリモートで同時に自律実行するパターンへと自然に発展します。
      en: 'OpenClaw is the remote and automation layer for Claude Code. Combined with worktree parallel sessions, it naturally extends into a pattern where multiple branches run autonomously from a remote environment simultaneously.'
      zh: OpenClaw是Claude Code的远程自动化层，与worktree并行会话结合，自然延伸为在远程环境中同时自主运行多个分支的模式。
  - slug: github-agentic-workflows-cicd-ai
    score: 0.93
    reason:
      ko: '각 worktree 브랜치를 GitHub Actions CI/CD와 연결하면 병렬 개발 → 자동 테스트 → 자동 머지까지 완전 자동화 흐름이 완성됩니다. 이 글이 그 마지막 퍼즐 조각입니다.'
      ja: 各worktreeブランチをGitHub Actions CI/CDと連携すると、並列開発→自動テスト→自動マージまでの完全自動化フローが完成します。この記事がその最後のパズルのピースです。
      en: 'Connecting each worktree branch to GitHub Actions CI/CD completes a fully automated flow: parallel development → automated testing → automated merge. This post is the final puzzle piece.'
      zh: 将每个worktree分支与GitHub Actions CI/CD连接，完成并行开发→自动测试→自动合并的完整自动化流程。这篇文章是最后一块拼图。
  - slug: stripe-minions-autonomous-coding-agents-1300-prs
    score: 0.93
    reason:
      ko: 'Stripe가 1,300개 PR을 자율 에이전트로 처리한 것은 결국 worktree 기반 병렬 세션의 대규모 버전입니다. 내 워크플로우를 그 방향으로 확장할 때 좋은 참고가 됩니다.'
      ja: Stripeが1,300のPRを自律エージェントで処理したのは、結局worktreeベースの並列セッションの大規模バージョンです。自分のワークフローをその方向に拡張するときの良い参考になります。
      en: "Stripe's approach of handling 1,300 PRs with autonomous agents is essentially the large-scale version of worktree-based parallel sessions. A great reference when scaling your own workflow in that direction."
      zh: Stripe用自主智能体处理1300个PR，本质上是基于worktree并行会话的大规模版本。这是将个人工作流向该方向扩展的好参考。
  - slug: claude-code-cli-migration-guide
    score: 0.92
    reason:
      ko: 'worktree 패턴을 쓰다 보면 Claude Code CLI를 스크립트로 직접 호출하고 싶어집니다. 이 마이그레이션 가이드가 CLI 직접 활용의 출발점이 됩니다.'
      ja: worktreeパターンを使っていると、Claude Code CLIをスクリプトから直接呼び出したくなります。このマイグレーションガイドがCLI直接活用の出発点になります。
      en: 'Once you get comfortable with the worktree pattern, you start wanting to call Claude Code CLI directly from scripts. This migration guide is the starting point for that direct CLI usage.'
      zh: 熟悉worktree模式后，你会想直接从脚本中调用Claude Code CLI。这个迁移指南是直接使用CLI的起点。
---

Having multiple Claude Code tabs open feels like parallel work. It isn't.

Run two Claude Code sessions on the same branch simultaneously, and the moment one session modifies a file, the other session's context gets corrupted. Mismatched file states, unexpected merge conflicts, no way to track which session did what. I had to experience this firsthand before I took git worktree seriously.

The short version: **git worktree + Claude Code works far more naturally than you'd expect**. The setup isn't complicated either.

## What Git Worktree Actually Is

Git worktree lets you check out multiple branches simultaneously into separate directories — all from a single git repository. It's been built into git since 2016, yet it remains surprisingly underused.

One key distinction: switching branches (`git checkout`) replaces the files in your working directory. With worktrees, each branch lives in its **own separate physical directory**.

```bash
# Old way: switching branches replaces files
git checkout feature/new-login  # your entire working dir gets swapped out

# Worktree way: directories are physically separate
git worktree add ../project-feature feature/new-login  # separate directory
```

Why does this matter for Claude Code? Because **you can run an independent Claude Code session in each worktree directory**. No file conflicts. No context contamination.

## Setting It Up

Assume your project lives at `~/project/my-app`.

```bash
# 1. Confirm your starting point
cd ~/project/my-app
git status  # main branch, clean state

# 2. Add worktrees (matching branch names to directory names helps)
git worktree add ../my-app-feature feature/add-oauth
git worktree add ../my-app-bugfix fix/login-redirect

# 3. Verify
git worktree list
```

Output:

```
/Users/jangwook/project/my-app         abc1234 [main]
/Users/jangwook/project/my-app-feature def5678 [feature/add-oauth]
/Users/jangwook/project/my-app-bugfix  ghi9012 [fix/login-redirect]
```

Three directories, **one shared git repository**, each checking out a different branch. The `.git` folder lives in the original; the others have a `.git` file that points to it.

## Launching Parallel Claude Code Sessions

Open a separate terminal for each directory and start Claude Code.

```bash
# Terminal 1: main work
cd ~/project/my-app
claude

# Terminal 2: OAuth feature development
cd ~/project/my-app-feature
claude

# Terminal 3: login bug fix
cd ~/project/my-app-bugfix
claude
```

Each session is fully independent. If Terminal 2 modifies `src/auth/oauth.ts`, Terminal 3's Claude Code doesn't know — it's a different branch's file.

If you've already gone through [Claude Code Best Practices](/en/blog/en/claude-code-best-practices), this pattern slots in naturally.

## Using Plan Mode for Task Distribution

Effective parallel sessions require **planning first, then distributing**. Opening multiple sessions without a plan doesn't buy you much.

Here's the pattern I use:

**Step 1: Use Plan Mode in the main session to map the work**

In the main directory's Claude Code session, enable Plan Mode (`Shift+Tab` or `/plan`) and analyze the full scope of work.

```
Me: This sprint I need to add OAuth login, fix the login redirect bug,
    and update the API docs. I want to run these in separate worktrees
    in parallel. How should I split them up?

Claude: [analyzes file dependencies across tasks, identifies potential conflict points]
```

**Step 2: Give each worktree specific, bounded context**

Based on the Plan Mode output, give each session clear, scoped instructions. Vague instructions give Claude Code room to touch files you didn't intend.

```bash
# In the my-app-feature session
Me: This is the feature/add-oauth branch. Focus only on src/auth/
    and add Google OAuth support. You don't need to touch anything else.
```

**Step 3: Merge in the main session when done**

```bash
git merge feature/add-oauth
git merge fix/login-redirect
```

## Real Example: Three Concurrent Tasks

Here's a case I actually ran recently. In a blog project:

- `main`: day-to-day content management (keeping the deployed state stable)
- `feature/recommendation-v4`: improving the content recommendation algorithm
- `fix/og-image-path`: fixing an OG image path bug

Without worktrees, hitting the OG image bug mid-feature-development would have meant either switching branches or stashing. With worktrees, I just moved to the other terminal and fixed it immediately.

[Setting up Claude Code Hooks for automated review](/en/blog/en/claude-code-hooks-workflow) lets you attach hooks that update context automatically on worktree switches — a nice complement to this pattern.

## Gotchas and Real Limitations

### Shared Resources

`package.json`, `package-lock.json`, and `node_modules/` aren't shared between the original and worktrees. You may need to run `npm install` separately in each worktree — especially when a feature branch adds new packages.

### Database Port Conflicts

If multiple worktrees try to spin up dev servers that connect to a local database on the same port, you'll hit conflicts. Either configure different ports in each worktree's `.env.local`, or share the database while running migrations from only one worktree.

### Cleanup

Delete worktrees when you're done, or `.git/worktrees/` grows quietly in the background.

```bash
# After merging the branch
git worktree remove ../my-app-feature

# Force remove (even with uncommitted changes)
git worktree remove --force ../my-app-feature

# Clean up stale references
git worktree prune
```

### Honest Assessment

I like this pattern, but it's not universal. It works best when your tasks touch different files. If two sessions both need to modify the same component, you'll end up with more merge conflicts, not fewer. And once you're managing more than three sessions, tracking what each one has done starts generating its own overhead.

Pairing this with [multi-agent PR review](/en/blog/en/claude-code-review-multi-agent-pr) lets you automatically review the PR from each worktree branch. For team-scale use, that combination has been the most practical setup I've found.

## Quick Reference

```bash
# Create a worktree
git worktree add <path> <branch>
git worktree add <path> -b <new-branch>  # create branch and check it out

# List all worktrees
git worktree list

# Remove a worktree
git worktree remove <path>
git worktree prune  # clean up references to already-deleted directories
```

## Wrapping Up

Honestly, my first reaction was "is this really worth the setup?" After using it once, I reach for it naturally whenever I need to parallelize work.

The core idea is simple: **independent branch → independent directory → independent Claude Code session**. When those three align, sessions don't interfere with each other.

Start with two worktrees, get comfortable with the pattern, then expand to three. If you want to push further into structured multi-agent patterns, [the Claude Code Agent Teams guide](/en/blog/en/claude-agent-teams-guide) is the natural next step.
