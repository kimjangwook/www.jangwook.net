---
title: 'AWS MCP Server GA 実践ガイド — CloudWatch·IAMでAIエージェントにAWSを理解させる'
description: 'AWS MCPサーバーが2026年5月に正式リリース。uvx 1行でCloudWatch 31ツールとIAM 29ツールをClaude Codeに接続した実践レポート。IAM条件キー(aws:ViaAWSMCPService)基盤のエージェント権限分離アーキテクチャ分析と実際のAWSアカウント連携テスト結果・率直な評価まで。'
pubDate: '2026-05-14'
heroImage: '../../../assets/blog/aws-mcp-server-ga-practical-guide-2026-hero.png'
tags:
  - AWS
  - MCP
  - CloudWatch
  - IAM
relatedPosts:
  - slug: 'fastmcp-python-mcp-server-build-guide-2026'
    score: 0.88
    reason:
      ko: 'FastMCP로 MCP 서버를 직접 만들어본 경험이 있다면, AWS MCP Server가 내부적으로 FastMCP를 어떻게 활용하는지 코드 레벨에서 이해하는 데 도움이 됩니다.'
      ja: 'FastMCPでMCPサーバーを自作した経験があれば、AWS MCPサーバーがFastMCPをどう活用しているかをコードレベルで理解するのに役立ちます。'
      en: 'If you have built an MCP server with FastMCP, this helps you understand at the code level how AWS MCP Server leverages FastMCP internally.'
      zh: '如果你有用FastMCP自建MCP服务器的经验，这篇文章能帮助你从代码层面理解AWS MCP Server如何在内部使用FastMCP。'
  - slug: 'mcp-security-crisis-30-cves-enterprise-hardening'
    score: 0.85
    reason:
      ko: 'AWS MCP Server의 IAM 보안 아키텍처가 왜 필요한지 이해하려면, MCP 생태계의 보안 취약점 60일 30 CVE 사태를 먼저 읽는 것이 도움이 됩니다.'
      ja: 'AWS MCPサーバーのIAMセキュリティアーキテクチャが必要な理由を理解するには、MCP生態系の60日30 CVE事態を先に読むと理解が深まります。'
      en: 'Understanding why AWS MCP Server needs its IAM security architecture is clearer after reading about the 60-day 30-CVE security crisis in the MCP ecosystem.'
      zh: '要理解AWS MCP Server为什么需要IAM安全架构，先阅读MCP生态系统60天30个CVE安全危机事件会更有帮助。'
  - slug: 'mcp-server-build-practical-guide-2026'
    score: 0.82
    reason:
      ko: 'Streamable HTTP 트랜스포트로 MCP 서버를 직접 구현해봤다면, AWS MCP Server가 제공하는 운영 편의성이 어느 정도의 가치인지 체감하게 됩니다.'
      ja: 'Streamable HTTPトランスポートでMCPサーバーを自作した経験があれば、AWS MCPサーバーが提供する運用の利便性の価値が実感できます。'
      en: "Having built your own MCP server with Streamable HTTP transport puts AWS MCP Server's operational convenience into perspective."
      zh: '如果你曾用Streamable HTTP传输协议自建MCP服务器，就能真实感受到AWS MCP Server提供的运营便利性的价值。'
  - slug: 'gcloud-mcp-infrastructure-audit'
    score: 0.79
    reason:
      ko: 'GCP 인프라를 MCP로 감사한 사례와 비교하면, 클라우드 벤더별 MCP 서버의 아키텍처 철학 차이가 명확해집니다.'
      ja: 'GCPインフラをMCPで監査した事例と比較すると、クラウドベンダーごとのMCPサーバーのアーキテクチャ哲学の違いが明確になります。'
      en: 'Comparing with the GCP infrastructure MCP audit case clarifies the architectural philosophy differences between cloud vendors.'
      zh: '与GCP基础设施MCP审计案例相比，可以清楚看到各云厂商MCP服务器架构理念的差异。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.76
    reason:
      ko: 'Claude Agent SDK에서 Tool Use를 직접 구현하는 방법을 알고 나면, AWS MCP Server가 그 Tool Use 레이어를 어떻게 AWS API로 연결하는지 전체 그림이 보입니다.'
      ja: 'Claude Agent SDKでTool Useを実装する方法を知った後、AWS MCPサーバーがそのTool UseレイヤーをAWS APIにどうつないでいるか全体像が見えます。'
      en: "After learning to implement Tool Use directly in the Claude Agent SDK, you can see the full picture of how AWS MCP Server bridges that Tool Use layer to AWS APIs."
      zh: '了解如何在Claude Agent SDK中实现Tool Use后，就能看清AWS MCP Server如何将Tool Use层连接到AWS API的完整图景。'
