# Chapter 2: 환경 설정

Claude Code를 효과적으로 활용하기 위해서는 적절한 개발 환경 구축이 필수적입니다. 이 장에서는 설치부터 초기 설정, 그리고 생산성을 극대화하는 권장 구성까지 단계별로 살펴봅니다.

---

## Recipe 2.1: 설치 및 인증

### 문제 (Problem)

Claude Code를 처음 사용하려는 개발자가 올바르게 설치하고 API 인증을 완료해야 합니다. 잘못된 설치나 인증 오류는 이후 모든 작업에 영향을 미치므로, 첫 단계부터 정확하게 진행해야 합니다.

### 해결책 (Solution)

Claude Code 설치는 크게 세 단계로 진행됩니다:

1. **시스템 요구사항 확인**
2. **CLI 도구 설치**
3. **API 키 인증**

#### 1단계: 시스템 요구사항 확인

Claude Code를 실행하기 위한 최소 요구사항:

- **운영체제**: macOS, Linux, Windows (WSL2 권장)
- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **디스크 공간**: 500MB 이상 (캐시 및 모델 데이터 포함)
- **네트워크**: 안정적인 인터넷 연결 (API 호출)

Node.js 버전 확인:

```bash
node --version
# v18.0.0 이상이어야 함

npm --version
# v9.0.0 이상이어야 함
```

