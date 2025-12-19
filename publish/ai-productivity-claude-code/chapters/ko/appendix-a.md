# Appendix A: 트러블슈팅 가이드

## 개요

Claude Code를 실전 프로젝트에서 활용하다 보면 다양한 문제 상황에 직면하게 됩니다. 이 부록에서는 71개 실전 프로젝트 운영 경험에서 축적된 일반적인 문제와 해결책을 체계적으로 정리합니다.

각 문제는 **증상 → 원인 → 해결책 → 예방법** 순서로 구성되어 있어, 문제 발생 시 신속한 대응이 가능하도록 설계되었습니다.

---

## A.1: 일반적인 오류 및 해결책

### A.1.1: 인증 오류

#### 증상 (Symptom)

```bash
Error: Authentication failed. Please check your API key.
```

또는

```bash
Error: 401 Unauthorized - Invalid API key
```

Claude Code 실행 시 API 키 인증이 실패하여 모든 작업이 차단됩니다.

#### 원인 (Cause)

1. **API 키 미설정**: 환경 변수 또는 설정 파일에 API 키가 누락됨
2. **잘못된 API 키**: 키 복사 시 공백이나 특수 문자가 포함됨
3. **만료된 API 키**: 키의 유효 기간이 종료되었거나 삭제됨
4. **권한 부족**: API 키에 필요한 권한(scope)이 할당되지 않음

#### 해결책 (Solution)

**1단계: API 키 확인**

```bash
# 환경 변수 확인
echo $ANTHROPIC_API_KEY

# 또는 설정 파일 확인
cat ~/.config/claude/config.json
```

**2단계: API 키 재설정**

```bash
# Claude Code CLI를 통한 인증
claude auth login

# 또는 환경 변수 직접 설정 (Linux/macOS)
export ANTHROPIC_API_KEY="sk-ant-api..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-api..."
```

**3단계: 키 유효성 검증**

```bash
# 간단한 API 호출로 테스트
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**4단계: 권한 확인**

Anthropic Console에서:
- API 키가 활성 상태인지 확인
- 필요한 모델(Claude 3.5 Sonnet 등)에 대한 액세스 권한 확인
- 사용량 한도가 초과되지 않았는지 확인

#### 예방법 (Prevention)

1. **환경 변수 영구 설정**
   ```bash
   # ~/.bashrc 또는 ~/.zshrc에 추가
   echo 'export ANTHROPIC_API_KEY="sk-ant-api..."' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **API 키 안전 관리**
   - `.env` 파일 사용 시 반드시 `.gitignore`에 추가
   - 키를 코드에 하드코딩하지 않음
   - 비밀 관리 도구(1Password, Vault 등) 활용

3. **정기적인 키 갱신**
   - 보안 정책에 따라 3〜6개월마다 키 교체
   - 프로젝트별 별도 키 사용 (권한 분리)

4. **모니터링 설정**
   - Anthropic Console에서 사용량 알림 설정
   - 예산 한도 설정으로 예상치 못한 비용 방지

---

### A.1.2: 네트워크 오류

#### 증상 (Symptom)

```bash
Error: Network request failed
Error: ECONNREFUSED
Error: Timeout waiting for response
```

API 호출 중 네트워크 연결 실패로 작업이 중단됩니다.

#### 원인 (Cause)

1. **인터넷 연결 끊김**: 네트워크 불안정 또는 방화벽 차단
2. **프록시 설정 문제**: 회사 네트워크에서 프록시 미설정
3. **DNS 해석 실패**: Anthropic API 서버 도메인 해석 불가
4. **Timeout 설정 부족**: 대용량 응답 대기 시간 초과
5. **Rate Limiting**: API 호출 빈도 제한 초과

#### 해결책 (Solution)

**1단계: 기본 네트워크 진단**

```bash
# 인터넷 연결 확인
ping 8.8.8.8

# Anthropic API 서버 도달 가능성 확인
curl -I https://api.anthropic.com

# DNS 해석 확인
nslookup api.anthropic.com
```

**2단계: 프록시 설정 (회사 네트워크)**

```bash
# HTTP 프록시 설정
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"

# Claude Code 설정 파일에서 프록시 지정
# ~/.config/claude/config.json
{
  "proxy": "http://proxy.company.com:8080"
}
```

