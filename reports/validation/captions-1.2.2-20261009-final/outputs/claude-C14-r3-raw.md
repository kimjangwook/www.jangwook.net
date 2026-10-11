# C14 — WCAG 2.2 SC 1.2.2 평가 (prompt 0.1.0)

판정: **not_applicable**. 제공된 실제 수집 기록(PAGE-C14)은 https://jangwook.net/series/accessibility/overview 기사 본문 DOM 전체를 Chromium으로 읽었고(status 200), 기사 안에 audio·video·embed·object·iframe이 하나도 없어 매체 목록이 비어 있다고 기록합니다(actual_media_inventory=[]). 평가 범위 안의 목록이 완전하고 1.2.2 적용 대상인 녹화 동기화 매체가 없으므로 비적용으로 판정했습니다. 다만 입력 상단의 범위 문구에 "this one teaching video"라는 표현이 남아 있어 실제 수집 기록과 어긋나는데, 수집 기록이 기사 전체에서 iframe·embed까지 없음을 명시하므로 판정을 바꾸는 충돌로 보지 않고 한계에 기록했습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "https://jangwook.net/series/accessibility/overview — 기사 본문만(광고·무관 내비게이션·외부 임베드 제외), HTTP 200, Chromium으로 기사 DOM 전체 읽음.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "범위 전체를 읽은 실제 매체 목록이 비어 있음(audio/video/embed/object/iframe 없음). 1.2.2 적용 대상 매체 없음."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": ["PAGE-C14"],
    "derived_processing_and_limits": [
      "PAGE-C14: 'Complete article DOM read by Chromium; no audio/video/embed/object/iframe in article.' actual_media_inventory=[].",
      "평가 모델은 페이지를 직접 방문하지 않았고 제공된 수집 기록만 검토함. PNG 없음."
    ]
  },
  "media": [],
  "errors": [],
  "limits": [
    "입력 최상위 scope 문구('Article content and this one teaching video only')와 PAGE-C14의 실제 범위('Article content only')·빈 매체 목록이 어긋남. 수집 기록이 기사 내 iframe·embed까지 부재를 명시하므로 not_applicable로 판정했으나, 문구가 실제 영상 존재를 뜻한다면 해당 매체의 수집 증거가 필요함.",
    "외부 임베드와 광고는 범위에서 제외되어 평가하지 않음.",
    "관련 기준 안내: 매체가 추가되면 녹화 음성 전용은 1.2.1, 녹화 영상의 자막은 1.2.2, 실시간 매체는 1.2.4로 재평가."
  ]
}
```
