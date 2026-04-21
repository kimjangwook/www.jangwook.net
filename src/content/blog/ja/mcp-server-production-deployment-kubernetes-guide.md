---

title: MCPサーバーKubernetes本番デプロイ — 52%が死ぬ現実を生き延びる方法
description: >-
  2026年4月時点でプロダクションMCPエンドポイントの52%が異常状態。Kubernetesリソース設定からStreamable HTTP移行、
  ヘルスチェック自動化、OAuth 2.1認証まで、MCP本番運用サバイバルチェックリストを提供します。
pubDate: '2026-04-21'
heroImage: >-
  ../../../assets/blog/mcp-server-production-deployment-kubernetes-guide-hero.jpg
tags:
  - MCP
  - Kubernetes
  - DevOps
  - production
relatedPosts:
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.95
    reason:
      ko: MCP 서버 60일 내 CVE 30개 분석 — 여기서 다룬 OAuth 인증과 자격증명 관리 취약점을 구체적인 공격 사례로 확인할 수 있다.
      ja: MCPサーバーの60日間CVE30件分析 — ここで扱ったOAuth認証と認証情報管理の脆弱性を具体的な攻撃事例で確認できる。
      en: 30 CVEs in 60 days across MCP servers — the credential and OAuth vulnerabilities discussed here are analyzed through real attack cases.
      zh: MCP服务器60天内30个CVE分析 — 本文讨论的OAuth认证和凭据管理漏洞可通过具体攻击案例得到验证。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.92
    reason:
      ko: 여러 MCP 서버를 운영한다면 각각 헬스체크를 직접 다루는 대신 MCP Gateway로 중앙 집중 관리하는 방법도 있다.
      ja: 複数のMCPサーバーを運用するなら、それぞれヘルスチェックを個別に管理する代わりにMCP Gatewayで一元管理する方法もある。
      en: When running multiple MCP servers, centralizing health management through MCP Gateway is a viable alternative to per-server health checks.
      zh: 当运行多个MCP服务器时，通过MCP Gateway集中管理是逐个服务器健康检查的可行替代方案。
  - slug: mcp-server-build-practical-guide-2026
    score: 0.90
    reason:
      ko: 이 글은 배포에 초점을 뒀지만, FastMCP로 MCP 서버를 처음 만드는 과정이 궁금하다면 이 포스트에서 시작하면 된다.
      ja: この記事はデプロイに焦点を当てているが、FastMCPでMCPサーバーを最初から作る過程が気になるなら、このポストから始めるといい。
      en: This guide focuses on deployment — if you need to build the MCP server first, this earlier post covers FastMCP from scratch.
      zh: 本文聚焦于部署，如果需要先构建MCP服务器，这篇早期文章涵盖了从零开始使用FastMCP的完整过程。
  - slug: self-healing-ai-systems
    score: 0.88
    reason:
      ko: Kubernetes 헬스체크로 단기 장애를 감지하는 것 이상으로, AI 시스템이 스스로 상태를 진단하고 복구하는 아키텍처 패턴을 다룬다.
      ja: KubernetesヘルスチェックによるAI障害検知を超えて、AIシステムが自ら状態を診断し復旧するアーキテクチャパターンを扱う。
      en: Beyond Kubernetes health checks for detection, this covers architecture patterns where AI systems self-diagnose and recover.
      zh: 超越Kubernetes健康检查的障碍检测，涵盖AI系统自我诊断和恢复的架构模式。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.85
    reason:
      ko: Kubernetes에서 MCP 서버를 운영하는 것과 달리, Dapr Agents는 서비스 메시를 통해 AI 에이전트 인프라를 관리하는 또 다른 프로덕션 접근법이다.
      ja: KubernetesでMCPサーバーを運用するのとは異なり、Dapr Agentsはサービスメッシュを通じてAIエージェントインフラを管理する別のプロダクションアプローチだ。
      en: Unlike running MCP servers on Kubernetes directly, Dapr Agents manages AI agent infrastructure through a service mesh — a different production approach worth comparing.
      zh: 与直接在Kubernetes上运行MCP服务器不同，Dapr Agents通过服务网格管理AI代理基础设施，是值得比较的另一种生产方案。
