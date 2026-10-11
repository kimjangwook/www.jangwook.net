# C07 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **pass**. 매체 M1(open.mp4)에는 HTML 트랙이 없지만(DELIVERY-C07 tracks=[]), 제가 Read한 PNG 3장(DISPLAY-C07-1~3)의 9개 시점 모두에서 영상에 들어간 개방 자막이 보이며, 그 문구는 독립 전사(SOURCE-ASR)·화자 역할(SOURCE-AUDIO)·경고음 측정(SOURCE-SOUND)과 의미·부정·조건·화자·소리가 일치합니다. 각 정보 단위의 원본 구간 안에 해당 자막이 표시되고(예: 경고음 12.2초 직후 12.5초 화면에 소리 자막), ENCODE-LINK가 open.mp4의 음성이 원본과 같은 시간(상관 0.9996)임을 보여 줍니다. 자막 상자가 영상 내부 진행 막대를 덮지만 같은 정보가 "n / 7"로 표시되고 지시 문구·버튼은 가리지 않습니다. 다만 개방 자막의 정확한 시작·종료 시각은 수치로 제공되지 않아 표본 시점과 정적 구조 검증에 근거한 판단입니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C07 — 기사 본문과 교육 영상 1개(M1, open.mp4, 개방 자막 렌더), 페이지 하단 내비게이션 제외. HTML 텍스트 트랙 없음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "pass",
    "reason": "영상에 고정된 개방 자막이 대사 6개와 경고음을 원본과 동등한 의미·화자 표기로 각 원본 구간 안에 표시하며 중요한 시각 정보를 가리지 않음. 트랙 부재는 위반이 아님."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C07", "PAGE-C07", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C07", "DISPLAY-C07-1", "DISPLAY-C07-2", "DISPLAY-C07-3"],
    "derived_processing_and_limits": [
      "ENCODE-LINK: open.mp4(a8f6d95c…)와 원본(60e0e354…)의 전체 PCM 정규화 상관 0.9996, 같은 길이·타이밍. 개방 자막 렌더가 원본 음성 타이밍을 유지함을 뒷받침.",
      "SOURCE-VISUAL: 정적 화면 7개 구조, 큐 내 레이아웃 고정. 개방 자막이 PNG에 보인다는 연결 설명 포함.",
      "DISPLAY-C07-1~3: 평가 모델이 Read로 9개 시점(2, 5, 9.4, 12.5, 15, 17.8, 22, 25, 28.3s)의 실제 화면 자막 문구를 확인.",
      "개방 자막의 시작·종료 시각 수치는 제공되지 않음. 각 원본 단위 구간 내 표본 표시와 정적 구조 검증으로 동기화를 판단.",
      "SOURCE-ASR/SOURCE-AUDIO/SOURCE-SOUND: 원본 문구·화자·경고음. 직접 청취 아님."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화된 동기화 매체(영상+대사+정보성 경고음, 개방 자막 렌더), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C07", "SOURCE-ASR", "SOURCE-SOUND", "ENCODE-LINK", "PAGE-C07"],
    "execution": "run",
    "decision": "pass",
    "reason": "개방 자막이 모든 정보 단위를 equivalent로 제공. 자막 상자의 진행 막대 가림은 중복 정보라 영향 없음.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": ["PAGE-C07"]},
    "caption_delivery": {"kind": "open", "actually_observed": true, "evidence_ids": ["DISPLAY-C07-1", "DISPLAY-C07-2", "DISPLAY-C07-3", "SOURCE-VISUAL", "ENCODE-LINK"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.19, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DISPLAY-C07-1", "DISPLAY-C07-2", "DISPLAY-C07-3"], "reason": "원본 음성 전체와 open.mp4 음성 상관, 전 프레임 디코드 기반 정적 구조, 모든 정보 단위 구간 내 표시 PNG의 교집합. 개방 자막 경계 시각은 수치로 확인하지 못함(limits 참조)."}],
      "unreviewed_ranges": []
    },
    "comparisons": [
      {"original_start_seconds": 1.0, "original_end_seconds": 3.4, "original_content": "안내자: 설정에서 보안을 선택합니다.", "caption_location": "개방 자막(영상 하단 검은 상자), 2s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-1"], "user_impact": "발화 중 동일 문구 표시."},
      {"original_start_seconds": 4.0, "original_end_seconds": 7.0, "original_content": "사용자: 이전 코드를 지금 버려도 되나요?", "caption_location": "개방 자막, 5s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-1"], "user_impact": "'사용자:' 표기로 화자 변경 전달."},
      {"original_start_seconds": 7.6, "original_end_seconds": 11.6, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.", "caption_location": "개방 자막, 9.4s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-1"], "user_impact": "부정·조건 보존."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 2회(보안 확인 실패)", "caption_location": "개방 자막, 12.5s·15s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-SOUND", "PAGE-C07", "DISPLAY-C07-1", "DISPLAY-C07-2"], "user_impact": "경고음 직후부터 15s까지 소리 의미 표시."},
      {"original_start_seconds": 16.42, "original_end_seconds": 19.46, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.", "caption_location": "개방 자막, 17.8s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-2"], "user_impact": "순서 조건 보존."},
      {"original_start_seconds": 20.06, "original_end_seconds": 26.7, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.", "caption_location": "개방 자막(두 줄), 22s·25s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-2"], "user_impact": "긴 문구가 두 줄로 22–25s 이상 유지되어 읽을 수 있음. 플레이어 조작부와 겹치지 않음."},
      {"original_start_seconds": 27.3, "original_end_seconds": 29.58, "original_content": "안내자: 발급 완료 화면을 확인합니다.", "caption_location": "개방 자막, 28.3s 화면", "caption_start_seconds": null, "caption_end_seconds": null, "relation": "equivalent", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DISPLAY-C07-3"], "user_impact": "마지막 안내 전달."}
    ],
    "missing_evidence": [],
    "recommendations": [{"change": "변경 불필요. 선택 사항으로 자막 상자 위치를 조정해 영상 내부 진행 막대가 보이게 할 수 있음.", "retest": "영상 재렌더 시 각 정보 단위 구간의 프레임에서 개방 자막 문구·시작·종료를 다시 확인하고 원본 전사와 대조."}]
  }],
  "errors": [],
  "limits": [
    "개방 자막의 정확한 표시 시작·종료 시각은 제공되지 않았고, 평가 모델은 9개 시점 PNG와 정적 구조·음성 상관 기록으로 동기화를 판단함.",
    "평가 모델은 직접 청취·연속 재생을 하지 않음. 전체 구간 판단은 통제된 7정적 화면 구조 검증에 의존.",
    "PNG의 원호(로딩 표시로 추정)는 자막·지시 문구를 가리지 않음."
  ]
}
```
