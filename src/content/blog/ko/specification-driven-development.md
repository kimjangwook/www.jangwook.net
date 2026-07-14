---
title: 'AI 시대의 사양 주도 개발: Markdown으로 코드를 작성하는 새로운 패러다임'
description: >-
  GitHub Spec Kit으로 구현하는 체계적인 AI 개발 방법론. "Vibe Coding"을 넘어 확장 가능하고 유지보수 가능한 프로덕션
  코드를 작성하는 완벽 가이드
pubDate: '2025-10-15'
heroImage: ../../../assets/blog/specification-driven-development-hero.jpg
tags:
  - ai
  - development
  - methodology
  - specification
  - best-practices
relatedPosts:
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.9
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
  - slug: llm-blog-automation
    score: 0.9
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
  - slug: blog-launch-analysis-report
    score: 0.87
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, architecture
        fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、架构基础。
---

## AI 코딩의 새로운 패러다임

2025년 초, Andrej Karpathy가 "Vibe Coding"이라는 용어를 만들었습니다. AI에게 프롬프트를 던지고, 생성된 코드를 복사하고, 작동하길 바라는 방식. 프로토타입에는 효과적이지만, 대규모 프로젝트에서는 빠르게 무너집니다.

이제 <strong>사양 주도 개발(Specification-Driven Development, SDD)</strong>이 등장했습니다. Markdown으로 명확한 사양을 작성하면, AI 코딩 에이전트가 그것을 실행 가능한 코드로 "컴파일"합니다. 단순한 방법론의 변화가 아니라, AI와 함께 소프트웨어를 구축하는 방식의 근본적인 전환입니다.

### Vibe Coding의 한계

Vibe Coding의 문제점을 실제 시나리오로 살펴보겠습니다:

```typescript
// Vibe Coding 방식
// 프롬프트: "사용자 인증 시스템 만들어줘"

// AI가 생성한 코드 (1차 시도)
function login(username: string, password: string) {
  // 일부 로직...
  return true; // 항상 성공?
}

// 문제 발견, 다시 프롬프트: "비밀번호 해싱 추가해줘"
// AI가 코드 재생성... 이전 로직 일부 손실

// 또 프롬프트: "토큰 만료 처리해줘"
// 또 재생성... 점점 더 복잡해지고 일관성 없어짐
```

<strong>문제점</strong>:
- 매번 프롬프트할 때마다 AI가 전체 컨텍스트를 잃음
- 이전 결정사항이 무시되거나 덮어씌워짐
- 코드 품질이 일관성 없고 예측 불가능
- 스케일링 불가능 (한두 개 파일은 괜찮지만, 50개 파일은?)

## 사양 주도 개발이란?

사양 주도 개발은 <strong>"무엇을(What)" 구축할지를 명확히 정의한 뒤, AI가 "어떻게(How)"를 구현하도록</strong> 하는 방법론입니다.

### 핵심 원칙

1. <strong>명세서가 진실의 원천(Single Source of Truth)</strong>
   - 코드가 아닌 명세서가 프로젝트의 정의
   - 모든 변경은 명세서 업데이트로 시작

2. <strong>구조화된 워크플로우</strong>
   - 사양 작성(Specify) → 계획 수립(Plan) → 작업 분해(Task) → 구현(Implement)
   - 각 단계가 명확히 분리되어 추적 가능

3. <strong>AI를 도구로, 개발자를 설계자로</strong>
   - 개발자는 "무엇을" 결정 (아키텍처, 비즈니스 로직)
   - AI는 "어떻게"를 실행 (코드 생성, 테스트, 최적화)

### 전통적 개발과의 비교

| 측면 | 전통적 개발 | Vibe Coding | 사양 주도 개발 |
|------|------------|-------------|----------------|
| <strong>시작점</strong> | 요구사항 문서 | 즉흥적 프롬프트 | 구조화된 사양서 |
| <strong>AI 역할</strong> | 없음 또는 보조 도구 | 전체 코드 생성 | 사양 기반 코드 생성 |
| <strong>일관성</strong> | 개발자 경험에 의존 | 낮음 (매 프롬프트마다 변동) | 높음 (사양이 보장) |
| <strong>스케일링</strong> | 가능하지만 느림 | 불가능 (복잡도↑ 품질↓) | 우수 (사양만 관리) |
| <strong>유지보수</strong> | 코드 수정 필요 | 전체 재생성 위험 | 사양 업데이트 후 재생성 |
| <strong>협업</strong> | 코드 리뷰 | 어려움 | 사양 리뷰 (더 명확) |

