---
title: "[紧急] OpenClaw Cron 任务未执行问题修复指南 (dev v2026.2.4)"
description: "OpenClaw stable/beta (2026.2.3-1) Cron 任务失败和提醒丢失问题的紧急修复指南。"
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/openclaw-cron-fix-guide-hero.png
tags: [openclaw, bugfix, cron, dev-channel, maintenance]
relatedPosts:
  - slug: openclaw-installation-tutorial
    score: 0.8
    reason:
      ko: "OpenClaw 설치 및 기본 설정에 대한 가이드입니다."
      ja: "OpenClawのインストールと基本設定に関するガイドです。"
      en: "Guide on OpenClaw installation and basic setup."
      zh: "OpenClaw 安装和基本设置指南。"
  - slug: openclaw-advanced-usage
    score: 0.7
    reason:
      ko: "OpenClaw의 고급 기능 활용법입니다."
      ja: "OpenClawの高度な機能活用法です。"
      en: "Advanced usage of OpenClaw features."
      zh: "OpenClaw 高级功能使用指南。"
---

## 概述

OpenClaw stable/beta (v2026.2.3-1) 用户报告了 Cron 任务未执行和提醒丢失的问题。

这是调度逻辑中的一个严重错误。Dev 频道 (v2026.2.4) 已发布修复程序。本指南将指导您完成更新。

## 背景

解决的主要问题：

*   **Cron 任务失败**: 任务未触发 (#9788 `recomputeNextRuns`)
*   **交付回退**: 消息发送失败 (#9733)
*   **48小时空白**: 意外延迟 (#10025)
*   **网关重启 Bug**: 调度加载问题 (#10045)
*   **仅更新 NextRunAtMs**: 无执行 (#10201)

## 解决方案：更新至 Dev 频道

更新到 Dev 频道的 v2026.2.4 版本。

### 步骤指南

在终端中执行以下操作：

#### 1. 启用 pnpm

```bash
corepack enable pnpm
```

#### 2. 切换到 Dev 频道

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

#### 3. 手动构建（如果需要）

如果更新失败：

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

#### 4. 重启网关（必须）

**关键步骤：**

```bash
openclaw gateway restart
```

## 结论

此次更新恢复了 Cron 任务的稳定性。建议立即更新。
