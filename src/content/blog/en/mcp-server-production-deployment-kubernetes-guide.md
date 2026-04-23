---
title: MCP Server Kubernetes Deployment — Surviving the 52% Death Rate
description: >-
  April 2026: 52% of MCP endpoints are down. Checklist covering Kubernetes
  config, Streamable HTTP migration, health checks, and OAuth 2.1 for production
  MCP servers.
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
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: gpt53-codex-rollout-pause
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: bigquery-mcp-prefix-filtering
    score: 0.92
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-hooks-workflow
    score: 0.92
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: self-healing-ai-systems
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps、架构主题进行连接。
---

Last month I was connecting a few external MCP servers and noticed something odd. READMEs had "stable" tags, GitHub star counts in the hundreds — yet hitting `/mcp` just dropped the connection. I figured it was my config at first. Then another server, then another. Same result.

Turns out it wasn't just me. An April 2026 scan of 2,181 remote MCP endpoints found <strong>52% completely dead, with only 9% fully healthy</strong>. The rest responded but weren't actually usable.

I went through why MCP servers die so often and put together what I've learned about keeping mine alive.

## Why Half of Them Die

Three root causes account for most dead endpoints.

<strong>Abandoned servers</strong> — Someone builds a toy project, deploys it, forgets about it. API keys expire or upstream services change and nobody notices. The process is alive, the responses are errors.

<strong>Credential problems</strong> — Astrix analyzed over 5,200 MCP server implementations. 88% require credentials to operate, yet 53% rely on long-lived API keys or Personal Access Tokens. When a key rotates, the server breaks silently. Only 8.5% use OAuth.

<strong>Serverless cold starts</strong> — MCP servers on AWS Lambda or Google Cloud Functions spin down when idle. If the first response doesn't come back within the default timeout (30 seconds), clients consider the server dead.

If you're running an MCP server, you're probably exposed to at least one of these already.

## Prerequisites

This guide assumes a FastMCP (Python) server. [Building an MCP server from scratch is covered in a previous post](/en/blog/en/mcp-server-build-practical-guide-2026) — this one focuses entirely on deployment.

What you need:
- Kubernetes cluster (1.28+)
- `kubectl` + `helm` installed
- A container registry (Docker Hub, ECR, GCR, etc.)
- MCP server source code (FastMCP, uvicorn-compatible)

No cluster? Use `kind` or `minikube` locally.

## Step 1: Get the Dockerfile Right

Before deploying, clean up the container image. These are the things that get skipped most often.

```dockerfile
FROM python:3.12-slim

# Security: don't run as root
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

WORKDIR /app

# Pin dependencies — this matters more than anything else
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R mcpuser:mcpuser /app

USER mcpuser

EXPOSE 8080

# exec form in ENTRYPOINT (handles signals correctly)
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Pin every dependency in `requirements.txt`. Writing `fastmcp>=0.1.0` means a new version can silently break behavior on any given deploy.

```
# requirements.txt
fastmcp==0.9.2
uvicorn==0.34.0
httpx==0.28.1
```

## Step 2: Kubernetes Deployment Configuration

Deploying without resource limits is the most common mistake. OOMKilled pods are notoriously hard to debug after the fact.

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
        image: your-registry/mcp-server:v1.2.3  # always pin the tag
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

Why separate `liveness` and `readiness`? Liveness failure triggers a pod restart. Readiness failure removes the pod from load balancer rotation without restarting it. If an upstream API goes down temporarily, restarting the pod accomplishes nothing. Failing readiness lets the pod sit quietly and wait for recovery.

## Step 3: Health Check Endpoints Done Right

Check "is the server actually usable" rather than "is the process running." A live process returning upstream errors is still effectively dead from the client's perspective.

Adding health checks to FastMCP:

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
    """Basic liveness probe — just checks if the process is up"""
    return {"status": "ok"}

@app.get("/health/ready")
async def ready():
    """Readiness probe — checks external dependencies too"""
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

Kubernetes treats HTTP 200 as success, everything else as failure. A 503 from readiness removes the pod from the load balancer pool.

One thing I learned the hard way: if the external API timeout is too long, the readiness check itself becomes slow and Kubernetes starts failing pods prematurely. Keep it under 5 seconds.

## Step 4: Streamable HTTP Transport Configuration

As of 2026, Streamable HTTP is the default transport for remote MCP servers. A single `/mcp` endpoint handles both requests and responses, dynamically upgrading to SSE for streaming responses when needed.

FastMCP configuration:

```python
# main.py (Streamable HTTP)
from fastmcp import FastMCP

