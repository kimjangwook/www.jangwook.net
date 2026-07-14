---
title: MCP 서버 Kubernetes 배포 — 52%가 죽는 현실에서 살아남는 법
description: >-
  2026년 4월 기준 프로덕션 MCP 엔드포인트 52%가 비정상 상태입니다. Kubernetes 리소스 설정, Streamable HTTP
  전환, 헬스체크 자동화, OAuth 2.1 인증까지 — MCP 서버 프로덕션 생존을 위한 단계별 실전 배포 체크리스트를 제공합니다.
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

지난달에 외부 MCP 서버 몇 개를 연결하다가 이상한 걸 발견했다. README에 분명히 "stable" 태그가 붙어있고 GitHub 스타도 수백 개인데, `/mcp` 엔드포인트를 찍으면 연결이 그냥 끊긴다. 처음엔 내 설정 문제인 줄 알았는데, 다른 서버도, 또 다른 서버도 마찬가지였다.

찾아보니 이게 나만 겪는 문제가 아니었다. 2026년 4월에 진행된 스캔에서 2,181개의 원격 MCP 엔드포인트를 조사했더니 <strong>52%가 완전히 죽어있었고, "완전 정상"으로 볼 수 있는 건 9%에 불과</strong>했다. 나머지는 응답은 하지만 실제로 쓸 수 있는 상태는 아니었다.

MCP 서버가 왜 이렇게 많이 죽는지 파악하고, 내 것은 살려두는 법을 정리했다.

## 왜 절반이 죽는가

죽은 엔드포인트들의 주요 원인은 세 가지였다.

**방치된 서버** — 누군가 토이 프로젝트로 만들고 배포해놓은 뒤 잊어버린다. API 키가 만료되거나 의존하는 외부 서비스가 바뀌어도 아무도 알아채지 못한다. 서버 프로세스는 살아있지만 실제 응답은 에러다.

**자격증명 문제** — Astrix가 5,200개 이상의 MCP 서버를 분석한 결과, 88%가 자격증명이 필요한데 그중 53%는 장기 유효한 API 키나 PAT(Personal Access Token)에 의존했다. 키가 교체되면 서버는 조용히 깨진다. OAuth를 쓰는 건 8.5%뿐이었다.

**서버리스 콜드 스타트** — AWS Lambda나 Google Cloud Functions에 올린 MCP 서버는 트래픽이 없으면 인스턴스가 내려간다. 기본 타임아웃(30초) 안에 첫 응답을 못 주면 클라이언트 입장에서 죽은 거나 마찬가지다.

직접 운영하는 MCP 서버가 있다면 이 세 가지 중 하나에 이미 노출돼 있을 가능성이 높다.

## 준비물

이 가이드는 FastMCP(Python)로 작성한 MCP 서버를 기준으로 한다. [MCP 서버를 처음 만드는 방법은 이전 포스트](/ko/blog/ko/mcp-server-build-practical-guide-2026)에서 다뤘으니 여기서는 배포 부분만 다룬다.

필요한 것:
- Kubernetes 클러스터 (1.28 이상 권장)
- `kubectl` + `helm` 설치
- 컨테이너 레지스트리 (Docker Hub, ECR, GCR 등)
- MCP 서버 소스코드 (FastMCP 기준, uvicorn으로 서빙 가능해야 함)

Kubernetes 클러스터가 없다면 로컬에서는 `kind` 또는 `minikube`로 테스트할 수 있다.

## Step 1: Dockerfile부터 제대로

배포 전에 컨테이너 이미지부터 정리해야 한다. 흔히 놓치는 것들이 있다.

