# 슬래시 커맨드 마이그레이션 가이드

## 개요

Claude Code의 Markdown 기반 커맨드(`.claude/commands/*.md`)를 Gemini CLI의 TOML 기반 커맨드(`.gemini/commands/*.toml`)로 변환하는 방법을 설명합니다.

## 기본 구조 비교

### Claude Code 커맨드 (`.claude/commands/example.md`)

```markdown
# Command Title

## Description
[Command description and purpose]

## Usage
```bash
/command-name <args> [options]
```

## Parameters
...detailed parameters...

## Implementation Instructions
...step-by-step workflow...
```

### Gemini CLI 커맨드 (`.gemini/commands/example.toml`)

```toml
description = "Short command description"
prompt = """
Your role: [role description]
Task: {{args}}

[Detailed instructions]
"""
```

## 핵심 차이점

| 특징 | Claude Code | Gemini CLI |
|------|-------------|------------|
| **파일 형식** | Markdown (`.md`) | TOML (`.toml`) |
| **구조** | 자유 형식 (섹션 기반) | 고정 형식 (2개 필드) |
| **파라미터** | 상세 문서화 가능 | `{{args}}`로 단순화 |
| **길이** | 제한 없음 (수백 줄 가능) | 간결 권장 (핵심만) |
| **복잡한 워크플로우** | 직접 정의 가능 | 프롬프트 엔지니어링 필요 |

## 변환 전략

### 전략 1: 단순 커맨드 (직접 변환)

복잡한 워크플로우가 없는 간단한 커맨드는 직접 변환 가능.

**Claude Code 예시** (`.claude/commands/commit.md`):
```markdown
# Commit Command

## Description
Create a git commit with a properly formatted message

## Usage
```bash
/commit <message>
```

## Implementation
- Validate message format
- Create commit with message
- Push if requested
```

**Gemini CLI 변환** (`.gemini/commands/commit.toml`):
```toml
description = "Create a git commit with formatted message"
prompt = """
Create a git commit with the following message: {{args}}

Instructions:
1. Validate commit message follows conventional commits format (feat:, fix:, docs:, etc.)
2. Stage all changes (git add .)
3. Create commit with proper formatting
4. Ask user if they want to push

Follow the commit message guidelines in GEMINI.md.
"""
```

---

### 전략 2: 복잡한 커맨드 (프롬프트 간소화)

수백 줄의 복잡한 워크플로우를 가진 커맨드는 핵심만 추출.

**Claude Code 예시** (`write-post.md` - 1093 lines):
- 상세한 파라미터 설명
- 8단계 워크플로우
- 에이전트 통합 지침
- 에러 처리 로직

**변환 접근 방식**:
1. **핵심 프롬프트만 추출** - TOML 커맨드에는 최소한의 지침만
2. **상세 워크플로우는 GEMINI.md로** - 프로젝트 컨텍스트에 추가
3. **또는 별도 문서 참조** - `@docs/write-post-guide.md` import

**Gemini CLI 변환** (`.gemini/commands/write-post.toml`):
```toml
description = "Generate multi-language blog post with SEO and images"
prompt = """
Generate a blog post about: {{args}}

Workflow:
1. Research topic using web search
2. Determine publication date (latest post + 1 day)
3. Generate hero image
4. Write post in 4 languages (ko, ja, en, zh)
5. Update README.md
6. Manage backlinks
7. Add metadata to post-metadata.json
8. Generate recommendations

For detailed workflow, see GEMINI.md section "Blog Post Workflow".

Output format:
- Save to: src/content/blog/<lang>/<slug>.md
- Follow Astro Content Collections schema
- Use pubDate format: 'YYYY-MM-DD'
"""
```

---

### 전략 3: 하이브리드 (커맨드 + 문서)

커맨드는 간단하게, 상세 문서는 별도 파일로 관리.

**파일 구조**:
```
.gemini/
├── commands/
│   └── write-post.toml          # 간단한 커맨드 정의
└── docs/
    └── write-post-workflow.md   # 상세 워크플로우 문서
```

**GEMINI.md에서 import**:
```markdown
@.gemini/docs/write-post-workflow.md
```

**장점**:
- TOML 커맨드는 간결 유지
- 복잡한 로직은 별도 문서화
- 팀원과 공유 용이
- 버전 관리 가능