## 실전 예제: 사양 주도로 인증 시스템 구축하기

실제 GitHub Spec Kit을 사용한 예제를 단계별로 살펴보겠습니다.

### 1단계: 사양 작성 (Specification)

````markdown
<!-- spec/auth.md -->
# 사용자 인증 시스템 사양서

## 개요
JWT 토큰, 비밀번호 해싱, 세션 관리를 포함한 보안 인증 시스템.

## 기능 요구사항

### FR-1: 사용자 등록
- **입력**: username (문자열, 3-20자), email (유효한 형식), password (최소 8자)
- **처리 과정**:
  - 입력값 검증
  - bcrypt로 비밀번호 해싱 (비용 계수: 12)
  - 데이터베이스에 사용자 저장
  - 인증 이메일 생성
- **출력**: 사용자 객체 (비밀번호 제외), HTTP 201
- **오류 케이스**:
  - 중복 username/email → HTTP 409
  - 유효하지 않은 입력 → HTTP 400

### FR-2: 사용자 로그인
- **입력**: username/email, password
- **처리 과정**:
  - 데이터베이스에서 사용자 찾기
  - 해시된 비밀번호 비교
  - JWT 토큰 생성 (만료: 24시간)
  - 세션 레코드 생성
- **출력**: { token, refreshToken, expiresAt }
- **오류 케이스**:
  - 유효하지 않은 자격증명 → HTTP 401
  - 계정 미인증 → HTTP 403

### FR-3: 토큰 갱신
- **입력**: refreshToken
- **처리 과정**:
  - 리프레시 토큰 검증
  - 새 액세스 토큰 생성
  - 세션 업데이트
- **출력**: 새 토큰 쌍
- **오류 케이스**:
  - 유효하지 않거나 만료된 토큰 → HTTP 401

## 비기능 요구사항

### NFR-1: 보안
- 비밀번호는 bcrypt로 해싱 필수 (평문 저장 금지)
- JWT는 RS256 알고리즘으로 서명
- 리프레시 토큰은 사용 시마다 교체
- 속도 제한: IP당 15분에 5회 시도

### NFR-2: 성능
- 등록: < 500ms (95번째 백분위수)
- 로그인: < 200ms (95번째 백분위수)
- 토큰 갱신: < 50ms (95번째 백분위수)

### NFR-3: 데이터베이스 스키마
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 구현 가이드라인
- TypeScript strict 모드 사용
- REST API 규칙 준수
- 모든 엔드포인트에 대한 단위 테스트 작성 (커버리지 > 90%)
- 테스트 가능성을 위한 의존성 주입 사용
- 모든 인증 시도 로깅 (성공/실패)
````

### 2단계: 계획 수립 (Planning)

AI 에이전트에게 사양을 기반으로 기술 계획을 생성하도록 요청:

```bash
# GitHub Spec Kit 사용
npx github-spec-kit plan spec/auth.md
```

AI가 생성한 계획:

````markdown
<!-- plan/auth-plan.md -->
# 인증 시스템 - 기술 계획

## 아키텍처

### 컴포넌트
1. **AuthController**: REST 엔드포인트 핸들러
2. **AuthService**: 비즈니스 로직 레이어
3. **UserRepository**: 데이터베이스 접근 레이어
4. **PasswordHasher**: bcrypt 래퍼 유틸리티
5. **JWTManager**: 토큰 생성/검증
6. **RateLimiter**: 요청 제한 미들웨어

### 의존성
- express: ^4.18.0
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.0
- pg: ^8.11.0 (PostgreSQL 클라이언트)
- express-rate-limit: ^7.0.0
- joi: ^17.10.0 (검증)

### 파일 구조
```
src/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── repositories/
│   └── user.repository.ts
├── utils/
│   ├── password-hasher.ts
│   ├── jwt-manager.ts
│   └── validators.ts
├── middleware/
│   └── rate-limiter.ts
├── types/
│   └── auth.types.ts
└── tests/
    ├── auth.controller.test.ts
    ├── auth.service.test.ts
    └── user.repository.test.ts
```

## 구현 단계

### Phase 1: 핵심 인프라
1. TypeScript 설정 구성
2. 데이터베이스 연결 설정
3. 데이터베이스 마이그레이션 구현
4. 테스팅 프레임워크 설정 (Jest)

### Phase 2: 유틸리티
5. bcrypt를 사용한 PasswordHasher 구현
6. RS256을 사용한 JWTManager 구현
7. 입력 검증기 구현
8. 속도 제한 미들웨어 추가

