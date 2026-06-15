---
title: Claude Agent SDK 実践ガイド — Tool UseでAIエージェントが実際に行動するようにする方法
description: >-
  anthropic 0.101.0
  SDKを直接インストールしてtool_useエージェンティックループを実装した。JSONスキーマツール定義から複数ツール呼び出し、エラーハンドリング、ストリーミング、コスト最適化まで
  — チャットボットとエージェントを分けるコアパターンを段階的な実践コードで解説する。
pubDate: '2026-05-13'
heroImage: ../../../assets/blog/claude-agent-sdk-tool-use-complete-guide-2026/hero.png
tags:
  - Claude
  - Anthropic SDK
  - Tool Use
  - AI Agent
  - Python
relatedPosts:
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.9
    reason:
      ko: claude 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into claude.
      ja: claudeをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 claude 主题。
  - slug: openai-agentkit-tutorial-part1
    score: 0.85
    reason:
      ko: ai agent를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ai agent experience.
      ja: ai agentを実際に扱った経験が続く記事です。
      zh: 延续 ai agent 的实战经验。
  - slug: openai-agentkit-tutorial-part2
    score: 0.8
    reason:
      ko: 같은 ai agent 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same ai agent track.
      ja: 同じai agentの流れで併せて読むと役立ちます。
      zh: 在同一 ai agent 脉络中可一并阅读。
faq:
  - question: "Tool Useは通常のチャットボット呼び出しと何が違うのか？"
    answer: "チャットボットはモデルが直接答えを生成するため、日付計算のような処理を自信を持って間違えることがある。Tool Useはモデルがツール呼び出しを決めるだけで、実際の実行はPythonコードに委ねるため、datetimeのような正確な関数が結果を返す。この委譲の構造が信頼性を生む。"
  - question: "ツールを定義する際に必須の項目は何か？"
    answer: "ツール一つはname、description、input_schemaの三つで構成される。nameは識別子、input_schemaは入力パラメータのJSONスキーマで、descriptionはモデルがそのツールをいつ使うか判断する根拠となる。descriptionが曖昧だとモデルが誤ったツールを選んだり、まったく使わなかったりする。"
  - question: "ツールの実行結果はどのrole(役割)でメッセージに入れるべきか？"
    answer: "tool_resultはuserロールで入れる必要がある。直感的にはassistantに思えるが、API設計上ツール結果はユーザー(環境)が返すものとして扱われる。さらにモデルの応答はblock.textだけ取り出さず、response.content全体をassistantメッセージとして追加することで次の応答が正しく生成される。"
  - question: "Tool Useはコストがどれくらい増え、どう抑えるのか？"
    answer: "Anthropic公式ドキュメントによると、ツール定義一つあたり約200〜300トークンの固定オーバーヘッドがリクエストごとに発生し、エージェンティックループはコンテキストを累積する。ツール定義とシステムプロンプトにPrompt Caching(cache_control ephemeral)を適用し、現在のタスクに必要な2〜3個のツールだけ渡すことでコストを抑えられる。"
---

FastAPIでClaude APIのストリーミングバックエンドを構築しているときに、初めてTool Useを使った。きっかけはシンプルだった。ユーザーが「今年の残り日数は？」と聞いたとき、Claudeが日付計算を間違えたのを発見した。ただ間違えたのではなく、自信を持って間違えていた。それを見て「これはチャットボットではダメだ」と思った。

Tool Useはその問題を構造的に解決する。モデルが直接計算するのではなく、計算関数を呼び出してその結果を受け取って答える。この違いがチャットボットとエージェントを分ける核心だ。

以下は、anthropic SDK 0.101.0を実際にインストールして検証したTool Useパターンだ。基本的なツール定義、エージェンティックループ、エラーハンドリング、コスト。すべて実際に動かしたコードを基準にまとめた。

## Tool Useがチャットボットと違う理由: 構造的な差