**3단계: Timeout 조정**

`.claude/settings.local.json`에서:

```json
{
  "apiTimeout": 300000,  // 5분으로 연장 (기본 60초)
  "maxRetries": 3,       // 재시도 횟수 증가
  "retryDelay": 2000     // 재시도 간격 2초
}
```

**4단계: Rate Limit 대응**

```javascript
// 요청 간 지연 추가 (Node.js 예시)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callClaudeWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await claude.messages.create({ /* ... */ });
      return response;
    } catch (error) {
      if (error.status === 429) {  // Rate limit
        const waitTime = Math.pow(2, i) * 1000;  // 지수 백오프
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

#### 예방법 (Prevention)

1. **안정적인 네트워크 환경 구축**
   - 중요 작업 시 유선 연결 사용
   - VPN 사용 시 안정성 검증

2. **자동 재시도 로직 구현**
   ```python
   # Python 예시 (tenacity 라이브러리)
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def call_claude_api():
       # API 호출 코드
       pass
   ```

3. **API 호출 빈도 관리**
   - Rate limit 정보 모니터링 (응답 헤더의 `x-ratelimit-*`)
   - 대량 작업 시 배치 처리와 지연 적용

4. **캐싱 전략**
   - 동일한 프롬프트 결과는 로컬 캐시 활용
   - 메타데이터 우선 아키텍처 (Chapter 16 참조)

---

### A.1.3: 토큰 제한 오류

#### 증상 (Symptom)

```bash
Error: Request exceeds maximum token limit (200,000 tokens)
Error: Context length exceeded
```

프롬프트 또는 응답이 모델의 컨텍스트 윈도우를 초과하여 요청이 거부됩니다.

#### 원인 (Cause)

1. **과도한 컨텍스트**: CLAUDE.md, 코드베이스, 대화 히스토리가 너무 큼
2. **대용량 파일 포함**: 로그 파일, 데이터 파일 등을 프롬프트에 포함
3. **누적된 대화 히스토리**: 장시간 대화로 컨텍스트 누적
4. **비효율적인 프롬프트 구조**: 중복 정보, 불필요한 설명

#### 해결책 (Solution)

**1단계: 토큰 사용량 분석**

```bash
# Claude Code에서 토큰 사용량 확인
# 대화 중 Claude에게 질문
"현재 컨텍스트의 토큰 사용량은 얼마인가요?"
```

**2단계: 컨텍스트 최적화**

```markdown
<!-- CLAUDE.md 최적화 전 -->
## 모든 파일 설명
- src/components/Header.astro: 헤더 컴포넌트입니다. 네비게이션과 로고를 표시합니다...
- src/components/Footer.astro: 푸터 컴포넌트입니다. 저작권과 링크를 표시합니다...
(100줄 계속...)

<!-- 최적화 후 -->
## 핵심 컴포넌트
- Header/Footer: `src/components/`
- 상세 구조는 필요 시 해당 파일 참조
```

**3단계: 대화 히스토리 정리**

```bash
# Claude Code에서 대화 초기화
/clear

# 또는 새 대화 시작
"새 주제로 넘어가겠습니다. 이전 대화 컨텍스트는 무시해주세요."
```

**4단계: 청킹 전략 적용**

대량 데이터 처리 시:

```python
# 잘못된 접근: 전체 데이터 한 번에 전송
all_posts = read_all_blog_posts()  # 10,000줄
prompt = f"다음 포스트들을 분석해주세요:\n{all_posts}"

# 올바른 접근: 청킹 및 배치 처리
def process_in_chunks(posts, chunk_size=10):
    results = []
    for i in range(0, len(posts), chunk_size):
        chunk = posts[i:i+chunk_size]
        result = claude_api.analyze(chunk)
        results.append(result)
    return merge_results(results)
```

**5단계: 외부 파일 참조 활용**

```markdown
<!-- 프롬프트에 전체 코드 포함 대신 -->
"다음 파일의 버그를 수정해주세요:
파일: src/components/BlogCard.astro"