만약 버전이 낮다면, [nodejs.org](https://nodejs.org)에서 LTS 버전을 다운로드하여 설치하세요.

#### 2단계: Claude Code CLI 설치

npm을 통해 전역으로 설치합니다:

```bash
# 전역 설치
npm install -g @anthropic-ai/claude-code

# 설치 확인
claude --version
# 출력: claude-code/1.x.x
```

설치가 완료되면 `claude` 명령어를 터미널 어디서든 사용할 수 있습니다.

**설치 문제 해결**:

```bash
# 권한 오류 발생 시 (macOS/Linux)
sudo npm install -g @anthropic-ai/claude-code

# npm 캐시 정리 후 재시도
npm cache clean --force
npm install -g @anthropic-ai/claude-code
```

#### 3단계: API 키 인증

Anthropic API 키를 발급받고 환경 변수로 설정합니다.

**API 키 발급**:

1. [console.anthropic.com](https://console.anthropic.com)에 접속
2. 계정 생성 또는 로그인
3. 'API Keys' 메뉴로 이동
4. 'Create Key' 버튼 클릭
5. 키 이름 입력 (예: "claude-code-dev")
6. 생성된 키 복사 (한 번만 표시되므로 안전하게 보관)

**환경 변수 설정**:

macOS/Linux의 경우 `.bashrc`, `.zshrc`, 또는 `.bash_profile`에 추가:

```bash
# ~/.zshrc 또는 ~/.bashrc
export ANTHROPIC_API_KEY='sk-ant-api03-...'
```

변경사항 적용:

```bash
source ~/.zshrc  # 또는 ~/.bashrc
```

Windows (PowerShell)의 경우:

```powershell
# 시스템 환경 변수로 설정
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-api03-...', 'User')
```

**인증 확인**:

```bash
# 간단한 명령어로 인증 테스트
claude auth check

# 출력 예시:
# ✓ API key is valid
# ✓ Connected to Anthropic API
# Model: claude-sonnet-4-5-20250929
```

### 코드/예시 (Code)

전체 설치 과정을 하나의 스크립트로 자동화할 수 있습니다:

```bash
#!/bin/bash
# install-claude-code.sh

echo "Claude Code 설치 스크립트"
echo "======================================"

# 1. Node.js 버전 확인
echo "\n[1/4] Node.js 버전 확인..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18 이상이 필요합니다. 현재: v$(node --version)"
    echo "https://nodejs.org 에서 최신 LTS 버전을 설치하세요."
    exit 1
fi
echo "✓ Node.js $(node --version)"

# 2. Claude Code 설치
echo "\n[2/4] Claude Code 설치 중..."
npm install -g @anthropic-ai/claude-code
if [ $? -ne 0 ]; then
    echo "❌ 설치 실패. sudo 권한이 필요할 수 있습니다."
    exit 1
fi
echo "✓ Claude Code $(claude --version)"

# 3. API 키 입력
echo "\n[3/4] API 키 설정..."
echo "Anthropic API 키를 입력하세요:"
read -s API_KEY

# 4. 환경 변수 설정 (zsh 기준)
echo "\n[4/4] 환경 변수 설정 중..."
echo "export ANTHROPIC_API_KEY='$API_KEY'" >> ~/.zshrc
source ~/.zshrc

# 5. 인증 확인
echo "\n설치 완료! 인증 확인 중..."
claude auth check

echo "\n======================================"
echo "Claude Code 설치가 완료되었습니다!"
echo "다음 명령어로 시작하세요: claude"
```

스크립트 실행:

```bash
chmod +x install-claude-code.sh
./install-claude-code.sh
```

### 설명 (Explanation)

**왜 전역 설치를 사용하는가?**

Claude Code는 프로젝트별 도구가 아닌 <strong>시스템 전체에서 사용하는 CLI 도구</strong>입니다. 따라서 `-g` 플래그로 전역 설치하여 어느 디렉토리에서든 `claude` 명령어를 사용할 수 있도록 합니다.

**환경 변수를 사용하는 이유**:

- <strong>보안</strong>: API 키를 코드에 하드코딩하지 않음
- <strong>이식성</strong>: 다른 환경(개발/스테이징/프로덕션)에서 쉽게 전환
- <strong>버전 관리</strong>: `.gitignore`에 환경 변수 파일 추가로 키 유출 방지

**API 키 관리 권장사항**:

1. <strong>절대 공개 저장소에 커밋하지 않기</strong>
2. `.env` 파일 사용 시 `.gitignore`에 추가
3. 팀 협업 시 `.env.example` 파일로 템플릿 제공
4. 프로덕션 환경에서는 CI/CD 도구의 시크릿 관리 기능 사용

### 변형 (Variations)

#### 변형 1: .env 파일을 사용한 키 관리

프로젝트 루트에 `.env` 파일 생성:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

`.gitignore`에 추가:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

`.env.example` 템플릿 제공:

```bash
# .env.example
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

#### 변형 2: 여러 API 키 관리 (개발/프로덕션 분리)

```bash
# ~/.zshrc
export ANTHROPIC_API_KEY_DEV='sk-ant-dev-...'
export ANTHROPIC_API_KEY_PROD='sk-ant-prod-...'

# 개발 환경 활성화
alias claude-dev='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_DEV claude'

# 프로덕션 환경 활성화
alias claude-prod='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_PROD claude'
```

사용:

```bash
# 개발 환경에서 실행
claude-dev

# 프로덕션 환경에서 실행
claude-prod
```

#### 변형 3: Docker 컨테이너 내 설치

프로젝트를 컨테이너화하여 일관된 환경 제공:

```dockerfile
# Dockerfile
FROM node:18-alpine

# Claude Code 설치
RUN npm install -g @anthropic-ai/claude-code

# 환경 변수 설정 (빌드 시 주입)
ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# 작업 디렉토리 설정
WORKDIR /workspace

# 엔트리포인트
ENTRYPOINT ["claude"]
```

빌드 및 실행:

```bash
# 이미지 빌드
docker build --build-arg ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY -t claude-code .

# 컨테이너 실행
docker run -it -v $(pwd):/workspace claude-code
```

---

## Recipe 2.2: 프로젝트 초기 설정

### 문제 (Problem)

새로운 프로젝트에서 Claude Code를 사용하려면 프로젝트 구조와 설정 파일을 올바르게 구성해야 합니다. 기본 설정만으로는 팀 협업, 보안, 성능 최적화 측면에서 부족할 수 있습니다.

### 해결책 (Solution)

Claude Code 프로젝트는 다음 구조로 초기화합니다:

```
my-project/
├── .claude/
│   ├── settings.json          # 프로젝트 설정
│   ├── settings.local.json    # 로컬 환경 설정 (git 제외)
│   ├── agents/                # 서브에이전트 정의
│   ├── commands/              # 슬래시 커맨드
│   ├── skills/                # 자동 발견 스킬
│   └── guidelines/            # 가이드라인 문서
├── .gitignore
├── CLAUDE.md                  # 프로젝트 컨텍스트 문서
└── README.md
```

#### 1단계: 프로젝트 초기화

```bash
# 프로젝트 디렉토리 생성 및 이동
mkdir my-project && cd my-project

# Git 저장소 초기화
git init

# Claude Code 설정 디렉토리 생성
mkdir -p .claude/{agents,commands,skills,guidelines}
```

#### 2단계: 기본 설정 파일 작성

**`.claude/settings.json`** (버전 관리에 포함):

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "description": "프로젝트 설명"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git",
      "ls",
      "cat",
      "grep"
    ],
    "blockedPaths": [
      ".env",
      "credentials.json",
      "secrets/"
    ]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
```

**`.claude/settings.local.json`** (로컬 환경, git 제외):

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": {
    "temperature": 0.5
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

**`.gitignore`**:

```bash
# 환경 변수
.env
.env.local
.env.*.local

# Claude Code 로컬 설정
.claude/settings.local.json
.claude/cache/
.claude/.history

# Node.js
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# 빌드 결과
dist/
build/
.astro/
```

#### 3단계: CLAUDE.md 작성

프로젝트의 컨텍스트를 제공하는 핵심 문서:

```markdown
# CLAUDE.md

이 파일은 Claude Code가 프로젝트를 이해하는 데 사용됩니다.

## 프로젝트 개요

간단한 설명: 이 프로젝트는 무엇을 하는가?

## 기술 스택

- **언어**: TypeScript, JavaScript
- **프레임워크**: Next.js 14
- **데이터베이스**: PostgreSQL
- **배포**: Vercel

## 아키텍처

- `src/app/` - Next.js App Router 페이지
- `src/components/` - 재사용 가능한 React 컴포넌트
- `src/lib/` - 유틸리티 및 헬퍼 함수
- `src/types/` - TypeScript 타입 정의

## 명령어

\```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run type-check

# 테스트
npm test
\```

## 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict 모드 활성화
- 함수형 컴포넌트 선호
- Tailwind CSS 사용

## 워크플로우

1. 기능 브랜치 생성 (`git checkout -b feature/name`)
2. 코드 작성 및 테스트
3. 커밋 전 타입 체크 및 린트 실행
4. Pull Request 생성
5. 코드 리뷰 후 병합

## 주의사항

- API 키는 절대 커밋하지 않기
- 모든 외부 API 호출은 에러 핸들링 포함
- 이미지 최적화 필수 (next/image 사용)
```

### 코드/예시 (Code)

전체 초기화 과정을 자동화하는 스크립트:

```bash
#!/bin/bash
# init-claude-project.sh

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "사용법: ./init-claude-project.sh <프로젝트명>"
    exit 1
fi

echo "Claude Code 프로젝트 초기화: $PROJECT_NAME"
echo "======================================"

# 1. 프로젝트 디렉토리 생성
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 2. Git 초기화
git init
echo "✓ Git 저장소 초기화"

# 3. Claude 디렉토리 구조 생성
mkdir -p .claude/{agents,commands,skills,guidelines}
echo "✓ Claude 디렉토리 생성"

# 4. settings.json 생성
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0",
  "project": {
    "name": "PROJECT_NAME_PLACEHOLDER",
    "description": "프로젝트 설명"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep"],
    "blockedPaths": [".env", "credentials.json", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
EOF
sed -i '' "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .claude/settings.json
echo "✓ settings.json 생성"

# 5. settings.local.json 생성
cat > .claude/settings.local.json << 'EOF'
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "developer": {
    "debug": true,
    "verbose": false
  }
}
EOF
echo "✓ settings.local.json 생성"

# 6. .gitignore 생성
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
.claude/cache/
.claude/.history
node_modules/
dist/
build/
.astro/
.vscode/
.idea/
*.swp
EOF
echo "✓ .gitignore 생성"

# 7. CLAUDE.md 생성
cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## 프로젝트 개요

이 프로젝트는...

## 기술 스택

- 언어: TypeScript
- 프레임워크: (추가 필요)

## 명령어

\```bash
npm run dev    # 개발 서버
npm run build  # 빌드
\```

## 아키텍처

(프로젝트 구조 설명)

## 코드 스타일

- ESLint + Prettier
- TypeScript strict 모드
EOF
echo "✓ CLAUDE.md 생성"

# 8. README.md 생성
cat > README.md << EOF
# $PROJECT_NAME

프로젝트 설명

## 시작하기

\```bash
npm install
npm run dev
\```

## Claude Code 사용

이 프로젝트는 Claude Code를 사용합니다. \`CLAUDE.md\`를 참조하세요.
EOF
echo "✓ README.md 생성"

# 9. 초기 커밋
git add .
git commit -m "chore: initial Claude Code project setup"
echo "✓ 초기 커밋 완료"

echo "\n======================================"
echo "프로젝트 초기화 완료!"
echo "cd $PROJECT_NAME && claude 명령어로 시작하세요."
```

사용:

```bash
chmod +x init-claude-project.sh
./init-claude-project.sh my-awesome-project
```

### 설명 (Explanation)

**CLAUDE.md의 역할**:

Claude Code는 프로젝트 루트의 `CLAUDE.md` 파일을 자동으로 읽어 <strong>프로젝트의 컨텍스트</strong>를 이해합니다. 이는 다음과 같은 이점을 제공합니다:

1. <strong>정확한 코드 생성</strong>: 프로젝트의 코드 스타일, 아키텍처, 기술 스택을 알고 있음
2. <strong>일관된 결과</strong>: 팀원 간 동일한 컨텍스트 공유
3. <strong>토큰 절약</strong>: 매번 프로젝트 설명을 반복하지 않아도 됨

**설정 파일 분리 전략**:

- <strong>settings.json</strong>: 팀 전체가 공유하는 프로젝트 설정 (버전 관리 포함)
- <strong>settings.local.json</strong>: 개인 개발자의 로컬 설정 (버전 관리 제외)

이를 통해 API 키나 디버그 설정 같은 개인 정보는 공유되지 않으면서도, 프로젝트 표준 설정은 모든 팀원이 동일하게 유지할 수 있습니다.

**샌드박스 모드의 중요성**:

`sandboxMode: true` 설정은 Claude Code가 <strong>허용된 명령어만 실행</strong>하도록 제한합니다. 이는 다음과 같은 위험을 방지합니다:

- 의도치 않은 파일 삭제 (`rm -rf`)
- 시스템 설정 변경
- 민감한 파일 접근

### 변형 (Variations)

#### 변형 1: 모노레포 구조

여러 패키지를 관리하는 모노레포의 경우:

```
monorepo/
├── .claude/
│   ├── settings.json          # 전역 설정
│   └── ...
├── packages/
│   ├── web/
│   │   ├── .claude/
│   │   │   └── settings.json  # web 패키지 설정
│   │   └── CLAUDE.md
│   └── api/
│       ├── .claude/
│       │   └── settings.json  # api 패키지 설정
│       └── CLAUDE.md
└── CLAUDE.md                  # 전체 모노레포 설명
```

루트 `CLAUDE.md`:

```markdown
# 모노레포 프로젝트

## 구조

- `packages/web/` - 프론트엔드 (Next.js)
- `packages/api/` - 백엔드 (NestJS)

## 패키지 간 의존성

web → api (API 호출)

## 공통 명령어

\```bash
npm run build:all      # 모든 패키지 빌드
npm run test:all       # 모든 패키지 테스트
npm run dev:web        # web 패키지만 실행
npm run dev:api        # api 패키지만 실행
\```
```

#### 변형 2: 다국어 프로젝트

블로그처럼 다국어 콘텐츠를 관리하는 경우:

```markdown
# CLAUDE.md

## 다국어 지원

이 프로젝트는 4개 언어를 지원합니다: 한국어(ko), 영어(en), 일본어(ja), 중국어(zh)

### 콘텐츠 구조

\```
src/content/blog/
├── ko/post-name.md    # 한국어
├── en/post-name.md    # 영어
├── ja/post-name.md    # 일본어
└── zh/post-name.md    # 중국어
\```

### 블로그 포스트 작성 규칙

1. 모든 언어 버전을 동시에 작성
2. 파일명은 동일하게 유지
3. pubDate는 'YYYY-MM-DD' 형식 사용
4. heroImage는 모든 언어 버전에서 공유

### /write-post 커맨드

블로그 포스트 작성 시 반드시 4개 언어 모두 작성해야 함.
```

---

## Recipe 2.3: 권장 구성 옵션

### 문제 (Problem)

기본 설정만으로는 프로젝트의 특성에 맞는 최적화된 개발 환경을 구축하기 어렵습니다. 프로젝트 유형(웹 앱, CLI 도구, 라이브러리 등)과 팀 규모에 따라 적절한 설정 조정이 필요합니다.

### 해결책 (Solution)

Claude Code의 고급 설정 옵션을 활용하여 생산성을 극대화합니다.

#### 1. 모델 설정 최적화

프로젝트 특성에 따른 모델 선택:

```json
{
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096,
    "top_p": 0.9
  }
}
```

<strong>모델별 용도</strong>:

| 모델 | 용도 | temperature 권장값 |
|------|------|-------------------|
| Claude Opus 4.5 | 복잡한 아키텍처 설계, 리팩토링 | 0.5〜0.7 |
| Claude Sonnet 4.5 | 일반적인 코드 생성, 버그 수정 | 0.7〜0.9 |
| Claude Haiku | 간단한 작업, 빠른 응답 필요 시 | 0.8〜1.0 |

<strong>temperature 가이드</strong>:

- <strong>0.0〜0.3</strong>: 결정론적, 일관된 출력 (테스트 코드, 문서 생성)
- <strong>0.4〜0.7</strong>: 균형적, 창의적이면서 안정적 (일반 코드 작성)
- <strong>0.8〜1.0</strong>: 창의적, 다양한 솔루션 탐색 (아이디어 브레인스토밍)

#### 2. 안전성 및 권한 설정

**보안 중심 설정** (.claude/settings.json):

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git status",
      "git diff",
      "git log",
      "ls",
      "cat",
      "grep",
      "find"
    ],
    "blockedCommands": [
      "rm -rf",
      "sudo",
      "chmod 777",
      "curl | sh"
    ],
    "blockedPaths": [
      ".env",
      ".env.local",
      "credentials.json",
      "secrets/",
      "private/",
      ".ssh/"
    ],
    "readOnlyPaths": [
      "node_modules/",
      "dist/",
      "build/"
    ],
    "maxFileSize": "10MB",
    "allowNetworkAccess": false
  }
}
```

**설정 설명**:

- <strong>allowedCommands</strong>: 허용된 명령어만 실행 (화이트리스트 방식)
- <strong>blockedCommands</strong>: 절대 실행하면 안 되는 명령어 (블랙리스트)
- <strong>blockedPaths</strong>: 접근 금지 경로 (민감 정보 보호)
- <strong>readOnlyPaths</strong>: 읽기만 가능한 경로 (의존성 폴더 등)
- <strong>allowNetworkAccess</strong>: 외부 네트워크 접근 허용 여부

#### 3. 기능 플래그 설정

프로젝트 워크플로우에 맞는 기능 활성화:

```json
{
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "documentation": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en", "ja", "zh"],
      "defaultLanguage": "ko"
    },
    "mcp": {
      "enabled": true,
      "servers": ["context7", "brave-search", "playwright"]
    }
  }
}
```

<strong>기능별 설명</strong>:

- <strong>autoCommit</strong>: 변경사항 자동 커밋 (false 권장, 명시적 커밋 유도)
- <strong>codeReview</strong>: 코드 작성 후 자동 리뷰 제안
- <strong>typeCheck</strong>: TypeScript 프로젝트의 경우 타입 체크 자동 실행
- <strong>linting</strong>: ESLint 자동 실행
- <strong>testing</strong>: 코드 변경 후 관련 테스트 자동 실행
- <strong>documentation</strong>: JSDoc/TSDoc 주석 자동 생성
- <strong>i18n</strong>: 다국어 지원 활성화
- <strong>mcp</strong>: Model Context Protocol 서버 통합

#### 4. 성능 최적화 설정

```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": "500MB"
    },
    "parallelization": {
      "enabled": true,
      "maxConcurrency": 4
    },
    "timeout": {
      "default": 120000,
      "read": 30000,
      "write": 60000,
      "bash": 120000
    }
  }
}
```

<strong>설정 최적화 팁</strong>:

- <strong>caching.ttl</strong>: 캐시 유효 시간 (초). 빠르게 변하는 프로젝트는 낮게 설정
- <strong>maxConcurrency</strong>: 병렬 작업 수. CPU 코어 수에 맞게 조정
- <strong>timeout</strong>: 작업별 타임아웃. 복잡한 빌드는 더 길게 설정

### 코드/예시 (Code)

프로젝트 유형별 권장 설정 템플릿:

#### 웹 애플리케이션 (Next.js, Astro 등)

```json
{
  "version": "1.0",
  "project": {
    "name": "web-app",
    "type": "web-application",
    "framework": "nextjs"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep", "curl"],
    "blockedPaths": [".env", ".env.local", "credentials.json"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en"]
    },
    "mcp": {
      "enabled": true,
      "servers": ["playwright", "chrome-devtools"]
    }
  },
  "performance": {
    "timeout": {
      "default": 120000,
      "bash": 180000
    }
  }
}
```

#### CLI 도구 / 라이브러리

```json
{
  "version": "1.0",
  "project": {
    "name": "cli-tool",
    "type": "library",
    "language": "typescript"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "jest", "vitest"],
    "blockedPaths": [".npmrc", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "testing": true,
    "documentation": true
  },
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 7200
    }
  }
}
```

#### 데이터 과학 / 머신러닝

```json
{
  "version": "1.0",
  "project": {
    "name": "ml-project",
    "type": "data-science",
    "language": "python"
  },
  "model": {
    "name": "claude-opus-4-5-20251101",
    "temperature": 0.6
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["python", "pip", "jupyter", "git", "ls"],
    "blockedPaths": ["data/raw/", "credentials/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "documentation": true,
    "notebooks": {
      "enabled": true,
      "autosave": true
    }
  },
  "performance": {
    "timeout": {
      "default": 300000,
      "bash": 600000
    }
  }
}
```

### 설명 (Explanation)

**프로젝트 유형별 최적화 전략**:

1. <strong>웹 애플리케이션</strong>:
   - MCP 서버(Playwright, Chrome DevTools)로 브라우저 자동화
   - i18n 활성화로 다국어 콘텐츠 관리
   - 타임아웃 길게 설정 (빌드 시간 고려)

2. <strong>CLI 도구/라이브러리</strong>:
   - documentation 기능 활성화 (공개 API 문서화 중요)
   - 낮은 temperature (일관된 코드 생성)
   - 캐싱 TTL 길게 설정 (의존성 변경 적음)

3. <strong>데이터 과학</strong>:
   - Opus 모델 사용 (복잡한 분석 및 알고리즘)
   - 긴 타임아웃 (데이터 처리 시간 고려)
   - Jupyter 노트북 지원

**성능 vs 안전성 균형**:

- <strong>개발 초기</strong>: 샌드박스 느슨하게, 빠른 반복
- <strong>프로덕션 준비</strong>: 샌드박스 강화, 철저한 검증
- <strong>팀 협업</strong>: 중간 수준, 일관된 규칙

### 변형 (Variations)

#### 변형 1: 환경별 설정 분리

개발/스테이징/프로덕션 환경별 설정:

```bash
.claude/
├── settings.json                # 공통 설정
├── settings.development.json    # 개발 환경
├── settings.staging.json        # 스테이징 환경
└── settings.production.json     # 프로덕션 환경
```

환경 전환:

```bash
# 개발 환경
export CLAUDE_ENV=development
claude

# 프로덕션 환경
export CLAUDE_ENV=production
claude
```

`settings.development.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.9
  },
  "safety": {
    "sandboxMode": false
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

`settings.production.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"]
  },
  "features": {
    "autoCommit": false
  }
}
```

#### 변형 2: 팀 규모별 설정

**소규모 팀 (1〜3명)**:

```json
{
  "safety": {
    "sandboxMode": false
  },
  "features": {
    "autoCommit": true,
    "codeReview": false
  }
}
```

**중규모 팀 (4〜10명)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "git", "ls", "cat", "grep"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true
  }
}
```

**대규모 팀 (10명 이상)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"],
    "requireApproval": true
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true,
    "testing": true,
    "ciIntegration": true
  },
  "workflow": {
    "requirePullRequest": true,
    "requireCodeReview": 2,
    "branchProtection": ["main", "develop"]
  }
}
```

