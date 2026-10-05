{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K34/index.html",
    "states": [
      "기사 초기 상태의 미디어 및 제공된 기존 텍스트",
      "첨부된 다섯 정적 화면과 동일 프레임 그룹 기록으로 확인한 원본 전체 구간: 0–19.916667초"
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "전체 사이트 및 다른 페이지·상태의 적합성",
      "플레이어 키보드 접근성, 자막 및 다른 WCAG 성공 기준",
      "외부 계정·실제 계정 조작",
      "직접 영상 재생, 직접 청취 및 스크린 리더 사용",
      "모델 정확도 또는 성능 인증"
    ],
    "execution": "complete",
    "decision": "not_applicable",
    "reason": "지정 범위의 유일한 대상 M-V는 사전 제작 영상 전용 콘텐츠이다. 전체 원본을 대표하는 다섯 첨부 화면과 동일 프레임 그룹 기록을 기존 텍스트 EXC-V와 대조한 결과, 이용 목적에 필요한 사전 조건·단계·경고·결과 및 순서에 추가 정보가 없었다. 또한 영상이 위의 완전한 서면 단계에 대한 매체 대안임을 명시하는 문구가 확인되어 예외의 두 조건이 모두 검증되었다. 따라서 이 범위에는 예외를 제외한 적용 대상이 없다. 이는 전체 사이트의 적합성 판정이 아니다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K34",
      "kind": "파생: 페이지·목록 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "제공된 기록에 따르면 Chromium으로 실제 로컬 HTML과 제공된 대안 목적지를 수집했다. 이번 평가에서 URL을 직접 열지는 않았다.",
        "수집 시각은 2026-10-04T12:04:54.613330+00:00이다.",
        "목록 완전성은 기사 초기 상태의 미디어 콘텐츠와 제공된 대안 범위에 한정한다.",
        "별도 대안 링크 또는 대안 자료는 없다고 기록되어 있다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "파생: 원본 식별·길이·트랙 확인 기록",
      "processed_ranges": [],
      "limitations": [
        "원본은 local fixture assets/silent-guide.mp4이며 SHA-256은 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d이다.",
        "제공된 ffprobe 기록에서 길이 19.916667초, 영상 트랙만 존재하고 음성 트랙은 없음을 확인했다.",
        "평가 모델은 원본 MP4를 직접 처리하지 않았다. 내용 판단은 OBS-V와 실제 첨부 PNG에 근거한다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "파생: 전체 프레임 디코딩·동일 프레임 그룹 기록",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-1",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "FRAME-5"
          ],
          "reason": "ffmpeg 디코딩 및 framemd5 기록에서 12fps의 239개 프레임 전체가 다섯 동일 프레임 그룹에 속하며, 각 그룹의 실제 첨부 PNG 내용을 확인했다."
        }
      ],
      "limitations": [
        "source_sha256은 MEDIA-V의 원본 SHA-256과 일치한다.",
        "전체 구간 확인은 동일 프레임 그룹이 검증된 이 통제된 정적 화면 영상에만 적용한다. 임의 영상의 표본 이미지 평가로 일반화하지 않는다.",
        "화면에 표시된 버튼과 단계 전환은 설명용 영상 내용이며 실제 클릭이나 계정 작업을 관찰한 것은 아니다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "파생: 실제 첨부 PNG",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.9166666666666665,
          "evidence_ids": [
            "FRAME-1",
            "OBS-V"
          ],
          "reason": "첨부 이미지 내용을 확인했고, OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "출처: /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-1.png",
        "디코딩 프레임 해시: 4469897e02e9eba4fb9e8aa47d512e2d",
        "독립적으로 연속 재생한 것이 아니라 추출 이미지와 그룹 기록을 함께 사용했다."
      ]
    },
    {
      "evidence_id": "FRAME-2",
      "kind": "파생: 실제 첨부 PNG",
      "processed_ranges": [
        {
          "start_seconds": 3.9166666666666665,
          "end_seconds": 7.916666666666667,
          "evidence_ids": [
            "FRAME-2",
            "OBS-V"
          ],
          "reason": "첨부 이미지 내용을 확인했고, OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "출처: /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-2.png",
        "디코딩 프레임 해시: 3c7617fa1d66aab2c1363b5f757bdadb"
      ]
    },
    {
      "evidence_id": "FRAME-3",
      "kind": "파생: 실제 첨부 PNG",
      "processed_ranges": [
        {
          "start_seconds": 7.916666666666667,
          "end_seconds": 11.916666666666666,
          "evidence_ids": [
            "FRAME-3",
            "OBS-V"
          ],
          "reason": "첨부 이미지 내용을 확인했고, OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "출처: /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-3.png",
        "디코딩 프레임 해시: 3832866396798a5b8ed0daa49d9f6ae8"
      ]
    },
    {
      "evidence_id": "FRAME-4",
      "kind": "파생: 실제 첨부 PNG",
      "processed_ranges": [
        {
          "start_seconds": 11.916666666666666,
          "end_seconds": 15.916666666666666,
          "evidence_ids": [
            "FRAME-4",
            "OBS-V"
          ],
          "reason": "첨부 이미지 내용을 확인했고, OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "출처: /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-4.png",
        "디코딩 프레임 해시: 20dfe3cb91d6a0bfbb5af15634512f33"
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "파생: 실제 첨부 PNG",
      "processed_ranges": [
        {
          "start_seconds": 15.916666666666666,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "MEDIA-V"
          ],
          "reason": "첨부 이미지 내용을確認했고, 동일 프레임 그룹 기록으로 원본 끝까지 확인했다. 그룹 끝 19.916666666666668초와 원본 길이 19.916667초의 차이는 시간 표기 반올림이다."
        }
      ],
      "limitations": [
        "출처: /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-5.png",
        "디코딩 프레임 해시: fc7322ae5f966954a6774c4a0b7ba8b8"
      ]
    },
    {
      "evidence_id": "EXC-V",
      "kind": "기존 텍스트 및 매체 대안 관계 표시",
      "processed_ranges": [],
      "limitations": [
        "제공된 자료에 포함된 기존 텍스트의 다섯 단계 전체와 관계 표시 문구를 읽었다.",
        "원본 관찰 자료로 사용하지 않고, FRAME-1부터 FRAME-5까지의 독립된 원본 파생 관찰과 비교했다.",
        "별도로 제공된 전사문이나 음성 대안이 아니라 예외 검증 대상인 기존 텍스트이다."
      ]
    }
  ],
  "media": [
    {
      "media_id": "M-V",
      "classification": "prerecorded_video_only",
      "classification_evidence_ids": [
        "MEDIA-V",
        "OBS-V",
        "FRAME-1",
        "FRAME-2",
        "FRAME-3",
        "FRAME-4",
        "FRAME-5"
      ],
      "original_version": "assets/silent-guide.mp4; SHA-256 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d; 수집 시각 2026-10-04T12:04:54.613330+00:00",
      "duration": 19.916667,
      "execution": "complete",
      "decision": "not_applicable",
      "exception": {
        "claimed": true,
        "verified": true,
        "no_extra_information": true,
        "clearly_labeled": true,
        "evidence_ids": [
          "EXC-V",
          "OBS-V",
          "FRAME-1",
          "FRAME-2",
          "FRAME-3",
          "FRAME-4",
          "FRAME-5"
        ]
      },
      "coverage": {
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 3.9166666666666665,
            "evidence_ids": [
              "OBS-V",
              "FRAME-1"
            ],
            "reason": "검증된 첫 동일 프레임 그룹의 첨부 PNG에서 계정 설정, 로그인 사전 조건 및 보안 열기 단계를 확인했다."
          },
          {
            "start_seconds": 3.9166666666666665,
            "end_seconds": 7.916666666666667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-2"
            ],
            "reason": "검증된 두 번째 동일 프레임 그룹의 첨부 PNG에서 복구 코드의 목적과 생성 단계를 확인했다."
          },
          {
            "start_seconds": 7.916666666666667,
            "end_seconds": 11.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-3"
            ],
            "reason": "검증된 세 번째 동일 프레임 그룹의 첨부 PNG에서 이전 코드 무효화 경고와 새 코드 확인 단계를 확인했다."
          },
          {
            "start_seconds": 11.916666666666666,
            "end_seconds": 15.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-4"
            ],
            "reason": "검증된 네 번째 동일 프레임 그룹의 첨부 PNG에서 생성 상태, 안전한 보관, 실제 코드 미표시 및 저장 확인 단계를 확인했다."
          },
          {
            "start_seconds": 15.916666666666666,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5",
              "MEDIA-V"
            ],
            "reason": "검증된 마지막 동일 프레임 그룹의 첨부 PNG에서 완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 설정 복귀를 확인했다. 원본 끝과 그룹 끝의 미세한 표기 차이는 반올림이며 프레임 누락이 아니다."
          }
        ],
        "unreviewed_ranges": [],
        "complete": true
      },
      "alternatives": [],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "0–3.9166666666666665초; FRAME-1; 1/5",
          "original_information": "Account settings 화면에서 복구 코드 생성 전에 로그인해야 한다고 설명하며, Open Security 버튼을 표시한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 1",
          "alternative_information": "계정 설정에서 복구 코드 생성 전에 로그인해야 함을 설명하고 Open Security를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "OBS-V",
            "EXC-V"
          ],
          "observation": "화면 제목, 필수 로그인 조건, 버튼 이름과 첫 단계 위치가 기존 텍스트에 모두 있다.",
          "interpretation": "사전 조건과 첫 단계 행동에 관한 영상의 추가 정보가 없다. 실제 버튼 클릭은 관찰하지 않았다.",
          "user_impact": "텍스트 이용자도 코드 생성 전 로그인 필요성과 시작 경로를 알 수 있다."
        },
        {
          "unit_id": "U02",
          "original_location": "3.9166666666666665–7.916666666666667초; FRAME-2; 2/5",
          "original_information": "Security 화면에서 복구 코드가 계정 접근 복원을 돕는다고 설명하며 Create recovery code 버튼을 표시한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 2",
          "alternative_information": "보안 화면에서 복구 코드가 계정 접근을 복원함을 설명하고 Create recovery code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-2",
            "OBS-V",
            "EXC-V"
          ],
          "observation": "기능의 목적, 화면 및 생성 버튼 이름이 대응한다.",
          "interpretation": "문구 표현 차이는 이 가상 안내의 기능 설명이나 단계 판단을 바꾸지 않는다.",
          "user_impact": "복구 코드의 용도와 다음 단계에 관한 정보 차이가 없다."
        },
        {
          "unit_id": "U03",
          "original_location": "7.916666666666667–11.916666666666666초; FRAME-3; 3/5",
          "original_information": "Before you continue 화면에서 새 복구 코드를 만들면 이전 코드를 사용할 수 없게 된다고 경고하며 Confirm new code 버튼을 표시한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 3",
          "alternative_information": "계속하기 전 경고에서 새 코드가 이전 코드를 사용할 수 없게 만든다고 설명하고 Confirm new code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-3",
            "OBS-V",
            "EXC-V"
          ],
          "observation": "새 코드 생성과 이전 코드 무효화의 인과 관계, 부정 의미 및 확인 단계가 보존된다.",
          "interpretation": "사용자의 진행 여부 판단에 중요한 경고가 기존 텍스트에 완전하게 포함되어 있다.",
          "user_impact": "텍스트 이용자도 이전 코드의 효력 상실을 알고 새 코드 생성을 확인할 수 있다."
        },
        {
          "unit_id": "U04",
          "original_location": "11.916666666666666–15.916666666666666초; FRAME-4; 4/5",
          "original_information": "Recovery code created 화면에서 코드를 안전한 장소에 저장하도록 안내하고, 이 예시에는 실제 코드가 표시되지 않는다고 명시한다. I saved my code 버튼을 표시한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 4",
          "alternative_information": "코드 생성 상태에서 안전하게 저장하도록 안내하고 실제 코드가 없는 예시임을 설명하며 I saved my code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-4",
            "OBS-V",
            "EXC-V"
          ],
          "observation": "생성 상태, 보관 지침, 실제 코드 미표시 및 저장 확인 버튼이 모두 대응한다.",
          "interpretation": "원본의 가상 예시 성격과 보관 지침이 기존 텍스트에 보존된다. 실제 복구 코드를 수집하거나 추정하지 않았다.",
          "user_impact": "텍스트 이용자도 안전한 보관 필요성과 이 예시에서 실제 코드를 얻을 수 없다는 사실을 알 수 있다."
        },
        {
          "unit_id": "U05",
          "original_location": "15.916666666666666–19.916667초; FRAME-5; 5/5",
          "original_information": "Complete 화면에서 새 복구 코드가 준비되었고 이전 코드는 더 이상 사용할 수 없다고 설명하며 Return to settings 버튼을 표시한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 5",
          "alternative_information": "완료 상태에서 새 코드가 준비되었고 이전 코드를 더 이상 사용할 수 없다고 설명하며 Return to settings를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "EXC-V"
          ],
          "observation": "완료 결과, 이전 코드 사용 불가 및 설정 복귀 단계가 모두 대응한다.",
          "interpretation": "최종 상태와 결과에 관한 영상의 추가 정보가 없다.",
          "user_impact": "텍스트 이용자도 새 코드의 준비 상태와 이전 코드의 사용 불가를 동일하게 이해할 수 있다."
        },
        {
          "unit_id": "U06",
          "original_location": "0–19.916667초; FRAME-1부터 FRAME-5까지의 공통 문맥 및 순서",
          "original_information": "복구 코드 안내의 다섯 화면이 1/5부터 5/5까지 순서대로 나타난다. 공통 머리글은 로컬 가상 계정 도움말 예시임을 표시한다. 동일 프레임 그룹 기록상 각 상태 내부에 추가 동작이나 변화가 없다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 Step 1–Step 5 전체 및 Step 4의 예시 설명",
          "alternative_information": "다섯 단계를 동일 순서로 제시하고, 네 번째 단계에서 실제 코드가 표시되지 않는 예시임을 설명한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-V",
            "FRAME-1",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "FRAME-5",
            "EXC-V"
          ],
          "observation": "단계 번호와 화면 순서가 기존 텍스트의 단계 순서에 대응한다. 가상 예시라는 성격도 실제 코드 미표시 설명으로 전달된다.",
          "interpretation": "화면의 배치·강조 및 로컬 예시 표기는 이 이용 목적에 별도의 절차나 결과 정보를 더하지 않는다. 정적 상태의 유지 시간은 절차 수행 조건이 아니다.",
          "user_impact": "텍스트만으로도 단계의 순서, 가상 예시의 성격 및 완료까지의 흐름을 이해할 수 있다."
        },
        {
          "unit_id": "U07",
          "original_location": "PAGE-K34에 기록된 영상과 기존 텍스트의 관계 표시",
          "original_information": "영상이 기존 텍스트의 대안이라는 표시가 있는지 확인할 필요가 있다.",
          "alternative_id": "EXC-V",
          "alternative_location": "영상에 대한 관계 표시 문구",
          "alternative_information": "문구는 다음 무음 안내가 위의 완전한 서면 단계에 대한 매체 대안이라고 명시한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "PAGE-K34",
            "EXC-V"
          ],
          "observation": "기록된 문구는 'The following silent guide is a media alternative to the complete written steps above.'이며 clearly_labeled_observed가 true이다.",
          "interpretation": "기존 텍스트와 영상의 대안 관계가 명확히 표시되어 예외의 표시 조건을 충족한다.",
          "user_impact": "이용자는 영상이 별도의 추가 지침이 아니라 위 서면 단계의 다른 표현임을 알 수 있다."
        }
      ],
      "reason": "사전 제작 영상 전용 분류는 원본 트랙 확인 기록과 다섯 정적 상태의 디코딩 기록에 근거한다. 기존 텍스트를 독립된 원본 관찰 자료로 사용하지 않고, 실제 첨부 PNG와 전체 동일 프레임 그룹 기록으로 확인한 원본에 대조했다. 필요한 정보 전체가 기존 텍스트에 있으며 영상의 추가 정보가 없고, 매체 대안 관계도 명확하게 표시되어 검증된 예외로 not_applicable이다. 별도 대안은 없지만, 이 예외가 검증되었으므로 대안 부재를 실패로 판정하지 않는다. comparisons의 EXC-V는 예외 검증용 기존 텍스트를 가리키며 별도 대안 제공을 뜻하지 않는다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "현재 확인된 범위에서 필수 수정은 없다. 기존 텍스트의 다섯 단계와 영상의 대안 관계 표시를 유지한다. 영상에 새 조건·경고·동작·결과를 추가하면 기존 텍스트에도 동등한 정보를 반영하거나 충분한 텍스트 또는 음성 대안을 제공한다.",
          "owner_role": "콘텐츠 담당 및 페이지 개발 담당",
          "retest": "동일 페이지 초기 상태에서 기존 텍스트 전체와 관계 표시를 다시 확인하고, 최종 원본의 판본·트랙·길이를 확인한 뒤 0초부터 끝까지 대조한다. 현재 판본에서는 0–19.916667초의 다섯 상태 전체가 재점검 대상이다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "criterion": "기타 WCAG 성공 기준",
      "status": "not_evaluated",
      "reason": "플레이어 키보드 접근성과 기타 기준은 지정 범위에서 제외되었다. 이번 결과로 해당 기준의 충족 여부를 판단하지 않는다."
    }
  ],
  "next_checks": [
    "페이지 상태, 기존 텍스트, 관계 표시 또는 원본 판본이 변경되면 목록과 예외의 두 조건을 다시 확인한다.",
    "다른 영상에 음성과 영상이 함께 있거나 실제 라이브 콘텐츠가 포함되면 이 대상과 구분하여 해당 미디어 성공 기준을 별도로 평가한다."
  ]
}