LLMは確率分布からトークンをサンプリングする。日付計算や正確な数値演算、外部API照会のような作業は構造的に信頼しにくい。学習データのパターンを再現するだけだからだ。

Tool Useはこの問題を別の層で解決する。モデルは「何をすべきか」を決定し、実際の実行を外部コードに委任する。モデルが直接計算するのではなく、`calculate("365 - today.day_of_year")`のような呼び出しを出力し、Pythonコードがそれを実行して結果を返す。

```python
# チャットボット: モデルが直接答える
# "今日が何月何日か知らず、計算も直接しなければならない -> 間違える可能性あり"
response = client.messages.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "今年の残り日数は？"}]
)

# エージェント: ツールに委任
# "モデルはツールを選択し、Pythonが正確に計算する"
response = client.messages.create(
    model="claude-opus-4-7",
    tools=tools,  # 計算ツール定義を含む
    messages=[{"role": "user", "content": "今年の残り日数は？"}]
)
```

決定的な違いは信頼性だ。Pythonの`datetime`モジュールは日付を間違えない。

## anthropic 0.101.0のインストールとクライアント初期化

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install anthropic
```

実際に一時ディレクトリでインストールした結果：

```
anthropic version: 0.101.0
Client instantiated: ✓
Client type: Anthropic
```

0.101.0が現在（2026-05-13時点）の最新版だ。2025年以前に`pyautogen`などの名前で使っていたパッケージとは全く異なるSDKだ。Anthropic公式SDKだ。

```python
import anthropic
import json
from typing import Any

