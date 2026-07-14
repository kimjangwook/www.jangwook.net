---
title: "Gemini API Managed Agents 実践ガイド — 隔離サンドボックスでエージェントをワンコールで実行する"
description: "Google I/O 2026発表のGemini Managed Agentsを実際に動かした記録。client.interactions.create()一発でエージェントを起動する仕組み、Claude・OpenAIとの違い、マルチターン会話の実装までコードで解説する。"
pubDate: '2026-05-30'
heroImage: '../../../assets/blog/gemini-api-managed-agents-practical-guide-2026-hero.png'
tags: ['Gemini API', 'AIエージェント', 'Google IO 2026']
relatedPosts:
  - slug: "anthropic-claude-opus-4-7-managed-agents-2026"
    score: 0.92
    reason:
      ko: "Claude Managed Agents의 비용 구조와 설계 철학을 먼저 이해하면, Gemini 버전이 어떤 선택을 달리 했는지 훨씬 선명하게 보인다."
      ja: "Claude Managed AgentsのAPIコスト構造を先に把握しておくと、Gemini版の設計差分がより明確に理解できる。"
      en: "Understanding Claude Managed Agents first makes the architectural differences in Gemini's approach much clearer."
      zh: "先了解Claude Managed Agents的成本结构和设计哲学，才能更清晰地看出Gemini版本做了哪些不同的选择。"
  - slug: "gemini-api-model-tier-benchmark-guide-2026"
    score: 0.85
    reason:
      ko: "Managed Agents가 내부적으로 어떤 모델 티어를 사용하는지 이해하려면 Gemini API 모델 선택 가이드를 함께 읽는 것이 도움이 된다."
      ja: "Managed Agentsが内部でどのモデルティアを使うかを把握するために、このGemini APIモデル選択ガイドも合わせて読むと理解が深まる。"
      en: "To understand which model tier Managed Agents uses internally, this Gemini API model selection guide is a useful companion read."
      zh: "要了解Managed Agents内部使用哪个模型层级，配合阅读Gemini API模型选择指南会很有帮助。"
  - slug: "google-io-2026-antigravity-2-agent-platform-analysis"
    score: 0.78
    reason:
      ko: "Gemini Managed Agents가 발표된 Google I/O 2026의 더 넓은 에이전트 플랫폼 전략을 분석한 글이다. 단일 기능이 아니라 Google의 방향성 전체를 파악하고 싶을 때."
      ja: "Gemini Managed Agentsが発表されたGoogle I/O 2026の広域エージェントプラットフォーム戦略を分析した記事。単一機能ではなくGoogleの全体的な方向性を把握したいときに。"
      en: "A broader analysis of Google's agent platform strategy from Google I/O 2026, where Managed Agents was announced. Read this if you want the full strategic picture."
      zh: "分析Gemini Managed Agents发布所在的Google I/O 2026更广泛的智能体平台战略。想了解Google整体方向而非单一功能时阅读。"
---

Google I/O 2026が終わってちょうど10日が経った。毎年そうだが、発表当日は「おっ、これは本物だ」という感覚と「またデモレベルじゃないのか」という疑念が同時にやってくる。今年のGemini API Managed Agents発表もまさにそうだった。

だから実際に手を動かしてみた。`pip install google-genai`一発、APIキー一つあれば動く、というのは合っている。ただし公式ブログに書いてあることと実際のSDKの動作がいくつか食い違う部分があり、その差異こそがこの機能を理解するうえで重要だと気づいた。

---

## Gemini Managed Agentsとは何か、まず整理する

Anthropicが先に[Claude Managed Agents](/ja/blog/ja/anthropic-claude-opus-4-7-managed-agents-2026)を発表し、OpenAIも同じ方向に動いている。Googleは今回のGoogle I/O 2026で`Gemini API Managed Agents`を正式公開した。

一言でまとめると、<strong>SDKに`client.interactions`というネームスペースが追加され、`create()`を一度呼び出すだけでエージェントを実行できるようになった</strong>、ということだ。

従来の`generate_content()`が「自分がLLMにプロンプトを投げて返答をもらう構造」だとすれば、Managed Agentsは「エージェントが目標を受け取り、自律的にツールを使いながら結果を生成する構造」に近い。実行の制御権をSDK側に委ねる設計なので「Managed」という名前がついている。

SDKから確認した主な特徴は三つある。

一つ目は、`interaction`単位で実行状態を管理する点。レスポンスオブジェクトには`id`、`status`（`in_progress`、`requires_action`、`completed`、`failed`など）、`outputs`、`previous_interaction_id`が含まれる。状態機械が明示的に露出している設計だ。

