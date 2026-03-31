---
title: LiteLLMサプライチェーン攻撃 — AIインフラ依存関係のセキュリティ死角
description: >-
  PyPIで発生したLiteLLMサプライチェーン攻撃を分析し、AIツールチェーンにおける依存関係管理とサプライチェーンセキュリティを強化するための実践的な方法を整理します。
pubDate: '2026-03-31'
heroImage: ../../../assets/blog/litellm-supply-chain-attack-ai-dependency-security-hero.jpg
tags:
  - security
  - supply-chain
  - python
  - ai-infrastructure
relatedPosts:
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.94
    reason:
      ko: 'AI 코딩 도구의 설정 파일과 시크릿 유출 위험을 다뤘다면, 이 글에서 다룬 패키지 레벨 공급망 공격도 같은 맥락의 위협입니다.'
      ja: 'AIコーディングツールの設定ファイルやシークレット漏洩リスクに関心があれば、パッケージレベルのサプライチェーン攻撃も同じ文脈の脅威です。'
      en: 'If you explored config file and secret sprawl risks in AI coding tools, package-level supply chain attacks are threats in the same vein.'
      zh: '如果你了解了AI编码工具中配置文件和密钥泄露的风险，包级别的供应链攻击也是同一类型的威胁。'
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.93
    reason:
      ko: 'promptfoo를 활용한 AI 에이전트 보안 테스트를 다뤘는데, 이번 글의 CI/CD 보안 강화 방법과 함께 적용하면 더 견고한 DevSecOps 파이프라인을 구축할 수 있습니다.'
      ja: 'promptfooを活用したAIエージェントのセキュリティテストと、この記事のCI/CDセキュリティ強化を組み合わせれば、より堅固なDevSecOpsパイプラインを構築できます。'
      en: 'Combining the AI agent security testing with promptfoo and the CI/CD hardening methods in this post gives you a more robust DevSecOps pipeline.'
      zh: '将promptfoo的AI代理安全测试与本文的CI/CD安全强化方法结合，可以构建更坚固的DevSecOps管道。'
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.92
    reason:
      ko: 'RoguePilot은 AI 코딩 도구의 프롬프트 인젝션 취약점을 다뤘고, 이번 글은 패키지 의존성 공격을 다룹니다. AI 개발 도구의 두 가지 다른 공격 벡터를 비교해볼 수 있습니다.'
      ja: 'RoguePilotはAIコーディングツールのプロンプトインジェクション脆弱性、この記事はパッケージ依存関係攻撃を扱います。AI開発ツールの2つの異なる攻撃ベクターを比較できます。'
      en: 'RoguePilot covered prompt injection in AI coding tools while this post covers package dependency attacks — two different attack vectors targeting AI dev tools.'
      zh: 'RoguePilot讨论了AI编码工具的提示注入漏洞，本文讨论包依赖攻击。可以比较针对AI开发工具的两种不同攻击向量。'
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.91
    reason:
      ko: 'MCP 서버에서 발견된 30개 CVE와 엔터프라이즈 보안 강화를 다뤘는데, AI 인프라의 다른 레이어에서 발생하는 보안 위협의 패턴을 함께 이해할 수 있습니다.'
      ja: 'MCPサーバーで発見された30件のCVEとエンタープライズセキュリティ強化を扱っており、AIインフラの異なるレイヤーで発生するセキュリティ脅威のパターンを理解できます。'
      en: 'Covers 30 CVEs found in MCP servers and enterprise hardening — helps you understand security threat patterns across different layers of AI infrastructure.'
      zh: '涵盖了MCP服务器中发现的30个CVE和企业安全加固，帮助理解AI基础设施不同层面的安全威胁模式。'
  - slug: nist-ai-agent-security-standards
    score: 0.90
    reason:
      ko: 'NIST의 AI 에이전트 보안 표준을 다룬 글로, 이번 공급망 공격 사례가 왜 표준 수준의 보안 프레임워크가 필요한지 실감하게 해줍니다.'
      ja: 'NISTのAIエージェントセキュリティ標準を扱った記事で、今回のサプライチェーン攻撃事例がなぜ標準レベルのセキュリティフレームワークが必要かを実感させてくれます。'
      en: 'Covers NIST AI agent security standards — this supply chain attack case study shows exactly why standard-level security frameworks are needed.'
      zh: '讨论了NIST AI代理安全标准，本次供应链攻击案例让人深刻体会到为什么需要标准级别的安全框架。'
---

3月24日、PyPIに公開されたLiteLLM 1.82.7と1.82.8にバックドアが発見された。LiteLLMは1日340万ダウンロードを記録する、クラウド環境の36%にインストールされたLLMプロキシライブラリだ。セキュリティスキャナーTrivyをまず感染させ、そのスキャナーがCI/CDパイプラインでLiteLLMのビルドを汚染するという攻撃だった。

セキュリティツールを信頼していたのに、そのセキュリティツール自体が感染経路だったという点がかなり衝撃的だ。

## 攻撃チェーン分析

TeamPCPというグループが実行したこの攻撃は、3段階で構成されていた。

**第1段階：セキュリティスキャナーの感染**

