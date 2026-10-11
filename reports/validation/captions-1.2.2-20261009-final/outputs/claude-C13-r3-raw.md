# C13 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **inconclusive**(실행: **error**). 매체 M1의 원본 파일 수집이 실패했습니다. 브라우저 기록(DELIVERY-C13)에 HTTP 404, 미디어 오류 코드 4, readyState 0이 남아 있고, 원본 해시·길이·전사·소리·화면 증거가 모두 없습니다(MEDIA-C13, original/audio/visual=null, PNG 없음). 페이지 문구(PAGE-C13)는 화면 밖 대화와 경고음을 언급하지만, 그 문구만으로 실제 매체의 음성·소리 존재와 내용을 확인할 수 없으므로 적용 여부도 자막 충분성도 판단하지 않았습니다. 수집 오류를 fail이나 not_applicable로 바꾸지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C13 — 기사 본문과 교육 영상 1개(M1, unavailable.mp4), 페이지 하단 내비게이션 제외. 매체 요청 404, 텍스트 트랙 없음.",
    "inventory_complete_within_scope": true,
    "execution": "error",
    "decision": "inconclusive",
    "reason": "원본 매체 수집 실패(HTTP 404, media error 4)로 매체 분류·음성·소리·자막 표시를 확인할 수 없음. 위반도 비적용도 확인되지 않음."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["MEDIA-C13", "PAGE-C13", "DELIVERY-C13"],
    "derived_processing_and_limits": [
      "DELIVERY-C13: Failed collection. source_error {error: 4, readyState: 0}, 응답 status 404(…/unavailable.mp4).",
      "MEDIA-C13: source_sha256·duration null, 분류 미확정.",
      "PAGE-C13: 매체 설명 문구('화면 밖의 안내자와 사용자가 대화합니다. 두 번의 경고음은…')와 track=[]. 문구는 매체 내용의 증거가 아님.",
      "원본 전사·소리 측정·화면 처리·표시 PNG는 제공되지 않음."
    ]
  },
  "media": [{
    "media_id": "M1",
    "classification": "미확정(원본 접근 불가)",
    "classification_evidence_ids": ["MEDIA-C13", "DELIVERY-C13"],
    "execution": "error",
    "decision": "inconclusive",
    "reason": "원본을 불러오지 못해 녹화 동기화 매체인지, 어떤 음성·소리가 있는지, 자막 표시가 어떤지 확인 불가.",
    "exception": {"claimed": false, "no_extra_information": null, "clearly_labeled": null, "verified": false, "evidence_ids": []},
    "caption_delivery": {"kind": "unknown", "actually_observed": false, "evidence_ids": ["PAGE-C13", "DELIVERY-C13"]},
    "coverage": {
      "complete": false,
      "processed_ranges": [],
      "unreviewed_ranges": [{"start_seconds": null, "end_seconds": null, "reason": "원본 길이 미상, 전 구간 미처리(수집 실패)."}]
    },
    "comparisons": [],
    "missing_evidence": [
      "접근 가능한 원본 매체 파일 또는 그 해시·길이·트랙 정보",
      "원본 음성의 독립 전사와 화자 근거",
      "중요한 소리 측정 기록",
      "원본 화면 처리 기록과 자막 표시 PNG",
      "실제 플레이어에서 로드된 자막(트랙 또는 개방 자막) 상태"
    ],
    "recommendations": [{"change": "매체 URL(unavailable.mp4)의 404를 해결해 원본을 제공. 1.2.2 판정 전 원본·자막 증거 수집 필요.", "retest": "매체 로드 성공(readyState>0, 200 응답) 후 원본 전체 전사·소리 측정·자막 표시를 수집해 다시 평가."}]
  }],
  "errors": [{"evidence_ids": ["DELIVERY-C13"], "stage": "원본 매체 수집(브라우저 로드)", "error": "HTTP 404, HTMLMediaElement error code 4, readyState 0 (…/labs/accessibility/captions/ko/unavailable.mp4)", "effect_on_decision": "원본·표시 증거가 없어 판정 불가(inconclusive). 오류를 fail 또는 not_applicable로 변환하지 않음."}],
  "limits": [
    "평가 모델은 제공된 텍스트만 읽었고 첨부 PNG가 없음. 직접 청취·재생 없음.",
    "404 매체 자체가 이용자에게 미치는 영향은 1.2.2 자막 충분성과 별개이며 이 판정에 포함하지 않음."
  ]
}
```
