**판정: fail — 평가 범위의 M1에서 WCAG 2.2 성공 기준 1.2.2 위반을 확인했습니다.** 독립 원본 전사는 “새 복구 코드를 저장하기 전에는 버리지 마세요”라고 기록하지만, 실제 표시된 A2 자막은 “저장하기 전에 버리세요”로 금지와 조건의 의미를 반대로 전달합니다. 폐쇄 자막의 실제 표시, 화자 구분, 중요한 경고음 설명은 확인했으나, 이러한 제공 사실이 A2의 의미 오류를 상쇄하지는 않습니다. 이 평가는 제공된 처리 기록과 첨부 PNG 검토에 근거하며, 직접 청취하거나 영상을 연속 재생한 결과는 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C02 — 제공된 Chromium 페이지 상태의 기사 본문과 교육 영상 M1만 평가; 페이지 하단 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 유일한 녹화 동기화 매체 M1의 A2 자막이 원본의 폐기 금지를 폐기 지시로 바꾸어 전달한다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C02",
      "PAGE-C02",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C02",
      "DISPLAY-C02-1",
      "DISPLAY-C02-2",
      "DISPLAY-C02-3"
    ],
    "derived_processing_and_limits": [
      "제공된 텍스트 기록과 첨부 PNG를 검토했다. 새 브라우저 실행, 원본 직접 청취, 연속 영상 재생은 하지 않았다.",
      "SOURCE-ASR은 원본 해시가 연결된 MP4 음성을 faster-whisper large-v3로 독립 처리한 기록이다. 후보 자막이나 제작 대본을 사용하지 않았지만 인식 오류 가능성과 근사 단어 시각의 한계가 있다.",
      "SOURCE-AUDIO는 분리된 원본 녹음과 실제 MP4 음성의 상관 분석으로 화자와 녹음 구간을 연결한다. 이 분석 자체가 발화 문장의 정확성을 증명하지는 않는다.",
      "SOURCE-SOUND의 두 음 측정과 PAGE-C02의 실제 안내 문구를 함께 사용하여 경고음의 횟수와 보안 확인 실패라는 의미를 확인했다.",
      "SOURCE-VISUAL과 ENCODE-LINK는 전체 749프레임 디코딩, 고정된 일곱 화면 구성, 동일 음성 연결을 기록한다. 첨부 PNG에서 모든 자막 큐의 표시를 확인했으며, 표본을 구간 전체로 연결하는 근거는 이 통제된 고정 구성에 한정된다.",
      "긴 A4 자막은 6.64초 동안 제공되며 22초와 25초 PNG에서 전체 문장이 표시되고 본문이나 조작부에 가려지지 않는다. 이를 임의의 고정 읽기 속도 합격선으로 평가하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 정보성 이중 경고음을 포함한 사전 녹화 동기화 영상; 1.2.2 적용 대상.",
      "classification_evidence_ids": [
        "MEDIA-C02",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "A2의 실제 표시 문구가 독립 원본 전사의 부정과 저장 전 조건을 반대로 전달한다. 9.4초 화면의 '새 코드의 저장 상태를 먼저 확인하세요'라는 원본 안내도 해당 자막과 충돌한다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C02",
          "SOURCE-ASR",
          "DISPLAY-C02-1"
        ]
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C02",
          "DISPLAY-C02-1",
          "DISPLAY-C02-2",
          "DISPLAY-C02-3"
        ]
      },
      "coverage": {
        "complete": false,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.1893125,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C02",
              "DISPLAY-C02-1",
              "DISPLAY-C02-2",
              "DISPLAY-C02-3"
            ],
            "reason": "독립 음성 처리와 원본 화면 처리 및 자막 표시 검증 범위의 교집합. 고정 화면 구성 검증을 바탕으로 모든 대사와 경고음의 대응을 검토했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "영상 끝의 약 0.019초는 독립 전사 처리 범위를 벗어나 교집합에서 제외했다. 추가 대사나 소리를 관찰한 것은 아니며, 확인된 A2 위반 판정에는 영향이 없다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "한국어 폐쇄 자막 A1, line 76; 2초 PNG",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "설정 단계와 화면 밖 화자를 자막으로 알 수 있다. 표본 화면에서 가림을 확인하지 않았다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "한국어 폐쇄 자막 B1, line 76; 5초 PNG",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "질문 내용과 사용자로의 화자 변경이 전달된다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요. 독립 ASR 발화 구간은 약 7.71–11.18초.",
          "caption_location": "한국어 폐쇄 자막 A2, line 76; 9.4초 PNG: '안내자: 네. 새 복구 코드를 저장하기 전에 버리세요.'",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "inaccurate",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "자막 이용자는 저장 전에 이전 코드를 폐기하라는 반대 지시를 받는다. 안전한 처리 순서와 핵심 금지 의미를 오해할 수 있다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 두 번: 12.2–12.4초 및 12.62–12.82초.",
          "caption_location": "한국어 폐쇄 자막 SFX, line 76; 12.5초와 15초 PNG: '[보안 확인 실패를 알리는 경고음 두 번]'",
          "caption_start_seconds": 12.2,
          "caption_end_seconds": 15.82,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C02",
            "DELIVERY-C02",
            "DISPLAY-C02-1",
            "DISPLAY-C02-2"
          ],
          "user_impact": "소리를 듣지 않아도 경고음의 횟수와 실패 의미를 알 수 있다. 경고 시작에 맞춰 표시되고 다음 대사 전에 종료된다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "한국어 폐쇄 자막 A3, line 76; 17.8초 PNG",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2"
          ],
          "user_impact": "보안 확인을 먼저 완료해야 한다는 순서가 전달된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 시각은 독립 ASR의 근사 발화 구간.",
          "caption_location": "한국어 폐쇄 자막 A4의 첫 문장, line 76; 22초와 25초 PNG",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "SOURCE-VISUAL",
            "DELIVERY-C02",
            "DISPLAY-C02-2"
          ],
          "user_impact": "안전한 저장 지시가 전달된다. 전체 큐 표시 중 잘림이나 중요한 화면 정보의 가림을 확인하지 않았다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 시각은 독립 ASR의 근사 발화 구간.",
          "caption_location": "한국어 폐쇄 자막 A4의 둘째 문장, line 76; 22초와 25초 PNG",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "SOURCE-VISUAL",
            "DELIVERY-C02",
            "DISPLAY-C02-2"
          ],
          "user_impact": "재발급 조건과 이전 코드의 사용 불가가 전달된다. 첫 문장과 함께 먼저 표시되지만 해당 발화가 끝날 때까지 유지되어 의미 대응의 혼란을 확인하지 않았다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "한국어 폐쇄 자막 A5, line 76; 28.3초 PNG",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-3"
          ],
          "user_impact": "완료 화면 확인 지시가 해당 화면과 함께 전달된다."
        }
      ],
      "missing_evidence": [
        "전체 길이의 교집합을 확정하려면 31.1893125–31.208333초의 원본 음성 유무 또는 해당 구간에 음성 샘플이 없다는 시간축 기록이 필요하다."
      ],
      "recommendations": [
        {
          "change": "M1의 A2 문구를 '안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.'로 수정한다. 현재 표시 구간과 화자 표시는 의미 수정과 별도로 유지·검토한다.",
          "retest": "원본 7.6–11.6초를 청취하거나 독립된 실제 음성 증거로 부정과 조건을 재확인한다. 수정된 A2가 실제 플레이어에서 로드되어 같은 구간에 표시되는지, 전체 문장을 읽을 수 있고 화면·조작부에 가리지 않는지 확인한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "run은 제공된 자료와 PNG 검토를 뜻한다. 대상 URL 방문이나 원본 매체 직접 처리를 수행했다는 뜻이 아니다.",
    "A2의 원본 문장은 독립 ASR 기록에 근거한다. 원본 화면의 저장 선행 안내가 이를 뒷받침하지만 직접 청취에 의한 확정은 아니다.",
    "본문에는 영상의 구체적인 절차와 폐기 금지 등의 정보가 모두 제공되어 있지 않고, 본문의 매체 대안이라는 명확한 표시도 없다. 예외를 적용하지 않았다.",
    "전체 표시 범위에 대한 추론은 검증된 고정 화면 구성에 한정하며, 일반적인 동영상에 표본 PNG만으로 같은 결론을 적용할 수 없다.",
    "이 결과는 지정된 범위의 1.2.2 수준 A 평가이며, 다른 성공 기준이나 사이트 전체 적합성을 인증하지 않는다."
  ]
}
```