---
title: OpenAI AgentKit完全ガイド パート2：実践応用と高度なパターン
description: エンタープライズグレードのマルチエージェントシステム設計から本番デプロイまで、AgentKit実践マスターガイド
pubDate: '2025-10-21'
heroImage: ../../../assets/blog/openai-agentkit-part2-hero.jpg
tags:
  - OpenAI
  - AgentKit
  - AI Agent
relatedPosts:
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-collaboration-patterns
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
---

> **シリーズ：OpenAI AgentKitマスター** (2/2)
>
> 1. [OpenAI AgentKit完全ガイド パート1：コア概念とスタートガイド](/ja/blog/ja/openai-agentkit-tutorial-part1)
> 2. **OpenAI AgentKit完全ガイド パート2：実践応用と高度なパターン** ← 現在の記事

パート1でAgentKitの基本概念と基礎チュートリアルを学びました。パート2では、実際のプロダクション環境でのエンタープライズグレードシステム構築方法を探ります。

## 1. エンタープライズアーキテクチャパターン

### 1.1 階層型マネージャー・ワーカーパターン

大規模プロジェクトでは、単一エージェントではすべてのタスクを処理できません。マネージャーエージェントが全体戦略を立て、専門ワーカーエージェントに仕事を委任する階層構造が効果的です。

**アーキテクチャ図**：

```mermaid
graph TD
    User[ユーザー] -->|要求| Manager[マネージャーエージェント<br/>プロジェクト全体統括]
    Manager -->|タスク委任| Frontend[フロントエンド<br/>スペシャリスト]
    Manager -->|タスク委任| Backend[バックエンド<br/>スペシャリスト]
    Manager -->|タスク委任| DevOps[DevOps<br/>スペシャリスト]

    Frontend -->|レポート| Manager
    Backend -->|レポート| Manager
    DevOps -->|レポート| Manager

    Manager -->|統合結果| User

    style Manager fill:#10A37F,color:#fff
    style Frontend fill:#4A90E2,color:#fff
    style Backend fill:#E94B3C,color:#fff
    style DevOps fill:#F5A623,color:#fff
```

**実装例**：

```python
from openai_agents import Agent, Runner

# マネージャーエージェント
manager = Agent(
    name="Project Manager",
    instructions="""
    あなたはWebアプリケーション構築のための技術プロジェクトマネージャーです。

    責任範囲：
    1. ユーザー要求の分析
    2. タスクの細分化
    3. 専門エージェントへの委任
    4. チーム間の調整
    5. 品質基準の確保
    6. 進捗報告
    """,
    handoffs=["Frontend Specialist", "Backend Specialist", "DevOps Specialist"]
)

# フロントエンドスペシャリスト
frontend = Agent(
    name="Frontend Specialist",
    instructions="""
    あなたはReact/Next.jsの専門家です。

    専門分野：
    - コンポーネント設計
    - 状態管理（Redux/Zustand）
    - レスポンシブUI/UX
    - パフォーマンス最適化
    - アクセシビリティ（WCAG 2.1 AA）

    完了時はマネージャーに引き渡してください。
    """,
    handoffs=["Project Manager"]
)

# バックエンドスペシャリスト
backend = Agent(
    name="Backend Specialist",
    instructions="""
    あなたはNode.js/Python/Goのバックエンド専門家です。

    専門分野：
    - RESTful/GraphQL API設計
    - データベース最適化（PostgreSQL/MongoDB）
    - 認証/認可（OAuth 2.0/JWT）
    - マイクロサービスアーキテクチャ
    - API セキュリティ（OWASP Top 10）

    完了時はマネージャーに引き渡してください。
    """,
    handoffs=["Project Manager"]
)

# DevOpsスペシャリスト
devops = Agent(
    name="DevOps Specialist",
    instructions="""
    あなたはKubernetes/Docker/CI/CDの専門家です。

    専門分野：
    - コンテナオーケストレーション
    - GitHub Actions/GitLab CI設定
    - インフラストラクチャ・アズ・コード（Terraform）
    - モニタリング（Prometheus/Grafana）
    - Zero-downtime deployment

    完了時はマネージャーに引き渡してください。
    """,
    handoffs=["Project Manager"]
)

# エージェント実行
runner = Runner(agents=[manager, frontend, backend, devops])
result = runner.run(
    agent=manager,
    messages=[{
        "role": "user",
        "content": "eコマースプラットフォームを構築してください。ユーザー認証、商品カタログ、決済システムが必要です。"
    }]
)
```

**実行フロー**：

1. **マネージャー分析**：要求を3つのサブタスクに分解
   - フロントエンド：商品一覧UI、ショッピングカートUI
   - バックエンド：商品API、決済処理ロジック
   - DevOps：Kubernetesデプロイメント設定

