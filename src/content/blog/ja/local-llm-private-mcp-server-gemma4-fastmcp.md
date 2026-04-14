---
title: ローカルLLMでプライベートMCPサーバーを構築する — Gemma 4 + FastMCP 完全オフラインAIツールガイド
description: >-
  Ollama + Gemma 4 + FastMCPで、インターネットなしで動作するオフラインAIツールパイプラインの構築方法。
  医療・法律・金融環境でデータを外部に送らずMCPツールを使う実践実装ガイド。
pubDate: '2026-04-14'
heroImage: '../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg'
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - ローカルLLM
  - MCP
relatedPosts:
  - slug: mcp-server-build-practical-guide-2026
    score: 0.93
    reason:
      ko: 이 글에서 만든 FastMCP 서버의 구조를 더 깊이 이해하고 싶다면, FastMCP의 Streamable HTTP 트랜스포트와 Claude Code 연동까지 다룬 이전 글이 필수 선행 학습이다.
      ja: ここで構築するFastMCPサーバーの仕組みをより深く理解したいなら、Streamable HTTPトランスポートとClaude Code連携まで解説した前の記事が不可欠な予備知識だ。
      en: To deeply understand the FastMCP server we build here, the previous post covering Streamable HTTP transport and Claude Code integration is essential prerequisite reading.
      zh: 如果想深入理解本文构建的FastMCP服务器结构，之前那篇涵盖Streamable HTTP传输和Claude Code集成的文章是必读的先修内容。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.90
    reason:
      ko: Gemma 4가 함수 호출을 어느 수준까지 해내는지 직접 테스트한 결과가 있다. 이 글의 오케스트레이터가 Gemma 4 툴 콜링에 의존하는 만큼, 그 정확도 맥락을 알면 기대치 설정이 쉬워진다.
      ja: Gemma 4がどこまで関数呼び出しをこなせるか実際にテストした結果がある。このオーケストレーターがGemma 4のツールコーリングに依存している以上、その精度の文脈を知ると期待値設定が楽になる。
      en: There's hands-on test data showing how far Gemma 4's function calling actually goes. Since our orchestrator relies on Gemma 4 tool calling, understanding that accuracy context helps set realistic expectations.
      zh: 有实际测试数据显示Gemma 4的函数调用能做到哪种程度。由于我们的编排器依赖Gemma 4的工具调用，了解其准确度背景有助于设定合理预期。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.82
    reason:
      ko: 이 글의 로컬 MCP 파이프라인을 팀 단위로 확장하려면, MCP Gateway로 에이전트 트래픽을 제어하는 방법이 다음 단계가 된다.
      ja: この記事のローカルMCPパイプラインをチーム単位でスケールさせたいなら、MCP Gatewayでエージェントトラフィックを制御する方法が次のステップになる。
      en: If you want to scale this local MCP pipeline to team level, controlling agent traffic with MCP Gateway becomes the natural next step.
      zh: 如果想将本文的本地MCP管道扩展到团队规模，使用MCP Gateway控制智能体流量将成为下一步。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.78
    reason:
      ko: 로컬 환경이라고 MCP 보안 문제가 사라지지는 않는다. 30개의 CVE가 확인된 MCP 보안 위협과 강화 방법을 다룬 글에서 로컬 배포에서도 주의해야 할 벡터를 짚어볼 수 있다.
      ja: ローカル環境だからといってMCPのセキュリティ問題が消えるわけではない。30のCVEが確認されたMCPセキュリティ脅威と強化方法を扱った記事で、ローカルデプロイでも注意すべきベクターを確認できる。
      en: Being local doesn't make MCP security issues disappear. The post covering 30 confirmed CVEs in MCP threats and hardening methods shows attack vectors that still apply to local deployments.
      zh: 在本地环境并不意味着MCP安全问题消失了。那篇涵盖30个已确认CVE的MCP安全威胁和加固方法的文章，展示了本地部署中仍需注意的攻击向量。
  - slug: ggml-llamacpp-huggingface
    score: 0.75
    reason:
      ko: Ollama 말고 llama.cpp를 직접 쓰고 싶거나, GGUF 포맷의 다른 로컬 모델로 바꿔보고 싶다면, GGML과 llama.cpp 생태계를 다룬 이 글이 참고가 된다.
      ja: Ollamaではなくllama.cppを直接使いたい、またはGGUFフォーマットの別のローカルモデルに変えてみたいなら、GGMLとllama.cppのエコシステムを扱ったこの記事が参考になる。
      en: If you want to use llama.cpp directly instead of Ollama, or swap in a different local model in GGUF format, this post covering the GGML and llama.cpp ecosystem is a useful reference.
      zh: 如果想直接使用llama.cpp而不是Ollama，或者换用GGUF格式的其他本地模型，这篇介绍GGML和llama.cpp生态系统的文章是很好的参考。
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