---

## 요약

이 장에서는 Claude Code 환경을 완벽하게 구축하는 방법을 단계별로 살펴보았습니다:

1. <strong>Recipe 2.1 (설치 및 인증)</strong>:
   - Node.js 환경 확인
   - npm을 통한 전역 설치
   - API 키 발급 및 환경 변수 설정
   - 인증 확인

2. <strong>Recipe 2.2 (프로젝트 초기 설정)</strong>:
   - `.claude/` 디렉토리 구조 생성
   - `settings.json` 및 `settings.local.json` 작성
   - `CLAUDE.md`로 프로젝트 컨텍스트 제공
   - `.gitignore` 설정으로 민감 정보 보호

3. <strong>Recipe 2.3 (권장 구성 옵션)</strong>:
   - 프로젝트 유형별 모델 및 temperature 최적화
   - 샌드박스 모드와 권한 설정
   - 기능 플래그 활성화
   - 성능 최적화 (캐싱, 병렬화, 타임아웃)

이제 다음 장에서는 이렇게 구축된 환경에서 <strong>기본 사용법</strong>을 익히고, 실전에서 Claude Code를 활용하는 방법을 학습합니다.

---

**다음 장 미리보기**:

Chapter 3에서는 Claude Code의 핵심 기능인 <strong>대화형 코딩</strong>, <strong>파일 읽기/쓰기</strong>, <strong>Git 통합</strong>을 실습합니다. 간단한 TODO 앱을 처음부터 끝까지 Claude Code와 함께 만들어보면서, 실전 워크플로우를 체득합니다.
