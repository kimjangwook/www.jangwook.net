---
title: >-
  LiteLLM Supply Chain Attack — The Security Blind Spot in AI Infrastructure
  Dependencies
description: >-
  Analyzing the LiteLLM supply chain attack on PyPI and practical methods to
  strengthen dependency management and supply chain security in AI tool chains.
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