2. **並列実行**：3つのスペシャリストが同時に作業

3. **統合**：マネージャーがすべての成果物を統合して最終レポート

### 1.2 イベント駆動型オーケストレーション

リアルタイムシステムでは、イベントに反応して適切なエージェントを起動するパターンが効果的です。

**アーキテクチャ図**：

```mermaid
graph LR
    Event[イベントバス<br/>RabbitMQ/Kafka] --> Router[ルーターエージェント<br/>イベント分類]

    Router -->|payment_received| Payment[決済<br/>プロセッサー]
    Router -->|order_placed| Order[注文<br/>ハンドラー]
    Router -->|support_ticket| Support[カスタマー<br/>サポート]
    Router -->|fraud_alert| Fraud[不正検知<br/>システム]

    Payment --> DB[(データベース)]
    Order --> DB
    Support --> DB
    Fraud --> DB

    style Event fill:#FF6B6B,color:#fff
    style Router fill:#10A37F,color:#fff
```

**実装例**：

```python
from openai_agents import Agent, Runner
import asyncio
from typing import Dict, Any

class EventDrivenOrchestrator:
    def __init__(self):
        # ルーターエージェント
        self.router = Agent(
            name="Event Router",
            instructions="""
            イベントタイプを分析し、適切な専門エージェントにルーティングします。

            ルーティングロジック：
            - payment_received → Payment Processor
            - order_placed → Order Handler
            - support_ticket → Customer Support
            - fraud_alert → Fraud Detection
            """
        )

        # 専門エージェント
        self.payment_processor = Agent(
            name="Payment Processor",
            instructions="決済を処理し、トランザクション記録を保存します。"
        )

        self.order_handler = Agent(
            name="Order Handler",
            instructions="注文を処理し、在庫を更新し、出荷プロセスを開始します。"
        )

        self.support_agent = Agent(
            name="Customer Support",
            instructions="サポートチケットを分析し、自動対応または人間エスカレーションします。"
        )

        self.fraud_detector = Agent(
            name="Fraud Detection",
            instructions="不正取引パターンを分析し、アカウントをフラグまたはブロックします。"
        )

        self.runner = Runner(agents=[
            self.router,
            self.payment_processor,
            self.order_handler,
            self.support_agent,
            self.fraud_detector
        ])

    async def handle_event(self, event: Dict[str, Any]):
        """イベントを適切なエージェントにルーティング"""
        event_type = event.get("type")

        # エージェント選択
        agent_map = {
            "payment_received": self.payment_processor,
            "order_placed": self.order_handler,
            "support_ticket": self.support_agent,
            "fraud_alert": self.fraud_detector
        }

        target_agent = agent_map.get(event_type)
        if not target_agent:
            print(f"Unknown event type: {event_type}")
            return

        # エージェント実行
        result = self.runner.run(
            agent=target_agent,
            messages=[{
                "role": "user",
                "content": f"Process event: {event}"
            }]
        )

        return result

# 使用例
orchestrator = EventDrivenOrchestrator()

# シミュレーションイベント
events = [
    {"type": "payment_received", "amount": 99.99, "user_id": "user123"},
    {"type": "order_placed", "order_id": "ORD-456", "items": [{"id": "ITEM-1", "qty": 2}]},
    {"type": "support_ticket", "ticket_id": "TKT-789", "issue": "配送の遅延"},
    {"type": "fraud_alert", "user_id": "user999", "reason": "異常なログインパターン"}
]

# イベント処理
async def main():
    tasks = [orchestrator.handle_event(event) for event in events]
    results = await asyncio.gather(*tasks)
    print(f"Processed {len(results)} events")

asyncio.run(main())
```

### 1.3 グラフベースワークフロー（LangGraph統合）

複雑な意思決定フローには、条件分岐と動的ルーティングを持つグラフ構造が適しています。

**ワークフロー図**：

```mermaid
graph TD
    Start([ユーザー入力]) --> Classifier[分類器<br/>意図分析]

    Classifier -->|技術的質問| TechSupport[技術サポート<br/>エージェント]
    Classifier -->|請求問題| Billing[請求<br/>エージェント]
    Classifier -->|不明| Clarify[明確化<br/>エージェント]

    TechSupport -->|解決済み| End([完了])
    TechSupport -->|未解決| Human[人間への<br/>エスカレーション]

    Billing -->|承認必要| Approval[承認<br/>プロセス]
    Billing -->|自動処理| End

    Clarify --> Classifier

    Approval -->|承認| End
    Approval -->|拒否| Human
    Human --> End

    style Start fill:#10A37F,color:#fff
    style Classifier fill:#4A90E2,color:#fff
    style End fill:#10A37F,color:#fff
```

