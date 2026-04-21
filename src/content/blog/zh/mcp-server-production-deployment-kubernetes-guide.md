---

title: MCP服务器Kubernetes生产部署 — 在52%宕机率中活下来的方法
description: >-
  2026年4月生产MCP端点52%异常。本文提供完整的生存清单：Kubernetes资源配置、Streamable HTTP迁移、健康检查自动化、
  OAuth 2.1认证，帮助您构建稳定的生产级MCP服务器。
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

上个月我在连接几个外部MCP服务器时发现了一件奇怪的事。README上明明标着"stable"，GitHub星标也有几百个，但打`/mcp`端点时连接直接断开。起初以为是自己的配置问题，但换了另一个服务器，又一个服务器，结果都一样。

后来发现这不只是我一个人遇到的问题。2026年4月对2,181个远程MCP端点进行的扫描显示，<strong>52%完全死亡，只有9%完全正常</strong>。其余的虽然有响应，但实际上无法使用。

我整理了MCP服务器为何频繁宕机的原因，以及如何让自己的服务器保持运行的方法。

## 为什么一半会死掉

死亡端点的主要原因有三个。

<strong>被遗弃的服务器</strong> — 有人搭建了一个玩具项目并部署，然后忘掉了。API密钥过期或依赖的外部服务变更时，没有人察觉。服务进程还活着，但实际响应都是错误。

<strong>凭据问题</strong> — Astrix分析了5,200多个MCP服务器实现，发现88%需要凭据才能运行，其中53%依赖长期有效的API密钥或个人访问令牌（PAT）。密钥轮换时，服务器会悄然崩溃。只有8.5%使用OAuth。

<strong>无服务器冷启动</strong> — 部署在AWS Lambda或Google Cloud Functions上的MCP服务器在没有流量时会停止实例。如果在默认超时（30秒）内无法给出第一个响应，从客户端角度来看服务器已经死了。

如果你正在运营MCP服务器，很可能已经面临这三个问题中的至少一个。

## 准备工作

本指南以FastMCP（Python）编写的MCP服务器为基准。[MCP服务器的初始构建方法请参考之前的文章](/zh/blog/zh/mcp-server-build-practical-guide-2026)，这里只讲部署部分。

所需工具：
- Kubernetes集群（推荐1.28以上）
- 安装`kubectl` + `helm`
- 容器镜像仓库（Docker Hub、ECR、GCR等）
- MCP服务器源码（FastMCP标准，可以用uvicorn提供服务）

没有Kubernetes集群？可以在本地用`kind`或`minikube`测试。

## Step 1: 从Dockerfile开始规范

部署前需要整理容器镜像。以下是最常被忽略的点。

```dockerfile
FROM python:3.12-slim

# 安全：不以root运行
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

WORKDIR /app

# 固定依赖版本 — 这是最重要的
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R mcpuser:mcpuser /app

USER mcpuser

EXPOSE 8080

# ENTRYPOINT使用exec形式（信号处理正常工作）
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

`requirements.txt`中必须固定依赖版本。写成`fastmcp>=0.1.0`这样宽泛的形式，某天新版本发布时可能悄悄改变行为。

```
# requirements.txt
fastmcp==0.9.2
uvicorn==0.34.0
httpx==0.28.1
```

## Step 2: Kubernetes Deployment配置

不设置资源限制就部署是最常见的错误。节点内存被耗尽导致OOMKilled后，很难找到原因。

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
        image: your-registry/mcp-server:v1.2.3  # 始终固定标签
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

分开`liveness`和`readiness`是有原因的。liveness失败时重启Pod，readiness失败时停止接收流量。当MCP服务器依赖的外部API临时宕机时，重启Pod毫无意义。只让readiness失败，可以不接受流量的同时等待恢复。

## Step 3: 正确实现健康检查端点

要检查的不是"服务器是否存活"，而是"服务器是否处于可用状态"。进程活着但外部API已死，客户端只会收到错误。

在FastMCP中添加健康检查：

```python
# main.py
from fastmcp import FastMCP
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import httpx

mcp = FastMCP("my-tool-server")
app = FastAPI()

app.mount("/", mcp.sse_app())

@app.get("/health")
async def health():
    """基本的liveness探针 — 只检查进程是否存活"""
    return {"status": "ok"}

@app.get("/health/ready")
async def ready():
    """readiness探针 — 检查外部依赖"""
    checks = {}
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("https://api.your-service.com/ping")
            checks["upstream_api"] = response.status_code == 200
    except Exception:
        checks["upstream_api"] = False
    
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if all_healthy else "not_ready", "checks": checks}
    )
```

Kubernetes将HTTP 200视为成功，其他状态为失败。返回503时readiness检查失败，该Pod从负载均衡器中移除。

实际接入时发现：外部API检查超时设置太长会导致readiness检查本身变慢，Kubernetes会提前停止Pod。要在5秒内截断。

## Step 4: Streamable HTTP传输配置

截至2026年，远程MCP服务器的默认传输是Streamable HTTP。单个`/mcp`端点同时处理请求和响应，需要流式响应时动态切换到SSE。

FastMCP配置：

```python
# main.py (Streamable HTTP配置)
from fastmcp import FastMCP

mcp = FastMCP(
    "my-tool-server",
    stateless_http=True,  # 在负载均衡器后面使用时设为True
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp.streamable_http_app(), host="0.0.0.0", port=8080)
```

`stateless_http=True`很重要。如果将会话状态保存在服务器内存中，有2个副本时客户端轮流打到不同Pod就会导致会话损坏。如果需要保持状态，就需要像Redis这样的外部会话存储。

Kubernetes Service配置：

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
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"  # SSE流式响应用
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

需要延长nginx代理超时。默认值（60秒）会在接收长响应时中断连接。

## Step 5: 用OAuth 2.1管理凭据

依赖静态API密钥是最大的长期风险。密钥泄露到GitHub、负责人变更、服务轮换密钥时，服务会悄然崩溃。[查看MCP相关的CVE案例](/zh/blog/zh/mcp-security-crisis-30-cves-enterprise-hardening)，凭据管理失败是反复出现的模式。

从Kubernetes Secret注入为环境变量：

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

使用OAuth 2.1时，MCP服务器需要验证Bearer令牌：

```python
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
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

