---
title: Anthropic Agent Skills標準：AIエージェント能力拡張の新しいオープン標準
description: AnthropicのAgent Skills標準は、AIエージェントが新しい機能を取得し活用する方法を提示し、産業全体のAI開発を促進します。
pubDate: "2025-12-25"
heroImage: ../../../assets/blog/anthropic-agent-skills-standard-hero.png
tags:
  - AI
  - Agent
  - Anthropic
  - Standard
  - Agent-Skills
lang: ja
alternates:
  en: /en/blog/en/anthropic-agent-skills-standard
  ko: /ko/blog/ko/anthropic-agent-skills-standard
  zh: /zh/blog/zh/anthropic-agent-skills-standard
relatedPosts:
  - slug: enterprise-ai-adoption-topdown
    score: 0.95
    reason:
      ko: "자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다."
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: "자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다."
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: slack-mcp-team-communication
    score: 0.95
    reason:
      ko: "자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다."
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: "자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다."
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-gemini-file-search-rag-tutorial
    score: 0.94
    reason:
      ko: "자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다."
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## 概要

2025年12月18日、AnthropicはAIエージェントの能力を革新的に拡張するための**Agent Skills標準**を公式に発表しました。このオープン標準は、AIエージェントが新しい機能を取得し活用するための普遍的な方法を提示し、AnthropicがModel Context Protocol (MCP)を通じて示したように、AI産業の中核インフラを構築する戦略の一環です。関連するすべての仕様とSDKは`agentskills.io`で公開されています。

この標準は、エージェントが特定のツールと相互作用し、複雑なタスクを自律的に実行し、反復的なワークフローを理解するために必要なモジュール型の能力を定義します。これにより、AIエージェントの利用価値を高め、開発を加速することが期待されます。

## 主要な内容

### 1. Agent Skills標準とは？

Anthropic Agent Skills標準は、AIエージェントが必要に応じて動的に発見しロードできるモジュール型の「スキル」の集合を定義します。各スキルは、自身の指示、スクリプト、リソース、および中核となる`SKILL.md`ファイルを含むディレクトリ構造で構成されます。`SKILL.md`ファイルはYAMLとMarkdownを組み合わせて、スキルの名前、ステップバイステップの指示、および使用例を明確に説明します。

### 2. 主要な特徴と利点

- **オープン標準**: この標準は、特定のプラットフォームに依存しないオープンな仕様として設計されており、すべてのAIプラットフォームが自由に採用し統合できます。これにより、AIエージェントエコシステムの相互運用性が大幅に向上します。
- **広範な産業での採用**: 既にMicrosoft、OpenAI、Atlassian、Figma、Cursor、GitHubなどの主要なテクノロジー企業がこの標準を導入しています。また、Canva、Stripe、Notion、Zapierなどのパートナー企業は、この標準に基づいて事前に構築された多様なスキルを開発し、エージェントの活用範囲を広げています。
- **強力な機能性**: スキルは、AIエージェントが専門的なタスクを実行し、反復可能なワークフローを理解し、さらには新しいソフトウェアとも効果的に相互作用することをサポートします。スキルは共有しやすく、実装が簡単で、強力かつ様々な環境で移植可能です。
- **インテリジェントなコンテキスト管理 (Progressive Disclosure)**: この標準は、LLMの限られたコンテキストウィンドウの問題を解決するために、「プログレッシブ・ディスクロージャー (Progressive Disclosure)」という革新的なアプローチを採用しています。エージェントはまず、インストールされているすべてのスキルのメタデータを事前にロードし、ユーザーの現在のリクエストが特定のスキルのドメインと一致すると判断された場合にのみ、そのスキルの完全な`SKILL.md`ファイルをロードします。これにより、必要な情報のみを効率的に使用し、コンテキストウィンドウの制約を最小限に抑えます。

### 3. 企業向け機能

