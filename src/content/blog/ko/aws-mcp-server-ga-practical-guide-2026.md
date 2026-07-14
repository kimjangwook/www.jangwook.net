---
title: 'AWS MCP Server GA 실전 가이드 — CloudWatch·IAM 에이전트 연동 완전 분석'
description: 'AWS MCP Server가 2026년 5월 정식 출시됐다. uvx 한 줄로 CloudWatch 31개 도구와 IAM 29개 도구를 Claude Code에 연결한 실전 설치기. IAM 조건 키 기반 에이전트 권한 분리 아키텍처와 실제 AWS 계정 테스트 결과, 솔직한 평가까지.'
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
      ko: 'GCP 인프라를 MCP로 감사한 사례와 비교하면, 클라우드 벤더별 MCP 서버의 아키텍처 철학 차이(GCP의 gcloud 래핑 vs AWS의 IAM 네이티브)가 명확해집니다.'
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

CloudWatch 알람이 울렸다. Lambda 함수 오류율이 임계치를 넘었고, 로그를 뒤져야 하는데 콘솔 창과 터미널 사이를 오가는 게 지겹다. 그때 문득 이런 생각이 들었다: "Claude Code한테 물어보면 안 되나? 얘가 내 CloudWatch를 직접 볼 수 있으면 어떨까?"

2026년 5월 6일, AWS가 그 질문에 답했다. **AWS MCP Server가 정식 출시(GA)됐다.**

## AWS MCP Server란 무엇인가

AWS MCP Server는 Claude Code, Cursor, Codex 같은 AI 코딩 에이전트가 AWS 서비스를 직접 쿼리할 수 있게 해주는 표준 인터페이스다. Anthropic이 정의한 MCP(Model Context Protocol)를 기반으로, AWS가 자사 서비스를 MCP 도구(tool)로 래핑해서 제공한다.

`uvx awslabs.cloudwatch-mcp-server@latest` 한 줄이면 Claude Code가 CloudWatch Logs를 직접 조회하고, 알람 상태를 확인하고, Logs Insights 쿼리를 실행할 수 있다. IAM 콘솔에 들어가서 수동으로 설정을 확인할 필요가 없다.

[MCP 서버를 직접 만들어본 경험](/ko/blog/ko/mcp-server-build-practical-guide-2026)이 있다면 이해가 빠를 것이다. AWS MCP Server는 AWS가 공식적으로 관리하는 MCP 서버 컬렉션이다. `awslabs/mcp` GitHub 저장소에 공개돼 있고, PyPI에서 설치할 수 있다.

### GA가 의미하는 것

GA 이전의 실험 버전과 비교하면 세 가지가 달라졌다:

1. **IAM 조건 컨텍스트 키 추가** — 모든 MCP 요청에 `aws:ViaAWSMCPService`와 `aws:CalledViaAWSMCP` 조건 키가 자동으로 붙는다. 에이전트가 한 API 호출인지 사람이 한 API 호출인지 IAM 정책에서 구분할 수 있다.
2. **CloudTrail 통합** — MCP를 통한 모든 API 호출이 CloudTrail에 기록된다. 에이전트가 무슨 짓을 했는지 완전한 감사 로그가 생긴다.
3. **CloudWatch 네임스페이스 분리** — AWS-MCP 네임스페이스 아래 별도 메트릭이 발행된다. "이 API 호출 중 얼마나 많은 게 에이전트를 통한 건가"를 모니터링할 수 있다.

한마디로, **에이전트와 사람의 AWS 접근을 IAM 레벨에서 분리**할 수 있게 됐다.

## 설치: uvx 한 줄로 끝난다

실제로 설치해봤다. `uv`가 없다면 먼저 설치한다.

```bash
# uv 설치 (없는 경우)
curl -LsSf https://astral.sh/uv/install.sh | sh

# CloudWatch MCP 서버 즉시 실행 (자동으로 venv 생성)
uvx awslabs.cloudwatch-mcp-server@latest

# IAM MCP 서버
uvx awslabs.iam-mcp-server@latest
```

