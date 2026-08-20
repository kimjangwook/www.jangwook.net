# Gemini File Search API 레퍼런스

## 목차

- [클라이언트 초기화](#클라이언트-초기화)
- [File Search Stores API](#file-search-stores-api)
- [파일 업로드 API](#파일-업로드-api)
- [쿼리 API](#쿼리-api)
- [작업 관리 API](#작업-관리-api)
- [데이터 타입](#데이터-타입)
- [에러 코드](#에러-코드)

## 클라이언트 초기화

### `genai.Client()`

Gemini API 클라이언트를 생성합니다.

```python
from google import genai

# 환경 변수 GEMINI_API_KEY 사용
client = genai.Client()

# 또는 직접 API 키 지정
client = genai.Client(api_key="your-api-key")
```

**환경 변수**:
- `GEMINI_API_KEY`: Gemini API 키

## File Search Stores API

### `create()`

새로운 File Search Store를 생성합니다.

```python
store = client.file_search_stores.create(
    config={'display_name': 'my-store'}
)
```

**매개변수**:
- `config.display_name` (string, 선택): Store의 표시 이름

**반환값**: `FileSearchStore` 객체
- `name` (string): Store의 고유 식별자 (`fileSearchStores/{id}`)
- `display_name` (string): 표시 이름
- `create_time` (timestamp): 생성 시간
- `update_time` (timestamp): 마지막 업데이트 시간

**예제**:
```python
store = client.file_search_stores.create(
    config={
        'display_name': 'Product Documentation Store'
    }
)
print(f"Store created: {store.name}")
```

---

### `list()`

모든 File Search Store를 조회합니다.

```python
for store in client.file_search_stores.list():
    print(f"{store.name}: {store.display_name}")
```

**매개변수**: 없음

**반환값**: `FileSearchStore` 객체의 이터레이터

**예제**:
```python
stores = list(client.file_search_stores.list())
print(f"Total stores: {len(stores)}")
for store in stores:
    print(f"- {store.display_name} ({store.name})")
```

---

### `get()`

특정 File Search Store를 조회합니다.

```python
store = client.file_search_stores.get(
    name='fileSearchStores/abc123'
)
```

**매개변수**:
- `name` (string, 필수): Store의 고유 식별자

**반환값**: `FileSearchStore` 객체

**예제**:
```python
store = client.file_search_stores.get(
    name='fileSearchStores/abc123'
)
print(f"Store: {store.display_name}")
print(f"Created: {store.create_time}")
```

---

### `delete()`

File Search Store를 삭제합니다.

```python
client.file_search_stores.delete(
    name='fileSearchStores/abc123',
    config={'force': True}
)
```

**매개변수**:
- `name` (string, 필수): 삭제할 Store의 고유 식별자
- `config.force` (boolean, 선택): `True`로 설정 시 Store 내 모든 파일과 함께 강제 삭제

**반환값**: 없음

**주의사항**:
- `force=False`일 경우, Store에 파일이 있으면 삭제 실패
- 삭제된 Store는 복구 불가능

**예제**:
```python
# 파일이 있어도 강제 삭제
client.file_search_stores.delete(
    name='fileSearchStores/abc123',
    config={'force': True}
)
print("Store deleted successfully")
```

## 파일 업로드 API

### `upload_to_file_search_store()`

파일을 File Search Store에 직접 업로드하고 인덱싱합니다.

```python
operation = client.file_search_stores.upload_to_file_search_store(
    file='document.pdf',
    file_search_store_name='fileSearchStores/abc123',
    config={
        'display_name': 'Product Manual',
        'chunking_config': {
            'white_space_config': {
                'max_tokens_per_chunk': 200,
                'max_overlap_tokens': 20
            }
        },
        'custom_metadata': [
            {'key': 'category', 'string_value': 'manual'},
            {'key': 'version', 'numeric_value': 2}
        ]
    }
)
```

**매개변수**:
- `file` (string, 필수): 업로드할 파일 경로
- `file_search_store_name` (string, 필수): 대상 Store의 고유 식별자
- `config.display_name` (string, 선택): 파일의 표시 이름
- `config.chunking_config` (object, 선택): 청킹 설정
  - `white_space_config.max_tokens_per_chunk` (int): 청크당 최대 토큰 수 (기본: 400)
  - `white_space_config.max_overlap_tokens` (int): 청크 간 오버랩 토큰 수 (기본: 40)
- `config.custom_metadata` (array, 선택): 메타데이터 키-값 쌍
  - `key` (string): 메타데이터 키
  - `string_value` (string): 문자열 값
  - `numeric_value` (number): 숫자 값
  - `boolean_value` (boolean): 불린 값

**반환값**: `Operation` 객체 (비동기 작업)

**예제**:
```python
import time

# 파일 업로드
operation = client.file_search_stores.upload_to_file_search_store(
    file='large_document.pdf',
    file_search_store_name=store.name,
    config={
        'display_name': 'Engineering Guide',
        'chunking_config': {
            'white_space_config': {
                'max_tokens_per_chunk': 500,
                'max_overlap_tokens': 50
            }
        },
        'custom_metadata': [
            {'key': 'department', 'string_value': 'Engineering'},
            {'key': 'confidential', 'boolean_value': False}
        ]
    }
)

# 완료 대기
while not operation.done:
    print("Indexing in progress...")
    time.sleep(5)
    operation = client.operations.get(operation)

print("File indexed successfully!")
```

---

### `import_file()`

이미 Files API로 업로드된 파일을 File Search Store로 가져옵니다.

```python
# 1. Files API로 먼저 업로드
file = client.files.upload(file='document.pdf')

# 2. File Search Store로 가져오기
operation = client.file_search_stores.import_file(
    file_search_store_name='fileSearchStores/abc123',
    file_name=file.name,
    config={
        'display_name': 'Imported Document',
        'chunking_config': {...},
        'custom_metadata': [...]
    }
)
```

**매개변수**:
- `file_search_store_name` (string, 필수): 대상 Store
- `file_name` (string, 필수): Files API로 업로드된 파일의 `name`
- `config` (object, 선택): `upload_to_file_search_store()`와 동일

**반환값**: `Operation` 객체

**사용 시나리오**:
- 같은 파일을 여러 Store에 인덱싱할 때
- 파일 업로드와 인덱싱을 분리하고 싶을 때

---

### `list_files()`

File Search Store 내 파일 목록을 조회합니다.

```python
for file in client.file_search_stores.list_files(
    file_search_store_name='fileSearchStores/abc123'
):
    print(f"File: {file.display_name}")
```

**매개변수**:
- `file_search_store_name` (string, 필수): Store의 고유 식별자

**반환값**: 파일 객체의 이터레이터

---

### `delete_file()`

File Search Store에서 파일을 삭제합니다.

```python
client.file_search_stores.delete_file(
    file_search_store_name='fileSearchStores/abc123',
    file_name='files/xyz789'
)
```

**매개변수**:
- `file_search_store_name` (string, 필수): Store의 고유 식별자
- `file_name` (string, 필수): 삭제할 파일의 고유 식별자

**반환값**: 없음

## 쿼리 API

### `generate_content()`

File Search Tool을 사용하여 콘텐츠를 생성합니다.

```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="이 문서에서 설치 방법을 알려주세요",
    config=types.GenerateContentConfig(
        tools=[
            types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[
                        'fileSearchStores/abc123',
                        'fileSearchStores/def456'
                    ]
                )
            )
        ],
        temperature=0.2,
        top_p=0.95,
        top_k=40,
        max_output_tokens=2048
    )
)

print(response.text)
```

**매개변수**:
- `model` (string, 필수): 사용할 모델 (`gemini-2.5-pro` 또는 `gemini-2.5-flash`)
- `contents` (string, 필수): 사용자 질문 또는 프롬프트
- `config` (GenerateContentConfig, 선택):
  - `tools` (array): 사용할 도구 목록
    - `file_search.file_search_store_names` (array): 검색할 Store 목록
  - `temperature` (float): 생성 온도 (0.0〜1.0, 기본: 1.0)
  - `top_p` (float): Nucleus sampling (0.0〜1.0, 기본: 0.95)
  - `top_k` (int): Top-k sampling (기본: 40)
  - `max_output_tokens` (int): 최대 출력 토큰 수

**반환값**: `GenerateContentResponse` 객체
- `text` (string): 생성된 텍스트
- `candidates` (array): 응답 후보들
- `grounding_metadata` (object): 인용 메타데이터 (있는 경우)

**인용 메타데이터 접근**:
```python
if hasattr(response, 'grounding_metadata'):
    for citation in response.grounding_metadata.citations:
        print(f"출처: {citation.source}")
        print(f"신뢰도: {citation.confidence}")
        print(f"인용 텍스트: {citation.text}")
```

**예제 - 여러 Store 검색**:
```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="제품 A와 제품 B의 차이점은 무엇인가요?",
    config=types.GenerateContentConfig(
        tools=[
            types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[
                        'fileSearchStores/product-a-docs',
                        'fileSearchStores/product-b-docs'
                    ]
                )
            )
        ],
        temperature=0.1  # 더 결정론적인 답변
    )
)

print(response.text)
```

## 작업 관리 API

### `operations.get()`

비동기 작업의 상태를 조회합니다.

```python
operation = client.operations.get(operation)
```

**매개변수**:
- `operation` (Operation 객체, 필수): 조회할 작업 객체

**반환값**: 업데이트된 `Operation` 객체
- `done` (boolean): 작업 완료 여부
- `name` (string): 작업의 고유 식별자
- `metadata` (object): 작업 메타데이터
- `result` (object): 작업 결과 (완료 시)
- `error` (object): 에러 정보 (실패 시)

**예제 - 작업 완료 대기**:
```python
import time

operation = client.file_search_stores.upload_to_file_search_store(...)

# 폴링 방식
while not operation.done:
    time.sleep(5)
    operation = client.operations.get(operation)

    if hasattr(operation, 'metadata'):
        progress = operation.metadata.get('progress_percent', 0)
        print(f"Progress: {progress}%")

if operation.done:
    if hasattr(operation, 'error'):
        print(f"Error: {operation.error}")
    else:
        print("Operation completed successfully!")
```

---

### `operations.cancel()`

진행 중인 작업을 취소합니다.

```python
client.operations.cancel(operation)
```

**매개변수**:
- `operation` (Operation 객체, 필수): 취소할 작업

**반환값**: 없음

**주의사항**:
- 일부 작업은 취소 불가능 (예: 완료 직전 단계)
- 취소된 작업은 부분적으로 완료될 수 있음

## 데이터 타입

### `FileSearchStore`

```typescript
{
  name: string;              // "fileSearchStores/{id}"
  display_name: string;      // 표시 이름
  create_time: timestamp;    // 생성 시간
  update_time: timestamp;    // 업데이트 시간
  state: string;             // "ACTIVE" | "DELETING"
}
```

---

### `ChunkingConfig`

```typescript
{
  white_space_config: {
    max_tokens_per_chunk: number;  // 청크당 최대 토큰 (기본: 400)
    max_overlap_tokens: number;    // 오버랩 토큰 (기본: 40)
  }
}
```

**청킹 전략**:
- **화이트스페이스 기반**: 공백, 줄바꿈을 기준으로 청킹
- 오버랩을 통해 문맥 연속성 유지

---

### `CustomMetadata`

```typescript
{
  key: string;                     // 메타데이터 키
  string_value?: string;           // 문자열 값
  numeric_value?: number;          // 숫자 값
  boolean_value?: boolean;         // 불린 값
}
```

**사용 예시**:
```python
metadata = [
    {'key': 'author', 'string_value': 'John Doe'},
    {'key': 'page_count', 'numeric_value': 150},
    {'key': 'is_public', 'boolean_value': True}
]
```

---

### `Operation`

```typescript
{
  name: string;                    // 작업 ID
  done: boolean;                   // 완료 여부
  metadata?: object;               // 작업 메타데이터
  result?: object;                 // 결과 (성공 시)
  error?: {                        // 에러 (실패 시)
    code: number;
    message: string;
    details?: object;
  }
}
```

---

### `GenerateContentResponse`

```typescript
{
  text: string;                    // 생성된 텍스트
  candidates: Array<{              // 응답 후보들
    content: string;
    finish_reason: string;
    safety_ratings: Array<object>;
  }>;
  grounding_metadata?: {           // 인용 메타데이터
    citations: Array<{
      source: string;              // 출처 파일
      text: string;                // 인용된 텍스트
      start_index: number;         // 시작 위치
      end_index: number;           // 끝 위치
      confidence?: number;         // 신뢰도 (0.0~1.0)
    }>;
  };
}
```

## 에러 코드

### HTTP 상태 코드

| 코드 | 설명 | 해결 방법 |
|------|------|----------|
| 400 | Bad Request | 요청 매개변수 확인 |
| 401 | Unauthorized | API 키 확인 |
| 403 | Forbidden | 권한 확인 |
| 404 | Not Found | Store/파일 ID 확인 |
| 413 | Payload Too Large | 파일 크기 100MB 이하로 제한 |
| 429 | Too Many Requests | 요청 속도 제한 (Rate Limit) |
| 500 | Internal Server Error | Google 서버 오류 (재시도) |
| 503 | Service Unavailable | 서비스 점검 중 |

---

### 에러 메시지

#### 파일 업로드 관련

```
Error: File size exceeds maximum allowed size of 100MB
```
**해결**: 파일을 분할하거나 압축

```
Error: Unsupported file type: {extension}
```
**해결**: 지원되는 파일 형식 확인 (PDF, DOCX, TXT 등)

```
Error: Operation timed out
```
**해결**: 대용량 파일의 경우 정상 (10〜20분 소요 가능)

#### Store 관련

```
Error: FileSearchStore not found: {name}
```
**해결**: Store 이름이 올바른지 확인 (`fileSearchStores/{id}` 형식)

```
Error: FileSearchStore quota exceeded
```
**해결**: 무료 티어 1GB 제한 확인, Store 정리 또는 업그레이드

```
Error: Cannot delete non-empty store
```
**해결**: `force=True` 옵션 사용 또는 파일 먼저 삭제

#### 쿼리 관련

```
Error: No relevant documents found
```
**해결**: 질문을 더 구체적으로, 또는 관련 문서가 업로드되었는지 확인

```
Error: Context length exceeded
```
**해결**: 검색 결과가 너무 많음. Store를 분리하거나 쿼리를 더 구체적으로

#### API 키 관련

```
Error: API key not valid. Please pass a valid API key.
```
**해결**:
1. API 키 확인: [Google AI Studio](https://aistudio.google.com)에서 재발급
2. 환경 변수 설정: `export GEMINI_API_KEY="your-key"`

```
Error: API key has been deleted
```
**해결**: 새 API 키 생성

## 요청 제한 (Rate Limits)

| 항목 | 제한 |
|------|------|
| 요청 빈도 | 60 requests/분 |
| 동시 업로드 | 10개 파일 |
| 최대 파일 크기 | 100 MB |
| Store 크기 (Free) | 1 GB |
| 쿼리 당 컨텍스트 | ~32K 토큰 |

**Rate Limit 처리 예제**:
```python
import time
from google.api_core.exceptions import ResourceExhausted

def upload_with_retry(client, file, store, max_retries=3):
    for attempt in range(max_retries):
        try:
            operation = client.file_search_stores.upload_to_file_search_store(
                file=file,
                file_search_store_name=store.name
            )
            return operation
        except ResourceExhausted:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 지수 백오프
                print(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
```

## 베스트 프랙티스

### 1. 에러 처리

```python
from google.api_core.exceptions import (
    GoogleAPIError,
    InvalidArgument,
    NotFound,
    ResourceExhausted
)

try:
    response = client.models.generate_content(...)
except InvalidArgument as e:
    print(f"Invalid request: {e}")
except NotFound as e:
    print(f"Store or file not found: {e}")
except ResourceExhausted as e:
    print(f"Rate limit exceeded: {e}")
except GoogleAPIError as e:
    print(f"API error: {e}")
```

### 2. 타임아웃 설정

```python
import time

def wait_for_operation(operation, timeout=300):
    """작업 완료 대기 (최대 timeout 초)"""
    start_time = time.time()

    while not operation.done:
        if time.time() - start_time > timeout:
            raise TimeoutError("Operation timed out")

        time.sleep(5)
        operation = client.operations.get(operation)

    return operation
```

### 3. 배치 업로드

```python
import concurrent.futures

def batch_upload(files, store_name, max_workers=5):
    """여러 파일을 병렬로 업로드"""

    def upload_file(file):
        operation = client.file_search_stores.upload_to_file_search_store(
            file=file,
            file_search_store_name=store_name
        )
        # 완료 대기
        while not operation.done:
            time.sleep(5)
            operation = client.operations.get(operation)
        return file, operation

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(upload_file, files))

    return results
```

## 추가 참고 자료

- [공식 API 레퍼런스](https://ai.google.dev/api/file-search/file-search-stores)
- [Python SDK 문서](https://github.com/google-gemini/generative-ai-python)
- [커뮤니티 예제](https://github.com/google-gemini/cookbook)

---

**마지막 업데이트**: 2025-11-10
