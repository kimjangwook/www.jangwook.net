#!/usr/bin/env python3
"""
Gemini File Search - 웹 애플리케이션 (Streamlit)

이 앱은 File Search Tool을 위한 간단한 웹 인터페이스를 제공합니다:
- 파일 업로드 UI
- 대화형 질의응답
- Store 관리
- 인용 출처 표시

실행 방법:
  streamlit run web_app.py
"""

import os
import time
import uuid
import streamlit as st
from google import genai
from google.genai import types

# 페이지 설정
st.set_page_config(page_title="Gemini File Search", page_icon="🔍", layout="wide")

# 세션 상태 초기화
if "client" not in st.session_state:
    st.session_state.client = None
if "store" not in st.session_state:
    st.session_state.store = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []


def initialize_client(api_key):
    """클라이언트 초기화"""
    try:
        # 환경 변수에 API 키 설정
        os.environ["GEMINI_API_KEY"] = api_key
        client = genai.Client()
        return client, None
    except Exception as e:
        return None, str(e)


def create_store(client, store_name):
    """새로운 Store 생성"""
    try:
        store = client.file_search_stores.create(config={"display_name": store_name})
        return store, None
    except Exception as e:
        return None, str(e)


def upload_file(client, file, store_name):
    """파일 업로드"""
    try:
        # 안전한 임시 파일명 생성 (UUID + 확장자)
        file_ext = os.path.splitext(file.name)[1]
        temp_file = f"temp_{uuid.uuid4().hex}{file_ext}"

        with open(temp_file, "wb") as f:
            f.write(file.getbuffer())

        # 업로드
        operation = client.file_search_stores.upload_to_file_search_store(
            file=temp_file,
            file_search_store_name=store_name,
            config={
                "display_name": file.name,
                "chunking_config": {
                    "white_space_config": {
                        "max_tokens_per_chunk": 400,
                        "max_overlap_tokens": 40,
                    }
                },
            },
        )

        # 완료 대기
        while not operation.done:
            time.sleep(2)
            operation = client.operations.get(operation)

        # 임시 파일 삭제
        if os.path.exists(temp_file):
            os.remove(temp_file)

        return True, None

    except Exception as e:
        return False, str(e)


def query_store(client, question, store_name):
    """Store에 쿼리"""
    try:
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
                temperature=0.2,
            ),
        )

        # 인용 정보 추출
        citations = []
        if hasattr(response, "grounding_metadata") and response.grounding_metadata:
            if hasattr(response.grounding_metadata, "citations"):
                for citation in response.grounding_metadata.citations:
                    citations.append(
                        {
                            "source": getattr(citation, "source", "N/A"),
                            "text": getattr(citation, "text", "")[:100],
                        }
                    )

        return response.text, citations, None

    except Exception as e:
        return None, None, str(e)


# UI 구성
st.title("🔍 Gemini File Search")
st.markdown(
    "Google Gemini API의 File Search Tool을 사용한 문서 검색 및 질의응답 시스템"
)

# 사이드바 - 설정 및 Store 관리
with st.sidebar:
    st.header("⚙️ 설정")

    # API 키 입력
    api_key = st.text_input(
        "Gemini API Key",
        type="password",
        value=os.getenv("GEMINI_API_KEY", ""),
        help="Google AI Studio에서 발급받은 API 키를 입력하세요",
    )

    if api_key and not st.session_state.client:
        client, error = initialize_client(api_key)
        if client:
            st.session_state.client = client
            st.success("✓ 클라이언트 초기화 완료")
        else:
            st.error(f"초기화 실패: {error}")

    st.divider()

    # Store 관리
    if st.session_state.client:
        st.header("📁 Store 관리")

        # 기존 Store 목록
        with st.expander("기존 Store 목록", expanded=False):
            try:
                stores = list(st.session_state.client.file_search_stores.list())
                if stores:
                    for store in stores:
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.text(store.display_name)
                        with col2:
                            if st.button("선택", key=f"select_{store.name}"):
                                st.session_state.store = store
                                st.rerun()
                else:
                    st.info("Store가 없습니다")
            except Exception as e:
                st.error(f"Store 조회 실패: {e}")

        # 새 Store 생성
        with st.expander("새 Store 생성", expanded=True):
            new_store_name = st.text_input("Store 이름", value="My Knowledge Base")
            if st.button("생성", key="create_store"):
                with st.spinner("Store 생성 중..."):
                    store, error = create_store(st.session_state.client, new_store_name)
                    if store:
                        st.session_state.store = store
                        st.success(f"✓ Store 생성 완료: {store.name}")
                        st.rerun()
                    else:
                        st.error(f"생성 실패: {error}")

        # 현재 선택된 Store
        if st.session_state.store:
            st.divider()
            st.success(f"**현재 Store:**\n{st.session_state.store.display_name}")

            # Store의 파일 목록
            with st.expander("파일 목록", expanded=False):
                try:
                    files = list(
                        st.session_state.client.file_search_stores.list_files(
                            file_search_store_name=st.session_state.store.name
                        )
                    )
                    if files:
                        for file in files:
                            st.text(f"📄 {file.display_name}")
                    else:
                        st.info("파일이 없습니다")
                except Exception as e:
                    st.error(f"파일 조회 실패: {e}")

