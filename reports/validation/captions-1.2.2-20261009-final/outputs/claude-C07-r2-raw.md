# C07 평가 원문 출력

판정: **pass**. HTML track은 없지만(DELIVERY-C07) M1은 개방 자막 렌더본이며, ENCODE-LINK 기록상 원본 음성과 전체 상관 0.9996으로 연결됩니다. 9개 시점 표시 PNG(DISPLAY-C07-1~3)에서 대사 6개가 화자 표기와 함께, 경고음이 '[보안 확인 실패를 알리는 경고음 두 번]'으로 각 원본 구간 안에 같은 의미로 표시되고, 자막 띠는 안내 화면의 제목·본문·버튼을 가리지 않습니다. 개방 자막의 정확한 등장·소멸 프레임은 입력에 없어 표본 시점으로 동기화를 판단했으며, 평가자는 원본을 직접 듣거나 연속 재생하지 않았습니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C07 — 본문과 교육용 동영상 M1(open.mp4) 1개(페이지 하단 내비게이션 제외). HTML track 0개, 영상 안에 개방 자막이 렌더링된 상태.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "pass",
    "reason": "track이 없지만 영상에 개방 자막이 포함되어 있고, 9개 시점 표시 PNG에서 대사 6개(화자 표기 포함)와 경고음 설명이 각 원본 구간 안에 원문과 같은 의미로 표시됩니다. 자막 띠는 안내 화면의 제목·본문·버튼을 가리지 않습니다. 개방 자막의 정확한 시작·종료 프레임은 기록에 없어 표본 시점 기준으로 동기화를 판단했습니다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C07",
      "PAGE-C07",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C07",
      "DISPLAY-C07-1",
      "DISPLAY-C07-2",
      "DISPLAY-C07-3"
    ],
    "derived_processing_and_limits": [
      "SOURCE-ASR/SOURCE-AUDIO는 원본 MP4(60e0e354…)에서 얻은 기록이고, 평가 대상 M1(a8f6d95c…)은 ENCODE-LINK에서 전체 PCM 상관 0.9996, 같은 길이(31.189초), unmatched_tail_peak 0으로 원본과 연결됩니다. 평가자는 이 연결 기록을 검토했을 뿐 직접 대조하지 않았습니다.",
      "SOURCE-SOUND: 12.2–12.82초 경고음 2회. 의미는 PAGE-C07 기준.",
      "DELIVERY-C07: tracks=[], active_cues 전부 빈 배열(개방 자막이므로 예상되는 상태).",
      "DISPLAY-C07-1~3: 2, 5, 9.4, 12.5, 15, 17.8, 22, 25, 28.3초 PNG를 Read로 검토해 영상 안 자막 문구를 직접 판독했습니다. 개방 자막 큐별 시작·종료 시각은 입력에 없으므로 caption_start/end는 null로 둡니다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "사전 녹화 동기화 매체(영상+음성), 화면 밖 두 화자 대화와 정보성 이중 경고음 포함, 개방 자막 렌더본, 음소거 원본 아님",
      "classification_evidence_ids": [
        "MEDIA-C07",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "ENCODE-LINK",
        "PAGE-C07"
      ],
      "execution": "run",
      "decision": "pass",
      "reason": "개방 자막이 모든 대사·화자 변경·경고음을 같은 의미로 해당 구간에 표시하고 중요한 화면 정보를 가리지 않습니다.",
      "exception": {
        "claimed": false,
        "no_extra_information": null,
        "clearly_labeled": null,
        "verified": false,
        "evidence_ids": []
      },
      "caption_delivery": {
        "kind": "open",
        "actually_observed": true,
        "evidence_ids": [
          "DISPLAY-C07-1",
          "DISPLAY-C07-2",
          "DISPLAY-C07-3",
          "ENCODE-LINK"
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
              "DISPLAY-C07-1",
              "DISPLAY-C07-2",
              "DISPLAY-C07-3"
            ],
            "reason": "원본 음성 전체 디코드, 렌더본 전체 프레임 디코드(749)와 큐별 고정 레이아웃 기록, 각 큐 활성 시점 PNG의 교집합."
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
          "caption_location": "개방 자막(영상 하단 검은 띠), 2초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1"
          ],
          "user_impact": "발화 중 화자와 지시를 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 4.0,
          "original_end_seconds": 7.0,
          "original_content": "사용자(화면 밖 화자 변경): 이전 코드를 지금 버려도 되나요?",
          "caption_location": "개방 자막, 5초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1"
          ],
          "user_impact": "'사용자:' 표기로 화자 변경을 알 수 있습니다."
        },
        {
          "original_start_seconds": 7.6,
          "original_end_seconds": 11.6,
          "original_content": "안내자: 아니요. 새 복구 코드를 저장하기 전에는 버리지 마세요.",
          "caption_location": "개방 자막, 9.4초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-1"
          ],
          "user_impact": "부정·조건 경고가 보존됩니다."
        },
        {
          "original_start_seconds": 12.2,
          "original_end_seconds": 12.82,
          "original_content": "보안 확인 실패를 알리는 경고음 2회",
          "caption_location": "개방 자막, 12.5초·15초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-SOUND",
            "PAGE-C07",
            "DISPLAY-C07-1",
            "DISPLAY-C07-2"
          ],
          "user_impact": "경고음 중(12.5초)과 이후(15초)에 실패 알림을 읽을 수 있습니다."
        },
        {
          "original_start_seconds": 16.42,
          "original_end_seconds": 19.46,
          "original_content": "안내자: 보안 확인을 다시 끝낸 뒤 발급을 확인합니다.",
          "caption_location": "개방 자막, 17.8초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-2"
          ],
          "user_impact": "순서 조건이 보존됩니다."
        },
        {
          "original_start_seconds": 20.06,
          "original_end_seconds": 26.7,
          "original_content": "안내자: 새 코드를 안전한 곳에 저장합니다. 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다.",
          "caption_location": "개방 자막 2줄, 22초·25초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-2"
          ],
          "user_impact": "2줄 띠가 '저장 완료' 버튼 아래까지 올라오지만 버튼·문구를 가리지 않고, 22초와 25초 모두 표시되어 읽을 시간이 있습니다."
        },
        {
          "original_start_seconds": 27.3,
          "original_end_seconds": 29.58,
          "original_content": "안내자: 발급 완료 화면을 확인합니다.",
          "caption_location": "개방 자막, 28.3초 화면",
          "caption_start_seconds": null,
          "caption_end_seconds": null,
          "relation": "equivalent",
          "evidence_ids": [
            "SOURCE-ASR",
            "SOURCE-AUDIO",
            "DISPLAY-C07-3"
          ],
          "user_impact": "완료 단계를 알 수 있습니다."
        }
      ],
      "missing_evidence": [
        "개방 자막 큐별 정확한 시작·종료 시각(프레임 단위) 기록. 현재는 표본 9개 시점의 표시만 직접 확인했습니다.",
        "평가자의 직접 청취·연속 재생 관찰 없음."
      ],
      "recommendations": [
        {
          "change": "변경 불필요. 개방 자막 띠가 영상 내 진행 막대를 덮지만 상단 'n / 7' 표시로 진행 정보가 남아 있어 영향은 확인되지 않았습니다.",
          "retest": "영상을 다시 렌더링할 경우 프레임 단위로 각 자막의 등장·소멸 시각을 추출해 원본 발화·경고음 구간과 대조합니다."
        }
      ]
    }
  ],
  "errors": [],
  "limits": [
    "평가 모델은 원본을 직접 듣거나 연속 재생하지 않았고, 독립 전사·오디오 상관·프레임 디코드 기록·PNG만 검토했습니다.",
    "개방 자막의 시간 대응은 각 정보 단위 구간 안의 표본 PNG와 '큐 내 레이아웃 고정' 기록에 근거하며, 등장·소멸 시각의 정밀한 지연은 확인하지 못했습니다.",
    "평가 대상 렌더본과 전사 원본의 동일성은 ENCODE-LINK 오디오 상관 기록에 의존합니다."
  ]
}
```