二つ目は、`previous_interaction_id`でマルチターン会話を連結する点。公式の発表資料で「environment_idで環境を再利用する」と書かれていた部分が、実際のSDKとは異なる最初のポイントだ（これは後で詳しく触れる）。

三つ目は、機能がEXPERIMENTAL状態である点。SDKをインストールして`client.interactions`を初めて呼び出すと、`UserWarning: "Interactions usage is experimental and may change in future versions"`が表示される。本番環境にそのまま投入するには時期尚早だ。

---

## インストールと基本実行

```bash
pip install google-genai
```

インストールすると`google-genai==1.72.0`が入る。Python 3.12環境では依存関係の競合はなかった。`google-generativeai`（旧SDK）と`google-genai`（新SDK）は別パッケージだ。名前が似ているので混同しやすいが、Managed Agents APIは必ず`google-genai`を使う必要がある。

インストール直後に`client.interactions`を初めて呼び出すと、以下の警告が出る。

```
UserWarning: Interactions usage is experimental and may change in future versions.
  warnings.warn(
```

これはSDKが自ら出している警告だ。無視して実行することはできる。しかし本番コードでこういった警告が出るということは、インターフェースが変更される可能性があるというシグナルとして読むべきだ。

基本的な実行構造はこうなる。

```python
import google.genai as genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

response = client.interactions.create(
    model="gemini-2.5-flash",
    input="AIエージェントのメモリアーキテクチャの利点と課題を整理してください"
)

print(f"Interaction ID: {response.id}")
print(f"Status: {response.status}")

for content in (response.outputs or []):
    if hasattr(content, 'text'):
        print(content.text)
```

`model`パラメータに指定できるGeminiモデルは、SDK Literalの型定義によると`gemini-2.5-flash`、`gemini-2.5-pro`、`gemini-2.5-flash-lite`、`gemini-3-flash-preview`、`gemini-3-pro-preview`などがある。2026年5月時点では`gemini-3.x-preview`系のモデルも含まれている。

APIエンドポイントは`https://generativelanguage.googleapis.com/v1beta/interactions`だ。有効なAPIキーがなければHTTP 400が返るが、これはエンドポイント自体は生きているということでもある。404ではなく400が返ってくること自体が、サーバーのルーティングが動作している証拠だ。

レスポンスオブジェクトの構造を事前に把握しておくとコードが書きやすい。

```python
# responseオブジェクトの主要フィールド
response.id                     # str: インタラクションの一意ID
response.status                 # 状態: 以下のいずれか
# 'in_progress'     — まだ実行中
# 'requires_action' — ユーザー入力や確認が必要
# 'completed'       — 正常完了
# 'failed'          — 失敗
# 'cancelled'       — キャンセル済み
# 'incomplete'      — 部分的に完了
response.outputs                # list: 結果コンテンツのリスト
response.previous_interaction_id  # str | None: 前のインタラクションID
response.usage                  # トークン使用量の情報
```

状態機械が明示的に露出しているのが`generate_content()`との決定的な違いだ。従来はリクエストを送れば完了した結果が返ってきた。Managed Agentsは実行が進行中である可能性、途中でユーザー入力が必要になる可能性、失敗する可能性、という概念をAPI水準で扱う。

---

## マルチターン会話: environment_idではなくprevious_interaction_id

公式発表資料の一部や複数の技術ブログで「environment_idを再利用して会話コンテキストを維持する」という表現が見られる。実際のSDKを見ると、このパラメータは存在しない。

<strong>マルチターン会話に使うパラメータは`previous_interaction_id`だ。</strong>

```python
# 最初のインタラクション
response1 = client.interactions.create(
    model="gemini-2.5-flash",
    input="AIエージェントを設計するとき、メモリをどう分類すればいい?"
)

# 2回目のインタラクション — 前の会話コンテキストを連結
response2 = client.interactions.create(
    model="gemini-2.5-flash",
    input="最初の分類方法についてコード例を見せてください",
    previous_interaction_id=response1.id
)
```

この方式では各インタラクションに一意のIDが付き、そのIDをチェーンのように連結して会話を続ける構造だ。Claudeの`session_id`方式と概念的には似ているが、実装は異なる。Googleは各インタラクションを独立したオブジェクトとして管理し、前のIDを参照する方式を選んだ。

正直に言うと、この設計の方が直感的だと思う。どのインタラクションがどの会話の流れから来たのかをIDだけで追跡できるからだ。一方、Claudeのようにセッションの範囲を明示的に開閉する構造は、セッション管理のコストが別途発生する。

