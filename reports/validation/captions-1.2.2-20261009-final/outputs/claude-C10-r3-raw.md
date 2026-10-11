# C10 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **fail**. 매체 M1은 대사 6구간과 정보성 경고음 2회가 있는 녹화 매체인데(SOURCE-ASR, SOURCE-AUDIO, SOURCE-SOUND), 실제 페이지와 플레이어 기록에는 텍스트 트랙이 없고(PAGE-C10 track=[], DELIVERY-C10 tracks=[] 및 9개 샘플 모두 활성 큐 없음), 제가 Read한 PNG 3장(DISPLAY-C10-1~3)에서도 영상에 들어간 개방 자막이 보이지 않습니다. 페이지의 '전체 설명'은 원본과 같은 내용의 정적 전사문이지만 동기화 자막을 대신하지 않고, 페이지에 영상이 본문의 매체 대안이라는 표시가 없어 예외도 성립하지 않습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C10 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. Chromium 처리 기록상 텍스트 트랙 없음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1에 폐쇄·개방 자막이 모두 없음. 정적 전체 설명은 동기화 자막이 아니며 매체 대안 표시가 없어 예외 불성립."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C10", "PAGE-C10", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C10", "DISPLAY-C10-1", "DISPLAY-C10-2", "DISPLAY-C10-3"],
    "derived_processing_and_limits": [
      "PAGE-C10: html_media.track=[]. 본문에 '전체 설명' 전사문이 있으나 매체 대안 표시 문구 없음.",
      "DELIVERY-C10: tracks=[], 9개 시점 활성 큐 없음.",
      "DISPLAY-C10-1~3: 평가 모델이 Read로 9개 시점에서 영상 내 자막 텍스트 부재 확인. 연속 재생 아님.",
      "SOURCE-ASR/SOURCE-AUDIO/SOURCE-SOUND: 대사 6구간과 경고음 2회 존재 확인. 직접 청취 아님.",
      "이 입력은 C06 입력과 증거 ID 외 내용이 같음을 diff로 확인했으나, 판정은 C10 자료만으로 내림."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C10", "SOURCE-ASR", "SOURCE-SOUND", "PAGE-C10"],
    "execution": "run",
    "decision": "fail",
    "reason": "자막 제공 없음. 모든 대사·경고음 정보 단위가 동기화 자막에서 누락.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": false, "verified": false, "evidence_ids": ["PAGE-C10"]},
    "caption_delivery": {"kind": "none", "actually_observed": true, "evidence_ids": ["PAGE-C10", "DELIVERY-C10", "DISPLAY-C10-1", "DISPLAY-C10-2", "DISPLAY-C10-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C10", "DISPLAY-C10-1", "DISPLAY-C10-2", "DISPLAY-C10-3"], "reason": "원본 음성 전체, 트랙 부재 기록, 정적 화면 7개 구조, 9개 시점 PNG의 교집합."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "없음(트랙·영상 내 자막 없음)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-1"], "user_impact": "재생 중 안내를 읽을 수 없음."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-1"], "user_impact": "화면 밖 사용자 질문과 화자 변경을 알 수 없음."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-1"], "user_impact": "핵심 금지 경고를 영상과 함께 받지 못함."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패)", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-SOUND", "PAGE-C10", "DELIVERY-C10", "DISPLAY-C10-1", "DISPLAY-C10-2"], "user_impact": "실패 시점을 알 수 없음."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-2"], "user_impact": "재확인 순서 조건 누락."},
      {"original_start_seconds": 20.06, "original_end_seconds": 26.7, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-2"], "user_impact": "이전 코드 무효화 경고 누락."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C10", "DISPLAY-C10-3"], "user_impact": "마지막 안내 누락."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "원본 구간에 맞춘 kind=captions WebVTT 트랙(화자 표기·경고음 큐 포함)을 추가하거나 개방 자막을 넣음. 또는 영상이 본문의 매체 대안이며 추가 정보가 없음을 명확히 표시하고 그 조건을 검증.", "retest": "트랙 로드·표시와 9개 시점 활성 큐를 확인하고 원본 전사·경고음 구간과 대조. 예외 방식을 택하면 표시 문구와 본문-원본 동등성을 재검증."}]
  }],
  "errors": [],
  "limits": [
    "평가 모델은 직접 청취·연속 재생을 하지 않았고 파생 기록과 PNG 3장(9개 시점)만 검토함. 개방 자막 부재는 9개 시점과 정적 화면 구조 검증에 근거.",
    "정적 전사문은 다른 기준의 대안 검토 대상일 수 있으나 1.2.2 동기화 자막을 충족하지 않음.",
    "PNG의 원호(로딩 표시로 추정)는 판정과 무관."
  ]
}
```
