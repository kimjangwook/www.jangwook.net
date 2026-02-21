# Sandbox Configuration Guide

AI 생성 코드를 안전하게 실행하기 위한 샌드박스 설정 가이드입니다.

## Implementation Status

**Current Status**: 🟡 Partially Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| File path restrictions | ✅ Active | Via settings.local.json (allow list) |
| Command allowlist | ✅ Active | npm run commands, node, cat, shasum, awk allowed |
| Network restrictions | ⚠️ Planned | Not yet implemented (relies on MCP server controls) |
| Resource limits | ⚠️ Planned | Not yet implemented (OS-level controls needed) |
| Process isolation | ⚠️ Theoretical | Documented but not enforced |

**Implementation Details**:
- `.claude/settings.local.json` provides basic command and file path filtering
- MCP servers (Brave Search, GA4, Gemini) handle their own network access
- No explicit memory/CPU limits enforced (relies on system defaults)
- Sandbox runtime configuration is **reference architecture only** (not active)

---

## 개요

MCP Code Execution에서는 AI가 생성한 코드가 직접 실행됩니다. 보안을 위해 격리된 샌드박스 환경에서 실행하는 것이 필수입니다.

## 핵심 보안 계층

### 1. 프로세스 격리

```typescript
const sandbox = createSandbox({
  runtime: 'node',
  isolation: 'bubblewrap',  // Linux
  // isolation: 'seatbelt',  // macOS
});
```

### 2. 파일시스템 제한

```typescript
filesystem: {
  readOnly: [
    '/tools',           // 도구 정의
    '/node_modules'     // 의존성
  ],
  readWrite: [
    '/tmp',             // 임시 파일
    '/workspace'        // 작업 공간
  ],
  deny: [
    '~',                // 홈 디렉토리
    '/etc',             // 시스템 설정
    '/.env'             // 환경 변수
  ]
}
```

### 3. 네트워크 제어

```typescript
network: {
  allowedHosts: [
    'api.anthropic.com',
    'mcp.company.com'
  ],
  allowedPorts: [443, 80],
  denyOutbound: false,
  denyInbound: true
}
```

### 4. 리소스 제한

```typescript
resources: {
  timeout: 30000,        // 30초 최대 실행
  memory: '512MB',       // 메모리 제한
  cpu: 1,                // CPU 코어
  maxFiles: 100,         // 열 수 있는 파일 수
  maxProcesses: 10       // 서브프로세스 수
}
```

## 이 프로젝트에서의 적용

### 블로그 자동화 샌드박스

```typescript
const blogSandbox = createSandbox({
  runtime: 'node',
  timeout: 60000,  // 1분 (이미지 생성 포함)
  memory: '1GB',

  filesystem: {
    readOnly: [
      '.claude/tools',
      '.claude/skills',
      'src/content/blog',
      'src/assets/blog'
    ],
    readWrite: [
      '/tmp',
      'src/content/blog',      // 포스트 작성
      'src/assets/blog',       // 이미지 저장
      'post-metadata.json',
      'recommendations.json'
    ]
  },

  network: {
    allowedHosts: [
      'api.brave.com',         // Brave Search
      'generativelanguage.googleapis.com',  // Gemini API
      'analyticsdata.googleapis.com'        // GA4
    ]
  },

  env: {
    NODE_ENV: 'production',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
  }
});
```

### Analytics 샌드박스

```typescript
const analyticsSandbox = createSandbox({
  runtime: 'node',
  timeout: 30000,
  memory: '256MB',

  filesystem: {
    readOnly: ['src/content/blog'],
    readWrite: ['/tmp', 'post-metadata.json']
  },

  network: {
    allowedHosts: ['analyticsdata.googleapis.com']
  }
});
```

## 보안 체크리스트

### 필수 사항

- [ ] 프로세스 격리 활성화
- [ ] 파일시스템 화이트리스트
- [ ] 네트워크 화이트리스트
- [ ] 리소스 제한 설정
- [ ] 환경 변수 최소화
- [ ] 감사 로깅 활성화

### 권장 사항

- [ ] Rate Limiting
- [ ] 입력 검증 (별도 문서 참조)
- [ ] 결과 크기 제한
- [ ] 에러 스택 트레이스 제거

## 예시 설정 파일

### sandbox.config.ts

```typescript
import { SandboxConfig } from '@anthropic/sandbox-runtime';

export const defaultConfig: SandboxConfig = {
  runtime: 'node',
  version: '20',

  timeout: 30000,
  memory: '512MB',

  filesystem: {
    readOnly: ['.claude/tools', 'node_modules'],
    readWrite: ['/tmp'],
    deny: ['~', '/.env', '/.git']
  },

  network: {
    allowedHosts: [],
    denyOutbound: true
  },

  security: {
    disableEval: true,
    disableNewFunction: true,
    disableChildProcess: true
  },

  logging: {
    level: 'info',
    includeTimestamp: true,
    redactSecrets: true
  }
};

// 용도별 설정 확장
export const blogConfig = {
  ...defaultConfig,
  timeout: 60000,
  memory: '1GB',
  filesystem: {
    ...defaultConfig.filesystem,
    readWrite: [...defaultConfig.filesystem.readWrite, 'src/content/blog']
  }
};
```

## 모니터링 및 감사

### 로그 형식

```json
{
  "timestamp": "2025-11-18T10:30:00Z",
  "sandboxId": "blog-001",
  "action": "tool_call",
  "tool": "database.query",
  "params": { "sql": "[REDACTED]" },
  "duration": 150,
  "status": "success",
  "tokensUsed": 500
}
```

### 알림 조건

1. 실행 시간 > 임계값의 80%
2. 메모리 사용 > 임계값의 80%
3. 거부된 파일 접근 시도
4. 거부된 네트워크 연결 시도

## 주의사항

### 일반적인 실수

1. **너무 넓은 파일 권한**
   ```typescript
   // 나쁜 예
   readWrite: ['/**']

   // 좋은 예
   readWrite: ['src/content/blog/ko', 'src/content/blog/en']
   ```

2. **환경 변수 노출**
   ```typescript
   // 나쁜 예
   env: process.env

   // 좋은 예
   env: {
     GEMINI_API_KEY: process.env.GEMINI_API_KEY
     // 필요한 것만
   }
   ```

3. **불충분한 타임아웃**
   ```typescript
   // 나쁜 예: 외부 API 호출에 5초
   timeout: 5000

   // 좋은 예: 충분한 여유
   timeout: 30000
   ```

## 참고 자료

- [security/input-validation.md](input-validation.md) - 입력 검증
- [patterns/code-execution.md](../patterns/code-execution.md) - Code Execution 패턴
- [Anthropic Security Best Practices](https://www.anthropic.com/security/code-execution)

---

**마지막 업데이트**: 2025-11-18
**버전**: 1.0
