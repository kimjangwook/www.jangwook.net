# C03 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **fail**. 매체 M1의 12.2–12.82초에 측정된 경고음 2회(SOURCE-SOUND)는 페이지 문구(PAGE-C03)상 "보안 확인 실패"를 알리는 정보성 소리인데, 실제 자막 트랙(DELIVERY-C03)에는 이 구간의 큐가 없고 12.5초·15초 샘플의 활성 큐가 비어 있으며, 제가 Read한 PNG(DISPLAY-C03-1의 12.5초, DISPLAY-C03-2의 15초)에도 자막이 표시되지 않습니다. 대사 6구간은 모두 동등한 자막으로 제공되고 시간이 맞습니다. 페이지 본문에 경고음 의미가 정적으로 적혀 있어도 언제 실패가 발생했는지를 동기화해 알려주지 않으므로 자막 누락을 대신하지 못합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C03 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. Chromium, 한국어 captions 트랙 mode=showing 처리 기록 기준.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1의 정보성 경고음 2회(12.2–12.82s, 보안 확인 실패)에 대응하는 자막 큐가 없음(missing). 확인된 위반 1건으로 범위 fail."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C03", "PAGE-C03", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"],
    "derived_processing_and_limits": [
      "SOURCE-SOUND: FFT 800–950Hz 펄스 2회(12.2–12.4, 12.62–12.82s) 측정. 의미는 PAGE-C03 문구에 근거하며 검출기 자체는 의미를 추론하지 않음.",
      "DELIVERY-C03: 큐 목록 6개(A1·B1·A2·A3·A4·A5)에 소리 큐 없음. 12.5s·15s 샘플 active_cues=[].",
      "DISPLAY-C03-1(12.5s), DISPLAY-C03-2(15s): 평가 모델이 Read로 자막 미표시 확인.",
      "SOURCE-ASR/SOURCE-AUDIO: 대사 6구간 독립 전사와 격리 원본 상관. 직접 청취 아님."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C03", "SOURCE-ASR", "SOURCE-SOUND", "PAGE-C03"],
    "execution": "run",
    "decision": "fail",
    "reason": "이해에 필요한 경고음(보안 확인 실패)이 자막에서 누락. 대사 6개는 equivalent.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": ["PAGE-C03"]},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2", "DISPLAY-C03-3"], "reason": "원본 음성 전체 전사·상관·소리 측정, 전체 큐 목록, 전 프레임 디코드 구조, 각 큐 및 무큐 구간 시점 PNG의 교집합."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "track cue A1, line 76", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "track cue B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "화자 변경 표기됨."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "track cue A2, line 76", "caption_start_seconds": 7.6, "caption_end_seconds": 11.6, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-1"], "user_impact": "부정·조건 보존."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패를 알림)", "caption_location": "해당 큐 없음. 12.5s·15s 활성 큐 없음, 화면에 자막 미표시", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-SOUND", "PAGE-C03", "DELIVERY-C03", "DISPLAY-C03-1", "DISPLAY-C03-2"], "user_impact": "소리를 듣지 못하는 이용자는 보안 확인이 실패했다는 사실을 그 시점에 알 수 없고, 이어지는 '보안 확인을 다시 끝낸 뒤' 안내의 이유를 이해하기 어려움. 화면 문구('결과를 확인하고 다음 단계로 이동하세요')도 실패를 알려주지 않음."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "track cue A3, line 76", "caption_start_seconds": 16.42, "caption_end_seconds": 19.46, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-2"], "user_impact": "영향 없음."},
      {"original_start_seconds": 20.06, "original_end_seconds": 26.7, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "track cue A4, line 76", "caption_start_seconds": 20.06, "caption_end_seconds": 26.7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-2"], "user_impact": "영향 없음."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "track cue A5, line 76", "caption_start_seconds": 27.3, "caption_end_seconds": 29.58, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C03", "DISPLAY-C03-3"], "user_impact": "영향 없음."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "12.2s부터 읽을 수 있을 만큼 유지되는 소리 큐를 추가(예: '[보안 확인 실패를 알리는 경고음 두 번]', 12.2–15.8s 정도).", "retest": "트랙을 다시 로드해 12.5s·15s 활성 큐와 화면 표시를 확인하고, 경고음 측정 구간과 큐 시작 시간을 재대조."}]
  }],
  "errors": [],
  "limits": [
    "평가 모델은 직접 청취·연속 재생을 하지 않았고 제공된 파생 기록과 PNG 3장(9개 시점)만 검토함.",
    "경고음 의미는 페이지 문구에 근거하며 소리 검출기 자체는 의미를 판별하지 않음. 임의 소리·음악·주변음은 측정되지 않음.",
    "PNG의 원호(로딩 표시로 추정)는 자막·지시 문구를 가리지 않음. 전체 구간 판단은 통제된 정적 화면 구조 검증에 의존."
  ]
}
```
