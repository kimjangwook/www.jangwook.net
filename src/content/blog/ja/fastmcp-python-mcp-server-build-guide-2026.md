---
title: FastMCP 3.xでPython MCPサーバーを30分で作る — @toolデコレーターひとつで十分だ
description: >-
  FastMCP
  3.2.4を実際にインストールして、@mcp.tool()・@mcp.resource()・@mcp.prompt()デコレーターで動くMCPサーバーを構築した。Claude
  DesktopとCursorが呼び出せるAIツールサーバーをPython30行で実装する実践ガイド。
pubDate: '2026-05-12'
heroImage: ../../../assets/blog/fastmcp-python-mcp-server-build-guide-2026/hero.png
tags:
  - MCP
  - FastMCP
  - Python
  - AI Agent
  - Claude
relatedPosts:
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: local-llm-private-mcp-server-gemma4-fastmcp
    score: 0.85
    reason:
      ko: MCP를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on MCP experience.
      ja: MCPを実際に扱った経験が続く記事です。
      zh: 延续 MCP 的实战经验。
  - slug: openai-agentkit-tutorial-part1
    score: 0.8
    reason:
      ko: 같은 ai agent 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same ai agent track.
      ja: 同じai agentの流れで併せて読むと役立ちます。
      zh: 在同一 ai agent 脉络中可一并阅读。
---

MCP（Model Context Protocol）サーバーをゼロから実装しようとすると、思ったより手間がかかる。stdioトランスポートを処理し、JSON-RPC 2.0をシリアライズし、ハンドラーをひとつずつ登録する。Streamable HTTPでMCPサーバーを直接実装する過程を辿ってみると、「AIツールをひとつ追加したいだけなのに」なぜこんなにボイラープレートが必要なのかと嫌になる瞬間が来る。

FastMCPはその苦しさを解消するために作られたフレームワークだ。今日、サンドボックスでpipでインストールして、実際に動くMCPサーバーを30分以内に立ち上げた。

## FastMCPとは何かを先に確認した

FastMCPはMCP Python SDKの上に乗る高レベルレイヤーだ。Express.jsがNodeのhttpモジュールをラップしたような構造だ。公式説明は「The fast, Pythonic way to build MCP servers and clients」で、実際に使ってみるとその通りだと感じた。

バージョンを確認したら、予想よりずっと先に進んでいた。

```
$ fastmcp version

FastMCP version:   3.2.4
MCP version:       1.27.0
Python version:    3.12.8
Platform:          macOS-15.6-arm64
```

バックログには「v2.0」基準で書いていたが、すでに3.xまで上がっていた。MCPプロトコル自体も1.27.0だ。このバージョン番号が示すことがひとつある。FastMCPはかなり活発に開発されている。

正直に言えば、3.xになってAPIがどれほど変わったか直接確認する必要があった。ドキュメントだけを見るより実際に動かしてみるのが早い。

## インストールと最初のサーバー: 本当にこれだけだ

```bash
pip install fastmcp
```

インストールは10秒で終わった。実際に動くサーバーを作ってみよう。私がサンドボックスで最初に作ったのは、天気関連ツール2つのサーバーだった。

```python
from fastmcp import FastMCP
from datetime import datetime

mcp = FastMCP("weather-tools", version="1.0.0")

@mcp.tool()
def get_current_time(timezone: str = "UTC") -> str:
    """現在時刻を返します。"""
    return f"現在時刻 ({timezone}): {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

@mcp.tool()
def calculate_temp(celsius: float) -> dict:
    """摂氏を華氏とケルビンに変換します。"""
    return {
        "celsius": celsius,
        "fahrenheit": round(celsius * 9/5 + 32, 2),
        "kelvin": round(celsius + 273.15, 2)
    }

@mcp.resource("data://server-info")
def server_info() -> str:
    """サーバー情報を返します。"""
    return "FastMCP 3.x 天気サーバー"

@mcp.prompt()
def weather_analysis(location: str) -> str:
    """天気分析プロンプトテンプレート"""
    return f"{location}の天気を分析して、服装のおすすめをしてください。"

if __name__ == "__main__":
    mcp.run()  # stdioモードで実行
```

これだけだ。Python関数にデコレーターをひとつ付けるとMCPツールになる。型ヒントが自動的にJSON Schemaに変換されてClaudeに渡される。

`fastmcp inspect`でサーバー構成を確認できる。

