# 프로젝트 지침 변환 가이드

## 개요

Claude Code의 `CLAUDE.md`를 Gemini CLI의 `GEMINI.md`로 변환하는 방법을 설명합니다.

## 기본 개념

### Claude Code - `CLAUDE.md`

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## 프로젝트 개요
[프로젝트 설명]

## 명령어
[자주 사용하는 명령어]

## 아키텍처
[시스템 구조]
```

### Gemini CLI - `GEMINI.md`

```markdown
# Project: [프로젝트명]

## General Instructions
[전반적인 지침]

## Coding Style
[코딩 스타일 규칙]

## Specific Component: [경로]
[컴포넌트별 지침]
```

## 파일 위치 및 우선순위

### Claude Code

```
프로젝트/
└── CLAUDE.md              # 프로젝트 지침 (단일 파일)
```

### Gemini CLI

```
~/.gemini/
└── GEMINI.md              # 전역 컨텍스트 (모든 프로젝트)

프로젝트/
└── GEMINI.md              # 프로젝트 컨텍스트

프로젝트/some/subdirectory/
└── GEMINI.md              # 서브디렉토리 컨텍스트
```

**컨텍스트 로딩 순서**:
1. Global: `~/.gemini/GEMINI.md`
2. Ancestor: 상위 디렉토리에서 상향 검색
3. Current: 현재 디렉토리

**확인 명령어**:
```bash
/memory show               # 현재 로드된 모든 컨텍스트 표시
```

## 권장 구조

### 기본 템플릿

```markdown
# Project: [프로젝트명]

## Overview
[프로젝트 한 줄 요약]

## General Instructions
- [지침 1]
- [지침 2]
- [지침 3]

## Technology Stack
- **Framework**: [프레임워크명 + 버전]
- **Language**: [언어명 + 버전]
- **Build Tool**: [빌드 도구]

## Project Structure
\```
프로젝트/
├── src/
│   ├── components/
│   └── pages/
└── public/
\```

## Coding Style
- **Indentation**: [공백/탭, 크기]
- **Naming Convention**: [camelCase/PascalCase/kebab-case]
- **File Organization**: [규칙]

## Common Commands
\```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
\```

## Testing Guidelines
- [테스트 전략]
- [커버리지 목표]

## Specific Component: src/components
- [컴포넌트별 특별 규칙]

## Specific Component: src/pages
- [페이지별 특별 규칙]
```

## 실전 변환 예제

### 현재 프로젝트 (`www.jangwook.net`) 변환

**Claude Code (`CLAUDE.md`)** → **Gemini CLI (`GEMINI.md`)**

#### Before (Claude Code)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Astro 기반의 블로그 및 커리어 관리 자동화 프로젝트입니다.

## 명령어

\```bash
npm run dev
npm run build
npm run astro check
\```

## Astro 프레임워크 특성

1. **Islands Architecture**: 기본적으로 정적 HTML을 생성
2. **Content Collections**: 타입 안전한 콘텐츠 관리
3. **File-based Routing**: URL 구조 자동 생성
```

#### After (Gemini CLI)

```markdown
# Project: www.jangwook.net

## Overview
Astro 기반의 기술 블로그 및 포트폴리오 관리 자동화 프로젝트

## General Instructions
- Astro 5.14.1 프레임워크 사용
- TypeScript strict 모드 활성화
- Content Collections를 사용한 타입 안전한 콘텐츠 관리
- Islands Architecture 패턴 준수 (최소 클라이언트 JavaScript)

## Technology Stack
- **Framework**: Astro 5.14.1
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown + JSX)

## Common Commands
\```bash
# 개발 서버 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크 및 오류 검사
npm run astro check

# 빌드 미리보기
npm run preview
\```

## Coding Style
- **Indentation**: 2 spaces (no tabs)
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Order**: Astro → React → Utils → Styles

## Astro Framework Rules
1. **Components**: Always use `.astro` extension for Astro components
2. **Images**: Use `<Image>` component from `astro:assets` for optimization
3. **Content Collections**: Define schemas in `src/content.config.ts`
4. **Frontmatter vs Template**: Clearly separate server-side logic from HTML template

## Content Collections Schema
\```typescript
{
  title: string,
  description: string,
  pubDate: Date,
  heroImage?: ImageMetadata,
  tags?: string[]
}
\```

## Testing Guidelines
- Run `npm run astro check` before committing
- Test build with `npm run build`
- Verify preview with `npm run preview`

## Specific Component: src/content/blog
- Blog posts must be in language folders: `ko/`, `en/`, `ja/`, `zh/`
- Use same filename across languages
- Required frontmatter: title, description, pubDate
- Date format: 'YYYY-MM-DD' (single quotes)

## Specific Component: src/pages
- File-based routing: each file = one route
- Dynamic routes require `getStaticPaths()`
- Use layouts from `src/layouts/` for consistency
```

