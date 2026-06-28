---
title: 用uv搭建AI开发环境 — 0.87秒启动Claude SDK项目的实战指南
description: >-
  使用Rust编写的Python包管理器uv 0.11搭建AI
  SDK开发环境的完整实战指南。覆盖pip速度100倍以上的加速安装、可复现环境管理、Claude
  SDK项目初始化全流程，附真实运行日志，是2026年Python AI开发的首选工具链。
pubDate: '2026-05-07'
heroImage: ../../../assets/blog/uv-python-ai-development-setup-guide-2026-hero.png
tags:
  - Python
  - uv
  - Claude API
  - 开发环境
  - AI开发
relatedPosts:
  - slug: fastapi-claude-api-streaming-production-guide-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.85
    reason:
      ko: Python를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on Python experience.
      ja: Pythonを実際に扱った経験が続く記事です。
      zh: 延续 Python 的实战经验。
  - slug: python-ai-agent-library-comparison-2026
    score: 0.8
    reason:
      ko: 같은 Python 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same Python track.
      ja: 同じPythonの流れで併せて読むと役立ちます。
      zh: 在同一 Python 脉络中可一并阅读。
faq:
  - question: uv 相比 pip 或 Poetry 好在哪里？
    answer: >-
      uv 用 Rust 编写，能并行下载包并高效利用缓存。与顺序解析依赖的 pip 或用 Python 编写的 Poetry 不同，uv
      在速度上有本质提升。它还把基于 pyproject.toml 和 uv.lock 的可复现环境管理、Python 版本管理以及 CLI
      工具安装统一到一个工具中。
  - question: 如何用 uv 搭建 Claude SDK 这类 AI 开发环境？
    answer: >-
      先用 uv init 创建项目，再用 uv add anthropic 添加 SDK。虚拟环境会自动创建，pyproject.toml 和
      uv.lock 也会同步更新。脚本无需通过 source 激活环境，直接用 uv run main.py 即可运行。
  - question: uv 实际有多快？
    answer: >-
      实测中，包含 anthropic 在内的 16 个包首次安装耗时 0.874 秒，uv init 为 0.435 秒。在有缓存的情况下，用 uv
      sync 重新安装 19 个包仅需 0.074 秒。同样的操作用 pip 通常要花 20 到 40 秒。
  - question: 使用 uv 有哪些注意事项或局限？
    answer: >-
      截至 2026 年 uv 仍处于 v0.11，属于 v0.x 阶段，大型组织迁移现有工作流前需要考虑学习成本。由于它基于 PyPI，无法直接处理
      torch、CUDA 等需要从 conda 渠道安装的 ML 库，这类情况仍需配合使用 conda。
---

直到去年，我每次启动AI项目都要重复同样的仪式：`python -m venv .venv`、`source .venv/bin/activate`、`pip install anthropic openai`……然后等待。有时超过两分钟。看着anthropic、torch、pydantic一个接一个地下载。

上下文切换的代价相当可观。每次创建新的实验分支，环境搭建都会打断工作流。"在我机器上能跑"的问题也久治不愈。

后来我开始使用`uv`，一个用Rust编写的Python包管理器，出自开发了Ruff的Astral团队。今天搭建Claude SDK项目时我顺手测了一下：安装包含`anthropic`在内的16个包只用了**0.874秒**。用pip的话，同样的操作要花20〜40秒。

下面就是这次测量的完整复盘。基于uv 0.11，从一个空目录开始，一路走到项目初始化、Claude SDK安装、再到CI。

## pip、Poetry、conda的问题到底出在哪里

说实话，pip本身没有问题。它是一个经受了数十亿包下载考验的成熟工具。问题在于<strong>速度与环境隔离</strong>的组合。

pip在AI开发环境中慢的原因是结构性的：它顺序解析包，无法高效缓存已下载的文件。执行`pip install anthropic openai torch`时，获取每个包的元数据、解析依赖关系、检查冲突这些步骤是串行进行的。

Poetry在依赖管理方面好得多——基于`pyproject.toml`的声明式配置，支持锁文件。但Poetry本身用Python编写，速度有上限，而且环境出问题时调试相当麻烦。