**実装例（LangGraph使用）**：

```python
from langgraph.graph import Graph, StateGraph
from openai_agents import Agent, Runner
from typing import TypedDict, Literal

class WorkflowState(TypedDict):
    user_input: str
    intent: str
    resolved: bool
    escalated: bool
    response: str

# エージェント定義
classifier = Agent(
    name="Intent Classifier",
    instructions="ユーザーの意図を'technical'、'billing'、'unclear'に分類します。"
)

tech_support = Agent(
    name="Tech Support",
    instructions="技術的問題をトラブルシューティングします。解決できない場合は率直に伝えてください。"
)

billing_agent = Agent(
    name="Billing Agent",
    instructions="請求問い合わせを処理します。$100超の返金は承認が必要です。"
)

clarify_agent = Agent(
    name="Clarifier",
    instructions="ユーザーの質問を明確にするための質問をします。"
)

# ワークフローグラフ構築
workflow = StateGraph(WorkflowState)

def classify_intent(state: WorkflowState) -> WorkflowState:
    """意図を分類"""
    runner = Runner(agents=[classifier])
    result = runner.run(
        agent=classifier,
        messages=[{"role": "user", "content": state["user_input"]}]
    )
    state["intent"] = result.output  # 'technical', 'billing', 'unclear'
    return state

def handle_technical(state: WorkflowState) -> WorkflowState:
    """技術サポート処理"""
    runner = Runner(agents=[tech_support])
    result = runner.run(
        agent=tech_support,
        messages=[{"role": "user", "content": state["user_input"]}]
    )

    # "不明"または"解決できない"が含まれる場合はエスカレーション
    if "不明" in result.output or "解決できない" in result.output:
        state["escalated"] = True
    else:
        state["resolved"] = True

    state["response"] = result.output
    return state

def handle_billing(state: WorkflowState) -> WorkflowState:
    """請求処理"""
    runner = Runner(agents=[billing_agent])
    result = runner.run(
        agent=billing_agent,
        messages=[{"role": "user", "content": state["user_input"]}]
    )

    # $100超の返金リクエストは承認が必要
    if "返金" in state["user_input"] and any(
        str(amt) in state["user_input"] for amt in range(101, 10000)
    ):
        state["response"] = "承認待ち"
    else:
        state["resolved"] = True
        state["response"] = result.output

    return state

def handle_unclear(state: WorkflowState) -> WorkflowState:
    """不明瞭な入力を明確化"""
    runner = Runner(agents=[clarify_agent])
    result = runner.run(
        agent=clarify_agent,
        messages=[{"role": "user", "content": state["user_input"]}]
    )
    state["response"] = result.output
    # 再分類のためにループバック
    return state

def route_based_on_intent(state: WorkflowState) -> Literal["technical", "billing", "unclear"]:
    """意図に基づくルーティング"""
    return state["intent"]

def check_if_done(state: WorkflowState) -> Literal["end", "escalate"]:
    """完了またはエスカレーション判定"""
    if state.get("escalated"):
        return "escalate"
    elif state.get("resolved"):
        return "end"
    else:
        return "end"  # デフォルト

# グラフノード追加
workflow.add_node("classify", classify_intent)
workflow.add_node("technical", handle_technical)
workflow.add_node("billing", handle_billing)
workflow.add_node("unclear", handle_unclear)

# エッジ定義
workflow.set_entry_point("classify")
workflow.add_conditional_edges(
    "classify",
    route_based_on_intent,
    {
        "technical": "technical",
        "billing": "billing",
        "unclear": "unclear"
    }
)
workflow.add_conditional_edges("technical", check_if_done)
workflow.add_conditional_edges("billing", check_if_done)
workflow.add_edge("unclear", "classify")  # ループバック

# グラフコンパイル
app = workflow.compile()

# 実行
result = app.invoke({
    "user_input": "ログインできません。パスワードをリセットしましたが、まだログインできません。",
    "intent": "",
    "resolved": False,
    "escalated": False,
    "response": ""
})

print(f"最終結果: {result['response']}")
print(f"解決済み: {result['resolved']}, エスカレート: {result['escalated']}")
```

---

## 2. カスタムMCPサーバー開発

AgentKitの真の力は、MCPプロトコルを通じた独自ツールの構築にあります。企業の内部システム（Slack、JIRA、社内データベースなど）と統合する方法を見てみましょう。

### 2.1 Slack統合MCPサーバー

**ユースケース**：エージェントがSlackメッセージを送信し、チャンネル履歴を読み、リアクションを追加できるようにします。

**実装**：

