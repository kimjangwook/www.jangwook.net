---
title: LiteLLM供应链攻击 — AI基础设施依赖的安全盲区
description: 分析PyPI上发生的LiteLLM供应链攻击，整理在AI工具链中加强依赖管理和供应链安全的实战方法。
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

**生产环境的高权限。** LLM代理服务器大多将云API密钥作为环境变量。AWS、GCP和各种AI提供商的密钥集中在一个地方，对攻击者来说简直是金矿。[仅MCP配置文件就在公共仓库中暴露了2万多个凭证的案例](/zh/blog/zh/ai-coding-secrets-sprawl-mcp-config-security)也源于同样的结构问题。

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

这次事件最痛苦的教训是"我们信任了安全扫描器，结果它就是感染向量"。Trivy、Snyk、Checkmarx等安全工具的GitHub Actions版本也应该基于哈希固定。这正是[AI代理DevSecOps管道](/zh/blog/zh/openai-promptfoo-ai-agent-devsecops)将外部工具信任验证列为核心议题的原因。

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

就个人而言，这次事件之后，我们团队开始将CI/CD管道中所有外部Action切换为基于哈希的方式。说实话很麻烦，但想到一个`.pth`文件就能让所有云密钥被窃取的场景，没有理由不做。[MCP生态系统在60天内发现30个CVE的安全危机](/zh/blog/zh/mcp-security-crisis-30-cves-enterprise-hardening)说明，AI基础设施安全已经是一场现实的战争。

---

**参考资料：**
- [LiteLLM安全更新（2026年3月）](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
