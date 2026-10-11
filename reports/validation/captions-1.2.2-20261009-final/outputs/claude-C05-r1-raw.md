# C05 평가 결과 (WCAG 2.2 SC 1.2.2, 수준 A)

판정: **fail**. 자막 문구는 원본과 같지만 DELIVERY-C05의 큐 7개가 SOURCE-ASR·SOURCE-AUDIO·SOURCE-SOUND의 원본 구간보다 모두 약 5초 늦게 배치되어 있고, 실제 Read한 PNG(DISPLAY-C05-1~3)에서 2·5·12.5·25초에는 자막이 없으며 각 대사와 경고음 큐가 다음 장면 단계 위에 표시됩니다. 예를 들어 보안 확인 실패 경고음(12.2초)의 큐는 17.2초 '보안 확인 다시 하기' 화면에서야 나타나 결과 화면의 의미를 놓치게 됩니다. 마지막 큐 A5(32.3~34.58초)는 매체 길이 31.21초 이후여서 표시될 수 없습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C05 — 기사 본문과 교육용 동영상 1개(M1) 범위, 하단 내비게이션 제외. Chromium에서 한국어 captions 트랙 mode=showing 상태.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "모든 큐가 원본 음성·경고음보다 약 5초 늦게 시작해 대사·소리와 화면 단계가 어긋나고, 마지막 큐 A5(32.3~34.58초)는 매체 길이 31.21초를 넘어 표시될 수 없습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C05", "PAGE-C05", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C05", "DISPLAY-C05-1", "DISPLAY-C05-2", "DISPLAY-C05-3"],
    "derived_processing_and_limits": [
      "원본 음성 시간은 SOURCE-ASR(독립 전사)과 SOURCE-AUDIO(분리 녹음 상관 구간)로 확인했으며 평가자는 직접 청취하지 않았습니다.",
      "경고음 시점은 SOURCE-SOUND 펄스(12.2~12.82초)로 확인했습니다.",
      "화면 단계 시간은 ENCODE-LINK의 7개 정적 장면 구간 기록에 근거합니다.",
      "DISPLAY-C05-1~3의 9개 시점 PNG를 실제로 Read했습니다. 2초·5초·12.5초·25초에 자막이 없고, 9.4초에 3/7 화면 위로 사용자 질문, 15초에 4/7 화면 위로 안내자 답변, 17.8초에 5/7 화면 위로 경고음 큐, 22초에 6/7 화면 위로 A3, 28.3초에 7/7 화면 위로 A4가 표시됨을 확인했습니다."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "사전 녹화 동기화 매체(영상+대화 음성+정보성 경고음), 음소거 원본 아님",
    "classification_evidence_ids": ["MEDIA-C05", "SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND"],
    "execution": "run",
    "decision": "fail",
    "reason": "문구는 원본과 같지만 큐 7개가 모두 약 5초 늦어 각 대사와 경고음이 다음 장면에서 표시됩니다. A5는 매체 종료 후로 배치되어 표시되지 않고, A4도 매체 종료로 31.21초에서 잘립니다.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": []},
    "caption_delivery": {"kind": "closed", "actually_observed": true, "evidence_ids": ["DELIVERY-C05", "DISPLAY-C05-1", "DISPLAY-C05-2", "DISPLAY-C05-3"]},
    "coverage": {
      "complete": true,
      "processed_ranges": [{"start_seconds": 0, "end_seconds": 31.189, "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "SOURCE-SOUND", "SOURCE-VISUAL", "ENCODE-LINK", "DELIVERY-C05", "DISPLAY-C05-1", "DISPLAY-C05-2", "DISPLAY-C05-3"], "reason": "원본 음성 전체 전사·음향 측정·전체 프레임 디코드 기록, 큐 목록 전체, 9개 시점 PNG의 교집합. 평가자의 직접 관찰은 PNG 시점에 한정."}],
      "unreviewed_ranges": [{"start_seconds": 31.189, "end_seconds": 31.208, "reason": "메타데이터 길이와 디코드 음성 길이의 차이 0.02초. 별도 관찰 없음."}]
    },
    "comparisons": [
      {"original_start_seconds": 0.94, "original_end_seconds": 3.04, "original_content": "안내자: 설정에서 보안을 선택합니다. (1/7 화면)", "caption_location": "큐 A1, line 76", "caption_start_seconds": 6, "caption_end_seconds": 8.4, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C05", "DISPLAY-C05-1"], "user_impact": "2초 화면에 자막이 없고, 대사가 끝난 뒤 약 3초 후 사용자 질문 시간과 2/7·3/7 화면에서 표시되어 어느 단계 안내인지 혼동됩니다."},
      {"original_start_seconds": 3.8, "original_end_seconds": 6.56, "original_content": "사용자: 이전 코드를 지금 버려도 되나요? (2/7 화면)", "caption_location": "큐 B1, line 76", "caption_start_seconds": 9, "caption_end_seconds": 12, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C05", "DISPLAY-C05-1"], "user_impact": "5초 화면에는 자막이 없고, 질문이 안내자의 답변 시간·3/7 화면에서 표시되어 질문과 답변 순서가 어긋납니다."},
      {"original_start_seconds": 7.71, "original_end_seconds": 11.18, "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요. (3/7 화면)", "caption_location": "큐 A2, line 76", "caption_start_seconds": 12.6, "caption_end_seconds": 16.6, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C05", "DISPLAY-C05-1", "DISPLAY-C05-2"], "user_impact": "경고 지시가 '코드를 버리기 전에' 화면이 지나간 뒤 '보안 확인 결과' 화면에서 나타나 단계와 지시의 연결이 끊깁니다."},
      {"original_start_seconds": 12.2, "original_end_seconds": 12.82, "original_content": "경고음 두 번(보안 확인 실패, 4/7 '보안 확인 결과' 화면)", "caption_location": "큐 SFX, line 76", "caption_start_seconds": 17.2, "caption_end_seconds": 20.82, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-SOUND", "PAGE-C05", "DELIVERY-C05", "DISPLAY-C05-1", "DISPLAY-C05-2"], "user_impact": "12.5초 결과 화면에서는 자막이 없고 실패 알림이 5초 뒤 '보안 확인 다시 하기' 화면과 다음 대사 시간에 나타나 결과 화면이 실패를 뜻함을 알 수 없습니다."},
      {"original_start_seconds": 16.47, "original_end_seconds": 19.0, "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다. (5/7 화면)", "caption_location": "큐 A3, line 76", "caption_start_seconds": 21.42, "caption_end_seconds": 24.46, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C05", "DISPLAY-C05-2"], "user_impact": "6/7 '새 코드 저장' 화면에서 재확인 지시가 표시되어 단계 혼동."},
      {"original_start_seconds": 20.0, "original_end_seconds": 26.02, "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. (6/7 화면)", "caption_location": "큐 A4, line 76", "caption_start_seconds": 25.06, "caption_end_seconds": 31.7, "relation": "timing_mismatch", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "DELIVERY-C05", "DISPLAY-C05-2", "DISPLAY-C05-3"], "user_impact": "25초 화면에는 자막이 없고, 경고가 7/7 '발급 완료' 화면에서야 표시되며 매체 종료(31.21초)로 끝부분 표시 시간도 줄어듭니다."},
      {"original_start_seconds": 27.45, "original_end_seconds": 29.08, "original_content": "안내자: 발급 완료 화면을 확인합니다. (7/7 화면)", "caption_location": "큐 A5, 매체 길이 이후", "caption_start_seconds": 32.3, "caption_end_seconds": 34.58, "relation": "missing", "evidence_ids": ["SOURCE-ASR", "SOURCE-AUDIO", "MEDIA-C05", "DELIVERY-C05", "DISPLAY-C05-3"], "user_impact": "큐 시작이 매체 길이 31.21초 이후라 재생 중 표시되지 않습니다. 28.3초 화면에는 A4가 대신 표시됨을 확인했습니다."}
    ],
    "missing_evidence": ["평가자의 직접 청취·연속 재생 관찰은 없습니다.", "A5가 종료 후 별도 상태로 표시되는지에 대한 플레이어 관찰은 없으나 매체 길이를 넘는 큐는 재생 중 표시되지 않습니다."],
    "recommendations": [{"change": "모든 큐 시간을 약 5초 앞당겨 원본 음성·경고음 구간에 맞춥니다(예: A1 1~3.4, B1 4~7, A2 7.6~11.6, SFX 12.2~15.82, A3 16.42~19.46, A4 20.06~26.7, A5 27.3~29.58).", "retest": "수정된 트랙으로 각 큐 활성 시점 화면을 다시 캡처해 원본 구간·장면과 대조하고, 마지막 큐가 매체 길이 안에 표시되는지 확인합니다."}]
  }],
  "errors": [],
  "limits": [
    "직접 청취나 연속 재생 없이 독립 ASR·음향 측정·프레임 디코드 기록과 PNG 9장을 검토한 결과입니다.",
    "약 5초라는 지연 값은 고정 합격선이 아니라 각 대사가 다른 화면 단계에 표시되는 실제 영향을 근거로 판정했습니다."
  ]
}
```
