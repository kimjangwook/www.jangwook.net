---
title: LiteLLM 공급망 공격 — AI 인프라 의존성의 보안 사각지대
description: >-
  PyPI에서 발생한 LiteLLM 공급망 공격을 분석하고, AI 도구 체인에서 의존성 관리와 공급망 보안을 강화하기 위한 실전 방법을
  정리합니다.
pubDate: '2026-03-31'
heroImage: >-
  ../../../assets/blog/litellm-supply-chain-attack-ai-dependency-security-hero.jpg
tags:
  - security
  - supply-chain
  - python
  - ai-infrastructure
relatedPosts:
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: gpt53-codex-rollout-pause
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps主题进行连接。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.91
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps主题进行连接。
---

3월 24일, PyPI에 올라온 LiteLLM 1.82.7과 1.82.8 버전에서 백도어가 발견됐다. LiteLLM은 하루 340만 다운로드를 기록하는, 클라우드 환경의 36%에 설치된 LLM 프록시 라이브러리다. 보안 스캐너 Trivy를 먼저 감염시킨 뒤, 그 스캐너가 CI/CD 파이프라인에서 LiteLLM 빌드를 오염시킨 공격이었다.

보안 도구를 신뢰하고 있었는데, 그 보안 도구 자체가 감염 경로였다는 점이 꽤 충격적이다.

## 공격 체인 분석

TeamPCP라는 그룹이 수행한 이 공격은 3단계로 구성되어 있었다.

**1단계: 보안 스캐너 감염**

Aqua Security의 Trivy(컨테이너 취약점 스캐너)를 먼저 타겟팅했다. Trivy의 GitHub Actions 워크플로우를 통해 악성 코드를 CI/CD 파이프라인에 주입했다. LiteLLM의 릴리즈 파이프라인이 Trivy를 보안 검증 단계로 사용하고 있었기 때문에, 보안 검증 자체가 감염 벡터가 됐다.

**2단계: 패키지 오염**

감염된 CI/CD를 통해 LiteLLM 패키지에 `.pth` 파일이 삽입됐다. Python의 `.pth` 파일은 site-packages 디렉터리에 있으면 Python 프로세스 시작 시 자동으로 실행된다. 즉, `import litellm`을 하지 않아도, 같은 환경에서 아무 Python 스크립트만 실행해도 악성 코드가 동작하는 구조다.

`.pth` 파일은 원래 패키지 경로 설정용이지만, 임의 코드 실행이 가능한 구조적 취약점이 있다. 대부분의 보안 스캐너가 `.py` 파일만 검사하고 `.pth`는 확인하지 않는다는 점을 노린 영리한 방식이었다.

**3단계: 3중 페이로드**

실행되면 순차적으로 세 가지 동작을 수행했다:

| 단계 | 행위 | 목적 |
|------|------|------|
| 크리덴셜 수확 | AWS, GCP, Azure 인증 정보 수집 | 클라우드 리소스 탈취 |
| K8s 수평 이동 | 쿠버네티스 클러스터 내 다른 노드로 확산 | 공격 범위 확대 |
| systemd 백도어 | 영구적 systemd 서비스 설치 | 재부팅 후에도 지속 |

노출 시간은 약 3시간이었다. 짧다고 볼 수도 있지만, 하루 340만 다운로드 규모에서 3시간이면 수천 개 환경이 감염됐을 수 있다.

## 왜 AI 도구 체인이 특히 위험한가

나는 이 사건이 AI/LLM 생태계에 특별히 더 위험한 이유가 있다고 본다.

**의존성 체인이 깊고 넓다.** 일반적인 웹 애플리케이션과 달리, AI 프로젝트의 `requirements.txt`는 수십 개의 ML 라이브러리를 포함한다. LiteLLM 하나만 해도 OpenAI, Anthropic, Google, Cohere 등 수십 개 프로바이더 SDK에 의존한다. 하나가 감염되면 전파 범위가 넓다.

**빠른 업데이트 주기.** AI 라이브러리는 API 변경이 잦아서 `pip install --upgrade`를 자주 실행한다. 새 모델이 나올 때마다 SDK를 업데이트하는 습관이 공격 노출면을 키운다.

**프로덕션 환경의 높은 권한.** LLM 프록시 서버는 대부분 클라우드 API 키를 환경 변수로 갖고 있다. AWS, GCP, 각종 AI 프로바이더 키가 한곳에 모여 있으니 공격자 입장에서는 노다지다.

## 실전 대응 방법

이론적인 이야기보다 당장 적용할 수 있는 것들을 정리해봤다.

### 1. 버전 핀닝 + 해시 검증

```bash
# requirements.txt에 해시를 함께 고정
litellm==1.82.6 \
  --hash=sha256:abc123...

# pip-compile로 자동 생성 가능
pip-compile --generate-hashes requirements.in
```

`>=1.82.0` 같은 범위 지정은 이런 공격에 바로 당한다. 정확한 버전과 해시를 함께 고정해야 한다.

### 2. .pth 파일 모니터링

CI/CD 파이프라인에서 패키지 설치 전후로 `.pth` 파일 diff를 확인하는 단계를 추가하는 것이 효과적이다. site-packages 디렉터리에 예상치 못한 `.pth` 파일이 생기면 즉시 경고를 발생시켜야 한다.

```bash
# site-packages 내 .pth 파일 목록 스냅샷 비교
diff <(cat /tmp/pth-before.txt) \
     <(find "$(python -c 'import site; print(site.getsitepackages()[0])')" \
       -name "*.pth" | sort)
```

### 3. 보안 도구도 검증 대상

이번 사건의 가장 뼈아픈 교훈은 "보안 스캐너를 신뢰했더니 그게 감염 벡터였다"는 점이다. Trivy, Snyk, Checkmarx 같은 보안 도구의 GitHub Actions 버전도 해시 기반으로 고정해야 한다.

```yaml
# Bad: 태그 기반 (변조 가능)
- uses: aquasecurity/trivy-action@latest

# Good: 커밋 해시 기반
- uses: aquasecurity/trivy-action@a7b7e23e4a1e36c8a6a1b8c0a1d2e3f4a5b6c7d8
```

### 4. 네트워크 격리

LLM 프록시 서버가 외부로 아웃바운드 연결을 열 수 있다면, 크리덴셜 유출도 가능하다. 프로덕션 환경에서는 허용된 AI API 엔드포인트만 화이트리스트로 열어두는 것이 좋다.

## 과대평가 경계

한 가지 주의할 점: 이 사건을 "AI 라이브러리를 쓰면 안 된다"로 확대 해석하면 곤란하다. 공급망 공격은 AI에 국한된 문제가 아니라 npm(event-stream 사건), PyPI(ctx 패키지), 그리고 솔라윈즈까지 소프트웨어 생태계 전반의 문제다. 다만 AI 도구 체인은 높은 권한 + 빠른 업데이트 주기 + 깊은 의존성이라는 조합 때문에 공격 가치가 더 높다는 점을 인식해야 한다.

개인적으로 이번 사건 이후 우리 팀에서 CI/CD 파이프라인의 모든 외부 액션을 해시 기반으로 전환하는 작업을 시작했다. 솔직히 귀찮지만, `.pth` 파일 하나로 클라우드 키가 통째로 날아가는 시나리오를 생각하면 안 할 이유가 없다.

---

**참고 자료:**
- [LiteLLM 보안 업데이트 (2026년 3월)](https://docs.litellm.ai/blog/security-update-march-2026)
- [Snyk: Poisoned Security Scanner Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
- [Sonatype: Compromised LiteLLM PyPI Package Analysis](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
