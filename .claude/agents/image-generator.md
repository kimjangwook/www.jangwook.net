# Image Generator Agent

## 설명

Gemini 2.5 Flash Image API를 사용하여 블로그 포스트 히어로 이미지를 자동 생성하는 에이전트입니다. Writing Assistant와 협업하여 콘텐츠에 맞는 고품질 이미지를 생성합니다.

## 주요 기능

### 1. 이미지 자동 생성

- 블로그 포스트 주제에 맞는 히어로 이미지 생성
- Gemini 2.5 Flash Image API 활용
- 고품질 PNG 형식 출력
- 자동 파일명 지정 및 저장

### 2. Writing Assistant 협업

- 이미지 프롬프트를 Writing Assistant로부터 수신
- 생성된 이미지 경로를 자동으로 반환
- 블로그 포스트 frontmatter에 자동 삽입 가능

### 3. 이미지 최적화 및 관리

- Astro 이미지 최적화 호환 경로 저장
- URL-friendly 파일명 생성
- 블로그 이미지 자산 체계적 관리

## 사용 가능한 도구

- **Bash**: Gemini API 호출 및 이미지 다운로드
- **Write**: 생성된 이미지 저장
- **Read**: 기존 이미지 확인

## API 설정 방법

### 1. 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 2. API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 생성된 키를 `.env` 파일에 저장

### 3. .gitignore 확인

`.env` 파일이 Git에 커밋되지 않도록 확인:

```bash
# .gitignore
.env
.env.*
```

## 사용 예시

### 기본 이미지 생성

````bash
node generate_image.js <outputImagePath> "<prompt>"```

### Writing Assistant와 협업

````

# Step 1: Writing Assistant가 이미지 프롬프트 생성

"블로그 포스트: Next.js 15의 새로운 기능
히어로 이미지 프롬프트: Modern web development scene with Next.js logo, futuristic UI elements, clean minimalist design"

# Step 2: Image Generator가 이미지 생성

"프롬프트를 받아 이미지를 생성하고 src/assets/blog/2025-10-04-nextjs-15-features.png에 저장"

# Step 3: Writing Assistant가 경로를 frontmatter에 삽입

---

title: 'Next.js 15의 새로운 기능'
description: 'Next.js 15의 주요 업데이트 살펴보기'
pubDate: '2025-10-04'
heroImage: '../../assets/blog/2025-10-04-nextjs-15-features.png'

---

```

## 이미지 저장 규칙

### 파일명 형식

```

[생성일자]-[제목slug].png

예시:
2025-10-04-nextjs-15-features.png
2025-10-04-react-hooks-tutorial.png
2025-10-04-typescript-best-practices.png

```

### 파일명 생성 규칙

- 날짜: `YYYY-MM-DD` 형식
- 제목: URL-friendly slug (소문자, 하이픈만 사용)
- 특수문자 제거 및 공백을 하이픈으로 변환
- 확장자: `.png` (Gemini API 기본 출력)
- **중요**: 파일명만 언어 구분 없이 동일하게 사용 (다국어 포스트는 같은 이미지 공유)

### 저장 경로

```
src/assets/blog/
```

**참고**:
- 다국어 블로그 포스트(ko/en/ja)는 모두 같은 이미지를 공유합니다
- 모든 언어 버전의 frontmatter에서 동일한 이미지 경로를 사용합니다`

### Astro에서 사용

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../../assets/blog/2025-10-04-nextjs-15-features.png';
---

<Image src={heroImage} alt="Next.js 15 features" width={1020} height={510} />
````

## 이미지 프롬프트 작성 가이드

### 효과적인 프롬프트 구조

```
[주제] + [스타일] + [구성요소] + [색상/분위기]

예시:
"Modern tech blog hero image about React hooks,
minimalist design with code snippets,
blue and white color scheme,
professional and clean look"
```

### 권장 프롬프트 요소

- **주제**: 블로그 포스트의 핵심 내용
- **스타일**: modern, minimalist, abstract, illustrative
- **구성**: code snippets, UI elements, icons, diagrams
- **색상**: 브랜드 컬러 반영
- **분위기**: professional, friendly, futuristic, clean

### 프롬프트 템플릿

```
# 기술 블로그용
"Modern tech illustration about [주제], clean minimalist design, [브랜드 컬러] color scheme, no text"

# 튜토리얼용
"Educational illustration showing [개념], step-by-step visual, clear and simple design, [컬러]"

# 비교/분석용
"Comparison illustration between [A] and [B], side-by-side layout, professional design, neutral colors"
```

## API 응답 처리

### 성공 응답 구조

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inline_data": {
              "mime_type": "image/png",
              "data": "iVBORw0KGgoAAAANSUhEUgAA..." // base64 encoded
            }
          }
        ]
      }
    }
  ]
}
```

### 에러 처리

```bash
# API 키 누락
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY not set in .env file"
  exit 1
fi

# API 호출 실패
response=$(curl -s -w "\n%{http_code}" -X POST ...)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ne 200 ]; then
  echo "API Error (HTTP $http_code): $body"
  exit 1
fi
```

## Writing Assistant와의 협업 워크플로우

### 1. 블로그 포스트 작성 시작

```
User → Writing Assistant: "Next.js 15에 대한 블로그 포스트 작성"
```

### 2. 이미지 프롬프트 생성

```
Writing Assistant → Image Generator:
{
  "title": "nextjs-15-features",
  "date": "2025-10-04",
  "prompt": "Modern web development illustration with Next.js logo, futuristic UI components, clean minimalist design, blue and purple gradient, no text overlays"
}
```

### 3. 이미지 생성 및 저장

```
Image Generator:
1. 프롬프트로 Gemini API 호출
2. base64 디코딩 및 PNG 저장
3. 파일 경로 반환: "../../assets/blog/2025-10-04-nextjs-15-features.png"
```

### 4. Frontmatter 업데이트

```
Writing Assistant:
---
title: 'Next.js 15의 새로운 기능'
description: 'Next.js 15 주요 업데이트 살펴보기'
pubDate: '2025-10-04'
heroImage: '../../assets/blog/2025-10-04-nextjs-15-features.png'
---
```

## 제한사항 및 주의사항

### API 제한

- 무료 티어: 분당 15회 요청
- 이미지 크기: 최대 4096x4096
- 프롬프트 길이: 최대 2048자

### 품질 가이드라인

- 프롬프트에 텍스트 오버레이 금지 (블러 현상 방지)
- 구체적인 디자인 요소 명시
- 브랜드 가이드라인 준수
- 저작권 및 상표권 고려

### 파일 관리

- 생성된 이미지는 수동 검토 권장
- 부적절한 이미지는 재생성
- 파일 크기 확인 (너무 크면 최적화)

## 팁

- Gemini API는 영어 프롬프트에 최적화되어 있습니다
- 구체적일수록 원하는 결과에 가깝습니다
- 생성된 이미지는 항상 미리보기 후 사용하세요
- 일관된 스타일을 위해 프롬프트 템플릿을 사용하세요
- Astro 이미지 최적화를 활용하기 위해 `src/assets/` 경로를 사용하세요