`uvx`를 쓰면 가상환경을 따로 관리할 필요가 없다. 처음 실행 시 필요한 패키지들이 자동으로 설치된다. CloudWatch 서버 기준으로 53개 패키지가 설치되는데, botocore, pandas, scipy, statsmodels까지 들어온다. CloudWatch 서버가 이상 탐지(anomaly detection)와 통계 분석 기능을 내장하고 있기 때문이다.

버전을 확인했더니:
- `awslabs.cloudwatch-mcp-server` v0.1.1
- `awslabs.iam-mcp-server` v1.0.20

CloudWatch 서버가 0.x대인 것은 아직 API가 안정화 중이라는 의미다. IAM 서버의 버전이 1.0.20인 것과 대비된다.

### Claude Code 설정 (.mcp.json)

Claude Code에서 사용하려면 프로젝트 루트에 `.mcp.json`을 만든다.

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

`AWS_PROFILE`로 특정 프로파일을 지정하거나, `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`를 직접 넣을 수도 있다. `FASTMCP_LOG_LEVEL`을 `WARNING`으로 두지 않으면 INFO 로그가 Claude Code 응답에 섞여 나온다.

또는 Claude Code CLI로 직접 추가할 수 있다:

```bash
claude mcp add aws-mcp-server
```

## CloudWatch MCP Server: 31개 도구 분석

설치 후 실제로 도구 목록을 확인했더니 정확히 31개가 등록된다.

**로그 그룹 도구 (8개)**:
```
describe_log_groups       - 로그 그룹 목록 조회
analyze_log_group         - 로그 패턴 AI 분석
execute_log_insights_query - Logs Insights 쿼리 실행
get_logs_insight_query_results - 쿼리 결과 조회
cancel_logs_insight_query - 실행 중인 쿼리 취소
execute_cwl_insights_batch - 배치 쿼리 실행
recommend_indexes_loggroup - 로그 그룹 인덱스 추천
recommend_indexes_account  - 계정 전체 인덱스 추천
```

**메트릭 도구 (11개)**:
```
get_metric_data           - 메트릭 데이터 조회
get_metric_metadata       - 메트릭 메타데이터 (1,179개 항목 인덱스됨)
analyze_metric            - 메트릭 이상 탐지 분석
get_recommended_metric_alarms - 알람 설정 추천
execute_promql_query      - PromQL 쿼리 실행
execute_promql_range_query - PromQL 범위 쿼리
get_promql_label_values   - PromQL 레이블 값 조회
get_promql_series         - PromQL 시리즈 조회
get_promql_labels         - PromQL 레이블 조회
get_active_alarms         - 활성 알람 조회
get_alarm_history         - 알람 히스토리 조회
```

흥미로운 점은 `get_metric_metadata` 도구가 서버 시작 시 **1,179개의 메트릭 메타데이터를 메모리에 인덱싱**한다는 것이다. 서버 로그를 보면:

```
INFO | Loaded 1179 metric metadata entries
INFO | Successfully indexed 1179 metric metadata entries
```

EC2, Lambda, RDS, DynamoDB 등 AWS 전 서비스의 메트릭 정의가 미리 인덱싱돼 있다. 에이전트가 "EC2 CPU 사용률 메트릭 이름이 뭔가요?"라고 물으면 AWS 문서를 찾아보지 않아도 바로 답한다.

### 실제 테스트: 내 AWS에서 실행해보니

내 AWS 계정(ap-northeast-1)에 연결해서 실행했다. 결과를 그대로 옮긴다.