<!-- Claude가 Read 도구로 파일 로드 -->
```

#### 예방법 (Prevention)

1. **CLAUDE.md 간결화**
   - 필수 정보만 포함 (명령어, 구조, 규칙)
   - 상세 설명은 별도 문서로 분리
   - 목표: 2000줄 이하 유지

2. **프롬프트 템플릿 사용**
   ```markdown
   # 효율적인 프롬프트 템플릿
   ## 목표
   [1-2 문장으로 명확히]

   ## 컨텍스트
   [필수 정보만, 파일 경로 우선]

   ## 요구사항
   - [구체적이고 측정 가능한 항목]
   ```

3. **정기적인 /clear 사용**
   - 주제 전환 시마다 대화 초기화
   - 장시간 작업 후 새 세션 시작

4. **메타데이터 우선 아키텍처**
   - 전체 콘텐츠 대신 메타데이터 활용
   - `post-metadata.json` 같은 인덱스 파일 생성
   - 필요 시에만 전체 파일 로드

---

### A.1.4: 컨텍스트 오버플로우

#### 증상 (Symptom)

```bash
Warning: Context approaching limit (180,000 / 200,000 tokens)
Error: Unable to process request - context overflow
```

또는 Claude의 응답이:
- 갑자기 짧아짐
- 이전 대화 내용을 잊어버림
- 반복적인 질문을 함

#### 원인 (Cause)

1. **긴 대화 세션**: 여러 작업을 하나의 대화에서 수행
2. **대용량 파일 읽기**: 여러 개의 큰 파일을 연속 로드
3. **서브에이전트 체인**: 여러 에이전트 간 핸드오프로 컨텍스트 누적
4. **디버그 모드**: 상세 로그가 컨텍스트에 포함됨

#### 해결책 (Solution)

**1단계: 컨텍스트 부하 감지**

Claude가 다음과 같은 신호를 보일 때 주의:
- "앞서 언급한 내용을 다시 확인하겠습니다"
- 이미 답변한 질문을 재질문
- 응답 품질 저하

**2단계: 즉시 대화 정리**

```bash
# 옵션 1: 완전 초기화
/clear

# 옵션 2: 요약 후 재시작
"지금까지 작업한 내용을 3줄로 요약하고, 새 대화를 시작해주세요"
```

**3단계: 작업 분할**

```markdown
<!-- 잘못된 접근: 하나의 대화에서 모든 작업 -->
1. 블로그 포스트 작성
2. SEO 최적화
3. 이미지 생성
4. 4개 언어 번역
5. 커밋 및 배포

<!-- 올바른 접근: 작업별 별도 대화 -->
세션 1: 블로그 포스트 작성 → /clear
세션 2: SEO 최적화 → /clear
세션 3: 이미지 생성 → /clear
세션 4: 번역 → /clear
```

**4단계: 서브에이전트 활용**

```bash
# 메인 대화 부담 감소
@writing-assistant "블로그 포스트 작성"  # 별도 컨텍스트
@seo-optimizer "메타데이터 최적화"       # 독립 실행
```

#### 예방법 (Prevention)

1. **대화 수명 관리**
   - 복잡한 작업: 15〜20 왕복 대화 후 /clear
   - 단순 작업: 5〜10 왕복 후 정리

2. **Stateless 작업 설계**
   - 각 작업이 이전 대화에 의존하지 않도록
   - 필요한 컨텍스트는 매번 명시적으로 제공

3. **파일 읽기 최적화**
   ```bash
   # 전체 파일 대신 필요한 부분만
   "src/components/Header.astro의 30-50줄만 읽어주세요"

   # 또는 요약 먼저
   "이 파일의 구조만 파악해주세요 (전체 읽기 X)"
   ```

4. **Hook 기반 자동화**
   - 반복 작업은 Hook으로 자동화
   - Claude와의 대화 최소화 (Chapter 10 참조)

---

## A.2: 성능 문제 진단

### A.2.1: 느린 응답 시간

#### 증상 (Symptom)

- 간단한 질문에도 30초 이상 소요
- "Thinking..." 상태가 과도하게 길어짐
- API 호출 후 장시간 응답 없음

#### 원인 (Cause)

1. **복잡한 프롬프트**: 모호하거나 다중 요구사항
2. **대량 데이터 처리**: 한 번에 수백 개 파일 분석
3. **재귀적 에이전트 호출**: 무한 루프에 가까운 서브에이전트 체인
4. **네트워크 지연**: 느린 인터넷 연결
5. **모델 부하**: Anthropic API 서버 혼잡

#### 해결책 (Solution)

**1단계: 프롬프트 최적화**

```markdown
<!-- Before: 모호하고 복잡 -->
"블로그를 분석해서 좋은 점과 나쁜 점을 찾고, SEO를 개선하고,
성능도 측정하고, 보안 문제도 확인해주세요."

