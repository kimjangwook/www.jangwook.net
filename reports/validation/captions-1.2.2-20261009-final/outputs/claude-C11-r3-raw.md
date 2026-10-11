# C11 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **fail**. 페이지(PAGE-C11)는 영상이 "아래 설명의 매체 대안"이며 추가 정보가 없다고 표시하지만, 원본 22.76–26.02초 안내자 발화 "새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다."(SOURCE-ASR, VOICE-A4 구간)가 본문 '전체 설명'에는 없습니다. 영상이 본문에 없는 경고 정보를 추가하므로 예외의 "추가 정보 없음" 조건이 깨져 일반 자막 요구를 적용했고, 텍스트 트랙이 없으며(DELIVERY-C11 tracks=[]) 제가 Read한 PNG 3장(DISPLAY-C11-1~3)에도 개방 자막이 없어 동기화 자막이 제공되지 않습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C11 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. 텍스트 트랙 없음, 본문에 매체 대안 표시와 전체 설명 있음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "예외 주장은 표시되어 있으나 영상이 본문에 없는 경고('새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다')를 추가해 예외 불성립. 일반 자막 요구 기준으로 자막이 전혀 없음."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C11", "PAGE-C11", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C11", "DISPLAY-C11-1", "DISPLAY-C11-2", "DISPLAY-C11-3"],
    "derived_processing_and_limits": [
      "PAGE-C11: 표시 문구 '이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다.' 본문 대사 중 A4는 '안내자: 새 코드를 안전한 곳에 저장합니다.'만 있음.",
      "SOURCE-ASR: 22.76–26.02s '새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.'(단어 확률 ≥0.998). SOURCE-AUDIO VOICE-A4(20.06–26.7s, 상관 0.99925)가 같은 녹음 구간을 지지. 직접 청취 아님.",
      "DISPLAY-C11-1~3: 평가 모델이 Read로 확인. 화면 6/7 문구 '코드를 안전한 곳에 보관하세요.'에도 이전 코드 무효화 정보는 없음.",
      "DELIVERY-C11: tracks=[], 9개 시점 활성 큐 없음.",
      "이 입력과 C06 입력의 차이를 diff로 확인한 바 있음(표시 문구·본문 1문장·claimed). 판정은 C11 자료만으로 내림."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음), 매체 대안 예외 주장됨",
    "classification_evidence_ids": ["MEDIA-C11", "SOURCE-ASR", "SOURCE-SOUND", "PAGE-C11"],
    "execution": "run",
    "decision": "fail",
    "reason": "예외 조건 중 '추가 정보 없음'이 거짓으로 확인되어 자막 요구 적용. 자막 미제공으로 모든 정보 단위 누락.",
    "exception": {"claimed": true, "no_extra_information": false, "clearly_labeled": true, "verified": false, "evidence_ids": ["PAGE-C11", "SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C11-2"]},
    "caption_delivery": {"kind": "none", "actually_observed": true, "evidence_ids": ["PAGE-C11", "DELIVERY-C11", "DISPLAY-C11-1", "DISPLAY-C11-2", "DISPLAY-C11-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "PAGE-C11", "DELIVERY-C11", "DISPLAY-C11-1", "DISPLAY-C11-2", "DISPLAY-C11-3"], "reason": "원본 음성 전체, 본문 전체, 트랙 부재 기록, 정적 화면 구조와 9개 시점 PNG의 교집합."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 22.76, "original_end_seconds": 26.02, "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. (본문에 없는 정보)", "caption_location": "자막 없음. 본문 전체 설명에도 없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C11", "DELIVERY-C11", "DISPLAY-C11-2"], "user_impact": "소리를 듣지 못하는 이용자는 새 발급 시 이전 코드가 무효화된다는 경고를 영상·본문 어디에서도 받지 못함. 예외를 깨는 핵심 차이."},
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "없음(트랙·영상 내 자막 없음)", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-1"], "user_impact": "동기화 자막 없음(본문에는 있음)."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-1"], "user_impact": "동기화 자막 없음."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-1"], "user_impact": "동기화 자막 없음."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패)", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-SOUND", "PAGE-C11", "DELIVERY-C11", "DISPLAY-C11-1", "DISPLAY-C11-2"], "user_impact": "실패 시점을 알 수 없음."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-2"], "user_impact": "동기화 자막 없음."},
      {"original_start_seconds": 20.06, "original_end_seconds": 22.14, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-2"], "user_impact": "동기화 자막 없음."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "없음", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C11", "DISPLAY-C11-3"], "user_impact": "동기화 자막 없음."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "원본 구간에 맞춘 동기화 자막(화자·경고음 포함)을 제공하거나, 예외를 유지하려면 본문 전체 설명에 '새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.'를 추가해 영상과 본문 정보를 일치시킴.", "retest": "자막 방식이면 트랙 표시와 각 구간 활성 큐를 확인. 예외 방식이면 원본 전사·소리·화면 문구 전체를 수정된 본문과 다시 대조하고 표시 문구를 확인."}]
  }],
  "errors": [],
  "limits": [
    "평가 모델은 직접 청취·연속 재생을 하지 않았고 독립 전사·출처 상관·FFT·정적 구조 기록과 PNG 9개 시점으로 대조함.",
    "누락 문장 판단은 ASR 결과와 격리 원본 상관의 구간 일치에 근거하며 ASR은 정답 보장이 아님. 단어 확률이 높고 C11 본문 외 다른 근거와 충돌하지 않음.",
    "PNG의 원호(로딩 표시로 추정)는 판정과 무관."
  ]
}
```
