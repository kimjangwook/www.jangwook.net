---
title: Claude Mythos Preview — AI"太强了所以不公开"，这说得通吗
description: >-
  Anthropic决定不公开发布SWE-bench得分93.9%的Claude Mythos Preview。
  这个发现了27年前OpenBSD漏洞的模型，仅通过Project Glasswing向12家企业提供。 这是真正的责任感，还是巧妙的营销？
pubDate: '2026-04-09'
heroImage: ../../../assets/blog/claude-mythos-preview-glasswing-ai-cybersecurity-hero.jpg
tags:
  - anthropic
  - claude-mythos
  - cybersecurity
  - ai-governance
  - project-glasswing
relatedPosts:
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.95
    reason:
      ko: Mythos 이전에 Claude가 Firefox에서 22개 CVE를 찾아낸 사례다. Mythos의 보안 감사 능력이 어디서 출발했는지 맥락을 잡을 수 있다.
      ja: Mythos以前にClaudeがFirefoxで22件のCVEを発見した事例です。Mythosのセキュリティ監査能力がどこから始まったのか文脈を掴めます。
      en: Before Mythos, Claude found 22 CVEs in Firefox. This gives context for where Mythos's security audit capabilities originated.
      zh: 在Mythos之前，Claude在Firefox中发现了22个CVE。这为Mythos安全审计能力的起源提供了背景。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.88
    reason:
      ko: MCP 프로토콜에서 발견된 30개 CVE와 엔터프라이즈 하드닝 전략. Mythos급 모델이 등장하면 MCP 보안이 더 중요해진다.
      ja: MCPプロトコルで発見された30件のCVEとエンタープライズハードニング戦略。Mythos級モデルの登場でMCPセキュリティの重要性が増します。
      en: 30 CVEs found in the MCP protocol and enterprise hardening strategies. Mythos-level models make MCP security even more critical.
      zh: MCP协议中发现的30个CVE及企业加固策略。Mythos级别模型的出现使MCP安全更加重要。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.87
    reason:
      ko: Anthropic의 펜타곤 AI 거버넌스 사례를 다뤘다. Glasswing의 제한적 공개 결정이 같은 맥락 위에 있다.
      ja: Anthropicのペンタゴン向けAIガバナンス事例を扱っています。Glasswingの制限公開の決定が同じ文脈上にあります。
      en: Covers Anthropic's Pentagon AI governance case. The Glasswing restricted release decision sits in the same governance context.
      zh: 介绍了Anthropic的五角大楼AI治理案例。Glasswing的限制发布决策处于相同的治理背景中。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.84
    reason:
      ko: AI 모델의 IP 보호와 증류 공격 방어 전략. Mythos처럼 강력한 모델의 접근 제한이 왜 필요한지 다른 각도에서 보여준다.
      ja: AIモデルのIP保護と蒸留攻撃防御戦略。Mythosのような強力なモデルへのアクセス制限がなぜ必要かを別の角度から見せます。
      en: AI model IP protection and distillation attack defense. Shows from another angle why restricting access to powerful models like Mythos matters.
      zh: AI模型的IP保护和蒸馏攻击防御策略。从另一个角度展示了为什么限制Mythos等强大模型的访问是必要的。
  - slug: claude-sonnet-46-release
    score: 0.82
    reason:
      ko: Claude Sonnet 4.6 출시 분석. Mythos와 같은 Anthropic 모델 라인업에서 어떤 위치인지 비교할 수 있다.
      ja: Claude Sonnet 4.6のリリース分析。Mythosと同じAnthropicモデルラインナップにおける位置を比較できます。
      en: Analysis of the Claude Sonnet 4.6 release. Compare where it sits in the same Anthropic model lineup as Mythos.
      zh: Claude Sonnet 4.6发布分析。可以比较它在与Mythos相同的Anthropic模型产品线中的定位。
---

4月7日，Anthropic发布了Claude Mythos Preview。SWE-bench Verified 93.9%。USAMO 2026上97.6%。在所有主要基准测试中超越了GPT-5.4。

但他们决定不向公众发布。

