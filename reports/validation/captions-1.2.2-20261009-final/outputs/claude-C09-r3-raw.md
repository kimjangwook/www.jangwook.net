# C09 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **not_applicable**(검증된 본문 매체 대안 예외). 실제 페이지(PAGE-C09)는 영상 바로 앞에 "이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다."라고 표시하고, '전체 설명' 본문에는 화자가 붙은 대사 6개, 경고음과 그 의미, 일곱 화면의 제목·지시·버튼 문구가 모두 있습니다. 이를 독립 전사(SOURCE-ASR)·화자 역할(SOURCE-AUDIO)·경고음 측정(SOURCE-SOUND)과 제가 Read한 PNG 3장(DISPLAY-C09-1~3)의 화면 문구와 대조한 결과, 영상에는 본문에 없는 정보가 확인되지 않았습니다. 자막 트랙은 없지만(DELIVERY-C09) 예외 두 조건이 모두 확인되어 1.2.2 자막 요구를 적용하지 않습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C09 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. 텍스트 트랙 없음, 본문에 매체 대안 표시와 전체 설명 있음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "M1이 페이지 본문의 매체 대안임이 명확히 표시되어 있고, 원본 음성·소리·화면 문구를 본문과 대조한 결과 본문에 없는 정보를 추가하지 않음. 검증된 예외."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C09", "PAGE-C09", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"],
    "derived_processing_and_limits": [
      "PAGE-C09: 실제 표시 문구 '이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다.'와 전체 설명 본문.",
      "SOURCE-ASR/SOURCE-AUDIO: 대사 6개 문구와 화자(안내자 5, 사용자 1)가 본문 대사·화자와 일치. 직접 청취 아님.",
      "SOURCE-SOUND: 경고음 2회(12.2–12.82s). 본문에 '[보안 확인 실패를 알리는 경고음 두 번]' 포함.",
      "SOURCE-VISUAL/ENCODE-LINK: 정적 화면 7개+진행 막대 구조. DISPLAY-C09-1~3(평가 모델 Read)의 7개 화면 제목·지시·버튼 문구가 본문 '화면 안내 일곱 단계'와 일치.",
      "PNG의 원호(로딩 표시로 추정)와 진행 막대·'n / 7'은 내용 정보로 보지 않음."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음), 본문의 매체 대안으로 표시됨",
    "classification_evidence_ids": ["MEDIA-C09", "SOURCE-ASR", "SOURCE-SOUND", "PAGE-C09"],
    "execution": "run",
    "decision": "not_applicable",
    "reason": "본문 매체 대안 예외의 두 조건(추가 정보 없음, 명확한 표시)을 실제 본문·원본·화면 비교로 확인.",
    "exception": {"claimed": true, "no_extra_information": true, "clearly_labeled": true, "verified": true, "evidence_ids": ["PAGE-C09", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"]},
    "caption_delivery": {"kind": "none", "actually_observed": true, "evidence_ids": ["PAGE-C09", "DELIVERY-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "PAGE-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"], "reason": "원본 음성 전체, 정적 화면 7개 구조와 각 화면 PNG, 본문 전체의 교집합으로 예외 조건 비교."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "자막 없음. 본문 전체 설명 첫 문장과 일치", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "본문에 동일 정보 있음(예외 비교)."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "본문 '사용자: …'", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "화자 포함 동일."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "본문 '안내자: 아니요. …'", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "부정·조건 동일."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패)", "caption_location": "본문 '[보안 확인 실패를 알리는 경고음 두 번]'", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-SOUND", "PAGE-C09"], "user_impact": "소리 의미가 본문에 있음."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "본문 해당 문장", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "동일."},
      {"original_start_seconds": 20.06, "original_end_seconds": 26.7, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "본문 해당 문장", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "동일."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "본문 해당 문장", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09"], "user_impact": "동일."},
      {"original_start_seconds": 0, "original_end_seconds": 31.18, "original_content": "화면 7단계의 제목·지시·버튼 문구(보안 설정/보안 열기 … 발급 완료/설정으로 돌아가기)", "caption_location": "본문 '화면 안내는 다음 일곱 단계입니다…'", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-VISUAL", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3", "PAGE-C09"], "user_impact": "영상 화면 문구가 본문에 모두 있어 추가 정보 없음."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "변경 불필요. 영상 또는 본문을 수정할 때 영상이 본문에 없는 정보를 추가하지 않도록 유지하고 대안 표시 문구를 영상 가까이 유지.", "retest": "콘텐츠 변경 시 원본 전사·소리·화면 문구를 본문 전체와 다시 대조하고 표시 문구를 확인. 예외가 깨지면 동기화 자막 요구로 재평가."}]
  }],
  "errors": [],
  "limits": [
    "평가 모델은 직접 청취·연속 재생을 하지 않았고, 대조는 독립 전사·출처 상관·FFT·정적 화면 구조 기록과 PNG 9개 시점에 근거함.",
    "comparisons의 relation은 자막이 아닌 본문과 원본의 대응(예외 검증)을 기록한 것임.",
    "PNG의 원호는 플레이어 로딩 표시로 추정했으며 영상 콘텐츠 정보로 보지 않음. 이 추정은 제공 자료로 확정되지 않음."
  ]
}
```
