# C03 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **fail**. SOURCE-SOUND는 12.2~12.82초에 경고음 펄스 두 개를 측정했고 PAGE-C03은 이것이 보안 확인 실패를 뜻한다고 밝히는데, DELIVERY-C03의 큐 6개에는 이 소리에 대한 큐가 없으며 12.5초·15초 샘플의 활성 큐가 비어 있고 실제 Read한 PNG(DISPLAY-C03-1, -2)에서도 해당 구간에 자막이 보이지 않습니다. 같은 시점 화면은 '보안 확인 결과'만 보여 실패 여부를 알려 주지 않으므로, 자막 이용자는 다음 대사 "보안 확인을 다시 끝낸 뒤"의 이유를 알 수 없습니다. 대사 6개는 의미·시간상 동등했습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C03 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. Chromium에서 한국어 captions 트랙 mode=showing 상태.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1의 12.2~12.82초 정보성 경고음 두 번(보안 확인 실패)에 대응하는 자막 큐가 트랙에 없고, 12.5초·15초 화면에서도 자막이 표시되지 않았습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C03", "PAGE-C03", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"],
    "derived_processing_and_limits": [
      "원본 음성은 SOURCE-ASR(독립 전사, 0~31.19초 전체)로 확인했으며 평가자는 직접 청취하지 않았습니다.",
      "경고음 존재는 SOURCE-SOUND의 FFT 펄스 2개(12.2~12.4, 12.62~12.82초)로, 의미는 PAGE-C03 문구로 확인했습니다. 탐지기는 의미를 추론하지 않습니다.",
      "DELIVERY-C03 큐 목록 6개에 경고음 큐가 없고, 12.5초·15초 샘플의 active_cues가 빈 배열입니다.",
      "DISPLAY-C03-1~3의 9개 시점 PNG를 실제로 Read했고 12.5초·15초 화면에 자막이 없음을 확인했습니다. 화면 중앙의 원형 로딩 표시는 자막 판정과 무관하게 기록만 합니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+대화 음성+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C03", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND"],
    "execution": "run",
    "decision": "fail",
    "reason": "대사 6개는 동등하나 보안 확인 실패를 알리는 경고음이 자막에서 누락되었습니다. 해당 구간 화면(4/7 '보안 확인 결과')은 실패 여부를 표시하지 않으므로 소리 정보가 자막으로 전달되어야 합니다.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": []},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.189, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"], "reason": "원본 음성 전체 전사·음향 측정·전체 프레임 디코드 기록, 큐 목록 전체, 9개 시점 PNG의 교집합. 평가자의 직접 관찰은 PNG 시점에 한정."}],
      "unreviewed_ranges": [{"start_seconds": 31.189, "end_seconds": 31.208, "reason": "메타데이터 길이와 디코드 음성 길이의 차이 0.02초. 별도 관찰 없음."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "큐 A1, line 76", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자(화면 밖): 이전 코드를 지금 버려도 되나요?", "caption_location": "큐 B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 7.71, "original_end_seconds": 11.18, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "큐 A2, line 76", "caption_start_seconds": 7.6, "caption_end_seconds": 11.6, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "부정·조건 유지."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 두 번(보안 확인 실패 의미, 페이지 문구 근거)", "caption_location": "없음 — 12.5초·15초 화면에 자막 미표시", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-SOUND", "PAGE-C03", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2"], "user_impact": "청각장애 이용자는 보안 확인이 실패했다는 사실을 알 수 없어 다음 대사 '보안 확인을 다시 끝낸 뒤'의 이유를 이해하지 못합니다. 페이지 범례는 경고음의 의미만 설명하고 발생 시점을 알려 주지 않습니다."},
      {"original_start_seconds": 16.47, "original_end_seconds": 19.0, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "큐 A3, line 76", "caption_start_seconds": 16.42, "caption_end_seconds": 19.46, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-2"], "user_impact": "영향 없음."},
      {"original_start_seconds": 20.0, "original_end_seconds": 26.02, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "큐 A4, line 76", "caption_start_seconds": 20.06, "caption_end_seconds": 26.7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-2"], "user_impact": "영향 없음."},
      {"original_start_seconds": 27.45, "original_end_seconds": 29.08, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "큐 A5, line 76", "caption_start_seconds": 27.3, "caption_end_seconds": 29.58, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-3"], "user_impact": "영향 없음."}
    ],
    "missing_evidence": ["평가자의 직접 청취·연속 재생 관찰은 없습니다.", "음악·주변음 등 임의 소리 분류는 측정되지 않았습니다."],
    "recommendations": [{"change": "12.2초 무렵부터 읽을 수 있는 시간 동안 '[보안 확인 실패를 알리는 경고음 두 번]' 같은 소리 큐를 추가합니다.", "retest": "수정된 트랙을 로드해 12.2~16초 사이 활성 큐와 화면 표시를 확인하고, 경고음 펄스 시점과 대조합니다."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 독립 ASR·음향 측정·프레임 디코드 기록과 PNG 9장을 검토한 결과입니다.",
    "경고음의 의미는 페이지 문구에 근거합니다."
  ]
}
```