```python
from mcp import Server, Tool, Context
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import os
from typing import Dict, Any, List

class SlackMCPServer(Server):
    def __init__(self):
        super().__init__(
            name="slack",
            version="1.0.0",
            description="Slack workspace operations"
        )
        self.client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

    @Tool(
        name="send_message",
        description="Slackチャンネルにメッセージを送信",
        parameters={
            "channel": {
                "type": "string",
                "description": "チャンネルIDまたは名前（例：#general）"
            },
            "text": {
                "type": "string",
                "description": "送信するメッセージテキスト"
            },
            "thread_ts": {
                "type": "string",
                "description": "オプション：スレッド返信用のタイムスタンプ",
                "optional": True
            }
        }
    )
    async def send_message(
        self,
        channel: str,
        text: str,
        thread_ts: str = None,
        context: Context = None
    ) -> Dict[str, Any]:
        """Slackにメッセージを送信"""
        try:
            response = self.client.chat_postMessage(
                channel=channel,
                text=text,
                thread_ts=thread_ts
            )
            return {
                "success": True,
                "ts": response["ts"],
                "channel": response["channel"]
            }
        except SlackApiError as e:
            return {
                "success": False,
                "error": str(e)
            }

    @Tool(
        name="get_channel_history",
        description="チャンネルの最近のメッセージ履歴を取得",
        parameters={
            "channel": {
                "type": "string",
                "description": "チャンネルIDまたは名前"
            },
            "limit": {
                "type": "integer",
                "description": "取得するメッセージ数（デフォルト：10）",
                "optional": True
            }
        }
    )
    async def get_channel_history(
        self,
        channel: str,
        limit: int = 10,
        context: Context = None
    ) -> List[Dict[str, Any]]:
        """チャンネル履歴を取得"""
        try:
            response = self.client.conversations_history(
                channel=channel,
                limit=limit
            )
            messages = response["messages"]

            # ユーザー名解決
            parsed_messages = []
            for msg in messages:
                user_id = msg.get("user")
                user_info = self.client.users_info(user=user_id) if user_id else None
                parsed_messages.append({
                    "text": msg.get("text"),
                    "user": user_info["user"]["real_name"] if user_info else "Unknown",
                    "timestamp": msg.get("ts")
                })

            return parsed_messages
        except SlackApiError as e:
            return [{"error": str(e)}]

    @Tool(
        name="add_reaction",
        description="メッセージに絵文字リアクションを追加",
        parameters={
            "channel": {"type": "string", "description": "チャンネルID"},
            "timestamp": {"type": "string", "description": "メッセージタイムスタンプ"},
            "emoji": {"type": "string", "description": "絵文字名（例：thumbsup）"}
        }
    )
    async def add_reaction(
        self,
        channel: str,
        timestamp: str,
        emoji: str,
        context: Context = None
    ) -> Dict[str, bool]:
        """メッセージにリアクションを追加"""
        try:
            self.client.reactions_add(
                channel=channel,
                timestamp=timestamp,
                name=emoji
            )
            return {"success": True}
        except SlackApiError as e:
            return {"success": False, "error": str(e)}

# MCPサーバー起動
if __name__ == "__main__":
    server = SlackMCPServer()
    server.run(transport="stdio")  # stdio または websocket
```

**エージェントで使用**：

```python
from openai_agents import Agent, Runner
import subprocess
import json

# MCPサーバープロセス起動
mcp_process = subprocess.Popen(
    ["python", "slack_mcp_server.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Slackツールを持つエージェント
slack_agent = Agent(
    name="Slack Assistant",
    instructions="""
    あなたはSlack管理アシスタントです。

    できること：
    - メッセージ送信
    - チャンネル履歴確認
    - 絵文字リアクション追加

    ユーザーリクエストを分析し、適切なSlack操作を実行してください。
    """,
    mcp_servers=["slack"]  # MCPサーバー接続
)

# 実行
runner = Runner(agents=[slack_agent])
result = runner.run(
    agent=slack_agent,
    messages=[{
        "role": "user",
        "content": "#engineeringチャンネルに「本番デプロイが完了しました✅」と投稿してください"
    }]
)

print(result.output)
```

### 2.2 MCPサーバーのベストプラクティス

1. **エラーハンドリング**：すべてのツール呼び出しを`try-except`でラップ
2. **認証**：環境変数でAPIキーを管理（`.env`ファイル）
3. **レート制限**：APIレート制限を考慮（バックオフ戦略実装）
4. **ロギング**：デバッグ用の詳細ログ
5. **型安全性**：Pydanticでパラメータ検証
6. **ドキュメント**：各ツールに明確な説明を追加

---

## 3. 本番環境モニタリング（Evals使用）

AgentKitの**Evals**機能は、エージェントパフォーマンスを継続的に監視・最適化します。

