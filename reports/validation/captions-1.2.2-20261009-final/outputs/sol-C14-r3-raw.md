제공된 `PAGE-C14`의 전체 본문 DOM 수집 기록과 범위 내 매체 목록에는 음성·영상 매체가 없으므로, WCAG 2.2 성공 기준 1.2.2는 이 평가 범위에서 **not_applicable**입니다. 이는 본문의 매체 대안 예외를 인정한 결과가 아니라, 적용 대상 매체가 없다는 제공 기록에 따른 판정입니다. 제공된 텍스트 자료만 검토했으며, URL 방문이나 직접 청취·영상 재생은 수행하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "https://jangwook.net/series/accessibility/overview — 제공된 기록상 HTTP 200의 게시된 접근성 개요 본문. 평가 범위는 본문과 그 안의 교육 영상이며, 페이지 하단 탐색은 제외됨.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "완전한 범위 내 목록이 비어 있고, PAGE-C14는 전체 본문 DOM에서 audio/video/embed/object/iframe이 없음을 기록한다. 적용 대상인 사전 녹화 동기화 매체가 확인되지 않았다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "PAGE-C14"
    ],
    "derived_processing_and_limits": [
      "제공된 페이지 수집 기록과 빈 매체 목록을 텍스트로 검토했다.",
      "Chromium의 전체 본문 DOM 수집은 제공된 기록의 처리 방법이며, 평가자가 브라우저를 직접 실행한 것은 아니다.",
      "HTTP 200만으로 적용 대상 부재를 판단하지 않고, 전체 본문 DOM 수집 결과와 목록 완전성을 함께 근거로 사용했다."
    ]
  },
  "media": [],
  "errors": [],
  "limits": [
    "추가 브라우저·음성·영상 처리 도구가 없어 제공된 수집 기록을 독립적으로 재확인하지 않았다.",
    "판정은 지정된 본문 범위에 한정되며, 제외된 광고·탐색·외부 삽입물이나 사이트 전체의 적합성을 의미하지 않는다."
  ]
}
```