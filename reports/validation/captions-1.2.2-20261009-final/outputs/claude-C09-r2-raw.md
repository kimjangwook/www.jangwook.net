# C09 평가 원문 출력

판정: **not_applicable**(매체 대안 예외 확인). 본문(PAGE-C09)은 "이 영상은 아래 설명의 매체 대안입니다. 본문에 없는 추가 정보는 제공하지 않습니다."라고 실제로 표시하고, 독립 전사(SOURCE-ASR)의 대사 6개·화자(SOURCE-AUDIO)·경고음(SOURCE-SOUND)과 PNG(DISPLAY-C09-1~3)에서 판독한 7개 화면 문구가 모두 본문 '전체 설명'에 들어 있어, 영상이 본문에 없는 정보를 더하지 않습니다. 대안이라는 주장만이 아니라 원본 전체와 본문 전체를 대조해 두 조건이 모두 확인되었으므로 자막이 없어도 1.2.2 요구는 적용되지 않습니다. 평가자는 원본을 직접 듣거나 연속 재생하지 않았으며, 음악·배경음 부재는 통제된 구성 기록에 의존합니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C09 — 본문과 교육용 동영상 M1 1개(페이지 하단 내비게이션 제외). track 0개, 본문에 '이 영상은 아래 설명의 매체 대안입니다' 표시와 '전체 설명' 본문 존재.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "본문은 영상이 아래 설명의 매체 대안이며 추가 정보를 제공하지 않는다고 영상 가까이에 명시하고, 원본 대사 6개·경고음·화면 7단계의 문구가 모두 본문 '전체 설명'에 들어 있어 영상이 본문에 없는 정보를 더하지 않음을 확인했습니다. 텍스트의 매체 대안 예외가 성립하므로 자막 요구는 적용되지 않습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C09",
      "PAGE-C09",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C09",
      "DISPLAY-C09-1",
      "DISPLAY-C09-2",
      "DISPLAY-C09-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR: 독립 전사 6개 구간의 문장이 본문 '전체 설명'의 대사와 글자 단위로 일치함을 대조했습니다. 자동 전사는 정답 보증이 아닙니다.",
      "SOURCE-AUDIO: 화자 역할(사용자 4.0–7.0초, 나머지 안내자)이 본문 화자 표기와 일치합니다.",
      "SOURCE-SOUND: 12.2–12.82초 경고음 2회가 본문 '[보안 확인 실패를 알리는 경고음 두 번]'과 대응합니다. 그 외 음악·배경음은 측정되지 않았습니다(unmeasured).",
      "SOURCE-VISUAL/ENCODE-LINK: 정적 화면 7개+진행 막대 구성 기록. DISPLAY-C09-1~3의 9개 시점 PNG에서 7개 화면의 제목·설명·버튼 문구를 판독해 본문 '화면 안내는 다음 일곱 단계' 목록과 대조했습니다.",
      "DELIVERY-C09: tracks=[], 표본 9개 모두 active_cues 없음, PNG에도 개방 자막 없음(예외 성립으로 판정에 영향 없음)."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성)이며, 본문 텍스트의 매체 대안으로 명시 표시됨",
      "classification_evidence_ids": [
        "MEDIA-C09",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C09"
      ],
      "execution": "run",
      "decision": "not_applicable",
      "reason": "매체 대안 예외의 두 조건(본문에 없는 정보 추가 없음, 대안임을 명확히 표시)이 모두 확인되었습니다.",
      "exception": {
        "claimed": true,
        "no_extra_information": true,
        "clearly_labeled": true,
        "verified": true,
        "evidence_ids": [
          "PAGE-C09",
          "SOURCE-ASR",
          "SOURCE-AUDIO",
          "SOURCE-SOUND",
          "SOURCE-VISUAL",
          "DISPLAY-C09-1",
          "DISPLAY-C09-2",
          "DISPLAY-C09-3"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C09",
          "DISPLAY-C09-1",
          "DISPLAY-C09-2",
          "DISPLAY-C09-3"
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
              "PAGE-C09"
            ],
            "reason": "원본 음성 전체 디코드와 영상 전체 프레임 디코드 기록을 본문 전체와 대조한 범위."
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
          "caption_location": "자막 없음. 본문 '전체 설명' 첫 문장(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "본문에 같은 내용과 화자가 있어 영상이 정보를 더하지 않습니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "자막 없음. 본문 '사용자: …'(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "화자 변경까지 본문에 표시되어 있습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "자막 없음. 본문 '안내자: 아니요. …'(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "부정·조건 경고가 본문에 그대로 있습니다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 2회",
          "caption_location": "자막 없음. 본문 '[보안 확인 실패를 알리는 경고음 두 번]'(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C09"
          ],
          "user_impact": "소리 정보도 본문에 있습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "자막 없음. 본문 해당 문장(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "본문에 같은 내용이 있습니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "자막 없음. 본문 해당 문장(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "무효화 경고가 본문에 있습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "자막 없음. 본문 해당 문장(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09"
          ],
          "user_impact": "본문에 같은 내용이 있습니다."
        },
        {
          "original_start_seconds": 0,
          "original_end_seconds": 31.18,
          "original_content": "화면 7단계의 제목·설명·버튼 문구(보안 설정 … 설정으로 돌아가기)",
          "caption_location": "본문 '화면 안내는 다음 일곱 단계입니다' 목록(예외 대조용)",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-VISUAL",
            "DISPLAY-C09-1",
            "DISPLAY-C09-2",
            "DISPLAY-C09-3",
            "PAGE-C09"
          ],
          "user_impact": "PNG에서 판독한 7개 화면 문구가 본문 목록과 일치해 시각 정보도 추가되지 않습니다."
        }
      ],
      "missing_evidence": [
        "평가자의 직접 청취·연속 재생 관찰 없음.",
        "음악·배경음 등 임의 소리는 측정되지 않아, 본문에 없는 소리 정보가 없다는 판단은 통제된 구성 기록(7개 정적 화면, 대사 6개+경고음 1건)에 의존합니다."
      ],
      "recommendations": [
        {
          "change": "변경 불필요. 본문과 영상 내용을 함께 갱신해 영상이 본문에 없는 정보를 더하지 않도록 유지합니다.",
          "retest": "영상 또는 본문이 바뀔 때 전체 음성·화면을 본문과 다시 대조하고 대안 표시 문구가 남아 있는지 확인합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·소리 측정·프레임 디코드 기록·PNG만 검토했습니다.",
    "comparisons는 자막 대조가 아닌 예외 성립을 위한 원본↔본문 대조입니다.",
    "본문 문구의 '대안' 주장 자체가 아니라 원본 내용과 본문의 실제 대조로 예외를 확인했습니다."
  ]
}
```