---

CloudWatchのアラームが鳴った。Lambda関数のエラー率が閾値を超え、ログを掘り返さなければならない。コンソール画面とターミナルの間を行き来するのが面倒になってきた頃、ふとこんな考えが浮かんだ。「Claude Codeに聞けば良くないか? 自分のCloudWatchを直接見れたら?」

2026年5月6日、AWSがその問いに答えた。**AWS MCPサーバーが正式リリース(GA)された。**

## AWS MCPサーバーとは何か

AWS MCPサーバーは、Claude Code、Cursor、CodexといったAIコーディングエージェントがAWSサービスを直接クエリできるようにする標準インターフェースだ。Anthropicが定義したMCP(Model Context Protocol)をベースに、AWSが自社サービスをMCPツールとしてラッピングして提供する。

`uvx awslabs.cloudwatch-mcp-server@latest` 1行で、Claude CodeがCloudWatch Logsを直接照会し、アラーム状態を確認し、Logs Insightsクエリを実行できるようになる。IAMコンソールに入って手動で設定を確認する必要がなくなる。

[MCPサーバーを自作した経験](/ja/blog/ja/mcp-server-build-practical-guide-2026)があれば理解が早い。AWS MCPサーバーはAWSが公式に管理するMCPサーバーコレクションだ。`awslabs/mcp` GitHubリポジトリで公開されており、PyPIからインストールできる。

### GAが意味すること

GA以前の実験版と比べると3つが変わった:

1. **IAM条件コンテキストキーの追加** — すべてのMCPリクエストに`aws:ViaAWSMCPService`と`aws:CalledViaAWSMCP`の条件キーが自動的に付く。エージェントが行ったAPIコールなのか人間が行ったAPIコールなのかをIAMポリシーで区別できる。
2. **CloudTrail統合** — MCPを通じたすべてのAPIコールがCloudTrailに記録される。エージェントが何をしたのか完全な監査ログが残る。
3. **CloudWatchネームスペース分離** — AWS-MCPネームスペース下に別途メトリクスが発行される。「このAPIコールのうちどれだけがエージェント経由か」をモニタリングできる。

一言で言えば、**エージェントと人間のAWSアクセスをIAMレベルで分離**できるようになった。

## インストール: uvx 1行で完結

実際にインストールしてみた。`uv`がない場合は先にインストールする。

```bash
# uvのインストール（ない場合）
curl -LsSf https://astral.sh/uv/install.sh | sh

# CloudWatch MCPサーバーを即座に実行（自動でvenv作成）
uvx awslabs.cloudwatch-mcp-server@latest

# IAM MCPサーバー
uvx awslabs.iam-mcp-server@latest
```

`uvx`を使えば仮想環境を別途管理する必要がない。初回実行時に必要なパッケージが自動インストールされる。CloudWatchサーバーの場合、53パッケージがインストールされる。botocore、pandas、scipy、statsmodelsまで入る。CloudWatchサーバーが異常検知と統計分析機能を内蔵しているためだ。

バージョンを確認すると:
- `awslabs.cloudwatch-mcp-server` v0.1.1
- `awslabs.iam-mcp-server` v1.0.20

CloudWatchサーバーが0.x台なのは、まだAPIが安定化中という意味だ。IAMサーバーのバージョン1.0.20と対照的だ。

### Claude Codeの設定（.mcp.json）

Claude Codeで使うには、プロジェクトルートに`.mcp.json`を作成する。

```json
{
  "mcpServers": {
    "cloudwatch": {
      "command": "uvx",
      "args": ["awslabs.cloudwatch-mcp-server@latest"],
      "env": {
        "AWS_REGION": "ap-northeast-1",
        "AWS_PROFILE": "default",
        "FASTMCP_LOG_LEVEL": "WARNING"
      }
    },
    "iam": {
      "command": "uvx",
      "args": ["awslabs.iam-mcp-server@latest"],
      "env": {
        "AWS_REGION": "ap-northeast-1",
        "FASTMCP_LOG_LEVEL": "WARNING"
      }
    }
  }
}
```

`FASTMCP_LOG_LEVEL`を`WARNING`にしないと、INFOログがClaude Codeの応答に混ざって出てくる。

## CloudWatch MCPサーバー: 31ツール分析

インストール後に実際にツールリストを確認すると、ちょうど31個が登録される。

**ロググループツール（8個）**:
```
describe_log_groups        - ロググループ一覧取得
analyze_log_group          - ログパターンAI分析
execute_log_insights_query - Logs Insightsクエリ実行
get_logs_insight_query_results - クエリ結果取得
cancel_logs_insight_query  - 実行中クエリのキャンセル
execute_cwl_insights_batch - バッチクエリ実行
recommend_indexes_loggroup - ロググループインデックス推奨
recommend_indexes_account  - アカウント全体インデックス推奨
```

