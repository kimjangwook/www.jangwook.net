# C12 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **inconclusive**. SOURCE-ASR·SOURCE-AUDIO·SOURCE-VISUAL은 처음 8초만 처리했고 SOURCE-SOUND는 8초 이후를 측정하지 않았으며, 실제 Read한 DISPLAY-C12-1도 2초·5초 두 시점뿐입니다. 이 범위의 대사 A1·B1은 화자 표기와 함께 원본과 동등하고 시간도 맞아 위반은 확인되지 않았지만, 8~31.21초의 원본 대사·중요한 소리·화면 증거가 없어 큐 A2~A5·SFX를 대조할 수 없습니다. 후보 자막 텍스트를 원본 증거로 재사용하지 않았으며, 판정을 마치려면 전체 구간의 독립 전사·소리 측정·화면 기록이 필요합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C12 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. Chromium에서 한국어 captions 트랙 mode=showing 상태.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "inconclusive",
    "reason": "원본 음성·소리·화면 증거가 0~8초에만 있고 8~31.21초는 처리되지 않았습니다. 확인한 0~8초 대사 2개는 자막과 동등하여 위반은 없지만, 나머지 23초의 원본 내용·중요한 소리와 자막 대응을 확인할 수 없습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C12", "PAGE-C12", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "DELIVERY-C12", "DISPLAY-C12-1"],
    "derived_processing_and_limits": [
      "SOURCE-ASR는 처음 8초만 전사했고 coverage_statement가 나머지를 의도적으로 제공하지 않는다고 밝힙니다.",
      "SOURCE-AUDIO는 VOICE-A1·VOICE-B1 두 구간만, SOURCE-SOUND는 펄스 없음과 8초 이후 미측정을 기록합니다. 따라서 8초 이후 경고음 등 소리의 존재 여부를 알 수 없습니다.",
      "SOURCE-VISUAL은 처음 8초만 다루며 전체 장면 구성 증거가 없습니다.",
      "DISPLAY-C12-1의 2초·5초 PNG 두 장면을 실제로 Read했습니다. DELIVERY-C12 큐 목록에는 8초 이후 큐 5개가 있으나 그 큐 텍스트를 원본 증거로 재사용하지 않았습니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+음성), 음소거 원본 아님(0~8초 관찰 기준)",
    "classification_evidence_ids": ["MEDIA-C12", "SOURCE-ASR", "SOURCE-AUDIO"],
    "execution": "run",
    "decision": "inconclusive",
    "reason": "0~8초 구간의 대사 A1·B1은 화자 표기와 함께 원본과 동등하고 시간도 맞습니다. 그러나 8~31.21초 원본 증거가 없어 자막 충분성을 판단할 수 없고, 확인된 위반도 없습니다.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": []},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C12", "DISPLAY-C12-1"]},
    "coverage": {
      "complete": false,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 8, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-VISUAL", "DELIVERY-C12", "DISPLAY-C12-1"], "reason": "원본 전사·화자 상관·화면 처리와 자막 큐·표시 관찰이 모두 있는 범위. 화면 표시는 2초·5초 두 시점만 직접 관찰했습니다."}],
      "unreviewed_ranges": [{"start_seconds": 8, "end_seconds": 31.208, "reason": "원본 음성 전사·소리 측정·화면 처리가 제공되지 않음. 자막 큐 A2~A5·SFX는 존재하지만 대조할 원본이 없고, 표시 PNG도 없습니다."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "큐 A1, line 76", "caption_start_seconds": 1, "caption_end_seconds": 3.4, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C12", "DISPLAY-C12-1"], "user_impact": "영향 없음."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자(화면 밖): 이전 코드를 지금 버려도 되나요?", "caption_location": "큐 B1, line 76", "caption_start_seconds": 4, "caption_end_seconds": 7, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C12", "DISPLAY-C12-1"], "user_impact": "화자 변경 식별됨."},
      {"original_start_seconds": 8, "original_end_seconds": 31.208, "original_content": "미처리 구간(원본 내용 알 수 없음)", "caption_location": "큐 A2(7.6~11.6), SFX(12.2~15.82), A3, A4, A5", "caption_start_seconds": 7.6, "caption_end_seconds": 29.58, "relation": "unknown", "evidence_ids": ["SOURCE-ASR", "SOURCE-SOUND", "DELIVERY-C12"], "user_impact": "원본 대사·부정·경고음과 자막의 대응을 확인하지 못해 이용자 영향을 판단할 수 없습니다."}
    ],
    "missing_evidence": [
      "8~31.21초 원본 음성의 독립 전사 또는 직접 청취 기록",
      "8초 이후 화자 역할 기록(분리 녹음 상관 또는 화자 분리)",
      "8초 이후 경고음 등 중요한 소리 측정과 의미 근거",
      "전체 화면 구성·프레임 디코드 기록과 8초 이후 각 큐 활성 시점의 표시 PNG"
    ],
    "recommendations": [{"change": "현재 확인된 위반은 없어 자막 수정 권고는 보류합니다. 평가를 완료하려면 위 누락 증거를 제공해야 합니다.", "retest": "전체 0~31.21초 원본 전사·소리 측정·화면 기록과 8초 이후 각 큐 활성 시점 화면을 확보해 남은 큐를 대조합니다."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 0~8초 독립 ASR·화자 상관 기록과 PNG 1장(2개 시점)을 검토한 결과입니다.",
    "자막 큐 목록이 8초 이후에도 존재하지만 후보 자막을 원본 증거로 쓰지 않았기 때문에 그 구간은 unknown입니다.",
    "증거 부족은 실행 오류가 아니라 입력 범위 제한이므로 execution은 run으로 기록했습니다."
  ]
}
```
