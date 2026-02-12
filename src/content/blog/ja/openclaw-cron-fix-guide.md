---
title: '[緊急] OpenClaw Cronジョブ未実行問題の解決ガイド (devチャネル v2026.2.4)'
description: >-
  OpenClaw stable/beta
  (2026.2.3-1)で発生しているCronジョブの未実行、リマインダー欠落などの重大な問題を解決するための緊急アップデート手順を解説します。
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/openclaw-cron-fix-guide-hero.png
tags:
  - openclaw
  - bugfix
  - cron
  - dev-channel
  - maintenance
relatedPosts:
  - slug: blog-launch-analysis-report
    score: 0.91
    reason:
      ko: '자동화, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.9
    reason:
      ko: '자동화, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.89
    reason:
      ko: '자동화, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: e2e-page-test-automation-claude-code
    score: 0.89
    reason:
      ko: '자동화, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-hooks-workflow
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、DevOps、架构主题进行连接。
---

## 概要

最近、OpenClawのstableおよびbetaチャンネル（バージョン2026.2.3-1）を使用しているユーザーから、Cronジョブが実行されない、リマインダーが届かないといった報告が多数寄せられています。

この問題は、タスクスケジューリングのコアロジックに関わる重大なバグであり、通常の運用に支障をきたす可能性があります。現在、開発チームにより修正が含まれたバージョンが`dev`チャンネルにて公開されています。

本記事では、この問題を解決するための緊急アップデート手順（v2026.2.4への更新）について解説します。

## 問題の背景

確認されている主な症状と関連するIssueは以下の通りです。

*   <strong>Cronジョブの未実行</strong>: 設定したスケジュール通りにジョブがトリガーされない (#9788 `recomputeNextRuns`)
*   <strong>配信の回帰バグ</strong>: メッセージや通知の配信が失敗する (#9733 `delivery regression`)
*   <strong>48時間のギャップ</strong>: 特定の条件下で次の実行まで48時間の空白が生じる (#10025 `48h gap`)
*   <strong>Gateway再起動のバグ</strong>: ゲートウェイ再起動時にスケジュールが正しくロードされない (#10045 `gateway restart bug`)
*   <strong>実行時刻の計算エラー</strong>: `nextRunAtMs`のみが更新され、実際の実行がスキップされる (#10201)

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

アップデート後は、必ずGatewayサービスを再起動して変更を適用してください。<strong>これを忘れると修正が反映されません。</strong>

```bash
openclaw gateway restart
```

## 結論

今回のアップデートにより、Cronジョブの安定性が回復し、リマインダーや定期実行タスクが正常に動作するようになります。もしアップデート後も問題が続く場合は、Issueトラッカーにて報告をお願いします。

安定版（Stable）への反映も順次行われる予定ですが、業務等でCron機能を重視される方は、このDev版へのアップデートを強く推奨します。
