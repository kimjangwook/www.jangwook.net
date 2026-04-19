---
title: ローカルLLMでプライベートMCPサーバーを構築する — Gemma 4 + FastMCP 完全オフラインAIツールガイド
description: >-
  Ollama + Gemma 4 + FastMCPで、インターネットなしで動作するオフラインAIツールパイプラインの構築方法。
  医療・法律・金融環境でデータを外部に送らずMCPツールを使う実践実装ガイド。
pubDate: '2026-04-14'
heroImage: ../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - ローカルLLM
  - MCP
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.5
    reason:
      ko: '선행 학습 자료로 유용하며, AI/ML 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、AI/MLの基礎を扱います。
      en: 'Useful as prerequisite knowledge, covering AI/ML fundamentals.'
      zh: 作为先修知识很有用，涵盖AI/ML基础。
  - slug: prismml-bonsai-1bit-llm-edge-ai
    score: 0.5
    reason:
      ko: '선행 학습 자료로 유용하며, AI/ML 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、AI/MLの基礎を扱います。
      en: 'Useful as prerequisite knowledge, covering AI/ML fundamentals.'
      zh: 作为先修知识很有用，涵盖AI/ML基础。
  - slug: claude-code-source-leak-analysis
    score: 0.5
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-emotion-concepts-llm-alignment
    score: 0.5
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: effloow-side-project-ai-company
    score: 0.5
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

「クラウドAIを使ってはいけない環境で働いている」という話を初めて聞いたとき、正直ピンとこなかった。でも病院の診療記録処理、法律文書のレビュー、金融顧客データの分析をするチームは、実際にけっこう多い。そういうチームに「ClaudeかGPTに貼り付けてみてください」は通用しない。

先週、[FastMCPでMCPサーバーを自作する記事](/ja/blog/ja/mcp-server-build-practical-guide-2026)を書いた。その記事でClaude Codeをクライアントとして接続する部分を扱ったのだが、その直後にこんな質問が来た。「Claudeの代わりにローカルLLMをクライアントとして使えますか?」

いい質問だった。試してみたかった。

この記事はその答えだ。Ollama + Gemma 4 + FastMCPで、インターネット接続なしに完全オフラインで動作するAIツールパイプラインを実際に構築してみた。

## まず構造を把握する

標準的なMCP構造はこうなっている。

```
[Claude / GPT-4] ←→ [MCPサーバー] ←→ [実際のツール]
```

クラウドLLMがMCPクライアントとして機能する。問題は、この場合プロンプトとコンテキストがAnthropicかOpenAIのサーバーを経由するということだ。

これから作る構造は違う。

```
[ユーザープロンプト]
        |
[Pythonオーケストレーター]
   ↙              ↘
[Ollama:11434]    [FastMCP:8000]
(Gemma 4)         (ローカルツール)
```

すべてがローカルで動く。OllamaがGemma 4をOpenAI互換APIとして提供し、FastMCPがツールサーバー役を担い、Pythonオーケストレーターが両者をつなぐ。

## Step 1: Ollama + Gemma 4 のセットアップ

[Gemma 4ローカルインストールの経験](/ja/blog/ja/gemma-4-local-agent-edge-ai)でも触れたように、インストール自体は一行だ。

```bash
ollama pull gemma4
```

この記事では関数呼び出し（function calling）を使う必要があるため、モデルが正しくロードされているか確認する。

```bash
ollama run gemma4 "次のJSONを返してください: {\"status\": \"ok\"}"
```

出力が正しいJSONであれば準備完了だ。Ollamaはデフォルトで`http://localhost:11434`でOpenAI互換APIを提供している。

```bash
# Ollama API動作確認
curl http://localhost:11434/v1/models
```

## Step 2: FastMCPサーバー（ツール提供側）

ローカルのファイルシステムを読み取り、ディレクトリを一覧表示するツールサーバーを作る。実際の業務では社内DBクエリや社内APIコールなどに置き換えられる。

```python
# local_tools_server.py
from fastmcp import FastMCP
import os

mcp = FastMCP("local-tools")

@mcp.tool()
def read_file(path: str) -> str:
    """指定したパスのファイル内容を読み取って返す。"""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@mcp.tool()
def list_directory(path: str = ".") -> list[str]:
    """ディレクトリのファイル一覧を返す。"""
    return os.listdir(path)

@mcp.tool()
def write_summary(path: str, content: str) -> str:
    """要約内容をファイルに保存する。"""
    summary_path = path.replace(".txt", "_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"保存完了: {summary_path}"

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="127.0.0.1", port=8000)
```

```bash
pip install fastmcp uvicorn
python local_tools_server.py
```

サーバーが`http://127.0.0.1:8000`で起動する。

## Step 3: オーケストレーターの実装