OAuth设置比API密钥复杂是事实。需要单独运营自省服务器，客户端也需要令牌刷新逻辑。但从长期运营角度来看这是正确的选择：零停机时间密钥轮换，并且可以追踪谁调用了哪个工具。

## Step 6: 监控 — 不加入52%俱乐部的方法

部署不是终点。要捕捉悄然宕机的服务器，至少需要以下两样东西。

<strong>外部监控</strong>：内部健康检查是不够的。需要从外部定期探测`/mcp`端点，就像客户端实际连接那样。可以使用UptimeRobot、Better Uptime，或者自制Kubernetes CronJob：

```yaml
# monitor-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mcp-health-monitor
spec:
  schedule: "*/5 * * * *"  # 每5分钟
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

<strong>上游API变更检测</strong>：依赖的外部API更改响应schema时，MCP服务器还活着但会返回错误数据。需要定期调用实际工具并验证结果的集成测试。

[使用MCP Gateway](/zh/blog/zh/mcp-gateway-agent-traffic-control)可以在多个MCP服务器前设置单一入口点，集中管理健康状态。如果有多个服务器，值得考虑。

## 实际部署时遇到的问题

按上述配置部署我的MCP服务器时，出现了两个意料之外的问题。

第一：readiness探针太积极，Pod启动后立即判定失败。服务器完全启动之前探针就开始打`/health/ready`，返回503，Kubernetes进入重启循环。将`initialDelaySeconds`提高到10秒解决了这个问题。

第二：设置`stateless_http=True`时，长流式响应偶尔会中断。这是FastMCP 0.9.x中已知的问题，通过将会话放入Redis绕过了。如果不需要流式传输，保持stateless即可。

## 自动重新部署 — 镜像标签策略

使用`latest`标签就无法知道镜像何时发生了变化。Kubernetes在`IfNotPresent`策略下，如果本地已有该标签就不会拉取新镜像。

```yaml
# 不好的做法
image: my-registry/mcp-server:latest

# 好的做法 — 使用Git commit SHA或语义化版本标签
image: my-registry/mcp-server:v1.2.3
```

在CI/CD流水线中自动化每次部署的标签变更：

```bash
IMAGE_TAG="v$(date +%Y%m%d)-${GITHUB_SHA::8}"
docker build -t my-registry/mcp-server:${IMAGE_TAG} .
docker push my-registry/mcp-server:${IMAGE_TAG}
kubectl set image deployment/my-mcp-server \
  mcp-server=my-registry/mcp-server:${IMAGE_TAG}
```

配置滚动更新策略可以避免部署期间的停机：

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # 新Pod通过readiness前不停止旧Pod
```

## RBAC — 最小权限原则

如果MCP服务器需要访问Kubernetes集群内部资源（例如查询Pod列表、读取ConfigMap），需要正确配置ServiceAccount和RBAC：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: mcp-server-role
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get"]
```

## 故障排查FAQ

实际部署过程中最常遇到的问题。

<strong>Q: Pod处于CrashLoopBackOff状态</strong>

先查看日志：
```bash
kubectl logs deployment/my-mcp-server --previous
```

主要原因：环境变量缺失（Secret引用错误）、依赖版本冲突、端口绑定失败。

<strong>Q: readiness探针通过但实际MCP请求失败</strong>

健康检查和实际MCP请求走了不同的代码路径。重新检查`/health/ready`是否真正验证了MCP工具使用的同一上游服务。

<strong>Q: Streamable HTTP连接中途断开</strong>

检查nginx超时注解。如果使用AWS ALB，默认空闲超时（60秒）会在长流式响应中途断开——需要调高到300秒以上。

<strong>Q: 2个副本时会话偶尔损坏</strong>

在负载均衡器后面使用`stateless_http=False`（默认值）运行。解决方案：如果不需要有状态会话则切换到`stateless_http=True`，或配置nginx的会话亲和性（粘性会话）。我倾向于无状态设计——节点宕机时粘性会话本来就会失效。

## HorizontalPodAutoscaler — 根据流量自动扩缩容

通常2个副本就足够了，但当Agent流量激增时需要快速扩展。HPA根据CPU或内存使用率自动调整Pod数量：

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
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30   # 快速扩容
    scaleDown:
      stabilizationWindowSeconds: 300  # 缓慢缩容（防止请求处理中Pod被终止）
```

缩容稳定窗口设置较长是有原因的。处理复杂工具调用的MCP服务器可能需要30秒以上。不希望Kubernetes在请求中途终止Pod。

## 仍未解决的问题

在Kubernetes上运营MCP服务器过程中，还有些没找到清晰答案的问题。

有状态会话与水平扩展的权衡。Streamable HTTP的2026路线图中提到要"以无状态方式处理会话"方向改进传输，但在此之前，每次扩容都需要手动管理会话亲和性。

`.well-known`元数据端点的标准化仍在讨论中。这是一个让注册表或爬虫无需实际连接就能了解MCP服务器功能的标准。没有这个标准，检查服务器是否存活只能连接看看——这正是扫描发现52%已死的原因。

这两个问题解决后，"52%已死"的问题将在很大程度上得到改善。在此之前，本文中涉及的健康检查、依赖版本固定和凭据管理就是目前最好的应对方法。