## 실전 변환 예제

### 예제 1: 간단한 커맨드 (commit.md)

**Before (Claude Code)**:
```markdown
# Commit Command

## Description
Create a git commit with a properly formatted message

## Usage
/commit <message>
```

**After (Gemini CLI)**:
```toml
description = "Create formatted git commit"
prompt = """
Create a git commit with message: {{args}}

Follow conventional commits format (feat:, fix:, docs:, etc.).
Stage all changes and create commit.
"""
```

**변환 시간**: 5분

---

### 예제 2: 중간 복잡도 (analyze-posts.md - 445 lines)

**Before (Claude Code)** - 주요 섹션:
- Description
- Usage & Options
- 5-step Implementation Instructions
- Performance Optimization
- Error Handling
- Testing
- Integration details

**After (Gemini CLI)** - 간소화:
```toml
description = "Analyze blog posts and generate metadata"
prompt = """
Analyze blog posts and generate structured metadata for: {{args}}

Process:
1. Collect Korean (ko) posts only (content identical across languages)
2. Calculate content hash to detect changes
3. Extract metadata:
   - summary (200 chars)
   - mainTopics (5 items)
   - techStack (5 items)
   - difficulty (1-5)
   - categoryScores (5 categories, 0.0-1.0)
4. Save to post-metadata.json

Options:
- No args: Incremental update (only new/changed)
- "--force": Regenerate all
- "--post <slug>": Analyze specific post
- "--verify": Verify existing metadata

See GEMINI.md "Post Analysis Workflow" for details.
"""
```

**변환 시간**: 20분 (핵심 추출 + GEMINI.md에 상세 내용 이동)

---

### 예제 3: 매우 복잡한 커맨드 (write-post.md - 1093 lines)

**Before (Claude Code)** - 포함 내용:
- 상세 파라미터 문서 (required/optional)
- 8단계 워크플로우 (각 단계마다 하위 단계 다수)
- 4개 에이전트 통합 (Writing Assistant, Web Researcher, Image Generator, Backlink Manager)
- Frontmatter 스키마 검증
- 이미지 생성 가이드라인
- SEO 최적화 규칙
- 에러 핸들링 시나리오
- 트러블슈팅 가이드

**After (Gemini CLI)** - 3단계 접근:

#### Step 1: 간소화된 TOML 커맨드

`.gemini/commands/write-post.toml`:
```toml
description = "Generate multi-language blog post"
prompt = """
Write a blog post about: {{args}}

Extract any --tags, --languages, --description from args.

Core workflow:
1. Research topic (use web search with 2-second delays)
2. Determine pubDate (latest post + 1 day, format: 'YYYY-MM-DD')
3. Generate hero image
4. Write in parallel for languages: ko, ja, en, zh
5. Update README.md, manage backlinks
6. Add metadata, generate recommendations

Detailed workflow: see @.gemini/docs/blog-post-workflow.md

Requirements from GEMINI.md:
- Follow Content Collections schema
- Use single quotes for dates
- Save to src/content/blog/<lang>/<slug>.md
"""
```

#### Step 2: 상세 워크플로우 문서

`.gemini/docs/blog-post-workflow.md`:
```markdown
# Blog Post Creation Workflow

[원래 write-post.md의 상세 내용을 구조화하여 옮김]

## 1. Research Phase
...

## 2. Image Generation
...

## 3. Content Writing
...

[나머지 섹션들...]
```

#### Step 3: GEMINI.md에 참조 추가

`GEMINI.md`:
```markdown
## Blog Post Creation

@.gemini/docs/blog-post-workflow.md

### Quick Reference
- Command: `/write-post "topic" --tags tag1,tag2`
- Output: 4 language versions + hero image
- Updates: README.md, post-metadata.json, recommendations
```

**변환 시간**: 1-2시간 (내용 재구성 필요)

**장점**:
- TOML 커맨드는 핵심만 (50줄 이내)
- 상세 문서는 별도 관리
- 유지보수 용이
- Gemini CLI의 제약 극복

## 자동 변환 스크립트

### Python 스크립트