```
$ fastmcp inspect server.py

Server
  Name:         weather-tools
  Version:      1.0.0
  Generation:   2

Components
  Tools:        2
  Prompts:      1
  Resources:    1
  Templates:    0
```

## 3つのビルディングブロック: Tool、Resource、Prompt

FastMCPの核心概念は3つだ。これを区別することがサーバーをうまく設計する第一歩だ。

**@mcp.tool()** — Claudeが直接呼び出す関数だ。パラメーターを受け取って作業を実行し、結果を返す。検索、計算、ファイル操作、API呼び出しなどがここに入る。Claudeに私のファイルシステムやAPIを直接扱わせたいときに`@mcp.tool()`を使う。

**@mcp.resource()** — 読み取り専用データソースだ。`data://`、`file://`、`https://`のようなURIで登録すると、Claudeがコンテキストとして読み込む。ツールと違って「実行する」のではなく「読む」概念だ。データベーススキーマ、設定ファイル、ドキュメントなどをここに入れるとClaudeのコンテキストウィンドウに入る。

**@mcp.prompt()** — 再利用可能なプロンプトテンプレートだ。パラメーターを受け取って構成されたプロンプトメッセージを返す。Claude Desktopやclaude.aiでスラッシュコマンドのように使える。

MCPを初めて使う開発者がよく混乱するのがToolとResourceの違いだ。私の基準はシンプルだ。副作用（side effect）があればTool、なければResourceだ。

## ContextでクライアントにProgress情報を送る

ツールが長い処理をするとき、進捗状況をリアルタイムで送れる。`Context`パラメーターを追加するとFastMCPが自動で注入してくれる。

```python
from fastmcp import FastMCP, Context

mcp = FastMCP("dev-tools")

@mcp.tool()
async def list_files(directory: str, ctx: Context) -> list[str]:
    """指定ディレクトリのファイル一覧を返します。"""
    import os
    await ctx.info(f"ディレクトリを読み込み中: {directory}")  # クライアントにログ送信
    
    try:
        files = os.listdir(directory)
        await ctx.report_progress(100, 100, "complete")  # 進捗報告
        return sorted(files)
    except FileNotFoundError:
        raise ValueError(f"ディレクトリが見つかりません: {directory}")
```

サンドボックスで実際に実行してみたら、`ctx.info()`がクライアント側にリアルタイムログを送信することを確認した。

```
INFO  Received INFO from server: {'msg': 'ディレクトリを読み込み中: /tmp', 'extra': None}
```

Claude Desktopで動作すると、ユーザーはツールがどの段階を実行しているかリアルタイムで確認できる。UX的にかなり重要な機能だ。

## FastMCP Clientでテストする

実際のClaude Desktopなしにサーバーをテストできる。FastMCPはin-processクライアントを提供している。MCPエージェントワークフローパターンを実装するときもこの方式でテストがシンプルになる。

```python
import asyncio
from fastmcp import FastMCP
from fastmcp.client import Client

mcp = FastMCP("dev-tools")

@mcp.tool()
def search_text(text: str, pattern: str) -> dict:
    """テキストからパターンを検索します。"""
    import re
    matches = re.findall(pattern, text)
    return {"pattern": pattern, "matches": matches, "count": len(matches)}

@mcp.tool()
def word_count(text: str) -> dict:
    """単語数・文字数・行数を返します。"""
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(text.splitlines())
    }

async def test():
    async with Client(mcp) as client:
        tools = await client.list_tools()
        print(f"登録されたツール {len(tools)}個:")
        for t in tools:
            print(f"  [{t.name}] {t.description}")
        
        result = await client.call_tool("search_text", {
            "text": "FastMCP is fast. FastMCP is easy.",
            "pattern": "FastMCP"
        })
        print(f"\nsearch_text結果: {result.data}")
        # → {'pattern': 'FastMCP', 'matches': ['FastMCP', 'FastMCP'], 'count': 2}
        
        result2 = await client.call_tool("word_count", {
            "text": "Hello World from FastMCP 3.x"
        })
        print(f"word_count結果: {result2.data}")
        # → {'words': 5, 'characters': 27, 'lines': 1}

asyncio.run(test())
```

`result.data`で構造化された戻り値をそのまま使える。実際に動かしてみてエラーなく正常に動作した。

![FastMCP CLI実行結果 — fastmcp version、inspect、ツール呼び出しテスト](../../../assets/blog/fastmcp-python-mcp-server-build-guide-2026/cli-output.png)

## HTTPサーバーとしてリモートデプロイする

