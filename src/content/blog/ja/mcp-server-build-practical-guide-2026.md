---
title: MCPサーバーを自分で作る — Streamable HTTPトランスポートで実際のAIツールを実装する
description: >-
  Python FastMCPでMCPサーバーをゼロから構築する実践チュートリアル。Streamable
  HTTPトランスポートの設定、ツール実装、Claude Code連携まで実際に試した経験をまとめました。
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/mcp-server-build-practical-guide-2026-hero.jpg
tags:
  - MCP
  - Python
  - AIエージェント
  - FastMCP
  - チュートリアル
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-code-wiki-guide
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: multi-agent-swe-bench-verdent
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

MCPサーバーを「使う」記事は山ほどあるが、「自分で作る」記事は意外と少ない。

公式ドキュメントはあるものの、2025年末からStreamable HTTPトランスポートが標準として定着し、古いSSE(Server-Sent Events)方式のサンプルが半ば時代遅れになった。最初に試したとき、`uvicorn`を別途インストールする案内がなくて結構ハマった。

この記事は、その経験をもとに<strong>2026年時点で動作するMCPサーバー構築の手順</strong>を最初から整理したものだ。特にStreamable HTTPトランスポートの設定と、Claude Codeとの連携部分に絞って解説する。

## なぜ自分で作るのか

[MCPサーバーツールキット完全ガイド](/ja/blog/ja/mcp-servers-toolkit-introduction)で紹介したように、すでに何百もの公開MCPサーバーが存在する。それでも自分で作るべき理由がある。

まず、社内システムとの連携。公開サーバーが社内のJIRA、ビルドシステム、デプロイパイプラインを知るはずがない。

次に、細かいアクセス制御。公開サーバーは「全許可」か「全拒否」のどちらかが多い。特定チームだけが使えるツール、特定環境でしか実行できないコマンドなどを実装するには自作が必要だ。

最後に、ロジックが複雑な場合。複数のAPIを組み合わせて一つの「ツール」として包みたいとき、既存サーバーを改造するより新規作成の方が早い。

## 環境構築

```bash
# Python 3.11以上推奨
python --version

# FastMCPインストール (MCP Python SDKの高レベルインターフェース)
pip install fastmcp

# Streamable HTTPトランスポートに必要なASGIサーバー
pip install uvicorn
```

FastMCPは`mcp`パッケージに含まれる高レベルAPIだ。低レベルの`Server`クラスを直接使うことも可能だが、ほとんどのケースでFastMCPで十分だ。

## 最初のMCPサーバー: 最小構成

```python
# server.py
from fastmcp import FastMCP

mcp = FastMCP("my-first-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """
    テキストの単語数、文字数、行数を返します。

    Args:
        text: 分析するテキスト文字列
    """
    words = text.split()
    lines = text.splitlines()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(lines),
        "avg_word_length": round(sum(len(w) for w in words) / len(words), 1) if words else 0
    }

@mcp.tool()
def format_list(items: list[str], style: str = "bullet") -> str:
    """
    文字列のリストを指定した形式に変換します。

    Args:
        items: 変換する文字列のリスト
        style: 'bullet'(デフォルト)、'numbered'、'comma' のいずれか
    """
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    else:
        return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    mcp.run()
```

このままだとstdioトランスポートで実行される。Claude Desktopに直接接続する場合はこの方式でも動くが、ネットワーク越しに複数クライアントが接続するにはStreamable HTTPが必要だ。

## Streamable HTTPトランスポートへの切り替え

```python
# server_http.py
from fastmcp import FastMCP

mcp = FastMCP("my-http-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """テキスト統計を返します。"""
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(text.splitlines())
    }

@mcp.tool()
def format_list(items: list[str], style: str = "bullet") -> str:
    """リストを指定形式に変換します。"""
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    # Streamable HTTPで起動: デフォルトポート8000
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

実行:

```bash
python server_http.py
# INFO:     Started server process [12345]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

デフォルトエンドポイントは `http://localhost:8000/mcp/` だ。このパスは `FastMCP` 初期化時の `streamable_http_path` パラメータで変更できる。

## Claude Codeとの連携

Claude CodeのMCP設定ファイル(`~/.claude/settings.json`)に追加:

```json
{
  "mcpServers": {
    "my-tools": {
      "transport": {
        "type": "streamable-http",
        "url": "http://localhost:8000/mcp/"
      }
    }
  }
}
```

Claude Codeを再起動すると、`my-tools`サーバーに登録されたツールが使えるようになる。

実際に接続テストをすると、最初にCORSエラーが出ることがある。FastMCPのデフォルトCORS設定が`localhost`オリジンのみ許可しているためで、以下で解決できる:

```python
from fastmcp import FastMCP

mcp = FastMCP(
    "my-http-server",
    # 開発環境での設定
    allowed_origins=["http://localhost:*"]
)
```

