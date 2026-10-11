**판정: not_applicable — 본문의 매체 대안 예외가 확인됩니다.** 제공된 독립 전사·음성 처리 기록·전체 프레임 처리 기록과 첨부 화면을 본문 전체와 비교한 결과, 대화·화자·두 번의 경고음 의미·일곱 단계의 화면 정보가 모두 본문에 포함되어 있으며, 실제 페이지에도 매체 대안이라는 안내가 명확히 표시되어 있습니다. 따라서 이 범위에서는 자막이 관찰되지 않았다는 이유만으로 1.2.2 위반으로 판정하지 않습니다. 이번 실행은 제공된 기록과 PNG 검토이며, 직접 청취·연속 영상 재생·사이트 방문은 하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C09 — 제공된 실제 페이지 상태의 본문과 교육 영상 M1만 평가. 푸터 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "범위의 유일한 녹화 동기화 매체는 본문에 없는 정보를 추가하지 않는 본문의 매체 대안이며, 실제 페이지에 그 사실이 명확히 표시되어 있다. 제공된 원본 처리 기록과 본문 전체 및 첨부 화면으로 예외를 확인했다."
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
      "SOURCE-ASR는 원본 해시에 연결된 독립 자동 전사다. 후보 자막을 전사 근거로 사용하지 않았으며, 단어 시각과 인식 결과에는 오차 가능성이 있다.",
      "SOURCE-AUDIO는 원본과 독립 음성 녹음의 상관 분석으로 화자와 클립 구간을 연결한다. 통제된 두 화자 자료에 한정된 근거다.",
      "SOURCE-SOUND의 두 음 검출 구간은 12.2–12.4초와 12.62–12.82초다. 보안 확인 실패라는 의미는 검출기가 아니라 PAGE-C09의 실제 안내에서 확인했다.",
      "SOURCE-VISUAL과 ENCODE-LINK는 전체 749프레임의 디코드, 일곱 정적 화면의 구성과 시간 범위, 오디오 연결 및 무신호 말미를 기록한다. 이 통제된 자료의 전체 범위 확인에 사용했으며, 대표 PNG만으로 전체 처리를 추정하지 않았다.",
      "첨부 PNG에서는 아홉 시점의 실제 화면을 확인했다. 자막 큐를 표본 확인했다는 일반 처리 설명과 달리, 이 사례의 DELIVERY-C09에는 트랙과 활성 큐가 없으며 PNG에도 별도의 자막은 보이지 않는다.",
      "SOURCE-ASR의 처리 끝은 31.1893125초, 디코드 오디오 길이는 약 31.189333초, 영상 길이는 31.208333초다. 말미 차이는 전체 프레임 처리 및 ENCODE-LINK의 무신호 말미 기록과 함께 검토했다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대화와 정보성 이중 경고음이 있는 사전 녹화 동기화 매체. 실제 무음 영상이나 실시간 매체가 아니며, 검증된 본문 매체 대안 예외에 해당한다.",
      "classification_evidence_ids": [
        "MEDIA-C09",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "not_applicable",
      "reason": "본문 전체가 모든 대사, 화면 밖 화자, 경고음의 횟수와 의미, 일곱 화면의 안내 내용을 포함한다. 실제 표시 문구가 본문의 매체 대안이며 추가 정보가 없음을 명시한다.",
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
          "ENCODE-LINK",
          "DISPLAY-C09-1",
          "DISPLAY-C09-2",
          "DISPLAY-C09-3"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C09",
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
            "end_seconds": 31.208333,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-SOUND",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C09",
              "PAGE-C09",
              "DISPLAY-C09-1",
              "DISPLAY-C09-2",
              "DISPLAY-C09-3"
            ],
            "reason": "예외検증을 위한 전체 내용 비교 범위다. 원본 전체 오디오 처리, 전체 프레임 및 정적 화면 구성 검증, 실제 표시 표본과 본문 전체를 함께 검토했다. 동기화 자막의 전체 품질을 검증했다는 뜻은 아니다."
          }
        ],
        "unreviewed_ranges": []
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 같은 안내자 대사와 보안 설정 화면 안내가 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-1"
          ],
          "user_impact": "설정에서 보안을 선택하는 절차를 본문으로 확인할 수 있다. 검증된 예외에 따라 자막 품질 판정은 하지 않는다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 사용자 역할과 질문 전문이 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-1"
          ],
          "user_impact": "화면 밖 질문자의 역할과 이전 코드 폐기 질문을 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 부정과 저장 전 폐기 금지 조건이 모두 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-1"
          ],
          "user_impact": "이전 코드를 성급히 폐기하지 않도록 하는 핵심 부정과 조건을 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "두 번의 경고음. 개별 음은 12.2–12.4초와 12.62–12.82초이며 보안 확인 실패를 알린다.",
          "caption_location": "자막 비교 비적용. PAGE-C09의 사전 안내와 전체 설명에 두 번의 경고음 및 보안 확인 실패 의미가 명시되어 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-SOUND",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-1",
            "DISPLAY-C09-2"
          ],
          "user_impact": "소리를 듣지 않아도 실패 신호의 횟수와 의미를 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 같은 대사와 보안 확인 다시 하기 화면 안내가 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-2"
          ],
          "user_impact": "보안 확인을 다시 완료한 뒤 발급을 확인해야 하는 순서를 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 시간은 독립 전사의 근사 발화 구간이다.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 같은 대사와 새 코드 저장 화면 안내가 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-2"
          ],
          "user_impact": "새 코드를 안전하게 보관해야 한다는 정보를 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 시간은 독립 전사의 근사 발화 구간이다.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 새 발급 시 이전 코드 사용 불가라는 조건과 부정이 모두 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-2"
          ],
          "user_impact": "새 코드 발급으로 이전 코드가 무효화된다는 중요한 결과를 본문으로 확인할 수 있다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "자막 비교 비적용. PAGE-C09 전체 설명에 같은 대사와 발급 완료 화면 안내가 있다.",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "unknown",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "PAGE-C09",
            "DISPLAY-C09-3"
          ],
          "user_impact": "절차의 완료 확인 방법을 본문으로 확인할 수 있다."
        }
      ],
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "이 기준에 따른 필수 수정은 없다. 현재의 전체 설명과 명확한 매체 대안 안내를 유지한다.",
          "retest": "영상이나 본문 변경 시 전체 대사·화자·중요한 소리·화면 정보를 다시 비교하고 실제 표시 안내를 확인한다. 본문에 없는 정보가 추가되거나 안내가 사라지면 일반 자막 요구로 재평가한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "실행은 제공된 텍스트 기록과 첨부 PNG 검토에 한정된다. 평가자가 원본을 직접 듣거나 연속 재생하지 않았다.",
    "전체 범위 확인은 이 통제된 정적 화면 자료에 대한 제공 처리 기록에 의존한다. 같은 방법의 대표 화면만으로 임의의 다른 영상 전체를 확인할 수는 없다.",
    "comparisons의 unknown은 검증된 예외로 자막 품질 비교를 수행하지 않았음을 뜻한다. 본문과 원본의 정보 일치가 미확인이라는 뜻은 아니다.",
    "not_applicable은 이 페이지 상태와 평가 범위의 WCAG 2.2 성공 기준 1.2.2에만 해당하며, 사이트 전체 적합성이나 다른 성공 기준의 판정이 아니다."
  ]
}
```