client = anthropic.Anthropic(api_key="your-api-key")  # ANTHROPIC_API_KEY環境変数も可
```

APIキーは`ANTHROPIC_API_KEY`環境変数で自動ロードされる。コードに直接書かないこと。

## 最初のツール定義: JSONスキーマがすべて

Tool UseはOpenAI Function Callingと似た構造を使う。ツールひとつは3つで構成される：

- `name`: ツール識別子（関数名のように）
- `description`: モデルがいつこのツールを使うか判断する根拠
- `input_schema`: 入力パラメータのJSONスキーマ

```python
tools = [
    {
        "name": "get_current_date_info",
        "description": "現在の日付と時刻情報を返します。日付計算や「今日」「今」に関する質問に使用します。",
        "input_schema": {
            "type": "object",
            "properties": {
                "timezone": {
                    "type": "string",
                    "description": "IANAタイムゾーン（例: Asia/Tokyo, UTC）。デフォルト: UTC"
                }
            },
            "required": []
        }
    },
    {
        "name": "calculate",
        "description": "数学演算を実行します。加算、減算、乗算、除算、べき乗などの基本的な演算を処理します。",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide", "power", "modulo"],
                    "description": "実行する演算の種類"
                },
                "a": {"type": "number", "description": "最初のオペランド"},
                "b": {"type": "number", "description": "2番目のオペランド"}
            },
            "required": ["operation", "a", "b"]
        }
    }
]
```

`description`が実際に重要だ。モデルは説明だけを見てこのツールを使うかどうか判断するからだ。実際に試してみると、説明が曖昧だと違うツールを選択したり、まったく使わないことが起きた。

## エージェンティックループの実装: 呼び出しと応答が繰り返されるサイクル

![エージェンティックループ図 — ユーザーメッセージからツール実行、結果返却までの循環フロー](../../../assets/blog/claude-agent-sdk-tool-use-complete-guide-2026/agentic-loop.png)

これが核心だ。Tool Useは1回のAPIコールで終わらない。モデルがツールを呼び出したら → 私たちが実行して → 結果を返す必要がある。このサイクルはモデルが`end_turn`を返すまで繰り返される。

```python
def run_agent(user_message: str, tools: list, max_iterations: int = 10) -> str:
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )
        
        # ツール呼び出しなしで終了 -> 最終応答を返す
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
        
        # ツール呼び出しがある場合は処理
        if response.stop_reason == "tool_use":
            # アシスタントの応答全体をmessagesに追加（ツール呼び出し含む）
            messages.append({"role": "assistant", "content": response.content})
            
            # ツール結果を収集して一度に追加
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = process_tool_call(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            
            # ツール結果をuserロールで追加（API要件）
            messages.append({"role": "user", "content": tool_results})
    
    return "最大反復回数超過"
```

ここで見落としやすい点が2つある。

<strong>1つ目</strong>、`response.content`全体をmessagesに入れる必要がある。`block.text`だけを取り出して入れてはいけない。モデルが自分がどのツールを呼び出したか記憶して、次の応答を正しく生成する。

<strong>2つ目</strong>、ツール結果は`user`ロールで入れる必要がある。直感的には`assistant`のはずだが、API設計上、ツール実行結果はユーザー（環境）が返すものとして扱われる。

## 実践ツール実装: 計算機、日付、ファイル読み込み

```python
from datetime import datetime
import pytz
import json
import operator
from typing import Any

# 安全な数学演算 — 文字列式の実行なしに演算子マッピングで処理
SAFE_OPERATIONS = {
    "add": operator.add,
    "subtract": operator.sub,
    "multiply": operator.mul,
    "divide": operator.truediv,
    "power": operator.pow,
    "modulo": operator.mod,
}

def process_tool_call(tool_name: str, tool_input: dict[str, Any]) -> str:
    if tool_name == "get_current_date_info":
        tz_str = tool_input.get("timezone", "UTC")
        try:
            tz = pytz.timezone(tz_str)
            now = datetime.now(tz)
            day_of_year = now.timetuple().tm_yday
            days_remaining = 365 - day_of_year
            return json.dumps({
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "timezone": tz_str,
                "day_of_year": day_of_year,
                "days_remaining_in_year": days_remaining,
            })
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    elif tool_name == "calculate":
        op_name = tool_input.get("operation")
        a = tool_input.get("a", 0)
        b = tool_input.get("b", 0)
        op_func = SAFE_OPERATIONS.get(op_name)
        if op_func is None:
            return f"Error: 不明な演算: {op_name}"
        try:
            if op_name == "divide" and b == 0:
                return "Error: 0で割ることはできません"
            result = op_func(a, b)
            return str(result)
        except Exception as e:
            return f"Error: {e}"
    
    return f"Error: 不明なツール: {tool_name}"
```

サンドボックスで実際に実行した結果：

```
calculate(multiply, 15, 7) + add result = 108
calculate(divide, 100, 4) = 25.0
入力検証 (必須フィールドあり): True
入力検証 (必須フィールドなし): False, Missing required field: location
```

[FastAPI + Claude APIストリーミングガイド](/ja/blog/ja/fastapi-claude-api-streaming-production-guide-2026)で扱ったエラー分類戦略をツールエラーにも適用するとプロダクション安定性が向上する。

## 複数ツール呼び出し処理: 並列実行は可能か

Claudeは1ターンで複数のツールを同時に呼び出せる。「ソウルと東京の天気を比較して」と言うと、2回の`get_weather`呼び出しを一度に返す。

```python
# Claudeが一度に複数のツールを呼び出した場合
tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

# 技術的には並列実行が可能
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {
        executor.submit(process_tool_call, block.name, block.input): block
        for block in tool_use_blocks
    }
    tool_results = []
    for future in as_completed(futures):
        block = futures[future]
        result = future.result()
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        })
```

冪等性（idempotent）が保証された照会ツールにのみ並列実行を適用することを勧める。

## エラーハンドリング: ツール失敗を上品に処理する

ツールが失敗した場合、`is_error: true`を付けて返す。モデルはこれを見てエラー状況を認識し、別の方法を試したりユーザーに適切に案内する。

```python
def safe_process_tool_call(tool_name: str, tool_input: dict) -> tuple[str, bool]:
    """ツール実行 + エラー処理。(content, is_error)を返す"""
    try:
        result = process_tool_call(tool_name, tool_input)
        return result, False
    except Exception as e:
        error_msg = f"ツール実行失敗: {type(e).__name__}: {str(e)}"
        return error_msg, True