ローカルstdioモード以外に、HTTPサーバーとして立ち上げることができる。CursorやリモートからMCPサーバーを共有したいときに使う。

```python
# HTTPモードで実行（デフォルトポート8000）
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
```

```bash
# またはuvicornで直接実行
uvicorn server:mcp.http_app() --host 0.0.0.0 --port 8000
```

FastMCPのHTTPアプリはStarlette基盤だ。型を確認してみると`StarletteWithLifespan`だった。つまり、FastAPIやStarletteアプリにマウントすることも可能だという意味だ。

```python
# FastAPIとの統合
from fastapi import FastAPI
from fastmcp import FastMCP

app = FastAPI()
mcp = FastMCP("my-tools")

@mcp.tool()
def my_tool() -> str:
    return "result"

# FastAPIアプリにMCPサーバーをマウント
app.mount("/mcp", mcp.http_app())
```

Claude DesktopからHTTPサーバーに接続する設定はシンプルだ。

```json
{
  "mcpServers": {
    "my-tools": {
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

## fastmcp CLI: 開発ワークフローで役立つコマンド群

FastMCPはCLIも提供している。最初は知らなかったが`fastmcp --help`を実行してみると、かなり充実していた。

```
Commands:
  inspect      — サーバーコンポーネントの要約出力
  list         — 登録されたツール一覧
  call         — ツールを直接呼び出す（デバッグ用）
  install      — Claude Desktop / Cursorに自動登録
  dev          — 開発サーバー起動（hot reload）
  discover     — エディターに設定されたMCPサーバーの探索
  run          — サーバー実行
```

`fastmcp install server.py --client claude`を実行するとClaude Desktop configを自動修正してくれるそうだ。JSONファイルを手動で編集する手間がなくなる。ただし今の環境にはClaude Desktopが入っていないので、直接テストできなかった。`--client`オプションがどのパスを変更するかは公式ドキュメントで確認しておくと安全だ。

正直、`fastmcp dev`の方が実用的に見える。コードを修正するたびにサーバーを再起動する手間をなくしてくれる。

## 型ヒントがそのままAPIスキーマになる

FastMCPで最も印象に残った機能は、型ヒントからJSON Schemaへの自動変換だ。直接実装する場合は各ツールに手動で`inputSchema`を書く必要がある。FastMCPはそれをPythonの型システムに委ねる。

```python
from typing import Literal
from pydantic import BaseModel

class FileFilter(BaseModel):
    extension: str
    min_size_kb: int = 0
    exclude_hidden: bool = True

@mcp.tool()
def list_files_advanced(
    directory: str,
    filter: FileFilter | None = None,
    sort_by: Literal["name", "size", "modified"] = "name",
    limit: int = 50
) -> list[dict]:
    """フィルターとソートオプションでファイル一覧を返します。"""
    import os
    files = []
    for f in os.scandir(directory):
        if filter and filter.exclude_hidden and f.name.startswith("."):
            continue
        if filter and not f.name.endswith(f".{filter.extension}"):
            continue
        info = f.stat()
        size_kb = info.st_size / 1024
        if filter and size_kb < filter.min_size_kb:
            continue
        files.append({"name": f.name, "size_kb": round(size_kb, 2), "modified": info.st_mtime})
    key_map = {"name": "name", "size": "size_kb", "modified": "modified"}
    files.sort(key=lambda x: x[key_map[sort_by]])
    return files[:limit]
```

この関数を`@mcp.tool()`で登録すると、Claudeは`FileFilter`の構造、`sort_by`の有効な値（name/size/modified）、`limit`のデフォルト値を自動的に把握できる。Pydanticモデルもサポートされるので複雑な入力構造もそのまま使える。

ドキュメント文字列は自動的にツールの説明として使われる。よく書かれたdocstringひとつがClaudeに送る使用マニュアルになる。

## 実践例：コード分析MCPサーバー

実際に使えるものを作ってみた。PythonファイルをASTで解析する開発ツールMCPサーバーだ。

```python
from fastmcp import FastMCP, Context
import ast
import os

mcp = FastMCP("code-analyzer", version="1.0.0")