<!-- After: 명확하고 단순 -->
"블로그의 SEO 메타데이터(title, description)만 검토해주세요.
- 목표: 클릭률 개선
- 파일: src/content/blog/ko/latest-post.md"
```

**2단계: 배치 처리 도입**

```python
# 순차 처리 (느림)
for post in all_posts:
    result = claude.analyze(post)  # 각각 10초 = 총 100초

# 배치 처리 (빠름)
batch_results = claude.analyze_batch(all_posts)  # 총 15초
```

**3단계: 캐싱 활용**

```javascript
// 캐시 레이어 추가
const cache = new Map();

async function getAnalysis(postId) {
  if (cache.has(postId)) {
    return cache.get(postId);  // 즉시 반환
  }

  const result = await claude.analyze(postId);
  cache.set(postId, result);
  return result;
}
```

**4단계: 병렬 처리**

```bash
# Claude Code에서 여러 작업 동시 실행
"다음 3개 파일을 동시에 분석해주세요:
1. src/components/A.astro
2. src/components/B.astro
3. src/components/C.astro"
```

#### 예방법 (Prevention)

1. **작은 단위로 작업**
   - 큰 작업은 5〜10개 단계로 분할
   - 각 단계별 결과 확인 후 다음 진행

2. **Think 도구 활용**
   - 복잡한 결정은 Think 모드로 사전 계획
   - 실행 단계는 간단하게 유지

3. **메타데이터 우선**
   - 전체 콘텐츠 대신 메타데이터로 1차 필터링
   - 필요한 항목만 상세 분석

4. **시간 제한 설정**
   ```json
   // .claude/settings.local.json
   {
     "maxThinkingTime": 30,  // Think 모드 30초 제한
     "taskTimeout": 300      // 전체 작업 5분 제한
   }
   ```

---

### A.2.2: 메모리 문제

#### 증상 (Symptom)

```bash
Error: JavaScript heap out of memory
Process killed (OOM - Out Of Memory)
```

또는:
- Claude Code가 갑자기 종료됨
- 시스템 전체가 느려짐
- 스왑 메모리 과다 사용

#### 원인 (Cause)

1. **대용량 파일 로드**: 수백 MB 로그 파일 읽기
2. **메모리 누수**: 캐시가 무한정 증가
3. **동시 작업 과다**: 너무 많은 병렬 프로세스
4. **임시 파일 미정리**: 빌드 결과물 누적

#### 해결책 (Solution)

**1단계: 메모리 사용량 모니터링**

```bash
# 시스템 메모리 확인
top
# 또는
htop

# Node.js 프로세스 메모리 확인
node --trace-gc your-script.js
```

**2단계: Node.js 힙 크기 증가**

```bash
# 환경 변수 설정
export NODE_OPTIONS="--max-old-space-size=4096"  # 4GB

# 또는 직접 실행
node --max-old-space-size=4096 script.js
```

**3단계: 스트림 처리 적용**

```javascript
// 잘못된 접근: 전체 파일 메모리 로드
const allData = fs.readFileSync('huge-log.txt', 'utf8');  // OOM!

// 올바른 접근: 스트림 처리
const stream = fs.createReadStream('huge-log.txt');
stream.on('data', chunk => {
  processChunk(chunk);  // 청크별 처리
});
```

**4단계: 캐시 정리 정책**

```javascript
// LRU 캐시 사용 (크기 제한)
const LRU = require('lru-cache');

const cache = new LRU({
  max: 100,              // 최대 100개 항목
  maxAge: 1000 * 60 * 60 // 1시간 후 만료
});
```

**5단계: 작업 큐 관리**

```javascript
// 동시 실행 제한
const pLimit = require('p-limit');
const limit = pLimit(5);  // 최대 5개 동시 실행

