# C06 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **fail**. PAGE-C06과 DELIVERY-C06에서 video에 track이 없고 9개 샘플 시점의 활성 큐가 모두 비어 있으며, 실제 Read한 PNG(DISPLAY-C06-1~3)에서도 영상 안에 개방 자막이 보이지 않아 대사 6개와 경고음 1개가 재생 중 전혀 자막으로 제공되지 않습니다. 페이지 '전체 설명'은 원본 내용과 같은 전사문이지만 동기화되지 않은 정적 텍스트이므로 자막을 대신하지 않고, 매체가 본문의 대안이라는 표시도 없어 예외도 성립하지 않습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C06 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. video에 track 없음, 페이지 본문에 '전체 설명' 전사문 있음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1에는 폐쇄 자막 트랙이 없고 9개 시점 화면에 영상 내 개방 자막도 보이지 않습니다. 페이지의 정적 전사문은 동기화 자막을 대신하지 않으며, 매체가 본문의 대안이라는 표시도 없어 예외가 성립하지 않습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C06", "PAGE-C06", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C06", "DISPLAY-C06-1", "DISPLAY-C06-2", "DISPLAY-C06-3"],
    "derived_processing_and_limits": [
      "원본 음성은 SOURCE-ASR·SOURCE-AUDIO, 경고음은 SOURCE-SOUND 기록으로 확인했으며 평가자는 직접 청취하지 않았습니다.",
      "PAGE-C06과 DELIVERY-C06에서 track 배열이 비어 있고 9개 샘플 시점 모두 active_cues가 비어 있습니다.",
      "DISPLAY-C06-1~3의 9개 시점 PNG를 실제로 Read했고 어느 화면에도 자막(폐쇄·개방)이 표시되지 않았습니다. 대사 시간대 화면의 안내 카드 문구는 대사와 다른 짧은 지시문입니다.",
      "PAGE-C06 '전체 설명'은 대사·경고음·화면 문구를 모두 포함하지만 시간 동기화가 없는 정적 텍스트입니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+대화 음성+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C06", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND"],
    "execution": "run",
    "decision": "fail",
    "reason": "대사 6개와 경고음 1개 모두에 대해 동기화 자막이 제공되지 않습니다. 페이지 전사문은 내용상 원본과 같지만 매체 재생 중 동기화되지 않으며, 예외 주장이 없고 매체가 텍스트의 대안이라는 명확한 표시도 없습니다.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": false, "verified": false, "evidence_ids": ["PAGE-C06"]},
    "caption_delivery": {"kind": "none", "actually_observed": true, "evidence_ids": ["PAGE-C06", "DELIVERY-C06", "DISPLAY-C06-1", "DISPLAY-C06-2", "DISPLAY-C06-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.189, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C06", "DISPLAY-C06-1", "DISPLAY-C06-2", "DISPLAY-C06-3"], "reason": "원본 음성 전체 전사·전체 프레임 디코드 기록, 빈 트랙 목록, 9개 시점 PNG의 교집합. 7개 정적 장면 모두에서 개방 자막 부재를 PNG로 확인."}],
      "unreviewed_ranges": [{"start_seconds": 31.189, "end_seconds": 31.208, "reason": "메타데이터 길이와 디코드 음성 길이의 차이 0.02초. 별도 관찰 없음."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "없음(트랙 없음, 2초 화면에 개방 자막 없음)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-1"], "user_impact": "재생 중 대사를 알 수 없음."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자(화면 밖): 이전 코드를 지금 버려도 되나요?", "caption_location": "없음(5초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-1"], "user_impact": "화면 밖 화자의 질문과 화자 변경을 알 수 없음."},
      {"original_start_seconds": 7.71, "original_end_seconds": 11.18, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "없음(9.4초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-1"], "user_impact": "화면 문구 '새 코드의 저장 상태를 먼저 확인하세요'는 '아니요'라는 답과 '버리지 마세요' 금지를 직접 전달하지 않음."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 두 번(보안 확인 실패)", "caption_location": "없음(12.5초·15초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-SOUND", "PAGE-C06", "DELIVERY-C06", "DISPLAY-C06-1", "DISPLAY-C06-2"], "user_impact": "보안 확인 실패가 발생한 시점을 재생 중 알 수 없음."},
      {"original_start_seconds": 16.47, "original_end_seconds": 19.0, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "없음(17.8초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-2"], "user_impact": "화면 문구와 유사하나 대사 자체는 제공되지 않음."},
      {"original_start_seconds": 20.0, "original_end_seconds": 26.02, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "없음(22초·25초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-2"], "user_impact": "'이전 코드는 더 이상 사용할 수 없습니다' 경고가 화면에 없어 재생 중 놓침."},
      {"original_start_seconds": 27.45, "original_end_seconds": 29.08, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "없음(28.3초 화면)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C06", "DISPLAY-C06-3"], "user_impact": "화면 문구로 내용은 유추 가능하나 대사 자막은 없음."}
    ],
    "missing_evidence": ["평가자의 직접 청취·연속 재생 관찰은 없습니다.", "매체가 본문의 대안임을 알리는 표시 문구는 PAGE-C06에서 발견되지 않았습니다."],
    "recommendations": [{"change": "원본 구간에 맞춘 kind=captions 트랙(화자 표기와 경고음 큐 포함)을 추가하거나 영상에 개방 자막을 넣습니다. 페이지 전사문은 유지해도 되지만 자막을 대신하지 않습니다.", "retest": "트랙 로드·선택·표시 상태를 확인하고 각 대사·경고음 구간에서 활성 큐와 화면 표시를 캡처해 원본과 대조합니다."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 독립 ASR·음향 측정·프레임 디코드 기록과 PNG 9장을 검토한 결과입니다.",
    "페이지 전사문은 1.2.1 등 다른 기준이나 미디어 대안 판단에 쓰일 수 있지만 이 평가는 1.2.2만 다룹니다."
  ]
}
```