```
Available log groups (5):
  /aws/lambda/remotax-renewal-fe-CustomCDKBucketDeployment...: 331,695 bytes
  /aws/lambda/remotax-renewal-fe-CustomS3AutoDeleteObjects...: 2,038 bytes
  /aws/lambda/remotax-renewal-fe-LambdaServerFunctionHandler: 0 bytes
  /aws/lambda/remotax-renewal-fe-LogRetentionaae0aa3c5b4d4f: 0 bytes
  RDSOSMetrics: 55,192,669 bytes

Active CloudWatch Alarms:
  ✅ EC2-HighCPU-Alarm
     Metric: CPUUtilization | Threshold: 80.0%
     State: OK
  ❓ EC2-HighDiskUsage-Alarm
     Metric: disk_used_percent | Threshold: 80.0%
     State: INSUFFICIENT_DATA
  ❓ EC2-HighMemoryUsage-Alarm
     Metric: mem_used_percent | Threshold: 80.0%
     State: INSUFFICIENT_DATA
  ❓ LaravelErrorAlarm
     Metric: LaravelErrorCount | Threshold: 1.0
     State: INSUFFICIENT_DATA

EC2 metrics available: 85
```

`INSUFFICIENT_DATA` 상태인 알람이 3개다. 디스크/메모리 알람이 데이터 부족 상태라는 건 CloudWatch Agent가 제대로 올라가 있지 않다는 의미다. 이전까지는 CloudWatch 콘솔에 들어가서 직접 확인해야 알았을 문제인데, 에이전트가 자동으로 이 상태를 인식하고 "CloudWatch Agent 설정을 확인하세요"라고 제안할 수 있다.

실제 비용 확인도 됐다. 최근 하루 기준 `$4.61`가 나왔다.

### 에이전트와 실제로 대화하면 어떤가

`.mcp.json` 설정 후 Claude Code에게 실제로 물어봤을 때 어떤 답변이 나오는지 보여주는 것이 가장 정직한 평가다. 실제 사용 패턴을 시뮬레이션하면 이렇게 된다:

```
나: "지난 1시간 동안 오류가 가장 많이 발생한 Lambda 함수 찾아줘"

Claude Code (CloudWatch MCP 사용):
→ describe_log_groups() 호출 → 5개 로그 그룹 확인
→ execute_log_insights_query() 호출:
   "fields @logStream, @message
    | filter @message like /ERROR/
    | stats count(*) as errors by @logStream
    | sort errors desc
    | limit 5"
→ "현재 오류가 가장 많은 함수는 없습니다.
   LaravelErrorAlarm이 INSUFFICIENT_DATA 상태입니다.
   CloudWatch Agent가 실행 중인지 확인해보세요."
```

콘솔을 열지 않고, 쿼리를 직접 작성하지 않고도 인프라 상태를 파악할 수 있다. 물론 응답의 품질은 에이전트가 어떤 쿼리를 생성하는가에 달려 있다. 복잡한 Logs Insights 쿼리를 생성하는 능력은 에이전트와 실제로 며칠 써봐야 알 수 있는 부분이다.

### Logs Insights 비용을 의식해야 한다

CloudWatch Logs Insights는 스캔한 데이터 1 GB당 $0.005를 과금한다. 에이전트가 대형 로그 그룹에 무제한 쿼리를 보내면 비용이 빠르게 쌓인다. 내 테스트 환경의 `RDSOSMetrics` 로그 그룹은 55 MB였지만, 프로덕션 환경에서는 수십 GB 단위가 흔하다.

에이전트 프롬프트에 명시적인 가이드를 넣는 것이 현실적인 해법이다:

```
시스템 프롬프트 예시:
"CloudWatch Logs Insights 쿼리 시, 항상 time range를 1시간 이내로 제한하고
limit 100 이하를 사용하세요. 비용 최적화를 위해 필터 조건 없는
전체 스캔 쿼리는 사용하지 마세요."
```

AWS 측에서 도구 레벨 비용 가드레일을 제공하지 않는 한, 이런 운영 규칙을 직접 만들어야 한다.