const promises = files.map(file =>
  limit(() => processFile(file))
);
await Promise.all(promises);
```

#### 예방법 (Prevention)

1. **파일 크기 제한**
   ```bash
   # 10MB 이상 파일은 경고
   find . -type f -size +10M

   # .gitignore에 대용량 파일 제외
   *.log
   dist/
   node_modules/
   ```

2. **정기적인 정리**
   ```bash
   # 임시 파일 자동 정리 (Hook)
   # .claude/hooks/post-commit.sh
   #!/bin/bash
   rm -rf .temp/
   npm run clean
   ```

3. **프로파일링**
   ```bash
   # 메모리 사용 패턴 분석
   node --inspect your-script.js
   # Chrome DevTools로 메모리 스냅샷 확인
   ```

4. **리소스 제한 명시**
   ```yaml
   # docker-compose.yml (컨테이너 사용 시)
   services:
     claude-agent:
       image: node:18
       mem_limit: 2g      # 2GB 제한
       memswap_limit: 2g  # 스왑 방지
   ```

---

### A.2.3: 비용 초과

#### 증상 (Symptom)

- 월 예산을 수일 만에 소진
- Anthropic 청구 금액이 예상의 2〜3배
- API 호출 횟수가 급증

#### 원인 (Cause)

1. **무한 루프**: 에이전트가 계속 재시도
2. **대량 토큰 사용**: 불필요한 컨텍스트 반복 전송
3. **비효율적인 워크플로우**: 같은 작업 중복 수행
4. **테스트 환경 미분리**: 실험 작업이 프로덕션 API 호출

#### 해결책 (Solution)

**1단계: 사용량 분석**

```bash
# Anthropic Console에서 확인
- API Usage Dashboard
- Cost by Model (Sonnet vs Opus)
- Top consuming projects
```

**2단계: 비용 모니터링 자동화**

```python
# 비용 알림 스크립트
import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 사용량 조회 (가상 API - 실제는 대시보드 확인)
usage = client.usage.get_current_month()

if usage['cost'] > 100:  # $100 초과 시
    send_alert(f"Cost alert: ${usage['cost']}")
```

**3단계: 토큰 최적화**

```markdown
<!-- Before: 26,000 tokens -->
CLAUDE.md: 15,000 tokens (모든 파일 상세 설명)
Prompt: 8,000 tokens (전체 코드 포함)
Response: 3,000 tokens

<!-- After: 8,000 tokens -->
CLAUDE.md: 3,000 tokens (핵심만)
Prompt: 2,000 tokens (파일 경로만)
Response: 3,000 tokens

**비용 절감**: 26k → 8k = **69% 절약**
```

**4단계: 캐싱 전략**

```javascript
// 메타데이터 재사용 (Chapter 16 참조)
const metadata = JSON.parse(fs.readFileSync('post-metadata.json'));

// 변경된 포스트만 재처리
const changedPosts = metadata.filter(post =>
  post.contentHash !== calculateHash(post.filePath)
);

// 나머지는 캐시 사용
console.log(`Processing ${changedPosts.length} / ${metadata.length} posts`);
// 비용 절감: 100개 → 5개 = 95% 절약
```

**5단계: 모델 최적화**

```javascript
// 작업별 적절한 모델 선택
const tasks = {
  simple: 'claude-3-haiku-20240307',      // 저렴
  standard: 'claude-3-5-sonnet-20241022', // 중간
  complex: 'claude-opus-4-20250514'       // 고급
};

// 간단한 작업은 Haiku 사용
if (task === 'format-check') {
  model = tasks.simple;  // 비용 1/10
}
```

#### 예방법 (Prevention)

1. **예산 한도 설정**
   ```json
   // .claude/settings.local.json
   {
     "budget": {
       "monthly": 100,      // $100/월
       "alertAt": 80,       // $80 도달 시 알림
       "stopAt": 100        // $100 도달 시 중단
     }
   }
   ```

2. **로컬 모델 활용**
   - 개발/테스트: Llama 3, Mistral 등 로컬 모델
   - 프로덕션: Claude API
   ```bash
   # Ollama로 로컬 테스트
   ollama run llama3 "테스트 프롬프트"
   ```

3. **프롬프트 라이브러리**
   - 검증된 프롬프트 재사용
   - 실험은 별도 계정/프로젝트

4. **자동화 우선**
   - Hook 기반 워크플로우 (무료)
   - 필요 시에만 Claude 호출
   ```bash
   # Hook에서 간단한 검사는 스크립트로
   # .claude/hooks/pre-commit.sh
   #!/bin/bash

   # 간단한 검증 (무료)
   npm run lint
   npm run type-check

   # 복잡한 분석만 Claude 사용
   if [ "$COMPLEX_REVIEW" = "true" ]; then
     claude review
   fi
   ```

---

## A.3: 디버깅 기법

### A.3.1: 로그 분석

#### 기본 로깅 활성화

**1단계: Claude Code 디버그 모드**

```bash
# 환경 변수 설정
export CLAUDE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# 로그 파일 지정
export CLAUDE_LOG_FILE=~/claude-debug.log
```

**2단계: 상세 로그 확인**

```bash
# 실시간 로그 추적
tail -f ~/claude-debug.log

