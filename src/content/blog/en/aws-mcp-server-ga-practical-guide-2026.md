---
title: 'AWS MCP Server GA: CloudWatch & IAM Tools for Claude Code'
description: 'AWS MCP Server went GA May 2026. Connect 31 CloudWatch and 29 IAM tools to Claude Code. IAM condition-key architecture and honest real-world evaluation included.'
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
      ja: 'FastMCPでMCPサーバーを自作した경験があれば、AWS MCPサーバーがFastMCPをどう活用しているかをコードレベルで理解するのに役立ちます。'
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

A CloudWatch alarm fired. Lambda error rate crossed the threshold, and I needed to dig through logs — flipping between the AWS console and my terminal, copying log group names by hand. At some point I had a clear thought: what if Claude Code could just look at my CloudWatch directly?

On May 6, 2026, AWS shipped an answer. **AWS MCP Server hit general availability.**

## What the AWS MCP Server Actually Is

AWS MCP Server gives AI coding agents — Claude Code, Cursor, Codex — a standardized way to query AWS services directly. It wraps AWS APIs as MCP tools, using the Model Context Protocol that Anthropic defined. One `uvx` command wires 31 CloudWatch tools and 29 IAM tools into your coding agent.

Instead of copying log group names from the console and pasting them into CLI commands, you can ask your agent: "Find the Lambda function with the highest error rate in the past hour and summarize the relevant logs." The agent runs the Logs Insights query itself and brings back results.

If you've [built an MCP server from scratch](/en/blog/en/mcp-server-build-practical-guide-2026), you already understand the protocol. AWS MCP Server is the official, AWS-maintained collection of MCP servers for AWS services, published at `awslabs/mcp` on GitHub and installable from PyPI.

### What Changed at GA

Three things matter compared to pre-GA versions:

**IAM condition context keys.** Every API call routed through AWS MCP Server now carries `aws:ViaAWSMCPService` and `aws:CalledViaAWSMCP` condition keys automatically. Your IAM policies can differentiate agent-initiated calls from human-initiated calls.

**Full CloudTrail integration.** Every API call goes to CloudTrail. There's a complete audit trail of what the agent did.

**Separate CloudWatch namespace.** Metrics published under `AWS-MCP` let you monitor how much of your API traffic comes from agents versus direct calls.

The practical upshot: **you can now enforce different IAM permissions for agents and humans while using the same AWS credentials.**

## Installation: One Line with uvx

I installed and ran both servers. Here is what it takes.

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Run CloudWatch MCP server (creates isolated env automatically)
uvx awslabs.cloudwatch-mcp-server@latest