```python
#!/usr/bin/env python3
"""
Claude Code .md commands → Gemini CLI .toml commands 변환기
"""
import re
from pathlib import Path

def extract_description(md_content):
    """Markdown에서 Description 추출"""
    match = re.search(r'## Description\s+(.+?)(?=##|$)', md_content, re.DOTALL)
    if match:
        desc = match.group(1).strip()
        # 첫 줄만 사용 (한 줄 요약)
        return desc.split('\n')[0][:100]
    return "Command description"

def extract_usage(md_content):
    """사용법 추출"""
    match = re.search(r'## Usage\s+```bash\s+(.+?)\s+```', md_content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extract_workflow(md_content):
    """워크플로우 섹션 추출"""
    match = re.search(r'## (Workflow|Implementation)(.+?)(?=## |$)', md_content, re.DOTALL)
    if match:
        content = match.group(2).strip()
        # 간소화: 각 단계의 제목만 추출
        steps = re.findall(r'###\s+(.+)', content)
        return steps
    return []

def generate_toml(command_name, md_content, output_dir):
    """TOML 커맨드 생성"""
    description = extract_description(md_content)
    usage = extract_usage(md_content)
    steps = extract_workflow(md_content)

    # 프롬프트 구성
    prompt_parts = [
        f"Task: {{{{args}}}}",
        "",
        "Workflow:"
    ]

    for i, step in enumerate(steps[:5], 1):  # 최대 5단계만
        prompt_parts.append(f"{i}. {step}")

    if len(steps) > 5:
        prompt_parts.append("\nFor detailed workflow, see GEMINI.md or @.gemini/docs/")

    prompt = "\n".join(prompt_parts)

    # TOML 생성
    toml_content = f'''description = "{description}"
prompt = """
{prompt}
"""
'''

    output_file = output_dir / f"{command_name}.toml"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(toml_content)

    print(f"✅ Generated: {output_file}")

    # 복잡도 경고
    if len(md_content) > 500:  # 500줄 이상
        print(f"   ⚠️  Original command is complex ({len(md_content.splitlines())} lines)")
        print(f"   💡 Consider creating detailed docs in .gemini/docs/")

def convert_commands(claude_commands_dir, gemini_commands_dir):
    """모든 커맨드 변환"""
    claude_dir = Path(claude_commands_dir)
    gemini_dir = Path(gemini_commands_dir)
    gemini_dir.mkdir(parents=True, exist_ok=True)

    for md_file in claude_dir.glob("*.md"):
        command_name = md_file.stem
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()

        generate_toml(command_name, md_content, gemini_dir)

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("사용법: python convert_commands.py <.claude/commands dir> [.gemini/commands dir]")
        sys.exit(1)

    claude_dir = sys.argv[1]
    gemini_dir = sys.argv[2] if len(sys.argv) > 2 else ".gemini/commands"

    convert_commands(claude_dir, gemini_dir)
    print("\n✨ Conversion complete!")
    print("⚠️  Review generated files and refine prompts as needed.")
```

### 사용법

```bash
# 기본 변환
python convert_commands.py .claude/commands .gemini/commands

# 출력 확인
ls -la .gemini/commands/

# 개별 파일 확인
cat .gemini/commands/write-post.toml
```

## {{args}} 활용 패턴

### 패턴 1: 직접 사용

```toml
prompt = """
Analyze the topic: {{args}}
"""
```

입력: `/analyze "TypeScript performance"`
→ `{{args}}`: `"TypeScript performance"`

---

### 패턴 2: 옵션 파싱 (자연어 지시)

```toml
prompt = """
Parse options from: {{args}}

Extract:
- Topic (main subject)
- --tags (comma-separated)
- --language (ko/ja/en/zh)

Then execute the workflow...
"""
```

입력: `/write "Next.js 15" --tags nextjs,react --language ko,ja`
→ Gemini가 파싱하여 각 옵션 추출

---

### 패턴 3: 조건부 처리

```toml
prompt = """
Task: {{args}}

If "{{args}}" contains "--force":
  Regenerate all data
Else:
  Incremental update only
"""
```

**주의**: Gemini CLI는 파라미터 파싱이 Claude Code만큼 정교하지 않을 수 있음. 프롬프트 엔지니어링으로 보완 필요.

## 변환 후 테스트

### Gemini CLI에서 커맨드 확인

```bash
# Gemini CLI 시작
gemini-cli

# 커맨드 목록 확인 (/help 또는 탭 자동완성)
/help

# 특정 커맨드 테스트
/write-post "Test Topic" --tags test

# 출력 확인
# - 파라미터가 올바르게 파싱되는가?
# - 워크플로우가 실행되는가?
# - 에러 없이 완료되는가?
```