本番環境ではワイルドカードの代わりに、実際にClaude Codeが動くホストを明示すること。

## 実用的なツール実装例: GitHub Issue取得

個人的に最もよく使うパターンは、外部APIをMCPツールとしてラップすることだ。GitHub APIを例にとると:

```python
import httpx
from fastmcp import FastMCP
import os

mcp = FastMCP("github-tools")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

@mcp.tool()
async def get_open_issues(owner: str, repo: str, limit: int = 10) -> list[dict]:
    """
    GitHubリポジトリのオープンIssue一覧を取得します。

    Args:
        owner: リポジトリオーナー (例: 'anthropics')
        repo: リポジトリ名 (例: 'claude-code')
        limit: 取得するIssue数 (デフォルト10、最大30)
    """
    limit = min(limit, 30)
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/issues",
            headers=headers,
            params={"state": "open", "per_page": limit}
        )
        resp.raise_for_status()
        issues = resp.json()

    return [
        {
            "number": issue["number"],
            "title": issue["title"],
            "url": issue["html_url"],
            "labels": [l["name"] for l in issue.get("labels", [])],
            "created_at": issue["created_at"]
        }
        for issue in issues
    ]

if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8000)
```

FastMCPは`async def`を自動で認識して非同期処理する。`httpx`のような非同期HTTPクライアントを使えば、I/O待機中に他のリクエストを処理できてパフォーマンスが向上する。

Claude Codeでこのツールを使うと、「anthropics/claude-codeのオープンIssueを10件見せて」という自然言語リクエストで`get_open_issues("anthropics", "claude-code", 10)`が自動的に呼ばれる。

## リソース(Resource)の追加

ツール(Tool)のほかに、リソース(Resource)も定義できる。静的またはほぼ静的なデータをAIに提供するのに便利だ:

```python
@mcp.resource("config://app-settings")
def get_app_settings() -> str:
    """アプリケーション設定情報を返します。"""
    return """
    環境: production
    APIバージョン: v2
    許可モデル: claude-opus-4, claude-sonnet-4
    最大トークン: 100000
    """
```

リソースはツールと異なり、AIが「読み取り」用途で参照できるコンテキストデータだ。

## 運用上の注意点

正直に言うと、Streamable HTTP MCPサーバーを本番環境に上げるのはまだ注意が必要な領域だ。

[MCP セキュリティ危機 — 60日で30のCVE](/ja/blog/ja/mcp-security-crisis-30-cves-enterprise-hardening)で触れたように、MCPエコシステムはセキュリティ面でまだ成熟していない。自作サーバーで特に注意すべき点:

<strong>認証未実装のリスク</strong>: FastMCPのデフォルト設定には認証がない。社内ネットワーク限定なら問題ないが、インターネットに公開する場合は必ずAPIキーやOAuthを追加すること。

```python
from fastmcp import FastMCP
from fastmcp.server.auth import BearerAuthProvider

auth = BearerAuthProvider(
    public_key="...",  # JWT検証用公開鍵
    issuer="https://auth.yourcompany.com"
)
mcp = FastMCP("secure-server", auth=auth)
```

<strong>入力検証</strong>: ユーザーの入力をシステムコマンドやクエリに直接渡さないよう注意が必要だ。Pydanticモデルで型を強制すると基本的な入力検証になる。

<strong>ロギング</strong>: どのAIエージェントがいつどのツールを呼んだか必ずログを残すこと。[MCP Gateway — AIエージェントのツール呼び出しを誰が制御するか](/ja/blog/ja/mcp-gateway-agent-traffic-control)で触れたように、エージェントトラフィックの監視は運用の必須要件だ。

## ローカルテスト方法

`mcp` CLIでサーバーの動作確認ができる:

```bash
# mcp CLIインストール
pip install "mcp[cli]"

# inspector UIを開く (ブラウザでツールを直接呼び出し可能)
mcp inspector server_http.py
```

`mcp inspector`を使うと、WebUIで登録済みツールの一覧を確認し、パラメータを直接入力してテストできる。Claude Codeに繋ぐ前にサーバーロジックを検証するのに便利だ。

## まとめ

MCPサーバーをゼロから作ってみると「思ったより簡単だ」と感じるはずだ。FastMCPのおかげで、デコレーターいくつかでツールを登録し、Streamable HTTPで起動するまで30分もあれば十分だ。

難しいのはサーバー自体ではなく、<strong>ツールの設計</strong>だ。AIが間違えないようにパラメータ型とdocstringを明確に書くこと、エラーをAIが理解できる形式で返すこと、一つのツールが多くの責務を持たないように分割すること — これが実際に感じる難しさだ。

公式のMCP Python SDKリポジトリ([github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk))にさまざまなサンプルがあるので、上記の例を実際に動かしてから参照するといいと思う。
