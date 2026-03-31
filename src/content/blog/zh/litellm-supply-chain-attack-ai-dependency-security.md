---
title: LiteLLM供应链攻击 — AI基础设施依赖的安全盲区
description: 分析PyPI上发生的LiteLLM供应链攻击，整理在AI工具链中加强依赖管理和供应链安全的实战方法。
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

3月24日，在PyPI上发布的LiteLLM 1.82.7和1.82.8版本中发现了后门。LiteLLM是一个日下载量达340万的LLM代理库，安装在36%的云环境中。攻击者先感染了安全扫描器Trivy，然后通过该扫描器在CI/CD管道中污染了LiteLLM的构建。

我们信任的安全工具本身竟然成了感染途径，这一点相当令人震惊。

## 攻击链分析

这次攻击由一个名为TeamPCP的组织执行，分为三个阶段。

**第1阶段：安全扫描器感染**

首先针对Aqua Security的Trivy（容器漏洞扫描器）进行攻击。通过Trivy的GitHub Actions工作流将恶意代码注入CI/CD管道。由于LiteLLM的发布管道使用Trivy作为安全验证步骤，安全验证本身就成了感染向量。

**第2阶段：包污染**

通过被感染的CI/CD，在LiteLLM包中插入了`.pth`文件。Python的`.pth`文件如果存在于site-packages目录中，会在Python进程启动时自动执行。也就是说，即使不执行`import litellm`，只要在同一环境中运行任何Python脚本，恶意代码就会运行。

`.pth`文件原本用于包路径配置，但存在允许任意代码执行的结构性漏洞。大多数安全扫描器只检查`.py`文件而不检查`.pth`——攻击者巧妙地利用了这个盲区。

**第3阶段：三重载荷**

执行后，依次进行三个操作：

| 阶段 | 行为 | 目的 |
|------|------|------|
| 凭证收集 | 收集AWS、GCP、Azure认证信息 | 窃取云资源 |
| K8s横向移动 | 在Kubernetes集群内向其他节点扩散 | 扩大攻击范围 |
| systemd后门 | 安装持久化systemd服务 | 重启后仍然存在 |

暴露时间约为3小时。看起来可能很短，但在日下载量340万的规模下，3小时内可能已有数千个环境被感染。

## 为什么AI工具链特别危险

我认为这一事件对AI/LLM生态系统特别危险，有其具体原因。

**依赖链深且广。** 与普通Web应用不同，AI项目的`requirements.txt`包含数十个ML库。仅LiteLLM就依赖OpenAI、Anthropic、Google、Cohere等数十个提供商的SDK。一个被感染，传播范围就很广。

**更新周期快。** AI库的API变更频繁，导致开发者经常执行`pip install --upgrade`。每次新模型发布就更新SDK的习惯扩大了攻击面。

**生产环境的高权限。** LLM代理服务器大多将云API密钥作为环境变量。AWS、GCP和各种AI提供商的密钥集中在一个地方，对攻击者来说简直是金矿。

## 实战应对方法

比起理论性的讨论，这里整理了可以立即应用的方法。

### 1. 版本锁定 + 哈希验证

```bash
# 在requirements.txt中同时固定哈希
litellm==1.82.6 \
  --hash=sha256:abc123...

# 可以用pip-compile自动生成
pip-compile --generate-hashes requirements.in
```

像`>=1.82.0`这样的范围指定会直接暴露于此类攻击。需要同时固定精确版本和哈希。

### 2. .pth文件监控

在CI/CD管道中添加在包安装前后对比`.pth`文件diff的步骤很有效。如果site-packages目录中出现意外的`.pth`文件，应立即发出告警。

```bash
# site-packages中.pth文件列表的快照比较
diff <(cat /tmp/pth-before.txt) \
     <(find "$(python -c 'import site; print(site.getsitepackages()[0])')" \
       -name "*.pth" | sort)
```

### 3. 安全工具也是验证对象

这次事件最痛苦的教训是"我们信任了安全扫描器，结果它就是感染向量"。Trivy、Snyk、Checkmarx等安全工具的GitHub Actions版本也应该基于哈希固定。

```yaml
# Bad: 基于标签（可被篡改）
- uses: aquasecurity/trivy-action@latest

# Good: 基于提交哈希
- uses: aquasecurity/trivy-action@a7b7e23e4a1e36c8a6a1b8c0a1d2e3f4a5b6c7d8
```

### 4. 网络隔离

如果LLM代理服务器可以打开对外的出站连接，凭证泄露就成为可能。在生产环境中，最好只以白名单方式开放已批准的AI API端点。

## 警惕过度解读

需要注意一点：不要将此事件过度解读为"不应该使用AI库"。供应链攻击不是AI独有的问题，从npm（event-stream事件）、PyPI（ctx包）到SolarWinds，这是整个软件生态系统的问题。但AI工具链由于高权限+快速更新周期+深层依赖的组合，攻击价值更高，这一点需要认识到。

就个人而言，这次事件之后，我们团队开始将CI/CD管道中所有外部Action切换为基于哈希的方式。说实话很麻烦，但想到一个`.pth`文件就能让所有云密钥被窃取的场景，没有理由不做。

---

**参考资料：**
- [LiteLLM安全更新（2026年3月）](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