**メトリクスツール（11個）**:
```
get_metric_data            - メトリクスデータ取得
get_metric_metadata        - メトリクスメタデータ（1,179エントリインデックス済み）
analyze_metric             - メトリクス異常検知分析
get_recommended_metric_alarms - アラーム設定推奨
execute_promql_query       - PromQLクエリ実行
execute_promql_range_query - PromQL範囲クエリ
get_active_alarms          - アクティブなアラーム取得
get_alarm_history          - アラーム履歴取得
```

興味深いのは、`get_metric_metadata`ツールがサーバー起動時に**1,179個のメトリクスメタデータをメモリにインデックス化**することだ。サーバーログには:

```
INFO | Loaded 1179 metric metadata entries
INFO | Successfully indexed 1179 metric metadata entries
```

EC2、Lambda、RDS、DynamoDBなどAWS全サービスのメトリクス定義が事前インデックス化されている。エージェントが「Lambda関数のどのメトリクスを見ればいい?」と聞いても、AWSドキュメントを調べなくても即答できる。

### 実際のテスト: 自分のAWSで動かしてみると

自分のAWSアカウント（ap-northeast-1）に接続して実行した。結果をそのまま記す。

```
Available log groups (5):
  /aws/lambda/remotax-renewal-fe-CustomCDKBucketDeployment: 331,695 bytes
  /aws/lambda/remotax-renewal-fe-CustomS3AutoDeleteObjects:   2,038 bytes
  /aws/lambda/remotax-renewal-fe-LambdaServerFunctionHandler:     0 bytes
  /aws/lambda/remotax-renewal-fe-LogRetentionaae0aa3c5b4d4f:     0 bytes
  RDSOSMetrics: 55,192,669 bytes

Active CloudWatch Alarms:
  ✅ EC2-HighCPU-Alarm
     Metric: CPUUtilization | Threshold: 80.0%
     State: OK
  ❓ EC2-HighDiskUsage-Alarm
     State: INSUFFICIENT_DATA
  ❓ EC2-HighMemoryUsage-Alarm
     State: INSUFFICIENT_DATA
  ❓ LaravelErrorAlarm
     State: INSUFFICIENT_DATA

EC2 metrics available: 85
```

`INSUFFICIENT_DATA`状態のアラームが3つある。ディスク/メモリアラームがデータ不足状態というのは、CloudWatch Agentが正しく起動していないことを意味する。以前はCloudWatchコンソールに入って直接確認しなければわからなかった問題だが、エージェントが自動的にこの状態を把握して「CloudWatch Agentの設定を確認してください」と提案できる。

## IAM MCPサーバー: 29ツールとセキュリティアーキテクチャ

IAM MCPサーバーは29ツールを提供する。主要ツール:

```
list_users / get_user / create_user / delete_user
list_roles / create_role
list_policies / get_managed_policy_document
attach_user_policy / detach_user_policy
simulate_principal_policy   ← 核心ツール
```

特に注目したのは`simulate_principal_policy`だ。特定のIAMプリンシパル（ユーザー/ロール）が特定のアクションを実行できるか、実際にAWSにリクエストを送らずシミュレーションする。[MCPセキュリティ脆弱性の30 CVE問題](/ja/blog/ja/mcp-security-crisis-30-cves-enterprise-hardening)を考えると、エージェントがIAM権限を事前検証してから実行できれば、権限超過実行の事故を予防できる。

実際のテスト結果:

```python
response = iam.simulate_principal_policy(
    PolicySourceArn='arn:aws:iam::370193714718:user/remotax-fe',
    ActionNames=[
        'cloudwatch:DescribeAlarms',
        'logs:DescribeLogGroups',
        'iam:ListUsers',
        's3:ListBuckets'
    ],
    ResourceArns=['*']
)

# 結果:
# ✓ cloudwatch:DescribeAlarms: allowed
# ✓ logs:DescribeLogGroups: allowed
# ✓ iam:ListUsers: allowed
# ✓ s3:ListBuckets: allowed
```

### IAM条件キー: エージェントと人間を区別する核心

GA最大の機能がここにある。AWS MCPサーバーを通じたすべてのAPIコールに以下の条件キーが自動的に付く:

- `aws:ViaAWSMCPService` — MCPサービス経由のリクエストを表示
- `aws:CalledViaAWSMCP` — MCPクライアントから発生したリクエストを表示

