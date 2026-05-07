---
title: 'Setting Up AI Development with uv — Start a Claude SDK Project in Under 1 Second'
description: 'A complete hands-on guide to building AI development environments with uv 0.11, the Rust-based Python package manager. Real benchmark data: 16 packages including anthropic installed in 0.874 seconds. Covers project init, Claude SDK setup, Python version management, and CI/CD integration.'
pubDate: '2026-05-07'
heroImage: '../../../assets/blog/uv-python-ai-development-setup-guide-2026-hero.png'
tags: ['Python', 'uv', 'Claude API', 'Dev Environment', 'AI Development']
relatedPosts:
  - slug: 'vercel-ai-sdk-claude-streaming-agent-2026'
    score: 0.82
    reason:
      ko: 'uv로 환경을 설정한 뒤 바로 이어지는 단계다. Vercel AI SDK와 함께 Claude 스트리밍 에이전트를 구현하는 실전 예제를 다루고 있어, uv 기반 프로젝트의 다음 스텝으로 자연스럽게 연결된다.'
      ja: 'uv環境を整えた後の次のステップとして、Vercel AI SDKでClaudeストリーミングエージェントを実装する実践例を紹介している。'
      en: 'The natural next step after setting up a uv environment: implementing a Claude streaming agent with the Vercel AI SDK in a real project.'
      zh: '在uv环境配置完成后，这篇文章展示了如何用Vercel AI SDK实现Claude流式代理，是很自然的延续。'
  - slug: 'mcp-server-build-practical-guide-2026'
    score: 0.76
    reason:
      ko: 'MCP 서버도 Python으로 구축하는 경우가 많다. uv로 환경을 세팅하면 FastMCP 의존성 설치부터 배포까지 일관된 워크플로우를 유지할 수 있다.'
      ja: 'MCPサーバーもPythonで構築するケースが多い。uvで環境を管理すれば、FastMCP依存関係のインストールから本番デプロイまで一貫したワークフローが維持できる。'
      en: 'MCP servers are often built in Python. Managing your environment with uv keeps the workflow consistent from FastMCP dependency install to production deployment.'
      zh: 'MCP服务器也常用Python构建。用uv管理环境可以从FastMCP依赖安装到生产部署保持一致的工作流。'
  - slug: 'llm-coding-harness-optimization'
    score: 0.71
    reason:
      ko: 'LLM 기반 코딩 환경을 최적화할 때 패키지 설치 속도와 환경 재현성이 핵심 병목이다. uv가 이 문제를 어떻게 해소하는지 비교해볼 수 있다.'
      ja: 'LLMベースのコーディング環境最適化において、パッケージインストール速度と環境の再現性が主なボトルネックだ。uvがこの問題をどう解決するかを比較できる。'
      en: 'When optimizing LLM-based coding environments, package install speed and reproducibility are key bottlenecks. Compare how uv addresses these versus the old stack.'
      zh: '在优化LLM编码环境时，包安装速度和环境可复现性是关键瓶颈。可以对比uv如何解决这些问题。'
---

Until last year, every time I started an AI project I'd go through the same ritual. `python -m venv .venv`, `source .venv/bin/activate`, `pip install anthropic openai`... and then wait. Sometimes over two minutes. Watching anthropic, torch, and pydantic download one by one.

The context-switching cost added up. Every time I made a new experiment branch, environment setup broke the flow. The "works on my machine" problem didn't go away either.

Then I started using `uv` — a Python package manager written in Rust, from the team behind Ruff at Astral. I benchmarked it today while setting up a Claude SDK project: installing `anthropic` along with 16 packages total took **0.874 seconds**. With pip, that same operation would have taken 20〜40 seconds.

This is a complete hands-on guide to setting up an AI development environment with uv 0.11 from scratch.

## Why uv Now — What's Actually Wrong with pip, Poetry, and conda

Honestly, pip itself isn't the problem. It's a proven tool that's downloaded billions of packages. The issue is the combination of <strong>speed and environment isolation</strong>.

Why pip is slow for AI dev is structural: it resolves packages sequentially and doesn't cache downloaded files efficiently. When you run `pip install anthropic openai torch`, it fetches each package's metadata, resolves dependencies, and checks for conflicts serially.

Poetry is much better at dependency management — declarative `pyproject.toml`, lock file support. But Poetry itself is written in Python, which puts a ceiling on speed, and debugging a broken environment can get tedious fast.

conda is strong for Python version management but environments tend to balloon to several gigabytes, and it's awkward to use in Docker CI.

uv is written in Rust, which gives it fundamentally different performance on parallel downloads and cache utilization. What I measured today:

```
uv init claude-agent-demo         →  0.435s
uv add anthropic                  →  0.874s  (16 packages, pydantic-core 1.9MB)
uv add openai httpx python-dotenv →  0.555s  (3 more packages)
uv sync (cache hit, 19 packages)  →  0.074s  (29ms install)
```

## Prerequisites