### 3.1 A/Bテストでプロンプト最適化

**シナリオ**：カスタマーサポートエージェントの2つのプロンプトバージョンを比較

```python
from openai_agents import Agent, Runner
from openai_agents.evals import ABTest, Metric
import random

# バージョンA：フォーマル
agent_a = Agent(
    name="Support Agent A",
    instructions="""
    あなたはプロフェッショナルなカスタマーサポート担当者です。

    対応方針：
    - フォーマルで丁寧な言葉遣い
    - 詳細な説明
    - 社内規定遵守
    """
)

# バージョンB：カジュアル
agent_b = Agent(
    name="Support Agent B",
    instructions="""
    あなたはフレンドリーなカスタマーサポート担当者です。

    対応方針：
    - カジュアルで親しみやすい言葉遣い
    - 簡潔な回答
    - 共感を示す
    """
)

# A/Bテスト設定
ab_test = ABTest(
    name="Support Tone Experiment",
    variants={
        "formal": agent_a,
        "casual": agent_b
    },
    traffic_split={"formal": 0.5, "casual": 0.5},  # 50/50分割
    metrics=[
        Metric(name="response_time", type="latency"),
        Metric(name="user_satisfaction", type="rating"),  # 1-5スケール
        Metric(name="resolution_rate", type="binary")     # 解決/未解決
    ]
)

# ユーザーリクエストシミュレーション
test_queries = [
    "注文が届きませんでした",
    "返金リクエストしたいです",
    "アカウントをキャンセルする方法は？",
    # ... 100件のテストケース
]

runner = Runner(agents=[agent_a, agent_b])

for query in test_queries:
    # ランダムにバリアント選択（50/50）
    variant = random.choice(["formal", "casual"])
    agent = agent_a if variant == "formal" else agent_b

    result = runner.run(
        agent=agent,
        messages=[{"role": "user", "content": query}]
    )

    # メトリクス記録
    ab_test.record_result(
        variant=variant,
        query=query,
        metrics={
            "response_time": result.latency,
            "user_satisfaction": 4.2,  # 実際にはユーザーフィードバックから取得
            "resolution_rate": 1 if "解決" in result.output else 0
        }
    )

# 結果分析
report = ab_test.analyze()
print(f"""
A/Bテスト結果：

フォーマルバージョン：
- 平均応答時間：{report['formal']['response_time']}秒
- ユーザー満足度：{report['formal']['user_satisfaction']}/5
- 解決率：{report['formal']['resolution_rate']}%

カジュアルバージョン：
- 平均応答時間：{report['casual']['response_time']}秒
- ユーザー満足度：{report['casual']['user_satisfaction']}/5
- 解決率：{report['casual']['resolution_rate']}%

勝者：{report['winner']} （信頼度：{report['confidence']}%）
""")
```

### 3.2 自動プロンプト最適化

Evalsは機械学習を使用してプロンプトを自動改善できます：

```python
from openai_agents.evals import PromptOptimizer

optimizer = PromptOptimizer(
    agent=agent_a,
    objective="user_satisfaction",  # 最適化する指標
    baseline_score=3.8,              # 現在のベースライン
    improvement_threshold=0.2        # 最小改善幅
)

# 100回の反復で最適化
best_prompt = optimizer.optimize(
    test_dataset=test_queries,
    iterations=100,
    techniques=["few-shot", "chain-of-thought", "self-critique"]
)

print(f"最適化されたプロンプト:\n{best_prompt}")
print(f"改善度：+{optimizer.improvement}（満足度 3.8 → 4.0）")
```

---

## 4. エンタープライズセキュリティとコンプライアンス

### 4.1 マルチテナンシー実装

**シナリオ**：SaaSプラットフォームで複数の顧客がエージェントを共有、データは厳格に分離

