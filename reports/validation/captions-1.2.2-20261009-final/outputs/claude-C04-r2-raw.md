# C04 평가 원문 출력

판정: **fail**. 원본 녹음 상관(SOURCE-AUDIO)은 4.0–7.0초 발화가 화면 밖 사용자, 나머지가 안내자임을 보여주지만, 실제 큐(DELIVERY-C04)와 표시 PNG(DISPLAY-C04-1~3)의 자막에는 화자 표기가 전혀 없고 화면에도 화자가 보이지 않습니다. 따라서 4.0초 사용자로의 화자 변경과 7.6초 안내자 답변으로의 복귀가 자막만으로 전달되지 않아 질문과 답변의 주체를 구분할 수 없습니다(문구·경고음 자막 자체는 동등). 본문의 정적 설명은 발화별 화자를 동기화해 알려주지 않으며, 평가자는 원본을 직접 듣거나 연속 재생하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C04 — 본문과 교육용 동영상 M1 1개(페이지 하단 내비게이션 제외). Chromium에서 track mode=showing, readyState=2 상태 기록.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "fail",
    "reason": "M1은 화면 밖 두 화자(안내자·사용자)의 대화인데 모든 큐에 화자 표기가 없어, 4.0초 사용자로의 화자 변경과 7.6초 안내자로의 복귀가 자막에서 전달되지 않습니다. 화면에는 화자가 보이지 않고 화면 문구도 화자를 식별하지 않으므로 질문과 답변의 주체를 구분할 수 없습니다."
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
      "SOURCE-ASR: faster-whisper large-v3 독립 전사(0–31.189초). 정답 보증은 아닙니다.",
      "SOURCE-AUDIO: 원본 녹음 6개 상관으로 VOICE-B1(4.0–7.0초)=사용자, 나머지=안내자 역할 확인. 통제된 출처 대응이며 일반 화자 분리 성능이 아닙니다.",
      "SOURCE-SOUND: 12.2–12.82초 경고음 2회. 의미는 PAGE-C04 기준.",
      "DISPLAY-C04-1~3: 9개 시점 PNG를 Read로 검토. 모든 대사 자막이 화자 접두어 없이 표시되고, 화면 안에 사람이나 화자 표시가 없음을 확인했습니다. 로딩 표시처럼 보이는 원호가 있으나 자막 판독에는 영향이 없습니다(추정)."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성), 화면 밖 두 화자 대화와 정보성 이중 경고음 포함, 음소거 원본 아님",
      "classification_evidence_ids": [
        "MEDIA-C04",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "PAGE-C04"
      ],
      "execution": "run",
      "decision": "fail",
      "reason": "대사 문구와 경고음은 동등하나 화면 밖 화자 변경 정보가 자막에서 누락되었습니다.",
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
          "DELIVERY-C04",
          "DISPLAY-C04-1",
          "DISPLAY-C04-2",
          "DISPLAY-C04-3"
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
              "DELIVERY-C04"
            ],
            "reason": "원본 음성 전체 디코드와 영상 전체 프레임 디코드, 자막 큐 전체 목록의 교집합. 각 큐는 활성 상태 PNG로 표시 확인."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 31.189,
            "end_seconds": 31.208,
            "reason": "디코드된 음성 길이 이후 약 0.02초 꼬리."
          }
        ]
      },
      "comparisons": [
        {
          "original_start_seconds": 1.0,
          "original_end_seconds": 3.4,
          "original_content": "안내자: 설정에서 보안을 선택합니다.",
          "caption_location": "A1, line 76(화자 표기 없음)",
          "caption_start_seconds": 1,
          "caption_end_seconds": 3.4,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "첫 발화이며 지시 내용은 전달됩니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "화면 밖 화자 변경(안내자→사용자) 및 사용자 질문 '이전 코드를 지금 버려도 되나요?'",
          "caption_location": "B1, line 76 — '이전 코드를 지금 버려도 되나요?'(화자 표기 없음)",
          "caption_start_seconds": 4,
          "caption_end_seconds": 7,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "SOURCE-ASR",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "문구는 같지만 다른 사람이 질문한다는 사실이 빠져, 안내자가 스스로 묻고 답하는 설명으로 읽힐 수 있습니다. 화면 2/7에도 화자가 보이지 않습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "화면 밖 화자 변경(사용자→안내자) 및 안내자 답변 '아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.'",
          "caption_location": "A2, line 76(화자 표기 없음)",
          "caption_start_seconds": 7.6,
          "caption_end_seconds": 11.6,
          "relation": "missing",
          "evidence_ids": [
            "SOURCE-AUDIO",
            "SOURCE-ASR",
            "DELIVERY-C04",
            "DISPLAY-C04-1"
          ],
          "user_impact": "부정·조건 경고 문구는 보존되지만 권위 있는 안내자의 답변이라는 화자 정보가 빠집니다."
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
            "PAGE-C04",
            "DELIVERY-C04",
            "DISPLAY-C04-1",
            "DISPLAY-C04-2"
          ],
          "user_impact": "실패 알림을 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "A3, line 76(화자 표기 없음)",
          "caption_start_seconds": 16.42,
          "caption_end_seconds": 19.46,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-2"
          ],
          "user_impact": "내용은 전달됩니다. 앞선 화자 혼동이 남을 수 있습니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "A4, line 76(화자 표기 없음)",
          "caption_start_seconds": 20.06,
          "caption_end_seconds": 26.7,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-2"
          ],
          "user_impact": "무효화 경고를 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "A5, line 76(화자 표기 없음)",
          "caption_start_seconds": 27.3,
          "caption_end_seconds": 29.58,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DELIVERY-C04",
            "DISPLAY-C04-3"
          ],
          "user_impact": "완료 단계를 알 수 있습니다."
        }
      ],
      "missing_evidence": [
        "평가자의 직접 청취·연속 재생 관찰 없음.",
        "화자 역할은 통제된 녹음 메타데이터(SOURCE-AUDIO)에 의존합니다."
      ],
      "recommendations": [
        {
          "change": "화자가 바뀌는 큐에 화자 표기를 추가합니다. 최소한 B1에 '사용자:', A2에 '안내자:'를 붙이고, 일관성을 위해 다른 안내자 큐에도 표기합니다.",
          "retest": "실제 플레이어에서 4–12초 구간을 재생해 화자 표기가 표시되는지, 질문과 답변의 주체가 자막만으로 구분되는지 확인합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·프레임 디코드 기록·PNG만 검토했습니다.",
    "본문(PAGE-C04)에 '화면 밖의 안내자와 사용자가 대화합니다'라는 정적 설명이 있으나 어느 발화가 누구의 것인지는 동기화되어 전달되지 않으므로 화자 식별을 대신하지 않는다고 판단했습니다. 이 판단은 질문·답변 문맥으로 추론 가능하다는 반론의 여지가 있습니다.",
    "전체 범위 주장은 통제된 7개 정적 화면 픽스처 기록(ENCODE-LINK)에 의존합니다."
  ]
}
```