## 점진적 마이그레이션 전략

### 단계 1: 기본 변환

1. `CLAUDE.md`를 `GEMINI.md`로 복사
2. 제목 형식 변경: `# CLAUDE.md` → `# Project: [이름]`
3. 섹션 헤더 조정

```bash
# 자동 변환 스크립트
cp CLAUDE.md GEMINI.md
sed -i '' 's/# CLAUDE.md/# Project: www.jangwook.net/' GEMINI.md
```

### 단계 2: 구조 재조직

기존 섹션을 Gemini CLI 권장 구조로 재배치:

**Claude Code 섹션** → **Gemini CLI 섹션**
- `프로젝트 개요` → `Overview`
- `명령어` → `Common Commands`
- `아키텍처` → `General Instructions` + `Technology Stack`
- `모범 사례` → `Coding Style`
- `테스트 가이드` → `Testing Guidelines`

### 단계 3: 컴포넌트별 지침 추가

```markdown
## Specific Component: src/components
- 재사용 가능한 Astro 컴포넌트만 위치
- Props는 TypeScript interface로 명시
- 스타일은 스코프 또는 Tailwind 사용

## Specific Component: src/pages
- 파일 기반 라우팅 (파일명 = URL)
- 동적 라우트는 `[param].astro` 형식
- `getStaticPaths()` 반드시 구현
```

## 동적 컨텍스트 추가

### `/memory add` 명령어 활용

Gemini CLI는 실행 중에 컨텍스트를 추가할 수 있습니다:

```bash
# Gemini CLI 세션 중
> /memory add "모든 블로그 포스트는 SEO를 위해 description을 150-160자로 제한"

> /memory add "이미지는 WebP 형식 우선 사용"

> /memory add "커밋 메시지는 'feat:', 'fix:', 'docs:' 등의 prefix 사용"

# 현재 메모리 확인
> /memory show
```

**자동 저장**: 이 명령어는 `GEMINI.md`에 자동으로 추가됩니다.

### 자연어 명령어

```bash
# 대안 1
> Remember to use semantic HTML5 elements

# 대안 2
> Add to memory: Always include alt text for images
```

## 컨텍스트 계층 활용

### 전역 + 프로젝트 + 컴포넌트

```
~/.gemini/GEMINI.md:
  ├─ 개인 코딩 스타일 선호도
  ├─ 자주 사용하는 라이브러리 규칙
  └─ 일반적인 베스트 프랙티스

프로젝트/GEMINI.md:
  ├─ 프로젝트 특정 규칙
  ├─ 팀 코딩 컨벤션
  └─ 프레임워크 가이드라인

프로젝트/src/components/GEMINI.md:
  ├─ 컴포넌트 설계 패턴
  ├─ Props 네이밍 규칙
  └─ 스타일링 가이드
```

**장점**:
- 세밀한 제어
- 중복 최소화
- 컨텍스트 분리

## 모듈화된 컨텍스트

### `@file.md` 구문

Gemini CLI는 다른 Markdown 파일을 import 가능:

```markdown
# Project: www.jangwook.net

@docs/astro-guide.md
@docs/content-collections.md
@docs/seo-guidelines.md

## Project-Specific Rules
[프로젝트 전용 규칙만 여기 작성]
```

**파일 구조**:
```
프로젝트/
├── GEMINI.md              # 메인 컨텍스트 (import 사용)
└── docs/
    ├── astro-guide.md
    ├── content-collections.md
    └── seo-guidelines.md
```

**장점**:
- 문서 재사용
- 유지보수 용이
- 팀 협업 개선

## 변환 자동화 스크립트

### Python 스크립트

