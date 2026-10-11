**판정: fail — 평가 범위의 M1은 WCAG 2.2 성공 기준 1.2.2(수준 A)를 충족하지 않습니다.** 독립 원본 전사의 “아니요…저장하기 전에는 버리지 마세요”가 실제 표시된 A2 자막에서는 “네…저장하기 전에 버리세요”로 바뀌어, 중요한 부정과 행동 조건이 반대로 전달됩니다. 이 판단은 제공된 독립 처리 기록과 첨부 PNG의 비교에 근거하며, 평가자가 원본을 직접 청취하거나 연속 재생한 것은 아닙니다. 다른 자막의 내용 대응은 확인했지만, 원본 음성 처리 범위 밖의 마지막 약 0.019초는 별도로 미검토 구간에 남겼습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C02 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가; 푸터 탐색 제외",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "제공된 범위 목록의 유일한 매체 M1에서 A2 자막이 원본의 부정과 행동 조건을 반대로 전달한다. 실행은 제공된 기록과 첨부 PNG 검토에 한정된다."
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
      "원본 해시가 연결된 SOURCE-ASR은 후보 자막이나 제작 대본을 사용하지 않은 독립 자동 전사다. 처리 범위는 0–31.1893125초이며, 인식 오류 가능성과 근사 단어 시간을 보존한다.",
      "SOURCE-AUDIO의 원본 녹음 상관 분석으로 화자와 전체 발화 클립 구간을 대조했다. 이 기록은 발화 문구 자체를 독립적으로 입증하지는 않는다.",
      "A2의 부정·조건은 독립 전사와 DISPLAY-C02-1의 '새 코드의 저장 상태를 먼저 확인하세요'라는 원본 화면 안내를 함께 검토했다. 화면 안내는 정확한 발화 문구의 대체 전사가 아니다.",
      "SOURCE-SOUND의 두 음 측정과 PAGE-C02의 설명을 연결해 경고음의 의미를 확인했다. 주파수 검출만으로 의미를 추론하지 않았다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 해독·정적 장면 구조 기록, 전체 큐 목록, 모든 큐의 활성 상태 기록 및 첨부 PNG를 검토했다. 고정 배치에 관한 범위 확장은 이 통제된 자료에 한정된다.",
      "브라우저 재생·탐색·자막 처리 결과는 제공된 DELIVERY-C02 기록이다. 평가자가 브라우저나 음성·영상 도구를 실행하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 정보성 경고음이 포함된 사전 제작 동기화 영상으로 1.2.2 적용 대상",
      "classification_evidence_ids": [
        "MEDIA-C02",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "A2의 실제 표시 자막이 이전 코드를 버리지 말라는 원본 지시를 버리라는 지시로 반전한다. 폐쇄 자막의 로드·활성·표시는 확인되지만 내용의 동등성이 충족되지 않는다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C02",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C02",
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
              "SOURCE-SOUND",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C02",
              "DISPLAY-C02-1",
              "DISPLAY-C02-2",
              "DISPLAY-C02-3"
            ],
            "reason": "원본 음성 처리, 전체 큐 및 필요한 표시 관찰 기록의 교집합이다. 통제된 정적 장면 구조와 모든 큐의 PNG를 근거로 검토했으며 직접 연속 재생한 범위가 아니다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "명목상 영상 끝부분이 독립 음성 전사의 처리 범위를 벗어난다. 영상 처리 기록만으로 이 구간의 음성·자막 대응을 채우지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "폐쇄 자막 A1, line 76; 2초 PNG",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1",
            "SOURCE-VISUAL"
          ],
          "user_impact": "절차와 화자 정보가 대응한다. 표본에서 주요 안내나 조작부에 의한 자막 가림은 보이지 않는다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "폐쇄 자막 B1, line 76; 5초 PNG",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1",
            "SOURCE-VISUAL"
          ],
          "user_impact": "질문의 의미와 화면 밖 화자 변경이 전달된다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요. 독립 전사의 발화 구간은 7.71–11.18초다.",
          "caption_location": "폐쇄 자막 A2, line 76; 9.4초 PNG: '안내자: 네. 새 복구 코드를 저장하기 전에 버리세요.'",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "inaccurate",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "자막 이용자는 새 복구 코드를 저장하기 전에 이전 코드를 버리라는 반대 지시를 받는다. 교육 내용의 핵심 안전 조건이 왜곡된다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 두 번: 12.2–12.4초 및 12.62–12.82초.",
          "caption_location": "폐쇄 자막 SFX, line 76; 12.5초와 15초 PNG",
          "caption_start_seconds": 12.2,
          "caption_end_seconds": 15.82,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C02",
            "DELIVERY-C02",
            "DISPLAY-C02-1",
            "DISPLAY-C02-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "경고음의 횟수와 실패 의미가 전달된다. 소리 종료 뒤에도 같은 결과 화면에서 유지되며, 다음 발화 큐와 겹치지 않는다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "폐쇄 자막 A3, line 76; 17.8초 PNG",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "보안 확인 후 발급 확인이라는 순서가 유지된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 시간은 독립 전사의 근사값이다.",
          "caption_location": "폐쇄 자막 A4의 첫 문장, line 76; 22초 PNG",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "저장 지시가 전달된다. 다음 문장과 함께 표시되지만 표본에서 잘림이나 주요 정보 가림은 보이지 않는다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 시간은 독립 전사의 근사값이다.",
          "caption_location": "폐쇄 자막 A4의 두 번째 문장, line 76; 22초와 25초 PNG",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "재발급 조건과 이전 코드 사용 불가가 유지된다. 두 문장의 묶음 표시가 같은 절차 화면에서 발화 종료 이후까지 유지된다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "폐쇄 자막 A5, line 76; 28.3초 PNG",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-3",
            "SOURCE-VISUAL"
          ],
          "user_impact": "완료 확인 지시가 해당 화면과 함께 전달된다."
        }
      ],
      "missing_evidence": [
        "31.1893125–31.208333초의 원본 음성 처리 또는 무음 확인 근거. 확인된 A2 위반 판정에는 영향을 주지 않는다."
      ],
      "recommendations": [
        {
          "change": "M1의 A2 문구를 '안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.'로 수정해 부정과 조건을 복원한다. 기존 시간은 의미 오류 때문에 변경할 필요는 없다.",
          "retest": "원본 7.6–11.6초를 독립적으로 청취해 문구를 재확인하고, 실제 플레이어에서 수정된 A2의 로드·활성·표시를 확인한다. 9.4초 화면과 전체 큐 지속 구간에서 부정·조건, 읽기 및 가림을 재점검한다."
        },
        {
          "change": "전체 검토 완료 기록이 필요하면 마지막 약 0.019초의 음성 유무를 확인해 처리 범위를 보완한다.",
          "retest": "동일 원본 해시의 끝부분 처리 근거를 추가하고 원본·자막·표시 관찰의 교집합을 다시 계산한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "사용 가능한 입력은 제공된 텍스트 기록과 실제 첨부 PNG뿐이다. 추가 URL 방문, 청취, 연속 재생, 자막 조작 또는 사이트 변경은 수행하지 않았다.",
    "독립 자동 전사는 확정적인 원본 전사가 아니며 높은 단어 확률도 정확성을 보증하지 않는다. A2 판정에는 독립 전사, 실제 표시 자막, 원본 화면의 선행 저장 확인 안내를 함께 사용했다.",
    "화자·경고음·고정 배치의 처리 근거는 이 통제된 자료에 한정된다. 임의 영상의 전체 접근성을 표본 화면이나 메타데이터만으로 인정한 것이 아니다.",
    "읽기 속도나 지연에 임의의 WCAG 고정 합격선을 적용하지 않았다.",
    "이 결과는 지정 범위의 1.2.2 평가이며 사이트 전체의 적합성 인증이나 다른 성공 기준의 판정이 아니다."
  ]
}
```