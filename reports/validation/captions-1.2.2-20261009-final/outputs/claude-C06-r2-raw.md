# C06 평가 원문 출력

판정: **fail**. M1에는 독립 전사·원본 녹음 상관으로 확인된 대사 6구간과 정보성 경고음 2회가 있지만, 실제 플레이어 기록(DELIVERY-C06)은 트랙 0개, 9개 표본 모두 활성 큐 없음이며 표시 PNG(DISPLAY-C06-1~3)에도 영상 안 개방 자막이 보이지 않습니다. 본문(PAGE-C06)의 '전체 설명'은 내용이 충실한 정적 전사문이지만 동기화되지 않으므로 자막을 대신하지 않고, 영상이 본문의 대안이라는 표시도 없어 매체 대안 예외는 성립하지 않습니다. 평가자는 원본을 직접 듣거나 연속 재생하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C06 — 본문과 교육용 동영상 M1 1개(페이지 하단 내비게이션 제외). Chromium에서 track 0개, 본문에 '전체 설명' 전사문 표시.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1에는 대사와 정보성 경고음이 있지만 폐쇄 자막 트랙이 없고(tracks=[]), 9개 시점 표시 PNG에도 영상 안 개방 자막이 보이지 않습니다. 본문의 '전체 설명'은 동기화되지 않은 정적 전사문이며, 영상이 본문의 매체 대안이라는 표시도 없어 예외가 성립하지 않습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C06",
      "PAGE-C06",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C06",
      "DISPLAY-C06-1",
      "DISPLAY-C06-2",
      "DISPLAY-C06-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR/SOURCE-AUDIO: 대사 6구간(안내자 5, 사용자 1). 자동 전사·통제된 출처 대응의 한계가 있습니다.",
      "SOURCE-SOUND: 12.2–12.82초 경고음 2회. 의미는 PAGE-C06 안내문 기준.",
      "DELIVERY-C06: metadata tracks=[], 9개 표본 모두 active_cues 빈 배열.",
      "DISPLAY-C06-1~3: 9개 시점 PNG를 Read로 검토해 영상 프레임 안에 자막 텍스트가 없음을 확인했습니다. SOURCE-VISUAL은 749프레임이 정적 안내 화면 7개와 진행 막대로 구성된다고 기록합니다(평가자는 PNG만 직접 봄).",
      "PAGE-C06: 본문 '전체 설명'은 대사·경고음·화면 문구를 담은 전사문이지만 시간 동기화가 없고, 영상이 이 본문의 대안이라는 문구가 없습니다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성), 화면 밖 두 화자 대화와 정보성 이중 경고음 포함, 음소거 원본 아님",
      "classification_evidence_ids": [
        "MEDIA-C06",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C06"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "동기화 자막(폐쇄·개방)이 제공되지 않아 모든 대사와 경고음이 재생 중 전달되지 않습니다. 정적 전사문은 자막을 대신하지 않습니다.",
      "exception": {
        "claimed": false,
        "no_extra_information": null,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C06"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C06",
          "DISPLAY-C06-1",
          "DISPLAY-C06-2",
          "DISPLAY-C06-3"
        ]
      },
      "coverage": {
        "complete": true,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.189,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-SOUND",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C06"
            ],
            "reason": "원본 음성 전체 디코드와 영상 전체 프레임 디코드, 트랙 없음 상태 기록의 교집합. 표시 상태는 9개 시점 PNG로 확인."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.189,
            "end_seconds": 31.208,
            "reason": "디코드된 음성 길이 이후 약 0.02초 꼬리."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1.0,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "없음(트랙 없음, 2초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-1"
          ],
          "user_impact": "재생 중 음성 안내를 알 수 없습니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "사용자(화면 밖 화자 변경): 이전 코드를 지금 버려도 되나요?",
          "caption_location": "없음(5초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-1"
          ],
          "user_impact": "화면 2/7은 '질문과 답변을 듣고'라고만 하여 질문 내용과 화자를 알 수 없습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "없음(9.4초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-1"
          ],
          "user_impact": "부정 답변과 조건부 금지 경고를 재생 중 받을 수 없습니다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 2회",
          "caption_location": "없음(12.5초·15초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C06",
            "DELIVERY-C06",
            "DISPLAY-C06-1",
            "DISPLAY-C06-2"
          ],
          "user_impact": "실패 알림 시점을 알 수 없고 화면 4/7에는 결과가 표시되지 않습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "없음(17.8초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-2"
          ],
          "user_impact": "화면 문구와 비슷하지만 '다시' 해야 하는 이유와 순서 조건이 동기화되어 전달되지 않습니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "없음(22초·25초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-2"
          ],
          "user_impact": "이전 코드 무효화 경고는 화면 6/7 문구에 없어 재생 중 전혀 전달되지 않습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "없음(28.3초 화면 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-3"
          ],
          "user_impact": "화면 7/7 문구와 거의 같아 영향은 작지만 음성 정보 자체는 자막으로 제공되지 않습니다."
        }
      ],
      "missing_evidence": [
        "평가자의 직접 청취·연속 재생 관찰 없음.",
        "개방 자막 부재는 PNG 9장과 정적 화면 구성 기록에 근거하며, 평가자가 전체 프레임을 직접 본 것은 아닙니다."
      ],
      "recommendations": [
        {
          "change": "kind=captions 한국어 트랙을 추가해 화자 표기가 있는 대사 큐 6개와 12.2초 경고음 큐를 원본 시간에 맞춰 제공하거나, 같은 내용을 영상에 개방 자막으로 넣습니다. 본문 전사문은 보조 자료로 유지할 수 있습니다.",
          "retest": "실제 플레이어에서 자막을 켜고 전체를 재생해 각 발화·경고음 시점에 큐가 표시되고 화면 정보를 가리지 않는지 확인합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·소리 측정·프레임 디코드 기록·PNG만 검토했습니다.",
    "본문 전사문의 존재는 1.2.1 등 다른 기준과 관련될 수 있으나 이 평가는 1.2.2 동기화 자막 요구만 판정합니다.",
    "전체 범위 주장은 통제된 7개 정적 화면 픽스처 기록(ENCODE-LINK)에 의존합니다."
  ]
}
```