---

先月、外部MCPサーバーをいくつか接続しようとして奇妙なことに気づいた。READMEには「stable」タグがついていて、GitHubスターも数百あるのに、`/mcp`エンドポイントを叩くと接続がぶつ切りになる。最初は自分の設定の問題だと思ったが、別のサーバーも、さらに別のサーバーも同じだった。

調べてみると、これは自分だけが遭遇している問題ではなかった。2026年4月に実施されたスキャンで2,181件のリモートMCPエンドポイントを調査したところ、<strong>52%が完全に死んでいて、「完全に正常」と言えるのはたった9%だった</strong>。残りは応答はするが実際に使える状態ではなかった。

MCPサーバーがなぜこれほど多く死ぬのかを把握し、自分のサーバーを生かしておく方法を整理した。

## なぜ半数が死ぬのか

死んだエンドポイントの主な原因は3つあった。

<strong>放置されたサーバー</strong> — 誰かがトイプロジェクトとして作ってデプロイし、忘れてしまう。APIキーが期限切れになったり、依存している外部サービスが変わっても誰も気づかない。サーバープロセスは生きているが実際のレスポンスはエラーだ。

<strong>認証情報の問題</strong> — Astrixが5,200件以上のMCPサーバーを分析したところ、88%が認証情報を必要とするが、そのうち53%は長期有効なAPIキーやPAT（Personal Access Token）に依存していた。キーが交換されるとサーバーは静かに壊れる。OAuthを使っているのは8.5%だけだった。

<strong>サーバーレスのコールドスタート</strong> — AWS LambdaやGoogle Cloud Functionsに乗せたMCPサーバーは、トラフィックがなければインスタンスが落ちる。デフォルトのタイムアウト（30秒）以内に最初のレスポンスを返せなければ、クライアントの視点では死んでいるも同然だ。

自分で運営しているMCPサーバーがあれば、すでにこの3つのうちどれかに晒されている可能性が高い。

## 準備するもの

このガイドはFastMCP（Python）で書いたMCPサーバーを基準にする。[MCPサーバーの最初の作り方は以前のポスト](/ja/blog/ja/mcp-server-build-practical-guide-2026)で扱ったので、ここではデプロイ部分だけを扱う。

必要なもの：
- Kubernetesクラスター（1.28以上推奨）
- `kubectl` + `helm`のインストール
- コンテナレジストリ（Docker Hub、ECR、GCRなど）
- MCPサーバーのソースコード（FastMCP基準、uvicornでサービング可能であること）

Kubernetesクラスターがなければ、ローカルでは`kind`または`minikube`でテストできる。

## Step 1: Dockerfileから正しく

デプロイ前にコンテナイメージを整理する必要がある。よく見落とされることがある。

```dockerfile
FROM python:3.12-slim

# セキュリティ：rootで実行しない
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

WORKDIR /app

# 依存関係のピン留め — これが一番重要
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 所有権の移譲
RUN chown -R mcpuser:mcpuser /app

USER mcpuser

EXPOSE 8080

# ENTRYPOINTにexec形式を使用（シグナル処理が正常動作）
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

`requirements.txt`で依存関係のピン留めを必ずする。`fastmcp>=0.1.0`のように緩く書くと、ある日新しいバージョンがリリースされて動作が静かに変わることがある。

```
# requirements.txt
fastmcp==0.9.2
uvicorn==0.34.0
httpx==0.28.1
```

## Step 2: Kubernetes Deploymentの設定

リソース制限なしでデプロイするのが最もよくある失敗だ。ノードのメモリを全部食い尽くしてOOMKilledされると、原因を見つけるのが難しい。

```yaml
# mcp-server-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-mcp-server
  labels:
    app: mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: mcp-server
        image: your-registry/mcp-server:v1.2.3  # 常にタグを固定
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
        env:
        - name: MCP_API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: api-key
