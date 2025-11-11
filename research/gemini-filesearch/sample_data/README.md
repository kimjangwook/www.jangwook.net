# 샘플 데이터

이 디렉토리에는 File Search Tool을 테스트하기 위한 샘플 데이터가 포함되어 있습니다.

## 파일 목록

### 1. product_manual.txt
제품 사용 설명서 샘플
- 설치 방법
- 시스템 요구사항
- 보증 정책
- 고객 지원 정보

### 2. faq.txt
자주 묻는 질문 (FAQ)
- 환불 정책
- 배송 정보
- 기술 지원
- 계정 관리

### 3. technical_documentation.txt
기술 문서
- API 사용법
- 코드 예제
- 문제 해결 가이드

## 사용 방법

### 기본 예제에서 사용
```bash
cd demo
python basic_example.py

# 또는 샘플 데이터 명시적으로 사용
python basic_example.py --file ../sample_data/product_manual.txt
```

### 고급 예제에서 사용
```bash
cd demo
python advanced_example.py

# 샘플 데이터 디렉토리 지정
python advanced_example.py --data-dir ../sample_data
```

### 웹 앱에서 사용
```bash
cd demo
streamlit run web_app.py

# 웹 UI에서 sample_data 폴더의 파일을 직접 업로드
```

## 자신의 데이터 추가

이 디렉토리에 자신의 문서를 추가할 수 있습니다:

```bash
cp your_document.pdf sample_data/
cd demo
python basic_example.py --file ../sample_data/your_document.pdf
```

## 지원 파일 형식

- **텍스트**: .txt, .md
- **문서**: .pdf, .docx, .doc
- **스프레드시트**: .xlsx, .csv
- **프레젠테이션**: .pptx
- **코드**: .py, .js, .java, .cpp 등
- **데이터**: .json, .xml, .yaml

자세한 내용은 [공식 문서](https://ai.google.dev/gemini-api/docs/file-search)를 참조하세요.
