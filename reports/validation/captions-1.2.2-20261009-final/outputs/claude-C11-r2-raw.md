# C11 평가 원문 출력

판정: **fail**. 본문(PAGE-C11)은 영상이 매체 대안이고 추가 정보가 없다고 표시하지만, 독립 전사(SOURCE-ASR)의 22.76–26.02초 "새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다."는 본문 '전체 설명'과 PNG(DISPLAY-C11-2)의 화면 6/7 문구 어디에도 없어, 영상이 본문에 없는 경고를 더합니다. 따라서 매체 대안 예외가 성립하지 않아 일반 자막 요구를 적용했고, 트랙이 없으며(DELIVERY-C11) 영상 안 자막도 보이지 않아 대사 6개와 경고음이 모두 자막으로 제공되지 않습니다. 평가자는 원본을 직접 듣거나 연속 재생하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C11 — 본문과 교육용 동영상 M1 1개(페이지 하단 내비게이션 제외). track 0개, 본문에 '매체 대안' 표시와 '전체 설명' 본문 존재.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "본문은 영상이 매체 대안이며 추가 정보가 없다고 표시하지만, 원본 22.76–26.02초 '새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.'가 본문 '전체 설명'과 화면 문구 어디에도 없어 영상이 본문에 없는 경고를 더합니다. 예외가 성립하지 않으므로 일반 자막 요구를 적용했고, 트랙과 개방 자막이 모두 없어 모든 대사와 경고음이 자막으로 제공되지 않습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C11",
      "PAGE-C11",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C11",
      "DISPLAY-C11-1",
      "DISPLAY-C11-2",
      "DISPLAY-C11-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR: 22.76–26.02초 '새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.'(단어 확률 0.998–0.9999)를 본문과 대조한 결과 본문에 해당 문장이 없습니다. 자동 전사이므로 정답 보증은 아니나 VOICE-A4(20.06–26.7초) 구간 길이와도 일치합니다.",
      "SOURCE-AUDIO: 화자 역할 확인(사용자 4.0–7.0초, 나머지 안내자).",
      "SOURCE-SOUND: 12.2–12.82초 경고음 2회.",
      "DISPLAY-C11-1~3: 9개 시점 PNG에서 7개 화면 문구를 판독했고, 화면 6/7은 '코드를 안전한 곳에 보관하세요.'만 표시하며 이전 코드 무효화 문구가 없음을 확인했습니다. 영상 안 자막도 없습니다.",
      "DELIVERY-C11: tracks=[], 표본 9개 모두 active_cues 없음."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성), 화면 밖 두 화자 대화와 정보성 이중 경고음 포함, 매체 대안으로 표시되었으나 본문에 없는 정보 포함",
      "classification_evidence_ids": [
        "MEDIA-C11",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C11"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "매체 대안 예외의 '추가 정보 없음' 조건이 실패해 일반 자막 요구를 적용했고, 동기화 자막이 제공되지 않습니다.",
      "exception": {
        "claimed": true,
        "no_extra_information": false,
        "clearly_labeled": true,
        "verified": false,
        "evidence_ids": [
          "PAGE-C11",
          "SOURCE-ASR",
          "SOURCE-AUDIO",
          "DISPLAY-C11-2"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C11",
          "DISPLAY-C11-1",
          "DISPLAY-C11-2",
          "DISPLAY-C11-3"
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
              "DELIVERY-C11",
              "PAGE-C11"
            ],
            "reason": "원본 음성 전체 디코드와 영상 전체 프레임 디코드, 트랙 없음 상태와 본문 전체 대조의 교집합."
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
          "caption_location": "없음(트랙·개방 자막 없음)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C11",
            "DISPLAY-C11-1"
          ],
          "user_impact": "재생 중 음성 안내를 알 수 없습니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "사용자(화면 밖 화자 변경): 이전 코드를 지금 버려도 되나요?",
          "caption_location": "없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C11",
            "DISPLAY-C11-1"
          ],
          "user_impact": "질문과 화자 변경을 알 수 없습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C11",
            "DISPLAY-C11-1"
          ],
          "user_impact": "부정·조건 경고를 재생 중 받을 수 없습니다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 2회",
          "caption_location": "없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C11",
            "DELIVERY-C11",
            "DISPLAY-C11-1",
            "DISPLAY-C11-2"
          ],
          "user_impact": "실패 알림 시점을 알 수 없습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C11",
            "DISPLAY-C11-2"
          ],
          "user_impact": "재확인 순서 조건이 동기화되어 전달되지 않습니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "없음. 본문에는 앞 문장만 있고 뒤 문장(이전 코드 무효화)이 없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C11",
            "DELIVERY-C11",
            "DISPLAY-C11-2"
          ],
          "user_impact": "이전 코드가 무효화된다는 경고는 자막에도 본문에도 화면에도 없어, 소리를 듣지 못하는 이용자는 이 정보를 어떤 경로로도 얻을 수 없습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C11",
            "DISPLAY-C11-3"
          ],
          "user_impact": "화면 7/7 문구와 비슷해 영향은 작지만 자막은 없습니다."
        }
      ],
      "missing_evidence": [
        "평가자의 직접 청취·연속 재생 관찰 없음.",
        "개방 자막 부재는 PNG 9장과 정적 화면 구성 기록에 근거합니다."
      ],
      "recommendations": [
        {
          "change": "동기화 자막(폐쇄 또는 개방)을 화자 표기와 경고음 큐를 포함해 제공합니다.",
          "retest": "실제 플레이어에서 전체를 재생해 각 발화·경고음 시점에 큐가 표시되는지 확인합니다."
        },
        {
          "change": "예외를 유지하려면 본문 '전체 설명'에 '새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.'를 추가해 영상이 본문에 없는 정보를 더하지 않도록 맞춥니다.",
          "retest": "원본 전체 전사와 화면 문구를 본문 전체와 다시 대조해 누락 문장이 없는지 확인합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·소리 측정·프레임 디코드 기록·PNG만 검토했습니다.",
    "본문의 '대안' 표시 문구는 주장일 뿐이며, 원본 전체와 본문 전체의 실제 대조로 예외 불성립을 판단했습니다.",
    "전체 범위 주장은 통제된 7개 정적 화면 픽스처 기록(ENCODE-LINK)에 의존합니다."
  ]
}
```
