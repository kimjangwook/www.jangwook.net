**판정은 inconclusive(판정 불가)**입니다. 첨부 화면과 독립 처리 기록에서 개방 자막이 제공되며, 대사의 의미·화면 밖 화자·보안 확인 실패를 알리는 두 번의 경고음이 자막에 반영된 것을 확인했습니다. 다만 실제 자막의 시작·종료 시각 목록이 제공되지 않아 전체 구간의 동기화와 긴 자막의 총 표시 시간을 충분히 검증할 수 없습니다. 직접 청취하거나 연속 재생하지 않았으며, HTML `track`이 없다는 사실은 위반으로 처리하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C07 — 제공된 Chromium 페이지 상태와 첨부 PNG 검토. 기사 본문 및 교육 영상 M1만 포함하며 푸터 탐색은 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "inconclusive",
    "reason": "제공된 목록은 범위 내 완전하다. 개방 자막의 제공과 모든 식별된 정보 단위의 의미 대응은 확인되지만, 실제 자막 경계 시각이 없어 전체 동기화와 읽기 지속 시간의 충분성을 확정하지 못했다. 확인된 위반은 없다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C07",
      "PAGE-C07",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C07",
      "DISPLAY-C07-1",
      "DISPLAY-C07-2",
      "DISPLAY-C07-3"
    ],
    "derived_processing_and_limits": [
      "실행 가능한 브라우저·음성·영상 도구 없이 제공된 처리 기록과 실제 첨부 PNG를 검토했다. URL 방문이나 직접 재생을 수행하지 않았다.",
      "SOURCE-ASR은 후보 자막을 사용하지 않은 독립 음성 인식 기록이다. 인식 결과와 단어 시각에는 오류 가능성이 있으며 확률값만으로 정확성을 보증하지 않았다.",
      "SOURCE-AUDIO는 독립 원본 녹음과 실제 디코딩 음성의 상관 분석으로 화자와 녹음 구간을 연결한다. 일반적인 화자 분리 성능을 입증하는 자료는 아니다.",
      "SOURCE-SOUND의 두 펄스 측정과 PAGE-C07의 실제 안내를 함께 사용해 경고음의 의미를 확인했다.",
      "ENCODE-LINK는 다른 해시의 독립 원본과 자막 포함 영상 사이의 동일 시각 음성 연결을 뒷받침한다. 후보 자막을 원본 전사로 재사용하지 않았다.",
      "SOURCE-VISUAL의 전체 749프레임 디코딩 및 고정 화면 구성 검증은 이 통제된 영상에 한정해 사용했다. 전체 프레임 디코딩을 평가자의 연속 시청으로 표현하지 않았다.",
      "기록에는 모든 자막 큐를 읽고 활성 상태에서 표본을 확인했다고 되어 있으나, 실제 큐 시작·종료 목록은 입력에 없다. 화면 상태 경계를 자막 경계로 대신 사용하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 정보성 경고음이 포함된 사전 녹화 동기화 영상으로, 1.2.2 적용 대상",
      "classification_evidence_ids": [
        "MEDIA-C07",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C07",
        "ENCODE-LINK"
      ],
      "execution": "run",
      "decision": "inconclusive",
      "reason": "첨부 화면의 개방 자막은 독립 전사의 대사 의미, 화자 및 중요한 경고음을 전달한다. 표본에서 누락·의미 반전·가림은 확인되지 않았다. 다만 전체 자막의 경계 시각과 총 표시 시간을 확인할 자료가 부족하다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C07",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "open",
        "actually_observed": true,
        "evidence_ids": [
          "SOURCE-VISUAL",
          "ENCODE-LINK",
          "DELIVERY-C07",
          "DISPLAY-C07-1",
          "DISPLAY-C07-2",
          "DISPLAY-C07-3"
        ]
      },
      "coverage": {
        "complete": false,
        "processed_ranges": [
          {
            "start_seconds": 2,
            "end_seconds": 2,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "ENCODE-LINK",
              "DISPLAY-C07-1"
            ],
            "reason": "해당 시점의 원본 대사와 실제 개방 자막·배치를 비교했다. 자막 전체 표시 구간은 미확인이다."
          },
          {
            "start_seconds": 5,
            "end_seconds": 5,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "ENCODE-LINK",
              "DISPLAY-C07-1"
            ],
            "reason": "질문 대사와 사용자 화자 표시를 해당 시점에서 확인했다."
          },
          {
            "start_seconds": 9.4,
            "end_seconds": 9.4,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "ENCODE-LINK",
              "DISPLAY-C07-1"
            ],
            "reason": "저장 전 폐기 금지 조건과 부정 표현을 해당 시점에서 확인했다."
          },
          {
            "start_seconds": 12.5,
            "end_seconds": 15,
            "evidence_ids": [
              "SOURCE-SOUND",
              "PAGE-C07",
              "SOURCE-VISUAL",
              "DISPLAY-C07-1",
              "DISPLAY-C07-2"
            ],
            "reason": "양 끝 화면에 같은 경고음 자막이 있으며, 제공된 고정 배치·유지 자막 기록으로 그 사이의 표시를 뒷받침한다. 첫 펄스 시점의 표시 여부와 정확한 자막 경계는 미확인이다."
          },
          {
            "start_seconds": 17.8,
            "end_seconds": 17.8,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "ENCODE-LINK",
              "DISPLAY-C07-2"
            ],
            "reason": "보안 확인을 다시 마친 뒤 발급을 확인하는 순서를 해당 시점에서 확인했다."
          },
          {
            "start_seconds": 22,
            "end_seconds": 25,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DISPLAY-C07-2"
            ],
            "reason": "양 끝 화면에서 같은 두 문장 자막을 확인했으며 고정 큐 기록이 사이 표시를 뒷받침한다. 최소 3초의 유지는 확인되나 총 표시 시간은 미확인이다."
          },
          {
            "start_seconds": 28.3,
            "end_seconds": 28.3,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "ENCODE-LINK",
              "DISPLAY-C07-3"
            ],
            "reason": "발급 완료 확인 대사와 실제 자막을 해당 시점에서 비교했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.208333,
            "reason": "전체 원본 처리·구성 기록은 검토했지만, 위 확인 시점·유지 구간을 제외한 실제 자막 표시와 모든 큐의 시작·종료 경계는 검증하지 못했다. 이 항목은 원본 전체를 처리하지 않았다는 뜻이 아니라 자막 시간 대응의 미완료 범위이다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 0.94,
          "original_end_seconds": 3.04,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "DISPLAY-C07-1의 2초 화면 하단: 안내자: 설정에서 보안을 선택합니다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1",
            "ENCODE-LINK"
          ],
          "user_impact": "설정 선택 지시와 화자를 전달한다. 의미 대응은 확인했으나 전체 표시 시간은 미확인이다."
        },
        {
          "original_start_seconds": 3.8,
          "original_end_seconds": 6.56,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "DISPLAY-C07-1의 5초 화면 하단: 사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1",
            "ENCODE-LINK"
          ],
          "user_impact": "질문의 의미와 화면 밖 화자 변경을 전달한다. 전체 표시 시간은 미확인이다."
        },
        {
          "original_start_seconds": 7.71,
          "original_end_seconds": 11.18,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "DISPLAY-C07-1의 9.4초 화면 하단에 같은 의미의 안내자 자막 표시",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1",
            "ENCODE-LINK"
          ],
          "user_impact": "폐기 금지와 저장 전이라는 조건을 보존한다. 해당 화면에서는 가림이 없으나 총 읽기 시간은 미확인이다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2–12.4초 및 12.62–12.82초의 두 경고음. 실제 본문은 보안 확인 실패를 뜻한다고 설명한다.",
          "caption_location": "DISPLAY-C07-1의 12.5초 및 DISPLAY-C07-2의 15초 화면 하단: [보안 확인 실패를 알리는 경고음 두 번]",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "SOURCE-AUDIO",
            "PAGE-C07",
            "SOURCE-VISUAL",
            "DISPLAY-C07-1",
            "DISPLAY-C07-2"
          ],
          "user_impact": "소리의 횟수와 실패 의미를 전달한다. 유지 표시는 확인되지만 첫 경고음과의 시작 시각 대응은 미확인이다."
        },
        {
          "original_start_seconds": 16.47,
          "original_end_seconds": 19,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "DISPLAY-C07-2의 17.8초 화면 하단에 같은 내용의 안내자 자막 표시",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-2",
            "ENCODE-LINK"
          ],
          "user_impact": "보안 확인 후 발급 확인이라는 순서를 보존한다. 전체 표시 시간은 미확인이다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "DISPLAY-C07-2의 22초·25초 화면 하단, 두 문장 자막의 첫 문장",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "SOURCE-VISUAL",
            "DISPLAY-C07-2",
            "ENCODE-LINK"
          ],
          "user_impact": "안전한 저장 지시를 전달한다. 두 문장을 함께 표시하므로 총 표시 시간에 대한 추가 확인이 필요하다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "DISPLAY-C07-2의 22초·25초 화면 하단, 두 문장 자막의 둘째 문장",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "SOURCE-VISUAL",
            "DISPLAY-C07-2",
            "ENCODE-LINK"
          ],
          "user_impact": "재발급 조건과 이전 코드 사용 불가라는 중요한 부정을 보존한다. 표본에서는 두 줄 모두 보이지만 읽기 지속 시간의 충분성은 확정하지 못했다."
        },
        {
          "original_start_seconds": 27.45,
          "original_end_seconds": 29.08,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "DISPLAY-C07-3의 28.3초 화면 하단: 안내자: 발급 완료 화면을 확인합니다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-3",
            "ENCODE-LINK"
          ],
          "user_impact": "마지막 확인 지시와 화자를 전달한다. 전체 표시 시간은 미확인이다."
        }
      ],
      "missing_evidence": [
        "개방 자막 각각의 실제 렌더링 시작·종료 시각과 표시 문구 목록. 제작 목록을 제공한다면 실제 영상 프레임과의 일치 근거도 필요하다.",
        "자막 경계 전후의 실제 프레임 또는 시간별 표시 기록. 특히 첫 경고음 시점과 두 문장 자막의 전체 표시 구간을 확인할 자료가 필요하다.",
        "긴 두 문장 자막을 해당 소리·화면과 함께 읽을 수 있는지 판단할 총 표시 시간 및 실제 표시 관찰."
      ],
      "recommendations": [
        {
          "change": "현재 확인된 내용만으로 자막 수정을 요구하지 않는다. 누락된 실제 표시 시간 자료를 보완한다.",
          "retest": "각 자막의 렌더링 경계를 원본 대사·경고음 구간과 대조하고, 긴 자막의 전체 유지 시간과 조작부가 표시된 상태의 가림 여부를 확인한다. 충분하면 pass로, 실제 위반이 확인되면 해당 시간과 최소 수정안을 붙여 fail로 갱신한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "run은 제공된 텍스트 기록과 첨부 PNG의 검토를 뜻하며, 원본 매체의 직접 청취·연속 시청 또는 새 브라우저 실행을 뜻하지 않는다.",
    "독립 원본 해시와 제공 영상 해시의 차이는 ENCODE-LINK의 음성·구성 연결 자료로 검토했다. 해시 차이 자체를 오류나 위반으로 처리하지 않았다.",
    "comparisons의 equivalent는 확인된 의미 대응을 나타낸다. null인 자막 경계 시각의 동기화나 읽기 시간까지 적합하다고 선언하는 값은 아니다.",
    "전체 디코딩과 고정 화면 구성 기록은 인정했지만, 제공되지 않은 실제 자막 경계 시각을 화면 상태 시각으로 추정하지 않았다.",
    "이 판정은 지정 범위의 WCAG 2.2 성공 기준 1.2.2 수준 A만 대상으로 하며 사이트 적합성 인증이나 다른 성공 기준의 판정이 아니다."
  ]
}
```