```

`liveness`と`readiness`を分けた理由がある。livenessが失敗するとPodを再起動し、readinessが失敗するとトラフィックの受信を止める。MCPサーバーが依存する外部APIが一時的にダウンしたときにPodを再起動しても意味がない。readinessだけ失敗させることで、トラフィックを受けずに復旧を待てる。

## Step 3: ヘルスチェックエンドポイントを正しく実装する

「サーバーが生きているか」ではなく「サーバーが実際に使える状態か」を確認する必要がある。プロセスが生きていても外部APIが死んでいればクライアントはエラーを受け取り続ける。

FastMCPでヘルスチェックを追加する方法：

```python
# main.py
from fastmcp import FastMCP
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import httpx
import asyncio

mcp = FastMCP("my-tool-server")
app = FastAPI()

# MCPアプリをFastAPIにマウント
app.mount("/", mcp.sse_app())

@app.get("/health")
async def health():
    """基本のlivenessプローブ — プロセスが生きているかだけ確認"""
    return {"status": "ok"}

@app.get("/health/ready")
async def ready():
    """readinessプローブ — 外部依存関係まで確認"""
    checks = {}
    
    # 例：依存している外部APIを確認
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("https://api.your-service.com/ping")
            checks["upstream_api"] = response.status_code == 200
    except Exception as e:
        checks["upstream_api"] = False
    
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if all_healthy else "not_ready", "checks": checks}
    )
```

KubernetesはHTTP 200を成功、それ以外を失敗として扱う。503を返すとreadinessチェックが失敗し、そのPodはロードバランサーから外れる。

実際にこれを導入してみて、外部APIチェックのタイムアウトを長く設定しすぎるとreadinessチェック自体が遅くなり、Kubernetesが早めにPodを落としてしまう問題が発生した。5秒以内に切り上げる必要がある。

## Step 4: Streamable HTTPトランスポートの設定

2026年現在、リモートMCPサーバーのデフォルトトランスポートはStreamable HTTPだ。単一の`/mcp`エンドポイントでリクエストとレスポンスを両方処理し、ストリーミングレスポンスが必要な場合は動的にSSEに切り替える。

FastMCPでの設定は簡単だ：

```python
# main.py（Streamable HTTP設定）
from fastmcp import FastMCP

mcp = FastMCP(
    "my-tool-server",
    stateless_http=True,  # ロードバランサー後ろで使うならTrue
)

# uvicornでサービング
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp.streamable_http_app(), host="0.0.0.0", port=8080)
```

`stateless_http=True`が重要だ。セッション状態をサーバーメモリに保持すると、replicaが2つある場合にクライアントが2つのPodを交互に叩いてセッションが壊れる。状態を保持する必要があるならRedisのような外部セッションストアが必要だ。

Kubernetes Serviceの設定：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mcp-server-svc
spec:
  selector:
    app: mcp-server
  ports:
  - protocol: TCP
    port: 443
    targetPort: 8080
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mcp-server-ingress
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"  # SSEストリーミング用
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  rules:
  - host: mcp.your-domain.com
    http:
      paths:
      - path: /mcp
        pathType: Prefix
        backend:
          service:
            name: mcp-server-svc
            port:
              number: 443
```

nginxのプロキシタイムアウトを延ばす必要がある。デフォルト値（60秒）のままだと長いレスポンスの受信中に接続が切れる。

## Step 5: OAuth 2.1で認証情報を管理する

静的APIキーへの依存が最大の長期リスクだ。キーがGitHubに漏れたり、担当者が変わったり、サービスがキーを交換したりすると静かに壊れる。[MCPのセキュリティ関連CVE事例を見ると](/ja/blog/ja/mcp-security-crisis-30-cves-enterprise-hardening)、認証情報管理の失敗が繰り返しパターンになっている。

Kubernetes Secretから環境変数として注入する基本的な方法：

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-secrets
type: Opaque
stringData:
  api-key: "your-api-key-here"
  oauth-client-secret: "your-oauth-secret"