# Run IAM MCP server
uvx awslabs.iam-mcp-server@latest
```

`uvx` handles the virtual environment. First run pulls 53 packages for the CloudWatch server — botocore, pandas, scipy, statsmodels, and more. The reason for scipy and statsmodels is that the CloudWatch server includes built-in anomaly detection and statistical analysis on metrics, not just passthrough queries.

Installed versions:
- `awslabs.cloudwatch-mcp-server` v0.1.1
- `awslabs.iam-mcp-server` v1.0.20

The 0.x version on the CloudWatch server signals the API is still stabilizing. That is worth keeping in mind before putting it in production workflows.

### Wiring It Into Claude Code (.mcp.json)

Put this in your project root:

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

Set `FASTMCP_LOG_LEVEL` to `WARNING`. Without it, INFO logs bleed into the agent's responses. You can also install via the Claude Code CLI: `claude mcp add aws-mcp-server`.

## CloudWatch MCP Server: 31 Tools

When the server starts, it registers exactly 31 tools. Here is the breakdown.

**Log group tools (8):**
```
describe_log_groups         List log groups
analyze_log_group           AI-powered log pattern analysis
execute_log_insights_query  Run a Logs Insights query
get_logs_insight_query_results  Poll query results
cancel_logs_insight_query   Cancel a running query
execute_cwl_insights_batch  Batch query execution
recommend_indexes_loggroup  Index recommendations for a log group
recommend_indexes_account   Account-wide index recommendations
```

**Metrics tools (11):**
```
get_metric_data             Fetch metric data points
get_metric_metadata         Metadata lookup (1,179 entries indexed at startup)
analyze_metric              Anomaly detection on a metric
get_recommended_metric_alarms  Suggest alarm thresholds
execute_promql_query        Run a PromQL query
execute_promql_range_query  PromQL range query
get_promql_label_values     PromQL label values
get_promql_series           PromQL series
get_promql_labels           PromQL labels
get_active_alarms           List active alarms
get_alarm_history           Alarm state history
```

The `get_metric_metadata` detail is worth noting. At startup, the server loads and indexes 1,179 metric metadata entries covering EC2, Lambda, RDS, DynamoDB, and most other AWS services. The server logs show it explicitly:

```
INFO | Loaded 1179 metric metadata entries
INFO | Successfully indexed 1179 metric metadata entries
```

This is what allows the agent to answer "which metric measures Lambda cold start duration?" without hitting the AWS docs.

### What I Found on My Account

I ran this against a real ap-northeast-1 account. The output:

```
Available log groups (5):
  /aws/lambda/remotax-renewal-fe-CustomCDKBucketDeployment: 331,695 bytes
  /aws/lambda/remotax-renewal-fe-CustomS3AutoDeleteObjects:   2,038 bytes
  /aws/lambda/remotax-renewal-fe-LambdaServerFunctionHandler:     0 bytes
  /aws/lambda/remotax-renewal-fe-LogRetentionaae0aa3c5b4d4f:     0 bytes
  RDSOSMetrics: 55,192,669 bytes

Active CloudWatch Alarms:
  OK    EC2-HighCPU-Alarm
        CPUUtilization >= 80% | Currently: OK
  ?     EC2-HighDiskUsage-Alarm
        disk_used_percent >= 80% | INSUFFICIENT_DATA
  ?     EC2-HighMemoryUsage-Alarm
        mem_used_percent >= 80% | INSUFFICIENT_DATA
  ?     LaravelErrorAlarm
        LaravelErrorCount >= 1 | INSUFFICIENT_DATA

EC2 metrics available: 85
```

Three alarms sitting in `INSUFFICIENT_DATA`. Disk and memory alarms with no data means CloudWatch Agent is not running or misconfigured on those EC2 instances. That is the kind of silent infrastructure problem that usually only surfaces when an alert should fire and doesn't. The agent picked it up immediately.

## IAM MCP Server: 29 Tools and the Security Architecture That Matters

The IAM server ships 29 tools:

```
list_users / get_user / create_user / delete_user
list_roles / create_role
list_policies / get_managed_policy_document
attach_user_policy / detach_user_policy
create_access_key / delete_access_key
simulate_principal_policy    ← the important one
list_groups / create_group / delete_group
add_user_to_group / remove_user_from_group
put_role_policy / get_role_policy / delete_role_policy
```

I find `simulate_principal_policy` the most useful. It checks whether an IAM principal can perform specific actions without actually making those API calls. After reading about [MCP ecosystem security vulnerabilities and 30 CVEs](/en/blog/en/mcp-security-crisis-30-cves-enterprise-hardening), having agents pre-validate their permissions before executing is a meaningful safety step.

Test run against my account:

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

# Results:
# ✓ cloudwatch:DescribeAlarms: allowed
# ✓ logs:DescribeLogGroups: allowed
# ✓ iam:ListUsers: allowed
# ✓ s3:ListBuckets: allowed
```

### The Condition Key Architecture

This is the part I think matters most about the GA release. Every API call through AWS MCP Server automatically carries:

- `aws:ViaAWSMCPService` — marks this as a request via an MCP service
- `aws:CalledViaAWSMCP` — marks this as originating from an MCP client

An IAM deny policy using these keys:

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