Almost nothing is required to install uv. Check the following by OS:

- **macOS/Linux**: `curl` or Homebrew
- **Windows**: PowerShell
- No need to pre-install Python — uv can manage Python versions directly

That last point matters. You don't need pyenv, conda, or a specific system Python to get started.

## Step 1: Install uv

macOS and Linux: one line.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Or via Homebrew:

```bash
brew install uv
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

After installation:

```bash
uv --version
# uv 0.11.11 (ed7b06001 2026-05-06)
```

This is the current latest as of today (2026-05-07). Astral releases frequently; `uv self update` keeps you current.

## Step 2: Initialize an AI Project

```bash
uv init claude-agent-demo
cd claude-agent-demo
```

Output:

```
Initialized project `claude-agent-demo` at `/path/to/claude-agent-demo`
```

Completes in 0.435 seconds. The generated structure:

```
claude-agent-demo/
├── main.py
├── pyproject.toml
└── README.md
```

The `pyproject.toml` that uv generates:

```toml
[project]
name = "claude-agent-demo"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []
```

`pyproject.toml` is the Python ecosystem standard project file. Unlike `requirements.txt`, it's the source of truth for both development and packaging.

Set up your `.env` at this point:

```bash
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-api-key-here
EOF
```

## Step 3: Add the Claude SDK

```bash
uv add anthropic
```

The actual install log from today's test:

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 17 packages in 514ms
Downloading pydantic-core (1.9MiB)
 Downloaded pydantic-core
Prepared 16 packages in 269ms
Installed 16 packages in 20ms
 + annotated-types==0.7.0
 + anthropic==0.100.0
 + anyio==4.13.0
 + certifi==2026.4.22
 + distro==1.9.0
 + docstring-parser==0.18.0
 + h11==0.16.0
 + httpcore==1.0.9
 + httpx==0.28.1
 + idna==3.13
 + jiter==0.14.0
 + pydantic==2.13.4
 + pydantic-core==2.46.4
 + sniffio==1.3.1
 + typing-extensions==4.15.0
 + typing-inspection==0.4.2
```

Even with pydantic-core at 1.9MB, the entire install finished in 0.874 seconds. This is cold cache — no packages downloaded previously.

Adding more SDKs is just as fast:

```bash
uv add openai httpx python-dotenv
```

```
Resolved 21 packages in 232ms
Installed 3 packages in 19ms
 + openai==2.35.1
 + python-dotenv==1.2.2
 + tqdm==4.67.3
```

0.555 seconds. Both anthropic and openai depend on `httpx`, and uv resolves this correctly without duplication. Dependency collision management is exactly where pip tends to silently downgrade or upgrade packages in ways you don't notice until something breaks.

## Step 4: Run Your First Claude Script

Write `main.py`:

```python
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    client = anthropic.Anthropic(
        api_key=os.environ.get("ANTHROPIC_API_KEY")
    )
    
    message = client.messages.create(
        model="claude-opus-4-7-20260401",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Explain in one sentence why uv is faster than pip."}
        ]
    )
    
    print(message.content[0].text)

if __name__ == "__main__":
    main()
```

Run it:

```bash
uv run main.py
```

The key point with `uv run`: you <strong>never need to activate the virtualenv</strong>. No `source .venv/bin/activate`. uv injects the project environment automatically. First run takes about 1.675 seconds (environment check); subsequent runs are faster from cache.

To verify the import without an API call:

```bash
uv run python -c "import anthropic; print(anthropic.__version__)"
# 0.100.0
```

If you want to go further with [Claude streaming agents using the Vercel AI SDK](/en/blog/en/vercel-ai-sdk-claude-streaming-agent-2026), the project setup starts the same way — `uv add` whatever SDK you need and `uv run` your entry point.

## Step 5: Python Version Management

One of uv's underrated features: you can install and switch Python versions without pyenv.

List available versions:

```bash
uv python list
```

Partial output from my machine:

```
cpython-3.15.0a8-macos-aarch64-none      <download available>
cpython-3.14.5rc1-macos-aarch64-none     <download available>
cpython-3.13.13-macos-aarch64-none       <download available>
cpython-3.13.11-macos-aarch64-none       /opt/homebrew/bin/python3.13
cpython-3.12.8-macos-aarch64-none        /usr/local/bin/python3.12
```

Create a project pinned to a specific version:

```bash
uv init my-project --python 3.13
```

Pin an existing project:

```bash
uv python pin 3.12
```

This creates a `.python-version` file, ensuring everyone on the team uses the same Python version. One tool replaces pyenv + virtualenv + pip.

## Step 6: Team Collaboration and CI/CD

Commit `uv.lock` to git. With that file checked in, anyone cloning the repo gets exactly the same package versions.

After cloning:

```bash
git clone <repo-url>
cd my-project
uv sync
```