# 에러만 필터링
grep "ERROR" ~/claude-debug.log

# 특정 API 호출 추적
grep "api.anthropic.com" ~/claude-debug.log
```

**3단계: 토큰 사용량 로깅**

```javascript
// 커스텀 래퍼로 모든 API 호출 로깅
const originalCreate = client.messages.create;

client.messages.create = async function(...args) {
  const startTime = Date.now();
  const response = await originalCreate.apply(this, args);

  const elapsed = Date.now() - startTime;
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost = calculateCost(inputTokens, outputTokens);

  console.log({
    timestamp: new Date().toISOString(),
    elapsed,
    inputTokens,
    outputTokens,
    cost,
    model: args[0].model
  });

  return response;
};
```

#### 로그 패턴 분석

**일반적인 에러 패턴**:

```bash
# 1. 인증 실패
[ERROR] 401 Unauthorized
→ 원인: API 키 문제
→ 해결: A.1.1 참조

# 2. Rate Limit
[ERROR] 429 Too Many Requests
→ 원인: API 호출 빈도 초과
→ 해결: 지수 백오프 재시도

# 3. 타임아웃
[ERROR] Request timeout after 60000ms
→ 원인: 대용량 데이터 또는 네트워크 지연
→ 해결: Timeout 증가 또는 청킹

# 4. 컨텍스트 초과
[ERROR] Context length 210000 exceeds limit 200000
→ 원인: 프롬프트 너무 큼
→ 해결: A.1.3 참조
```

#### 구조화된 로깅

```typescript
// 로깅 유틸리티
class Logger {
  private logFile: string;

  constructor(logFile: string) {
    this.logFile = logFile;
  }

  log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };

    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');

    if (level === 'ERROR') {
      console.error(message, metadata);
    }
  }

  debug(message: string, metadata?: any) {
    this.log('DEBUG', message, metadata);
  }

  error(message: string, metadata?: any) {
    this.log('ERROR', message, metadata);
  }
}

// 사용 예시
const logger = new Logger('~/claude-app.log');

logger.debug('Starting blog post generation', { postId: '123' });
logger.error('Failed to generate image', { error: e.message, stack: e.stack });
```

---

### A.3.2: 단계별 실행

#### 복잡한 작업 분해

**문제 상황**: 블로그 자동화 전체 파이프라인이 중간에 실패하는데 어디서 문제인지 불명확

**해결 전략**: 각 단계를 독립적으로 실행하며 검증

**1단계: 워크플로우 분해**

```markdown
전체 파이프라인:
1. 주제 선정 (@content-planner)
2. 초안 작성 (@writing-assistant)
3. 이미지 생성 (@image-generator)
4. SEO 최적화 (@seo-optimizer)
5. 4개 언어 번역
6. 메타데이터 생성 (@content-analyzer)
7. 추천 포스트 계산 (@content-recommender)
8. 커밋 및 배포

단계별 테스트:
각 단계를 개별 대화에서 실행하며 출력 검증
```

**2단계: 중간 결과 저장**

```javascript
// 각 단계마다 중간 파일 저장
const pipeline = {
  async step1_planning() {
    const topic = await contentPlanner.suggest();
    fs.writeFileSync('.temp/step1-topic.json', JSON.stringify(topic));
    return topic;
  },

  async step2_writing() {
    const topic = JSON.parse(fs.readFileSync('.temp/step1-topic.json'));
    const draft = await writingAssistant.write(topic);
    fs.writeFileSync('.temp/step2-draft.md', draft);
    return draft;
  },

  async step3_image() {
    const draft = fs.readFileSync('.temp/step2-draft.md', 'utf8');
    const image = await imageGenerator.create(draft);
    fs.writeFileSync('.temp/step3-image.jpg', image);
    return image;
  },

  // ... 계속
};