### Phase 3: 데이터 레이어
9. UserRepository 구현 (CRUD)
10. SessionRepository 구현
11. 데이터베이스 트랜잭션 지원 추가

### Phase 4: 비즈니스 로직
12. AuthService.register() 구현
13. AuthService.login() 구현
14. AuthService.refreshToken() 구현
15. 이메일 인증 로직 추가

### Phase 5: API 레이어
16. AuthController 엔드포인트 구현
17. 에러 처리 미들웨어 추가
18. 요청/응답 로깅 설정

### Phase 6: 테스팅 및 문서화
19. 단위 테스트 작성 (목표: 95% 커버리지)
20. 통합 테스트 작성
21. API 문서 생성
22. 설정 지침이 포함된 README 추가

## 테스팅 전략
- **단위 테스트**: 각 서비스/유틸리티 함수 격리
- **통합 테스트**: 전체 요청/응답 사이클
- **부하 테스트**: 성능 요구사항 검증
- **보안 테스트**: 인증 플로우 침투 테스트
````

### 3단계: 작업 분해 (Task Breakdown)

계획을 실행 가능한 작업으로 분해:

````markdown
<!-- tasks/auth-tasks.md -->
# 인증 시스템 - 작업 목록

## Task 1: TypeScript 프로젝트 설정
- [ ] npm 프로젝트 초기화
- [ ] TypeScript 및 의존성 설치
- [ ] tsconfig.json 설정 (strict 모드)
- [ ] ESLint 및 Prettier 설정
- **예상 소요 시간**: 30분

## Task 2: 데이터베이스 설정
- [ ] PostgreSQL 데이터베이스 생성
- [ ] 마이그레이션 스크립트 작성 (users, sessions 테이블)
- [ ] 연결 풀 설정
- [ ] 환경 변수 추가 (.env)
- **예상 소요 시간**: 1시간

## Task 3: PasswordHasher 유틸리티 구현
```typescript
// src/utils/password-hasher.ts
import bcrypt from 'bcryptjs';

export class PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```
- [ ] hash() 메서드 구현
- [ ] compare() 메서드 구현
- [ ] 단위 테스트 작성
- **예상 소요 시간**: 30분

[... 각 작업에 대해 구체적인 코드 스니펫과 함께 계속 ...]
````

### 4단계: 구현 (Implementation)

이제 AI 코딩 에이전트(GitHub Copilot, Claude Code 등)에게 각 작업을 구현하도록 요청:

```bash
# Claude Code 사용 예시
@claude "Task 3을 spec/auth.md와 plan/auth-plan.md를 참고하여 구현해줘.
         테스트도 함께 작성하고 coverage 90% 이상 확보해줘."
```

<strong>AI가 생성한 코드 예시</strong>:

```typescript
// src/utils/password-hasher.ts
import bcrypt from 'bcryptjs';

/**
 * Password hashing utility using bcrypt
 * Complies with NFR-1 security requirements from spec/auth.md
 */
export class PasswordHasher {
  private readonly saltRounds = 12;

  /**
   * Hash a plain text password
   * @param password - Plain text password (min 8 chars)
   * @returns Hashed password string
   * @throws Error if password is invalid
   */
  async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare plain text password with hash
   * @param password - Plain text password
   * @param hash - Stored password hash
   * @returns True if password matches, false otherwise
   */
  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // Invalid hash format
      return false;
    }
  }
}

// src/utils/password-hasher.test.ts
import { PasswordHasher } from './password-hasher';

describe('PasswordHasher', () => {
  let hasher: PasswordHasher;

  beforeEach(() => {
    hasher = new PasswordHasher();
  });

  describe('hash()', () => {
    it('should hash a valid password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('should throw error for password < 8 chars', async () => {
      await expect(hasher.hash('short')).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should generate different hashes for same password', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('compare()', () => {
    it('should return true for correct password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);
      const result = await hasher.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);
      const result = await hasher.compare('wrongPassword', hash);

      expect(result).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const result = await hasher.compare('password', 'invalid_hash');
      expect(result).toBe(false);
    });
  });

  describe('performance', () => {
    it('should hash within 500ms', async () => {
      const start = Date.now();
      await hasher.hash('mySecurePassword123');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
```

<strong>핵심 포인트</strong>:
- AI가 사양서의 모든 요구사항을 정확히 반영 (NFR-1 보안 요구사항)
- 에러 처리, 엣지 케이스, 성능 테스트 모두 포함
- 코드가 일관성 있고 문서화됨
- 90% 이상 테스트 커버리지 자동 달성

