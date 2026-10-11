**판정은 fail입니다.** 제공된 원본 처리 기록과 실제 표시 PNG를 비교하면, M1의 사용자 질문, 보안 확인 실패를 알리는 두 번의 경고음, 새 코드 발급 시 이전 코드가 무효화된다는 정보가 동기화된 화면 텍스트에서 누락되어 있습니다. 본문에 전체 설명이 있지만 영상이 그 본문의 대안이라는 명확한 표시가 없어 예외는 성립하지 않습니다. 이번 실행은 제공된 기록과 PNG의 검토이며, 평가자가 직접 청취하거나 영상을 연속 재생한 것은 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C06 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가. 페이지 푸터 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 유일한 녹화 영상에서 대화와 중요한 경고음의 일부가 동기화된 텍스트로 제공되지 않는다. 전체 설명은 있으나 본문의 매체 대안이라는 명확한 표시가 없다."
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
      "제공된 독립 ASR은 원본 해시와 연결되어 있으며 음성을 0–31.1893125초 처리했다. 평가자가 ASR을 실행하거나 원본을 직접 청취하지 않았고, 단어 시간과 인식 결과에는 오류 가능성이 있다.",
      "SOURCE-AUDIO의 독립 소스 녹음 상관 분석으로 화자 역할과 녹음 구간을 확인했다. 중요한 부정·조건은 SOURCE-ASR과 PAGE-C06의 전체 설명을 대조했으며, 페이지 본문을 독립 청취 결과로 취급하지 않았다.",
      "SOURCE-SOUND의 측정은 두 음의 시간 구간을 확인한다. 보안 확인 실패라는 의미는 PAGE-C06의 실제 안내 문구에서 확인했으며, FFT만으로 의미를 추론하지 않았다.",
      "첨부 PNG를 실제로 검토했다. 표본 사이의 화면 상태는 제공된 749프레임 디코드 및 고정 장면 구성 검증 기록을 근거로 연결했으며, 이 통제된 영상 밖으로 일반화하지 않았다.",
      "SOURCE-VISUAL의 후보 자막 큐 검토 문구와 ENCODE-LINK의 후보 파일 해시는 실제 평가 페이지의 자막 제공 증거로 사용하지 않았다. 실제 제공 상태는 DELIVERY-C06과 첨부 PNG를 우선했다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대화와 정보성 이중 경고음이 포함된 사전 녹화 동기화 영상. 1.2.2 적용 대상.",
      "classification_evidence_ids": [
        "MEDIA-C06",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL",
        "PAGE-C06"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "일부 화면 안내는 음성의 의미를 전달하지만 사용자 질문, 중요한 경고음, 이전 코드 무효화 조건 및 필요한 화자 전환 정보가 누락된다. 트랙 부재만으로 판단하지 않고 영상에 포함된 화면 텍스트도 비교했다.",
      "exception": {
        "claimed": false,
        "no_extra_information": true,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C06",
          "SOURCE-ASR",
          "SOURCE-AUDIO",
          "SOURCE-SOUND",
          "SOURCE-VISUAL",
          "DISPLAY-C06-1",
          "DISPLAY-C06-2",
          "DISPLAY-C06-3"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C06",
          "DELIVERY-C06",
          "DISPLAY-C06-1",
          "DISPLAY-C06-2",
          "DISPLAY-C06-3"
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
              "DELIVERY-C06",
              "DISPLAY-C06-1",
              "DISPLAY-C06-2",
              "DISPLAY-C06-3"
            ],
            "reason": "독립 원본 음성 처리 범위와 전체 프레임·고정 장면 검증, 실제 표시 표본의 교집합. 자막 큐는 없고 장면별 화면 안내문을 대응 자료로 검토했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "명시된 독립 음성 처리 범위 밖의 마지막 구간. 영상 디코드 기록만으로 원본 음성까지 확인했다고 확장하지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 0.94,
          "original_end_seconds": 3.04,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "첫 장면의 화면 안내문: 설정에서 보안을 선택하세요. 별도 자막 큐 없음.",
          "caption_start_seconds": 0,
          "caption_end_seconds": 3.75,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C06-1"
          ],
          "user_impact": "이 조작 안내의 의미는 같은 시점의 화면 텍스트로 전달된다."
        },
        {
          "original_start_seconds": 3.8,
          "original_end_seconds": 6.56,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "3.75–7.35초 장면에는 이전 코드에 관한 질문 / 질문과 답변을 듣고 다음 단계로 이동하세요만 표시된다. 질문 내용의 자막 큐 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "ENCODE-LINK",
            "DISPLAY-C06-1"
          ],
          "user_impact": "소리를 듣지 못하는 이용자는 지금 이전 코드를 버려도 되는지 묻는 구체적인 질문을 알 수 없다."
        },
        {
          "original_start_seconds": 7.71,
          "original_end_seconds": 11.18,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "세 번째 장면: 코드를 버리기 전에 / 새 코드의 저장 상태를 먼저 확인하세요. 별도 자막 큐 없음.",
          "caption_start_seconds": 7.35,
          "caption_end_seconds": 11.95,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C06",
            "ENCODE-LINK",
            "DISPLAY-C06-1"
          ],
          "user_impact": "새 코드 저장 확인이 폐기보다 먼저라는 핵심 조건은 전달된다. 다만 앞선 질문과 화자 전환의 누락은 별도 위반으로 남는다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 11.6,
          "original_content": "화면 밖 사용자의 질문 뒤 안내자가 답변하는 화자 전환.",
          "caption_location": "질문·답변 장면에 사용자와 안내자의 발화를 구분하는 동기화된 표기 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "PAGE-C06",
            "DISPLAY-C06-1",
            "DELIVERY-C06"
          ],
          "user_impact": "본문에서 두 역할의 존재는 알 수 있지만 영상의 어느 발화가 누구의 말인지 화면에서 복원할 수 없다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2–12.4초와 12.62–12.82초의 두 경고음. 보안 확인 실패를 알림.",
          "caption_location": "보안 확인 결과 장면에는 결과를 확인하고 다음 단계로 이동하세요만 표시된다. 경고음·실패 의미의 자막 큐 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "SOURCE-AUDIO",
            "PAGE-C06",
            "ENCODE-LINK",
            "DELIVERY-C06",
            "DISPLAY-C06-1",
            "DISPLAY-C06-2"
          ],
          "user_impact": "소리를 듣지 못하는 이용자는 보안 확인이 실패했다는 결과와 재확인이 필요한 이유를 해당 시점에 알 수 없다."
        },
        {
          "original_start_seconds": 16.47,
          "original_end_seconds": 19,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "다섯 번째 장면: 보안 확인 다시 하기 / 보안 확인을 완료하고 발급을 확인하세요.",
          "caption_start_seconds": 16.17,
          "caption_end_seconds": 19.81,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C06-2"
          ],
          "user_impact": "보안 확인을 다시 완료한 뒤 발급을 확인하는 순서는 화면 안내로 전달된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "여섯 번째 장면: 새 코드 저장 / 코드를 안전한 곳에 보관하세요.",
          "caption_start_seconds": 19.81,
          "caption_end_seconds": 27.05,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C06-2"
          ],
          "user_impact": "새 코드를 안전하게 보관해야 한다는 안내는 전달된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "여섯 번째 장면의 새 코드 저장 안내만 유지된다. 이전 코드 무효화 조건의 자막 큐 없음.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C06",
            "ENCODE-LINK",
            "DELIVERY-C06",
            "DISPLAY-C06-2"
          ],
          "user_impact": "소리를 듣지 못하는 이용자는 재발급 후 이전 코드가 사용할 수 없게 된다는 중요한 조건을 놓친다."
        },
        {
          "original_start_seconds": 27.45,
          "original_end_seconds": 29.08,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "일곱 번째 장면: 발급 완료 / 발급 완료 화면을 확인하세요.",
          "caption_start_seconds": 27.05,
          "caption_end_seconds": 31.18,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C06-3"
          ],
          "user_impact": "발급 완료 화면을 확인하라는 안내는 전달된다."
        }
      ],
      "missing_evidence": [
        "31.1893125–31.208333초에 대한 원본 음성 확인 자료.",
        "SOURCE-VISUAL이 언급한 후보 자막의 실제 큐 목록과 평가 페이지 연결 자료. 확인된 누락 판정에는 필요하지 않지만 후보 자막을 실제 제공 자막으로 인정하려면 필요하다."
      ],
      "recommendations": [
        {
          "change": "M1의 3.8–6.56초에 사용자 질문을 동기화해 표시하고, 이어지는 안내자 답변과 필요한 화자 전환을 식별한다. 폐쇄 자막 또는 영상에 포함된 개방 자막 모두 가능하다.",
          "retest": "실제 플레이어에서 질문과 답변 구간을 재생하여 발화 내용·화자·순서가 전달되는지 확인한다. 폐쇄 자막이라면 로드·선택·활성 큐·표시도 확인한다."
        },
        {
          "change": "12.2–12.82초의 정보성 소리를 '[경고음 두 번: 보안 확인 실패]'와 같이 의미를 포함해 동기화해 표시한다.",
          "retest": "두 경고음과 결과 화면을 원본 및 실제 표시와 대조하고, 실패 의미를 필요한 시점에 읽을 수 있는 지속 시간과 배치인지 확인한다."
        },
        {
          "change": "22.76–26.02초에 새로 발급하면 이전 코드는 더 이상 사용할 수 없다는 조건을 동기화해 표시한다.",
          "retest": "원본의 조건과 부정 의미가 보존되는지 확인하고, 실제 표시에서 읽을 시간과 가림 여부를 검토한다. 수정 후 전체 영상의 다른 정보 누락도 재점검한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "실행은 제공된 텍스트 기록과 첨부 PNG 검토에 한정된다. URL 방문, 직접 청취, 연속 영상 재생 또는 사이트 변경을 수행하지 않았다.",
    "caption_delivery의 none은 실제 자막 트랙과 별도 대화·소리 자막이 관찰되지 않았다는 뜻이다. 영상의 일부 안내문이 음성 의미를 전달하는 사실은 비교 결과에 별도로 반영했다.",
    "화면 텍스트의 표시 시간은 검증 기록의 장면 경계이며 자막 큐 시간이 아니다. 의미가 대응하는 안내문도 별도의 사용자 읽기 시험을 수행했다고 주장하지 않는다.",
    "본문과 매체의 정보가 대응하더라도 명확한 대안 표시가 없으므로 예외는 성립하지 않는다. 정적인 전체 설명은 현재 누락된 동기화 자막을 대신하지 않는다.",
    "확인된 누락만으로 fail이 성립한다. 마지막 미확인 구간과 후보 자막 기록의 불확실성은 이 판정을 없애지 않으며, 사이트 전체 적합성이나 다른 성공 기준은 평가하지 않았다."
  ]
}
```