#!/usr/bin/env python3
"""
Gemini File Search - 기본 예제

이 스크립트는 File Search Tool의 기본 사용법을 보여줍니다:
1. File Search Store 생성
2. 파일 업로드 및 인덱싱
3. 간단한 질의응답
4. Store 관리 (조회, 삭제)
"""

import os
import time
from google import genai
from google.genai import types


# API 키 확인
def check_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY environment variable not set")
        print("\nPlease set your API key:")
        print("  export GEMINI_API_KEY='your-api-key-here'")
        print("\nOr create a .env file with:")
        print("  GEMINI_API_KEY=your-api-key-here")
        exit(1)
    print(f"✓ API Key found: {api_key[:10]}...")
    return api_key


def main():
    print("=" * 60)
    print("Gemini File Search - 기본 예제")
    print("=" * 60)
    print()

    # API 키 확인
    check_api_key()

    # 클라이언트 초기화
    print("1. 클라이언트 초기화")
    client = genai.Client()
    print("   ✓ Client initialized")
    print()

    # Store 생성
    print("2. File Search Store 생성")
    store_name = "Basic Example Store"
    store = client.file_search_stores.create(config={"display_name": store_name})
    print(f"   ✓ Store created: {store.name}")
    print(f"   Display name: {store.display_name}")
    print()

    # 샘플 파일 생성 (데모용)
    print("3. 샘플 파일 생성")
    sample_file = "sample_document.txt"
    with open(sample_file, "w", encoding="utf-8") as f:
        f.write(
            """
제품 설명서

제품명: SuperWidget Pro
버전: 2.0

설치 방법:
1. 패키지를 다운로드합니다.
2. 압축을 해제합니다.
3. install.sh 스크립트를 실행합니다.
   $ ./install.sh
4. 설치가 완료되면 재부팅합니다.

시스템 요구사항:
- OS: Linux, macOS, Windows 10+
- RAM: 최소 4GB (권장 8GB)
- 디스크 공간: 500MB

보증 정책:
제품 구매일로부터 1년간 무상 보증이 제공됩니다.
하드웨어 결함 또는 제조 결함이 있는 경우 무상 수리 또는 교체해드립니다.

고객 지원:
- 이메일: support@superwidget.com
- 전화: 1588-1234 (평일 9:00-18:00)
- 온라인 채팅: www.superwidget.com/support
        """
        )
    print(f"   ✓ Sample file created: {sample_file}")
    print()

    # 파일 업로드
    print("4. 파일 업로드 및 인덱싱")
    print("   Uploading file...")
    operation = client.file_search_stores.upload_to_file_search_store(
        file=sample_file,
        file_search_store_name=store.name,
        config={
            "display_name": "Product Manual",
            "chunking_config": {
                "white_space_config": {
                    "max_tokens_per_chunk": 200,
                    "max_overlap_tokens": 20,
                }
            },
        },
    )

    # 업로드 완료 대기
    print("   Indexing file...", end="", flush=True)
    while not operation.done:
        print(".", end="", flush=True)
        time.sleep(2)
        operation = client.operations.get(operation)

    print()
    print("   ✓ File indexed successfully")
    print()

    # 질문하기
    print("5. 질의응답 테스트")
    questions = [
        "이 제품의 설치 방법은 무엇인가요?",
        "보증 기간은 얼마나 되나요?",
        "시스템 요구사항을 알려주세요.",
        "고객 지원은 어떻게 받나요?",
    ]

    for i, question in enumerate(questions, 1):
        print(f"\n   질문 {i}: {question}")

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
                ],
                temperature=0.2,
            ),
        )

        print(f"   답변: {response.text}")

    print()

    # Store 관리
    print("6. Store 관리")
    print("\n   모든 Store 목록:")
    for store_item in client.file_search_stores.list():
        print(f"   - {store_item.display_name} ({store_item.name})")

    print("\n   현재 Store의 파일 목록:")
    for file in client.file_search_stores.list_files(file_search_store_name=store.name):
        print(f"   - {file.display_name}")

    print()

    # 정리
    print("7. 정리")
    cleanup = input("   Store를 삭제하시겠습니까? (y/n): ").lower()
    if cleanup == "y":
        print("   Deleting store...")
        client.file_search_stores.delete(name=store.name, config={"force": True})
        print("   ✓ Store deleted")

        # 샘플 파일 삭제
        if os.path.exists(sample_file):
            os.remove(sample_file)
            print(f"   ✓ Sample file removed: {sample_file}")
    else:
        print(f"   Store 유지: {store.name}")
        print(f"   나중에 삭제하려면:")
        print(
            f"   client.file_search_stores.delete(name='{store.name}', config={{'force': True}})"
        )

    print()
    print("=" * 60)
    print("예제 완료!")
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
