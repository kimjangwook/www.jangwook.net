**판정: pass — 제공된 평가 범위에서 WCAG 2.2 성공 기준 1.2.2, 수준 A를 충족합니다.** 독립 음성 전사·원본 연결 및 화자 검증·경고음 측정 기록을 실제 자막 큐와 첨부 화면에 대조한 결과, 대사와 중요한 부정·조건, 화면 밖 화자, 보안 확인 실패를 알리는 두 번의 경고음이 동기화된 자막으로 제공됩니다. 긴 자막과 경고음 자막의 표시 시간 및 고정 배치도 확인했으며, 중요한 화면 정보나 플레이어 조작부에 가려지는 문제는 확인되지 않았습니다. 이는 제공된 통제형 매체의 처리 기록과 PNG를 검토한 결과이며, 평가자가 URL에 방문하거나 직접 청취·연속 재생한 결과는 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C01 — 제공된 Chromium 페이지 상태의 기사 본문과 교육 영상 M1만 평가; 페이지 하단 탐색 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "pass",
    "reason": "범위 내 매체는 M1 하나로 목록이 완전하다. 원본과 독립 처리 기록, 전체 큐, 실제 표시 PNG 및 통제형 고정 화면 구조를 대조하여 필요한 음성·소리 정보와 자막의 의미·화자·시간·배치 대응을 확인했다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C01",
      "PAGE-C01",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C01",
      "DISPLAY-C01-1",
      "DISPLAY-C01-2",
      "DISPLAY-C01-3"
    ],
    "derived_processing_and_limits": [
      "평가자는 제공된 텍스트 처리 기록과 첨부 PNG를 검토했다. 추가 브라우저·음성·영상 도구는 없으며 직접 방문·청취·연속 재생하지 않았다.",
      "SOURCE-ASR은 동일 원본 해시의 실제 MP4 음성을 faster-whisper large-v3로 독립 처리한 기록이다. 후보 자막은 전사에 사용되지 않았고, 인식 결과와 단어 시간은 확정적 원본 전사가 아니다.",
      "SOURCE-AUDIO는 원본 음성과 여섯 개의 독립 녹음 클립 간 상관 검증으로 화자 및 전체 클립 구간을 연결한다. ASR의 근사 발화 경계와 클립 경계 차이를 자막 지연으로 단정하지 않았다.",
      "SOURCE-SOUND는 두 경고음의 시각을 측정한다. 보안 확인 실패라는 의미는 검출기 추정이 아니라 PAGE-C01의 실제 안내 문구로 확인했다.",
      "SOURCE-VISUAL과 ENCODE-LINK는 전체 749프레임 디코딩, 일곱 고정 화면 및 진행 막대만 변하는 구성을 기록한다. 모든 큐의 활성 표시 PNG를 검토했으며, 전체 표시 범위 판단은 표본만이 아니라 이 고정 구조 검증을 함께 근거로 삼았다.",
      "A2는 4초, A4는 6.64초 동안 완전한 문장이 표시되며 고정된 관련 화면 안에서 잘림·가림 없이 읽을 수 있다. 경고음 자막은 두 펄스 이후에도 15.82초까지 유지된다. 이 시간을 WCAG의 고정 합격선으로 사용하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 이해에 필요한 두 번의 경고음을 포함한 사전 녹화 동기화 매체",
      "classification_evidence_ids": [
        "MEDIA-C01",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "pass",
      "reason": "모든 대사와 중요한 소리의 의미, 화면 밖 화자 변경이 실제 표시되는 폐쇄 자막과 대응한다. 필요한 정보의 누락·왜곡·이용에 지장을 주는 시간 불일치·가림은 확인되지 않았다. 본문은 대사의 상세 조건을 모두 제공하지 않으므로 본문 대안 예외 없이 일반 자막 요구로 평가했다.",
      "exception": {
        "claimed": false,
        "no_extra_information": false,
        "clearly_labeled": false,
        "verified": false,
        "evidence_ids": [
          "PAGE-C01",
          "SOURCE-ASR"
        ]
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C01",
          "DISPLAY-C01-1",
          "DISPLAY-C01-2",
          "DISPLAY-C01-3"
        ]
      },
      "coverage": {
        "complete": true,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.1893125,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C01",
              "DISPLAY-C01-1",
              "DISPLAY-C01-2",
              "DISPLAY-C01-3"
            ],
            "reason": "독립 음성 처리, 자막 큐 및 필요한 표시 검증의 공통 범위이다. 모든 음성·중요한 소리 단위를 포함하며, 표본 사이의 표시는 검증된 고정 화면·고정 자막 배치 구조로 확인했다."
          }
        ],
        "unreviewed_ranges": []
      },
      "comparisons": [
        {
          "original_start_seconds": 1,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "폐쇄 자막 A1, line 76; 2초 화면",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-1"
          ],
          "user_impact": "보안 메뉴 선택 지시와 화자를 해당 화면에서 읽을 수 있다."
        },
        {
          "original_start_seconds": 4,
          "original_end_seconds": 7,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "폐쇄 자막 B1, line 76; 5초 화면",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-1"
          ],
          "user_impact": "화면 밖 화자가 사용자로 바뀐 사실과 질문의 의미를 구분할 수 있다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "폐쇄 자막 A2, line 76; 9.4초 화면",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-1",
            "SOURCE-VISUAL"
          ],
          "user_impact": "부정과 저장 전 폐기 금지 조건이 보존된다. 4초간 완전한 문장이 표시되고 중요한 화면 정보나 조작부에 가리지 않는다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2~12.4초와 12.62~12.82초의 두 경고음; 보안 확인 실패를 알림.",
          "caption_location": "폐쇄 자막 SFX, line 76; 12.5초·15초 화면",
          "caption_start_seconds": 12.2,
          "caption_end_seconds": 15.82,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C01",
            "DELIVERY-C01",
            "DISPLAY-C01-1",
            "DISPLAY-C01-2"
          ],
          "user_impact": "경고음의 횟수와 실패 의미를 소리 없이 이해할 수 있다. 첫 펄스에 맞춰 표시되고 관련 결과 화면에서 읽을 시간을 제공한다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "폐쇄 자막 A3, line 76; 17.8초 화면",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-2"
          ],
          "user_impact": "보안 확인을 먼저 완료해야 한다는 순서와 조건이 보존된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 발화 시간은 ASR 근사값이며 원본 클립 시작은 20.06초이다.",
          "caption_location": "폐쇄 자막 A4의 첫 문장, line 76; 22초·25초 화면",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "안전한 저장 지시를 해당 저장 화면에서 읽을 수 있다. 두 문장 전체가 6.64초간 잘림·가림 없이 유지된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 발화 시간은 ASR 근사값이다.",
          "caption_location": "폐쇄 자막 A4의 둘째 문장, line 76; 22초·25초 화면",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-2",
            "SOURCE-VISUAL"
          ],
          "user_impact": "재발급 조건과 이전 코드의 사용 불가 의미가 정확히 보존된다. 같은 클립의 두 문장을 함께 표시하며 발화 종료 이후까지 유지되어 순서나 이해를 방해하지 않는다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "폐쇄 자막 A5, line 76; 28.3초 화면",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C01",
            "DISPLAY-C01-3"
          ],
          "user_impact": "완료 확인 지시를 해당 완료 화면에서 읽을 수 있다."
        }
      ],
      "missing_evidence": [],
      "recommendations": []
    }
  ],
  "errors": [],
  "limits": [
    "판정은 제공된 페이지 상태, 기사 본문과 M1에 대한 1.2.2 평가에 한정된다. 전체 사이트 적합성이나 다른 성공 기준을 판정하지 않는다.",
    "실제 자막 제공 여부는 제공된 Chromium 처리 기록과 첨부 PNG로 확인했다. 평가자가 폐쇄 자막을 직접 선택하거나 플레이어를 조작한 것은 아니다.",
    "전체 표시 범위의 충분성은 이 통제형 일곱 고정 화면 구성의 원본 연결·전체 프레임 처리 기록에 의존한다. 대표 화면만 있는 일반 영상에 같은 결론을 적용할 수 없다.",
    "공통 처리 범위의 끝은 31.1893125초이고 영상 길이는 31.208333초이다. 약 0.019초의 차이는 공통 처리 범위에 포함하지 않았다. 제공된 원본 연결 기록의 잔여 오디오 피크 0과 전체 프레임 검증을 근거로 추가 음성·중요한 소리의 미검토 구간으로 보지 않았다.",
    "자동 전사의 높은 인식 확률이나 오디오 상관값만으로 정확성을 확정하지 않았다. 독립 전사, 화자 출처, 소리 측정과 페이지 의미 안내, 실제 자막 표시를 함께 대조했으며 해결되지 않은 중요한 충돌은 확인되지 않았다."
  ]
}
```