原因？"网络安全能力太强了。"据称该模型在所有主要操作系统和Web浏览器中自动发现了数千个零日漏洞——OpenBSD中隐藏了27年的远程崩溃漏洞、FFmpeg中自动化工具测试500万次都没找到的16年老漏洞、Linux内核权限提升利用链。

看到这个公告，我同时产生了两个想法："确实厉害"和"这故事也太完美了吧？"

## Project Glasswing这个名字

Anthropic通过名为Project Glasswing的计划，仅向12家企业提供Mythos Preview。Amazon、Apple、Google、Microsoft、Nvidia——光看名字就是Big Tech全明星阵容。Palo Alto Networks、CrowdStrike、Cloudflare、Cisco、Broadcom等安全企业也在其中。

提供1亿美元的使用额度，条件是"仅用于防御性网络安全用途"。

Glasswing是一种拥有透明翅膀的蝴蝶。大概是想表达"透明运营"的意思，说实话命名确实有水平。科技企业的品牌能力真的值得学习。

## 拆解基准测试数据

Mythos Preview的数字确实令人印象深刻。

- **SWE-bench Verified**: 93.9%（Opus 4.6为80.8%，GPT-5.4大约73%）
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6%（Opus 4.6为42.3%，GPT-5.4为95.2%）
- **GPQA Diamond**: 比GPT-5.4高1.7分
- **HLE with tools**: 比GPT-5.4高12.6分

从Opus 4.6到Mythos的13个百分点跳跃，在一代产品中是很难出现的。很可能在架构层面发生了根本性变化。

不过我关注的不是基准测试分数，而是"自主发现漏洞并开发利用代码"这部分。根据Anthropic的红队报告，测试中模型出现了意料之外的行为——绕过隔离环境，或者在没有指令的情况下自主演示利用方法。

这和基准测试分数是完全不同层面的讨论。

## "不公开"的真正含义

这里需要批判性地审视一下。

Anthropic说"太危险所以不公开"，但实际上是向12家Big Tech企业连同1亿美元额度一起分发了。这不是"不公开"，而是"选择性公开"。接收方是全球资源最丰富的企业，还获得了免费额度，本质上接近免费体验营销。

我并不认为这是个坏决定。反而觉得挺务实的。只是"负责任的AI企业"这个包装有点用力过猛。向12家安全企业发放1亿美元额度，同时也是企业级市场攻略的经典操作。

Simon Willison在[他的博客](https://simonwillison.net/2026/Apr/7/project-glasswing/)中评价"限制性发布似乎是必要的"，我也同意这个判断本身。问题在于，这类决策的标准掌握在Anthropic一家公司手中。

## Glasswing悖论

Picus Security精准地指出了这一点：["能摧毁一切的东西，也是能修复一切的东西。"](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

Mythos发现的漏洞是真实存在的。27年前的OpenBSD漏洞至今存活，意味着现有的安全审计体系遗漏了它。如果AI能自动找到这类漏洞，那攻击者构建具有类似能力的模型只是时间问题。

因此Anthropic实际上只有两个选项：

1. 公开发布让所有人都能用于防御，但承担被用于攻击的风险
2. 限制发布，先给防御方争取时间

Anthropic选择了第2个。合理的选择，但前提是"防御方"指的是12家Big Tech。中小企业和开源项目的安全在这个格局中被忽略了。

## 这个趋势会走向何方

几个月前Claude在Firefox中发现了22个CVE。当时就有人说"AI正在改变安全审计"。Mythos把这件事提升到了完全不同的维度。

我个人期待的是，这种能力终将不可避免地民主化。现在只有Glasswing参与企业能使用，但我预计1-2年内会出现同等水平的开源安全代理。Opus 4.6级别已经能做相当程度的安全审计了。

在那之前，该做的是减少自己代码库的安全债务。如果OpenBSD都有27年的老漏洞，没人能保证自己的项目是干净的。

Anthropic把Mythos包装成"太危险不能公开"确实很聪明。但真正的问题在别处。当AI拥有了这个级别的安全能力，"谁能获取这个工具"将直接决定安全差距。

而这个访问权，现在连同1亿美元额度一起，只给了12家企业。
