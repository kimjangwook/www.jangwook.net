---
title: LiteLLMサプライチェーン攻撃 — AIインフラ依存関係のセキュリティ死角
description: >-
  PyPIで発生したLiteLLMサプライチェーン攻撃を分析し、AIツールチェーンにおける依存関係管理とサプライチェーンセキュリティを強化するための実践的な方法を整理します。
pubDate: '2026-03-31'
heroImage: >-
  ../../../assets/blog/litellm-supply-chain-attack-ai-dependency-security-hero.jpg
tags:
  - security
  - supply-chain
  - python
  - ai-infrastructure
relatedPosts:
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: gpt53-codex-rollout-pause
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps主题进行连接。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.91
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps主题进行连接。
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

**本番環境の高い権限。** LLMプロキシサーバーはほとんどの場合、クラウドAPIキーを環境変数に持っている。AWS、GCP、各種AIプロバイダーキーが一箇所に集まっているため、攻撃者にとっては宝の山だ。[MCP設定ファイルだけで2万件以上のクレデンシャルが公開リポジトリに流出した事例](/ja/blog/ja/ai-coding-secrets-sprawl-mcp-config-security)も同じ構造から生まれている。

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

今回の事件の最も痛い教訓は「セキュリティスキャナーを信頼していたら、それが感染ベクターだった」という点だ。Trivy、Snyk、CheckmarxなどのセキュリティツールのGitHub Actionsバージョンもハッシュベースで固定すべきだ。[AIエージェントDevSecOpsパイプライン](/ja/blog/ja/openai-promptfoo-ai-agent-devsecops)を構築する際に外部ツールの信頼検証が核心的な課題となる理由だ。

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

個人的に今回の事件以降、チームでCI/CDパイプラインのすべての外部アクションをハッシュベースに切り替える作業を始めた。正直面倒だが、`.pth`ファイル1つでクラウドキーが丸ごと飛ぶシナリオを考えれば、やらない理由がない。[MCPエコシステムで60日以内に30件のCVEが発見されたセキュリティ危機](/ja/blog/ja/mcp-security-crisis-30-cves-enterprise-hardening)のように、AIインフラのセキュリティはすでに戦場だ。

---

**参考資料：**
- [LiteLLMセキュリティアップデート（2026年3月）](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
