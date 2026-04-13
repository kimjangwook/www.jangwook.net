---
title: Claude Code 并行会话运行指南 — 使用 Git Worktree 同时处理多项任务
description: >-
  将 Git Worktree 与 Claude Code 结合，实现多功能并行开发的方法。涵盖 Plan Mode
  应用、会话隔离、无冲突并行工作模式，基于实际使用经验整理。
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/claude-code-parallel-sessions-git-worktree-hero.jpg
tags:
  - ClaudeCode
  - Git
  - 生产力
  - 教程
  - AI编程
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

同时打开多个 Claude Code 标签页感觉像是在并行工作。实际上并不是。

在同一个分支上同时运行两个 Claude Code 会话，一旦一个会话修改了文件，另一个会话的上下文就会被污染。文件状态不一致、意外的合并冲突、无法追踪哪个会话做了什么。我亲历了这些问题之后，才认真研究起 git worktree。

结论是：**git worktree + Claude Code 的组合运行起来比预想的自然得多**。配置也并不复杂。

## Git Worktree 是什么

git worktree 允许从单个 git 仓库同时将多个分支检出到不同目录。这个功能从 2016 年起就内置于 git，但知道的人出乎意料地少。

核心区别只有一点：切换分支（`git checkout`）会替换当前工作目录中的文件。使用 worktree，每个分支存在于**各自独立的物理目录**中。

```bash
# 传统方式：切换分支时文件被整体替换
git checkout feature/new-login  # 当前目录的文件全部被换掉

# worktree 方式：目录本身分离
git worktree add ../project-feature feature/new-login  # 分离到独立目录
```

这对 Claude Code 为何重要？因为**可以在每个 worktree 目录中运行独立的 Claude Code 会话**。无文件冲突，无上下文污染。

## 实际配置方法

假设项目在 `~/project/my-app`。

```bash
# 1. 确认起始状态
cd ~/project/my-app
git status  # main 分支，干净状态

# 2. 添加 worktree（分支名与目录名对应便于管理）
git worktree add ../my-app-feature feature/add-oauth
git worktree add ../my-app-bugfix fix/login-redirect

# 3. 验证
git worktree list
```

输出：

```
/Users/jangwook/project/my-app         abc1234 [main]
/Users/jangwook/project/my-app-feature def5678 [feature/add-oauth]
/Users/jangwook/project/my-app-bugfix  ghi9012 [fix/login-redirect]
```

三个目录**共享同一个 git 仓库**，各自检出不同的分支。`.git` 文件夹只在原始目录中，其余目录有一个指向它的 `.git` 文件（链接）。

## 启动并行 Claude Code 会话

为每个目录打开独立终端，启动 Claude Code。

```bash
# 终端1：主要工作
cd ~/project/my-app
claude

# 终端2：OAuth 功能开发
cd ~/project/my-app-feature
claude

# 终端3：登录 Bug 修复
cd ~/project/my-app-bugfix
claude
```

每个会话完全独立。终端 2 修改 `src/auth/oauth.ts`，终端 3 的 Claude Code 对此一无所知——因为是不同分支的文件。

如果已经熟悉 [Claude Code 最佳实践](/zh/blog/zh/claude-code-best-practices)，这个模式可以直接应用。

## 使用 Plan Mode 分配任务

有效利用并行会话需要**先制定计划再分配**。盲目地打开多个会话并不能提升效率。

我使用的模式：

**第一步：在主会话中使用 Plan Mode 制定整体计划**

在主目录的 Claude Code 会话中启用 Plan Mode（`Shift+Tab` 或 `/plan`），分析全部工作内容。

```
我：这个迭代需要添加 OAuth 登录、修复登录跳转 Bug、更新 API 文档。
    想在独立的 worktree 中并行进行这些任务，应该如何拆分？

Claude：[分析各任务的文件依赖关系，识别潜在冲突点]
```

**第二步：向每个 worktree 传递具体上下文**

基于 Plan Mode 的结果，向每个会话给出明确的指令。模糊的指令会让 Claude Code 有修改意外文件的空间。

```bash
# 在 my-app-feature 会话中
我：这是 feature/add-oauth 分支。只专注于 src/auth/ 目录，
    添加 Google OAuth 支持。其他目录不需要动。
```

**第三步：完成后在主会话中合并**

```bash
git merge feature/add-oauth
git merge fix/login-redirect
```

## 实例：三项任务同时进行

这是我最近实际使用的案例。在博客项目中：

- `main`：日常内容管理（保持已部署状态稳定）
- `feature/recommendation-v4`：改进内容推荐算法
- `fix/og-image-path`：修复 OG 图片路径 Bug

没有 worktree 的话，在开发推荐算法时遇到 OG 图片 Bug，就需要切换分支或使用 stash。有了 worktree，直接切到另一个终端窗口立刻修复。

[配置 Claude Code Hook 实现自动化审查系统](/zh/blog/zh/claude-code-hooks-workflow)后，可以设置在 worktree 切换时自动更新上下文的 Hook，让工作流更加顺畅。

## 注意事项与实际局限

### 共享资源注意事项

`package.json`、`package-lock.json` 和 `node_modules/` 在原始目录和 worktree 之间不共享。可能需要在每个 worktree 中单独运行 `npm install`——尤其是在功能分支添加了新包时。

### 数据库连接冲突

如果多个 worktree 同时启动连接到同一端口本地数据库的开发服务器，会产生端口冲突。需要在各 worktree 的 `.env.local` 中配置不同端口，或共享数据库但只从一侧执行迁移。

### 清理 worktree

工作完成后要删除 worktree，否则 `.git/worktrees/` 会悄悄膨胀。

```bash
# 分支合并后删除 worktree
git worktree remove ../my-app-feature

# 强制删除（即使有未提交的修改）
git worktree remove --force ../my-app-feature

# 清理已删除目录的引用
git worktree prune
```

### 诚实的局限性

我很喜欢这个模式，但它不是万能的。任务之间修改不同文件时效果最好；如果两个会话都需要修改同一组件，反而会产生更多合并冲突。另外，会话超过三个后，开始追踪各会话进度时就会产生额外的管理开销。

与[多智能体 PR 审查模式](/zh/blog/zh/claude-code-review-multi-agent-pr)结合，可以自动审查从各 worktree 分支产生的 PR。在团队规模的使用中，这种组合是我发现的最实用的配置。

## 命令速查

```bash
# 创建 worktree
git worktree add <路径> <分支名>
git worktree add <路径> -b <新分支名>  # 创建新分支的同时检出

# 查看列表
git worktree list

# 删除
git worktree remove <路径>
git worktree prune  # 清理已删除目录的引用
```

## 总结

说实话，最初的反应是"真的有必要这么做吗？"用过一次之后，需要并行开发的场景就自然而然地想到它了。

核心思路很简单：**独立分支 → 独立目录 → 独立 Claude Code 会话**。三者对齐，会话间互不干扰，并行推进。

建议从两个 worktree 开始，熟悉模式后再扩展到三个。如果想进一步构建系统化的多智能体模式，[Claude Code Agent Teams 指南](/zh/blog/zh/claude-agent-teams-guide)是自然的下一步。
