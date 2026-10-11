# C01 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **pass**. 범위 안의 유일한 녹화 동영상 M1에는 화면 밖 두 화자의 대사 6개와 보안 확인 실패를 알리는 경고음 두 번이 있으며, 독립 ASR·분리 녹음 상관·FFT 기록과 대조했을 때 폐쇄 자막 큐 7개가 부정("아니요"), 조건("저장하기 전에는"), 경고("더 이상 사용할 수 없습니다")와 화자 전환을 유지한 채 0.2초 이내로 동기화되어 있습니다. 실제로 Read한 PNG 9개 시점(DISPLAY-C01-1~3)에서 자막이 영상 하단 조작부 위에 표시되었고 안내 화면의 제목·본문·버튼을 가리지 않았습니다. 다만 직접 청취·연속 재생이 아닌 파생 기록과 PNG 검토이며, 전체 화면 범위는 7개 정적 장면으로 통제된 자료의 디코드 기록에 의존합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C01 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. Chromium에서 한국어 captions 트랙 mode=showing 상태.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "pass",
    "reason": "범위 내 유일한 녹화 동영상 M1의 대사 6개 구간과 정보성 경고음 1개 사건이 모두 폐쇄 자막 큐 7개와 의미·시간상 대응했고, 제공된 표시 PNG 9장에서 자막이 실제로 표시되며 중요한 화면 정보를 가리지 않았습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C01", "PAGE-C01", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"],
    "derived_processing_and_limits": [
      "원본 음성은 SOURCE-ASR(faster-whisper 독립 전사, 0~31.19초 전체)로만 확인했으며 ASR은 정답이 보장되지 않습니다. 평가자는 직접 청취하지 않았습니다.",
      "화자 역할은 SOURCE-AUDIO의 분리 녹음 상관(0.998 이상) 기록에 근거하며 일반 화자 분리 성능이 아닙니다.",
      "경고음은 SOURCE-SOUND의 FFT 펄스 2개(12.2~12.4, 12.62~12.82초)로 존재를 확인했고 의미는 PAGE-C01 본문 문구에 근거합니다.",
      "화면은 DISPLAY-C01-1~3의 9개 시점 PNG를 실제로 Read했으며, 연속 재생은 하지 않았습니다. 전체 화면 범위 주장은 SOURCE-VISUAL/ENCODE-LINK의 7개 정적 장면·749프레임 디코드 기록에 의존합니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+대화 음성+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C01", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND"],
    "execution": "run",
    "decision": "pass",
    "reason": "6개 대사(부정 '아니요', 조건 '저장하기 전에는', '더 이상 사용할 수 없습니다' 포함)와 경고음 두 번이 자막에 의미를 유지해 표시되고, 큐 시작은 원본보다 0.2초 이내로 어긋나며, 화면 밖 화자 전환이 '안내자/사용자' 표기로 식별됩니다.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": []},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.189, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2", "DISPLAY-C01-3"], "reason": "원본 음성 전체 전사·전체 프레임 디코드 기록, 큐 목록 전체, 각 큐 활성 시점 PNG가 모두 존재하는 교집합. 평가자의 직접 관찰은 PNG 9개 시점에 한정."}],
      "unreviewed_ranges": [{"start_seconds": 31.189, "end_seconds": 31.208, "reason": "메타데이터 길이와 디코드 음성 길이의 차이 0.02초. 정보 내용 없음으로 보이나 별도 관찰 없음."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "큐 A1, 영상 하단 line 76", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자(화면 밖): 이전 코드를 지금 버려도 되나요?", "caption_location": "큐 B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "화자 전환이 '사용자:'로 식별됨. 시작 0.2초 늦음은 이해에 영향 없음."},
      {"original_start_seconds": 7.71, "original_end_seconds": 11.18, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "큐 A2, line 76", "caption_start_seconds": 7.6, "caption_end_seconds": 11.6, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-1"], "user_impact": "부정과 조건이 유지됨."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 두 번(보안 확인 실패 의미, 페이지 문구 근거)", "caption_location": "큐 SFX, line 76", "caption_start_seconds": 12.2, "caption_end_seconds": 15.82, "relation": "equivalent", "evidence_ids": ["SOURCE-SOUND", "PAGE-C01", "DELIVERY-C01", "DISPLAY-C01-1", "DISPLAY-C01-2"], "user_impact": "경고음 횟수와 의미가 전달되고 약 3.6초 유지되어 읽을 시간이 있음."},
      {"original_start_seconds": 16.47, "original_end_seconds": 19.0, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "큐 A3, line 76", "caption_start_seconds": 16.42, "caption_end_seconds": 19.46, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-2"], "user_impact": "영향 없음."},
      {"original_start_seconds": 20.0, "original_end_seconds": 26.02, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "큐 A4, line 76 (한 줄, 영상 폭 거의 전체)", "caption_start_seconds": 20.06, "caption_end_seconds": 26.7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-2"], "user_impact": "긴 문장이지만 6.6초 표시되고 경고성 조건이 유지됨. 화면 내 진행 막대 일부와 겹치나 정보 손실 없음."},
      {"original_start_seconds": 27.45, "original_end_seconds": 29.08, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "큐 A5, line 76", "caption_start_seconds": 27.3, "caption_end_seconds": 29.58, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C01", "DISPLAY-C01-3"], "user_impact": "영향 없음."}
    ],
    "missing_evidence": ["평가자의 직접 청취·연속 재생 관찰은 없으며 파생 기록과 PNG에 의존합니다.", "음악·주변음 등 임의 소리 분류는 측정되지 않았습니다(SOURCE-SOUND unmeasured)."],
    "recommendations": [{"change": "수정 필요 없음. 자막 위치가 화면 내 진행 막대와 겹치므로 필요 시 큐 위치를 약간 올려 시각 요소와 분리할 수 있음(선택 사항).", "retest": "원본이나 자막 변경 시 전체 음성 재전사, 큐 목록 대조, 각 큐 활성 시점 화면 확인을 다시 수행."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 독립 ASR·음향 측정·프레임 디코드 기록과 PNG 9장을 검토한 결과입니다.",
    "전체 화면 범위는 7개 정적 장면으로 통제된 이 자료에 한정된 기록에 의존합니다.",
    "경고음의 의미는 페이지 문구에 근거하며 탐지기가 의미를 추론한 것이 아닙니다."
  ]
}
```