## IAM MCP Server: 29개 도구와 보안 아키텍처

IAM MCP Server는 29개 도구를 제공한다. 주요 도구들:

```
list_users / get_user / create_user / delete_user
list_roles / create_role
list_policies / get_managed_policy_document
attach_user_policy / detach_user_policy
create_access_key / delete_access_key
simulate_principal_policy   ← 핵심 도구
list_groups / create_group
add_user_to_group / remove_user_from_group
put_role_policy / get_role_policy
```

여기서 내가 가장 주목한 것은 `simulate_principal_policy`다. 특정 IAM 주체(사용자/역할)가 특정 액션을 수행할 수 있는지 실제 AWS에 요청하지 않고 시뮬레이션한다. [MCP 보안 취약점 문제를 60개 CVE와 함께 다룬 글](/ko/blog/ko/mcp-security-crisis-30-cves-enterprise-hardening)을 쓰면서 느낀 건데, MCP 에이전트가 IAM 권한을 미리 검증하고 실행할 수 있다면 권한 초과 실행 사고를 예방할 수 있다.

실제 테스트 결과:

```python
# IAM Policy Simulation 테스트
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

# 결과:
# ✓ cloudwatch:DescribeAlarms: allowed
# ✓ logs:DescribeLogGroups: allowed
# ✓ iam:ListUsers: allowed
# ✓ s3:ListBuckets: allowed
```

에이전트가 "이 작업을 할 수 있는지"를 먼저 확인하고 실행하는 패턴이 가능해진다.

### IAM 조건 키: 에이전트와 사람을 구분하는 핵심

GA의 가장 중요한 기능이 여기에 있다. AWS MCP Server를 통한 모든 API 호출에는 다음 조건 키가 자동으로 붙는다:

- `aws:ViaAWSMCPService` — MCP 서비스를 통한 요청임을 표시
- `aws:CalledViaAWSMCP` — MCP 클라이언트에서 발생한 요청임을 표시

IAM 정책에서 이 키를 활용해 에이전트 권한을 별도로 제한할 수 있다.

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

이 정책을 추가하면 사람은 IAM 사용자를 만들 수 있지만, Claude Code(MCP를 통한 에이전트)는 IAM 사용자 생성을 할 수 없다. 동일한 AWS 자격증명을 쓰면서도 에이전트의 권한을 추가로 제한할 수 있다. 솔직히 이 기능이 GA에서 가장 잘 설계된 부분이라고 생각한다.

[Claude Agent SDK에서 Tool Use를 구현할 때](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026) 에이전트 권한 제어가 얼마나 복잡한지 느꼈는데, 이 조건 키는 AWS 자체 인프라 수준에서 그 문제를 해결한다.

## 아키텍처 다이어그램

![AWS MCP Server 보안 아키텍처 — CloudWatch, IAM, CloudTrail 연동](../../../assets/blog/aws-mcp-server-ga-practical-guide-2026-arch.png)

코딩 에이전트(Claude Code / Cursor / Codex) → AWS MCP Server(stdio) → AWS API(SigV4 인증)의 3계층 구조다. AWS API 요청은 모두 CloudTrail에 기록되고, CloudWatch AWS-MCP 네임스페이스에서 별도 모니터링된다.

## 현재 사용 가능한 AWS MCP 서버 목록

`awslabs/mcp` 저장소에는 CloudWatch와 IAM 외에도 여러 서버가 있다:

| 서버 | 용도 | 상태 |
|------|------|------|
| `awslabs.cloudwatch-mcp-server` | CloudWatch Logs/Metrics/Alarms | v0.1.1 |
| `awslabs.iam-mcp-server` | IAM 관리 | v1.0.20 |
| `awslabs.aws-api-mcp-server` | 모든 AWS API 호출 | 별도 |
| CloudWatch Application Signals | APM/SLO 모니터링 | 별도 |
| AWS Network MCP Server | VPC/네트워크 진단 | 별도 |
| AWS Pricing MCP Server | 비용 추정 | 별도 |
| EKS MCP Server | EKS 클러스터 관리 | 별도 |