conda在Python版本管理方面有优势，但环境本身容易膨胀到好几GB，在Docker CI中使用也不方便。

uv用Rust编写，在并行下载和缓存利用上有根本性的性能差异。今天的实测数据：

```
uv init claude-agent-demo         →  0.435秒
uv add anthropic                  →  0.874秒（16个包，含pydantic-core 1.9MB）
uv add openai httpx python-dotenv →  0.555秒（新增3个包）
uv sync（缓存命中，19个包）         →  0.074秒（29ms完成安装）
```

## 动手前要确认的，其实只有操作系统

安装uv几乎没有任何先决条件。按操作系统确认以下内容即可：

- **macOS/Linux**：`curl`或Homebrew
- **Windows**：PowerShell
- 不需要预先安装Python。uv可以直接管理Python版本

最后这点很重要。你不需要pyenv、conda或特定的系统Python版本。

## Step 1：安装uv

macOS和Linux只需一行命令：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

也可以用Homebrew：

```bash
brew install uv
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

安装后验证版本：

```bash
uv --version
# uv 0.11.11 (ed7b06001 2026-05-06)
```

截至今天（2026-05-07），0.11.11是最新版本。Astral发布节奏很快，`uv self update`可以随时升级到最新版。

## Step 2：初始化AI项目

```bash
uv init claude-agent-demo
cd claude-agent-demo
```

输出：

```
Initialized project `claude-agent-demo` at `/path/to/claude-agent-demo`
```

0.435秒完成。生成的文件结构：

```
claude-agent-demo/
├── main.py
├── pyproject.toml
└── README.md
```

自动生成的`pyproject.toml`：

```toml
[project]
name = "claude-agent-demo"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []
```

`pyproject.toml`是Python生态系统的标准项目文件。与`requirements.txt`不同，它既是开发的配置源，也是打包的元数据文件。

这时顺便设置`.env`文件：

```bash
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-api-key-here
EOF
```

## Step 3：添加Claude SDK

```bash
uv add anthropic
```

今天测试时的实际安装日志：

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

尽管pydantic-core有1.9MB，整个安装过程只用了0.874秒。这是没有缓存的首次安装数据。

同时添加多个SDK同样快速：

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

0.555秒。anthropic和openai都依赖`httpx`，uv正确处理了这种共享依赖，没有重复安装。依赖冲突管理正是pip经常悄悄升降级包的地方，有时你根本不会注意到，直到出了问题。

`pyproject.toml`自动更新：

```toml
[project]
dependencies = [
    "anthropic>=0.100.0",
    "openai>=2.35.1",
    "httpx>=0.28.1",
    "python-dotenv>=1.2.2",
]
```

## Step 4：运行第一个Claude脚本

编写`main.py`：

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
            {"role": "user", "content": "用一句话解释uv为什么比pip快。"}
        ]
    )
    
    print(message.content[0].text)

if __name__ == "__main__":
    main()
```

运行：

```bash
uv run main.py
```

`uv run`的核心优势：<strong>不需要手动激活虚拟环境</strong>。不用`source .venv/bin/activate`，uv会自动注入项目环境。首次运行约1.675秒（包含环境检查），之后从缓存中启动会更快。

如果想在不调用API的情况下验证导入：

```bash
uv run python -c "import anthropic; print(anthropic.__version__)"
# 0.100.0
```

如果你想进一步使用Vercel AI SDK实现Claude流式代理，项目搭建方式完全相同。用`uv add`添加所需SDK，再用`uv run`执行入口文件。

## Step 5：Python版本管理

uv被低估的功能之一是Python版本管理。不需要pyenv，只用uv就能安装和切换多个Python版本。

查看可用版本列表：

```bash
uv python list
```

我机器上的部分输出：

```
cpython-3.15.0a8-macos-aarch64-none      <download available>
cpython-3.14.5rc1-macos-aarch64-none     <download available>
cpython-3.13.13-macos-aarch64-none       <download available>
cpython-3.13.11-macos-aarch64-none       /opt/homebrew/bin/python3.13
cpython-3.12.8-macos-aarch64-none        /usr/local/bin/python3.12
```

创建指定Python版本的项目：

```bash
uv init my-project --python 3.13
```

为现有项目固定Python版本：

