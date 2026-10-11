# C02 평가 원문 출력

판정: **fail**. M1의 7.6–11.6초 원본 대사는 독립 전사(SOURCE-ASR)와 원본 녹음 상관(SOURCE-AUDIO VOICE-A2) 기준으로 "아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요."인데, 실제 표시된 큐 A2(DELIVERY-C02, DISPLAY-C02-1의 9.4초 화면)는 "네. 새 복구 코드를 저장하기 전에 버리세요."로 부정 응답과 금지 경고를 반대로 바꿨습니다. 자막에 의존하는 이용자는 복구 코드를 잃게 되는 지시를 받으므로 의미상 부정확(inaccurate)이며, 나머지 대사 5개와 경고음 자막은 동등합니다. PNG에 로딩 표시로 보이는 원호가 있으나 자막 판독에는 영향이 없고, 평가자는 원본을 직접 듣거나 연속 재생하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C02 — 본문과 교육용 동영상 M1 1개(페이지 하단 내비게이션 제외). Chromium에서 track mode=showing, readyState=2 상태 기록.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1의 7.6–11.6초 원본 대사 '아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.'가 자막 큐 A2에서 '네. 새 복구 코드를 저장하기 전에 버리세요.'로 표시되어 부정과 경고의 의미가 반대로 바뀌었습니다. 확인된 위반 1건으로 범위 fail입니다."
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
      "SOURCE-ASR: faster-whisper large-v3 독립 전사(0–31.189초). 7.71–8.14초 '아니요.'(p≈0.996), 10.28–11.18초 '버리지 마세요.'(p≈0.9999)로 높은 확률. 자동 전사이므로 정답 보증은 아닙니다.",
      "SOURCE-AUDIO: VOICE-A2(7.6–11.6초) 원본 녹음과 상관 0.9989. 텍스트는 사용하지 않은 출처 대응이며, 전사 내용과 독립된 구간·화자 근거입니다.",
      "SOURCE-SOUND: 12.2–12.4초, 12.62–12.82초 펄스 2회. 의미는 PAGE-C02 안내문 기준입니다.",
      "DISPLAY-C02-1~3: 9개 시점 PNG를 Read로 검토. 9.4초 화면에서 A2 '안내자: 네. 새 복구 코드를 저장하기 전에 버리세요.'가 실제 표시됨을 확인했습니다.",
      "DISPLAY-C02 PNG에는 C01과 같은 원본 해시임에도 화면 중앙에 원호 모양 표시(로딩 표시로 보임)가 있고 하단 탐색 막대 손잡이가 보이지 않습니다. 버퍼링 상태 캡처일 가능성이 있으나 자막 텍스트 판독에는 영향이 없습니다(추정)."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성), 화면 밖 두 화자 대화와 정보성 이중 경고음 포함, 음소거 원본 아님",
      "classification_evidence_ids": [
        "MEDIA-C02",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C02"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "A2 큐가 원본의 부정 응답과 금지 경고를 긍정·권유로 뒤집었습니다. 나머지 6개 정보 단위는 동등합니다.",
      "exception": {
        "claimed": false,
        "no_extra_information": null,
        "clearly_labeled": null,
        "verified": false,
        "evidence_ids": []
      },
      "caption_delivery": {
        "kind": "closed",
        "actually_observed": true,
        "evidence_ids": [
          "DELIVERY-C02",
          "DISPLAY-C02-1",
          "DISPLAY-C02-2",
          "DISPLAY-C02-3"
        ]
      },
      "coverage": {
        "complete": true,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.189,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "DELIVERY-C02"
            ],
            "reason": "원본 음성 전체 디코드와 영상 전체 프레임 디코드, 자막 큐 전체 목록의 교집합. 각 큐는 활성 상태 PNG로 표시 확인."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.189,
            "end_seconds": 31.208,
            "reason": "디코드된 음성 길이 이후 약 0.02초 꼬리. 음성 처리 범위 밖입니다."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1.0,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "A1, line 76",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "지시를 같은 시점에 알 수 있습니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "사용자(화면 밖 화자 변경): 이전 코드를 지금 버려도 되나요?",
          "caption_location": "B1, line 76",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "화자 변경과 질문을 알 수 있습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.(부정 응답·조건부 금지 경고)",
          "caption_location": "A2, line 76 — '안내자: 네. 새 복구 코드를 저장하기 전에 버리세요.'",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "inaccurate",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-1"
          ],
          "user_impact": "자막에 의존하는 이용자는 새 코드를 저장하기 전에 이전 코드를 버리라는 반대 지시를 받아 계정 복구 수단을 모두 잃을 수 있습니다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 2회",
          "caption_location": "SFX, line 76",
          "caption_start_seconds": 12.2,
          "caption_end_seconds": 15.82,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C02",
            "DELIVERY-C02",
            "DISPLAY-C02-1",
            "DISPLAY-C02-2"
          ],
          "user_impact": "실패 알림과 횟수를 소리 시작 시점부터 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "A3, line 76",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2"
          ],
          "user_impact": "순서 조건이 보존됩니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "A4, line 76",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-2"
          ],
          "user_impact": "무효화 경고를 약 6.6초간 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "A5, line 76",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C02",
            "DISPLAY-C02-3"
          ],
          "user_impact": "완료 단계를 알 수 있습니다."
        }
      ],
      "missing_evidence": [
        "평가자의 직접 청취·연속 재생 관찰 없음.",
        "PNG의 로딩 표시처럼 보이는 요소가 재생 중 실제 화면 상태인지 캡처 시점의 버퍼링인지 확인할 기록이 없습니다(판정에는 영향 없음)."
      ],
      "recommendations": [
        {
          "change": "A2 큐 텍스트를 원본대로 '안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.'로 수정합니다.",
          "retest": "수정한 자막을 실제 플레이어에서 7.6–11.6초 구간 재생하며 표시 문구의 부정·조건을 원본 음성과 대조하고, 나머지 큐도 다시 확인합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·프레임 디코드 기록·PNG만 검토했습니다.",
    "A2 부정확 판정은 독립 전사(SOURCE-ASR) 텍스트에 근거하며, SOURCE-AUDIO는 구간과 화자만 확인합니다. 전사 확률이 높아 충돌은 없습니다.",
    "전체 범위 주장은 통제된 7개 정적 화면 픽스처 기록(ENCODE-LINK)에 의존합니다."
  ]
}
```
