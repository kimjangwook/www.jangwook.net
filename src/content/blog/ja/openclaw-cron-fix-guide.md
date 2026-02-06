---
title: "[緊急] OpenClaw Cronジョブ未実行問題の解決ガイド (devチャネル v2026.2.4)"
description: "OpenClaw stable/beta (2026.2.3-1)で発生しているCronジョブの未実行、リマインダー欠落などの重大な問題を解決するための緊急アップデート手順を解説します。"
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

## 概要

最近、OpenClawのstableおよびbetaチャンネル（バージョン2026.2.3-1）を使用しているユーザーから、Cronジョブが実行されない、リマインダーが届かないといった報告が多数寄せられています。

この問題は、タスクスケジューリングのコアロジックに関わる重大なバグであり、通常の運用に支障をきたす可能性があります。現在、開発チームにより修正が含まれたバージョンが`dev`チャンネルにて公開されています。

本記事では、この問題を解決するための緊急アップデート手順（v2026.2.4への更新）について解説します。

## 問題の背景

確認されている主な症状と関連するIssueは以下の通りです。

*   **Cronジョブの未実行**: 設定したスケジュール通りにジョブがトリガーされない (#9788 `recomputeNextRuns`)
*   **配信の回帰バグ**: メッセージや通知の配信が失敗する (#9733 `delivery regression`)
*   **48時間のギャップ**: 特定の条件下で次の実行まで48時間の空白が生じる (#10025 `48h gap`)
*   **Gateway再起動のバグ**: ゲートウェイ再起動時にスケジュールが正しくロードされない (#10045 `gateway restart bug`)
*   **実行時刻の計算エラー**: `nextRunAtMs`のみが更新され、実際の実行がスキップされる (#10201)

これらの問題に対処するため、コアロジックの修正が行われました。

## 解決策：Devチャンネルへのアップデート

現在、修正版は`dev`チャンネルのソースビルド（v2026.2.4）として提供されています。以下の手順に従ってアップデートを行ってください。

### 手順ガイド

作業はターミナルで行います。

#### 1. pnpmの有効化

OpenClawのビルドには`pnpm`が推奨されています。まだ有効化していない場合は、以下のコマンドを実行します。

```bash
corepack enable pnpm
```

#### 2. Devチャンネルへの切り替えとアップデート

ソースコードのディレクトリを指定し、`dev`チャンネルへ切り替えてアップデートを実行します。

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

#### 3. 手動ビルド（自動アップデートが失敗する場合）

もし上記コマンドでエラーが発生する場合は、手動で依存関係のインストールとビルドを行います。

```bash
cd ~/openclaw
pnpm install
pnpm build
npm install -g .
```

#### 4. Gatewayの再起動（重要）

アップデート後は、必ずGatewayサービスを再起動して変更を適用してください。**これを忘れると修正が反映されません。**

```bash
openclaw gateway restart
```

## 結論

今回のアップデートにより、Cronジョブの安定性が回復し、リマインダーや定期実行タスクが正常に動作するようになります。もしアップデート後も問題が続く場合は、Issueトラッカーにて報告をお願いします。

安定版（Stable）への反映も順次行われる予定ですが、業務等でCron機能を重視される方は、このDev版へのアップデートを強く推奨します。