for block in response.content:
    if block.type == "tool_use":
        content, is_error = safe_process_tool_call(block.name, block.input)
        tool_result = {
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": content,
        }
        if is_error:
            tool_result["is_error"] = True
        tool_results.append(tool_result)
```

`is_error: true`を返すとモデルがそのまま通り過ぎない。実際にテストしてみると、モデルはエラー内容を読んで「ファイルが見つからないとのことです、パスを確認してください」のようにユーザーに文脈のある案内をした。

## Tool Useコストの現実: トークンがどれだけ増えるか

正直に言うと、Tool Useはコストが上がる。Anthropic公式ドキュメント基準でツール定義1つあたり約200〜300トークンのオーバーヘッドが発生する。

```
ツール5個定義 → ~1,250トークン固定オーバーヘッド（毎リクエスト）
ツール呼び出し1回 → 入力 + 出力トークン追加
エージェンティックループ3回転 → 累積コンテキスト増加
```

2つの対策がある：

<strong>1. Prompt Cachingとの組み合わせ</strong>: ツール定義は毎リクエスト同一だ。Claude API Prompt Cachingガイドで扱ったように、キャッシングを活用できる。

<strong>2. 必要なツールのみ渡す</strong>: 10個のツールを常に含めるより、現在のタスクに必要な2〜3個だけ渡す方が良い。

## ストリーミングTool Use実装

```python
with client.messages.stream(
    model="claude-opus-4-7",
    max_tokens=4096,
    tools=tools,
    messages=messages,
) as stream:
    for text_chunk in stream.text_stream:
        print(text_chunk, end="", flush=True)
    
    final_message = stream.get_final_message()

if final_message.stop_reason == "tool_use":
    # ... 同様の処理
