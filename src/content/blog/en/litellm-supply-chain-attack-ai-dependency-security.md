---
title: >-
  LiteLLM Supply Chain Attack — The Security Blind Spot in AI Infrastructure
  Dependencies
description: >-
  Analyzing the LiteLLM supply chain attack on PyPI and practical methods to
  strengthen dependency management and supply chain security in AI tool chains.
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

On March 24, a backdoor was discovered in LiteLLM versions 1.82.7 and 1.82.8 on PyPI. LiteLLM is an LLM proxy library with 3.4 million daily downloads, installed in 36% of cloud environments. The attack first compromised the Trivy security scanner, which then contaminated LiteLLM's build through its CI/CD pipeline.

The security tool we trusted turned out to be the infection vector itself. That's quite a wake-up call.

## Attack Chain Analysis

This attack, carried out by a group called TeamPCP, consisted of three stages.

**Stage 1: Security Scanner Infection**

They first targeted Aqua Security's Trivy, a container vulnerability scanner. Malicious code was injected into the CI/CD pipeline through Trivy's GitHub Actions workflow. Since LiteLLM's release pipeline used Trivy as a security verification step, the security verification itself became the infection vector.

**Stage 2: Package Contamination**

Through the compromised CI/CD, a `.pth` file was inserted into the LiteLLM package. Python's `.pth` files in the site-packages directory execute automatically when any Python process starts. This means even without `import litellm`, running any Python script in the same environment would trigger the malicious code.

`.pth` files are originally meant for package path configuration, but they have a structural vulnerability that allows arbitrary code execution. Most security scanners only inspect `.py` files and skip `.pth` files — a blind spot the attackers cleverly exploited.

**Stage 3: Triple Payload**

Once executed, three operations ran sequentially:

| Stage | Action | Purpose |
|-------|--------|---------|
| Credential Harvesting | Collect AWS, GCP, Azure credentials | Cloud resource theft |
| K8s Lateral Movement | Spread to other nodes in Kubernetes clusters | Expand attack surface |
| systemd Backdoor | Install persistent systemd service | Survive reboots |

The exposure window was about 3 hours. That might sound short, but at 3.4 million daily downloads, thousands of environments could have been compromised in that time.

## Why AI Tool Chains Are Particularly Vulnerable

I believe this incident is especially dangerous for the AI/LLM ecosystem for specific reasons.

**Deep and wide dependency chains.** Unlike typical web applications, an AI project's `requirements.txt` includes dozens of ML libraries. LiteLLM alone depends on SDKs from OpenAI, Anthropic, Google, Cohere, and dozens of other providers. When one gets compromised, the blast radius is massive.

**Rapid update cycles.** AI libraries see frequent API changes, leading developers to run `pip install --upgrade` often. The habit of updating SDKs every time a new model drops expands the attack surface.

**High-privilege production environments.** LLM proxy servers typically hold cloud API keys as environment variables. AWS, GCP, and various AI provider keys all concentrated in one place — a goldmine for attackers.

## Practical Countermeasures

Rather than theoretical advice, here are things you can apply right now.

### 1. Version Pinning + Hash Verification

```bash
# Pin with hashes in requirements.txt
litellm==1.82.6 \
  --hash=sha256:abc123...

# Auto-generate with pip-compile
pip-compile --generate-hashes requirements.in
```

Range specifiers like `>=1.82.0` leave you directly exposed to this kind of attack. Pin exact versions with hashes.

### 2. .pth File Monitoring

Adding a step to diff `.pth` files before and after package installation in your CI/CD pipeline is effective. Any unexpected `.pth` files appearing in the site-packages directory should trigger an immediate alert.

```bash
# Snapshot comparison of .pth files in site-packages
diff <(cat /tmp/pth-before.txt) \
     <(find "$(python -c 'import site; print(site.getsitepackages()[0])')" \
       -name "*.pth" | sort)
```

### 3. Security Tools Are Also Verification Targets

The most painful lesson from this incident is "we trusted the security scanner, and it was the infection vector." GitHub Actions versions of security tools like Trivy, Snyk, and Checkmarx should also be pinned by commit hash.

```yaml
# Bad: Tag-based (can be tampered with)
- uses: aquasecurity/trivy-action@latest

# Good: Commit hash-based
- uses: aquasecurity/trivy-action@a7b7e23e4a1e36c8a6a1b8c0a1d2e3f4a5b6c7d8
```

### 4. Network Isolation

If an LLM proxy server can open outbound connections, credential exfiltration becomes possible. In production, whitelist only the approved AI API endpoints.

## Keeping Perspective

One thing to watch out for: don't over-interpret this as "we shouldn't use AI libraries." Supply chain attacks aren't exclusive to AI — from npm (the event-stream incident), PyPI (the ctx package), to SolarWinds, this is an industry-wide problem. However, AI tool chains carry higher attack value due to the combination of high privileges + rapid update cycles + deep dependencies.

Personally, after this incident, our team started migrating all external actions in our CI/CD pipelines to hash-based pinning. It's tedious, honestly, but when you consider the scenario where a single `.pth` file could exfiltrate all your cloud keys, there's no reason not to do it.

---

**References:**
- [LiteLLM Security Update (March 2026)](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