```bash
uv python pin 3.12
```

这会生成`.python-version`文件，确保团队所有成员使用相同的Python版本。uv一个工具就能替代pyenv + virtualenv + pip的组合。

## Step 6：团队协作与CI/CD集成

将`uv.lock`提交到git。有了这个文件，任何环境中克隆仓库后都能安装完全相同的包版本。

克隆后：

```bash
git clone <repo-url>
cd my-project
uv sync
```

今天我把`.venv`整个删掉，再跑了一次`uv sync`，结果是这样：

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 21 packages in 0.66ms
Installed 19 packages in 29ms
```

<strong>0.074秒</strong>。有缓存的情况下就是这个速度。在CI中挂载缓存，可以大幅缩短构建时间。

![uv sync运行日志：19个包在0.074秒内完成安装](../../../assets/blog/uv-python-ai-development-setup-guide-2026-sync-log.png)

GitHub Actions配置示例：

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

官方提供了`astral-sh/setup-uv` action，自动处理CI缓存。用Python构建MCP服务器时也可以直接套用这个CI模式。先用`uv add fastmcp`添加依赖（详见[FastMCP服务器构建指南](/zh/blog/zh/fastmcp-python-mcp-server-build-guide-2026)），再在GitHub Actions中用`uv sync`安装。

## 用uv tool管理CLI工具

uv还负责CLI工具的安装，替代了`pipx`的角色。

```bash
# 将ruff安装为全局CLI工具
uvx ruff check .

# 无需安装，一次性运行（类似npx）
uvx --from httpie http https://api.anthropic.com/v1/models

# 永久安装
uv tool install ruff
uv tool install black
```

`uvx`是无需安装即可立即执行的方式。需要使用特定版本时：

```bash
uvx ruff@0.4.0 check .       # 指定版本
uvx --python 3.12 mypy .     # 指定Python版本
```

AI开发中常用工具的安装示例：

```bash
uv tool install ruff          # 代码检查/格式化
uv tool install mypy          # 类型检查
uv tool install pytest        # 测试运行
uv tool install pre-commit    # git钩子管理
```

## 实战中遇到的边缘情况

**将现有requirements.txt项目迁移到uv**：

```bash
# 已有requirements.txt的现有项目
uv pip install -r requirements.txt
```

uv支持`pip`子命令。无法完全迁移时，可以用`uv pip install`与现有工作流并用。

**开发专用依赖管理**：

```bash
# 添加开发组
uv add --dev pytest ruff mypy

# 生产安装时排除dev
uv sync --no-dev
```

**Anthropic SDK的可选依赖**：

```bash
# 添加Amazon Bedrock支持
uv add "anthropic[bedrock]"

# 添加Vertex AI (GCP)支持
uv add "anthropic[vertex]"
```

## 依赖树查看与调试

了解哪些包因何安装：

```bash
uv tree
```

输出：

```
claude-agent-demo v0.1.0
├── anthropic v0.100.0
│   ├── anyio v4.13.0
│   ├── httpx v0.28.1
│   ├── pydantic v2.13.4
│   └── ...
└── openai v2.35.1
    └── ...
