# Google Gemini File Search Tool

> **발표일**: 2025년 11월 7일
> **공식 문서**: [ai.google.dev/gemini-api/docs/file-search](https://ai.google.dev/gemini-api/docs/file-search)

## 목차

- [개요](#개요)
- [주요 특징](#주요-특징)
- [작동 원리](#작동-원리)
- [빠른 시작](#빠른-시작)
- [데모 애플리케이션](#데모-애플리케이션)
- [기술 사양](#기술-사양)
- [참고 자료](#참고-자료)

## 개요

**Gemini API File Search Tool**은 Google이 2025년 11월에 발표한 <strong>완전 관리형 RAG (Retrieval Augmented Generation) 시스템</strong>입니다. 개발자가 복잡한 RAG 파이프라인을 직접 구축할 필요 없이, Gemini API에 통합된 형태로 문서 검색 및 질의응답 기능을 제공합니다.

### 왜 중요한가?

기존에는 RAG 시스템을 구축하기 위해 다음과 같은 복잡한 작업이 필요했습니다:
- 문서 청킹 (Chunking)
- 임베딩 생성 (Embedding Generation)
- 벡터 데이터베이스 관리 (Vector DB Management)
- 검색 파이프라인 최적화

**File Search Tool은 이 모든 과정을 자동화**하여, 개발자가 파일을 업로드하고 바로 질문할 수 있도록 합니다.

## 주요 특징

### 1. 완전 관리형 RAG 시스템
- ✅ 자동 문서 청킹 및 인덱싱
- ✅ 임베딩 자동 생성 (쿼리 시 무료)
- ✅ 의미 기반 검색 (Semantic Search)
- ✅ 벡터 스토리지 관리

### 2. 광범위한 파일 형식 지원
- **애플리케이션 파일** (100+ 종류): PDF, Word, Excel, PowerPoint, JSON, SQL 등
- **텍스트 파일** (200+ 종류): Markdown, HTML, CSV, YAML, 소스 코드 파일 등

### 3. 유연한 청킹 설정
```python
config={
    'chunking_config': {
        'white_space_config': {
            'max_tokens_per_chunk': 200,  # 청크당 최대 토큰 수
            'max_overlap_tokens': 20       # 청크 간 오버랩
        }
    }
}
```

### 4. 메타데이터 필터링
```python
custom_metadata=[
    {"key": "author", "string_value": "Robert Graves"},
    {"key": "year", "numeric_value": 1934}
]
```

### 5. 인용 출처 추적
- `grounding_metadata` 속성을 통해 응답이 어느 문서에서 왔는지 확인 가능

## 작동 원리

```mermaid
graph LR
    A[파일 업로드] --> B[자동 청킹]
    B --> C[임베딩 생성]
    C --> D[벡터 DB 저장]
    D --> E[사용자 질문]
    E --> F[의미 기반 검색]
    F --> G[관련 문서 조각 검색]
    G --> H[Gemini 응답 생성]
```

### 3단계 프로세스

1. **인덱싱 단계**
   - 파일을 File Search Store에 업로드
   - 자동으로 청킹 및 임베딩 생성
   - 벡터 데이터베이스에 저장

2. **쿼리 단계**
   - 사용자 질문을 임베딩으로 변환
   - 의미적으로 유사한 문서 청크 검색

3. **생성 단계**
   - 검색된 문서를 컨텍스트로 사용
   - Gemini 모델이 정확한 답변 생성

## 빠른 시작

### 사전 준비

1. Google AI Studio에서 API 키 발급: [aistudio.google.com](https://aistudio.google.com)
2. Python 환경 설정:

```bash
pip install google-genai
```

### 기본 예제

```python
from google import genai
from google.genai import types
import time

# 클라이언트 초기화 (GEMINI_API_KEY 환경 변수 필요)
client = genai.Client()

# 1. File Search Store 생성
file_search_store = client.file_search_stores.create(
    config={'display_name': 'my-first-store'}
)

# 2. 파일 업로드
operation = client.file_search_stores.upload_to_file_search_store(
    file='document.pdf',
    file_search_store_name=file_search_store.name,
    config={'display_name': 'my-document'}
)

# 3. 업로드 완료 대기
while not operation.done:
    time.sleep(5)
    operation = client.operations.get(operation)

# 4. 질문하기
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="이 문서의 주요 내용은 무엇인가요?",
    config=types.GenerateContentConfig(
        tools=[
            types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[file_search_store.name]
                )
            )
        ]
    )
)

print(response.text)
```

## 데모 애플리케이션

이 저장소에는 3가지 데모 애플리케이션이 포함되어 있습니다:

### 1. 기본 예제 (`demo/basic_example.py`)
- 단일 파일 업로드 및 질문
- File Search Store 관리
- 기본적인 쿼리 처리

### 2. 고급 예제 (`demo/advanced_example.py`)
- 청킹 설정 커스터마이징
- 메타데이터 필터링
- 인용 출처 추적
- 배치 파일 업로드

### 3. 웹 인터페이스 (`demo/web_app.py`)
- Streamlit 기반 UI
- 파일 업로드 인터페이스
- 대화형 질의응답

### 실행 방법

```bash
cd research/gemini-filesearch/demo

# 환경 변수 설정
export GEMINI_API_KEY="your-api-key-here"

# 기본 예제 실행
python basic_example.py

# 고급 예제 실행
python advanced_example.py

# 웹 앱 실행 (Streamlit 설치 필요)
pip install streamlit
streamlit run web_app.py
```

## 기술 사양

### 지원 모델
- `gemini-2.5-pro`
- `gemini-2.5-flash`

### 제한 사항

| 항목 | 제한 |
|------|------|
| 최대 파일 크기 | 100 MB/파일 |
| 저장소 크기 (Free) | 1 GB |
| 저장소 크기 (Tier 1) | 10 GB |
| 저장소 크기 (Tier 2) | 100 GB |
| 저장소 크기 (Tier 3) | 1 TB |
| 권장 Store 크기 | < 20 GB |

### 데이터 보존

- **Files API로 업로드한 원본 파일**: 48시간 후 자동 삭제
- **File Search Store에 저장된 데이터**: 명시적으로 삭제할 때까지 영구 보존

### 가격 정책

| 항목 | 가격 |
|------|------|
| 인덱싱 (임베딩 생성) | $0.15 / 1M 토큰 |
| 스토리지 | 무료 |
| 쿼리 임베딩 | 무료 |
| 검색된 토큰 | 표준 컨텍스트 토큰 요금 |

## 아키텍처

### File Search Store 구조

```
File Search Store
├── Document 1
│   ├── Chunk 1 (Embedding Vector)
│   ├── Chunk 2 (Embedding Vector)
│   └── ...
├── Document 2
│   ├── Chunk 1 (Embedding Vector)
│   └── ...
└── Metadata Index
```

### 검색 프로세스

1. **문서 준비**
   ```
   문서 → 청킹 → 임베딩 → 벡터 DB
   ```

2. **쿼리 처리**
   ```
   사용자 질문 → 쿼리 임베딩 → 유사도 검색 → 상위 N개 청크
   ```

3. **응답 생성**
   ```
   검색된 청크 + 원본 질문 → Gemini 모델 → 답변
   ```

## 사용 사례

### 1. 고객 지원 시스템
- 지식 베이스 문서를 File Search Store에 업로드
- 고객 질문에 대한 자동 응답 생성
- 출처 인용으로 신뢰성 확보

### 2. 연구 도구
- 논문 및 연구 자료 업로드
- 특정 주제에 대한 문헌 검색
- 여러 문서를 종합한 인사이트 도출

### 3. 기업 지식 관리
- 내부 문서, 매뉴얼, 정책 문서 통합
- 직원들의 질문에 즉시 답변
- 문서 업데이트 시 자동 재인덱싱

### 4. 콘텐츠 기반 Q&A
- 블로그, 기사, 교육 자료 업로드
- 독자 질문에 맥락에 맞는 답변 제공

## 고급 기능

### 1. 커스텀 청킹 전략

```python
# 화이트스페이스 기반 청킹
config={
    'chunking_config': {
        'white_space_config': {
            'max_tokens_per_chunk': 500,
            'max_overlap_tokens': 50
        }
    }
}
```

### 2. 메타데이터 필터링

```python
# 파일 업로드 시 메타데이터 추가
custom_metadata=[
    {"key": "department", "string_value": "Engineering"},
    {"key": "category", "string_value": "Technical Documentation"},
    {"key": "version", "numeric_value": 2}
]

# 쿼리 시 필터 적용 (향후 지원 예정)
# filter="department='Engineering' AND version > 1"
```

### 3. 인용 출처 확인

```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="질문",
    config=types.GenerateContentConfig(
        tools=[types.Tool(file_search=...)]
    )
)

# 인용 메타데이터 확인
if hasattr(response, 'grounding_metadata'):
    for citation in response.grounding_metadata.citations:
        print(f"출처: {citation.source}")
        print(f"관련도: {citation.confidence}")
```

## 기존 RAG 시스템과의 비교

| 특징 | 자체 구축 RAG | Gemini File Search |
|------|---------------|-------------------|
| 설정 복잡도 | 높음 (청킹, 임베딩, 벡터 DB) | 낮음 (파일 업로드만) |
| 유지보수 | 지속적 관리 필요 | Google이 관리 |
| 스케일링 | 수동 스케일링 | 자동 스케일링 |
| 비용 | 인프라 비용 + 개발 시간 | 사용량 기반 과금 |
| 커스터마이징 | 완전한 제어 가능 | 제한적 제어 |
| 시작 속도 | 느림 (며칠〜몇 주) | 빠름 (몇 분) |

## 베스트 프랙티스

### 1. Store 설계
- ✅ 주제별로 별도의 Store 생성 (예: 제품 문서, 법률 문서)
- ✅ Store 크기는 20GB 이하로 유지 (검색 성능 최적화)
- ✅ 관련성 높은 문서만 함께 저장

### 2. 청킹 최적화
- ✅ 문서 특성에 맞는 청크 크기 설정
  - 짧은 문서 (FAQ): 100〜200 토큰
  - 긴 문서 (기술 문서): 400〜600 토큰
- ✅ 오버랩 설정으로 문맥 유지 (10〜20% 권장)

### 3. 메타데이터 활용
- ✅ 검색 필터링에 유용한 메타데이터 추가
- ✅ 일관된 키 명명 규칙 사용
- ✅ 버전 정보 포함 (문서 업데이트 추적)

### 4. 비용 최적화
- ✅ 불필요한 재인덱싱 방지
- ✅ 중복 문서 제거
- ✅ 쿼리 결과 캐싱 고려

## 제한 사항 및 주의사항

### 현재 제한
1. **메타데이터 필터링 쿼리**: 문서에 언급되어 있지만 아직 완전히 지원되지 않을 수 있음
2. **실시간 업데이트**: 파일 업데이트 시 재인덱싱 필요 (자동 증분 업데이트 미지원)
3. **멀티모달 검색**: 현재는 텍스트 기반 검색만 지원 (이미지 내 텍스트 검색 제한적)

### 주의사항
- 민감한 데이터는 Google 서버에 저장됨 (데이터 보안 정책 확인 필요)
- 48시간 후 원본 파일 삭제되므로 별도 보관 필요
- 무료 티어 1GB 제한 (프로덕션 사용 시 유료 플랜 고려)

## 문제 해결

### 자주 발생하는 오류

#### 1. 업로드 실패
```
Error: File size exceeds limit
```
**해결**: 파일을 100MB 이하로 분할하거나 압축

#### 2. 인덱싱 지연
```
Operation still in progress after 5 minutes
```
**해결**: 대용량 파일의 경우 최대 10〜20분 소요 가능 (정상)

#### 3. 검색 결과 없음
```
No relevant documents found
```
**해결**:
- 질문을 더 구체적으로 수정
- 문서에 관련 내용이 실제로 있는지 확인
- 청킹 설정 조정

## 로드맵 및 향후 개선 사항

### Google이 발표한 향후 계획
- 더 많은 파일 형식 지원
- 실시간 문서 업데이트
- 고급 메타데이터 필터링 쿼리
- 멀티모달 검색 (이미지, 표 인식)

### 커뮤니티 요청 사항
- 온프레미스 배포 옵션
- 커스텀 임베딩 모델 지원
- 더 세밀한 청킹 제어

## 참고 자료

### 공식 문서
- [File Search 공식 문서](https://ai.google.dev/gemini-api/docs/file-search)
- [File Search API 레퍼런스](https://ai.google.dev/api/file-search/file-search-stores)
- [Google AI Studio](https://aistudio.google.com)
- [공식 발표 블로그](https://blog.google/technology/developers/file-search-gemini-api/)

### 커뮤니티 리소스
- [Gemini API GitHub Discussions](https://github.com/google-gemini/generative-ai-python/discussions)
- [Stack Overflow - gemini-api 태그](https://stackoverflow.com/questions/tagged/gemini-api)

### 관련 기술
- [RAG (Retrieval Augmented Generation) 개념](https://arxiv.org/abs/2005.11401)
- [Semantic Search vs Keyword Search](https://en.wikipedia.org/wiki/Semantic_search)
- [Vector Databases 이해하기](https://www.pinecone.io/learn/vector-database/)

### 영상 자료
- [Google AI Studio 소개](https://www.youtube.com/watch?v=4oyqd7CB09c)
- [Gemini API with Python 튜토리얼](https://www.youtube.com/watch?v=qfWpPEgea2A)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 기여

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

---

**작성일**: 2025-11-10
**최종 업데이트**: 2025-11-10
**작성자**: Claude Code
