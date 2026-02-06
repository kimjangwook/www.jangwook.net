---
title: "[URGENT] OpenClaw Cron Job Fix Guide (dev channel v2026.2.4)"
description: "Emergency guide to fix OpenClaw stable/beta (2026.2.3-1) cron job execution failures and missing reminders."
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

## Overview

Users on OpenClaw stable/beta (v2026.2.3-1) have reported issues with cron jobs not running and missing reminders.

This is a critical bug in the scheduling logic. A fix is available in the dev channel (v2026.2.4). This guide explains how to update.

## Background

Key issues addressed:

*   **Cron job failures**: Jobs not triggering (#9788 `recomputeNextRuns`)
*   **Delivery regression**: Message failures (#9733)
*   **48h gap**: Unexpected delays (#10025)
*   **Gateway restart bug**: Schedule loading issues (#10045)
*   **NextRunAtMs only**: Updates without execution (#10201)

## Solution: Update to Dev Channel

Update to v2026.2.4 via the dev channel.

### Procedure

Run the following in your terminal:

#### 1. Enable pnpm

```bash
corepack enable pnpm
```

#### 2. Switch to Dev Channel

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

#### 3. Manual Build (If needed)

If the update fails:

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

#### 4. Restart Gateway (Required)

**Crucial step:**

```bash
openclaw gateway restart
```

## Conclusion

This update restores cron job stability. Immediate update is recommended.