```

比`pip show`直观得多。`(*)`标记表示该包已被其他包共享。

删除包：

```bash
uv remove openai
```

锁文件自动更新。

## 什么时候用 uv，什么时候避开

快不代表在所有场景都是最优解。在不同项目上分别试用之后，我大致是这样划线的。

**适合用 uv 的情况**

- 依赖完全是纯 PyPI 的 AI 代理项目，比如 Claude SDK、OpenAI SDK。依赖树干净，uv 的优势能直接体现出来。
- CI/CD 构建时间是瓶颈的项目。`uv sync` 命中缓存的 0.074 秒，相比 pip 是实打实的差距。
- 团队成员 Python 版本各不相同、频繁出现"在我机器上能跑"的情况。`uv python pin` 一行就能统一。
- 不想分别管理 pipx、pyenv、venv 的个人开发者。一个工具就覆盖了这三者。

**保留 pip 更稳妥的情况**

- 已经跑得很好的遗留项目。如果 `requirements.txt` 和内部部署脚本都绑在 pip 上，没必要特意去动它。迁移成本可能超过速度收益。
- 公司政策固定了工具链，引入新二进制需要繁琐审批的环境。

**保留 Poetry 更稳妥的情况**

- 把库发布到 PyPI 的包项目。如果 Poetry 的构建/发布流程已经成熟、团队也很熟悉，迁到 uv 的实际收益不大。（不过 uv 同样支持构建与发布，所以全新的库项目里 uv 也是候选。）

**必须用 conda 的情况**

- 依赖 torch、CUDA、tensorflow 等从 conda 频道构建的二进制的深度学习项目。uv 基于 PyPI，无法直接触及这一层。如果核心就是匹配 CUDA 版本，conda（或 conda 与 uv 并用）才是现实路径。

一句话总结：**调用 API 的代理/后端类 Python 项目，从 uv 起步；深度绑定 GPU 二进制的 ML 训练项目，从 conda 起步。** 库选型的视角我在[Python AI 代理库对比](/zh/blog/zh/python-ai-agent-library-comparison-2026)里讲得更细，而构建类型安全代理时的依赖选择，可以参考[Pydantic AI 类型安全代理教程](/zh/blog/zh/pydantic-ai-type-safe-agent-tutorial-2026)。

## 坦率地说，uv还有几处帮不上忙

仅看性能，uv几乎是完美的工具，但有几点需要诚实说明。

<strong>第一，生态系统成熟度。</strong>uv于2024年推出，截至今天已到v0.11，但仍是v0.x版本。对个人项目和新项目强烈推荐，但大型团队迁移现有Poetry或pip工作流时，需要考虑全团队的学习成本。

<strong>第二，与conda生态系统的兼容性。</strong>如果需要从conda频道安装torch、CUDA工具包或tensorflow，uv帮不上忙，因为它只支持PyPI。如果你的AI项目只是调用API、跑跑文本生成或Agent框架，纯PyPI依赖就够了，这点完全不影响。但需要指定CUDA版本的深度学习项目，可能仍然离不开conda。

<strong>第三，习惯`uv run`需要时间。</strong>把`python main.py`改成`uv run main.py`需要适应。好处是能防止团队成员忘记激活虚拟环境而用系统Python运行脚本的失误。

LLM编码环境优化那篇文章也有类似的观察：采用更快工具的难点往往不在工具本身，而在于改变团队习惯。

## 现在就能复制粘贴的命令速查

```bash
# 新建AI项目
uv init my-ai-project
cd my-ai-project

# 安装Claude SDK
uv add anthropic python-dotenv

# 一次添加多个SDK
uv add anthropic openai httpx

# 运行脚本（无需激活venv）
uv run main.py

# 基于锁文件同步团队环境
uv sync

# 指定Python版本创建项目
uv init my-project --python 3.13

# 查看依赖树
uv tree

# 删除包
uv remove openai

# 更新uv自身
uv self update
```

我现在启动新AI项目时，几乎下意识就会打`uv init`。找不到回到pip的理由。对于必须用conda的ML项目，选择还是必要的。

0.874秒不只是一个速度数字。实验越频繁，每次实验的摩擦越小，就会尝试更多。这最终会产出更好的代码。

## 参考资料（官方来源）

本文中的命令和行为，均以 uv 0.11 为基准、对照官方文档逐一核对。

- [uv 官方文档](https://docs.astral.sh/uv/) — uv 的完整功能与命令参考
- [astral-sh/uv GitHub 仓库](https://github.com/astral-sh/uv) — 源代码、发布说明、Issue 追踪
- [uv 安装指南](https://docs.astral.sh/uv/getting-started/installation/) — 各操作系统安装方式的官方文档
- [在 GitHub Actions 中使用 uv](https://docs.astral.sh/uv/guides/integration/github/) — CI 集成与 `astral-sh/setup-uv` action
- [Astral 官方文档中心](https://docs.astral.sh/) — uv、Ruff、ty 背后 Astral 团队的文档集

用 uv 把环境理顺之后，下一个自然的步骤是本地可观测性。如何在你刚搭好的环境之上接入 LLM 链路追踪，[Langfuse v3 自托管完整指南](/zh/blog/zh/langfuse-self-hosted-llm-tracing-setup-guide-2026)正好接着这一步展开。