`aws-api-mcp-server`는 특히 주목할 만하다. 단일 도구로 모든 AWS API를 호출할 수 있다는 의미인데, 이는 [FastMCP로 Python MCP 서버를 만들 때](/ko/blog/ko/fastmcp-python-mcp-server-build-guide-2026) 각 API마다 도구를 따로 정의해야 했던 것과 대비된다.

## 솔직한 평가 — 좋은 것과 아쉬운 것

GA라는 이름에 걸맞게 잘 된 부분이 있고, 아직 거칠게 느껴지는 부분도 있다.

**좋은 점:**

첫째, IAM 조건 키를 통한 에이전트 권한 분리는 실질적으로 유용하다. AWS에서 에이전트가 인프라를 건드리는 게 불안했다면, 이 기능으로 "읽기는 되지만 쓰기는 안 된다"를 IAM 레벨에서 강제할 수 있다.

둘째, PromQL 지원이 예상 밖이었다. CloudWatch Container Insights를 쓰는 환경에서 PromQL로 메트릭을 쿼리할 수 있다. Prometheus 쿼리 문법을 그대로 쓸 수 있어서 이식성이 좋다.

셋째, 메트릭 메타데이터 1,179개 인덱싱이 실질적으로 도움이 된다. 에이전트가 "Lambda 함수의 어떤 메트릭을 봐야 하는가"를 스스로 파악하는 데 이 인덱스를 활용한다.

**아쉬운 점:**

첫째, CloudWatch 서버가 v0.1.1이다. API 안정성에 대한 보장이 아직 약하다는 의미다. `analyze_log_group`이나 `analyze_metric` 같은 AI 분석 도구들이 실제로 얼마나 잘 작동하는지 더 테스트가 필요하다.

둘째, 비용이 걱정된다. CloudWatch Logs Insights 쿼리는 스캔한 데이터량에 따라 과금된다. 에이전트가 무분별하게 쿼리를 날리면 로그 조회 비용이 생각보다 빠르게 쌓일 수 있다. `execute_cwl_insights_batch` 같은 배치 도구가 있는 걸 보면 AWS도 이 문제를 인식하고 있는 것 같은데, 아직 비용 가드레일이 도구 레벨에서 제공되지 않는다.

셋째, IAM MCP Server에 `create_access_key`가 있다는 게 조금 불안하다. 에이전트가 새 액세스 키를 만드는 도구가 노출돼 있다. 조건 키로 막을 수 있긴 하지만, 기본 설정에서 이 도구가 활성화돼 있다는 것은 운영자가 의식적으로 IAM 정책을 구성해야 한다는 부담이다.

나는 프로덕션 환경에는 아직 읽기 전용 서버(`cloudwatch-mcp-server`)만 연결하는 것을 권장한다. IAM MCP Server는 개발 환경에서 신중하게 쓸 것을 권한다.

## 누가 지금 당장 도입해야 하는가

세 가지 유형의 팀에게 즉시 가치가 있다.

**첫 번째**: CloudWatch 콘솔과 터미널을 오가면서 장애 대응하는 팀. 에이전트에게 "최근 1시간 Lambda 오류율 높은 함수 찾아서 로그 요약해줘"라고 물을 수 있다.

**두 번째**: 개발자가 IAM 정책 실수로 권한 초과나 권한 부족 오류를 자주 내는 팀. `simulate_principal_policy`를 통해 배포 전 권한 검증을 자동화할 수 있다.

**세 번째**: AWS 비용을 모니터링하고 싶지만 Cost Explorer 대시보드가 복잡하게 느껴지는 팀. AWS Pricing MCP Server와 함께 쓰면 "이 CDK 스택 배포하면 한 달 얼마 나오나요"를 에이전트가 추정할 수 있다.