IAMポリシーでこのキーを使い、エージェント権限を別途制限できる。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": [
        "iam:CreateUser",
        "iam:DeleteUser",
        "iam:AttachUserPolicy"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:ViaAWSMCPService": "true"
        }
      }
    }
  ]
}
```

このポリシーを追加すれば、人間はIAMユーザーを作成できるが、Claude Code（MCPを通じたエージェント）はIAMユーザー作成ができない。同じAWS認証情報を使いながら、エージェントの権限を追加制限できる。

[Claude Agent SDKでTool Useを実装した際](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026)にエージェント権限制御がいかに複雑かを感じたが、この条件キーはAWS自体のインフラレベルでその問題を解決する。

## アーキテクチャ図

![AWS MCPサーバー セキュリティアーキテクチャ](../../../assets/blog/aws-mcp-server-ga-practical-guide-2026-arch.png)

コーディングエージェント → AWS MCPサーバー（stdio）→ AWS API（SigV4認証）の3層構造だ。AWS APIリクエストはすべてCloudTrailに記録され、CloudWatch AWS-MCPネームスペースで別途モニタリングされる。

## 利用可能なAWS MCPサーバー一覧

| サーバー | 用途 | バージョン |
|---------|------|-----------|
| `awslabs.cloudwatch-mcp-server` | CloudWatch Logs/Metrics/Alarms | v0.1.1 |
| `awslabs.iam-mcp-server` | IAM管理 | v1.0.20 |
| `awslabs.aws-api-mcp-server` | すべてのAWS APIコール | 別途 |
| CloudWatch Application Signals | APM/SLOモニタリング | 別途 |
| AWS Network MCP Server | VPC/ネットワーク診断 | 別途 |
| AWS Pricing MCP Server | コスト推定 | 別途 |
| EKS MCP Server | EKSクラスター管理 | 別途 |

[FastMCPでPython MCPサーバーを作った時](/ja/blog/ja/fastmcp-python-mcp-server-build-guide-2026)は各APIごとにツールを個別定義する必要があったが、`aws-api-mcp-server`は単一ツールで全AWS APIを呼び出せる。これは設計として興味深い。

## 率直な評価 — 良い点と残念な点

**良い点:**

IAM条件キーによるエージェント権限分離は実質的に有用だ。AWSでエージェントがインフラを触るのが不安だったなら、この機能で「読み取りはOKだが書き込みはNG」をIAMレベルで強制できる。

PromQLサポートが予想外だった。CloudWatch Container Insightsを使う環境で、PromQLでメトリクスをクエリできる。移植性が高い。

メトリクスメタデータ1,179エントリのインデックス化は実質的に役立つ。エージェントが「Lambda関数のどのメトリクスを見ればいいか」を自ら把握するのにこのインデックスを活用する。

**残念な点:**

CloudWatchサーバーがv0.1.1だ。API安定性に対する保証がまだ弱い。`analyze_log_group`や`analyze_metric`などのAI分析ツールが実際にどれほど機能するか、より多くのテストが必要だ。

コストが心配だ。CloudWatch Logs Insightsクエリはスキャンしたデータ量に応じて課金される。エージェントが無闇にクエリを投げると、ログ照会コストが思ったより早く積み上がる可能性がある。コストガードレールがツールレベルではまだ提供されていない。

IAM MCPサーバーに`create_access_key`があることが少し不安だ。エージェントが新しいアクセスキーを作成するツールが露出している。条件キーで防ぐことはできるが、デフォルト設定でこのツールが有効化されているということは、運用者が意識的にIAMポリシーを設定する必要があるという負担がある。

プロダクション環境には今のところ読み取り専用サーバー（`cloudwatch-mcp-server`）だけ接続することを勧める。IAM MCPサーバーは開発環境で慎重に使うべきだ。

## 始め方

AWS認証情報が設定された環境であれば:

```bash
# uvのインストール（ない場合）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 即座にテスト
uvx awslabs.cloudwatch-mcp-server@latest

# プロジェクトに.mcp.jsonを追加
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "cloudwatch": {
      "command": "uvx",
      "args": ["awslabs.cloudwatch-mcp-server@latest"],
      "env": {
        "AWS_REGION": "ap-northeast-1",
        "FASTMCP_LOG_LEVEL": "WARNING"
      }
    }
  }
}
EOF
```

公式ドキュメントは[awslabs.github.io/mcp](https://awslabs.github.io/mcp)で、ソースは[github.com/awslabs/mcp](https://github.com/awslabs/mcp)で確認できる。

AIエージェントがAWSコンソールレベルの可視性を持つようになるのは避けられない方向だ。AWS MCPサーバーGAはその方向への最初の実用的な一歩だ。