```

Vercel AI SDK方式を参考にすると、フロントエンド統合でこの部分がどのように抽象化されるか比較できる。

## まだ解決されていないこと: 率直な限界

Tool Useを実際に使ってみて感じた限界をまとめる。

<strong>コンテキスト累積問題</strong>: エージェンティックループはコンテキストを蓄積し続ける。10回ループを回すと最初のメッセージから10番目のツール結果まで全部入る。長期実行エージェントではコンテキスト管理戦略が必須だが、まだ標準パターンがない。

<strong>ツール選択の非決定性</strong>: 同じ質問を2回投げても、モデルが異なるツールを選択することがある。`temperature=0`を使っても完全に同一の動作を保証できない。

<strong>ツール定義品質が直結する</strong>: `description`が曖昧だとモデルが違うツールを選択したり、ツールを使わない。ツールの説明を上手く書くこと自体が別のプロンプトエンジニアリングだ。

私はTool Useが過小評価されていると思う。エージェントフレームワークが華やかな抽象化を提供しているが、結局その内部にはこのパターンがある。[PydanticAIのタイプセーフなツール定義方式](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)のようにフレームワークがJSONスキーマ生成を自動化してくれるのは便利だが、基盤メカニズムを直接理解していないとデバッグするときに詰まる。

## いつTool Useを使い、いつ避けるか

実際に使ってみてたどり着いた判断基準だ。すべてのチャットボット呼び出しにツールを付ける必要はない。

<strong>Tool Useが合うケース</strong>:

- 正確性が流暢さより重要なとき。日付計算、為替変換、数値演算のように間違ってはいけない作業は、モデルに直接生成させず関数に委譲する。
- モデルが知らないリアルタイムデータが必要なとき。学習カットオフ以降の情報、社内データベース、外部APIレスポンスはツールでしか取得できない。
- 副作用のある行動を実行する必要があるとき。ファイル書き込み、メール送信、チケット作成などは、モデルが「何を」するか決定し、実際の実行は検証済みコードが担う構造が安全だ。
- 複数ステップを経て結果を組み合わせる必要があるとき。イシュー一覧を取得して詳細を読み要約する、といった多段階作業はエージェンティックループが自然に処理する。

<strong>Tool Useを避けるべきケース</strong>:

- モデル内部の知識だけで十分な単純なQ&A。「Pythonでリストをソートする方法」にツールを付けてもトークンオーバーヘッドが増えるだけだ。
- レイテンシに敏感なリアルタイムUX。エージェンティックループはツール呼び出しごとに往復が発生する。一回の応答が速くなければならないインターフェースなら、ループ回数を厳しく制限するかツールなしで処理する。
- コスト上限が厳しい大量バッチ。ツール定義あたり~250トークンの固定オーバーヘッドとコンテキスト累積が呼び出し数に掛かる。数百万件のバッチならツールなしの単一呼び出しの方が経済的なことがある。
- 決定性が必須のパイプライン。ツール選択自体が非決定的なので、毎回同じツール呼び出し順序が保証されるべきワークフローならルールベースのコードの方がよい。

基準はシンプルだ。「モデルが直接答えると間違える可能性があるか、それともモデルが知らないものを取得する必要があるか」を自問すればいい。どちらかならTool Use、そうでなければ通常呼び出しだ。より重いマルチエージェントのオーケストレーションが必要になる地点は[Claude Agent Teamsで複数エージェントを構成](/ja/blog/ja/claude-agent-teams-guide)するときだが、その前に単一エージェントのTool Useを確実に押さえるのが順序だ。

## 参照した公式ドキュメント

この記事のパターンはすべてAnthropic公式ドキュメントを基準に検証した。さらに深掘りしたい読者のために一次出典を残す。

- [Tool use with Claude — 概要](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview): `tool_use` / `tool_result` ブロック、`stop_reason`、エージェンティックループの公式な説明。
- [Tool use — ツール定義リファレンス](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference): `name` / `description` / `input_schema` スキーマとトークンオーバーヘッドの一次資料。
- [Claude Agent SDK 概要](https://platform.claude.com/docs/en/agent-sdk/overview): ツールループを自前実装する代わりにSDKが抽象化してくれる上位レイヤー。
- [anthropic/claude-agent-sdk-python (GitHub)](https://github.com/anthropics/claude-agent-sdk-python): 公式PythonSDKリポジトリと実行可能なサンプルコード。

MCPでツールをサーバー化して再利用したいなら、[FastMCPでPython MCPサーバーを作る](/ja/blog/ja/fastmcp-python-mcp-server-build-guide-2026)記事が、このTool Useパターンを標準プロトコル上に載せる次のステップを扱っている。

## 5行に圧縮したTool Useの要点

anthropic 0.101.0で直接実験した結果をまとめると、こうなる。

- <strong>ツール定義</strong>: `name` + `description` + `input_schema`の3つがすべて。descriptionの品質がツール選択を決める。
- <strong>エージェンティックループ</strong>: `stop_reason == "tool_use"`検知 → ツール実行 → `tool_result`メッセージ追加 → 繰り返し。シンプルだがmessages構造を正確に合わせる必要がある。
- <strong>エラー処理</strong>: `is_error: true`を活用するとモデルがエラーを認識して適切に対応する。空文字列は避けること。
- <strong>コスト</strong>: ツール定義あたり~250トークンオーバーヘッド。Prompt Cachingとの組み合わせを推奨。
- <strong>並列ツール呼び出し</strong>: 冪等性のある照会ツールに限り`ThreadPoolExecutor`で並列実行可能。

チャットボットをエージェントに昇格させる最も直接的な方法がTool Useだ。複雑なフレームワークなしにこのパターンだけで実用的なエージェントが作れる。