```dockerfile
FROM python:3.12-slim

# 보안: root로 실행하지 않는다
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

WORKDIR /app

# 의존성 핀닝 — 이게 제일 중요하다
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 소유권 이전
RUN chown -R mcpuser:mcpuser /app

USER mcpuser

EXPOSE 8080

# ENTRYPOINT에 exec 형태 사용 (시그널 처리 정상 작동)
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

`requirements.txt`에서 의존성 핀닝을 꼭 해야 한다. `fastmcp>=0.1.0`처럼 느슨하게 쓰면 어느 날 새 버전이 올라오면서 조용히 동작이 바뀔 수 있다.

```
# requirements.txt
fastmcp==0.9.2
uvicorn==0.34.0
httpx==0.28.1
```

## Step 2: Kubernetes Deployment 설정

리소스 제한 없이 배포하는 게 가장 흔한 실수다. 노드 메모리를 다 잡아먹다가 OOMKilled되면 이유를 찾기 어렵다.

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
        image: your-registry/mcp-server:v1.2.3  # 항상 태그 고정
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

`liveness`와 `readiness`를 분리한 이유가 있다. liveness가 실패하면 파드를 재시작하고, readiness가 실패하면 트래픽 수신을 멈춘다. MCP 서버가 의존하는 외부 API가 잠깐 다운됐을 때 파드를 재시작하는 건 의미 없다. readiness만 실패시키면 트래픽을 안 받으면서 복구를 기다릴 수 있다.

## Step 3: 헬스체크 엔드포인트 제대로 구현하기

"서버가 살아있나"가 아니라 "서버가 실제로 쓸 수 있는 상태인가"를 확인해야 한다. 프로세스가 살아있어도 외부 API가 죽으면 클라이언트는 에러만 받는다.

FastMCP로 헬스체크를 추가하는 방법:

```python
# main.py
from fastmcp import FastMCP
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import httpx
import asyncio

mcp = FastMCP("my-tool-server")
app = FastAPI()

# MCP 앱을 FastAPI에 마운트
app.mount("/", mcp.sse_app())

@app.get("/health")
async def health():
    """기본 liveness probe — 프로세스 살아있는지만 확인"""
    return {"status": "ok"}

@app.get("/health/ready")
async def ready():
    """readiness probe — 외부 의존성까지 확인"""
    checks = {}
    
    # 예: 의존하는 외부 API 확인
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

Kubernetes는 HTTP 200이면 성공, 그 외는 실패로 처리한다. 503을 돌려주면 readiness 체크가 실패해서 해당 파드는 로드밸런서에서 빠진다.

직접 이걸 붙여봤는데, 외부 API 체크 타임아웃을 너무 길게 설정하면 readiness 체크 자체가 느려져서 Kubernetes가 파드를 일찍 내려버리는 문제가 생겼다. 5초 이내로 끊어야 한다.

## Step 4: Streamable HTTP 트랜스포트 설정

2026년 현재 원격 MCP 서버의 기본 트랜스포트는 Streamable HTTP다. 단일 `/mcp` 엔드포인트에서 요청과 응답을 모두 처리하고, 스트리밍 응답이 필요할 때는 동적으로 SSE로 전환한다.

FastMCP에서는 설정이 간단하다:

```python
# main.py (Streamable HTTP 설정)
from fastmcp import FastMCP

mcp = FastMCP(
    "my-tool-server",
    stateless_http=True,  # 로드밸런서 뒤에서 쓰려면 True
)

# uvicorn으로 서빙
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp.streamable_http_app(), host="0.0.0.0", port=8080)
```

`stateless_http=True`가 중요하다. 세션 상태를 서버 메모리에 유지하면 replica가 2개일 때 클라이언트가 두 파드를 번갈아 맞으면서 세션이 깨진다. 상태를 유지해야 한다면 Redis 같은 외부 세션 스토어를 써야 한다.

Kubernetes Service 설정:

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
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"  # SSE 스트리밍용
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

nginx ingress에서 프록시 타임아웃을 늘려야 한다. 기본값(60초)으로 두면 긴 응답을 받다가 연결이 끊긴다.

## Step 5: OAuth 2.1로 자격증명 관리하기

정적 API 키에 의존하는 게 가장 큰 장기 리스크다. 키가 GitHub에 노출되거나, 담당자가 바뀌거나, 서비스가 키를 교체하면 조용히 깨진다. [MCP 보안 관련 CVE 사례들을 보면](/ko/blog/ko/mcp-security-crisis-30-cves-enterprise-hardening) 자격증명 관리 실패가 반복 패턴이다.

Kubernetes Secret에서 환경변수로 주입하는 기본 방법부터:

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

OAuth 2.1을 쓰려면 MCP 서버가 Bearer 토큰을 검증해야 한다:

```python
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    # 토큰 인트로스펙션
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

솔직히 OAuth 설정이 API 키보다 복잡한 건 사실이다. 인트로스펙션 서버를 따로 운영해야 하고, 토큰 갱신 로직도 클라이언트 쪽에 있어야 한다. 하지만 장기 운영 관점에서는 이게 맞다. 키 교체가 필요할 때 제로 다운타임으로 할 수 있고, 누가 어떤 도구를 호출했는지 추적도 된다.

## Step 6: 모니터링 — 52% 클럽에 들어가지 않으려면

배포가 끝이 아니다. 조용히 죽는 서버를 잡으려면 최소한 두 가지가 있어야 한다.

**외부 모니터링**: 내부 헬스체크만으로는 부족하다. 클라이언트가 실제로 연결하는 것처럼 외부에서 주기적으로 `/mcp` 엔드포인트를 찔러야 한다. UptimeRobot, Better Uptime, 또는 직접 만든 Kubernetes CronJob으로 할 수 있다.

```yaml
# monitor-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mcp-health-monitor
spec:
  schedule: "*/5 * * * *"  # 5분마다
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

**업스트림 API 변경 감지**: 의존하는 외부 API가 응답 스키마를 바꾸면 MCP 서버는 살아있지만 엉뚱한 값을 돌려준다. 정기적으로 실제 도구를 호출해서 결과를 검증하는 통합 테스트가 필요하다.

[MCP Gateway를 쓰면](/ko/blog/ko/mcp-gateway-agent-traffic-control) 여러 MCP 서버 앞에 단일 진입점을 두고 중앙에서 헬스 상태를 관리할 수 있다. 서버가 여러 개라면 고려할 만하다.

## 실제로 배포해보니

위 설정으로 내 MCP 서버를 올렸을 때 두 가지 예상 못한 문제가 있었다.

첫 번째는 readiness probe가 너무 공격적이라 파드 시작 직후에 바로 실패 판정이 났다는 거다. 서버가 완전히 뜨기 전에 프로브가 `/health/ready`를 찌르니까 503이 나왔고, Kubernetes가 파드를 계속 재시작하는 루프에 빠졌다. `initialDelaySeconds`를 10초로 늘려서 해결했다.

두 번째는 `stateless_http=True`로 설정하면 장기 스트리밍 응답이 끊기는 케이스가 있었다. FastMCP 0.9.x에서 알려진 이슈인데, 세션을 Redis에 올리는 방식으로 우회했다. 스트리밍을 쓰지 않는다면 stateless로 두는 게 맞다.

## 자동 재배포 설정 — 이미지 태그 전략

`latest` 태그를 쓰면 언제 이미지가 바뀌었는지 알 수 없다. Kubernetes는 이미지 풀 정책이 `IfNotPresent`일 때 이미 로컬에 있으면 새 이미지를 받지 않는다.

```yaml
# 나쁜 예
image: my-registry/mcp-server:latest
imagePullPolicy: IfNotPresent

# 좋은 예 — Git 커밋 SHA나 semver 태그 사용
image: my-registry/mcp-server:v1.2.3
imagePullPolicy: IfNotPresent
```

CI/CD 파이프라인에서 배포할 때마다 태그를 바꾸도록 자동화하면 된다:

```bash
# GitHub Actions 예시
IMAGE_TAG="v$(date +%Y%m%d)-${GITHUB_SHA::8}"
docker build -t my-registry/mcp-server:${IMAGE_TAG} .
docker push my-registry/mcp-server:${IMAGE_TAG}

# Kubernetes Deployment 업데이트
kubectl set image deployment/my-mcp-server \
  mcp-server=my-registry/mcp-server:${IMAGE_TAG}
```

롤링 업데이트 전략도 설정해두면 배포 중 다운타임이 없다:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 배포 중 최대 추가 파드 수
      maxUnavailable: 0  # 배포 중 최소 가용 파드 보장
```

`maxUnavailable: 0`은 항상 최소 replica 수 이상을 유지한다는 뜻이다. 새 파드가 readiness를 통과하기 전까지 기존 파드를 내리지 않는다.

## RBAC — 최소 권한 원칙

MCP 서버가 Kubernetes 클러스터 내부 리소스에 접근해야 하는 경우(예: Pod 목록 조회, ConfigMap 읽기 등), ServiceAccount와 RBAC를 제대로 설정해야 한다.

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-server-sa
  namespace: default

---
# role.yaml — 필요한 권한만 최소로
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: mcp-server-role
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]  # create, delete는 필요할 때만
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

Deployment에 ServiceAccount 지정:

```yaml
spec:
  template:
    spec:
      serviceAccountName: mcp-server-sa
      automountServiceAccountToken: false  # 직접 관리할 때만 false
