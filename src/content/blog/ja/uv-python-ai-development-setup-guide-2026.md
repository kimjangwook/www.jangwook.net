---
title: uvでAI開発環境を構築する — Claude SDKプロジェクトを0.87秒で始める方法
description: >-
  RustベースのPythonパッケージマネージャーuv 0.11でanthropicやopenaiなどのAI
  SDK開発環境を設定する完全実践ガイド。pip比100倍以上の高速インストール、再現性の高い環境管理、Claude
  SDKプロジェクトの初期化まで実ログで丁寧に解説します。
pubDate: '2026-05-07'
heroImage: ../../../assets/blog/uv-python-ai-development-setup-guide-2026-hero.png
tags:
  - Python
  - uv
  - Claude API
  - 開発環境
  - AI開発
relatedPosts:
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: langfuse-self-hosted-llm-tracing-setup-guide-2026
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: mcp-servers-toolkit-introduction
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
---

去年まで、AIプロジェクトを始めるたびに同じ手順を繰り返していた。`python -m venv .venv`、`source .venv/bin/activate`、`pip install anthropic openai`……そして待った。長いときは2分以上。anthropic、torch、pydanticといったパッケージが順番にダウンロードされるのをただ眺めながら。

コンテキストスイッチのコストは意外と大きい。新しい実験ブランチを作るたびに、環境セットアップがフローを断ち切った。「自分のPCでは動いたのに」問題も消えなかった。

そんなとき`uv`を使い始めた。Rustで作られたPythonパッケージマネージャーで、Ruffを開発したAstralチームの作品だ。今日Claude SDKプロジェクトをセットアップしながら実際に計測してみたところ — `anthropic`を含む16パッケージのインストールに**0.874秒**かかった。pipなら20〜40秒はかかっていた作業だ。

この記事はuv 0.11をベースに、AI開発環境をゼロから構築する完全実践ガイドだ。

## なぜ今uvなのか — pip、Poetry、condaの何が問題か

正直なところ、pip自体が問題なわけではない。何十億ものパッケージをダウンロードしてきた実績ある道具だ。問題は<strong>速度と環境の分離</strong>の組み合わせにある。

AI開発環境でpipが遅い理由は構造的だ。パッケージを逐次的に解決し、ダウンロード済みファイルを効率的にキャッシュできない。`pip install anthropic openai torch`を実行すると、各パッケージのメタデータ取得、依存関係の解決、競合確認がシリアルに走る。

Poetryは依存関係管理の面でずっと優れている。`pyproject.toml`ベースの宣言的設定、ロックファイルのサポート。ただしPoetry自体がPythonで書かれているため速度に限界があり、環境が壊れたときのデバッグがかなり面倒になる。

condaはPythonバージョン管理に強みがあるが、環境自体が数ギガバイトに膨れあがりがちで、Docker CIで使いづらい。

uvはRustで書かれているため、並列ダウンロードとキャッシュ活用で根本的に異なる性能を発揮する。今日実際に計測した結果:

```
uv init claude-agent-demo    →  0.435秒
uv add anthropic             →  0.874秒（16パッケージ、pydantic-core 1.9MB含む）
uv sync（キャッシュヒット時）   →  0.074秒（19パッケージを29msでインストール）
```

## Prerequisites — インストール前の確認

uvのインストールに必要なものはほぼない。OSごとに以下を確認するだけだ。

- **macOS/Linux**: `curl`またはHomebrew
- **Windows**: PowerShell
- Pythonを事前にインストールしなくてよい。uvが直接管理できる

Pythonバージョンの要件がないという点が大きなメリットだ。uvはPythonインタープリター自体をダウンロードして管理できるため、システムのPythonバージョンを気にする必要がない。

## Step 1: uvのインストール

macOSとLinuxは公式インストールスクリプト一行で完了する。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Homebrewを使うなら:

```bash
brew install uv
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

インストール後のバージョン確認:

```bash
uv --version
# uv 0.11.11 (ed7b06001 2026-05-06)
```

現時点での最新は0.11.11だ。2026-05-06ビルド。Astralのリリースサイクルは速く、`uv self update`でいつでも最新版に更新できる。

## Step 2: AIプロジェクトの初期化

`uv init`で新しいプロジェクトを作る。

```bash
uv init claude-agent-demo
cd claude-agent-demo
```

実行結果:

```
Initialized project `claude-agent-demo` at `/path/to/claude-agent-demo`
```

0.435秒で完了する。生成されるファイル構造:

```
claude-agent-demo/
├── main.py
├── pyproject.toml
└── README.md
```

`pyproject.toml`がデフォルトで生成される:

```toml
[project]
name = "claude-agent-demo"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []
```

`.env`ファイルもこのタイミングで設定しておくとよい:

```bash
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-api-key-here
EOF
```

## Step 3: Claude SDKの追加

```bash
uv add anthropic
```

実際の実行ログ:

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

`pydantic-core`が1.9MBあるにもかかわらず、全体のインストールが0.874秒で完了した。キャッシュなしの初回インストール基準だ。

複数のSDKをまとめて追加する場合も同様に速い:

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

0.555秒。anthropicとopenaiが同じ`httpx`を依存関係として共有しているが、uvは重複なく必要なものだけを追加した。この依存関係の衝突管理はpipでしばしば予期しないバージョン変更を引き起こすポイントだ。

## Step 4: 最初のClaudeスクリプトを実行する

`main.py`を作成する:

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
            {"role": "user", "content": "uvがpipより速い理由を一言で説明してください。"}
        ]
    )
    
    print(message.content[0].text)

if __name__ == "__main__":
    main()
```

実行:

```bash
uv run main.py
```

`uv run`の最大のメリットは<strong>virtualenvを直接アクティベートしなくてよい</strong>点だ。`source .venv/bin/activate`なしでもプロジェクト環境でスクリプトが実行される。

[Vercel AI SDKを使ったClaudeストリーミングエージェント実装](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)も同じアプローチで始められる。PythonプロジェクトならuVの方がはるかに速い。

## Step 5: Pythonバージョン管理

uvの隠れた強みのひとつがPythonバージョン管理だ。pyenvなしにuvだけで複数のPythonバージョンをインストールして切り替えられる。

インストール可能なバージョン一覧:

```bash
uv python list
```

出力の一部:

```
cpython-3.15.0a8-macos-aarch64-none      <download available>
cpython-3.14.5rc1-macos-aarch64-none     <download available>
cpython-3.13.13-macos-aarch64-none       <download available>
cpython-3.13.11-macos-aarch64-none       /opt/homebrew/bin/python3.13
cpython-3.12.8-macos-aarch64-none        /usr/local/bin/python3.12
```

特定バージョンでプロジェクトを作成:

```bash
uv init my-project --python 3.13
```

既存プロジェクトでPythonバージョンをピン:

```bash
uv python pin 3.12
```

これで`.python-version`ファイルが生成され、チーム全員が同じPythonバージョンを使うようになる。

## Step 6: チーム協業とCI/CDでの活用

`uv.lock`ファイルをgitにコミットする。このファイルがあればどんな環境でも完全に同一のパッケージバージョンでインストールされる。

チームメンバーやCIでプロジェクトをクローンした後:

```bash
git clone <repo-url>
cd my-project
uv sync
```

今日実際にテストした結果 — `.venv`を削除して`uv sync`を実行:

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 21 packages in 0.66ms
Installed 19 packages in 29ms
```

<strong>0.074秒</strong>。キャッシュがあればこのくらいだ。

![uv syncの実行ログ: 19パッケージを0.074秒でインストール](../../../assets/blog/uv-python-ai-development-setup-guide-2026-sync-log.png)

GitHub Actions設定例:

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

[PythonでMCPサーバーを構築する](/ja/blog/ja/mcp-server-build-practical-guide-2026)際も同じCIパターンが使える。FastMCPの依存関係を`uv add fastmcp`で追加し、GitHub Actionsで`uv sync`インストールすれば一貫したビルド環境を維持できる。

## uv toolでCLIツールを管理する

uvはパッケージマネージャー以外にCLIツールのインストールも担う。`pipx`の役割を置き換えるものだ。

```bash
# ruffをグローバルCLIツールとしてインストール
uvx ruff check .

