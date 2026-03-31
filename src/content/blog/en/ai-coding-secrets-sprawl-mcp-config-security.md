---
title: >-
  AI Coding Agents Leaked 29 Million Secrets — The Blind Spot in MCP Config File
  Security
description: >-
  According to the GitGuardian 2026 report, repositories using AI coding tools
  leak secrets at twice the GitHub average. Over 24,000 credentials were exposed
  in MCP config files alone. Here is a practical guide to auditing your setup
  and fighting back.
pubDate: '2026-03-30'
heroImage: ../../../assets/blog/ai-coding-secrets-sprawl-mcp-config-security-hero.jpg
tags:
  - security
  - mcp
  - ai-coding
  - secrets
  - devops
relatedPosts:
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

Last week I was skimming through GitGuardian's *State of Secrets Sprawl 2026* report when my hand froze on the mouse. **29 million** secrets detected on GitHub in a single year. But the real gut punch came in the next sentence: repositories that use AI coding tools leak secrets at **twice** the overall GitHub average.

I'm someone who connects Claude Code to MCP servers every single day. Honestly, after reading that report, the first thing I did was audit my own `.claude/` directory and MCP config files. Everything turned out clean, but the exercise helped me understand the *structural* reasons why AI coding tools accelerate secret leakage.

## Why AI Coding Tools Double the Secret Leak Rate

In traditional development, the paths to leaking secrets are relatively straightforward. You forget to add `.env` to `.gitignore`, or you hardcode an API key in a test file. But the moment you start working with AI coding agents, the number of leak vectors multiplies fast.

**The first problem is context injection.** When you ask an AI agent to "call this API," the code it generates sometimes includes the actual API key. Agents have a subtle tendency to inline values instead of referencing environment variables. A human developer has the reflex to think "I should pull this into an env var," but an AI optimizes for "code that works right now."

**The second problem is far worse: MCP config files.** The configuration files that tools like Claude Code, Cursor, and Windsurf use to connect to MCP servers contain database credentials, API keys, and OAuth tokens in plaintext. According to GitGuardian, **24,008** unique secrets were found in MCP config files across public repositories alone.

```json
// Tens of thousands of config files like this get committed as-is
{
  "mcpServers": {
    "database": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://admin:P@ssw0rd123@prod-db.example.com:5432/main"]
    },
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

If this file isn't in `.gitignore`, a single `git add -A` sends your production DB credentials straight to GitHub. And when an AI coding agent asks "should I commit this file too?", most of us just say "yes" without thinking.

## I Actually Audited My Own Setup

Here are the items I checked against my own working environment.

**1. Locate your MCP config files**

```bash
# Claude Code MCP config file locations
ls -la ~/.claude/mcp_settings.json 2>/dev/null
ls -la ./.claude/settings.local.json 2>/dev/null

# Search for MCP-related configs inside the project
grep -r "mcpServers" . --include="*.json" -l
```

**2. Audit your .gitignore**

```bash
# Check whether MCP config files are covered by gitignore
grep -E "mcp|settings\.local" .gitignore
```

In my case, `.claude/settings.local.json` was already in `.gitignore`, but I discovered a project-specific MCP config living in a separate JSON file that wasn't covered. I added it immediately.

**3. Search your Git history for previously leaked secrets**

```bash
# Check if secrets ever made it into past commits
git log --all --diff-filter=A -- '*.json' | head -20
git log -p --all -S 'SLACK_BOT_TOKEN' -- '*.json'
git log -p --all -S 'postgresql://' -- '*.json'
```

The critical point here is that adding a file to `.gitignore` doesn't erase it from history. If a secret was committed even once, rotating the key is the only real fix.

## GitHub MCP Server's Secret Scanning

On March 17, GitHub added secret scanning to its MCP Server as a public preview. When an AI coding agent works through the GitHub MCP Server, secrets are automatically detected before a push.

To set it up, go to your repository's Settings > Code security and analysis and enable "Secret scanning" and "Push protection." If you've already enabled these for a repo, they automatically apply to work done through the MCP Server as well.

Personally, I'm excited about this feature because it catches secrets generated by AI agents **within the agent workflow itself**. The system flags issues before a human even reviews the code, which fits perfectly into the realistic workflow of "the agent commits, and I review afterward."

## But This Alone Isn't Enough

Let's be honest: GitHub's secret scanning only detects **secrets that match known patterns**. Custom internal API keys or non-standard token formats can slip through. And it doesn't apply at all to teams using repositories outside GitHub — GitLab, Bitbucket, or self-hosted solutions.

There's another gap too: there's still no standard for managing credentials in MCP config files. Neither Anthropic nor the MCP community has published an official guideline saying "this is how you should handle secrets." Everyone is left to figure it out on their own — extracting values to environment variables, wiring up a secret manager, or just hoping for the best.

I believe the MCP ecosystem needs a credential-reference standard in config files to truly mature. Something like Docker Compose's `secrets:` block or Kubernetes' `secretKeyRef` pattern should be adopted for MCP configs. Today, the `env:` block lets you reference environment variables, which is a start, but integration with secret managers (HashiCorp Vault, AWS Secrets Manager, etc.) varies wildly across MCP server implementations.

## Checklist: Secret Security for AI Coding Agents

These are the items I actually follow in my own workflow.

- Confirm `.claude/settings.local.json` is in `.gitignore`
- Use environment variable references in MCP config files instead of plaintext credentials (`"env": {"KEY": "ENV_VAR_NAME"}`)
- Enable GitHub Push Protection (Settings > Code security)
- Use `git add <filename>` instead of `git add -A` for explicit staging
- Review AI-generated code for hardcoded secrets before every commit
- Run quarterly Git history scans for secrets (using gitleaks or truffleHog)
- Apply the principle of least privilege to tokens used for MCP server connections

## Wrapping Up

29 million is a scary number, but the truth is most secret leaks don't come from sophisticated attacks — they come from mistakes as mundane as "I forgot and committed it." The key takeaway from this report is that AI coding agents are increasing the frequency of these mistakes.

The lesson that hit home hardest for me is this: as AI agents speed up code generation, **the pace of your security reviews has to keep up**. The most dangerous habit is committing code an agent produced in 10 seconds without spending even 30 seconds looking at it. At the very least, run a quick `git diff` before you commit. Especially if `.json`, `.yaml`, or `.env` files show up in the staging area.