With this policy, a human using the AWS console can manage IAM users. Claude Code using the same credentials cannot. Same key pair, different effective permissions. When I was [implementing Tool Use in the Claude Agent SDK](/en/blog/en/claude-agent-sdk-tool-use-complete-guide-2026), I had to build agent permission scoping into application logic. AWS is solving that at the infrastructure layer here.

## Architecture

![AWS MCP Server Security Architecture — CloudWatch, IAM, CloudTrail](../../../assets/blog/aws-mcp-server-ga-practical-guide-2026-arch.png)

Three layers: coding agent → AWS MCP Server (stdio) → AWS API (SigV4 auth). Every AWS API call goes to CloudTrail. Metrics land in the AWS-MCP CloudWatch namespace separately from direct human calls.

## Available AWS MCP Servers

| Server | Purpose | Version |
|--------|---------|---------|
| `awslabs.cloudwatch-mcp-server` | Logs, Metrics, Alarms | v0.1.1 |
| `awslabs.iam-mcp-server` | IAM management | v1.0.20 |
| `awslabs.aws-api-mcp-server` | Any AWS API | separate |
| CloudWatch Application Signals | APM/SLO monitoring | separate |
| AWS Network MCP Server | VPC/network diagnostics | separate |
| AWS Pricing MCP Server | Cost estimation | separate |
| EKS MCP Server | EKS cluster management | separate |

The `aws-api-mcp-server` is interesting. It exposes every AWS API through a single tool. When [building a FastMCP-based MCP server](/en/blog/en/fastmcp-python-mcp-server-build-guide-2026), each API endpoint needed its own tool definition. The aws-api-mcp-server flips that — one tool, all APIs. The trade-off is that the agent needs more context to figure out which API to call.

## Honest Assessment — What Works, What Doesn't

**What I find genuinely useful:**

The IAM condition key separation is real. If you've been hesitant to give agents AWS access because you can't restrict them beyond the IAM user's permissions, this changes the calculation. You can attach `aws:ViaAWSMCPService` deny statements to enforce read-only agent access while keeping full human access with the same credentials.

PromQL support surprised me. CloudWatch supports PromQL for Container Insights metrics, and the MCP server exposes it. If you run Kubernetes on EKS and already write PromQL, you can use that syntax directly through the agent.

The 1,179-entry metric metadata index means the agent can reason about AWS services it has never seen before in your specific account. It knows what metrics EC2, Lambda, RDS, and most other services expose without needing to query AWS each time.

**What gives me pause:**

CloudWatch server at v0.1.1. The AI analysis tools like `analyze_log_group` and `analyze_metric` look promising but I have not stress-tested them. A 0.x version in production tooling warrants caution.

Logs Insights cost. CloudWatch charges for scanned log data in Insights queries. An agent with unconstrained query access could run up meaningful charges. There are no cost guardrails at the tool level — that has to be managed at the IAM level (restricting query scope) or through agent instructions.

`create_access_key` in the IAM server. An agent tool that creates new AWS access keys is, by default, accessible. The condition key approach can block it, but you have to set that up deliberately. I would not wire up the IAM server in a production environment without first adding explicit deny policies for the write operations.

My recommendation: start with `cloudwatch-mcp-server` in read-heavy workflows. Treat the IAM server as a development tool until you have the deny policies in place.

## Getting Started

If AWS credentials are configured:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test immediately
uvx awslabs.cloudwatch-mcp-server@latest

# Add to a project
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "cloudwatch": {
      "command": "uvx",
      "args": ["awslabs.cloudwatch-mcp-server@latest"],
      "env": {
        "AWS_REGION": "us-east-1",
        "FASTMCP_LOG_LEVEL": "WARNING"
      }
    }
  }
}
EOF
```

Official docs: [awslabs.github.io/mcp](https://awslabs.github.io/mcp). Source: [github.com/awslabs/mcp](https://github.com/awslabs/mcp). Free to use — you pay only for the AWS resources the agent touches.

AI agents having console-level visibility into AWS infrastructure is coming regardless. AWS MCP Server GA is the first production-ready step in that direction.
