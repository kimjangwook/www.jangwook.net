제공된 전체 기사 DOM 수집 기록과 범위 내 매체 목록에 따르면, 평가 대상 매체가 없어 **not_applicable(적용 대상 없음)**로 판정합니다. 범위 설명에 언급된 강의 영상도 실제 매체 목록에는 없으며, 본문 대안 예외를 적용한 판정은 아닙니다. 제공된 텍스트 기록만 검토했으며, URL 방문이나 원본 음성·영상의 재생은 수행하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "https://jangwook.net/series/accessibility/overview — 제공 기록상 HTTP 200인 게시된 기사. 기사 내용과 지정 강의 영상만 평가 범위이며 페이지 하단 탐색은 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "범위 내 목록이 완전한 것으로 제공되었고, PAGE-C14의 전체 기사 DOM 수집 기록과 실제 매체 목록 모두 매체가 없음을 나타낸다. 평가할 사전 녹화 동기화 매체가 없다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "PAGE-C14"
    ],
    "derived_processing_and_limits": [
      "제공된 텍스트 형태의 목록과 PAGE-C14 수집 기록을 검토했다.",
      "Chromium으로 전체 기사 DOM을 읽었다는 것은 제공된 수집 기록이며, 평가자가 직접 브라우저를 실행한 결과가 아니다.",
      "HTTP 200만으로 적용 대상 없음을 판단하지 않았으며, 전체 기사 DOM의 매체 요소 부재 기록과 완전한 빈 매체 목록을 근거로 삼았다."
    ]
  },
  "media": [],
  "errors": [],
  "limits": [
    "추가 브라우저·음성·영상 처리 도구가 없어 현재 페이지 상태를 독립적으로 재확인하지 않았다.",
    "이 판정은 제공된 수집 상태와 지정 범위에 한정되며, 페이지 하단 탐색이나 범위 밖 콘텐츠 및 다른 WCAG 성공 기준의 적합성을 판단하지 않는다."
  ]
}
```