# C12 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **inconclusive**. 제공된 원본 증거는 처음 8초뿐이고(SOURCE-ASR processed_ranges 0–8, "remainder deliberately unavailable"), 소리 측정은 8초 이후 전체가 미측정이며(SOURCE-SOUND), 화면 증거도 2초·5초 두 시점(DISPLAY-C12-1)뿐입니다. 확인된 범위인 0–7초의 대사 두 개(안내자 1.0–3.4초, 사용자 4.0–7.0초)는 큐 A1·B1과 동등하고 시간이 맞으며 실제 화면에 표시됩니다. 하지만 7초 이후 약 24초(31.21초 매체 중 대부분)의 원본 음성·소리·화면이 확인되지 않아, 트랙에 남은 큐 5개가 원본과 맞는지와 빠진 소리가 있는지 판단할 수 없습니다. 위반은 확인되지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C12 — 기사 본문과 교육 영상 1개(M1), 페이지 하단 내비게이션 제외. Chromium, 한국어 captions 트랙 mode=showing. 원본 처리 범위는 처음 8초로 제한.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "inconclusive",
    "reason": "0–7s는 동등하나 7–31.21s의 원본 음성·소리·표시 증거가 없어 나머지 큐 5개와 중요한 소리의 대응을 판단할 수 없음. 확인된 위반 없음."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C12", "PAGE-C12", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "DELIVERY-C12", "DISPLAY-C12-1"],
    "derived_processing_and_limits": [
      "SOURCE-ASR: 0–8s만 디코드·인식. 0.94–3.04s, 3.8–6.56s 두 구간 전사. 이후 구간은 의도적으로 제공되지 않음.",
      "SOURCE-AUDIO: VOICE-A1(1.0–3.4s 안내자), VOICE-B1(4.0–7.0s 사용자)만 제공.",
      "SOURCE-SOUND: pulses=[], 8s 이후 전체 미측정. 경고음 부재를 뜻하지 않음.",
      "SOURCE-VISUAL: 처음 8초만, 전체 구성·커버리지 증거 없음. 화면 시점 2s·5s.",
      "DISPLAY-C12-1: 평가 모델이 Read로 2s·5s 화면의 A1·B1 표시 확인.",
      "DELIVERY-C12: 큐 목록 7개를 읽었으나 7.6s 이후 큐는 대조할 원본 증거가 없어 자막 후보를 원본 대용으로 쓰지 않음."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사), 음소거 원본 아님. 페이지 문구상 경고음이 있다고 하나 해당 구간 원본 측정 없음",
    "classification_evidence_ids": ["MEDIA-C12", "SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C12"],
    "execution": "run",
    "decision": "inconclusive",
    "reason": "처리된 0–7s는 equivalent. 7–31.21s 원본·표시 미확인으로 충분성 판단 불가.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": ["PAGE-C12"]},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C12", "DISPLAY-C12-1"]},
    "coverage": {
      "complete": false,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 7.0, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C12", "DISPLAY-C12-1"], "reason": "원본 전사·출처 상관, 큐 A1·B1, 2s·5s 표시 PNG가 모두 있는 구간. 7.0–8.0s는 인식 결과가 없고 다음 발화가 잘렸을 가능성을 배제할 수 없어 제외."}],
      "unreviewed_ranges": [{"start_seconds": 7.0, "end_seconds": 31.21, "reason": "원본 음성 전사·소리 측정·화면 구성 증거가 제공되지 않음(입력에 '의도적으로 제공하지 않음' 명시). 큐 A2·SFX·A3·A4·A5 대조 불가."}]
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "track cue A1, line 76", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C12", "DISPLAY-C12-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "track cue B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C12", "DISPLAY-C12-1"], "user_impact": "화자 변경 표기됨."},
      {"original_start_seconds": 7.0, "original_end_seconds": 31.21, "original_content": "미확인(원본 음성·소리·화면 증거 없음)", "caption_location": "track cues A2(7.6–11.6), SFX(12.2–15.82), A3(16.42–19.46), A4(20.06–26.7), A5(27.3–29.58)", "caption_start_seconds": 7.6, "caption_end_seconds": 29.58, "relation": "unknown", "evidence_ids": ["DELIVERY-C12", "SOURCE-SOUND"], "user_impact": "원본과 비교할 수 없어 누락·부정확·시간 불일치 여부를 알 수 없음."}
    ],
    "missing_evidence": [
      "7–31.21s 원본 음성의 독립 전사(단어 시간 포함)",
      "7–31.21s 화자 역할 근거(격리 원본 상관 등)",
      "8s 이후 중요한 소리(경고음 등) 측정 기록",
      "전체 원본 화면 구성 또는 전 프레임 디코드 등 시각 커버리지 증거",
      "큐 A2·SFX·A3·A4·A5 활성 시점의 실제 표시 PNG"
    ],
    "recommendations": [{"change": "판정 전 수정 불필요(위반 미확인). 누락된 원본·표시 증거를 수집.", "retest": "원본 전체(0–31.21s)를 디코드·전사하고 소리를 측정한 뒤 각 큐 활성 시점 화면과 함께 다시 평가."}]
  }],
  "errors": [],
  "limits": [
    "입력이 원본의 처음 8초만 제공하도록 제한되어 있음. 이는 도구 오류가 아닌 자료 범위 제한으로 보고 execution=run으로 기록.",
    "평가 모델은 직접 청취·연속 재생을 하지 않았고 PNG 1장(2개 시점)만 검토함.",
    "후보 자막의 7.6s 이후 큐를 원본 증거로 사용하지 않음. PNG의 원호(로딩 표시로 추정)는 판정과 무관."
  ]
}
```