# インストールなしで一回限りの実行（npx方式）
uvx --from httpie http https://api.anthropic.com/v1/models

# 恒久インストール
uv tool install ruff
uv tool install black
```

`uvx`はインストールなしで即座に実行する方式だ。特定バージョンのツールを使う必要がある場合:

```bash
uvx ruff@0.4.0 check .       # バージョン指定
uvx --python 3.12 mypy .     # Python バージョン指定
```

AI開発でよく使うツールのインストール例:

```bash
uv tool install ruff          # コードリンター/フォーマッター
uv tool install mypy          # 型チェック
uv tool install pytest        # テスト実行
uv tool install pre-commit    # gitフック管理
```

## 実務で遭遇するエッジケース

**既存のrequirements.txtプロジェクトをuvに移行する場合**:

```bash
# requirements.txtのある既存プロジェクト
uv pip install -r requirements.txt
```

uvは`pip`サブコマンドもサポートする。完全移行が難しい状況でも`uv pip install`で既存ワークフローと併用できる。

**開発専用依存関係の管理**:

```bash
# 開発用グループを追加
uv add --dev pytest ruff mypy

# 本番インストール時にdevを除外
uv sync --no-dev
```

**Anthropic SDKのオプション依存関係**:

```bash
# Amazon Bedrock サポートを追加
uv add "anthropic[bedrock]"

# Vertex AI (GCP) サポートを追加
uv add "anthropic[vertex]"
```

## 依存関係ツリーとデバッグ

どのパッケージがなぜインストールされたか把握するには:

```bash
uv tree
```

出力:

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

`pip show`よりはるかに直感的だ。`(*)`表示はすでに他のパッケージと共有中であることを意味する。

パッケージを削除する場合:

```bash
uv remove openai
```

ロックファイルも自動で更新される。

## 正直なところ — uvの惜しい点

パフォーマンスだけ見ればほぼ完璧なツールだが、いくつか注意すべき点がある。

<strong>第一に、エコシステムの成熟度。</strong>uvは2024年に登場し、2026年現在v0.11まで来た。まだv0.xだ。個人プロジェクトや新規プロジェクトには強くお勧めするが、大規模な組織が既存のPoetry/pipワークフローを切り替える場合、チーム全体の学習コストを考慮する必要がある。

<strong>第二に、condaエコシステムとの互換性。</strong>torch、CUDA、tensorflowなどのMLライブラリをcondaチャンネルからインストールしなければならないケースがある。uvはPyPIベースのため、conda-forgeパッケージを直接インストールできない。純粋なPyPI依存関係だけなら問題ないが、CUDAバージョン合わせが必要なディープラーニングプロジェクトでは、まだcondaを併用しなければならない状況が生じる。

<strong>第三に、`uv run`への慣れ。</strong>`python main.py`の代わりに`uv run main.py`と打つ習慣に変える必要がある。チームメンバーが`source .venv/bin/activate`を忘れてシステムPythonでスクリプトを実行するミスを防ぐ効果はあるのだが。

[LLMコーディング環境の最適化](/ja/blog/ja/llm-coding-harness-optimization)を扱った記事でも同様の観察をしたが、ツール自体よりチームの習慣変更の方が難しい。

## まとめ: すぐ使えるコマンドレシピ

```bash
# 新しいAIプロジェクト開始
uv init my-ai-project
cd my-ai-project

# Claude SDKインストール
uv add anthropic python-dotenv

# 複数SDKを一度に追加
uv add anthropic openai httpx

# スクリプト実行（venvアクティベート不要）
uv run main.py

# チーム同期（uv.lockベース）
uv sync

# Pythonバージョン指定
uv init my-project --python 3.13

# 依存関係ツリー確認
uv tree

# パッケージ削除
uv remove openai

# uv自体の更新
uv self update
```

私は今、新しいAIプロジェクトを始めるとき、ほぼ自動的に`uv init`と打っている。pipに戻る理由が見つからない。condaが必須のMLプロジェクトではまだ選択の余地が必要だが。

0.874秒は単なる速度の話ではない。実験を頻繁にするほど、実験ごとの摩擦が少ないほど、より多くを試みるようになる。それが結局より良いコードにつながる。