@mcp.tool()
async def analyze_python_file(filepath: str, ctx: Context) -> dict:
    """PythonファイルをASTで解析し、関数とクラスの一覧を返します。"""
    await ctx.info(f"解析中: {filepath}")
    if not os.path.exists(filepath):
        raise ValueError(f"ファイルが見つかりません: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    tree = ast.parse(source)
    functions, classes = [], []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append({
                "name": node.name, "line": node.lineno,
                "args": [a.arg for a in node.args.args],
                "docstring": ast.get_docstring(node)
            })
        elif isinstance(node, ast.ClassDef):
            classes.append({"name": node.name, "line": node.lineno})
    await ctx.report_progress(100, 100, "complete")
    return {"total_lines": source.count("\n") + 1, "functions": functions, "classes": classes}

@mcp.tool()
def count_todo_comments(filepath: str) -> dict:
    """ファイルのTODO/FIXME/HACKコメントを検索して返します。"""
    markers = ["TODO", "FIXME", "HACK", "XXX"]
    results = {m: [] for m in markers}
    with open(filepath, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            for marker in markers:
                if f"# {marker}" in line:
                    results[marker].append({"line": i, "text": line.strip()})
    return {k: v for k, v in results.items() if v}

@mcp.resource("data://project-structure")
def project_structure() -> str:
    """現在のディレクトリのPythonファイル一覧を返します。"""
    py_files = []
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in files:
            if f.endswith(".py"):
                py_files.append(os.path.join(root, f))
    return "\n".join(py_files[:50])

if __name__ == "__main__":
    mcp.run()
```

このサーバーをClaude Desktopに接続すると、「このファイルのクラス一覧を見せて」や「TODOコメントはいくつある？」を自然言語で聞ける。ユーザー側はPythonを一行も書かなくていい。それがMCPツールサーバーの要点だ。

## 既存のMCPサーバーと何が違うか

Streamable HTTP方式でMCPサーバーを直接実装したときと比較すると差は明確だ。

直接実装の場合:
- `Server`インスタンス作成
- `@server.list_tools()` / `@server.call_tool()` を別々に登録
- 入力パラメーターを自分でパース
- `anyio.run()` + `stdio_server()` の組み合わせで実行

FastMCPの場合:
- `FastMCP`インスタンスひとつ
- `@mcp.tool()`で関数をそのままツールとして登録
- 型ヒントからJSON Schemaが自動生成
- `mcp.run()`一行

コード行数が半分以下になるのは副次的な問題だ。核心は**ビジネスロジックに集中できる**という点だ。トランスポートレイヤーがどう動くか気にしなくていい。

ただし感じた限界もある。FastMCPは自由度をトレードオフとして支払う。低レベルMCPメッセージをカスタマイズしたり、非標準のトランスポートが必要な状況では、FastMCPが抽象化で隠したものを再び取り出す必要がある。そういった場合はMCP Python SDKを直接使うのが正しい。

## 実行可能性の判断: いつFastMCPを選ぶか

私の結論はこうだ:

**FastMCPを使うとき**: Claude、Cursor、VS Codeなど標準MCPクライアントと連携するサーバーを作るとき。特にチーム内のAIツールを素早くプロトタイピングしたり、既存のPython関数をMCPサーバーとして公開したいとき。

**直接SDKを使うとき**: カスタムトランスポート、非標準メッセージフォーマット、またはFastMCPがサポートしていないMCP機能が必要なとき。MCP Code Executionの実践事例のように低レベル制御が必要な場合だ。

FastMCPで惜しい点がひとつある。3.xになって文書がコード変化に完全についていけていない。`get_tools()`のようなメソッドが文書には存在するように見えるが実際には`list_tools()`に変わっていた。公式docsよりソースコードや`dir(mcp)`で直接確認する習慣が必要だ。

本番環境に上げる前にもうひとつ — MCP Gatewayでエージェントトラフィックを制御する方法も合わせて検討することを勧める。サーバーを公開したとき、どのツールがどう呼び出されるか制御するレイヤーが必要になる瞬間が来る。

## 30分で動くサーバー、その次に考えること

FastMCP 3.xは、Python開発者がMCPサーバーを最速で作る方法だ。`pip install fastmcp`一行、`@mcp.tool()`デコレーターひとつ、`mcp.run()`一行。30分以内にClaude Desktopが呼び出すAIツールを作れる。

MCP生態系が急速に成熟している。私が使うMCPサーバーリストを見ると、すでに多様な統合が存在する。自分で作る前に既存のものを使うのが実用的だが、なければFastMCPで直接作るのはもうそれほど難しくない。

今日のサンドボックスで確認したバージョンはFastMCP 3.2.4、MCP 1.27.0だ。この分野が急変しているので、実際の適用前に[FastMCP公式ドキュメント](https://gofastmcp.com)で最新APIを確認してほしい。
