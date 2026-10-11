**판정: fail.** 제공된 독립 음성 처리 기록, 실제 브라우저 자막 처리 기록과 첨부 PNG를 비교한 결과, 자막 큐가 원본 구간보다 일괄적으로 5초 늦어 대사·경고음과 해당 화면에 동기화되지 않습니다. 마지막 안내 자막은 31.208333초인 영상의 종료 이후에 시작하므로 정상 재생 중 제공되지 않습니다. 이번 실행은 제공 자료 검토이며, 평가자가 직접 청취하거나 영상을 연속 재생한 것은 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C05 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가. 페이지 하단 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 녹화 영상 M1에 적용되는 자막 요구를 평가했다. 실제 자막 표시 기록과 PNG에서 대사·중요한 경고음의 지연을 확인했으며, 마지막 큐는 영상 종료 이후에 시작한다. 본문 대안 예외는 성립하지 않는다."
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
      "제공된 SOURCE-ASR은 원본 MP4를 독립적으로 디코딩한 자동 전사다. 자막 후보를 전사 근거로 사용하지 않았으며, 인식 결과와 단어 시각에는 오류 가능성이 있다.",
      "SOURCE-AUDIO의 분리 녹음 상관 분석으로 화자와 녹음 구간을 확인했다. 대사 큐의 지연 비교에는 이 구간을 사용했고, A4 내부 두 정보 단위는 근사 ASR 시각으로 나눴다.",
      "SOURCE-SOUND의 FFT 검출은 두 경고음의 시각을 제공한다. 보안 확인 실패라는 의미는 실제 페이지 본문 PAGE-C05에서 확인했다.",
      "SOURCE-VISUAL과 ENCODE-LINK의 전체 프레임 디코딩·통제된 화면 구성 검증 기록 및 첨부 PNG를 검토했다. 이는 평가자의 직접 연속 재생이 아니며, 임의 영상에 대한 표본 검사의 일반적 충분성을 뜻하지 않는다.",
      "DELIVERY-C05의 실제 활성 큐 기록과 PNG에서 폐쇄 자막 표시를 확인했다. 큐 A5는 재생 길이 밖에 있으므로 '각 큐를 활성 상태에서 표본 확인했다'는 포괄적 처리 설명을 A5의 표시 증거로 인정하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "음성 대화와 이해에 필요한 두 번의 경고음을 포함한 사전 녹화 동기화 매체",
      "classification_evidence_ids": [
        "MEDIA-C05",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL",
        "PAGE-C05"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "자막 문구는 독립 전사의 대사 의미, 화자 및 경고음 의미와 대응하지만, 큐가 원본 녹음·경고음 시작보다 5초 늦다. 실제 화면에서도 이전 단계의 자막이 다음 단계에 나타난다. A5는 영상 종료 이후에 시작해 마지막 대사의 동기화 자막이 제공되지 않는다.",
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
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C05",
              "DISPLAY-C05-1",
              "DISPLAY-C05-2",
              "DISPLAY-C05-3"
            ],
            "reason": "독립 원본 음성 처리 범위와 전체 화면 구성 검증 범위의 교집합이다. 자막 목록 전체, 활성 큐 표본 및 실제 PNG를 함께 비교했다. A5의 표시 불가는 전체 큐 시각과 매체 길이로 확인했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.1893125,
            "end_seconds": 31.208333,
            "reason": "보고된 독립 전사 처리 범위를 벗어난 끝부분이다. 이 구간의 음성·자막 대응을 확인한 것으로 확장하지 않는다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "폐쇄 자막 A1, line 76: 안내자: 설정에서 보안을 선택합니다.",
          "caption_start_seconds": 6,
          "caption_end_seconds": 8.4,
          "relation": "timing_mismatch",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C05",
            "DISPLAY-C05-1"
          ],
          "user_impact": "시작이 원본 녹음보다 5초 늦다. 2초의 보안 설정 화면에는 활성 자막이 없고, 안내가 끝난 뒤 다음 단계에 표시되어 조작과 설명을 함께 이해하기 어렵다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
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
          "user_impact": "시작이 5초 늦다. 5초에는 자막이 없고, 9.4초에는 안내자의 금지·조건 설명 구간에 사용자의 질문 자막이 표시되어 질문과 답변의 대응이 어긋난다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
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
          "user_impact": "중요한 부정과 저장 전 폐기 금지 조건이 5초 늦다. 15초의 보안 확인 결과 화면에서 뒤늦게 표시되어 이전 코드 처리 조건을 필요한 단계에서 알기 어렵다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2–12.4초와 12.62–12.82초의 경고음 두 번. 실제 페이지 본문에 따르면 보안 확인 실패를 알린다.",
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
          "user_impact": "첫 경고음보다 5초 늦다. 12.5초 결과 화면에는 활성 자막이 없고, 17.8초 재확인 화면에 실패 경고 자막이 나타나 실패 시점과 후속 절차를 혼동할 수 있다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
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
          "user_impact": "시작이 5초 늦다. 22초의 새 코드 저장 화면에 이전 보안 확인 절차가 표시되어 단계 순서와 조건의 대응이 어긋난다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "폐쇄 자막 A4 앞 문장, line 76: 안내자: 새 코드를 안전한 곳에 저장합니다.",
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
          "user_impact": "A4 녹음 시작 20.06초에 비해 큐가 5초 늦다. 저장 안내가 완료 화면까지 이어지며, 28.3초에도 마지막 완료 안내 대신 저장 자막이 표시된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "폐쇄 자막 A4 뒤 문장, line 76: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
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
          "user_impact": "이전 코드 무효화 조건이 포함된 A4 전체 큐가 늦게 배치되어 조건 안내의 초반에는 읽을 수 없다. 25초에는 활성 자막이 없고, 28.3초 완료 화면에서 뒤늦게 표시된다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "폐쇄 자막 A5, line 76: 안내자: 발급 완료 화면을 확인합니다. 큐 전체가 매체 길이 밖에 있다.",
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
          "user_impact": "영상은 31.208333초에 끝나지만 큐는 32.3초에 시작한다. 정상 재생 중 마지막 음성 안내에 대응하는 자막을 읽을 수 없으며, 28.3초에는 이전 A4가 표시된다."
        }
      ],
      "missing_evidence": [
        "31.1893125–31.208333초 끝부분의 독립 음성·자막 대응 기록. 확인된 위반의 fail 판정에는 영향을 주지 않는다."
      ],
      "recommendations": [
        {
          "change": "A1·B1·A2·A3·A4의 5초 지연을 제거한다. 원본 녹음 구간인 1–3.4초, 4–7초, 7.6–11.6초, 16.42–19.46초, 20.06–26.7초를 수정 시작점으로 사용하고 실제 발화와 읽기 시간을 점검한다.",
          "retest": "실제 플레이어에서 각 대사와 해당 화면을 함께 재생한다. 활성 큐 시각, 화자, 부정·조건의 의미, A4 두 문장의 읽기 시간 및 조작부 가림을 확인한다."
        },
        {
          "change": "SFX를 첫 경고음이 발생하는 12.2초부터 표시하도록 앞당기고, 두 번의 경고음과 보안 확인 실패 의미를 유지한다.",
          "retest": "12.2–12.82초 경고음과 결과 화면에서 자막이 보이는지 확인한다. 충분히 읽을 수 있으면서 후속 재확인 단계와 혼동되지 않는 종료 시각인지 점검한다."
        },
        {
          "change": "A5를 원본 안내 구간인 27.3–29.58초에 맞춰 영상 종료 전에 제공한다. 모든 큐가 재생 길이 안에 유효하게 배치되었는지 확인한다.",
          "retest": "27.3초부터 영상 종료까지 실제 재생하여 완료 안내 자막의 활성화·표시·읽기 시간을 확인하고, 종료 후에만 시작하는 큐가 없는지 검사한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "추가 브라우저·음성·영상 도구가 없어 URL 방문, 직접 청취, 연속 재생 또는 사이트 변경을 수행하지 않았다.",
    "실행 run은 제공된 텍스트 기록과 실제 첨부 PNG를 검토했다는 뜻이다. 제공 기록의 도구 처리를 평가자가 직접 실행한 것으로 표현하지 않는다.",
    "자동 전사의 단어 시각은 근사치다. 일괄 5초 지연은 별도의 원본 녹음 구간과 실제 큐 시각으로 확인했으며, 임의의 지연 허용치를 WCAG 고정 합격선으로 사용하지 않았다.",
    "각 큐를 활성 상태에서 확인했다는 포괄적 설명은 영상 종료 이후의 A5와 충돌한다. A5는 표시 확인으로 인정하지 않고, 구체적인 매체 길이·큐 시각·실제 표본을 근거로 평가했다.",
    "첨부 화면에서는 표시된 자막의 본문 가림을 위반으로 확인하지 않았다. 지연 및 마지막 안내 누락과 별개로 모든 표시 상태의 읽기 충분성을 보증하지 않는다.",
    "판정은 지정된 본문과 M1의 WCAG 2.2 성공 기준 1.2.2 수준 A에만 한정하며, 사이트 전체 적합성이나 다른 성공 기준을 판정하지 않는다."
  ]
}
```