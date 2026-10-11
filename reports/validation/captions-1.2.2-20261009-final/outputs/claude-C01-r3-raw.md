# C01 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **pass**. 범위 안의 유일한 매체 M1(31.2초 녹화 교육 영상)의 음성 6구간과 정보성 경고음 2회를, 독립 전사(SOURCE-ASR)·화자 역할 상관(SOURCE-AUDIO)·경고음 측정(SOURCE-SOUND)·페이지 범례(PAGE-C01)와 대조한 결과, 7개 폐쇄 자막 큐(A1·B1·A2·SFX·A3·A4·A5)가 모두 의미·부정·조건·화자·소리를 동등하게 전달하고 시간도 원본 구간과 맞습니다. 브라우저 처리 기록(DELIVERY-C01)과 제가 직접 Read한 PNG 3장(DISPLAY-C01-1~3, 9개 시점)에서 모든 큐가 실제 표시되며 영상 안의 지시 문구·버튼을 가리지 않음을 확인했습니다(자막이 영상 내부 진행 막대 일부와 겹치나 같은 정보가 "n / 7"로 별도 표시됨). 다만 평가 모델은 직접 청취·연속 재생을 하지 않았고, 전체 구간 판단은 제공된 파생 기록(전 프레임 디코드·정적 화면 7개 구조 검증)에 의존합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C01 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. Chromium에서 한국어 captions 트랙 mode=showing 상태로 처리된 기록 기준.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "pass",
    "reason": "범위 내 매체 1개(M1)의 모든 대사 6구간과 정보성 경고음이 동기화된 폐쇄 자막 7큐로 동등하게 제공되며, 표시 PNG에서 모든 큐가 실제로 보이고 중요한 시각 정보를 가리지 않음. 미검토 구간·해결되지 않은 충돌 없음(직접 청취가 아닌 파생 기록 검토라는 한계는 limits에 기록)."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C01", "PAGE-C01", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"],
    "derived_processing_and_limits": [
      "SOURCE-ASR: faster-whisper large-v3로 원본 MP4 전체 음성(0–31.19s)을 독립 전사. 후보 자막 미사용. ASR은 정답 보장이 아님.",
      "SOURCE-AUDIO: 6개 격리 원본 녹음과의 정규화 상관(0.9989–0.99976)으로 구간과 화자 역할(안내자/사용자) 확인. 일반 화자 분리 성능 증거는 아님.",
      "SOURCE-SOUND: FFT로 800–950Hz 펄스 2회(12.2–12.4, 12.62–12.82s) 측정. 의미(보안 확인 실패)는 페이지 문구 PAGE-C01에서 옴.",
      "SOURCE-VISUAL/ENCODE-LINK: 749프레임 전부 디코드, 정적 화면 7개와 진행 막대만 변하는 구조 검증. 9개 시점 PNG로 각 큐 표시 확인.",
      "DISPLAY-C01-1~3: 평가 모델이 실제 Read로 9개 시점(2, 5, 9.4, 12.5, 15, 17.8, 22, 25, 28.3s) 화면을 검토. 연속 재생 아님."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C01", "SOURCE-ASR", "SOURCE-SOUND", "PAGE-C01"],
    "execution": "run",
    "decision": "pass",
    "reason": "대사 6개와 경고음 2회가 각각 동등한 자막 큐로 원본 시간과 맞춰 표시되고, 부정('아니요', '버리지 마세요')·조건('저장하기 전에는', '새로 발급하면')·화자·소리 의미가 보존됨.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": ["PAGE-C01"]},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"], "reason": "원본 음성 전체 전사·상관, 전체 큐 목록, 전 프레임 디코드와 정적 화면 7개 구조, 각 큐 활성 시점 PNG의 교집합. 31.19–31.21s는 디코드 음성 길이와 메타데이터 길이 차(0.02s)로 내용 없음."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "track cue A1, line 76(하단)", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "첫 단계 안내를 동시에 읽을 수 있음."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자(화면 밖 화자 변경): 이전 코드를 지금 버려도 되나요?", "caption_location": "track cue B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "화자 표기 '사용자:'로 질문자가 바뀐 것을 알 수 있음."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "track cue A2, line 76", "caption_start_seconds": 7.6, "caption_end_seconds": 11.6, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "부정·조건 경고가 그대로 전달되어 코드 조기 폐기를 막음."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패를 알림, 페이지 범례 기준)", "caption_location": "track cue SFX, line 76", "caption_start_seconds": 12.2, "caption_end_seconds": 15.82, "relation": "equivalent", "evidence_ids": ["SOURCE-SOUND", "PAGE-C01", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2"], "user_impact": "소리를 못 듣는 이용자도 확인 실패를 알 수 있음. 소리 이후 약 3초 더 유지되어 읽기 시간이 충분."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "track cue A3, line 76", "caption_start_seconds": 16.42, "caption_end_seconds": 19.46, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-2"], "user_impact": "순서 조건('다시 끝낸 뒤')이 보존됨."},
      {"original_start_seconds": 20.06, "original_end_seconds": 26.7, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "track cue A4, line 76(긴 한 줄)", "caption_start_seconds": 20.06, "caption_end_seconds": 26.7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-2"], "user_impact": "이전 코드 무효화 경고가 약 6.6초 동안 표시되어 읽을 수 있음. PNG상 화면 폭 안에 모두 표시됨."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "track cue A5, line 76", "caption_start_seconds": 27.3, "caption_end_seconds": 29.58, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-3"], "user_impact": "마지막 단계 안내 전달."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "변경 불필요. 선택 사항으로 자막 위치를 영상 내부 진행 막대와 겹치지 않게 약간 올리면 시각적 혼잡이 줄어듦.", "retest": "콘텐츠·자막 변경 시 원본 전체 전사와 큐 목록을 다시 대조하고 각 큐 활성 시점 화면을 재확인."}]
  }],
  "errors": [],
  "limits": [
    "평가 모델은 원본 음성을 직접 듣거나 영상을 연속 재생하지 않았고, 제공된 독립 전사·상관·FFT·프레임 디코드 기록과 PNG 3장(9개 시점)만 검토함.",
    "전체 구간 판단은 이 통제된 7정적 화면 구성에 대한 SOURCE-VISUAL/ENCODE-LINK 구조 검증에 의존하며, 일반 영상에 대한 표본 일반화가 아님.",
    "ASR과 화자 역할은 통제된 출처 상관이며 정답 보장이 아님. 임의 소리 분류·음악·주변음은 측정되지 않음(SOURCE-SOUND unmeasured).",
    "자막이 영상 내부 진행 막대와 일부 겹치나 동일 정보가 'n / 7' 텍스트로 표시되어 정보 가림으로 보지 않음."
  ]
}
```