---

## 利用できるツール

`tools`パラメータで複数のツールを付与できる。SDKで確認したリストはこうなっている。

<strong>code_execution</strong>: コードを実行するサンドボックス環境だ。

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="フィボナッチ数列を計算してコードを見せてください",
    tools=[{"type": "code_execution"}]
)
```

一つ重要な点を押さえておきたい。公式発表では「隔離されたUbuntu環境（4コアCPU、16GB RAM、Python 3.12、Node.js 22）」という表現が使われている。SDKで確認した結果、`code_execution`ツールはサンドボックスPythonインタープリター水準だ。`computer_use`ツールは`environment='browser'`のみ対応しており、Linux VMへのアクセスは現在の公開APIでは提供されていない。発表資料の説明は内部エージェントインフラを基準にしたものとみられる。

<strong>google_search</strong>: リアルタイムのウェブ検索をエージェントが直接呼び出す。

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Google I/O 2026で発表された最新のAI機能をまとめてください",
    tools=[{"type": "google_search"}]
)
```

<strong>url_context</strong>: URLを直接読み込んでコンテキストとして活用する。

<strong>mcp_server</strong>: MCP（Model Context Protocol）サーバーと接続する。AnthropicとGoogleがMCPを標準として共有しているという点で興味深い。事実上、エージェントツールインターフェースの標準化が進んでいる。MCPサーバーを自前で立ち上げて、Geminiエージェントがそのサーバーのツールをコールする構造を作ることができる。

<strong>computer_use</strong>: ブラウザ環境でのコンピューター操作。前述の通り、`environment='browser'`のみ対応で、Linux VMは公開APIではまだ利用できない。

<strong>google_maps</strong>: 地図と位置情報へのアクセス。

<strong>file_search</strong>: ファイル検索。

複数のツールを同時に組み合わせることもできる。

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="東京のおすすめレストランを探して、各店舗の最新レビューを検索してください",
    tools=[
        {"type": "google_search"},
        {"type": "google_maps"}
    ]
)
```

エージェントがどの順序でどのツールを呼び出したかは、`response.outputs`の中を解析すれば確認できる。ツール呼び出しの結果もoutputsの中に含まれているため、エージェントの推論プロセスをある程度追うことができる。

---

## ストリーミングとバックグラウンド実行

長い処理を扱うときはストリーミングかバックグラウンド実行が必要になる。

```python
# ストリーミング
with client.interactions.create(
    model="gemini-2.5-flash",
    input="エージェントのメモリアーキテクチャを3文で説明してください",
    stream=True
) as stream:
    for event in stream:
        if event.outputs:
            for output in event.outputs:
                if hasattr(output, 'text'):
                    print(output.text, end="", flush=True)
```

バックグラウンド実行は、処理を非同期で開始して後から結果を取得するパターンだ。

```python
# バックグラウンド実行の開始
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="AIエージェントのメモリアーキテクチャを詳細分析してください",
    background=True,
    store=True  # 後で取得するにはstore=Trueが必須
)

interaction_id = response.id

