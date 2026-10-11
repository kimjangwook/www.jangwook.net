# C09 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **not_applicable**(매체 대안 예외 검증). PAGE-C09는 본문에 "이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다."라고 명확히 표시하고, '전체 설명'에는 SOURCE-ASR·SOURCE-AUDIO·SOURCE-SOUND로 확인한 대사 6개(화자·부정·조건·경고 포함)와 경고음의 의미, 그리고 실제 Read한 PNG(DISPLAY-C09-1~3)의 7개 화면 제목·안내문·버튼 문구가 모두 들어 있습니다. 영상이 본문에 없는 정보를 더하지 않고 대안임이 표시되어 있으므로 자막 요구를 적용하지 않았습니다. 영상 안에 다른 시각 변화가 없다는 점은 ENCODE-LINK의 정적 장면 기록에 의존합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C09 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. video에 track 없음, 본문에 '매체 대안' 표시와 '전체 설명' 전문 있음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "페이지가 '이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다.'라고 명확히 표시하고, 원본의 대사 6개·화자·경고음 의미와 7개 화면 문구가 모두 본문 '전체 설명'에 있어 매체 대안 예외가 검증되었습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C09", "PAGE-C09", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"],
    "derived_processing_and_limits": [
      "원본 대사·화자·경고음은 SOURCE-ASR·SOURCE-AUDIO·SOURCE-SOUND 기록으로 확인했으며 평가자는 직접 청취하지 않았습니다.",
      "영상 화면 정보는 DISPLAY-C09-1~3의 9개 시점 PNG(7개 장면 모두 포함)를 실제로 Read해 제목·안내문·버튼 문구를 본문과 대조했습니다.",
      "장면이 7개뿐이라는 사실은 ENCODE-LINK의 정적 장면 구조·749프레임 디코드 기록에 의존합니다.",
      "DELIVERY-C09에서 track이 없고 화면에도 자막이 없음을 확인했으나 예외가 성립하므로 자막 요구를 적용하지 않았습니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+대화 음성+정보성 경고음), 본문 텍스트의 매체 대안으로 표시됨",
    "classification_evidence_ids": ["MEDIA-C09", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "PAGE-C09"],
    "execution": "run",
    "decision": "not_applicable",
    "reason": "본문이 영상의 모든 정보를 담고 있고(추가 정보 없음), 영상이 그 본문의 대안임이 본문 바로 위에 명확히 표시되어 있어 1.2.2의 미디어 대안 예외에 해당합니다.",
    "exception": {"claimed": true, "no_extra_information": true, "clearly_labeled": true, "verified": true, "evidence_ids": ["PAGE-C09", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "ENCODE-LINK", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"]},
    "caption_delivery": {"kind": "none", "actually_observed": true, "evidence_ids": ["PAGE-C09", "DELIVERY-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.189, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "PAGE-C09", "DISPLAY-C09-1", "DISPLAY-C09-2", "DISPLAY-C09-3"], "reason": "원본 음성 전체 전사·경고음 측정·7개 정적 장면 기록과 장면별 PNG, 본문 전체 텍스트를 대조한 범위."}],
      "unreviewed_ranges": [{"start_seconds": 31.189, "end_seconds": 31.208, "reason": "메타데이터 길이와 디코드 음성 길이의 차이 0.02초. 별도 관찰 없음."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다. / 화면 1/7 '보안 설정', '설정에서 보안을 선택하세요.', '보안 열기'", "caption_location": "자막 없음. 본문 '전체 설명' 첫 문장과 화면 안내 1단계에 동일 내용", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-1"], "user_impact": "본문에서 같은 정보를 얻을 수 있음(예외 검증용 대조)."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자: 이전 코드를 지금 버려도 되나요? / 화면 2/7", "caption_location": "본문 '사용자: 이전 코드를 지금 버려도 되나요?' 및 2단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-1"], "user_impact": "화자 포함 동일 정보가 본문에 있음."},
      {"original_start_seconds": 7.71, "original_end_seconds": 11.18, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요. / 화면 3/7", "caption_location": "본문 동일 문장 및 3단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-1"], "user_impact": "부정·조건이 본문에 그대로 있음."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 두 번(보안 확인 실패) / 화면 4/7", "caption_location": "본문 '[보안 확인 실패를 알리는 경고음 두 번]' 및 4단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-SOUND", "PAGE-C09", "DISPLAY-C09-1", "DISPLAY-C09-2"], "user_impact": "소리의 발생 순서와 의미가 본문에 있음."},
      {"original_start_seconds": 16.47, "original_end_seconds": 19.0, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다. / 화면 5/7", "caption_location": "본문 동일 문장 및 5단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-2"], "user_impact": "동일 정보."},
      {"original_start_seconds": 20.0, "original_end_seconds": 26.02, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. / 화면 6/7", "caption_location": "본문 동일 문장 및 6단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-2"], "user_impact": "경고가 본문에 그대로 있음."},
      {"original_start_seconds": 27.45, "original_end_seconds": 29.08, "original_content": "안내자: 발급 완료 화면을 확인합니다. / 화면 7/7", "caption_location": "본문 동일 문장 및 7단계 문구", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "PAGE-C09", "DISPLAY-C09-3"], "user_impact": "동일 정보."}
    ],
    "missing_evidence": ["평가자의 직접 청취·연속 재생 관찰은 없습니다.", "영상 안 진행 막대 외 다른 시각 변화가 없다는 점은 ENCODE-LINK 기록에 의존합니다."],
    "recommendations": [{"change": "수정 필요 없음. 영상이나 본문을 바꿀 때 두 내용이 계속 일치하도록 유지합니다.", "retest": "영상 또는 본문 변경 시 원본 전사·장면 문구와 본문 전체를 다시 대조하고 대안 표시 문구가 유지되는지 확인합니다."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 독립 ASR·음향 측정·프레임 디코드 기록, 본문 텍스트, PNG 9장을 대조한 결과입니다.",
    "comparisons의 대응 위치는 자막이 아니라 예외 검증을 위한 본문 대응을 기록한 것입니다."
  ]
}
```
