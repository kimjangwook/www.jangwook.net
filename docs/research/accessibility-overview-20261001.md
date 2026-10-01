# 접근성 시리즈 개요 조사·편집 근거

확인일: 2026-10-01. 요청 범위: 첫 개요의 한국어 조사 및 로컬 초안. 항목별 후속 글 집필·번역·발행·외부 전송은 포함하지 않음.

## 글의 역할과 편집 판단

- 독자가 자신의 서비스에서 평가할 이용 과정 하나를 선택하고, 상태별 증거 수집 계획을 만들도록 안내한다.
- 가입 과정은 설명용 가상 사례이며 고객 경험·직접 측정으로 서술하지 않는다.
- 장애가 있는 이용자의 접근 요구를 먼저 설명하고 일시적·상황적 제약의 이점은 부가 설명으로 둔다.
- WCAG 설명 → 상태와 이용 과정 → AI 평가의 입력과 동작 → 연구 → 평가 계획 실습 → 후속 학습 순서.
- 멀티모달 AI와 도구 연결로 평가 범위를 확장한다. 입력 부재, 실행 실패, 모델의 해석 실패를 구별한다. 사람만 평가할 수 있는 기준 목록을 고정하지 않는다.
- WCAG 2.2 AA에서 작업 목표를 검토하기 시작하는 방법, 개선 우선순위와 결과 기록 양식은 필자의 제안이다.
- 개요 프롬프트는 평가 계획 작성용이다. 모델 비교나 실제 실행을 수행하지 않았으며 정확도·실효성을 검증했다고 표시하지 않는다.
- 사이트에서는 정본 본문과 정본 프롬프트가 함께 SSR 렌더링된다. 독립 검토 Markdown에는 같은 프롬프트를 전체 삽입해 다른 도구에서도 읽고 복사할 수 있게 했다.

## 주요 주장과 근거

| 주장 | 원출처와 확인한 위치 | 빠진 배경·적용 범위 | 초안의 처리 |
| --- | --- | --- | --- |
| 접근성은 장애가 있는 이용자가 정보와 기능을 이용하도록 설계하는 일 | WAI Introduction, What is Web Accessibility | 다양한 장애와 사용 방식. 일반적 편의만으로 정의하지 않음 | 정의와 가입 사례를 연결 |
| 네 원칙을 통해 성공 기준의 목적을 이해할 수 있음 | WAI Accessibility Principles | 표의 질문과 가입 사례는 필자의 교육용 구성 | 원칙 설명과 사례 표 |
| WCAG 2.2에는 유효 기준 86개가 있음 | WCAG22 정본의 성공 기준 heading과 Level, New in 2.2 | 라이브 HTML에는 삭제된 4.1.1 heading도 남아 총 87개. 삭제 항목 제외 시 A31/AA24/AAA31 | 86개와 삭제 조건을 명시 |
| AA는 A와 AA를 포함. 전체 사이트 AAA를 일반 정책으로 요구하지 않도록 권고 | Understanding Conformance, Requirement 1 | 수준을 난이도·심각도와 등치하지 않음. 프로젝트 목표는 개별 결정 | 수준 설명과 필자의 AA 시작 제안을 분리 |
| 전체 페이지와 완전한 과정이 적합성 범위에 포함됨 | WCAG22 §5.2.2, §5.2.3 | 일부 검사 점수만으로 적합성 선언 불가 | 초기 화면·팝업·오류·완료 상태 구분 |
| 평가 범위와 대표 표본, 결과 보고를 정할 수 있음 | WCAG-EM 2.0 §§1,5,6 | 2026-07-23 Group Note이며 WCAG의 요구를 대체하는 규범 표준이 아님 | 평가 방법론으로 소개, 표본과 전체 범위 구분 |
| 도구의 검사 범위와 판정의 정확성을 확인해야 함 | Selecting Evaluation Tools, What Tools Can Do | 도구 하나의 결과를 전체 접근성으로 확대하지 않음 | 현재 공식 설명과 AI 확장 방향을 연결 |
| 대체 텍스트는 이미지의 기능과 문맥에 따라 결정 | An alt Decision Tree | 장식 이미지와 기능 이미지의 정보 필요가 다름 | 배송 트럭은 가상 예시, AI 성능은 검증 대상으로 둠 |
| MLLM을 감사 과정에 활용한 연구가 있음 | Gu 외, arXiv 2511.03471v1, abstract/본문 | 2025-11-05 제출. 표본 선정과 감사 지원 연구이며 이 시리즈 실행 결과가 아님 | 구조만 소개, 논문 실험 수치의 상세 비교는 생략 |
| 기준별 에이전트가 기존 검사보다 보고된 문제 기록을 더 찾을 수 있음 | Mishra 외, arXiv 2609.09379v2, §§4,6,9 | 프리프린트. 11플랫폼/24저장페이지/250페이지·기준 기록. 긍정78중67: recall86%, precision56%. 40구현 기준 중 긍정 사례15. 음성은 보고서의 미언급으로 추론. 개발 노출·실제 서비스와 차이·새 페이지 일반화 제한 | 페이지·기준 기록 단위와 한계를 함께 서술. 모든 사이트의 탐지율이나 실제 문제 단위 성과로 해석하지 않음 |
| 이용자 참여로 기준 외 사용 문제를 살펴볼 수 있음 | Involving Users in Evaluating Web Accessibility | 실제 참여와 AI 사용자 관점 추정은 다른 증거 | 학습 끝에 병행할 평가를 안내 |

## 직접 확인한 기준 개수

2026-10-01 Node fetch로 WCAG22 정본 HTTP 200 확인 후 JSDOM으로 성공 기준 h4와 기준별 Level을 추출했다. 삭제 표기가 있는 4.1.1을 제외한 결과: 86개, A31/AA24/AAA31. 기존 저장소의 기준 JSON 및 manifest와 일치했다. 표본 파일만 읽은 추정이 아닌 정본 HTML 확인이다.

## 확인한 원출처

- https://www.w3.org/WAI/fundamentals/accessibility-intro/
- https://www.w3.org/WAI/fundamentals/accessibility-principles/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/conformance
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- https://www.w3.org/TR/wcag-em-2/
- https://www.w3.org/WAI/test-evaluate/tools/selecting/
- https://www.w3.org/WAI/tutorials/images/decision-tree/
- https://arxiv.org/abs/2511.03471
- https://arxiv.org/html/2511.03471v1
- https://arxiv.org/abs/2609.09379
- https://arxiv.org/html/2609.09379v2
- https://www.w3.org/WAI/test-evaluate/involving-users/

추가 조사 후보였던 arXiv 2605.27716은 초록의 출처와 내용을 확인했지만 개요에서 수치나 성과를 사용하지 않았다. 글의 근거는 위 원출처로 제한했다.
