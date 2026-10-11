**판정: fail — WCAG 2.2 성공 기준 1.2.2, 수준 A.** 제공된 독립 음성 처리 기록과 실제 화면을 비교한 결과, M1의 사용자 질문, 보안 확인 실패를 알리는 두 번의 경고음, 새 코드 발급 후 이전 코드를 사용할 수 없다는 정보가 동기화된 화면 텍스트에서 누락되었습니다. 본문에는 해당 정보가 있으나 영상이 본문의 대안이라는 명확한 표시가 없어 예외가 성립하지 않습니다. 이번 평가는 제공된 기록과 첨부 PNG의 검토이며, 직접 청취하거나 영상을 연속 재생한 결과는 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C10 — 제공된 Chromium 페이지 상태와 첨부 화면. 본문 및 교육 영상 M1만 평가하며 페이지 하단 탐색은 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 유일한 녹화 영상에서 중요한 대사와 경고음의 동기화된 텍스트 누락을 확인했다. 전체 설명 본문은 있지만 본문의 매체 대안이라는 명확한 표시가 없어 예외를 적용할 수 없다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C10",
      "PAGE-C10",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C10",
      "DISPLAY-C10-1",
      "DISPLAY-C10-2",
      "DISPLAY-C10-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR는 원본 해시와 연결된 독립 자동 전사이며 후보 자막을 입력으로 사용하지 않았다. 인식 결과와 단어 시간은 확정적인 청취 기록이 아니다.",
      "SOURCE-AUDIO는 원본과 분리 음성 녹음의 상관 분석으로 화자 및 녹음 구간을 연결한다. 통제된 제작 자료의 역할 정보이며 일반적인 화자 식별 성능을 입증하지 않는다.",
      "SOURCE-SOUND의 두 음 측정은 12.20–12.40초와 12.62–12.82초이다. 보안 확인 실패라는 의미는 검출기 자체가 아니라 PAGE-C10의 실제 설명으로 확인했다.",
      "첨부 PNG에서 일곱 단계의 지시문을 직접 검토했다. 전체 구간에 대한 구조 판단은 SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 디코딩 및 정적 화면 시간표에 의존하며, 표본 PNG만으로 전체 검토를 주장하지 않는다.",
      "SOURCE-VISUAL에는 자막 큐를 모두 읽었다는 일반적 설명이 있으나 DELIVERY-C10의 실제 트랙과 활성 큐는 비어 있다. 그 설명을 자막 존재나 충분성의 증거로 사용하지 않고 실제 전달 기록과 첨부 화면을 우선했다.",
      "브라우저 재생·탐색 동작은 DELIVERY-C10에 기록된 제공 자료이다. 평가자가 새로 URL에 접속하거나 플레이어를 조작한 것은 아니다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 정보성 경고음을 포함한 사전 녹화 동기화 매체. 원본 길이 31.208333초이며 1.2.2 적용 대상.",
      "classification_evidence_ids": [
        "MEDIA-C10",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "폐쇄 자막 트랙과 활성 큐가 없으며, 실제 영상의 지시문도 질문·경고음·이전 코드 사용 불가 정보를 제공하지 않는다. 일부 지시문은 해당 대사와 의미가 같지만 전체 음성 및 중요한 소리의 자막 요구를 충족하지 않는다.",
      "exception": {
        "claimed": false,
        "no_extra_information": true,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C10",
          "SOURCE-ASR",
          "SOURCE-AUDIO",
          "SOURCE-SOUND",
          "SOURCE-VISUAL",
          "ENCODE-LINK",
          "DISPLAY-C10-1",
          "DISPLAY-C10-2",
          "DISPLAY-C10-3"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C10",
          "DELIVERY-C10",
          "DISPLAY-C10-1",
          "DISPLAY-C10-2",
          "DISPLAY-C10-3"
        ]
      },
      "coverage": {
        "complete": false,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.18,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-SOUND",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C10",
              "DISPLAY-C10-1",
              "DISPLAY-C10-2",
              "DISPLAY-C10-3"
            ],
            "reason": "독립 음성 처리 범위와 검증된 일곱 정적 화면의 시간표가 겹치는 구간. 각 화면의 실제 PNG와 빈 자막 트랙·활성 큐 기록을 비교했다. 직접 연속 재생한 범위는 아니다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.18,
            "end_seconds": 31.208333,
            "reason": "정적 화면 시간표는 31.18초까지이며 독립 음성 처리도 매체 표시 길이 끝까지 도달하지 않는다. 마지막 구간의 완전한 음성·표시 대응은 확인하지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "첫 화면의 지시문: '설정에서 보안을 선택하세요.' 별도 자막 큐는 없음.",
          "caption_start_seconds": 0,
          "caption_end_seconds": 3.75,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C10-1",
            "DELIVERY-C10"
          ],
          "user_impact": "해당 동작의 의미는 음성 없이도 화면에서 얻을 수 있다. 이것만으로 전체 자막의 충분성을 입증하지는 않는다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "화면 밖 사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "5초 화면에는 '이전 코드에 관한 질문'과 '질문과 답변을 듣고 다음 단계로 이동하세요.'만 있다. 질문 내용과 사용자 식별을 제공하는 자막은 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C10-1",
            "DELIVERY-C10"
          ],
          "user_impact": "청각에 의존하지 않는 이용자는 누가 무엇을 질문했는지 알 수 없어 뒤따르는 답변의 대화 맥락을 놓친다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "세 번째 화면: '코드를 버리기 전에', '새 코드의 저장 상태를 먼저 확인하세요.' 별도 자막 큐는 없음.",
          "caption_start_seconds": 7.35,
          "caption_end_seconds": 11.95,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C10-1"
          ],
          "user_impact": "새 코드 저장을 확인한 뒤 이전 코드를 버려야 한다는 핵심 조건은 화면에서도 전달된다. 다만 대화의 화자 변경은 별도로 전달되지 않는다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "화면 밖 사용자의 질문 뒤 안내자가 답변하는 화자 변경.",
          "caption_location": "9.4초 화면은 저장 상태에 관한 지시문만 표시하며 답변 화자를 식별하지 않는다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "PAGE-C10",
            "SOURCE-AUDIO",
            "DISPLAY-C10-1",
            "DELIVERY-C10"
          ],
          "user_impact": "화면에 인물이 없고 본문 설명도 두 화자가 대화한다고만 안내하므로, 동기화된 텍스트만으로 질문자와 답변자를 구분할 수 없다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 두 번: 12.20–12.40초, 12.62–12.82초.",
          "caption_location": "12.5초와 15초 화면에는 '보안 확인 결과', '결과를 확인하고 다음 단계로 이동하세요.'만 있다. 실패 및 경고음 표시는 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C10",
            "DISPLAY-C10-1",
            "DISPLAY-C10-2",
            "DELIVERY-C10"
          ],
          "user_impact": "소리를 들을 수 없는 이용자는 보안 확인이 실패했다는 결과를 해당 시점에 알 수 없다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "다섯 번째 화면: '보안 확인 다시 하기', '보안 확인을 완료하고 발급을 확인하세요.'",
          "caption_start_seconds": 16.17,
          "caption_end_seconds": 19.81,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C10-2"
          ],
          "user_impact": "보안 확인을 다시 완료한 뒤 발급을 확인하는 순서는 화면에서 전달된다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 종료 시각은 자동 전사의 근사값.",
          "caption_location": "여섯 번째 화면: '새 코드 저장', '코드를 안전한 곳에 보관하세요.'",
          "caption_start_seconds": 19.81,
          "caption_end_seconds": 27.05,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C10-2"
          ],
          "user_impact": "새 코드의 안전한 보관이라는 의미는 화면에서 전달된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 시각은 자동 전사의 근사값이며 해당 원본 녹음 구간은 20.06–26.70초.",
          "caption_location": "25초 화면은 새 코드의 안전한 보관만 안내한다. 이전 코드 사용 불가 조건을 제공하는 자막은 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C10",
            "DISPLAY-C10-2",
            "DELIVERY-C10"
          ],
          "user_impact": "청각에 의존하지 않는 이용자는 재발급 후 이전 코드가 무효가 된다는 중요한 보안 조건을 놓친다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "일곱 번째 화면: '발급 완료', '발급 완료 화면을 확인하세요.'",
          "caption_start_seconds": 27.05,
          "caption_end_seconds": 31.18,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C10-3"
          ],
          "user_impact": "발급 완료 화면을 확인하라는 의미는 화면에서 전달된다."
        }
      ],
      "missing_evidence": [
        "31.18–31.208333초의 원본 음성·화면·자막 대응을 함께 확인할 수 있는 기록.",
        "수정 후 실제 자막의 로드·표시·시간 대응·읽기 및 가림을 확인할 수 있는 플레이어 기록."
      ],
      "recommendations": [
        {
          "change": "M1의 4–7초 질문과 7.6–11.6초 답변에 사용자·안내자 구분을 포함한 동기화 자막을 제공한다. 기존 지시문이 전달하는 저장 전 폐기 금지 조건은 유지한다.",
          "retest": "원본 질문·답변과 실제 표시 자막을 비교하여 질문 내용, 화자 변경, 부정 및 저장 전이라는 조건이 해당 시점에 읽히는지 확인한다."
        },
        {
          "change": "M1의 12.20–12.82초 경고음에 '[보안 확인 실패를 알리는 경고음 두 번]' 또는 동등한 의미의 동기화 텍스트를 추가한다.",
          "retest": "두 경고음과 표시 구간을 비교하고 실패 결과를 다음 단계로 넘어가기 전에 이해할 수 있는지 확인한다."
        },
        {
          "change": "M1의 약 22.76–26.02초에 새 코드 발급 후 이전 코드를 더 이상 사용할 수 없다는 조건을 자막으로 추가한다.",
          "retest": "원본 녹음으로 정확한 발화 구간을 확인한 뒤 실제 자막에서 재발급 조건과 사용 불가 의미가 누락 없이 전달되는지 점검한다."
        },
        {
          "change": "자막 수정 시 폐쇄 자막 또는 영상 내 개방 자막을 사용하고, 기존 지시문과 중복되는 부분도 전체 대화 흐름에서 충분한지 검토한다.",
          "retest": "31.208333초 전체를 대상으로 실제 표시·순서·지속 시간·조작부 가림을 확인한다. 트랙 존재나 시간 일치만으로 합격 처리하지 않는다."
        },
        {
          "change": "자막 대신 본문의 매체 대안 예외를 사용하려는 경우, 영상에 인접하여 이 영상이 제공된 '전체 설명' 본문의 대안임을 명확히 표시한다. 현재의 본문 제목만으로는 부족하다.",
          "retest": "수정된 실제 안내 문구와 연결된 본문 전체를 확인하고 원본 전체의 대사·중요한 소리·화면 정보에 본문 밖의 추가 정보가 없는지 다시 비교한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "검토 가능한 입력은 제공된 텍스트 기록과 세 개의 첨부 PNG뿐이며 추가 브라우저·음성·영상 도구는 없다.",
    "본문에는 관찰된 대사, 경고음의 의미, 일곱 화면의 정보가 모두 포함되어 있어 추가 정보 없음은 확인했지만, 본문의 대안이라는 명확한 표시가 없어 예외는 성립하지 않는다.",
    "일부 화면 지시문을 의미상 동등하다고 기록한 것은 그 화면 전체를 충분한 자막으로 인정한 것이 아니다.",
    "마지막 미확인 구간은 보존했으며, 이미 확인된 정보 누락에 따른 fail 판정을 바꾸지 않는다.",
    "판정은 지정된 범위의 성공 기준 1.2.2에만 해당하며 사이트 전체의 적합성 인증이나 다른 성공 기준의 판정이 아니다."
  ]
}
```