// 특정 단계만 재실행 가능
await pipeline.step3_image();  // 이미지 생성만 재시도
```

**3단계: Dry-run 모드**

```bash
# Hook 실행 시 dry-run 옵션
export CLAUDE_DRY_RUN=true

# 실제 파일 변경 없이 로그만 출력
.claude/hooks/pre-commit.sh
# → "Would run: npm test"
# → "Would check: frontmatter validation"
```

**4단계: 조건부 실행**

```bash
# 환경 변수로 단계별 활성화
export SKIP_IMAGE_GEN=true
export SKIP_TRANSLATION=true

# 스크립트에서
if [ "$SKIP_IMAGE_GEN" != "true" ]; then
  node generate_image.js
fi
```

#### 브레이크포인트 활용

```javascript
// 디버거 삽입
async function complexWorkflow() {
  const step1 = await doStep1();
  debugger;  // 여기서 중단하여 step1 결과 확인

  const step2 = await doStep2(step1);
  debugger;  // step2 결과 확인

  return step2;
}

// Node.js 디버거로 실행
node inspect workflow.js
```

#### 점진적 복잡도 증가

```markdown
<!-- 테스트 순서 -->
1. 최소 입력으로 시작
   - 예: 1개 포스트만 처리

2. 정상 케이스
   - 예: 3개 포스트 처리

3. 경계 조건
   - 예: 0개, 100개 포스트

4. 에러 케이스
   - 예: 잘못된 frontmatter, 누락된 이미지

5. 전체 프로덕션
   - 예: 모든 포스트 (71개)
```

---

### A.3.3: 에러 재현

#### 재현 가능한 테스트 케이스 작성

**목표**: 간헐적 버그를 100% 재현 가능하게 만들기

**1단계: 환경 고정**

```bash
# 버전 고정
node --version  # v18.17.0
npm --version   # 9.6.7

# 환경 변수 명시
export NODE_ENV=production
export ANTHROPIC_API_KEY=sk-ant-api...
export CLAUDE_DEBUG=true

# 의존성 고정
npm ci  # package-lock.json 기준 설치
```

**2단계: 입력 데이터 고정**

```javascript
// 테스트 픽스처 사용
const testPost = {
  title: "Test Post",
  description: "Test description",
  pubDate: "2025-01-15",
  content: fs.readFileSync('test/fixtures/sample-post.md', 'utf8')
};

// 실제 API 대신 Mock 사용 (재현성 향상)
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: "Fixed response" }],
        usage: { input_tokens: 100, output_tokens: 50 }
      })
    }
  }))
}));
```

**3단계: 시드 고정 (랜덤성 제거)**

```javascript
// 랜덤 요소가 있는 경우
Math.random = () => 0.5;  // 항상 같은 값
Date.now = () => 1234567890;  // 고정 타임스탬프

// 또는 시드 기반 랜덤
const seededRandom = require('seedrandom');
const rng = seededRandom('test-seed');
```

**4단계: 최소 재현 예제 (MRE) 작성**

```javascript
// ❌ 복잡한 전체 시스템
npm run full-pipeline

// ✅ 최소 재현 코드
const { Anthropic } = require('@anthropic-ai/sdk');

async function reproduceError() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 문제를 재현하는 최소한의 코드
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'This specific prompt causes the error...'
    }]
  });

  console.log(response);
}

reproduceError().catch(console.error);
```

#### 버그 리포트 템플릿

```markdown
## 버그 설명
간결한 1-2줄 요약

## 재현 단계
1. Claude Code 실행
2. 다음 프롬프트 입력: "..."
3. 에러 발생

## 예상 동작
...

## 실제 동작
...

## 환경 정보
- OS: macOS 14.5
- Node.js: v18.17.0
- Claude Code: v1.2.3
- 모델: claude-3-5-sonnet-20241022

## 로그
\`\`\`
[ERROR] 2025-01-15T10:30:00.000Z
Context length 210000 exceeds limit
\`\`\`

## 최소 재현 코드
\`\`\`javascript
// (위 MRE 코드)
\`\`\`

## 추가 정보
- 처음 발생: 2025-01-15
- 빈도: 10회 중 3회 발생
- 회피책: /clear 후 재시도
```

