---
title: "[긴급] OpenClaw 크론잡 미실행 문제 해결 가이드 (dev 채널 v2026.2.4 업데이트)"
description: "OpenClaw stable/beta (2026.2.3-1)에서 발생하는 크론잡 미실행 및 리마인더 누락 문제를 해결하기 위한 긴급 업데이트 가이드입니다."
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

## 개요

최근 OpenClaw stable 및 beta 채널(v2026.2.3-1)에서 크론잡이 실행되지 않거나 리마인더가 누락되는 이슈가 다수 발생하고 있습니다.

이 문제는 작업 스케줄링의 핵심 로직과 관련된 버그로, 현재 dev 채널에 수정 사항이 포함된 v2026.2.4 버전이 배포되었습니다. 본 포스트에서는 해당 문제를 해결하기 위한 업데이트 절차를 안내합니다.

## 배경 및 원인

다음과 같은 이슈들이 보고되었으며, 이번 업데이트로 해결됩니다:

*   **크론잡 미실행**: 예정된 시간에 작업이 트리거되지 않음 (#9788 `recomputeNextRuns`)
*   **배송 회귀(Delivery Regression)**: 메시지 전송 실패 (#9733)
*   **48시간 공백(48h gap)**: 특정 조건에서 다음 실행 시간이 비정상적으로 지연됨 (#10025)
*   **게이트웨이 재시작 버그**: 재시작 시 스케줄 로드 실패 (#10045)
*   **NextRunAtMs 갱신 오류**: 실행 없이 시간만 갱신되는 현상 (#10201)

## 해결 방법: Dev 채널 업데이트

dev 채널의 소스 빌드(v2026.2.4)로 업데이트하여 문제를 해결할 수 있습니다.

### 절차 가이드

터미널에서 다음 단계를 수행하세요.

#### 1. pnpm 활성화

```bash
corepack enable pnpm
```

#### 2. Dev 채널 전환 및 업데이트

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

#### 3. 수동 빌드 (필요 시)

자동 업데이트 실패 시 수동으로 수행합니다.

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

#### 4. 게이트웨이 재시작 (필수)

변경 사항 적용을 위해 반드시 수행해야 합니다.

```bash
openclaw gateway restart
```

## 결론

위 절차를 통해 크론잡 실행 문제를 해결할 수 있습니다. 안정적인 서비스 운영을 위해 즉시 업데이트를 권장합니다.