Anthropicは、ClaudeのTeamおよびEnterpriseプランを利用する企業顧客向けに、組織全体でスキルを管理できる一元的な機能を提供しています。これにより、企業はAIエージェントの能力を効率的に展開し制御し、特定のビジネス要件に合わせてカスタマイズすることができます。

### 4. 背景と重要性

Agent Skills標準は、2025年10月に開発者向け機能として初めて導入され、その2ヶ月後の12月にオープン標準へと移行しました。これは、AIエージェント技術が特定の開発者コミュニティを超え、広範な産業標準として確立されつつあることを示しています。この標準は、AIエージェントがツールと相互作用し、複雑なタスクを自律的に実行するための標準化された方法を提供することで、エージェントAIの発展と普及を加速させる重要なマイルストーンとなるでしょう。

## 活用方法

### 1. 開発者向けAgent Skills SDK

開発者は`agentskills.io`で提供されるAgent Skills SDKを活用して、カスタムスキルを開発できます。`SKILL.md`ファイルは、YAMLベースのメタデータとMarkdownベースの詳細な指示を組み合わせて記述され、エージェントがスキルの目的と使用方法を容易に理解できるようにします。これにより、エージェントが新しいツールやサービスに簡単に連携できる道が開かれます。

### 2. 企業におけるAgent Skillsの活用

企業はAgent Skills標準に基づいてAIエージェントの能力を一元的に管理し、展開することでワークフローを自動化できます。さまざまな社内システムや外部サービスをAgent Skillsとしてカプセル化することにより、AIエージェントは顧客サービス、データ分析、コンテンツ生成など、幅広いビジネス領域でより強力かつ柔軟に活用できます。

## 結論

AnthropicのAgent Skills標準は、AIエージェント技術の成熟度を一段と高める重要な進歩です。このオープン標準は、AIエージェントエコシステムの相互運用性を促進し、開発者がより強力でインテリジェントなエージェントを構築するための基盤を提供します。これは、将来のAIエージェント開発の方向性を示し、AIが私たちの日常生活やビジネスにさらに深く統合される上で、中心的役割を果たすでしょう。

## 参考文献

- [thenewstack.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEpmFz_yAN-W2nzkMD3W4Zx4ICcqrJ8zs1qBK5JTYYR2ZLKzuGTt-qnd7tKpXNX_1blK0wnGH4FDqxiesuQy9ZgIkvfuaJgMSmiNX-rtdycCy0TrXdfTcpgN0UdYjgtLwYkntq1raSYc1vgCWqjmZDPfuURK5B5vdJ9meN_yszzJjZWx-UDmPHFxS4=)
- [techradar.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHiMxTlhYQwwdk4qJGwjIG4oSsi7x7UqqzqlWHLlNxP9WlvvPUHyXI2EeY9b9QtsRGZ-GeccqpkgI09IajOMXVSapgQbfwd9j3x7q10_XSdk9G15QU4YHfGZcdtIG9w7L6m4khTOiyZoN3ZQ8eZQig7k6zI-Q9eHR8v712TNdqAQ_tgxHqCk00pVZRVJSbE6fveW5P6q4HkPGyXjUwf-dzSCe-1Oy32CWB3WwUe8CyOWhKntLifuA==)
- [anthropic.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFbd-NYwEyU1bJnaHx4k64rq54251vzGiCr9QEfvdhoxULY8E4JtmquJYTB-DRAWpXrv-3wFzDJcUjJTpLbkN0MSUDlg1l2Iw2zT9d09aBwU-MOcyqt1rRUV5CS2E_hatArLFvyqgzXOvGHLgKLZk8klIm6hZakt8yehX-Ld8fOYUw4cfjahIu_HcLeZLr5Yy-BT6ZM=)
- [skillsmp.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHf2iiMfYZIzS-6l-cDPofoU5a17PQlAuTu2WFWrQuMlS7IHJuoiodKCfPLsrPvAEjpMYV_xyEvB-A329JJuiPgtsmZGBnO3KJgCE-1P97a2w==)