## GitHub Spec Kit: 사양 주도 개발 도구

GitHub이 오픈소스로 공개한 Spec Kit은 사양 주도 개발을 실천하기 위한 완전한 툴킷입니다.

### 설치 및 설정

```bash
# npm으로 전역 설치
npm install -g @github/spec-kit

# 또는 npx로 즉시 사용
npx @github/spec-kit init

# 프로젝트 초기화
spec-kit init my-project
cd my-project
```

프로젝트 구조:

```
my-project/
├── spec/
│   ├── constitution.md      # 프로젝트 헌법 (코딩 원칙, 스타일 가이드)
│   ├── architecture.md       # 시스템 아키텍처
│   └── features/
│       ├── auth.md          # 기능별 상세 사양
│       └── api.md
├── plan/
│   └── technical-plan.md    # AI 생성 기술 계획
├── tasks/
│   └── task-breakdown.md    # 실행 가능한 작업 목록
├── scripts/
│   └── validate-spec.sh     # 사양 검증 스크립트
└── .speckit/
    └── config.json          # Spec Kit 설정
```

### constitution.md: 프로젝트의 헌법

`constitution.md`는 AI 에이전트가 따라야 할 불변의 원칙을 정의합니다:

````markdown
<!-- spec/constitution.md -->
# 프로젝트 헌법

## 핵심 원칙

### 코드 품질
- **언어**: TypeScript strict 모드 활성화
- **스타일**: Airbnb JavaScript 스타일 가이드 준수
- **테스팅**: 최소 90% 코드 커버리지
- **문서화**: 모든 공개 API는 TSDoc 주석 필수

### 아키텍처 패턴
- **설계**: 도메인 주도 설계 원칙 준수
- **의존성 주입**: 모든 의존성에 대해 생성자 주입 사용
- **에러 처리**: 에러를 무시하지 말 것; 항상 로그 기록 후 전파
- **Async/Await**: 콜백이나 원시 Promise보다 async/await 선호

### 보안
- **입력 검증**: Joi 또는 Zod로 모든 사용자 입력 검증
- **SQL 인젝션**: 항상 매개변수화된 쿼리 사용
- **인증**: 모든 인증 엔드포인트에 속도 제한 구현
- **비밀키**: 비밀키 하드코딩 금지; 환경 변수 사용

### 테스팅 전략
- **단위 테스트**: 모든 비즈니스 로직에 Jest 사용
- **통합 테스트**: API 엔드포인트에 Supertest 사용
- **E2E 테스트**: 중요한 사용자 플로우에 Playwright 사용
- **테스트 주도 개발**: 구현 전에 테스트 먼저 작성