# 後から結果を取得
result = client.interactions.get(interaction_id)
print(result.status)  # 'completed'または'in_progress'など
```

`store=True`を忘れると後で`client.interactions.get()`で取得できなくなる。ドキュメントに明確な記載がないため一度はやらかす部分だ。

---

## Deep Research Agent

Managed Agentsのネームスペースでは、`agent`パラメータで特定用途のエージェントを指定することもできる。現在公開されているのは`deep-research-pro-preview-12-2025`だ。

```python
response = client.interactions.create(
    agent="deep-research-pro-preview-12-2025",
    input="Gemini、Claude、OpenAIのエージェントアーキテクチャを比較分析してください",
    agent_config={"type": "deep-research"}
)
```

名前から分かるように`12-2025`バージョンでpreview状態だ。ディープリサーチエージェントが自らウェブを巡回して複数のソースを統合し結果を生成するという概念だが、実際にどのレベルまで動くかは有効なAPIキーで実際に実行してみないと確認できない。

`model`方式と`agent`方式の違いはこうだ。`model`はGemini言語モデルに直接リクエストを送りながらツールを付与する方式だ。`agent`は事前定義されたエージェント仕様を実行する方式で、エージェント内部にすでに特定のツールと設定が含まれている。Deep Researchエージェントが後者の例だ。

今後Googleがより多くの特定用途エージェントをここに追加していく可能性は高い。コーディングエージェント、データ分析エージェント、金融リサーチエージェントといった形で拡張されるだろうと見ている。

---

## Claude Managed Agents vs Gemini Managed Agents: 何が違うか

Claude Managed Agentsを先に触っていたので、比較が自然にできる。

<strong>コンテキスト管理の方式が異なる。</strong> Claudeはセッション単位で環境を開き、その中でマルチターン会話が行われる。Geminiは各インタラクションを独立したオブジェクトとして作り、`previous_interaction_id`で連結する。状態管理の設計思想の違いと言える。

<strong>ツール構成が異なる。</strong> Claudeはbash、computer use（Linux + macOS）、text editorなど実際のOS水準のツールに重点を置く。Geminiはgoogle_search、google_maps、url_contextなどGoogleインフラと連携したツールが多い。当然の話だが、各社が強みを持つ領域のツールを先に付けた結果だ。

<strong>課金体系が把握しにくい。</strong> Claude Managed Agentsは`task_budget`を明示的に設定でき、コストが比較的予測しやすい。Gemini Managed Agentsのインタラクションあたりの費用は、現在の公開ドキュメントで明確に示されていない。EXPERIMENTAL状態である以上、課金体系もまだ確定していないとみられる。本番のコスト計画が立てにくいというのが現時点での現実的なデメリットだ。

[AIエージェントのフレームワーク選択](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)で触れたように、エージェントコストのコントロール可能性は導入判断の重要な軸だ。今のGemini Managed Agentsはこの点で弱い。

<strong>SDKの成熟度がまだ違う。</strong> Anthropic SDKはManaged Agents関連の機能がかなり整理されており、エラーメッセージも明確だ。google-genai SDKのinteractionsネームスペースは現在EXPERIMENTALの警告が付いており、パラメータ名が公式ブログの説明と実際の実装で異なる部分がある（environment_id vs previous_interaction_id）。これは速いリリースサイクルの中で生まれたズレとみられ、そのうち整理されるだろうとは思う。

比較をまとめるとこうなる。

| 比較項目 | Gemini Managed Agents | Claude Managed Agents |
|---|---|---|
| マルチターンの連結方式 | `previous_interaction_id` | セッション基盤 |
| 環境の隔離 | ブラウザサンドボックス、Python sandbox | Linux VM、macOS |
| 特化ツール | Google Search、Maps、MCP | bash、text editor、computer use |
| 課金単位 | 公開未定（EXPERIMENTAL） | task_budget基盤 |
| SDKの状態 | EXPERIMENTAL | 安定（ベータ） |
| 特定用途エージェント | Deep Research Agent | —（モデル基盤） |

どちらが優れているという話ではない。用途が違う。Googleインフラのデータをエージェントがダイレクトにさばかなければならない作業ならGeminiの方が自然だ。OS水準の作業自動化、コード実行、ファイル操作が多い作業ならClaudeの方が適している。

---

## 率直な評価: 今すぐ使えるか

<strong>この機能を今すぐ本番に投入するのは早すぎる。</strong>

根拠は三つ。

一つ目、EXPERIMENTAL状態だ。SDK自体が警告を出している。APIインターフェースが次のバージョンで変わる可能性があるということだ。主要なパラメータ名がすでに外部のドキュメントと実装で食い違っている状況なので、この可能性は低くない。

二つ目、コストが予測できない。エージェントが何回ツールを呼び出してどれだけ使うのか制御しにくい。[AIエージェントのコスト現実](/ja/blog/ja/ai-agent-cost-reality)で書いたように、エージェント費用の核心はツール呼び出し回数とトークン消費量だ。Managed Agentsはこの実行過程がブラックボックスに近いため、コスト制御がさらに難しくなる可能性がある。

三つ目、公開されているツールの水準が発表資料より制限されている。Linuxサンドボックスへのアクセスや4コア/16GB環境といった内容が、現在の公開APIでは確認できない。発表内容を額面通りに受け取ると、実際の体験と乖離が生まれる。

一方、<strong>実験して準備を進めるには今がちょうどいいタイミングだ。</strong>

インターフェースが`generate_content()`よりずっとシンプルだ。エージェントの実行結果を状態機械で管理するという概念が明確だ。Deep Researchエージェントのように目的特化型エージェントを素早く呼び出せる構造も面白い。Google Search、Google Mapsといったインフラツールとの統合は、AnthropicやOpenAIが追いつきにくい領域だ。

6〜12ヶ月後にこの機能がGA（General Availability）に移行して課金体系が公開されれば、真剣に検討する価値が出てくる。

---

## コードまとめ: 実際に使えるパターン

最後に実用的なパターンを一箇所にまとめておく。APIキーさえあればすぐ実行できる状態に整えた。

```python
import google.genai as genai
import warnings

