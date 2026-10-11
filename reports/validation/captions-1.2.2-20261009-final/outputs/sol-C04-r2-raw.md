**판정: fail.** 제공된 독립 음성 처리 기록, 실제 플레이어 처리 기록과 첨부 PNG를 비교한 결과, 대사와 중요한 경고음은 자막으로 제공되지만 화면 밖 안내자·사용자의 화자 식별 정보가 빠져 있습니다. 본문의 일반적인 두 화자 소개와 화면의 단계 제목만으로는 각 발화를 누구에게 연결해야 하는지 명확하지 않아, 확인된 화자 정보 누락을 1.2.2 위반으로 기록합니다. 이번 실행은 제공 자료 검토이며, 직접 청취하거나 동영상을 연속 재생한 것은 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C04 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가. 푸터 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 유일한 녹화 영상에서 화면 밖 두 화자의 식별 정보가 자막과 화면에 제공되지 않는다. 대사와 경고음의 내용 대응은 확인했으나, 화자 정보 누락으로 범위 판정은 fail이다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C04",
      "PAGE-C04",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C04",
      "DISPLAY-C04-1",
      "DISPLAY-C04-2",
      "DISPLAY-C04-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR의 독립 전사를 자막 후보와 비교했다. 전사에는 후보 자막이나 제작 대본이 사용되지 않았으나, 자동 인식 결과와 단어 시각은 확정적 정답이 아니다.",
      "SOURCE-AUDIO의 원본 녹음 상관 분석과 역할 메타데이터로 안내자·사용자 및 녹음 구간을 구분했다. 이는 통제된 제작 자료의 출처 검증이며 일반적인 화자 분리 성능을 뜻하지 않는다.",
      "SOURCE-SOUND의 두 음향 펄스 측정과 PAGE-C04의 실제 설명을 함께 사용해 경고음의 의미를 확인했다. 주파수 측정만으로 의미를 추론하지 않았다.",
      "DELIVERY-C04의 로드 상태·활성 큐 기록과 첨부 PNG를 검토했다. 기록된 브라우저 재생·탐색 동작을 평가자가 직접 실행한 것으로 취급하지 않았다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 디코드 및 통제된 화면 구성 기록으로 표본 화면의 적용 범위를 검토했다. 이 방법을 임의의 다른 영상에 일반화하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대화와 정보성 이중 경고음이 포함된 사전 녹화 동기화 매체. 원본은 무음이 아니므로 1.2.2 적용 대상.",
      "classification_evidence_ids": [
        "MEDIA-C04",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "폐쇄 자막의 실제 표시와 대사·경고음 대응은 확인했지만, 화면 밖 안내자와 사용자를 구분하는 정보가 누락되었다. 원본 역할 기록과 달리 자막에는 화자명이나 동등한 식별 단서가 없고, 화면에도 각 발화와 역할의 연결이 표시되지 않는다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C04",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C04",
          "DELIVERY-C04",
          "DISPLAY-C04-1",
          "DISPLAY-C04-2",
          "DISPLAY-C04-3"
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
              "DELIVERY-C04",
              "DISPLAY-C04-1",
              "DISPLAY-C04-2",
              "DISPLAY-C04-3"
            ],
            "reason": "독립 음성 처리 범위와 원본 화면 처리 범위의 교집합. 자막 전체 큐, 각 큐의 활성 표본, 첨부 화면 및 통제된 고정 배치 검증 기록을 함께 검토했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "영상 끝의 약 0.019초는 독립 전사의 명시된 처리 범위 밖이다. 전체 프레임 디코드와 무음 꼬리 기록은 있으나 전사·표시 비교 완료 범위에 합치지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "설정에서 보안을 선택합니다.",
          "caption_location": "폐쇄 자막 A1, line 76",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "대사 내용과 녹음 구간에 대응하는 표시를 확인했다. 화자 식별은 별도 누락 항목에 기록했다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "이전 코드를 지금 버려도 되나요?",
          "caption_location": "폐쇄 자막 B1, line 76",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "질문의 의미와 표시 시간은 대응한다. 질문형 문장 자체를 원본 화자 식별의 증거로 취급하지 않았다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "폐쇄 자막 A2, line 76",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "부정과 저장 전 폐기 금지 조건이 보존된다. 첨부 화면에서 문장 잘림이나 조작부 가림은 보이지 않는다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2–12.4초와 12.62–12.82초의 두 경고음. 본문 설명상 보안 확인 실패를 알린다.",
          "caption_location": "폐쇄 자막 SFX, line 76",
          "caption_start_seconds": 12.2,
          "caption_end_seconds": 15.82,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C04",
            "DELIVERY-C04",
            "DISPLAY-C04-1",
            "DISPLAY-C04-2"
          ],
          "user_impact": "경고음의 횟수와 의미가 제공된다. 소리 종료 후에도 자막이 유지되지만 같은 결과 화면 안에서 읽을 시간을 제공하며, 다음 대사를 침범하지 않는다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "폐쇄 자막 A3, line 76",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-2"
          ],
          "user_impact": "보안 확인을 먼저 완료해야 한다는 순서와 조건이 보존된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "폐쇄 자막 A4의 첫 문장, line 76",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-2"
          ],
          "user_impact": "안전한 저장 지시가 보존된다. ASR 시작 시각은 근사치이며 검증된 녹음 구간 시작은 20.06초이다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "폐쇄 자막 A4의 둘째 문장, line 76",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-2"
          ],
          "user_impact": "재발급 조건과 이전 코드 사용 불가가 보존된다. 두 문장이 함께 6.64초 표시되며, 22초·25초 화면에서 잘림이나 중요한 시각 정보 가림은 확인되지 않는다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "발급 완료 화면을 확인합니다.",
          "caption_location": "폐쇄 자막 A5, line 76",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-3"
          ],
          "user_impact": "완료 화면 확인 지시와 표시 시간의 대응을 확인했다."
        },
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "화면 밖 안내자의 첫 발화: 설정에서 보안을 선택합니다.",
          "caption_location": "폐쇄 자막 A1 및 2초 화면. 안내자 식별 표지 없음.",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "PAGE-C04",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "소리를 들을 수 없는 이용자는 첫 지시의 화자가 안내자라는 정보를 자막이나 화면에서 얻지 못한다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "안내자에서 화면 밖 사용자로 변경: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "폐쇄 자막 B1 및 5초 화면. 사용자 식별 표지 없음.",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "PAGE-C04",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "다른 화자인 사용자의 질문임을 식별할 수 없다. 화면 제목은 질문의 주제만 나타내며 발화자를 연결하지 않는다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "사용자에서 화면 밖 안내자로 변경: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "폐쇄 자막 A2 및 9.4초 화면. 안내자 식별 표지 없음.",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "PAGE-C04",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "폐기 금지 답변이 안내자의 응답이라는 화자 관계가 전달되지 않는다. 질문과 답변의 내용은 읽을 수 있어도 원본의 두 화자 구분이 빠진다."
        }
      ],
      "missing_evidence": [
        "전체 비교 완료 범위를 확정하려면 31.1893125–31.208333초 끝 구간의 원본 음성·표시 대응 기록이 필요하다. 이 한계는 이미 확인된 화자 정보 누락의 fail 판정을 바꾸지 않는다."
      ],
      "recommendations": [
        {
          "change": "M1의 A1에 '안내자:', B1에 '사용자:', A2에 '안내자:' 등 역할 식별을 추가하거나 동등하게 명확한 화면상의 발화자 연결을 제공한다. 이후 같은 안내자가 계속 말하는 구간에는 불필요한 이름 반복을 강제하지 않는다.",
          "retest": "수정된 실제 플레이어에서 1–3.4초, 4–7초, 7.6–11.6초의 활성 큐와 화면을 확인한다. 원본 역할 기록과 대조해 첫 화자 및 두 번의 화자 변경이 소리 없이도 식별되는지 확인하고, 추가된 글자로 인한 잘림·가림·읽기 시간 문제도 재점검한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "사용 가능한 입력은 제공된 텍스트 기록과 첨부 PNG뿐이다. 대상 URL 방문, 직접 청취, 연속 영상 재생, 자막 전환 조작 또는 사이트 수정은 실행하지 않았다.",
    "본문에는 매체 대안이라는 명확한 표시가 없고, 복구 코드 저장·폐기 조건 등 영상의 전체 정보도 제공되지 않아 본문 대안 예외를 적용하지 않았다.",
    "자동 전사의 높은 확률이나 자막 트랙 메타데이터만으로 정확성·충분성을 선언하지 않았다. 독립 전사, 원본 역할·소리 처리 기록, 실제 큐와 화면을 구분해 사용했다.",
    "표시 시간이나 읽기 속도에 임의의 WCAG 고정 합격선을 적용하지 않았다. 표시 지속 시간, 실제 화면의 잘림·가림 및 정보 대응을 검토했다.",
    "이 결과는 지정된 본문과 M1의 WCAG 2.2 성공 기준 1.2.2 수준 A 평가이며, 사이트 전체 적합성이나 다른 성공 기준의 판정을 의미하지 않는다."
  ]
}
```