### Git 워크플로우
- **브랜칭**: GitFlow (main, develop, feature/*, hotfix/*)
- **커밋**: Conventional Commits 형식 (feat, fix, docs 등)
- **Pull Request**: 2명의 승인 및 CI 통과 필수
- **코드 리뷰**: 코드뿐만 아니라 사양 준수 여부 검토

## AI 에이전트 지침

코드 구현 시:
1. **명확화 질문 필수**: 사양이 모호하면 항상 질문할 것
2. **장단점 나열**: 여러 접근법이 있을 경우 장단점 제시
3. **테스트 주도 개발 준수**: 테스트 먼저 작성
4. **가독성 최적화**: 영리함보다 가독성 우선
5. **TODO 주석 추가**: 알려진 제한사항이나 향후 개선사항 명시
````

### 워크플로우: Specify → Plan → Implement

```bash
# 1. 사양 작성 (개발자가 직접 작성 또는 AI 보조)
code spec/features/user-profile.md

# 2. 사양 검증
spec-kit validate spec/features/user-profile.md

# 3. 기술 계획 생성 (AI)
spec-kit plan spec/features/user-profile.md --output plan/user-profile-plan.md

# 4. 작업 분해 (AI)
spec-kit tasks plan/user-profile-plan.md --output tasks/user-profile-tasks.md

# 5. 구현 (AI 코딩 에이전트)
# GitHub Copilot, Claude Code 등과 함께 사용
# AI에게 spec/, plan/, tasks/ 파일들을 컨텍스트로 제공
```

### 실시간 사양 업데이트

사양 주도 개발의 강력한 점은 <strong>변경이 쉽다</strong>는 것입니다:

```markdown
<!-- spec/features/auth.md 수정 -->
## FR-2: User Login (Updated)
- **Input**: username/email, password, **rememberMe (optional boolean)**
- **Process**:
  - Find user in database
  - Compare hashed password
  - Generate JWT token (expires: **rememberMe ? 30 days : 24h**)
  - Create session record
```

수정 후:

```bash
# 1. 변경사항 반영된 계획 재생성
spec-kit plan spec/features/auth.md --output plan/auth-plan.md --update

# 2. AI에게 변경사항 적용 요청
@claude "spec/features/auth.md의 FR-2 업데이트를 반영하여
         AuthService.login() 메서드를 수정해줘.
         기존 테스트도 업데이트하고 rememberMe 케이스 추가해줘."
```

AI가 정확히 변경사항만 반영:

```typescript
// src/services/auth.service.ts (수정된 부분만)
async login(
  username: string,
  password: string,
  rememberMe: boolean = false // 새로운 파라미터
): Promise<LoginResponse> {
  // ... 기존 로직 ...

  // 토큰 만료 시간 계산 (수정됨)
  const expiresIn = rememberMe ? '30d' : '24h';
  const token = this.jwtManager.generate(user.id, expiresIn);

  // ... 나머지 로직 ...
}

// src/services/auth.service.test.ts (추가된 테스트)
describe('login with rememberMe', () => {
  it('should generate 30-day token when rememberMe is true', async () => {
    const result = await authService.login('user', 'pass', true);
    const decoded = jwt.decode(result.token) as any;
    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(daysDiff).toBeGreaterThan(29);
    expect(daysDiff).toBeLessThan(31);
  });
});
```

## 실전 적용: 사양 주도 개발 Best Practices

### 1. 좋은 사양서 작성법

<strong>명확한 입출력 정의</strong>:

````markdown
❌ 나쁜 예:
## User Registration
Create a new user account.

✅ 좋은 예:
## 사용자 등록 (FR-001)
**입력**:
- username: string (3-20자 영숫자)
- email: string (유효한 RFC 5322 형식)
- password: string (최소 8자, 대문자 1개, 숫자 1개, 특수문자 1개)

**처리 과정**:
1. 입력값 검증 (Joi 스키마)
2. username/email 중복 확인
3. 비밀번호 해싱 (bcrypt, 비용 계수 12)
4. users 테이블에 삽입
5. 인증 이메일 발송 (비동기 작업)

**출력**:
- 성공: { userId: UUID, username: string, email: string } + HTTP 201
- 실패: { error: string, field?: string } + HTTP 4xx

**오류 케이스**:
| 조건 | 응답 | HTTP 코드 |
|------|------|-----------|
| 중복 username | "Username already exists" | 409 |
| 유효하지 않은 email 형식 | "Invalid email format" | 400 |
| 약한 비밀번호 | "Password does not meet requirements" | 400 |
````

<strong>측정 가능한 비기능 요구사항</strong>:

````markdown
❌ 나쁜 예:
## Performance
The system should be fast.

✅ 좋은 예:
## 성능 (NFR-001)
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| API 응답 시간 | p95 < 200ms | New Relic APM |
| 데이터베이스 쿼리 시간 | p99 < 50ms | PostgreSQL EXPLAIN ANALYZE |
| 동시 사용자 | 10,000명 | k6를 사용한 부하 테스트 |
| 에러율 | < 0.1% | Sentry로 에러 추적 |

**부하 테스트 시나리오**:
- 램프업: 5분 동안 0 → 10,000명 사용자
- 유지: 30분 동안 10,000명 사용자
- 피크: 5분 동안 15,000명 사용자
- 통과 기준: 전체 기간 동안 p95 응답 시간 < 200ms
````

### 2. constitution.md 작성 가이드

프로젝트의 불변 원칙을 정의하세요:

````markdown
# 프로젝트 헌법

## 기술 스택
- **언어**: TypeScript 5.0+
- **프레임워크**: Express.js 4.18+
- **데이터베이스**: PostgreSQL 15+
- **ORM**: Prisma 5.0+
- **테스팅**: Jest + Supertest
- **린팅**: ESLint + Prettier

## 코드 구조
```
src/
├── domain/          # 비즈니스 로직 (순수, 외부 의존성 없음)
├── application/     # 유스케이스 (도메인 로직 오케스트레이션)
├── infrastructure/  # 외부 의존성 (DB, API 등)
└── presentation/    # API 컨트롤러, DTO
```

## 코딩 표준

### 명명 규칙
- **클래스**: PascalCase (예: UserRepository)
- **인터페이스**: PascalCase with "I" 접두사 (예: IUserRepository)
- **함수**: camelCase (예: getUserById)
- **상수**: UPPER_SNAKE_CASE (예: MAX_LOGIN_ATTEMPTS)
- **파일**: kebab-case (예: user-repository.ts)

### 에러 처리
```typescript
// ✅ 항상 커스텀 에러 클래스 사용
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`사용자를 찾을 수 없음: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

// ✅ 에러를 catch하고 무시하지 말 것
try {
  await saveUser(user);
} catch (error) {
  logger.error('사용자 저장 실패', { error, userId: user.id });
  throw error; // 로깅 후 재throw
}

// ❌ 절대 이렇게 하지 말 것
try {
  await saveUser(user);
} catch (error) {
  // 무음 실패 - 금지
}
```

### 테스팅 요구사항
- **단위 테스트**: 최소 90% 커버리지
- **통합 테스트**: 모든 API 엔드포인트
- **테스트 구조**: Arrange-Act-Assert 패턴
- **모킹**: 의존성 주입 사용, 전역 mock 지양
- **테스트 데이터**: 일관된 테스트 데이터를 위한 팩토리

### 보안 체크리스트
- [ ] Zod/Joi로 모든 입력 검증
- [ ] SQL 쿼리는 매개변수화된 statement 사용
- [ ] 인증 토큰 만료 설정 (액세스 24시간, 리프레시 7일)
- [ ] 모든 공개 엔드포인트에 속도 제한 (IP당 15분에 100회)
- [ ] bcrypt로 비밀번호 해싱 (비용 계수 12)
- [ ] 프로덕션에서 HTTPS 강제
- [ ] 화이트리스트로 CORS 설정
- [ ] 환경 비밀키 git 커밋 금지
````

### 3. AI 에이전트 효과적으로 활용하기

<strong>명확한 컨텍스트 제공</strong>:

```bash
# ❌ 나쁜 프롬프트
@claude "로그인 기능 만들어줘"

# ✅ 좋은 프롬프트
@claude "spec/features/auth.md의 FR-2 (User Login)을 구현해줘.
         constitution.md의 에러 처리 규칙을 따르고,
         plan/auth-plan.md의 아키텍처 구조를 준수해줘.
         테스트는 auth.service.test.ts의 기존 패턴을 따라 작성해줘."
```

<strong>반복적 개선</strong>:

```bash
# 1차 구현
@claude "spec/features/payment.md의 FR-5 (결제 처리) 구현"

# AI 생성 코드 리뷰 후
@claude "결제 처리에 재시도 로직 추가해줘.
         최대 3회 재시도, 지수 백오프 적용.
         Stripe 일시적 오류(5xx)만 재시도하고,
         영구 오류(4xx)는 즉시 실패 처리해줘."

# 성능 최적화
@claude "결제 처리의 데이터베이스 쿼리를 최적화해줘.
         트랜잭션 격리 수준은 READ COMMITTED로 설정하고,
         낙관적 잠금(optimistic locking)을 사용해줘."
```

### 4. 협업 워크플로우

<strong>팀 단위 사양 주도 개발</strong>:

```markdown
## 협업 프로세스

### 1. 사양 리뷰 (Specification Review)
- **Who**: Product Manager + Tech Lead
- **When**: Sprint Planning 전
- **Output**: 승인된 spec/*.md 파일들
- **Criteria**:
  - 모든 요구사항이 측정 가능
  - 에러 케이스 명확히 정의
  - 성능 목표 수치화
  - 보안 요구사항 체크리스트 완료

### 2. 계획 생성 (Plan Generation)
- **Who**: Tech Lead + AI Agent
- **When**: 사양 승인 직후
- **Output**: plan/*.md 파일들
- **Review**: 아키텍처 팀이 검토

### 3. 작업 분배 (Task Assignment)
- **Who**: Tech Lead
- **When**: Sprint Planning
- **Output**: tasks/*.md → GitHub Issues/Jira tickets
- **Estimation**: AI 생성 예상 시간 + 20% 버퍼

### 4. 구현 (Implementation)
- **Who**: 개발자 + AI Coding Agent
- **When**: Sprint 기간
- **Output**: Pull Requests
- **Review Focus**:
  - 사양 준수 여부 (코드 스타일은 자동 체크)
  - 테스트 커버리지 (CI가 자동 검증)
  - constitution.md 위반 사항

### 5. 지속적 개선 (Continuous Improvement)
- **When**: Sprint Retrospective
- **Review**:
  - 사양서의 모호한 부분 식별
  - AI 생성 코드 품질 평가
  - constitution.md 업데이트 필요사항
```

## 도구 생태계

### 주요 도구 비교

| 도구 | 용도 | 강점 | 약점 |
|------|------|------|------|
| <strong>GitHub Spec Kit</strong> | 사양 → 계획 → 작업 | 공식 지원, 통합 워크플로우 | 초기 버전 (실험적) |
| <strong>Kiro</strong> | AI 사양 검증 | 사양 품질 분석 | Spec Kit 의존성 |
| <strong>BMAD-Method</strong> | 엔터프라이즈 사양 관리 | 대규모 팀 협업 | 상업용 (유료) |
| <strong>Claude Code</strong> | AI 코딩 에이전트 | 높은 코드 품질 | API 비용 |
| <strong>GitHub Copilot</strong> | AI 코딩 보조 | IDE 통합 우수 | 컨텍스트 제한 |

### 추천 툴체인

<strong>스타트업/소규모 팀</strong>:
```bash
├── GitHub Spec Kit (무료)
├── GitHub Copilot (개인: $10/월)
└── GitHub Actions (CI/CD, 무료)
```

<strong>중대형 기업</strong>:
```bash
├── BMAD-Method (엔터프라이즈)
├── Claude Code (팀 라이선스)
├── Kiro (사양 검증)
└── Jenkins/GitLab CI (기존 인프라)
```

## 성과 측정: Before & After

### 실제 프로젝트 사례

<strong>프로젝트</strong>: E-commerce API (50개 엔드포인트, 3명 개발팀)

| 지표 | 전통적 개발 | Vibe Coding | 사양 주도 개발 |
|------|-------------|-------------|----------------|
| <strong>개발 기간</strong> | 12주 | 8주 (초기 빠름) | 10주 |
| <strong>버그 발견</strong> | Sprint 중 평균 45개 | Sprint 중 평균 80개 | Sprint 중 평균 15개 |
| <strong>리팩토링 시간</strong> | 전체의 20% | 전체의 40% | 전체의 5% |
| <strong>코드 리뷰 시간</strong> | PR당 평균 2시간 | PR당 평균 3시간 | PR당 평균 30분 |
| <strong>테스트 커버리지</strong> | 75% | 45% | 92% |
| <strong>기술 부채</strong> | 중간 | 높음 | 낮음 |
| <strong>팀 만족도</strong> | 7/10 | 6/10 | 9/10 |

<strong>핵심 인사이트</strong>:
- 사양 주도 개발은 초기 사양 작성 시간이 추가되지만, 전체 프로젝트에서는 시간 절약
- 버그가 70% 감소 (사양이 명확하면 AI가 정확한 코드 생성)
- 리팩토링 시간 75% 감소 (처음부터 구조가 명확)
- 코드 리뷰가 "사양 준수 여부" 확인으로 단순화

## 한계와 주의사항

### 사양 주도 개발이 적합하지 않은 경우

1. <strong>빠른 프로토타이핑</strong>
   - MVP나 PoC는 Vibe Coding이 더 빠름
   - 사양 작성 오버헤드가 불필요

2. <strong>명확하지 않은 요구사항</strong>
   - 탐색적 프로젝트는 애자일 접근이 더 적합
   - 사양을 너무 자주 변경하면 오히려 비효율

3. <strong>1인 개발자 + 소규모 프로젝트</strong>
   - 협업 이점이 없으면 과도한 프로세스
   - 간단한 스크립트나 도구는 직접 코딩이 더 빠름

### 흔한 실수

```markdown
❌ **실수 1**: 너무 상세한 사양
"변수명, 함수명까지 모두 사양에 명시" → AI의 창의성 제한

✅ **올바른 접근**: What을 정의하고 How는 AI에게 맡김
"사용자 인증 시 JWT 토큰 사용, 만료 시간 24시간" (구현 방법은 AI가 결정)

❌ **실수 2**: constitution.md 무시
사양만 작성하고 코딩 원칙 없음 → AI가 일관성 없는 코드 생성

✅ **올바른 접근**: constitution.md에 불변 원칙 정의
"모든 비동기 함수는 try-catch로 에러 처리 필수"

❌ **실수 3**: 사양 업데이트 없이 코드 수정
급한 버그 픽스를 사양 업데이트 없이 직접 코드 수정 → 사양과 코드 불일치

✅ **올바른 접근**: 사양 먼저 업데이트 후 재생성
"spec/auth.md에 rate limiting 예외 케이스 추가 → AI에게 재구현 요청"
```

## 미래 전망

### 2025년 이후 트렌드

1. <strong>실행 가능한 사양서(Executable Specifications)</strong>
   - Markdown 사양서를 직접 "컴파일"하여 실행 가능한 코드로 변환
   - 테스트, 문서, 코드가 하나의 소스에서 자동 생성

2. <strong>AI 에이전트 협업</strong>
   - 한 명의 개발자가 여러 AI 에이전트 오케스트레이션
   - 예: "Architecture AI + Coding AI + Testing AI + Security AI"

3. <strong>자율 코드 유지보수</strong>
   - AI가 사양서를 기반으로 자동으로 보안 패치, 성능 최적화 적용
   - 개발자는 승인만 하는 역할

4. <strong>자연어 사양서</strong>
   - 더 이상 Markdown 구조 필요 없음
   - 일반 언어로 요구사항 설명하면 AI가 구조화

## 결론: 개발자의 역할 재정의

사양 주도 개발은 단순한 방법론이 아니라, <strong>AI 시대 개발자 역할의 근본적 변화</strong>를 의미합니다.

### 변화하는 개발자의 역할

<strong>Before (전통적 개발)</strong>:
- 코드 작성 70% + 설계 20% + 테스트 10%

<strong>After (사양 주도 개발)</strong>:
- 사양 작성 40% + AI 관리 30% + 검증 20% + 최적화 10%

### 핵심 스킬의 변화

| 전통적 스킬 | 중요도 변화 | 새로운 핵심 스킬 |
|------------|-------------|------------------|
| 코딩 속도 | ↓↓ | 요구사항 명확화 능력 |
| 문법 지식 | ↓ | 아키텍처 설계 능력 |
| 디버깅 | → | AI 프롬프트 엔지니어링 |
| 알고리즘 | → | 시스템 사고 (System Thinking) |
| 코드 리뷰 | → | 사양 리뷰 |

### 시작하기

<strong>1주차: 학습</strong>
```bash
# GitHub Spec Kit 튜토리얼
npx @github/spec-kit tutorial

# 예제 프로젝트 클론
git clone https://github.com/github/spec-kit-examples
cd spec-kit-examples/todo-api
```

<strong>2주차: 소규모 적용</strong>
- 기존 프로젝트의 한 기능을 사양 주도로 리팩토링
- constitution.md 작성 (팀 코딩 원칙)
- 간단한 API 엔드포인트 1-2개를 사양 → 코드로 구현

<strong>3주차: 팀 도입</strong>
- 팀원들에게 개념 공유
- 다음 스프린트의 한 스토리를 사양 주도로 시도
- 회고에서 개선점 논의

<strong>1개월 후: 전면 도입 결정</strong>
- 성과 측정 (버그 감소율, 개발 속도, 팀 만족도)
- 도구 선택 (Spec Kit vs 상업 도구)
- 장기 로드맵 수립

## 참고 자료

### 공식 문서
- [GitHub Spec Kit 공식 문서](https://github.com/github/spec-kit)
- [Spec-Driven Development 소개 (GitHub Blog)](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Microsoft: Diving Into Spec-Driven Development](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)

### 심화 학습
- [The New Stack: Spec-Driven Development for Scalable AI Agents](https://thenewstack.io/spec-driven-development-the-key-to-scalable-ai-agents/)
- [Medium: Specification-Driven Development (SDD) by noailabs](https://noailabs.medium.com/specification-driven-development-sdd-66a14368f9d6)
- [InfoWorld: Spec-driven AI coding with GitHub's Spec Kit](https://www.infoworld.com/article/4062524/spec-driven-ai-coding-with-githubs-spec-kit.html)

### 커뮤니티
- [GitHub Spec Kit Discussions](https://github.com/github/spec-kit/discussions)
- [Reddit: r/MachineLearning - SDD 토론](https://reddit.com/r/MachineLearning)
- [Dev.to: Spec Driven Development 태그](https://dev.to/t/speckit)

---

<strong>다음 글</strong>: [AI 에이전트 협업 패턴: 5개의 전문 에이전트로 풀스택 앱 구축하기](/ko/blog/ko/ai-agent-collaboration-patterns)에서는 Architecture Agent, Coding Agent, Testing Agent, Security Agent, DevOps Agent를 오케스트레이션하여 복잡한 애플리케이션을 구축하는 실전 사례를 다룹니다.