```python
from openai_agents import Agent, Runner, Session
from typing import Dict, Any
import hashlib

class TenantIsolatedAgent:
    def __init__(self):
        self.base_agent = Agent(
            name="Multi-Tenant Assistant",
            instructions="""
            あなたはマルチテナントSaaSアシスタントです。

            重要なセキュリティルール：
            1. tenant_idは変更不可
            2. 他のテナントのデータには絶対にアクセスしない
            3. すべてのクエリにtenant_idフィルターを追加
            """
        )
        self.runner = Runner(agents=[self.base_agent])

    def create_tenant_session(self, tenant_id: str) -> Session:
        """テナント固有のセッション作成"""
        # セッションIDをテナントIDで名前空間化
        session_id = hashlib.sha256(f"{tenant_id}:session".encode()).hexdigest()

        session = Session(
            id=session_id,
            metadata={
                "tenant_id": tenant_id,
                "data_scope": f"WHERE tenant_id = '{tenant_id}'",  # SQLインジェクション
                "access_level": "tenant_isolated"
            }
        )
        return session

    def query_with_isolation(
        self,
        tenant_id: str,
        user_query: str
    ) -> Dict[str, Any]:
        """テナント分離されたクエリ実行"""
        session = self.create_tenant_session(tenant_id)

        # テナントコンテキストをシステムメッセージに注入
        result = self.runner.run(
            agent=self.base_agent,
            session=session,
            messages=[
                {
                    "role": "system",
                    "content": f"[SECURITY] あなたは現在tenant_id='{tenant_id}'のコンテキストで動作しています。他のテナントデータには絶対にアクセスしないでください。"
                },
                {
                    "role": "user",
                    "content": user_query
                }
            ]
        )

        return result

# 使用例
assistant = TenantIsolatedAgent()

# テナントA
result_a = assistant.query_with_isolation(
    tenant_id="tenant_abc123",
    user_query="先月の売上レポートを表示してください"
)

# テナントB（完全に分離）
result_b = assistant.query_with_isolation(
    tenant_id="tenant_xyz789",
    user_query="先月の売上レポートを表示してください"
)

# result_aとresult_bは異なるデータを返す
```

### 4.2 GDPR/CCPAコンプライアンス

**データ削除リクエスト処理**：

```python
from openai_agents import Agent, Runner
from datetime import datetime
import json

class GDPRCompliantAgent:
    def __init__(self):
        self.agent = Agent(
            name="GDPR Agent",
            instructions="""
            あなたはGDPRコンプライアンス担当です。

            ユーザーの権利：
            1. データアクセス権（Right to Access）
            2. データ削除権（Right to Erasure）
            3. データポータビリティ権（Right to Data Portability）
            4. 処理制限権（Right to Restriction）
            """
        )
        self.audit_log = []

    def handle_deletion_request(self, user_id: str) -> Dict[str, Any]:
        """ユーザーデータ削除リクエスト処理"""
        runner = Runner(agents=[self.agent])

        result = runner.run(
            agent=self.agent,
            messages=[{
                "role": "user",
                "content": f"User ID {user_id}のすべての個人データを削除してください。GDPR第17条に基づきます。"
            }]
        )

        # 監査ログ記録
        self.audit_log.append({
            "timestamp": datetime.now().isoformat(),
            "action": "data_deletion",
            "user_id": user_id,
            "status": "completed",
            "regulation": "GDPR Article 17"
        })

        return {
            "success": True,
            "deleted_records": result.output,
            "audit_id": len(self.audit_log)
        }

    def export_user_data(self, user_id: str) -> str:
        """ユーザーデータをJSON形式でエクスポート"""
        runner = Runner(agents=[self.agent])

        result = runner.run(
            agent=self.agent,
            messages=[{
                "role": "user",
                "content": f"User ID {user_id}のすべての個人データをJSON形式でエクスポートしてください。GDPR第20条に基づきます。"
            }]
        )

        # 監査ログ記録
        self.audit_log.append({
            "timestamp": datetime.now().isoformat(),
            "action": "data_export",
            "user_id": user_id,
            "regulation": "GDPR Article 20"
        })

        return result.output  # JSON文字列

    def get_audit_trail(self) -> str:
        """監査証跡取得"""
        return json.dumps(self.audit_log, indent=2, ensure_ascii=False)

# 使用例
gdpr_agent = GDPRCompliantAgent()

# ユーザーがデータ削除リクエスト
deletion_result = gdpr_agent.handle_deletion_request(user_id="user_12345")
print(f"削除完了：{deletion_result['deleted_records']}件のレコード")

# ユーザーがデータエクスポートリクエスト
exported_data = gdpr_agent.export_user_data(user_id="user_67890")
print(f"エクスポートされたデータ:\n{exported_data}")

# 監査証跡確認
audit_trail = gdpr_agent.get_audit_trail()
print(f"監査ログ:\n{audit_trail}")
```

---

## 5. 実世界のケーススタディ

### ケーススタディ 1：SaaSオンボーディング自動化

**企業**：ProjectManage Pro（架空のプロジェクト管理SaaS）

**課題**：新規ユーザーのオンボーディングプロセスが遅く（平均7日）、チャーン率が高い（30日以内に40%離脱）

**AgentKit実装**：

