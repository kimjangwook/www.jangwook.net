**판정은 fail입니다.** 제공된 독립 원본 전사에는 22.76–26.02초의 “새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다”가 있으나 연결된 본문에는 없어, 명확한 대안 표시만으로 본문의 매체 대안 예외를 인정할 수 없습니다. 실제 표시 PNG와 플레이어 기록에서는 사용자의 질문, 보안 확인 실패 경고음, 이전 코드의 사용 불가 정보를 전달하는 동기화 자막이 확인되지 않았습니다. 평가는 제공된 기록과 첨부 PNG 검토로 수행했으며, 직접 청취·연속 재생은 하지 않았고 전사 및 기록의 한계를 아래에 남겼습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C11 — 제공된 Chromium 페이지 상태와 표시 기록. 본문과 교육 영상 M1만 평가하며 푸터 탐색은 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 매체는 M1 하나이다. 독립 원본 전사에 본문에 없는 이전 코드 사용 불가 정보가 있어 대안 예외가 성립하지 않으며, 실제 표시에서 질문·중요 경고음·추가 안내의 동기화 자막 누락을 확인했다."
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
      "평가자는 제공된 텍스트 기록과 첨부 PNG만 검토했다. URL 방문, 원본 직접 청취, 연속 영상 재생 또는 플레이어 조작을 새로 수행하지 않았다.",
      "SOURCE-ASR은 M1 해시와 연결된 실제 디코딩 음성의 독립 자동 전사이다. 후보 자막이나 제작 대본을 사용하지 않았으나 인식 오류 가능성과 근사 단어 시간이 있다.",
      "SOURCE-AUDIO는 실제 디코딩 음성과 분리된 원본 녹음의 상관 분석으로 화자와 녹음 구간을 연결한다. 이 분석 자체가 발화 문장의 정확성을 검증하지는 않는다.",
      "SOURCE-SOUND의 두 펄스 측정과 PAGE-C11의 실제 안내를 함께 사용해 경고음의 의미를 연결했다. 주파수 검출만으로 보안 확인 실패라는 의미를 추론하지 않았다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 디코딩 및 고정 장면 구조를 표시 PNG와 함께 사용했다. 이는 해당 통제 매체에 한정된 구간 연결 근거이며 일반 영상의 표본 검토에 적용할 수 없다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 활성 자막 큐 검토 문구는 DELIVERY-C11의 빈 트랙·빈 활성 큐 및 첨부 PNG와 충돌한다. 실제 자막 제공의 증거로 사용하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대화와 이해에 필요한 보안 확인 실패 경고음이 포함된 사전 제작 동기화 영상",
      "classification_evidence_ids": [
        "MEDIA-C11",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C11",
        "DISPLAY-C11-1",
        "DISPLAY-C11-2"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "독립 전사상 본문에 없는 정보가 있어 대안 예외를 인정하지 않았다. 폐쇄 자막이 없고, 실제 영상의 화면 안내문도 사용자의 질문·두 번의 실패 경고음·이전 코드 사용 불가 정보를 전달하지 않는다.",
      "exception": {
        "claimed": true,
        "no_extra_information": false,
        "clearly_labeled": true,
        "verified": false,
        "evidence_ids": [
          "PAGE-C11",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C11",
          "DELIVERY-C11",
          "DISPLAY-C11-1",
          "DISPLAY-C11-2",
          "DISPLAY-C11-3"
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
              "DELIVERY-C11",
              "DISPLAY-C11-1",
              "DISPLAY-C11-2",
              "DISPLAY-C11-3"
            ],
            "reason": "제공된 음성 처리 범위와 영상 처리 범위의 교집합이다. 일곱 고정 장면의 시간 구조와 각 장면의 실제 PNG로 화면 안내문을 연결했다. 직접 연속 재생 범위가 아니며, 활성 자막 큐 검토라는 상충된 서술은 제외했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "독립 전사의 명시적 처리 범위를 벗어나는 끝부분이다. 영상 처리 기록은 있으나 원본 음성·표시의 교집합으로 포함하지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 0.94,
          "original_end_seconds": 3.04,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "별도 자막 없음. 첫 화면 안내문: 설정에서 보안을 선택하세요.",
          "caption_start_seconds": 0,
          "caption_end_seconds": 3.75,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C11-1"
          ],
          "user_impact": "화면 안내문이 해당 조작 지시의 의미를 전달한다. 이것만으로 전체 대화 자막의 충분성을 입증하지는 않는다."
        },
        {
          "original_start_seconds": 3.8,
          "original_end_seconds": 6.56,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "5초 PNG의 두 번째 화면에는 이전 코드에 관한 질문 / 질문과 답변을 듣고 다음 단계로 이동하세요만 표시된다. 대응 자막 큐는 없다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DELIVERY-C11",
            "DISPLAY-C11-1"
          ],
          "user_impact": "소리를 듣지 못하면 사용자의 구체적인 질문과 질문·답변의 대화 관계를 알 수 없다."
        },
        {
          "original_start_seconds": 7.71,
          "original_end_seconds": 11.18,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "세 번째 화면 안내문: 코드를 버리기 전에 / 새 코드의 저장 상태를 먼저 확인하세요.",
          "caption_start_seconds": 7.35,
          "caption_end_seconds": 11.95,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C11-1"
          ],
          "user_impact": "화면 안내문은 폐기 전 새 코드의 저장 상태를 확인해야 한다는 핵심 조건을 전달한다. 앞선 질문 및 화자 관계의 누락은 별도로 남는다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.20–12.40초와 12.62–12.82초의 경고음 두 번. 실제 본문 안내에 따르면 보안 확인 실패를 알린다.",
          "caption_location": "12.5초와 15초 PNG의 네 번째 화면에는 보안 확인 결과 / 결과를 확인하고 다음 단계로 이동하세요만 표시된다. 경고음과 실패 의미의 자막은 없다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "SOURCE-AUDIO",
            "PAGE-C11",
            "ENCODE-LINK",
            "DELIVERY-C11",
            "DISPLAY-C11-1",
            "DISPLAY-C11-2"
          ],
          "user_impact": "소리를 듣지 못하면 이 시점에 보안 확인이 실패했다는 정보를 알 수 없다. 본문의 정적 설명은 동기화 자막을 대신하지 않는다."
        },
        {
          "original_start_seconds": 16.47,
          "original_end_seconds": 19,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "다섯 번째 화면 안내문: 보안 확인 다시 하기 / 보안 확인을 완료하고 발급을 확인하세요.",
          "caption_start_seconds": 16.17,
          "caption_end_seconds": 19.81,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C11-2"
          ],
          "user_impact": "재확인과 완료 후 발급 확인이라는 순서를 화면 안내문으로 알 수 있다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "여섯 번째 화면 안내문: 새 코드 저장 / 코드를 안전한 곳에 보관하세요.",
          "caption_start_seconds": 19.81,
          "caption_end_seconds": 27.05,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C11-2"
          ],
          "user_impact": "새 코드의 안전한 보관이라는 지시는 화면 안내문으로 전달된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "독립 전사: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "25초 PNG에서도 여섯 번째 화면의 안전한 보관 안내만 표시된다. 이전 코드 사용 불가 정보의 자막 큐는 없으며 연결된 본문에도 이 정보가 없다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C11",
            "ENCODE-LINK",
            "DELIVERY-C11",
            "DISPLAY-C11-2"
          ],
          "user_impact": "소리를 듣지 못하면 재발급으로 이전 코드가 무효화된다는 중요한 결과를 놓친다. 본문 대안 예외를 부정하는 추가 정보이기도 하다."
        },
        {
          "original_start_seconds": 27.45,
          "original_end_seconds": 29.08,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "일곱 번째 화면 안내문: 발급 완료 / 발급 완료 화면을 확인하세요.",
          "caption_start_seconds": 27.05,
          "caption_end_seconds": 31.18,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C11-3"
          ],
          "user_impact": "발급 완료 화면을 확인하라는 지시는 화면 안내문으로 전달된다."
        }
      ],
      "missing_evidence": [
        "22.76–26.02초의 재발급 조건·부정 표현을 원본 음성으로 재확인한 청취 기록. 현재 해당 문장 내용의 근거는 독립 자동 전사이며, 음성 상관 분석은 문장 정확성을 별도로 보증하지 않는다.",
        "SOURCE-VISUAL 및 ENCODE-LINK의 활성 자막 큐 검토 문구와 실제 빈 트랙·빈 큐 기록 사이의 정정 또는 설명.",
        "독립 전사 처리 종료 이후부터 영상 종료까지의 음성 확인 기록."
      ],
      "recommendations": [
        {
          "change": "일반 자막 요구를 충족하는 경로에서는 3.8–6.56초 질문, 12.2–12.82초의 보안 확인 실패 경고음 두 번, 22.76–26.02초의 이전 코드 사용 불가 정보를 포함한 동기화 자막을 제공한다. 화면 밖 사용자와 안내자의 구분도 필요한 지점에서 전달한다.",
          "retest": "원본을 독립적으로 확인한 뒤 실제 플레이어에서 각 자막의 로드·표시와 의미 대응을 점검한다. 해당 질문·경고·결과를 필요한 시점에 읽을 수 있고 중요한 화면 정보를 가리지 않는지 확인한다."
        },
        {
          "change": "본문의 매체 대안 예외를 유지하려면 원본에서 재발급 시 이전 코드 사용 불가 안내를 확인하고, 그 정보가 포함되도록 연결된 전체 본문을 보완한다. 이미 표시된 대안 안내 문구는 실제 내용과 일치하도록 유지한다.",
          "retest": "수정된 본문 전체와 원본 전체의 음성·중요한 소리·화면 정보를 다시 비교한다. 추가 정보 없음과 명확한 대안 표시가 모두 확인된 경우에만 예외를 인정한다."
        },
        {
          "change": "활성 자막 큐를 검토했다는 처리 기록의 상충된 문구를 실제 C11의 처리 결과에 맞게 정정한다.",
          "retest": "정정된 기록이 실제 빈 트랙·빈 큐 및 표시 PNG와 일치하는지 확인하고, 전체 처리 범위와 끝부분의 미확인 범위를 다시 기록한다."
        }
      ]
    }
  ],
  "errors": [
    {
      "evidence_ids": [
        "SOURCE-VISUAL",
        "ENCODE-LINK",
        "DELIVERY-C11",
        "DISPLAY-C11-1",
        "DISPLAY-C11-2",
        "DISPLAY-C11-3"
      ],
      "stage": "제공된 처리 기록의 일관성 검토",
      "error": "활성 자막 큐 전체를 읽고 표본 확인했다는 서술이 있으나 실제 제공 기록에는 트랙과 활성 큐가 없고 PNG에도 해당 대화·경고 자막이 없다.",
      "effect_on_decision": "자막 큐 검토 서술은 제공 및 충분성의 근거에서 제외했다. 실제 표시에서 확인된 누락에 대한 fail은 유지하되 전체 검토 완료로 선언하지 않았다."
    }
  ],
  "limits": [
    "판정은 WCAG 2.2 성공 기준 1.2.2 수준 A와 지정된 본문·M1 범위에만 해당한다. 사이트 전체 적합성 인증이나 다른 성공 기준의 판정이 아니다.",
    "실행 run은 제공 자료 검토를 뜻한다. 평가자가 직접 원본 음성이나 영상 파일을 처리했다는 뜻이 아니다.",
    "화면 안내문 중 일부는 발화와 의미가 대응한다. 자막 트랙이 없다는 이유만으로 실패 처리한 것이 아니라, 실제 화면에도 없는 질문·중요한 소리·추가 안내를 근거로 했다.",
    "자동 전사의 확률값을 정확성 보증으로 사용하지 않았다. 특히 예외 판단에 중요한 재발급 조건과 사용 불가 표현은 원본 청취를 통한 재확인이 필요하다.",
    "제공된 고정 장면 구조는 구간 연결에 사용했으나 자막 큐 관련 기록의 충돌과 음성 처리 끝부분의 차이를 숨기거나 미확인 시간을 전체 확인으로 채우지 않았다.",
    "새로운 네트워크·인증·재생 오류는 관찰하지 않았다. 제공 자료의 불일치를 도구 실행 오류나 적용 대상 없음으로 바꾸지 않았다."
  ]
}
```