```

OAuth 2.1を使うにはMCPサーバーがBearerトークンを検証する必要がある：

```python
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    # トークンのイントロスペクション
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://your-auth-server.com/oauth/introspect",
            data={"token": token},
            auth=("client_id", "client_secret")
        )
    
    if response.status_code != 200 or not response.json().get("active"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return response.json()
```

正直、OAuth設定がAPIキーより複雑なのは事実だ。イントロスペクションサーバーを別途運営する必要があり、トークン更新ロジックもクライアント側に必要だ。しかし長期運用の観点ではこれが正しい。キーの交換がゼロダウンタイムでできるし、誰がどのツールを呼び出したかの追跡もできる。

## Step 6: モニタリング — 52%クラブに入らないために

デプロイが終わりではない。静かに死んでいくサーバーを捕まえるには最低でも2つが必要だ。

<strong>外部モニタリング</strong>：内部ヘルスチェックだけでは不十分だ。クライアントが実際に接続するように、外部から定期的に`/mcp`エンドポイントを叩く必要がある。UptimeRobot、Better Uptime、または自作のKubernetes CronJobで実現できる。

```yaml
# monitor-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mcp-health-monitor
spec:
  schedule: "*/5 * * * *"  # 5分ごと
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: monitor
            image: curlimages/curl:latest
            command:
            - /bin/sh
            - -c
            - |
              curl -f -X POST https://mcp.your-domain.com/mcp \
                -H "Content-Type: application/json" \
                -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
                --max-time 10 || exit 1
          restartPolicy: Never
```

<strong>上流APIの変更検知</strong>：依存している外部APIがレスポンススキーマを変えるとMCPサーバーは生きているが엉뚱한値を返す。定期的に実際のツールを呼び出して結果を検証する統合テストが必要だ。

[MCP Gatewayを使えば](/ja/blog/ja/mcp-gateway-agent-traffic-control)複数のMCPサーバーの前に単一の入り口を置き、一元的にヘルス状態を管理できる。サーバーが複数あるなら検討する価値がある。

## 実際にデプロイしてみると

上記の設定で自分のMCPサーバーを上げたとき、2つ予想外の問題があった。

最初はreadinessプローブが攻撃的すぎて、Podが起動した直後に失敗判定が出たことだ。サーバーが完全に起動する前にプローブが`/health/ready`を叩くので503が返り、Kubernetesが再起動ループに入った。`initialDelaySeconds`を10秒に延ばして解決した。

2つ目は`stateless_http=True`に設定すると長いストリーミングレスポンスが途切れるケースがあった。FastMCP 0.9.xの既知の問題で、セッションをRedisに乗せる方式で回避した。ストリーミングを使わないなら、statelessのままでいい。

## 自動再デプロイ設定 — イメージタグ戦略

`latest`タグを使うといつイメージが変わったかわからない。Kubernetesはイメージプルポリシーが`IfNotPresent`の場合、すでにローカルにあれば新しいイメージを取得しない。

```yaml
# 悪い例
image: my-registry/mcp-server:latest
imagePullPolicy: IfNotPresent

# 良い例 — GitコミットSHAまたはsemverタグを使用
image: my-registry/mcp-server:v1.2.3
imagePullPolicy: IfNotPresent
```

CI/CDパイプラインでデプロイのたびにタグを変えるよう自動化する：

```bash
# GitHub Actionsの例
IMAGE_TAG="v$(date +%Y%m%d)-${GITHUB_SHA::8}"
docker build -t my-registry/mcp-server:${IMAGE_TAG} .
docker push my-registry/mcp-server:${IMAGE_TAG}

# Kubernetes Deploymentを更新
kubectl set image deployment/my-mcp-server \
  mcp-server=my-registry/mcp-server:${IMAGE_TAG}
```

ローリングアップデート戦略も設定しておけばデプロイ中のダウンタイムがない：

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # デプロイ中の最大追加Pod数
      maxUnavailable: 0  # デプロイ中の最小稼働Pod保証
```

`maxUnavailable: 0`は常に最小レプリカ数以上を維持するという意味だ。新しいPodがreadinessを通過するまで既存のPodを落とさない。

## RBAC — 最小権限の原則

MCPサーバーがKubernetesクラスター内部のリソースにアクセスする必要がある場合（例：Pod一覧取得、ConfigMap読み取りなど）、ServiceAccountとRBACを適切に設定する必要がある。

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-server-sa
  namespace: default

---
# role.yaml — 必要な権限のみ最小限に
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: mcp-server-role
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]  # create, deleteは必要な場合のみ
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get"]