```python
#!/usr/bin/env python3
"""
CLAUDE.md → GEMINI.md 변환기
"""
from pathlib import Path
import re

def convert_claude_to_gemini(claude_md_path, output_path=None):
    """
    CLAUDE.md를 GEMINI.md 형식으로 변환

    Args:
        claude_md_path: CLAUDE.md 경로
        output_path: 출력 경로 (기본: GEMINI.md)
    """
    with open(claude_md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 프로젝트 이름 추출 (디렉토리명 사용)
    project_name = Path(claude_md_path).parent.name

    # 제목 변환
    content = re.sub(
        r'^# CLAUDE\.md',
        f'# Project: {project_name}',
        content,
        flags=re.MULTILINE
    )

    # 섹션 매핑
    replacements = {
        '## 프로젝트 개요': '## Overview',
        '## 명령어': '## Common Commands',
        '## 아키텍처': '## Technology Stack',
        '## 모범 사례': '## Coding Style',
        '## 디버깅': '## Testing Guidelines',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    # 출력 경로 결정
    if output_path is None:
        output_path = Path(claude_md_path).parent / 'GEMINI.md'

    # 파일 쓰기
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ 변환 완료: {output_path}")

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("사용법: python convert_instructions.py <CLAUDE.md 경로> [출력 경로]")
        sys.exit(1)

    claude_path = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else None

    convert_claude_to_gemini(claude_path, output)
```

### 사용법

```bash
# 기본 변환
python convert_instructions.py CLAUDE.md

# 사용자 레벨로 변환
python convert_instructions.py CLAUDE.md ~/.gemini/GEMINI.md
```

## 검증 및 테스트

### Gemini CLI에서 컨텍스트 확인

```bash
# Gemini CLI 시작
gemini-cli

# 로드된 컨텍스트 확인
> /memory show

# 특정 규칙 테스트
> "Astro 컴포넌트를 작성할 때 어떤 규칙을 따라야 하나요?"
```

### 컨텍스트 효과 확인

```bash
# 코드 생성 테스트
> "새로운 블로그 포스트를 작성해주세요"

# Gemini가 GEMINI.md의 규칙을 준수하는지 확인:
# - pubDate 형식 (YYYY-MM-DD)
# - 언어별 폴더 구조
# - heroImage 경로
```

## 베스트 프랙티스

### 1. 간결하게 작성

❌ **나쁜 예**:
```markdown
## Coding Style
우리 프로젝트에서는 코드를 작성할 때 항상 일관성을 유지하는 것이
매우 중요합니다. 따라서 모든 팀원은 다음 규칙을 반드시 준수해야 합니다...
```

✅ **좋은 예**:
```markdown
## Coding Style
- 2 spaces for indentation
- camelCase for variables, PascalCase for components
- Max line length: 100 characters
```

### 2. 실행 가능한 지침

❌ **나쁜 예**:
```markdown
- 좋은 코드를 작성하세요
- 성능을 고려하세요
```

✅ **좋은 예**:
```markdown
- Use `<Image>` component for all images (auto-optimization)
- Minimize client-side JavaScript (Islands Architecture)
- Run `npm run astro check` before committing
```

### 3. 예제 포함

```markdown
## Content Collections Schema
\```typescript
// Required fields
{
  title: string,        // Max 60 chars (SEO)
  description: string,  // 150-160 chars (SEO)
  pubDate: Date,        // 'YYYY-MM-DD' format
}

// Optional fields
{
  heroImage?: ImageMetadata,
  tags?: string[],      // Max 5 tags
}
\```
```

## 트러블슈팅

### 문제 1: 컨텍스트가 로드되지 않음

**증상**:
```bash
> /memory show
No context loaded
```

**해결**:
```bash
# 파일 위치 확인
ls -la GEMINI.md
ls -la ~/.gemini/GEMINI.md

# 파일 내용 확인 (Markdown 형식 오류 체크)
cat GEMINI.md

# Gemini CLI 재시작
```

### 문제 2: 일부 규칙만 적용됨

**증상**: 일부 지침은 따르지만 일부는 무시됨

**원인**: 컨텍스트가 너무 길거나 모호함

**해결**:
- 핵심 규칙만 유지 (우선순위)
- 구체적이고 명확한 지침
- 예제 포함

### 문제 3: 컴포넌트별 지침 미적용

**증상**: `src/components/GEMINI.md`가 로드되지 않음

**해결**:
```bash
# 작업 디렉토리 확인
pwd

# 해당 디렉토리에서 Gemini CLI 실행
cd src/components
gemini-cli
```

## 참고 자료

- [GEMINI.md Best Practices](https://codelabs.developers.google.com/gemini-cli-hands-on#5)
- [Memory Management](https://medium.com/google-cloud/gemini-cli-tutorial-series-77da7d494718)
- [Context Hierarchy](https://www.philschmid.de/gemini-cli-cheatsheet)

---

**다음 단계**: [슬래시 커맨드 마이그레이션 →](./03-slash-commands.md)