ここが核心だ。Gemma 4はMCPプロトコルを直接理解しない。オーケストレーターが:
1. FastMCPから使用可能なツール一覧を取得し
2. OpenAI function calling形式に変換して
3. Gemma 4に渡し
4. Gemma 4がツールコールを要求したらFastMCPを実行して結果を返す

```python
# orchestrator.py
import json
import requests
from openai import OpenAI

# Ollama OpenAI互換クライアント
llm = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Ollamaはキー不要、形式だけ合わせればよい
)

MCP_SERVER = "http://127.0.0.1:8000"

def get_mcp_tools() -> list[dict]:
    """FastMCPから使用可能なツール一覧を取得してOpenAI形式に変換。"""
    resp = requests.get(f"{MCP_SERVER}/tools")
    tools = resp.json().get("tools", [])
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("inputSchema", {"type": "object", "properties": {}}),
            },
        }
        for t in tools
    ]

def call_mcp_tool(name: str, args: dict) -> str:
    """FastMCPサーバーにツール実行を要求して結果を返す。"""
    resp = requests.post(
        f"{MCP_SERVER}/tools/{name}",
        json={"arguments": args},
    )
    result = resp.json()
    return json.dumps(result.get("content", [{"text": str(result)}]), ensure_ascii=False)

def run(user_prompt: str) -> str:
    tools = get_mcp_tools()
    messages = [
        {"role": "system", "content": "あなたは役に立つAIです。必要な場合は提供されたツールを使用してください。"},
        {"role": "user", "content": user_prompt},
    ]

    while True:
        resp = llm.chat.completions.create(
            model="gemma4",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            return msg.content  # 最終回答

        # ツールコール処理
        messages.append(msg)
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = call_mcp_tool(tc.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            })

if __name__ == "__main__":
    answer = run("現在のディレクトリのファイル一覧を教えて")
    print(answer)
```

## 実際に動かしてみると

```bash
python orchestrator.py
```

Gemma 4が`list_directory`ツールを呼び出し、FastMCPサーバーが結果を返し、Gemma 4がそれを整理して回答する。すべてのデータが自分のMac内だけで動く。

もう少し複雑なリクエストを試した。

```python
answer = run("README.mdファイルを読んで核心内容を3行で要約して")
```

Gemma 4は`list_directory` → `read_file("README.md")`の順でコールした。2回のツールコールを経て最終要約を生成した。時間がかかった（M2 Macで約12秒）。クラウドAPIに比べると遅い。

## 正直な限界

使ってみて感じたことだ。

**ツールコールの信頼性が低い。** Gemma 4は[関数呼び出しをある程度サポート](/ja/blog/ja/gemma-4-local-agent-edge-ai)しているが、引数を間違えたり存在しないツールを呼び出すケースが時々ある。ClaudeやGPT-4oに比べて安定性が劣る。これを補うにはオーケストレーターにリトライロジックとパラメーター検証を追加する必要がある。

**マルチステップでコンテキストを失う。** 3〜4回以上ツールコールが続くと、Gemma 4が元の目標を忘れるケースがあった。システムプロンプトに明示的に「最終目標: [X]」を書き込むのが効果的だった。

**速度。** 個人のMacで5〜15秒、応答の長さによってはさらにかかる。リアルタイムインタラクションには適さない。バッチ処理やバックグラウンド作業に使うのが現実的だ。

## どんな状況でこの構造を使うべきか

| 状況 | 選択 |
|------|------|
| 個人データ、社内文書、規制データ | ✅ この構造 |
| 素早い応答が必要なインタラクティブUI | ❌ クラウドAPI |
| インターネット接続のないエアギャップ環境 | ✅ この構造 |
| 複雑なマルチステップエージェントワークフロー | ⚠️ 限定的に可能 |
| コスト最小化（トラフィックなし） | ✅ この構造 |

個人的には、この構造を「AIの機能を持つローカルスクリプト」のアップグレードとして捉えている。シェルスクリプトやPythonスクリプトでやっていたファイル操作やデータ変換作業に自然言語インターフェースを付ける用途だ。完全なエージェントシステムというより、自動化スクリプトの次のステップに近い。

## 次のステップ

さらに発展させたいなら:
- **モデル交換**: Gemma 4の代わりにQwen3-7B、Mistral Smallなどより強力な関数呼び出し対応モデルに交換
- **ツール拡張**: 社内DB接続、REST APIラッパー、ファイル変換ツールを追加
- **チーム共有**: MCP Gatewayを前段に置いて複数人が同じローカルサーバーを使用

このパイプラインをプロダクションに持っていく際は、[MCPセキュリティ問題](/ja/blog/ja/mcp-security-crisis-30-cves-enterprise-hardening)もチェックしてほしい。ローカルであってもツールインジェクション、過剰な権限といったMCP特有のリスクはそのまま存在する。

コードはすべて上に記載している。インストール依存関係は`pip install fastmcp uvicorn openai requests`一つで済む。試して詰まる部分があれば、各ステップを個別にテストするのが近道だ。
