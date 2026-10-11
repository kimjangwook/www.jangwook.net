**判정: fail입니다.** 제공된 독립 음성 처리 기록, 실제 브라우저 자막 처리 기록과 첨부 PNG를 비교하면 M1의 자막은 원본 녹음 구간보다 일관되게 5초 늦게 설정되어, 대사·경고음과 다른 단계의 화면에 표시됩니다. 마지막 안내 자막 A5는 영상 종료 후에 시작하므로 재생 중 제공되지 않습니다. 평가는 제공된 자료 검토로 실행했으며, 직접 청취·연속 영상 재생·URL 방문은 하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C05 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가. 푸터 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "제공된 범위 목록에는 M1 하나가 있다. 독립 원본 처리 기록과 실제 자막 처리 기록·PNG에서 자막의 5초 지연과 영상 종료 이후에 배치된 마지막 안내를 확인했다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C05",
      "PAGE-C05",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C05",
      "DISPLAY-C05-1",
      "DISPLAY-C05-2",
      "DISPLAY-C05-3"
    ],
    "derived_processing_and_limits": [
      "실행 가능한 추가 브라우저·음성·영상 도구는 없다. 제공된 텍스트 기록과 실제 첨부 PNG 세 장을 검토했다.",
      "SOURCE-ASR는 후보 자막을 사용하지 않은 원본 MP4의 독립 자동 전사다. 단어 시각과 인식 결과는 근사치이며, 높은 인식 확률만으로 정확성을 확정하지 않았다.",
      "SOURCE-AUDIO는 원본 MP4와 독립 녹음 클립의 상관 분석으로 화자와 전체 녹음 구간을 연결한다. 동기화 비교에는 이 구간을 우선 사용했다.",
      "SOURCE-SOUND는 12.2–12.4초와 12.62–12.82초의 두 음을 측정했다. 보안 확인 실패라는 의미는 음 검출 자체가 아니라 PAGE-C05의 실제 설명에 근거한다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 디코딩·고정 장면 구조 기록을 DELIVERY-C05의 전체 큐 목록 및 첨부 PNG와 함께 사용했다. 이는 이 통제된 고정 화면 영상에 한정한 파생 처리 근거다.",
      "처리 교집합의 끝은 독립 전사의 처리 종료인 31.1893125초로 제한했다. 영상 끝 31.208333초까지의 짧은 나머지는 음성·표시 대응 전체를 검토했다고 간주하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대화와 이해에 필요한 보안 경고음이 있는 사전 녹화 동기화 영상. 1.2.2 적용 대상.",
      "classification_evidence_ids": [
        "MEDIA-C05",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C05",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "폐쇄 자막은 로드·활성화되어 있으나 원본 녹음 구간보다 5초 늦다. 질문·금지 안내·경고음·후속 지시가 서로 다른 화면 단계에 표시되고, A5는 영상 길이 밖에 있어 제공되지 않는다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C05",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C05",
          "DELIVERY-C05",
          "DISPLAY-C05-1",
          "DISPLAY-C05-2",
          "DISPLAY-C05-3"
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
              "DELIVERY-C05",
              "DISPLAY-C05-1",
              "DISPLAY-C05-2",
              "DISPLAY-C05-3"
            ],
            "reason": "독립 원본 처리, 전체 큐 목록, 실제 활성 큐·PNG와 고정 장면 구조 기록의 교집합이다. 직접 연속 시청한 범위는 아니다. A1 표시 자체의 PNG는 없고, A5는 영상 시간 밖이다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "독립 음성 전사 처리 종료 이후의 영상 꼬리 구간. 전체 음성·자막·화면 대응 확인 범위에 포함하지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다. 독립 전사 발화 시각은 약 0.94–3.04초.",
          "caption_location": "폐쇄 자막 A1, line 76: 안내자: 설정에서 보안을 선택합니다.",
          "caption_start_seconds": 6,
          "caption_end_seconds": 8.4,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-1",
            "ENCODE-LINK"
          ],
          "user_impact": "자막이 녹음 구간보다 5초 늦다. 2초의 보안 설정 화면에는 활성 자막이 없고, 해당 안내는 질문 및 코드 폐기 전 단계에 걸쳐 배치되어 지시와 화면을 연결하기 어렵다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요? 독립 전사 발화 시각은 약 3.8–6.56초.",
          "caption_location": "폐쇄 자막 B1, line 76: 사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_start_seconds": 9,
          "caption_end_seconds": 12,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-1"
          ],
          "user_impact": "5초 지연으로 질문 화면의 5초에는 자막이 없고, 원본에서 금지 답변이 진행 중인 9.4초에 질문 자막이 표시된다. 질문과 답변의 순서를 따라가기 어렵다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요. 독립 전사 발화 시각은 약 7.71–11.18초.",
          "caption_location": "폐쇄 자막 A2, line 76: 안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_start_seconds": 12.6,
          "caption_end_seconds": 16.6,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-1",
            "DISPLAY-C05-2"
          ],
          "user_impact": "否定과 저장 전 폐기 금지라는 중요한 조건은 문구에 보존되지만 5초 늦다. 코드 폐기 전 화면에서는 질문 자막이 보이고, 금지 안내는 보안 확인 결과 화면에서 표시되어 조건을 필요한 단계와 연결하기 어렵다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 두 번: 12.2–12.4초, 12.62–12.82초.",
          "caption_location": "폐쇄 자막 SFX, line 76: [보안 확인 실패를 알리는 경고음 두 번]",
          "caption_start_seconds": 17.2,
          "caption_end_seconds": 20.82,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-SOUND",
            "SOURCE-AUDIO",
            "PAGE-C05",
            "DELIVERY-C05",
            "DISPLAY-C05-1",
            "DISPLAY-C05-2"
          ],
          "user_impact": "경고음 시작보다 자막이 5초 늦다. 12.5초 보안 확인 결과 화면에는 자막이 없고, 실패 설명은 보안 확인을 다시 하는 후속 화면의 17.8초에 표시되어 실패 발생 시점과 대응 단계를 혼동하게 한다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다. 독립 전사 발화 시각은 약 16.47–19초.",
          "caption_location": "폐쇄 자막 A3, line 76: 안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_start_seconds": 21.42,
          "caption_end_seconds": 24.46,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-2"
          ],
          "user_impact": "5초 늦게 표시되어, 보안 확인 재시도 화면에는 경고음 자막이 나타나고 새 코드 저장 화면의 22초에 재시도 안내가 표시된다. 절차의 선후 조건을 화면과 함께 이해하기 어렵다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 시각은 독립 전사 근사치이며, 연결된 A4 녹음 전체는 20.06–26.7초.",
          "caption_location": "폐쇄 자막 A4의 첫 문장, line 76: 안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_start_seconds": 25.06,
          "caption_end_seconds": 31.7,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-2",
            "DISPLAY-C05-3"
          ],
          "user_impact": "A4 전체 큐가 연결된 녹음보다 5초 늦다. 저장 안내 발화 중인 22초에는 이전 단계 자막이 표시되고, 저장 자막은 이후 발급 완료 화면까지 이어진다. 큐 종료는 영상 끝보다 약 0.492초 뒤여서 실제 표시도 잘린다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 시각은 독립 전사 근사치.",
          "caption_location": "폐쇄 자막 A4의 둘째 문장, line 76: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_start_seconds": 25.06,
          "caption_end_seconds": 31.7,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-2",
            "DISPLAY-C05-3"
          ],
          "user_impact": "이전 코드의 사용 불가 조건은 문구에 보존되지만 늦게 제공된다. 해당 조건의 발화 중인 25초에는 활성 자막이 없고, 28.3초 발급 완료 화면에는 이 조건이 포함된 이전 안내 자막이 표시된다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다. 독립 전사 발화 시각은 약 27.45–29.08초.",
          "caption_location": "폐쇄 자막 A5, line 76: 안내자: 발급 완료 화면을 확인합니다. 큐는 있으나 재생 가능한 시간 밖.",
          "caption_start_seconds": 32.3,
          "caption_end_seconds": 34.58,
          "relation": "missing",
          "evidence_ids": [
            "MEDIA-C05",
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-3"
          ],
          "user_impact": "영상은 31.208333초에 끝나지만 A5는 32.3초에 시작하므로 재생 중 표시될 수 없다. 28.3초의 발급 완료 화면에는 A4가 표시되어, 마지막 발화에 대응하는 동기화 자막이 제공되지 않는다."
        }
      ],
      "missing_evidence": [
        "31.1893125–31.208333초 구간의 독립 원본 음성·표시 대응 확인.",
        "A1 활성 구간의 직접 표시 PNG와 영상 종료 직전 A4 표시 기록. 현재 자료에는 해당 직접 표본이 없으며, 확인된 위반 판정에는 영향을 주지 않는다."
      ],
      "recommendations": [
        {
          "change": "모든 큐의 시작·종료를 우선 5초 앞당겨 원본 녹음 구간에 맞춘다: A1 1–3.4초, B1 4–7초, A2 7.6–11.6초, SFX 12.2–15.82초, A3 16.42–19.46초, A4 20.06–26.7초, A5 27.3–29.58초. 화자·否定·조건·경고음 의미는 유지한다.",
          "retest": "수정된 실제 플레이어에서 각 큐의 로드·선택·표시와 활성 시간을 원본 음성 및 화면 전환에 다시 대조한다. 특히 질문과 금지 답변, 12.2초의 첫 경고음, 마지막 안내가 해당 단계에서 제공되는지 확인한다."
        },
        {
          "change": "시간 수정 후 긴 A4의 읽기 가능성과 SFX 유지 구간을 검토하고, 필요하면 의미 단위로 큐를 나누거나 표시 지속 시간을 조정한다. 중요한 화면 정보를 가리지 않는 배치를 유지한다.",
          "retest": "실제 크기의 플레이어에서 A4 두 문장을 필요한 시점에 읽을 수 있는지, SFX가 후속 지시와 혼동되지 않는지, 조작부에 가려지지 않는지 확인한다. 임의의 초·글자 수를 WCAG 고정 합격선으로 사용하지 않는다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "범위 목록의 완전성은 제공된 평가 입력에 근거한다. 사이트 전체나 푸터의 매체를 별도로 조사하지 않았다.",
    "직접 청취, 연속 영상 재생, 추가 URL 방문, 자막 조작 또는 사이트 수정은 수행하지 않았다. 실행 run은 제공된 증거 검토를 뜻한다.",
    "독립 자동 전사의 단어 시각은 근사치다. 일관된 5초 지연은 별도 원본 녹음 연결 구간과 실제 큐 시각으로 확인했다.",
    "SOURCE-VISUAL의 '각 큐를 활성 상태에서 표본 확인' 설명은 제공된 개별 표본만으로 모두 뒷받침되지 않는다. A1 활성 표본은 없고 A5는 영상 길이 밖이므로, 모든 큐를 직접 화면에서 확인했다고 주장하지 않는다.",
    "첨부 PNG에서 표시된 자막이 주요 본문이나 조작부에 가려진 증거는 보이지 않았다. 이것만으로 모든 시간의 읽기 충분성을 확정하거나 별도의 배치 위반을 선언하지 않았다.",
    "실제 본문에는 전체 대사·조건을 대신하는 내용이나 본문 대안이라는 명확한 표시가 없어 예외를 적용하지 않았다.",
    "이 결과는 지정된 범위의 WCAG 2.2 성공 기준 1.2.2 수준 A에 한정하며, 다른 성공 기준이나 사이트 전체 적합성 인증을 대신하지 않는다."
  ]
}
```