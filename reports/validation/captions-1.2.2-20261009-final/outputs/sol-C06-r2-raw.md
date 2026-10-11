**판정: fail — 평가 범위의 M1은 WCAG 2.2 성공 기준 1.2.2(수준 A)를 충족하지 않습니다.** 제공된 독립 음성 처리 기록과 실제 표시 PNG를 비교하면, 화면의 일부 안내 문구는 대사에 대응하지만 사용자의 질문, 보안 확인 실패를 뜻하는 두 번의 경고음, 이전 코드의 사용 불가 조건이 동기화된 자막으로 제공되지 않습니다. 본문에 전체 설명이 있어도 매체가 본문의 대안임을 명확히 표시하지 않았으므로 예외는 성립하지 않습니다. 이번 실행은 제공된 기록과 첨부 PNG의 검토이며, 평가자가 직접 청취하거나 영상을 연속 재생한 것은 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C06 — 제공된 Chromium 페이지 상태의 본문과 교육 영상 M1만 평가; 푸터 탐색 제외",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "범위 내 유일한 녹화 동기화 매체 M1에서 중요한 대사와 경고음의 자막 누락을 확인했다. 본문 대안임을 명확히 표시하는 안내도 없어 예외가 성립하지 않는다."
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
      "SOURCE-ASR는 대상 원본 해시와 연결된 전체 디코딩 음성의 독립 자동 전사이다. 후보 자막을 입력으로 사용하지 않았으나 인식 오류 가능성과 근사 단어 시각이 있다.",
      "SOURCE-AUDIO는 실제 디코딩 음성과 독립 원본 녹음의 상관 분석으로 화자 역할과 녹음 구간을 연결한다. 일반적인 화자 분리 성능의 증거는 아니다.",
      "SOURCE-SOUND는 두 음의 시각을 검출했다. 보안 확인 실패라는 의미는 검출기가 아니라 PAGE-C06의 실제 안내에서 확인했다.",
      "첨부 PNG 세 장에서 일곱 화면 상태와 표시 문구를 직접 검토했다. 제공된 SOURCE-VISUAL 및 ENCODE-LINK의 전체 프레임 디코딩·정적 화면 구성 검증 기록을 함께 사용했다.",
      "SOURCE-VISUAL의 일반적인 '각 자막 큐 검토' 문구는 DELIVERY-C06의 빈 트랙·활성 큐 기록과 맞지 않는다. 이를 자막 후보의 실제 제공이나 충분성의 증거로 사용하지 않았다.",
      "브라우저 재생·탐색 결과는 제공된 DELIVERY-C06 기록을 읽은 것이며 평가자가 해당 조작을 실행한 것은 아니다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 이해에 필요한 경고음이 포함된 사전 녹화 동기화 영상",
      "classification_evidence_ids": [
        "MEDIA-C06",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "폐쇄 자막이 관찰되지 않았고, 실제 영상의 안내 문구도 질문·중요한 경고음·이전 코드 사용 불가 조건을 전달하지 않는다. 일부 화면 문구의 의미 대응만으로 전체 자막 요구를 충족하지 못한다.",
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
            "end_seconds": 31.18,
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
            "reason": "전체 음성 처리 구간과 검증된 일곱 정적 화면 구간의 교집합이다. 모든 화면 상태의 PNG와 빈 트랙 기록을 비교했으며, 표본만으로 임의 영상의 전체 표시 상태를 추정한 것은 아니다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.18,
            "end_seconds": 31.208333,
            "reason": "제공된 정적 화면 구간은 31.18초까지이며 음성 처리 종료 시각도 영상 길이와 다르다. 마지막 꼬리 구간의 원본·표시 대응을 별도로 확정하지 않았다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 0.94,
          "original_end_seconds": 3.04,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "첫 화면 안내 문구: '설정에서 보안을 선택하세요.'; 별도 자막 큐 없음",
          "caption_start_seconds": 0,
          "caption_end_seconds": 3.75,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "ENCODE-LINK",
            "DISPLAY-C06-1"
          ],
          "user_impact": "설정에서 보안을 선택하라는 지시의 의미는 화면 문구로 전달된다."
        },
        {
          "original_start_seconds": 3.8,
          "original_end_seconds": 6.56,
          "original_content": "사용자: 이전 코드를 지금 버려도 되나요?",
          "caption_location": "두 번째 화면에는 '이전 코드에 관한 질문', '질문과 답변을 듣고 다음 단계로 이동하세요.'만 표시; 대응 큐 없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-1"
          ],
          "user_impact": "음성을 듣지 못하면 질문의 구체적인 내용과 사용자 발화를 알 수 없다."
        },
        {
          "original_start_seconds": 7.71,
          "original_end_seconds": 11.18,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "세 번째 화면: '코드를 버리기 전에', '새 코드의 저장 상태를 먼저 확인하세요.'; 질문에 답하는 안내자 식별과 응답 자막 없음",
          "caption_start_seconds": 7.35,
          "caption_end_seconds": 11.95,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C06",
            "DISPLAY-C06-1"
          ],
          "user_impact": "저장 상태를 먼저 확인하라는 취지는 일부 전달되지만, 화면 밖 화자 변경과 앞선 질문에 대한 부정 응답이 전달되지 않는다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "12.2–12.4초 및 12.62–12.82초의 두 번의 경고음: 보안 확인 실패",
          "caption_location": "네 번째 화면: '보안 확인 결과', '결과를 확인하고 다음 단계로 이동하세요.'; 경고음·실패 의미 표시 없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C06",
            "DELIVERY-C06",
            "DISPLAY-C06-1",
            "DISPLAY-C06-2"
          ],
          "user_impact": "음성을 듣지 못하면 보안 확인이 실패했음을 해당 시점에 알 수 없다."
        },
        {
          "original_start_seconds": 16.47,
          "original_end_seconds": 19,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "다섯 번째 화면: '보안 확인 다시 하기', '보안 확인을 완료하고 발급을 확인하세요.'; 별도 자막 큐 없음",
          "caption_start_seconds": 16.17,
          "caption_end_seconds": 19.81,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "ENCODE-LINK",
            "DISPLAY-C06-2"
          ],
          "user_impact": "보안 확인을 다시 완료한 다음 발급을 확인하는 순서는 화면 문구로 전달된다."
        },
        {
          "original_start_seconds": 20,
          "original_end_seconds": 22.14,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다.",
          "caption_location": "여섯 번째 화면: '새 코드 저장', '코드를 안전한 곳에 보관하세요.'; 별도 자막 큐 없음",
          "caption_start_seconds": 19.81,
          "caption_end_seconds": 27.05,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "ENCODE-LINK",
            "DISPLAY-C06-2"
          ],
          "user_impact": "새 코드를 안전하게 보관하라는 의미는 화면 문구로 전달된다."
        },
        {
          "original_start_seconds": 22.76,
          "original_end_seconds": 26.02,
          "original_content": "안내자: 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "여섯 번째 화면은 새 코드 보관 안내만 유지; 이전 코드 사용 불가 조건의 대응 큐·문구 없음",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-ASR",
            "PAGE-C06",
            "ENCODE-LINK",
            "DELIVERY-C06",
            "DISPLAY-C06-2"
          ],
          "user_impact": "새로 발급하면 이전 코드가 무효화된다는 중요한 조건을 영상 이용 중 알 수 없다."
        },
        {
          "original_start_seconds": 27.45,
          "original_end_seconds": 29.08,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "일곱 번째 화면: '발급 완료', '발급 완료 화면을 확인하세요.'; 별도 자막 큐 없음",
          "caption_start_seconds": 27.05,
          "caption_end_seconds": 31.18,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "ENCODE-LINK",
            "DISPLAY-C06-3"
          ],
          "user_impact": "발급 완료 화면을 확인하라는 지시는 화면 문구로 전달된다."
        }
      ],
      "missing_evidence": [
        "31.18–31.208333초의 원본과 실제 표시 상태를 함께 확인할 수 있는 기록"
      ],
      "recommendations": [
        {
          "change": "M1의 3.8–6.56초 질문과 7.71–11.18초 응답을 동기화 자막으로 제공하고, 화면 밖 사용자·안내자의 변경을 식별한다. 저장 전 폐기 금지 의미를 유지한다.",
          "retest": "실제 플레이어에서 해당 구간의 질문·응답과 화자 식별이 표시되는지 확인하고 원본 음성과 의미·순서를 대조한다."
        },
        {
          "change": "M1의 12.2–12.82초 두 경고음에 '[보안 확인 실패 경고음 두 번]'처럼 소리와 의미를 전달하는 자막을 제공한다.",
          "retest": "두 경고음 발생 시점에 실패 의미를 읽을 수 있는지 확인한다. 큐 시각뿐 아니라 표시 지속 시간과 화면 가림도 검토한다."
        },
        {
          "change": "M1의 22.76–26.02초에 새 발급 시 이전 코드를 사용할 수 없다는 조건을 자막으로 추가한다.",
          "retest": "실제 표시 자막이 발급 조건과 사용 불가라는 부정을 정확히 전달하는지 원본과 대조한다."
        },
        {
          "change": "누락을 보완한 폐쇄 또는 개방 자막을 영상 전체에 제공한다. 본문의 정적 전체 설명을 동기화 자막의 대체물로 취급하지 않는다.",
          "retest": "폐쇄 자막이면 실제 로드·선택·활성 큐·표시를, 개방 자막이면 실제 영상 표시를 확인한다. 전체 구간의 의미·시간·읽기·가림과 마지막 꼬리 구간을 재점검한다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "제공된 자료와 첨부 PNG만 검토했으며 URL 방문, 직접 청취, 연속 영상 재생 또는 사이트 변경은 하지 않았다.",
    "본문에는 관찰된 대사·경고음·화면 안내가 포함되어 있지만, '전체 설명'이라는 제목만으로 매체가 본문의 대안임을 명확히 표시했다고 인정하지 않았다.",
    "전체 표시 범위의 추론은 원본과 연결된 일곱 정적 화면의 통제된 구성 검증에 한정된다. 일반 영상에서 대표 PNG만으로 전체 자막의 충분성을 판단할 수는 없다.",
    "마지막 미확인 구간과 일반적인 큐 검토 문구의 불일치는 보존했다. 이미 확인한 중요한 정보 누락에 따른 fail 판정에는 영향을 주지 않는다.",
    "이 결과는 지정된 범위의 성공 기준 1.2.2만 평가하며 사이트 전체 적합성이나 다른 성공 기준의 판정이 아니다."
  ]
}
```