mcp = FastMCP(
    "my-tool-server",
    stateless_http=True,  # required if running behind a load balancer
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp.streamable_http_app(), host="0.0.0.0", port=8080)
```

`stateless_http=True` matters. With session state in server memory, two replicas behind a load balancer will break sessions whenever a client hits the "wrong" pod. If you need stateful sessions, use an external session store like Redis.

Kubernetes Service and Ingress:

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
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"  # for SSE streaming
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

Extend the nginx proxy timeout. The default (60 seconds) will cut off long responses mid-stream.

## Step 5: OAuth 2.1 Credential Management

Relying on static API keys is the biggest long-term risk. Keys leak into GitHub repos, get forgotten after team changes, or break silently when services rotate them. [Looking at MCP-related CVE patterns](/en/blog/en/mcp-security-crisis-30-cves-enterprise-hardening), credential management failure is a recurring theme.

Injecting from Kubernetes Secrets:

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

For OAuth 2.1, the server needs to validate Bearer tokens:

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

OAuth setup is more complex than API keys, no question. You need an introspection server and token refresh logic on the client side. But it's worth it for long-term operation: zero-downtime key rotation, and you get a full audit trail of who called what.

## Step 6: Monitoring — How to Stay Out of the 52% Club

Deployment isn't the finish line. Catching servers that die silently requires two things at minimum.

<strong>External monitoring</strong>: Internal health checks aren't enough. You need to probe `/mcp` from the outside, the way clients actually would. UptimeRobot, Better Uptime, or a Kubernetes CronJob works:

```yaml
# monitor-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mcp-health-monitor
spec:
  schedule: "*/5 * * * *"  # every 5 minutes
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

<strong>Upstream schema change detection</strong>: If a dependency changes its response schema, the MCP server stays alive but returns garbage. You need integration tests that call actual tools and validate results on a schedule.

[An MCP Gateway](/en/blog/en/mcp-gateway-agent-traffic-control) puts a single entry point in front of multiple MCP servers and gives you centralized health status management. Worth considering if you're running more than one.

## What Actually Happened When I Deployed

Two unexpected problems came up with the setup above.

First: the readiness probe was too aggressive. It started probing `/health/ready` before the server was fully up, got 503s, and Kubernetes entered a restart loop. Raising `initialDelaySeconds` to 10 fixed it.

Second: with `stateless_http=True`, long streaming responses would occasionally drop. Known issue in FastMCP 0.9.x. I worked around it by putting sessions in Redis. If you don't need streaming, stateless is fine.

## Automatic Redeployment — Image Tag Strategy

Using `latest` makes it impossible to know when the image changed. Kubernetes won't pull a new image with `IfNotPresent` if it already has that tag locally.

```yaml
# bad
image: my-registry/mcp-server:latest

# good — use git commit SHA or semver
image: my-registry/mcp-server:v1.2.3
```

Automate tag changes in CI/CD:

```bash
IMAGE_TAG="v$(date +%Y%m%d)-${GITHUB_SHA::8}"
docker build -t my-registry/mcp-server:${IMAGE_TAG} .
docker push my-registry/mcp-server:${IMAGE_TAG}
kubectl set image deployment/my-mcp-server \
  mcp-server=my-registry/mcp-server:${IMAGE_TAG}
```

Rolling update strategy to prevent downtime:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # never remove a pod before the new one passes readiness
```

## RBAC — Least Privilege

If your MCP server needs to access Kubernetes resources (listing pods, reading ConfigMaps), set up a ServiceAccount with a minimal Role:

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

## Troubleshooting FAQ

Problems I hit most often during actual deployments.

<strong>Q: Pod is in CrashLoopBackOff</strong>

Check the previous container's logs:
```bash
kubectl logs deployment/my-mcp-server --previous
```

Common causes: missing environment variables (bad Secret reference), dependency version conflicts, port binding failures.

<strong>Q: Readiness probe passes but actual MCP requests fail</strong>

The health check and the real tool code are taking different paths. Review whether `/health/ready` is actually testing the same upstream that MCP tools use.

<strong>Q: Streamable HTTP connections drop mid-stream</strong>

Check nginx timeout annotations. If you're on AWS ALB, the default idle timeout (60s) will cut off long streams — raise it to 300+.

<strong>Q: Sessions break intermittently with 2 replicas</strong>

You're running `stateless_http=False` (default) behind a load balancer. Solutions: switch to `stateless_http=True` if you don't need stateful sessions, or configure nginx sticky sessions with cookie affinity. I prefer stateless — sticky sessions break when a node goes down anyway.

## HorizontalPodAutoscaler — Scaling With Traffic

Two replicas handles steady state. When agent traffic spikes, you need to scale fast. HPA adjusts pod count based on CPU or memory:

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
      stabilizationWindowSeconds: 30   # scale up fast
    scaleDown:
      stabilizationWindowSeconds: 300  # scale down slow (MCP responses can run long)
```

The long scale-down window matters. An MCP server handling a complex tool call might be busy for 30+ seconds. You don't want Kubernetes terminating a pod mid-request.

## What's Still Unsolved

Two things I haven't found clean answers to while running MCP servers on Kubernetes.

Stateful sessions vs horizontal scaling. The 2026 Streamable HTTP roadmap includes work on making the transport work statelessly across multiple server instances — but until that lands, managing session affinity is manual work every time you scale.

The `.well-known` metadata endpoint standard is still in draft. The idea is to let registries and crawlers discover what an MCP server can do without actually connecting to it. Without that standard, the only way to check if a server is alive is to connect and find out — which is exactly why the scan found 52% dead. You can't monitor what you can't discover.

Both of those getting resolved would address the dead endpoint problem substantially. Until then, the health checks, dependency pinning, and credential management covered here are the best available defense.
