# Gemini File Search 사용 가이드

## 목차

- [시작하기](#시작하기)
- [기본 워크플로우](#기본-워크플로우)
- [실전 예제](#실전-예제)
- [고급 활용](#고급-활용)
- [문제 해결](#문제-해결)

## 시작하기

### 1. API 키 발급

1. [Google AI Studio](https://aistudio.google.com) 접속
2. 왼쪽 메뉴에서 "Get API key" 선택
3. "Create API key" 버튼 클릭
4. API 키 복사 및 안전하게 보관

### 2. Python 환경 설정

```bash
# Python 3.9 이상 권장
python --version

# Google Generative AI SDK 설치
pip install google-genai

# 추가 유틸리티 (선택)
pip install python-dotenv  # 환경 변수 관리
pip install tqdm           # 진행률 표시
```

### 3. 환경 변수 설정

**.env 파일 생성**:
```bash
GEMINI_API_KEY=your-api-key-here
```

**Python에서 사용**:
```python
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
```

또는 **셸에서 설정**:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

## 기본 워크플로우

### Step 1: 클라이언트 초기화

```python
from google import genai

client = genai.Client()  # 환경 변수 GEMINI_API_KEY 자동 사용
```

### Step 2: File Search Store 생성

```python
store = client.file_search_stores.create(
    config={'display_name': 'My Knowledge Base'}
)

print(f"Store created: {store.name}")
# 출력: Store created: fileSearchStores/abc123xyz789
```

**중요**: `store.name`을 저장해두세요. 파일 업로드와 쿼리 시 필요합니다.

### Step 3: 파일 업로드

```python
import time

# 단일 파일 업로드
operation = client.file_search_stores.upload_to_file_search_store(
    file='document.pdf',
    file_search_store_name=store.name,
    config={'display_name': 'Product Manual'}
)

# 완료 대기
while not operation.done:
    print("Indexing...")
    time.sleep(5)
    operation = client.operations.get(operation)

print("Upload complete!")
```

### Step 4: 질문하기

```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="이 제품의 설치 방법은 무엇인가요?",
    config=types.GenerateContentConfig(
        tools=[
            types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[store.name]
                )
            )
        ]
    )
)

print(response.text)
```

## 실전 예제

### 예제 1: 고객 지원 시스템

**시나리오**: FAQ 문서를 기반으로 고객 질문에 자동 응답

```python
from google import genai
from google.genai import types
import time

# 초기화
client = genai.Client()

# 1. Store 생성
support_store = client.file_search_stores.create(
    config={'display_name': 'Customer Support FAQs'}
)

# 2. FAQ 문서들 업로드
faq_files = [
    'faq_general.pdf',
    'faq_technical.pdf',
    'faq_billing.pdf'
]

for faq_file in faq_files:
    operation = client.file_search_stores.upload_to_file_search_store(
        file=faq_file,
        file_search_store_name=support_store.name,
        config={
            'display_name': faq_file,
            'chunking_config': {
                'white_space_config': {
                    'max_tokens_per_chunk': 300,  # FAQ는 짧은 청크
                    'max_overlap_tokens': 30
                }
            }
        }
    )

    # 완료 대기
    while not operation.done:
        time.sleep(5)
        operation = client.operations.get(operation)

    print(f"✓ {faq_file} indexed")

# 3. 고객 질문 처리
def answer_customer_question(question):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"고객 질문: {question}\n\n위 질문에 대해 FAQ 문서를 참고하여 정확하고 친절하게 답변해주세요.",
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[support_store.name]
                    )
                )
            ],
            temperature=0.2  # 일관된 답변을 위해 낮은 온도
        )
    )

    return response.text

# 사용 예시
questions = [
    "제품 환불 정책은 어떻게 되나요?",
    "비밀번호를 잊어버렸어요. 어떻게 재설정하나요?",
    "배송 기간은 얼마나 걸리나요?"
]

for q in questions:
    print(f"\n질문: {q}")
    answer = answer_customer_question(q)
    print(f"답변: {answer}")
```

### 예제 2: 연구 논문 분석

**시나리오**: 여러 논문을 업로드하고 특정 주제에 대한 문헌 검토

```python
from google import genai
from google.genai import types
import os
import time

client = genai.Client()

# 1. 연구 Store 생성
research_store = client.file_search_stores.create(
    config={'display_name': 'AI Research Papers'}
)

# 2. 논문 폴더에서 PDF 파일 일괄 업로드
papers_dir = './papers'
pdf_files = [f for f in os.listdir(papers_dir) if f.endswith('.pdf')]

print(f"Found {len(pdf_files)} papers to index")

for pdf_file in pdf_files:
    file_path = os.path.join(papers_dir, pdf_file)

    # 논문은 긴 청크 사용 (더 많은 맥락)
    operation = client.file_search_stores.upload_to_file_search_store(
        file=file_path,
        file_search_store_name=research_store.name,
        config={
            'display_name': pdf_file,
            'chunking_config': {
                'white_space_config': {
                    'max_tokens_per_chunk': 600,  # 논문은 긴 청크
                    'max_overlap_tokens': 60
                }
            },
            'custom_metadata': [
                {'key': 'type', 'string_value': 'research_paper'},
                {'key': 'year', 'numeric_value': 2025}
            ]
        }
    )

    # 완료 대기
    while not operation.done:
        time.sleep(5)
        operation = client.operations.get(operation)

    print(f"✓ {pdf_file}")

# 3. 문헌 검토 쿼리
def literature_review(topic, aspect="methodology"):
    prompt = f"""
    주제: {topic}

    업로드된 연구 논문들을 분석하여 다음을 제공해주세요:
    1. 이 주제에 대한 주요 연구 흐름
    2. 각 논문에서 사용된 {aspect}
    3. 공통점과 차이점
    4. 향후 연구 방향 제안

    각 정보에 대해 출처 논문을 명시해주세요.
    """

    response = client.models.generate_content(
        model="gemini-2.5-pro",  # 복잡한 분석은 pro 모델 사용
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[research_store.name]
                    )
                )
            ],
            temperature=0.3
        )
    )

    return response.text

# 사용 예시
review = literature_review(
    topic="Transformer 아키텍처의 효율성 개선",
    aspect="최적화 기법"
)

print(review)
```

### 예제 3: 기업 지식 관리

**시나리오**: 부서별 문서를 별도 Store로 관리하고 통합 검색

```python
from google import genai
from google.genai import types
import time

client = genai.Client()

# 1. 부서별 Store 생성
departments = ['Engineering', 'Marketing', 'Sales', 'HR']
stores = {}

for dept in departments:
    store = client.file_search_stores.create(
        config={'display_name': f'{dept} Knowledge Base'}
    )
    stores[dept] = store
    print(f"Created store for {dept}: {store.name}")

# 2. 부서별 문서 업로드 (예: Engineering)
def upload_department_docs(dept_name, files):
    store = stores[dept_name]

    for file in files:
        operation = client.file_search_stores.upload_to_file_search_store(
            file=file,
            file_search_store_name=store.name,
            config={
                'display_name': file,
                'custom_metadata': [
                    {'key': 'department', 'string_value': dept_name},
                    {'key': 'confidential', 'boolean_value': False}
                ]
            }
        )

        while not operation.done:
            time.sleep(5)
            operation = client.operations.get(operation)

        print(f"✓ {file} uploaded to {dept_name}")

# Engineering 문서 업로드
engineering_docs = [
    'api_documentation.pdf',
    'system_architecture.pdf',
    'coding_standards.pdf'
]
upload_department_docs('Engineering', engineering_docs)

# 3. 부서별 검색
def search_department(dept_name, question):
    store = stores[dept_name]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=question,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[store.name]
                    )
                )
            ]
        )
    )

    return response.text

# 4. 통합 검색 (여러 부서)
def search_all_departments(question, dept_list=None):
    if dept_list is None:
        dept_list = departments

    store_names = [stores[dept].name for dept in dept_list]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=question,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=store_names
                    )
                )
            ]
        )
    )

    return response.text

# 사용 예시
print("\n=== Engineering 부서 검색 ===")
answer = search_department('Engineering', 'API 인증 방법은 무엇인가요?')
print(answer)

print("\n=== 통합 검색 (모든 부서) ===")
answer = search_all_departments('신입 사원 온보딩 프로세스는 어떻게 되나요?')
print(answer)

print("\n=== 특정 부서들만 검색 ===")
answer = search_all_departments(
    '제품 마케팅 전략은 무엇인가요?',
    dept_list=['Marketing', 'Sales']
)
print(answer)
```

## 고급 활용

### 1. 프로그레스 바와 함께 업로드

```python
from tqdm import tqdm
import time

def upload_with_progress(files, store_name):
    """프로그레스 바를 표시하며 파일 업로드"""

    with tqdm(total=len(files), desc="Uploading files") as pbar:
        for file in files:
            # 업로드
            operation = client.file_search_stores.upload_to_file_search_store(
                file=file,
                file_search_store_name=store_name
            )

            # 완료 대기
            while not operation.done:
                time.sleep(2)
                operation = client.operations.get(operation)

            pbar.update(1)

    print("All files uploaded successfully!")

# 사용
files = ['doc1.pdf', 'doc2.pdf', 'doc3.pdf']
upload_with_progress(files, store.name)
```

### 2. 인용 출처 추적

```python
def search_with_citations(question, store_name):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=question,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[store_name]
                    )
                )
            ]
        )
    )

    print(f"답변: {response.text}\n")

    # 인용 출처 확인
    if hasattr(response, 'grounding_metadata'):
        print("=== 출처 ===")
        for idx, citation in enumerate(response.grounding_metadata.citations, 1):
            print(f"{idx}. 출처: {citation.source}")
            print(f"   인용 텍스트: {citation.text[:100]}...")
            if hasattr(citation, 'confidence'):
                print(f"   신뢰도: {citation.confidence:.2%}")
            print()

# 사용
search_with_citations(
    "제품의 보증 기간은 얼마나 되나요?",
    store.name
)
```

### 3. 청킹 전략 최적화

```python
# 문서 타입별 청킹 설정
CHUNKING_STRATEGIES = {
    'faq': {
        'max_tokens_per_chunk': 200,
        'max_overlap_tokens': 20
    },
    'manual': {
        'max_tokens_per_chunk': 400,
        'max_overlap_tokens': 40
    },
    'research': {
        'max_tokens_per_chunk': 600,
        'max_overlap_tokens': 60
    }
}

def upload_with_strategy(file, store_name, doc_type='manual'):
    strategy = CHUNKING_STRATEGIES.get(doc_type, CHUNKING_STRATEGIES['manual'])

    operation = client.file_search_stores.upload_to_file_search_store(
        file=file,
        file_search_store_name=store_name,
        config={
            'chunking_config': {
                'white_space_config': strategy
            }
        }
    )

    return operation

# 사용
upload_with_strategy('faq.pdf', store.name, doc_type='faq')
upload_with_strategy('research_paper.pdf', store.name, doc_type='research')
```

### 4. 메타데이터 활용

```python
# 메타데이터와 함께 업로드
operation = client.file_search_stores.upload_to_file_search_store(
    file='document.pdf',
    file_search_store_name=store.name,
    config={
        'custom_metadata': [
            {'key': 'author', 'string_value': 'John Doe'},
            {'key': 'category', 'string_value': 'Technical'},
            {'key': 'version', 'numeric_value': 2},
            {'key': 'is_public', 'boolean_value': True},
            {'key': 'created_date', 'string_value': '2025-11-10'}
        ]
    }
)

# 향후 메타데이터 필터링 쿼리 지원 예정
# filter="category='Technical' AND version > 1"
```

### 5. 오류 처리 및 재시도

```python
from google.api_core.exceptions import (
    GoogleAPIError,
    InvalidArgument,
    ResourceExhausted
)
import time

def upload_with_retry(file, store_name, max_retries=3):
    """재시도 로직이 포함된 업로드"""

    for attempt in range(max_retries):
        try:
            operation = client.file_search_stores.upload_to_file_search_store(
                file=file,
                file_search_store_name=store_name
            )

            # 완료 대기
            while not operation.done:
                time.sleep(5)
                operation = client.operations.get(operation)

            # 성공 시 에러 확인
            if hasattr(operation, 'error'):
                raise Exception(f"Upload failed: {operation.error}")

            print(f"✓ {file} uploaded successfully")
            return operation

        except ResourceExhausted as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 지수 백오프
                print(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"✗ {file} failed after {max_retries} attempts")
                raise

        except InvalidArgument as e:
            print(f"✗ Invalid file: {e}")
            raise  # 재시도해도 실패할 것이므로 즉시 종료

        except GoogleAPIError as e:
            if attempt < max_retries - 1:
                print(f"API error. Retrying... ({attempt + 1}/{max_retries})")
                time.sleep(5)
            else:
                print(f"✗ {file} failed: {e}")
                raise

# 사용
try:
    upload_with_retry('large_document.pdf', store.name)
except Exception as e:
    print(f"Upload failed: {e}")
```

### 6. 배치 업로드 (병렬 처리)

```python
import concurrent.futures
from tqdm import tqdm

def batch_upload_parallel(files, store_name, max_workers=5):
    """여러 파일을 병렬로 업로드"""

    def upload_and_wait(file):
        try:
            operation = client.file_search_stores.upload_to_file_search_store(
                file=file,
                file_search_store_name=store_name
            )

            while not operation.done:
                time.sleep(5)
                operation = client.operations.get(operation)

            return (file, True, None)

        except Exception as e:
            return (file, False, str(e))

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(upload_and_wait, file): file for file in files}

        with tqdm(total=len(files), desc="Uploading") as pbar:
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                results.append(result)
                pbar.update(1)

    # 결과 요약
    success = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]

    print(f"\n✓ Success: {len(success)}/{len(files)}")
    if failed:
        print(f"✗ Failed: {len(failed)}")
        for file, _, error in failed:
            print(f"  - {file}: {error}")

    return results

# 사용
files = [f'doc_{i}.pdf' for i in range(20)]
batch_upload_parallel(files, store.name, max_workers=5)
```

## 문제 해결

### 문제 1: "Operation timed out" 에러

**증상**: 파일 업로드 후 오랫동안 완료되지 않음

**해결**:
```python
import time

def wait_for_operation(operation, timeout=600):  # 10분 타임아웃
    start_time = time.time()

    while not operation.done:
        elapsed = time.time() - start_time
        if elapsed > timeout:
            raise TimeoutError(f"Operation timed out after {timeout}s")

        print(f"Waiting... ({int(elapsed)}s elapsed)")
        time.sleep(10)  # 10초마다 체크
        operation = client.operations.get(operation)

    return operation

# 사용
operation = client.file_search_stores.upload_to_file_search_store(...)
try:
    operation = wait_for_operation(operation, timeout=600)
    print("Upload complete!")
except TimeoutError as e:
    print(f"Error: {e}")
```

### 문제 2: "No relevant documents found" 에러

**증상**: 쿼리 시 관련 문서를 찾지 못함

**해결 방법**:

1. **쿼리 개선**:
```python
# 나쁜 예
query = "설치"

# 좋은 예
query = "이 제품의 초기 설치 절차와 필요한 시스템 요구사항은 무엇인가요?"
```

2. **문서 확인**:
```python
# Store에 파일이 있는지 확인
for file in client.file_search_stores.list_files(
    file_search_store_name=store.name
):
    print(f"File: {file.display_name}")
```

3. **청킹 조정**:
```python
# 더 작은 청크로 재업로드
operation = client.file_search_stores.upload_to_file_search_store(
    file='document.pdf',
    file_search_store_name=store.name,
    config={
        'chunking_config': {
            'white_space_config': {
                'max_tokens_per_chunk': 200,  # 기본 400에서 감소
                'max_overlap_tokens': 40      # 더 많은 오버랩
            }
        }
    }
)
```

### 문제 3: API 키 관련 오류

**증상**: "API key not valid" 또는 "Unauthorized"

**해결**:
```python
import os

# 1. 환경 변수 확인
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not set")
else:
    print(f"API Key found: {api_key[:10]}...")

# 2. 직접 지정
from google import genai
client = genai.Client(api_key="your-actual-key-here")

# 3. API 키 테스트
try:
    stores = list(client.file_search_stores.list())
    print("API key is valid!")
except Exception as e:
    print(f"API key error: {e}")
```

### 문제 4: "File size exceeds limit"

**증상**: 100MB 이상 파일 업로드 실패

**해결**: 파일 분할
```python
from PyPDF2 import PdfReader, PdfWriter

def split_pdf(input_file, max_pages=50):
    """PDF를 여러 파일로 분할"""
    reader = PdfReader(input_file)
    total_pages = len(reader.pages)

    for i in range(0, total_pages, max_pages):
        writer = PdfWriter()

        for page_num in range(i, min(i + max_pages, total_pages)):
            writer.add_page(reader.pages[page_num])

        output_file = f"{input_file[:-4]}_part{i//max_pages + 1}.pdf"
        with open(output_file, 'wb') as output:
            writer.write(output)

        print(f"Created: {output_file}")

# 사용
split_pdf('large_document.pdf', max_pages=50)

# 분할된 파일들 업로드
import glob
for part_file in glob.glob('large_document_part*.pdf'):
    upload_with_retry(part_file, store.name)
```

### 문제 5: Store 할당량 초과

**증상**: "FileSearchStore quota exceeded"

**해결**:
```python
# 1. Store 목록 확인
stores = list(client.file_search_stores.list())
print(f"Total stores: {len(stores)}")

# 2. 사용하지 않는 Store 삭제
for store in stores:
    # 오래된 Store 삭제 (예: 생성일 기준)
    created = store.create_time
    if should_delete(created):  # 사용자 정의 함수
        client.file_search_stores.delete(
            name=store.name,
            config={'force': True}
        )
        print(f"Deleted: {store.display_name}")

# 3. Store 내 파일 정리
for file in client.file_search_stores.list_files(
    file_search_store_name=store.name
):
    if should_delete_file(file):
        client.file_search_stores.delete_file(
            file_search_store_name=store.name,
            file_name=file.name
        )
```

## 추가 팁

### 프롬프트 엔지니어링

**효과적인 쿼리 작성**:
```python
# 기본 쿼리
"제품 가격은?"

# 개선된 쿼리
"""
업로드된 제품 문서를 참고하여 다음 질문에 답변해주세요:
1. 제품의 가격 정보
2. 사용 가능한 할인 옵션
3. 구독 플랜이 있는 경우 상세 내용

각 정보에 대해 출처 문서를 명시해주세요.
"""
```

### 성능 최적화

```python
# 1. 적절한 모델 선택
# gemini-2.5-flash: 빠르고 저렴 (일반적인 질의응답)
# gemini-2.5-pro: 복잡한 분석 및 추론

# 2. 온도 조정
config = types.GenerateContentConfig(
    temperature=0.2,  # 일관된 답변 (고객 지원)
    # temperature=0.7,  # 창의적인 답변 (브레인스토밍)
)

# 3. Store 크기 관리 (20GB 이하 권장)
```

---

**마지막 업데이트**: 2025-11-10