# EXPERIMENTALの警告を確認したいときは以下のコメントを外す
# warnings.filterwarnings('error', category=UserWarning)

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")


# --- パターン1: 基本の単発実行 ---
def run_basic(prompt: str, model: str = "gemini-2.5-flash") -> str:
    response = client.interactions.create(
        model=model,
        input=prompt
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- パターン2: マルチターン会話 ---
class GeminiConversation:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.last_interaction_id: str | None = None

    def send(self, message: str) -> str:
        kwargs = {
            "model": self.model,
            "input": message,
        }
        if self.last_interaction_id:
            kwargs["previous_interaction_id"] = self.last_interaction_id

        response = client.interactions.create(**kwargs)
        self.last_interaction_id = response.id

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text'):
                texts.append(content.text)
        return "\n".join(texts)


# --- パターン3: ウェブ検索付き ---
def run_with_search(prompt: str) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        tools=[{"type": "google_search"}]
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- パターン4: バックグラウンド実行 + ポーリング ---
import time

def run_background(prompt: str, poll_interval: float = 2.0) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        background=True,
        store=True  # 必ずstore=True
    )

    interaction_id = response.id
    while True:
        result = client.interactions.get(interaction_id)
        if result.status in ("completed", "failed", "cancelled"):
            break
        time.sleep(poll_interval)

    if result.status != "completed":
        raise RuntimeError(f"Interaction ended with status: {result.status}")

    texts = []
    for content in (result.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- パターン5: Deep Research Agent ---
def run_deep_research(query: str) -> str:
    response = client.interactions.create(
        agent="deep-research-pro-preview-12-2025",
        input=query,
        agent_config={"type": "deep-research"}
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)
```

---

## エラー処理と注意点

実際にコードを書いていると、いくつかのエッジケースに出くわす。あらかじめ知っておけば無駄な試行錯誤を減らせる。

<strong>statusが'failed'のとき、outputsがNoneになり得る。</strong> 必ず`response.outputs or []`で処理しないと`TypeError`が発生する。

<strong>background=Trueを使うとき、store=Trueを忘れると取得できない。</strong> 後から`client.interactions.get(interaction_id)`を呼び出すと404が返ってくる。バックグラウンド実行と結果の保存は別のオプションだ。

<strong>ストリーミングはコンテキストマネージャーとして使う必要がある。</strong> `with client.interactions.create(..., stream=True) as stream:`という形が正しい。withブロックの外でstreamを参照すると、すでに閉じた接続にアクセスすることになる。

<strong>toolsパラメータはdictのリストだ。</strong> 型ヒントや公式ドキュメントが不明確なため、`tools={"type": "google_search"}`のようにdictを一つ渡すとエラーになる。必ずリストで包む必要がある。

```python
# エラー処理パターン
def safe_run(prompt: str) -> str | None:
    try:
        response = client.interactions.create(
            model="gemini-2.5-flash",
            input=prompt
        )
        if response.status == "failed":
            print(f"Interaction failed: {response.id}")
            return None

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text') and content.text:
                texts.append(content.text)
        return "\n".join(texts) if texts else None

    except Exception as e:
        print(f"API error: {e}")
        return None
```

---

## まとめ

Google I/O 2026で発表されたGemini Managed Agentsは、方向性は正しい。エージェントの実行をAPI一発で抽象化しようとする試み、状態機械ベースのインタラクション管理、Googleインフラツールとの統合は、設計の観点から無駄がない。

ただし発表内容とSDKの現実の間にズレがあり、EXPERIMENTALのラベルはまだ取れていない。個人的には今すぐサービスに組み込もうと飛びかかるよりも、SDKの構造を把握してDeep Research Agentのような特定用途エージェントの動作原理を理解しておく時間として使う方が合理的だと思っている。個人プロジェクトや社内ツールで実験するなら今でも十分価値がある。

一つ確かなことがある。AnthropicがClaude Managed Agentsを先行リリースした後、GoogleとOpenAIが素早く追従し、「エージェントをマネージドサービスとして提供する」という方向は業界全体のトレンドになった。1〜2年以内にこのインターフェースが安定したとき、どの会社のエージェントを選ぶかが本当の選択問題になる。エージェントランタイムのコスト、ツールへのアクセス権限、コンテキスト管理の方式、モニタリングの利便性が、その選択基準になるだろう。

具体的なアップデートは`google-genai`パッケージのリリースノートとGoogle AI for Developersのブログを追っていくのがいい。SDKバージョンが上がるたびにinteractions関連の変更点に注目する価値がある。
