---
title: Running Claude Code in Parallel — Git Worktree Guide for Simultaneous Tasks
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
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: 튜토리얼 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into 튜토리얼.
      ja: 튜토리얼をもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 튜토리얼 主题。
  - slug: claude-code-masterclass-series-1-prompt-to-agent
    score: 0.85
    reason:
      ko: claudecode를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on claudecode experience.
      ja: claudecodeを実際に扱った経験が続く記事です。
      zh: 延续 claudecode 的实战经验。
faq:
  - question: "Can I run multiple Claude Code sessions on the same branch?"
    answer: "Running two sessions on the same branch corrupts the other session's context the moment one of them modifies a file. You get mismatched file-state warnings, unexpected merge conflicts, and no way to track which session did what. Putting each branch in its own worktree directory removes the conflicts and contamination."
  - question: "Do worktrees share node_modules and package.json?"
    answer: "No. package.json, package-lock.json, and node_modules are not shared between the original and its worktrees. You may need to run npm install separately in each worktree, especially when a feature branch adds new packages."
  - question: "What happens if I start dev servers in several worktrees at once?"
    answer: "If multiple worktrees spin up dev servers connecting to a local database on the same port, you hit port conflicts. Configure different ports in each worktree's .env.local, or share the database while running migrations from only one worktree."
  - question: "Is the parallel worktree pattern always effective?"
    answer: "It is not universal. It works best when your tasks touch different files; if two sessions both modify the same component you end up with more merge conflicts, not fewer. Past three sessions, tracking progress adds overhead, so it is best to start with two."
---

Having multiple Claude Code tabs open feels like parallel work. It isn't.

Run two Claude Code sessions on the same branch simultaneously, and the moment one session modifies a file, the other session's context gets corrupted. Mismatched file states, unexpected merge conflicts, no way to track which session did what. I had to experience this firsthand before I took git worktree seriously.

The short version: **git worktree + Claude Code works far more naturally than you'd expect**. The setup isn't complicated either.

## What Git Worktree Actually Is

Git worktree lets you check out multiple branches simultaneously into separate directories, all from a single git repository. It's been built into git since 2016, yet it remains surprisingly underused.

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

Each session is fully independent. If Terminal 2 modifies `src/auth/oauth.ts`, Terminal 3's Claude Code doesn't know. It's a different branch's file.

If you've already gone through Claude Code Best Practices, this pattern slots in naturally.

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

Setting up Claude Code Hooks for automated review lets you attach hooks that update context automatically on worktree switches — a nice complement to this pattern.

## Gotchas and Real Limitations

### Shared Resources

`package.json`, `package-lock.json`, and `node_modules/` aren't shared between the original and worktrees. You may need to run `npm install` separately in each worktree, especially when a feature branch adds new packages.

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

Pairing this with multi-agent PR review lets you automatically review the PR from each worktree branch. For team-scale use, that combination has been the most practical setup I've found.

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

## Start With Two, Then Scale Up

Honestly, my first reaction was "is this really worth the setup?" After using it once, I reach for it naturally whenever I need to parallelize work.

The core idea is simple: **independent branch → independent directory → independent Claude Code session**. When those three align, sessions don't interfere with each other.

Start with two worktrees, get comfortable with the pattern, then expand to three. If you want to push further into structured multi-agent patterns, [the Claude Code Agent Teams guide](/en/blog/en/claude-agent-teams-guide) is the natural next step.