From today's test — deleted `.venv` and ran `uv sync`:

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 21 packages in 0.66ms
Installed 19 packages in 29ms
```

<strong>0.074 seconds</strong>. With a warm cache, this is what reinstalling 19 packages looks like.

![uv sync run log: 19 packages installed in 0.074 seconds](../../../assets/blog/uv-python-ai-development-setup-guide-2026-sync-log.png)

GitHub Actions configuration:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install uv
        uses: astral-sh/setup-uv@v4
        with:
          version: "0.11.11"
      
      - name: Set up Python
        run: uv python install
      
      - name: Install dependencies
        run: uv sync --all-extras --dev
      
      - name: Run tests
        run: uv run pytest
```

The official `astral-sh/setup-uv` action handles cache automatically. When [building an MCP server in Python](/en/blog/en/mcp-server-build-practical-guide-2026), this same CI pattern applies — `uv add fastmcp` for the dependency, `uv sync` in GitHub Actions.

## Managing CLI Tools with uv tool

uv handles CLI tool installation too, replacing `pipx`.

```bash
# Install ruff as a global CLI tool
uvx ruff check .

# One-shot run without installing (like npx)
uvx --from httpie http https://api.anthropic.com/v1/models

# Persistent install
uv tool install ruff
uv tool install black
```

`uvx` runs a tool immediately without a permanent install. For pinning specific versions:

```bash
uvx ruff@0.4.0 check .       # pin to a version
uvx --python 3.12 mypy .     # specify Python version
```

Common tools for AI development:

```bash
uv tool install ruff          # linter/formatter
uv tool install mypy          # type checking
uv tool install pytest        # test runner
uv tool install pre-commit    # git hook management
```

No more separate `pip install --user` or `pipx`. One tool handles project dependencies and global CLI tools.

## Edge Cases Worth Knowing

**Migrating an existing requirements.txt project**:

```bash
# Works on existing projects
uv pip install -r requirements.txt
```

uv supports `pip` subcommands. When a full migration isn't practical, `uv pip install` bridges the gap.

**Dev-only dependencies**:

```bash
# Add to dev group
uv add --dev pytest ruff mypy

# Install production dependencies only
uv sync --no-dev
```

**Anthropic SDK optional extras**:

```bash
# Add Amazon Bedrock support
uv add "anthropic[bedrock]"

# Add Vertex AI (GCP) support
uv add "anthropic[vertex]"
```

The bracket syntax selects optional extras. `anthropic[bedrock]` pulls in `boto3`; `anthropic[vertex]` pulls in the GCP client.

## Dependency Tree and Debugging

To understand what installed and why:

```bash
uv tree
```

Output:

```
claude-agent-demo v0.1.0
├── anthropic v0.100.0
│   ├── anyio v4.13.0
│   │   ├── idna v3.13
│   │   └── typing-extensions v4.15.0
│   ├── httpx v0.28.1
│   │   ├── certifi v2026.4.22
│   │   └── httpcore v1.0.9
│   ├── pydantic v2.13.4
│   └── ...
└── openai v2.35.1
    └── ...
```

`(*)` marks shared dependencies. Much clearer than `pip show` for tracking down where a version came from.

To remove a package:

```bash
uv remove openai
```

Lock file updates automatically.

## Honest Assessment — Where uv Falls Short

Performance-wise, uv is nearly perfect. But a few things deserve honesty.

<strong>Ecosystem maturity.</strong> uv launched in 2024 and is at v0.11 as of today. Still pre-1.0. For personal projects and new codebases, it's an easy recommendation. For large teams migrating existing Poetry or pip workflows, factor in the transition cost.

<strong>conda ecosystem compatibility.</strong> If you need torch, CUDA toolkits, or tensorflow installed from conda channels, uv can't help you — it's PyPI-only. For pure Python AI projects (API calls, text generation, agent frameworks), this isn't an issue. For deep learning work requiring specific CUDA versions, you may still need conda alongside uv.

<strong>The `uv run` habit shift.</strong> Typing `uv run` instead of `python` takes adjustment. The upside is that team members can't accidentally run scripts against system Python without noticing.

The [LLM coding environment optimization](/en/blog/en/llm-coding-harness-optimization) post touches on a similar observation: the harder part of adopting a faster tool is often changing team habits, not the tool itself.

## Summary: Command Recipes You Can Use Right Now

```bash
# Start a new AI project
uv init my-ai-project
cd my-ai-project

# Install Claude SDK
uv add anthropic python-dotenv

# Add multiple SDKs at once
uv add anthropic openai httpx

# Run a script (no venv activation needed)
uv run main.py

# Sync team environment from lock file
uv sync

# Create a project with a specific Python version
uv init my-project --python 3.13

# Inspect dependency tree
uv tree

# Remove a package
uv remove openai

# Update uv itself
uv self update
```

I now reach for `uv init` almost automatically when starting a new AI project. I haven't found a reason to go back to pip. For conda-dependent ML work, the choice is still necessary.

0.874 seconds isn't just a speed stat. The less friction each experiment costs, the more experiments you run. That tends to produce better code.