반면, 다음 상황이라면 아직 기다리는 게 낫다: CloudWatch 서버가 0.x대이고, 에이전트 비용 가드레일이 없으며, 쓰기 권한이 포함된 IAM 서버를 프로덕션에 바로 붙이는 것은 리스크가 크다.

## 시작하기

AWS 자격증명이 설정된 환경이라면:

```bash
# uv 설치 (없는 경우)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 즉시 테스트
uvx awslabs.cloudwatch-mcp-server@latest

# 프로젝트에 .mcp.json 추가
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "cloudwatch": {
      "command": "uvx",
      "args": ["awslabs.cloudwatch-mcp-server@latest"],
      "env": {
        "AWS_REGION": "ap-northeast-2",
        "FASTMCP_LOG_LEVEL": "WARNING"
      }
    }
  }
}
EOF
```

공식 문서는 [awslabs.github.io/mcp](https://awslabs.github.io/mcp)에서, 소스는 [github.com/awslabs/mcp](https://github.com/awslabs/mcp)에서 확인할 수 있다.

## 트러블슈팅: 자주 막히는 지점

실제로 설치하면서 몇 가지 문제가 발생했다. 비슷한 상황에 부딪히는 사람을 위해 정리해둔다.

**문제 1: INFO 로그가 Claude Code 응답에 섞이는 경우**

`.mcp.json`의 `env`에 `"FASTMCP_LOG_LEVEL": "WARNING"`을 추가하지 않으면, 서버가 시작될 때 "Loaded 1179 metric metadata entries" 같은 INFO 로그가 그대로 에이전트 컨텍스트에 들어간다. 응답이 지저분해진다.

**문제 2: AWS 자격증명 인식 실패**

`uvx`로 실행할 때 기본적으로 시스템 `~/.aws/credentials`를 참조한다. `AWS_PROFILE` 환경변수로 특정 프로파일을 지정하거나, `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`을 `.mcp.json`의 `env`에 직접 넣어야 하는 경우가 있다.

**문제 3: 첫 실행이 느린 경우**

`uvx awslabs.cloudwatch-mcp-server@latest`를 처음 실행하면 53개 패키지를 내려받기 때문에 1〜2분이 걸린다. 두 번째 실행부터는 캐시를 쓰기 때문에 빠르다. 타임아웃이 발생하면 `@latest`를 특정 버전 태그(`@0.1.1`)로 바꿔보자.

**문제 4: `INSUFFICIENT_DATA` 알람이 보이는 경우**

이건 버그가 아니다. CloudWatch Agent가 EC2에 설치되지 않았거나 실행되지 않은 상태에서 디스크/메모리 메트릭을 수집하지 못할 때 발생한다. AWS Systems Manager를 통해 CloudWatch Agent를 일괄 배포하면 해결된다.

## 다음 단계

AWS MCP Server GA는 현재 시작점이다. 앞으로 기대하는 방향:

- **비용 가드레일 도구 추가** — Logs Insights 최대 스캔 바이트, 쿼리 타임아웃을 MCP 도구 레벨에서 제어할 수 있으면 더 안전하게 쓸 수 있다
- **CloudWatch Server v1.0** — 현재 0.1.1에서 1.0으로 올라오면 API 안정성을 믿고 프로덕션에 투입하기 더 수월해진다
- **에이전트별 IAM 역할 지원** — 지금은 현재 사용자의 자격증명을 그대로 쓰는데, 에이전트 전용 IAM 역할을 MCP 서버 레벨에서 쉽게 지정할 수 있으면 보안이 훨씬 깔끔해진다

AI 에이전트가 AWS 콘솔 수준의 가시성을 갖게 되는 건 막을 수 없는 방향이다. AWS MCP Server GA는 그 방향으로의 첫 번째 실용적인 발걸음이다.