```

`automountServiceAccountToken: false`로 설정하면 서비스 어카운트 토큰이 자동으로 마운트되지 않아 공격 표면을 줄인다. Kubernetes API에 접근해야 한다면 true로 두거나 명시적으로 마운트해야 한다.

## 트러블슈팅 FAQ

실제로 배포하면서 가장 많이 마주친 문제들이다.

**Q: 파드가 CrashLoopBackOff 상태다**

로그부터 확인한다:
```bash
kubectl logs deployment/my-mcp-server --previous
```

`--previous`는 이전 컨테이너 인스턴스의 로그를 본다. 현재 재시작 중인 컨테이너 로그는 비어있을 수 있다.

주요 원인:
- 환경변수 누락 (Secret 참조 오류)
- 의존성 버전 충돌
- 포트 바인딩 실패 (이미 사용 중인 포트)

**Q: readiness probe는 통과하는데 실제로 MCP 요청이 실패한다**

헬스체크와 실제 MCP 요청이 다른 코드 경로를 타는 경우다. `/health/ready`가 외부 API를 제대로 확인하는지 다시 점검한다. 외부 API 상태를 체크하는 로직이 실제 MCP 도구 호출 로직과 분리돼 있으면 이런 일이 생긴다.

**Q: Streamable HTTP 연결이 중간에 끊긴다**

nginx ingress를 쓴다면 프록시 타임아웃 설정을 확인한다:

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
  nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
```

AWS ALB를 쓰는 경우 idle timeout을 늘려야 한다. 기본값이 60초라 긴 스트리밍 응답 중에 연결이 리셋된다.

**Q: replica가 2개인데 세션이 간혹 깨진다**

FastMCP를 `stateless_http=False`(기본값)로 운영하면서 로드밸런서 뒤에 두는 경우다. 같은 클라이언트가 다른 파드로 라우팅되면 세션 정보가 없어서 오류가 난다.

해결책은 두 가지:
1. `stateless_http=True` — 세션이 필요 없는 단순 도구라면 이게 맞다
2. nginx ingress의 세션 어피니티(sticky session) 설정:

```yaml
annotations:
  nginx.ingress.kubernetes.io/affinity: "cookie"
  nginx.ingress.kubernetes.io/affinity-mode: "persistent"
  nginx.ingress.kubernetes.io/session-cookie-name: "mcp-session"
```

개인적으로는 stateless로 설계하는 걸 선호한다. 세션 어피니티는 노드가 내려갈 때 어피니티가 깨지면서 결국 같은 문제가 생긴다.

## HorizontalPodAutoscaler — 트래픽에 따른 자동 스케일링

평소에는 replica 2개가 충분하지만 에이전트 트래픽이 몰릴 때는 빠르게 늘어나야 한다. HPA를 설정해두면 CPU 또는 메모리 사용량에 따라 파드 수가 자동으로 조정된다.

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
      stabilizationWindowSeconds: 30   # 빠르게 늘린다
    scaleDown:
      stabilizationWindowSeconds: 300  # 천천히 줄인다 (요청 중 파드가 내려가면 안 됨)
```

`scaleDown.stabilizationWindowSeconds`를 길게 잡은 이유가 있다. 파드가 갑자기 내려가면 처리 중인 MCP 요청이 중단된다. 300초(5분) 안정화 윈도우면 대부분의 요청이 완료될 시간이 충분하다. MCP 서버의 특성상 응답이 수십 초 걸리는 긴 스트리밍 응답도 있기 때문이다.

## 아직 해결 안 된 것들

Kubernetes에서 MCP 서버를 운영하면서 아직 명쾌한 답을 못 찾은 게 있다.

수평 스케일링과 세션 상태의 트레이드오프. Streamable HTTP의 2026 로드맵에서 "세션을 상태 없이(stateless) 다루는 방향"으로 트랜스포트를 개선한다고 했는데, 그 전까지는 스케일 아웃할 때마다 세션 스티키니스를 직접 관리해야 한다.

그리고 `.well-known` 메타데이터 엔드포인트 표준화도 아직 논의 중이다. 레지스트리나 크롤러가 MCP 서버에 실제로 연결하지 않고도 뭘 할 수 있는지 알 수 있게 하는 표준인데, 이게 없으면 죽은 서버인지 살아있는 서버인지 확인하려면 무조건 연결해봐야 한다.

이 두 가지가 정리되면 "52% 죽어있는" 문제가 상당 부분 해결될 것 같다. 그 전까지는 여기서 다룬 헬스체크, 의존성 핀닝, OAuth 자격증명 관리가 최선의 대응이다.