```python
from openai_agents import Agent, Runner

# オンボーディングマネージャー
onboarding_manager = Agent(
    name="Onboarding Manager",
    instructions="""
    新規ユーザーを7日間でオンボーディングします。

    Day 1: アカウント設定、最初のプロジェクト作成
    Day 2: チームメンバー招待、権限設定
    Day 3: タスク作成、カンバンボード使用法
    Day 4: 統合設定（Slack/GitHub/Jira）
    Day 5: レポート機能、ダッシュボード
    Day 6: 自動化ワークフロー作成
    Day 7: ベストプラクティス、プロTips

    各ステップ完了後、次のステップにハンドオフ。
    """,
    handoffs=["Setup Specialist", "Integration Specialist", "Automation Coach"]
)

# 各専門エージェント
setup_specialist = Agent(
    name="Setup Specialist",
    instructions="アカウント設定とプロジェクト初期化をガイドします。"
)

integration_specialist = Agent(
    name="Integration Specialist",
    instructions="Slack、GitHub、Jiraなどの統合設定を支援します。"
)

automation_coach = Agent(
    name="Automation Coach",
    instructions="ワークフロー自動化のベストプラクティスを教えます。"
)

# 実行
runner = Runner(agents=[
    onboarding_manager,
    setup_specialist,
    integration_specialist,
    automation_coach
])

result = runner.run(
    agent=onboarding_manager,
    messages=[{
        "role": "user",
        "content": "新規ユーザーJohn Doeのオンボーディングを開始してください。"
    }]
)
```

**結果**：

- **オンボーディング時間**：7日 → 2日（70%短縮）
- **30日チャーン率**：40% → 12%（28ポイント改善）
- **アクティベーション率**：45% → 78%（73%向上）
- **カスタマーサポートチケット**：50%削減

### ケーススタディ 2：データパイプライン自動復旧

**企業**：DataFlow Analytics（ビッグデータ分析プラットフォーム）

**課題**：ETLパイプラインの障害が頻繁に発生（週に5-10回）、手動復旧に平均2時間かかる

**AgentKit実装**：

```python
from openai_agents import Agent, Runner
import asyncio

# インシデントレスポンダー
incident_responder = Agent(
    name="Incident Responder",
    instructions="""
    データパイプラインの障害を自動診断・復旧します。

    診断手順：
    1. エラーログ分析
    2. 根本原因特定
    3. 復旧戦略決定
    4. 自動修正試行
    5. 成功確認またはエスカレーション

    一般的な問題：
    - API レート制限 → バックオフ再試行
    - データスキーマ変更 → スキーマ自動調整
    - メモリ不足 → チャンク処理に切り替え
    - タイムアウト → タイムアウト設定増加
    """,
    handoffs=["Database Specialist", "API Specialist"]
)

database_specialist = Agent(
    name="Database Specialist",
    instructions="データベース関連の問題（接続、クエリ最適化、スキーマ）を処理します。"
)

api_specialist = Agent(
    name="API Specialist",
    instructions="外部API統合の問題（認証、レート制限、レスポンス形式）を処理します。"
)

# 監視ループ
async def monitor_pipeline():
    runner = Runner(agents=[incident_responder, database_specialist, api_specialist])

    while True:
        # パイプライン健全性チェック（5分ごと）
        await asyncio.sleep(300)

        # 障害検知シミュレーション
        pipeline_status = check_pipeline_health()  # 架空の関数

        if pipeline_status["status"] == "failed":
            print(f"障害検知：{pipeline_status['error']}")

            # エージェント自動起動
            result = runner.run(
                agent=incident_responder,
                messages=[{
                    "role": "user",
                    "content": f"パイプライン障害を修正してください：{pipeline_status['error']}"
                }]
            )

            if "修正完了" in result.output:
                print(f"自動復旧成功：{result.output}")
            else:
                print(f"人間へエスカレーション：{result.output}")

# 実行
asyncio.run(monitor_pipeline())
```

**結果**：

- **MTTR（平均復旧時間）**：2時間 → 22分（82%短縮）
- **自動復旧成功率**：0% → 73%
- **オンコールエンジニアの負担**：週40時間 → 週8時間（80%削減）
- **パイプラインアップタイム**：92% → 99.2%

### ケーススタディ 3：DevOpsワークフロー自動化

**企業**：MicroServices Corp（マイクロサービスアーキテクチャ採用企業）

**課題**：毎日50+回のデプロイ、手動レビューがボトルネック（デプロイ待ち時間平均3時間）

**AgentKit実装**：

