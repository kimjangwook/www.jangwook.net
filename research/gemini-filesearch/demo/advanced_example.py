#!/usr/bin/env python3
"""
Gemini File Search - 고급 예제

이 스크립트는 File Search Tool의 고급 기능을 보여줍니다:
1. 커스텀 청킹 설정
2. 메타데이터 활용
3. 배치 파일 업로드
4. 인용 출처 추적
5. 에러 처리 및 재시도
"""

import os
import time
import concurrent.futures
from google import genai
from google.genai import types
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted

def check_api_key():
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not set")
        exit(1)
    return api_key

def create_sample_files():
    """데모용 샘플 파일 생성"""
    files = {
        'faq_general.txt': """
FAQ - 일반 질문

Q: 제품 환불이 가능한가요?
A: 구매 후 30일 이내에 미사용 제품에 한해 전액 환불이 가능합니다.

Q: 배송 기간은 얼마나 걸리나요?
A: 주문 확정 후 2-3 영업일 내에 배송됩니다.

Q: 해외 배송이 가능한가요?
A: 현재 국내 배송만 지원합니다.
        """,

        'faq_technical.txt': """
FAQ - 기술 지원

Q: 비밀번호를 잊어버렸어요.
A: 로그인 페이지에서 "비밀번호 찾기"를 클릭하여 재설정하세요.

Q: 앱이 실행되지 않아요.
A: 최신 버전으로 업데이트하고, 재부팅 후 다시 시도해보세요.

Q: 데이터를 백업하려면?
A: 설정 > 백업 > 지금 백업하기를 선택하세요.
        """,

        'manual_installation.txt': """
설치 매뉴얼

1. 사전 준비
   - Python 3.9 이상 설치
   - pip 최신 버전 업데이트

2. 설치 방법
   $ pip install superwidget

3. 초기 설정
   $ superwidget init
   $ superwidget config --api-key YOUR_KEY

4. 실행 확인
   $ superwidget --version
        """
    }

    for filename, content in files.items():
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

    return list(files.keys())

def upload_with_retry(client, file, store_name, max_retries=3):
    """재시도 로직이 포함된 업로드"""
    for attempt in range(max_retries):
        try:
            operation = client.file_search_stores.upload_to_file_search_store(
                file=file,
                file_search_store_name=store_name,
                config={
                    'display_name': file,
                    'chunking_config': {
                        'white_space_config': {
                            'max_tokens_per_chunk': 200,
                            'max_overlap_tokens': 20
                        }
                    },
                    'custom_metadata': [
                        {'key': 'type', 'string_value': 'faq' if 'faq' in file else 'manual'},
                        {'key': 'language', 'string_value': 'ko'},
                        {'key': 'version', 'numeric_value': 1}
                    ]
                }
            )

            # 완료 대기
            while not operation.done:
                time.sleep(2)
                operation = client.operations.get(operation)

            return (file, True, None)

        except ResourceExhausted:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"      Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                return (file, False, "Rate limit exceeded")

        except GoogleAPIError as e:
            return (file, False, str(e))

def batch_upload_parallel(client, files, store_name, max_workers=3):
    """여러 파일을 병렬로 업로드"""
    results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(upload_with_retry, client, file, store_name): file
            for file in files
        }

        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)

    return results

def search_with_citations(client, question, store_name):
    """인용 출처를 추적하는 검색"""
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
            ],
            temperature=0.2
        )
    )

    print(f"\n답변:\n{response.text}\n")

    # 인용 출처 확인
    if hasattr(response, 'grounding_metadata') and response.grounding_metadata:
        print("=== 인용 출처 ===")
        if hasattr(response.grounding_metadata, 'citations'):
            for idx, citation in enumerate(response.grounding_metadata.citations, 1):
                print(f"{idx}. 출처: {getattr(citation, 'source', 'N/A')}")
                if hasattr(citation, 'text'):
                    print(f"   인용: {citation.text[:80]}...")
                if hasattr(citation, 'confidence'):
                    print(f"   신뢰도: {citation.confidence:.2%}")
    else:
        print("(인용 메타데이터 없음)")

def main():
    print("=" * 60)
    print("Gemini File Search - 고급 예제")
    print("=" * 60)
    print()

    # API 키 확인
    check_api_key()
    client = genai.Client()
    print("✓ Client initialized\n")

    # Store 생성
    print("1. File Search Store 생성")
    store = client.file_search_stores.create(
        config={'display_name': 'Advanced Example Store'}
    )
    print(f"   ✓ Store: {store.name}\n")

    # 샘플 파일 생성
    print("2. 샘플 파일 생성")
    files = create_sample_files()
    for file in files:
        print(f"   ✓ {file}")
    print()

    # 배치 업로드 (병렬)
    print("3. 배치 업로드 (병렬 처리)")
    print("   Uploading files...")
    results = batch_upload_parallel(client, files, store.name, max_workers=3)

    success = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]

    print(f"\n   ✓ Success: {len(success)}/{len(files)}")
    if failed:
        print(f"   ✗ Failed: {len(failed)}")
        for file, _, error in failed:
            print(f"     - {file}: {error}")
    print()

    # 메타데이터 확인
    print("4. 업로드된 파일 메타데이터 확인")
    for file in client.file_search_stores.list_files(
        file_search_store_name=store.name
    ):
        print(f"   - {file.display_name}")
        if hasattr(file, 'metadata'):
            print(f"     메타데이터: {file.metadata}")
    print()

    # 인용 출처 추적 쿼리
    print("5. 인용 출처 추적 쿼리")

    questions = [
        "환불 정책을 알려주세요.",
        "비밀번호를 재설정하는 방법은?",
        "제품 설치는 어떻게 하나요?"
    ]

    for i, question in enumerate(questions, 1):
        print(f"\n{'=' * 60}")
        print(f"질문 {i}: {question}")
        print('=' * 60)
        search_with_citations(client, question, store.name)

    # 고급 쿼리 - 여러 문서를 종합
    print("\n" + "=" * 60)
    print("6. 종합 분석 쿼리")
    print("=" * 60)

    complex_query = """
    업로드된 모든 문서를 참고하여 다음 질문에 답변해주세요:

    1. 이 제품의 주요 기능은 무엇인가요?
    2. 고객이 자주 묻는 질문(FAQ) 상위 3가지는?
    3. 기술 지원이 필요한 경우 어떻게 해야 하나요?

    각 답변에 출처를 명시해주세요.
    """

    search_with_citations(client, complex_query, store.name)

    # 정리
    print("\n" + "=" * 60)
    print("7. 정리")
    print("=" * 60)

    cleanup = input("\nStore와 샘플 파일을 삭제하시겠습니까? (y/n): ").lower()
    if cleanup == 'y':
        # Store 삭제
        client.file_search_stores.delete(
            name=store.name,
            config={'force': True}
        )
        print("✓ Store deleted")

        # 샘플 파일 삭제
        for file in files:
            if os.path.exists(file):
                os.remove(file)
        print("✓ Sample files removed")
    else:
        print(f"Store 유지: {store.name}")

    print("\n" + "=" * 60)
    print("고급 예제 완료!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