Aqua SecurityのTrivy（コンテナ脆弱性スキャナー）をまずターゲットにした。TrivyのGitHub Actionsワークフローを通じて悪意あるコードをCI/CDパイプラインに注入した。LiteLLMのリリースパイプラインがTrivyをセキュリティ検証ステップとして使用していたため、セキュリティ検証そのものが感染ベクターとなった。

**第2段階：パッケージ汚染**

感染したCI/CDを通じてLiteLLMパッケージに`.pth`ファイルが挿入された。Pythonの`.pth`ファイルはsite-packagesディレクトリにあると、Pythonプロセス起動時に自動実行される。つまり、`import litellm`を実行しなくても、同じ環境で任意のPythonスクリプトを実行するだけで悪意あるコードが動作する構造だ。

`.pth`ファイルは本来パッケージパス設定用だが、任意コード実行が可能な構造的脆弱性がある。ほとんどのセキュリティスキャナーが`.py`ファイルのみ検査し、`.pth`は確認しないという点を突いた巧妙な手法だった。

**第3段階：三重ペイロード**

実行されると、順次3つの動作を行った：

| 段階 | 行為 | 目的 |
|------|------|------|
| クレデンシャル収集 | AWS、GCP、Azure認証情報の収集 | クラウドリソースの奪取 |
| K8s水平移動 | Kubernetesクラスター内の他ノードへ拡散 | 攻撃範囲の拡大 |
| systemdバックドア | 永続的systemdサービスのインストール | 再起動後も持続 |

露出時間は約3時間だった。短いように見えるかもしれないが、1日340万ダウンロードの規模で3時間あれば数千の環境が感染した可能性がある。

## なぜAIツールチェーンが特に危険なのか

私はこの事件がAI/LLMエコシステムにとって特別に危険な理由があると考えている。

**依存チェーンが深く広い。** 一般的なWebアプリケーションと異なり、AIプロジェクトの`requirements.txt`は数十のMLライブラリを含む。LiteLLMだけでもOpenAI、Anthropic、Google、Cohereなど数十のプロバイダーSDKに依存している。1つが感染すれば伝播範囲が広い。

**速い更新サイクル。** AIライブラリはAPI変更が頻繁で、`pip install --upgrade`を頻繁に実行する。新モデルが出るたびにSDKを更新する習慣が攻撃面を拡大させる。

**本番環境の高い権限。** LLMプロキシサーバーはほとんどの場合、クラウドAPIキーを環境変数に持っている。AWS、GCP、各種AIプロバイダーキーが一箇所に集まっているため、攻撃者にとっては宝の山だ。

## 実践的な対応方法

理論的な話より、すぐに適用できることを整理してみた。

### 1. バージョンピンニング + ハッシュ検証

```bash
# requirements.txtにハッシュを一緒に固定
litellm==1.82.6 \
  --hash=sha256:abc123...

# pip-compileで自動生成可能
pip-compile --generate-hashes requirements.in
```

`>=1.82.0`のような範囲指定では、この種の攻撃にすぐやられる。正確なバージョンとハッシュを一緒に固定すべきだ。

### 2. .pthファイルのモニタリング

CI/CDパイプラインでパッケージインストール前後に`.pth`ファイルのdiffを確認するステップを追加するのが効果的だ。site-packagesディレクトリに予期しない`.pth`ファイルが現れたら、即座にアラートを発生させるべきだ。

```bash
# site-packages内の.pthファイルリストのスナップショット比較
diff <(cat /tmp/pth-before.txt) \
     <(find "$(python -c 'import site; print(site.getsitepackages()[0])')" \
       -name "*.pth" | sort)
```

### 3. セキュリティツールも検証対象

今回の事件の最も痛い教訓は「セキュリティスキャナーを信頼していたら、それが感染ベクターだった」という点だ。Trivy、Snyk、CheckmarxなどのセキュリティツールのGitHub Actionsバージョンもハッシュベースで固定すべきだ。

```yaml
# Bad: タグベース（改ざん可能）
- uses: aquasecurity/trivy-action@latest

# Good: コミットハッシュベース
- uses: aquasecurity/trivy-action@a7b7e23e4a1e36c8a6a1b8c0a1d2e3f4a5b6c7d8
```

### 4. ネットワーク隔離

LLMプロキシサーバーが外部へのアウトバウンド接続を開けるなら、クレデンシャル漏洩も可能だ。本番環境では、許可されたAI APIエンドポイントのみホワイトリストで開放するのが望ましい。

## 過大評価への警戒

一つ注意すべき点：この事件を「AIライブラリを使うべきではない」と拡大解釈するのは困る。サプライチェーン攻撃はAIに限った問題ではなく、npm（event-stream事件）、PyPI（ctxパッケージ）、そしてSolarWindsまでソフトウェアエコシステム全体の問題だ。ただし、AIツールチェーンは高い権限＋速い更新サイクル＋深い依存関係という組み合わせのため、攻撃価値がより高いという点を認識すべきだ。

個人的に今回の事件以降、チームでCI/CDパイプラインのすべての外部アクションをハッシュベースに切り替える作業を始めた。正直面倒だが、`.pth`ファイル1つでクラウドキーが丸ごと飛ぶシナリオを考えれば、やらない理由がない。

---

**参考資料：**
- [LiteLLMセキュリティアップデート（2026年3月）](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