```python
from openai_agents import Agent, Runner

# デプロイマネージャー
deploy_manager = Agent(
    name="Deploy Manager",
    instructions="""
    プルリクエストを自動レビューしてデプロイします。

    レビュー基準：
    1. すべてのテスト合格
    2. コードカバレッジ80%以上
    3. セキュリティスキャン問題なし
    4. パフォーマンス回帰なし
    5. ブレイキングチェンジなし

    承認 → ステージング → カナリアデプロイ → プロダクション
    問題検知 → 自動ロールバック
    """,
    handoffs=["Test Analyzer", "Security Scanner", "Performance Monitor"]
)

test_analyzer = Agent(
    name="Test Analyzer",
    instructions="テスト結果を分析し、カバレッジとパス率を確認します。"
)

security_scanner = Agent(
    name="Security Scanner",
    instructions="OWASP Top 10、依存関係の脆弱性をスキャンします。"
)

performance_monitor = Agent(
    name="Performance Monitor",
    instructions="応答時間、スループット、エラー率を監視します。"
)

# GitHubウェブフックで起動
def on_pull_request_opened(pr_data):
    runner = Runner(agents=[
        deploy_manager,
        test_analyzer,
        security_scanner,
        performance_monitor
    ])

    result = runner.run(
        agent=deploy_manager,
        messages=[{
            "role": "user",
            "content": f"PR #{pr_data['number']}をレビューしてデプロイしてください。"
        }]
    )

    if "承認" in result.output:
        print(f"自動デプロイ開始：{result.output}")
    else:
        print(f"デプロイブロック：{result.output}")
```

**結果**：

- **デプロイ待ち時間**：3時間 → 8分（96%短縮）
- **手動レビュー負担**：1日8時間 → 1日30分（94%削減）
- **デプロイ頻度**：1日50回 → 1日200回（300%増加）
- **プロダクション障害**：週3回 → 月1回（92%削減）

---

## 6. パフォーマンス最適化

### 6.1 並列処理

複数の独立タスクを並列実行してレイテンシを削減：

```python
from openai_agents import Agent, Runner
import asyncio

agents = [
    Agent(name="Agent 1", instructions="タスク1を処理"),
    Agent(name="Agent 2", instructions="タスク2を処理"),
    Agent(name="Agent 3", instructions="タスク3を処理")
]

runner = Runner(agents=agents)

# 並列実行
async def run_parallel():
    tasks = [
        runner.run_async(agent=agents[0], messages=[{"role": "user", "content": "タスク1"}]),
        runner.run_async(agent=agents[1], messages=[{"role": "user", "content": "タスク2"}]),
        runner.run_async(agent=agents[2], messages=[{"role": "user", "content": "タスク3"}])
    ]
    results = await asyncio.gather(*tasks)
    return results

results = asyncio.run(run_parallel())
# 3秒 → 1秒（67%高速化）
```

### 6.2 ストリーミングレスポンス

長い応答にはストリーミングを使用してFirst Byte Time（FBT）を改善：

```python
from openai_agents import Agent, Runner

agent = Agent(
    name="Streaming Agent",
    instructions="詳細な応答をストリーミングで提供します。"
)

runner = Runner(agents=[agent])

# ストリーミング有効化
for chunk in runner.run_stream(
    agent=agent,
    messages=[{"role": "user", "content": "プロジェクトの詳細分析を提供してください"}]
):
    print(chunk, end="", flush=True)  # リアルタイム表示
```

### 6.3 バッチ処理

類似リクエストをバッチ処理してAPIコストを削減：

```python
from openai_agents import Agent, Runner

agent = Agent(name="Batch Processor", instructions="リクエストをバッチ処理します。")

runner = Runner(agents=[agent])

# 100件のリクエストをバッチ処理
requests = [f"リクエスト {i}" for i in range(100)]

results = runner.run_batch(
    agent=agent,
    messages=[{"role": "user", "content": req} for req in requests],
    batch_size=10  # 10件ずつ処理
)

# 100 API呼び出し → 10 API呼び出し（90%削減）
```

---

## まとめ

パート2では、AgentKitの高度な機能を探りました：

1. **エンタープライズアーキテクチャパターン**：階層型、イベント駆動型、グラフベースの3つのパターン
2. **カスタムMCPサーバー**：Slack統合など、独自ツール開発方法
3. **本番環境監視**：EvalsでのA/Bテスト、自動プロンプト最適化
4. **セキュリティとコンプライアンス**：マルチテナンシー、GDPR対応
5. **実世界ケーススタディ**：SaaSオンボーディング70%時間短縮、データパイプライン自動復旧82% MTTR削減、DevOps手動レビュー94%削減
6. **パフォーマンス最適化**：並列処理、ストリーミング、バッチ処理

AgentKitは、理論から実践まで、あらゆるスケールのAIエージェントシステムを構築できる強力なプラットフォームです。

**次のステップ**：

- [OpenAI AgentKit公式ドキュメント](https://platform.openai.com/docs/agents)
- [MCPプロトコル仕様](https://modelcontextprotocol.io)
- [Agent Builderベータアクセス](https://platform.openai.com/agent-builder)
- [コミュニティサンプル](https://github.com/openai/openai-agents-examples)

プロダクション環境でのエージェント構築を始めましょう！