# 메인 영역
if not st.session_state.client:
    st.info("👈 왼쪽 사이드바에서 API 키를 입력해주세요")
    st.stop()

if not st.session_state.store:
    st.info("👈 왼쪽 사이드바에서 Store를 선택하거나 생성해주세요")
    st.stop()

# 탭으로 기능 분리
tab1, tab2 = st.tabs(["💬 질의응답", "📤 파일 업로드"])

# 질의응답 탭
with tab1:
    st.header("질의응답")

    # 채팅 히스토리 표시
    for chat in st.session_state.chat_history:
        with st.chat_message("user"):
            st.write(chat["question"])

        with st.chat_message("assistant"):
            st.write(chat["answer"])

            if chat.get("citations"):
                with st.expander("📚 인용 출처"):
                    for i, citation in enumerate(chat["citations"], 1):
                        st.markdown(f"**{i}. {citation['source']}**")
                        st.text(f"   {citation['text']}...")

    # 질문 입력
    question = st.chat_input("질문을 입력하세요...")

    if question:
        # 사용자 질문 표시
        with st.chat_message("user"):
            st.write(question)

        # 답변 생성
        with st.chat_message("assistant"):
            with st.spinner("답변 생성 중..."):
                answer, citations, error = query_store(
                    st.session_state.client, question, st.session_state.store.name
                )

                if answer:
                    st.write(answer)

                    if citations:
                        with st.expander("📚 인용 출처"):
                            for i, citation in enumerate(citations, 1):
                                st.markdown(f"**{i}. {citation['source']}**")
                                st.text(f"   {citation['text']}...")

                    # 히스토리에 추가
                    st.session_state.chat_history.append(
                        {"question": question, "answer": answer, "citations": citations}
                    )
                else:
                    st.error(f"오류: {error}")

    # 히스토리 초기화
    if st.session_state.chat_history:
        if st.button("대화 초기화"):
            st.session_state.chat_history = []
            st.rerun()

# 파일 업로드 탭
with tab2:
    st.header("파일 업로드")

    uploaded_files = st.file_uploader(
        "파일을 선택하세요",
        accept_multiple_files=True,
        type=["pdf", "txt", "docx", "md", "csv"],
        help="PDF, TXT, DOCX, Markdown, CSV 파일을 업로드할 수 있습니다",
    )

    if uploaded_files:
        if st.button("업로드 시작", type="primary"):
            progress_bar = st.progress(0)
            status_text = st.empty()

            for i, file in enumerate(uploaded_files):
                status_text.text(f"업로드 중: {file.name}")

                success, error = upload_file(
                    st.session_state.client, file, st.session_state.store.name
                )

                if success:
                    st.success(f"✓ {file.name}")
                else:
                    st.error(f"✗ {file.name}: {error}")

                progress_bar.progress((i + 1) / len(uploaded_files))

            status_text.text("업로드 완료!")
            time.sleep(1)
            st.rerun()

# 푸터
st.divider()
st.markdown(
    """
<div style='text-align: center; color: gray;'>
    <small>
    Powered by Google Gemini API File Search Tool |
    <a href='https://ai.google.dev/gemini-api/docs/file-search' target='_blank'>문서</a> |
    <a href='https://aistudio.google.com' target='_blank'>API 키 발급</a>
    </small>
</div>
""",
    unsafe_allow_html=True,
)