#### 회귀 테스트 자동화

```javascript
// 버그 수정 후 회귀 방지 테스트 추가
describe('Bug #123: Context overflow on large posts', () => {
  it('should handle 10,000-word post without error', async () => {
    const largePost = generatePost(10000);  // 10,000 단어

    const result = await processPost(largePost);

    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should chunk large context automatically', async () => {
    const hugeContext = 'x'.repeat(250000);  // 200k 토큰 초과

    const result = await analyzeWithChunking(hugeContext);

    expect(result.chunks.length).toBeGreaterThan(1);
  });
});
```

---

## A.4: 고급 디버깅 도구

### A.4.1: Claude DevTools (실험적 기능)

```bash
# Claude Code 개발자 도구 활성화
export CLAUDE_DEVTOOLS=true

# 브라우저에서 확인
# http://localhost:9222
```

**기능**:
- 실시간 토큰 사용량 모니터링
- API 호출 타임라인
- 컨텍스트 윈도우 시각화
- 에이전트 체인 추적

### A.4.2: MCP 서버 디버깅

```bash
# MCP 서버 로그 확인
export MCP_DEBUG=true

# 각 MCP 도구 호출 추적
{
  "mcpServers": {
    "brave-search": {
      "debug": true,
      "logFile": "/tmp/mcp-brave.log"
    }
  }
}
```

### A.4.3: Hook 실행 추적

```bash
# Hook 실행 로그
# .claude/hooks/pre-commit.sh
#!/bin/bash
set -x  # 모든 명령어 출력

echo "[$(date)] pre-commit hook started" >> /tmp/hook.log

# ... 실제 로직

echo "[$(date)] pre-commit hook completed" >> /tmp/hook.log
```

---

## A.5: 커뮤니티 리소스

### 공식 지원

- **Anthropic Support**: support@anthropic.com
- **Claude Code 문서**: https://docs.claude.com/claude-code
- **API 레퍼런스**: https://docs.anthropic.com/api

### 커뮤니티

- **Discord**: Anthropic 공식 Discord 서버
- **GitHub Discussions**: claude-code 레포지토리
- **Stack Overflow**: `[claude-code]` 태그

### 버그 리포팅

```bash
# 버그 리포트 제출
claude report-bug

# 또는 GitHub Issue
https://github.com/anthropics/claude-code/issues
```

---

## 요약

### 빠른 참조 체크리스트

**문제 발생 시 순서**:

1. ✅ 에러 메시지 확인 (A.1)
2. ✅ 로그 분석 (A.3.1)
3. ✅ 환경 변수 검증 (A.1.1)
4. ✅ 네트워크 연결 테스트 (A.1.2)
5. ✅ 토큰 사용량 확인 (A.1.3)
6. ✅ /clear 및 재시도
7. ✅ 최소 재현 예제 작성 (A.3.3)
8. ✅ 커뮤니티/공식 지원 문의

### 성능 최적화 순서

1. ✅ CLAUDE.md 간결화 (< 2000줄)
2. ✅ 메타데이터 우선 아키텍처 (Chapter 16)
3. ✅ 캐싱 전략 도입 (3계층)
4. ✅ 배치 처리 (청킹)
5. ✅ Hook 기반 자동화 (Chapter 10)
6. ✅ 모델 최적화 (Haiku/Sonnet/Opus)

### 비용 절감 우선순위

1. ✅ 중복 호출 제거 (캐싱)
2. ✅ 토큰 최적화 (컨텍스트 압축)
3. ✅ 모델 다운그레이드 (단순 작업 → Haiku)
4. ✅ 로컬 모델 활용 (테스트 환경)
5. ✅ 예산 모니터링 자동화

---

**다음 Appendix**: [Appendix B: 성능 최적화 팁](/appendix-b) - 60-70% 토큰 절감을 달성한 실전 최적화 기법

**관련 Chapter**:
- Chapter 10: Hook 기반 자동화
- Chapter 13: Self-Healing AI 시스템
- Chapter 16: 블로그 자동화 시스템 구축

---

*최종 업데이트: 2025-12-19*
*버전: 1.0*
*71개 프로젝트 운영 경험 기반*
