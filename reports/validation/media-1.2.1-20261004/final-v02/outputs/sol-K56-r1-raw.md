{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K56/index.html",
    "states": [
      "기사 초기 상태: 제공된 매체와 기존 텍스트 및 대안 제공 기록",
      "M-V의 다섯 정적 화면과 순서: 0~19.916667초"
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "다른 페이지와 기사 초기 상태 밖의 콘텐츠",
      "플레이어 키보드 조작, 자막 및 다른 WCAG 성공 기준",
      "외부 계정 및 실제 계정 조작",
      "원본 영상의 직접 재생·청취와 스크린 리더 사용",
      "전체 사이트 적합성 및 모델 정확도 인증"
    ],
    "execution": "complete",
    "decision": "fail",
    "reason": "지정 범위의 대상은 사전 제작 영상 전용 콘텐츠 M-V 하나이다. 전체 디코딩 프레임이 다섯 동일 프레임 그룹에 속한다는 기록과 실제 첨부 PNG를 함께 확인하여 필요한 원본 정보를 검토했다. 기존 텍스트의 대안이라는 표시는 명확하지만, 영상에 로그인 조건, 보안 메뉴 이동, 기존 코드 무효화 경고, 확인 단계 및 완료 상태 등 추가 정보가 있어 예외가 성립하지 않는다. 기존 텍스트는 이 정보를 보존하지 않으며, 범위 내 수집이 완료된 페이지 기록에는 별도 텍스트 대안이나 음성 트랙 대안이 없다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K56",
      "kind": "파생: 페이지 및 대안 제공 상태 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "수집 시각은 2026-10-04T12:04:54.613330+00:00이다.",
        "제공된 기록에 따르면 Chromium으로 실제 로컬 HTML과 제공된 대안 목적지를 확인했다. 이번 평가에서 브라우저를 직접 실행하지 않았다.",
        "기사 초기 상태의 대상 목록은 완전하며 M-V의 alternatives는 빈 배열이다.",
        "추가 수집·외부 탐색·양식 제출·소스 수정 도구는 사용하지 않았다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "원본 식별·트랙 메타데이터 기록",
      "processed_ranges": [],
      "limitations": [
        "원본 위치는 local fixture assets/silent-guide.mp4이다.",
        "SHA-256: 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
        "기록된 길이는 19.916667초이며 ffprobe 기록상 영상 트랙만 있고 음성 트랙은 없다.",
        "원본 파일 자체를 직접 재생하거나 디코딩하지 않았다. 분류에는 제공된 트랙 기록과 파생 화면 관찰을 함께 사용했다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "파생: 전체 디코딩 및 동일 프레임 그룹 기록",
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
          "reason": "제공된 ffmpeg 디코딩·framemd5 기록의 239프레임, 12fps, 다섯 동일 프레임 그룹을 실제 첨부 PNG 내용과 대조했다."
        }
      ],
      "limitations": [
        "전체 구간 내용 확인은 모든 디코딩 프레임이 다섯 그룹에 속한다는 검증 기록이 있는 이 정적 상태 시험 자료에만 적용한다.",
        "임의 영상의 몇 장짜리 샘플에서 연속 구간을 추정한 것이 아니다.",
        "화면의 버튼은 안내 영상에 나타나는 표현으로 확인했으며 실제 클릭이나 계정 상태 변경은 수행하지 않았다.",
        "마지막 그룹 경계 19.916666666666668초와 매체 길이 19.916667초의 차이는 시간 표기 반올림이며 프레임 누락 근거가 아니다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "파생: 원본에서 추출된 실제 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.9166666666666665,
          "evidence_ids": [
            "OBS-V",
            "FRAME-1"
          ],
          "reason": "첨부 화면의 문구와 버튼을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "추출 파일명: observed-1.png",
        "동일 프레임 해시: 4469897e02e9eba4fb9e8aa47d512e2d",
        "연속 재생 관찰이 아니라 첨부 이미지와 검증된 그룹 기록을 사용했다."
      ]
    },
    {
      "evidence_id": "FRAME-2",
      "kind": "파생: 원본에서 추출된 실제 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 3.9166666666666665,
          "end_seconds": 7.916666666666667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-2"
          ],
          "reason": "첨부 화면의 문구와 버튼을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "추출 파일명: observed-2.png",
        "동일 프레임 해시: 3c7617fa1d66aab2c1363b5f757bdadb"
      ]
    },
    {
      "evidence_id": "FRAME-3",
      "kind": "파생: 원본에서 추출된 실제 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 7.916666666666667,
          "end_seconds": 11.916666666666666,
          "evidence_ids": [
            "OBS-V",
            "FRAME-3"
          ],
          "reason": "첨부 화면의 경고와 확인 버튼을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "추출 파일명: observed-3.png",
        "동일 프레임 해시: 3832866396798a5b8ed0daa49d9f6ae8"
      ]
    },
    {
      "evidence_id": "FRAME-4",
      "kind": "파생: 원본에서 추출된 실제 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 11.916666666666666,
          "end_seconds": 15.916666666666666,
          "evidence_ids": [
            "OBS-V",
            "FRAME-4"
          ],
          "reason": "첨부 화면의 생성 결과, 보관 안내와 저장 확인 버튼을 읽었으며 동일 프레임 그룹 기록이 해당 구간을 보장한다."
        }
      ],
      "limitations": [
        "추출 파일명: observed-4.png",
        "동일 프레임 해시: 20dfe3cb91d6a0bfbb5af15634512f33",
        "화면에 실제 복구 코드는 표시되지 않는다."
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "파생: 원본에서 추출된 실제 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 15.916666666666666,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-5",
            "MEDIA-V"
          ],
          "reason": "첨부 화면의 완료 상태, 이전 코드 사용 불가 및 설정 복귀 버튼을 읽었다. 종료 시각은 원본 길이의 반올림 표기를 사용했다."
        }
      ],
      "limitations": [
        "추출 파일명: observed-5.png",
        "동일 프레임 해시: fc7322ae5f966954a6774c4a0b7ba8b8"
      ]
    },
    {
      "evidence_id": "EXC-V",
      "kind": "파생: 기존 텍스트와 예외 표시 문구의 페이지 관찰 기록",
      "processed_ranges": [],
      "limitations": [
        "기존 텍스트: Open settings and create a recovery code. Save the new code.",
        "표시 문구: The following silent guide is a media alternative to the complete written steps above.",
        "기존 텍스트를 예외 검증 및 정보 비교에 사용했다. 별도 대안 목적지가 제공되었다는 근거로 취급하지 않았다.",
        "이 텍스트를 독립된 원본 영상 관찰 기록으로 사용하지 않았다."
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
      "decision": "fail",
      "exception": {
        "claimed": true,
        "verified": false,
        "no_extra_information": false,
        "clearly_labeled": true,
        "evidence_ids": [
          "EXC-V",
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
            "reason": "첫 동일 프레임 그룹의 실제 PNG에서 계정 설정, 로그인 선행 조건 및 보안 메뉴 이동 안내를 확인했다."
          },
          {
            "start_seconds": 3.9166666666666665,
            "end_seconds": 7.916666666666667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-2"
            ],
            "reason": "둘째 동일 프레임 그룹의 실제 PNG에서 보안 화면, 복구 코드의 목적 및 생성 버튼을 확인했다."
          },
          {
            "start_seconds": 7.916666666666667,
            "end_seconds": 11.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-3"
            ],
            "reason": "셋째 동일 프레임 그룹의 실제 PNG에서 이전 코드 무효화 경고와 새 코드 확인 버튼을 확인했다."
          },
          {
            "start_seconds": 11.916666666666666,
            "end_seconds": 15.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-4"
            ],
            "reason": "넷째 동일 프레임 그룹의 실제 PNG에서 코드 생성 상태, 안전한 보관, 가상 예시임을 알리는 문구 및 저장 확인 버튼을 확인했다."
          },
          {
            "start_seconds": 15.916666666666666,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5",
              "MEDIA-V"
            ],
            "reason": "다섯째 동일 프레임 그룹의 실제 PNG에서 완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 설정 복귀를 확인했다. 끝 경계 차이는 반올림이다."
          }
        ],
        "unreviewed_ranges": [],
        "complete": true
      },
      "alternatives": [],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "FRAME-1, 0~3.9166666666666665초, Account settings",
          "original_information": "계정 설정에서 안내가 시작된다.",
          "alternative_id": "EXC-V",
          "alternative_location": "영상 위 기존 텍스트의 첫 문장",
          "alternative_information": "Open settings and create a recovery code.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "EXC-V"
          ],
          "observation": "화면 제목과 기존 텍스트 모두 설정을 시작 지점으로 제시한다.",
          "interpretation": "설정을 연다는 일반적인 시작 정보는 보존된다. EXC-V는 예외 주장의 기존 텍스트이며 별도 제공 대안은 아니다.",
          "user_impact": "시작 위치에 관한 일반 정보에는 의미 있는 차이가 없다."
        },
        {
          "unit_id": "U02",
          "original_location": "FRAME-1, 0~3.9166666666666665초, 선행 조건과 Open Security 버튼",
          "original_information": "복구 코드를 만들기 전에 로그인되어 있어야 하며, 계정 설정에서 Security를 여는 단계가 제시된다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 전체",
          "alternative_information": "설정을 열고 복구 코드를 생성하라는 문장만 있으며 로그인 조건과 Security 이동 단계는 없다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-1",
            "EXC-V"
          ],
          "observation": "화면에는 You must be signed in before creating a recovery code.와 Open Security가 표시된다.",
          "interpretation": "필수 선행 조건과 구체적인 이동 대상이 생략되어 기존 텍스트보다 영상에 추가 정보가 있다.",
          "user_impact": "로그인이 필요한 시점과 설정 안에서 찾아야 할 메뉴를 알 수 없다."
        },
        {
          "unit_id": "U03",
          "original_location": "FRAME-2, 3.9166666666666665~7.916666666666667초, 설명 문구",
          "original_information": "복구 코드는 계정 접근을 복원하는 데 도움이 된다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 전체",
          "alternative_information": "복구 코드를 생성하고 저장하라고만 안내한다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-2",
            "EXC-V"
          ],
          "observation": "화면에는 Recovery codes help restore access to your account.가 표시된다.",
          "interpretation": "복구 코드의 사용 목적이 기존 텍스트에 보존되지 않는다.",
          "user_impact": "생성하는 코드가 어떤 상황에 쓰이는지에 관한 설명을 얻지 못한다."
        },
        {
          "unit_id": "U04",
          "original_location": "FRAME-2, 3.9166666666666665~7.916666666666667초, Create recovery code 버튼",
          "original_information": "복구 코드 생성 단계가 제시된다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트의 첫 문장",
          "alternative_information": "Open settings and create a recovery code.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-2",
            "EXC-V"
          ],
          "observation": "원본 화면과 기존 텍스트 모두 복구 코드 생성을 안내한다.",
          "interpretation": "생성이라는 동작의 의미는 보존된다. 이 일치만으로 전체 절차의 동등성을 인정할 수는 없다.",
          "user_impact": "코드를 생성해야 한다는 기본 동작 정보에는 차이가 없다."
        },
        {
          "unit_id": "U05",
          "original_location": "FRAME-3, 7.916666666666667~11.916666666666666초, Before you continue 화면",
          "original_information": "새 복구 코드를 생성하면 이전 코드는 사용할 수 없게 된다. 이 경고가 생성 단계 다음에 제시되고 Confirm new code 버튼으로 확인하는 단계가 나타난다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 전체",
          "alternative_information": "새 코드 생성의 영향이나 확인 단계에 관한 내용이 없다.",
          "relation": "missing",
          "evidence_ids": [
            "OBS-V",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "EXC-V"
          ],
          "observation": "화면에는 Creating a new recovery code makes the previous code unusable.와 Confirm new code가 표시된다. 그룹 기록에서 이 화면은 생성 안내 뒤, 생성 결과 앞에 위치한다.",
          "interpretation": "결정에 영향을 주는 경고와 확인 순서가 누락된다. 실제 클릭 동작을 관찰한 것은 아니다.",
          "user_impact": "이전 코드가 무효화된다는 사실을 모른 채 새 코드 생성을 진행할 수 있으며, 경고를 확인하는 절차도 알 수 없다."
        },
        {
          "unit_id": "U06",
          "original_location": "FRAME-4, 11.916666666666666~15.916666666666666초, 저장 안내",
          "original_information": "생성한 코드를 저장해야 한다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트의 둘째 문장",
          "alternative_information": "Save the new code.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-4",
            "EXC-V"
          ],
          "observation": "화면과 기존 텍스트 모두 새 코드 저장을 안내한다.",
          "interpretation": "저장이라는 기본 동작은 보존된다. 안전한 보관 조건과 저장 확인 단계의 보존 여부는 별도로 비교한다.",
          "user_impact": "코드를 저장해야 한다는 기본 정보에는 차이가 없다."
        },
        {
          "unit_id": "U07",
          "original_location": "FRAME-4, 11.916666666666666~15.916666666666666초, 생성 결과와 저장 확인",
          "original_information": "코드가 생성된 상태임을 알리고 안전한 장소에 보관하도록 안내한다. 이 예시는 실제 코드를 표시하지 않는다고 설명하며 I saved my code 버튼이 나타난다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트의 둘째 문장 및 전체 문맥",
          "alternative_information": "Save the new code.라는 일반 저장 지시만 있다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-4",
            "EXC-V"
          ],
          "observation": "Recovery code created, Save the code in a safe place. This example does not show a real code., I saved my code를 확인했다.",
          "interpretation": "안전한 보관 조건, 가상 예시의 성격, 생성 상태와 저장 확인 단계가 보존되지 않는다.",
          "user_impact": "보관 방법의 조건과 저장 후 확인 절차를 알 수 없으며, 예시에 실제 코드가 나타나지 않는 이유도 설명받지 못한다."
        },
        {
          "unit_id": "U08",
          "original_location": "FRAME-5, 15.916666666666666~19.916667초, Complete 화면",
          "original_information": "절차가 완료되어 새 복구 코드가 준비되었으며 이전 코드는 더 이상 사용할 수 없다. Return to settings가 제시된다.",
          "alternative_id": "EXC-V",
          "alternative_location": "기존 텍스트 전체",
          "alternative_information": "코드 저장 지시로 끝나며 완료 상태, 이전 코드 사용 불가 및 설정 복귀 안내는 없다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-5",
            "EXC-V"
          ],
          "observation": "Complete, Your new recovery code is ready. Your previous code can no longer be used., Return to settings를 확인했다.",
          "interpretation": "절차의 최종 상태와 결과 및 다음 이동 안내가 기존 텍스트에 보존되지 않는다.",
          "user_impact": "완료를 판단할 기준과 이후 사용할 코드의 상태, 설정으로 돌아가는 방법을 알 수 없다."
        }
      ],
      "reason": "M-V는 음소거된 동기화 매체가 아니라 원본에 음성 트랙이 없는 사전 제작 영상 전용 콘텐츠다. 기존 텍스트와의 대안 관계는 명확히 표시되지만, 추가 정보가 없다는 예외 조건은 충족하지 않는다. EXC-V의 두 문장은 생성·저장의 일반 동작만 보존하며 선행 조건, 경고, 확인 순서 및 완료 결과를 누락한다. PAGE-K56과 자료 묶음의 대안 목록은 비어 있어 다른 충분한 텍스트 또는 음성 대안 경로도 확인되지 않는다. 따라서 지정 범위에서 1.2.1을 충족하지 못한다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "기존 텍스트를 동등한 순차적 설명으로 보완한다. 로그인 선행 조건 → 계정 설정에서 Security 열기 → 복구 코드의 목적과 Create recovery code → 새 코드 생성 시 이전 코드 무효화 경고 및 Confirm new code → 생성 결과와 안전한 보관, 실제 코드를 표시하지 않는 예시임을 설명하고 I saved my code로 저장 확인 → 새 코드 준비·이전 코드 사용 불가·Return to settings의 완료 안내를 포함한다.",
          "owner_role": "콘텐츠 담당",
          "retest": "수정된 실제 페이지 본문을 읽고 동일 SHA-256의 M-V 전체 0~19.916667초와 모든 정보 단위 및 순서를 다시 비교한다. 새 영상 판본으로 교체하면 새 해시와 전체 구간 관찰 기록을 확보한다."
        },
        {
          "change": "텍스트 대신 위의 의미 있는 시각 정보와 순서를 모두 전달하는 음성 트랙을 제공하는 경로도 가능하다. 이 기준의 최소 요구로 충분한 텍스트와 음성 경로를 모두 요구하지 않는다. 현재의 'complete written steps' 표시는 실제 본문이 완전해진 경우에만 유지한다.",
          "owner_role": "콘텐츠 및 매체 제작 담당",
          "retest": "음성 경로를 선택하면 실제 제공 위치와 판본을 확인하고 음성 전체 내용 및 처리 구간을 별도로 기록하여 M-V와 비교한다. 그 대안 음성에 1.2.1을 재귀 적용하여 별도 전사문을 필수로 요구하지 않는다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "criterion": "별도 WCAG 평가",
      "observation": "플레이어 키보드 접근, 대안 텍스트의 구조와 연결 방식 등은 이번 범위에서 평가하지 않았다.",
      "reason": "이 항목들을 1.2.1의 실패 근거에 섞지 않았다."
    }
  ],
  "next_checks": [
    {
      "action": "수정 후 동일한 기사 초기 상태에서 대상 목록과 실제 제공 대안 경로를 다시 확인한다.",
      "evidence_needed": "수정된 페이지 본문, 대안 연결 및 실제 목적지 내용, 원본과 대안의 판본 식별 정보"
    },
    {
      "action": "선택한 하나의 충분한 대안 경로와 원본 전체를 재비교한다.",
      "evidence_needed": "M-V 전체 0~19.916667초의 정보 단위에 대응하는 대안 문장 또는 음성 구간; 특히 로그인 조건, 이전 코드 무효화 경고, 확인 단계 및 완료 상태"
    }
  ]
}