### 개선 사항 식별

테스트 중 발견된 문제:
1. **파라미터 파싱 실패** → 프롬프트에 더 명확한 지시 추가
2. **워크플로우 누락** → GEMINI.md에 상세 내용 추가
3. **에러 핸들링 부족** → 프롬프트에 에러 케이스 명시

## 베스트 프랙티스

### 1. TOML 커맨드는 간결하게

❌ **나쁜 예** (너무 장황):
```toml
description = "..."
prompt = """
[500 lines of detailed instructions]
"""
```

✅ **좋은 예** (핵심만):
```toml
description = "Generate blog post"
prompt = """
Write post: {{args}}

Workflow: Research → Image → Write (4 langs) → Update docs
Details: see GEMINI.md "Blog Post Workflow"
"""
```

### 2. 복잡한 로직은 문서화

```
.gemini/
├── commands/
│   ├── write-post.toml     # 간결한 커맨드
│   └── analyze.toml
└── docs/
    ├── write-post.md       # 상세 워크플로우
    └── analysis.md
```

### 3. 프롬프트 엔지니어링 활용

```toml
prompt = """
Your role: Blog post generator
Goal: Create SEO-optimized multi-language posts

Input: {{args}}

Step-by-step:
1. [Clear instruction]
2. [Clear instruction]
...

Output format:
[Specify exact format expected]

Constraints:
- Use 'YYYY-MM-DD' for dates
- Follow Content Collections schema
- Generate 4 language versions
"""
```

### 4. 에러 케이스 명시

```toml
prompt = """
Task: {{args}}

Validation:
- If no topic provided: show usage
- If invalid language: use default (ko,ja,en,zh)
- If metadata missing: auto-generate

Proceed only if validation passes.
"""
```

## 제한사항 극복

### 제한사항 1: 파라미터 시스템 없음

**Claude Code**:
```markdown
## Parameters
- topic (required)
- --tags (optional)
- --language (optional)
```

**Gemini CLI 대안**:
```toml
prompt = """
Parse from {{args}}:
- Topic: main text (required)
- Tags: after --tags (optional, comma-separated)
- Language: after --language (optional, default: ko,ja,en,zh)

Example: "Next.js" --tags nextjs,react --language ko,ja
"""
```

### 제한사항 2: 복잡한 워크플로우

**Claude Code**: 8단계 + 각 하위 단계 상세 설명 가능

**Gemini CLI 대안**:
- 커맨드: 핵심 흐름만 (5-7단계)
- 상세 문서: `.gemini/docs/*.md`
- 컨텍스트: `GEMINI.md`에 import

### 제한사항 3: 에이전트 시스템 통합

**Claude Code**: 에이전트를 명시적으로 호출 가능

**Gemini CLI 대안**:
- 별도 커맨드로 각 에이전트 기능 구현
- 또는 프롬프트에서 역할 정의

## 마이그레이션 체크리스트

### 변환 전

- [ ] 모든 `.claude/commands/*.md` 파일 목록 작성
- [ ] 각 커맨드의 복잡도 평가 (간단/중간/복잡)
- [ ] 우선순위 결정 (자주 사용하는 커맨드 먼저)

### 변환 중

- [ ] 간단한 커맨드: 직접 TOML로 변환
- [ ] 복잡한 커맨드: 핵심만 추출 + 문서 생성
- [ ] 매우 복잡한 커맨드: 하이브리드 접근 (커맨드 + 문서)

### 변환 후

- [ ] Gemini CLI에서 각 커맨드 테스트
- [ ] 파라미터 파싱 확인
- [ ] 워크플로우 실행 검증
- [ ] 에러 핸들링 테스트
- [ ] 문서화 완료 (GEMINI.md 또는 .gemini/docs/)

## 참고 자료

- [Gemini CLI Custom Commands](https://www.philschmid.de/gemini-cli-cheatsheet#custom-commands)
- [TOML Specification](https://toml.io/en/)
- [Gemini CLI Tutorial](https://codelabs.developers.google.com/gemini-cli-hands-on#6)

---

**다음 단계**: [에이전트 시스템 재구성 →](./04-agent-system.md)