---
# rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: mcp-server-rolebinding
  namespace: default
subjects:
- kind: ServiceAccount
  name: mcp-server-sa
roleRef:
  kind: Role
  apiGroup: rbac.authorization.k8s.io
  name: mcp-server-role
```

DeploymentにServiceAccountを指定：

```yaml
spec:
  template:
    spec:
      serviceAccountName: mcp-server-sa
      automountServiceAccountToken: false  # 直接管理する場合のみfalse
```

## トラブルシューティングFAQ

実際にデプロイして最もよく遭遇した問題だ。

<strong>Q: PodがCrashLoopBackOff状態だ</strong>

まずログを確認する：
```bash
kubectl logs deployment/my-mcp-server --previous
```

`--previous`は以前のコンテナインスタンスのログを見る。現在再起動中のコンテナのログは空の場合がある。

主な原因：
- 環境変数の欠如（Secret参照エラー）
- 依存関係のバージョン競合
- ポートバインディングの失敗（既に使用中のポート）

<strong>Q: readinessプローブは通るのに実際のMCPリクエストが失敗する</strong>

ヘルスチェックと実際のMCPリクエストが異なるコードパスを通るケースだ。`/health/ready`が外部APIを正しくチェックしているか再確認する。

<strong>Q: Streamable HTTP接続が途中で切れる</strong>

nginx ingressを使っているならプロキシタイムアウト設定を確認する：

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
  nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
```

<strong>Q: replicaが2つあるがセッションが時々壊れる</strong>

FastMCPを`stateless_http=False`（デフォルト）で運用しながらロードバランサーの後ろに置くケースだ。同じクライアントが別のPodにルーティングされるとセッション情報がなくてエラーになる。

解決策：`stateless_http=True`、またはnginx ingressのセッションアフィニティ（スティッキーセッション）設定。

## HorizontalPodAutoscaler — トラフィックによる自動スケーリング

通常はreplica 2つで十分だが、エージェントトラフィックが集中する時は素早く増えなければならない。HPAを設定しておくとCPUまたはメモリ使用量に応じてPod数が自動的に調整される。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-mcp-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30   # 素早く増やす
    scaleDown:
      stabilizationWindowSeconds: 300  # ゆっくり減らす（リクエスト中にPodが落ちないように）
```

`scaleDown.stabilizationWindowSeconds`を長くした理由がある。Podが突然落ちると処理中のMCPリクエストが中断される。300秒（5分）の安定化ウィンドウがあれば、ほとんどのリクエストが完了するのに十分な時間だ。

## まだ解決できていないこと

KubernetesでMCPサーバーを運用しながら、まだ明確な答えが見つかっていないことがある。

水平スケーリングとセッション状態のトレードオフ。Streamable HTTPの2026ロードマップでは「セッションをステートレスに扱う方向」でトランスポートを改善するとされているが、それまでの間はスケールアウトのたびにセッションスティッキネスを手動で管理しなければならない。

`.well-known`メタデータエンドポイントの標準化もまだ議論中だ。レジストリやクローラーがMCPサーバーに実際に接続せずに何ができるかを知れるようにする標準で、これがないと死んでいるサーバーか生きているサーバーかを確認するには必ず接続してみるしかない。

この2つが整理されれば「52%が死んでいる」問題がかなり解決されるだろう。それまでは、ここで扱ったヘルスチェック、依存関係のピン留め、OAuth認証情報管理が最善の対応だ。
