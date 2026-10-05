{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K25/index.html",
    "states": [
      "기사 초기 상태: 제공된 수집 기록, 원본에서 추출한 PNG 5개 및 현재 텍스트 대안을 검토",
      "가상의 복구 코드 도움말: 사전 조건, 단계, 경고 및 완료 결과를 학습하는 목적"
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "지정 상태 밖의 페이지 및 전체 사이트 적합성",
      "플레이어 키보드 접근성, 자막 및 다른 WCAG 성공 기준",
      "외부 계정 또는 실제 계정 조작",
      "직접 동영상 재생, 직접 청취 및 스크린 리더 사용",
      "모델 정확도 인증"
    ],
    "execution": "complete",
    "decision": "fail",
    "reason": "지정 범위의 대상은 사전 제작 영상 전용 M-V 하나이다. 전체 디코딩 프레임이 5개의 동일 프레임 그룹으로 구성되었다는 OBS-V 기록과 실제 첨부 PNG를 함께 검토하여 필요한 원본 내용을 확인했다. 유일하게 제공된 대안 ALT-V는 2단계의 설명과 실행 항목, 3단계의 실행 전 경고와 확인 항목을 누락한다. 5단계의 완료 결과에 이전 코드의 무효화가 언급되어도 실행 전에 제시되는 경고와 단계 순서를 대체하지 못한다. 다른 음성 대안 경로나 예외 주장은 제공된 범위에서 확인되지 않았다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K25",
      "kind": "페이지 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "2026-10-04T12:04:54.613330+00:00에 수집된 기록을 읽었다. 이번 평가에서 URL을 직접 열거나 DOM을 재수집하지 않았다.",
        "Chromium으로 실제 HTML 및 제공된 대안 목적지를 읽었다는 수집 기록에 따라 대상 목록과 M-V–ALT-V 연결을 확인했다.",
        "목록 완전성은 기사 초기 상태의 미디어 내용 및 제공된 대안 범위에 한정된다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "원본 식별·길이·트랙에 관한 제공 기록",
      "processed_ranges": [],
      "limitations": [
        "원본은 assets/silent-guide.mp4이며 SHA-256은 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d이다.",
        "ffprobe 확인 기록상 영상 트랙만 있고 음성 트랙은 없다. 플레이어 음소거 상태를 근거로 한 분류가 아니다.",
        "이번 평가에서 원본 파일을 직접 디코딩하거나 재생하지 않았다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "원본에서 생성한 파생 관찰 기록",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V"
          ],
          "reason": "ffmpeg 디코딩 및 framemd5 기록은 12fps의 전체 239프레임이 5개의 동일 프레임 그룹에 속함을 제시한다."
        }
      ],
      "limitations": [
        "전체 디코딩 처리 기록만으로 내용 확인을 주장하지 않고, 각 그룹을 대표하는 실제 첨부 PNG와 함께 사용했다.",
        "동일 프레임 그룹 검증이 있는 통제된 정적 상태 영상에만 전체 구간의 내용 확인을 적용했다. 임의 영상의 샘플 프레임 검토로 일반화하지 않는다.",
        "실제 계정 조작이 아니라 설명 화면과 그 순서의 기록이다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "원본에서 추출한 실제 PNG",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.9166666666666665,
          "evidence_ids": [
            "FRAME-1",
            "OBS-V"
          ],
          "reason": "첨부 PNG의 내용을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 이 구간의 동일한 화면 내용을 보장한다."
        }
      ],
      "limitations": [
        "정지 이미지와 그룹 기록의 결합이며 직접 연속 재생한 관찰은 아니다."
      ]
    },
    {
      "evidence_id": "FRAME-2",
      "kind": "원본에서 추출한 실제 PNG",
      "processed_ranges": [
        {
          "start_seconds": 3.9166666666666665,
          "end_seconds": 7.916666666666667,
          "evidence_ids": [
            "FRAME-2",
            "OBS-V"
          ],
          "reason": "첨부 PNG의 내용을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 이 구간의 동일한 화면 내용을 보장한다."
        }
      ],
      "limitations": [
        "정지 이미지와 그룹 기록의 결합이며 실제 버튼 선택을 수행하지 않았다."
      ]
    },
    {
      "evidence_id": "FRAME-3",
      "kind": "원본에서 추출한 실제 PNG",
      "processed_ranges": [
        {
          "start_seconds": 7.916666666666667,
          "end_seconds": 11.916666666666666,
          "evidence_ids": [
            "FRAME-3",
            "OBS-V"
          ],
          "reason": "첨부 PNG의 내용을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 이 구간의 동일한 화면 내용을 보장한다."
        }
      ],
      "limitations": [
        "실행 전 경고 화면을 관찰했으며 실제 코드 생성이나 무효화는 수행하지 않았다."
      ]
    },
    {
      "evidence_id": "FRAME-4",
      "kind": "원본에서 추출한 실제 PNG",
      "processed_ranges": [
        {
          "start_seconds": 11.916666666666666,
          "end_seconds": 15.916666666666666,
          "evidence_ids": [
            "FRAME-4",
            "OBS-V"
          ],
          "reason": "첨부 PNG의 내용을 읽었으며 OBS-V의 동일 프레임 그룹 기록이 이 구간의 동일한 화면 내용을 보장한다."
        }
      ],
      "limitations": [
        "화면은 실제 복구 코드를 보여 주지 않는다고 명시한다. 실제 복구 코드나 인증 정보를 수집하지 않았다."
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "원본에서 추출한 실제 PNG",
      "processed_ranges": [
        {
          "start_seconds": 15.916666666666666,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "MEDIA-V"
          ],
          "reason": "첨부 PNG와 마지막 동일 프레임 그룹을 확인했다. 종료 값은 제공된 원본 길이에 맞췄으며 그룹 종료 값과의 차이는 소수 표기 반올림이다."
        }
      ],
      "limitations": [
        "완료를 나타내는 설명 화면이며 실제 계정 상태 변경의 검증은 아니다."
      ]
    },
    {
      "evidence_id": "ALT-V",
      "kind": "실제 제공된 텍스트 대안",
      "processed_ranges": [],
      "limitations": [
        "제공된 fixture-v1 본문 전체를 읽었다. 문단 2, 3, 4에는 각각 1, 4, 5단계만 있다.",
        "이번 평가에서 대안 목적지를 직접 열지는 않았다. 실제 열람 여부와 대상 연결은 PAGE-K25 및 ALT-V의 수집 기록을 사용했다.",
        "ALT-V를 원본의 독립된 관찰 증거로 사용하지 않았다."
      ]
    }
  ],
  "media": [
    {
      "media_id": "M-V",
      "classification": "prerecorded_video_only",
      "classification_evidence_ids": [
        "MEDIA-V",
        "OBS-V"
      ],
      "original_version": "assets/silent-guide.mp4 / SHA-256: 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
      "duration": 19.916667,
      "execution": "complete",
      "decision": "fail",
      "exception": {
        "claimed": false,
        "verified": false,
        "no_extra_information": null,
        "clearly_labeled": null,
        "evidence_ids": []
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
            "reason": "전체 디코딩으로 검증된 동일 프레임 그룹의 대표 PNG에서 계정 설정, 로그인 조건 및 보안 화면으로 이동하는 항목을 확인했다."
          },
          {
            "start_seconds": 3.9166666666666665,
            "end_seconds": 7.916666666666667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-2"
            ],
            "reason": "동일 프레임 그룹의 대표 PNG에서 보안 화면, 복구 코드의 목적 및 생성 항목을 확인했다."
          },
          {
            "start_seconds": 7.916666666666667,
            "end_seconds": 11.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-3"
            ],
            "reason": "동일 프레임 그룹의 대표 PNG에서 실행 전 이전 코드 무효화 경고 및 새 코드 확인 항목을 확인했다."
          },
          {
            "start_seconds": 11.916666666666666,
            "end_seconds": 15.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-4"
            ],
            "reason": "동일 프레임 그룹의 대표 PNG에서 생성 상태, 안전한 보관 안내, 실제 코드가 없는 예시라는 설명 및 저장 확인 항목을 확인했다."
          },
          {
            "start_seconds": 15.916666666666666,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5",
              "MEDIA-V"
            ],
            "reason": "마지막 동일 프레임 그룹의 대표 PNG에서 완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 설정 복귀 항목을 확인했다. 원본 길이와 그룹 종료 표기의 미세한 차이는 반올림이며 미검토 프레임을 나타내지 않는다."
          }
        ],
        "unreviewed_ranges": [],
        "complete": true
      },
      "alternatives": [
        {
          "alternative_id": "ALT-V",
          "kind": "text",
          "relation_evidence_ids": [
            "PAGE-K25",
            "ALT-V"
          ],
          "actually_observed": true,
          "location": "제공된 대안 본문 문단 2–4; 별도 목적지 URL은 자료에 명시되지 않음",
          "version": "fixture-v1"
        }
      ],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "0–3.916667초, FRAME-1, 1/5 화면",
          "original_information": "계정 설정 화면에서 복구 코드를 만들기 전에 로그인해야 한다고 안내하고, 'Open Security' 항목을 보여 준다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2, Step 1",
          "alternative_information": "계정 설정에서 복구 코드 생성 전에 로그인해야 하며 'Open Security'를 선택하라고 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "로그인 사전 조건, 화면 문맥 및 선택 대상이 원본과 대안에 모두 있다.",
          "interpretation": "첫 단계의 필요한 정보가 동등하게 전달된다.",
          "user_impact": "텍스트 이용자도 필요한 로그인 조건과 첫 이동 대상을 알 수 있다."
        },
        {
          "unit_id": "U02",
          "original_location": "3.916667–7.916667초, FRAME-2, 2/5 화면",
          "original_information": "'Security' 화면에서 복구 코드가 계정 접근을 복원하는 데 도움이 된다고 설명하고 'Create recovery code' 항목을 보여 준다.",
          "alternative_id": "ALT-V",
          "alternative_location": "전체 본문; 문단 2의 Step 1과 문단 3의 Step 4 사이",
          "alternative_information": "보안 화면의 설명과 'Create recovery code' 선택 단계가 없다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-2",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본에는 2단계가 있으나 대안은 1단계 다음에 4단계로 이동한다.",
          "interpretation": "복구 코드의 목적과 생성 절차의 실행 대상이 보존되지 않았다.",
          "user_impact": "텍스트 이용자는 복구 코드의 용도와 보안 화면에서 무엇을 선택해야 하는지 알 수 없다."
        },
        {
          "unit_id": "U03",
          "original_location": "7.916667–11.916667초, FRAME-3, 3/5 'Before you continue' 화면",
          "original_information": "계속하기 전에 새 복구 코드를 만들면 이전 코드를 사용할 수 없게 된다는 경고를 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "실행 전 단계는 없음; 관련 결과 문구는 문단 4, Step 5에만 있음",
          "alternative_information": "완료 단계에서 이전 코드를 더 이상 사용할 수 없다고 설명하지만, 생성 확인 전에 제시되는 경고는 없다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-3",
            "FRAME-5",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "무효화 결과 자체는 대안의 마지막 단계에 있지만 원본의 실행 전 경고 위치와 순서는 빠져 있다.",
          "interpretation": "결과를 사후에 알리는 문장은 이용자의 실행 전 판단에 필요한 경고를 동등하게 대체하지 못한다.",
          "user_impact": "텍스트 이용자는 이전 코드가 무효화되는 결과를 고려한 후 생성 여부를 결정하는 데 필요한 사전 안내를 받지 못한다."
        },
        {
          "unit_id": "U04",
          "original_location": "7.916667–11.916667초, FRAME-3, 3/5 화면의 실행 항목",
          "original_information": "실행 전 경고 아래에 'Confirm new code' 항목이 있다.",
          "alternative_id": "ALT-V",
          "alternative_location": "전체 본문; Step 3 없음",
          "alternative_information": "'Confirm new code'를 선택하는 단계가 없다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-3",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본에 표시되는 확인 대상이 대안 본문에 없다.",
          "interpretation": "경고 확인 후 새 코드 생성을 확인하는 절차가 보존되지 않았다.",
          "user_impact": "텍스트 이용자는 생성 확인 단계와 해당 선택 대상을 알 수 없다."
        },
        {
          "unit_id": "U05",
          "original_location": "11.916667–15.916667초, FRAME-4, 4/5 화면",
          "original_information": "복구 코드 생성 화면에서 코드를 안전한 곳에 저장하라고 안내하고, 이 예시는 실제 코드를 보여 주지 않는다고 명시하며 'I saved my code' 항목을 보여 준다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 3, Step 4",
          "alternative_information": "생성된 코드를 안전하게 저장하고, 예시에 실제 코드가 없으며, 'I saved my code'를 선택하라고 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-4",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "생성 상태, 보관 안내, 실제 코드 미표시 및 저장 확인 대상이 모두 대안에 있다.",
          "interpretation": "이 단계의 의미 있는 정보는 동등하게 전달된다.",
          "user_impact": "텍스트 이용자도 안전한 보관 필요성과 예시의 한계를 알고 다음 확인 대상을 파악할 수 있다."
        },
        {
          "unit_id": "U06",
          "original_location": "15.916667–19.916667초, FRAME-5, 5/5 화면",
          "original_information": "완료 화면에서 새 복구 코드가 준비되었고 이전 코드는 더 이상 사용할 수 없다고 안내하며 'Return to settings' 항목을 보여 준다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 4, Step 5",
          "alternative_information": "완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 'Return to settings' 선택을 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "완료 시점의 상태와 결과 및 복귀 대상이 원본과 대안에 모두 있다.",
          "interpretation": "완료 단계 자체의 정보는 동등하다. 이 일치는 별도로 누락된 실행 전 경고를 보완하지 않는다.",
          "user_impact": "텍스트 이용자는 완료 결과와 설정으로 돌아가는 대상을 알 수 있다."
        },
        {
          "unit_id": "U07",
          "original_location": "0–19.916667초, FRAME-1부터 FRAME-5까지의 시간순 화면",
          "original_information": "계정 설정 → 보안 및 생성 선택 → 실행 전 경고 및 생성 확인 → 생성 및 보관 확인 → 완료의 5단계 순서이다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2–4, Step 1 → Step 4 → Step 5",
          "alternative_information": "1, 4, 5단계만 제시하여 중간의 생성 선택과 실행 전 확인 절차를 생략한다.",
          "relation": "missing",
          "evidence_ids": [
            "FRAME-1",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "FRAME-5",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본의 단계 표시와 동일 프레임 그룹의 시간순 기록은 5단계를 확인하며 대안의 본문은 3개 단계만 포함한다.",
          "interpretation": "단계 번호가 남아 있는 것만으로 누락된 동작과 상태 전환이 전달되지는 않는다.",
          "user_impact": "텍스트 이용자는 첫 화면에서 생성 완료 화면까지의 절차를 원본과 동등하게 학습할 수 없다."
        }
      ],
      "reason": "영상 전용 콘텐츠에는 충분한 텍스트 대안 또는 음성 트랙 중 한 경로가 필요하다. 제공된 목록에서 확인된 경로는 ALT-V뿐이며, 그 본문은 2단계와 3단계의 의미 있는 설명, 실행 항목 및 실행 전 경고 순서를 누락한다. 전체 원본 내용과 실제 대안을 대조한 결과 동등하지 않으므로 fail이다. 텍스트와 음성 대안을 모두 요구하는 판정이 아니며, 예외도 주장되거나 검증되지 않았다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "ALT-V의 Step 1과 Step 4 사이에 Step 2를 복원한다. 보안 화면에서 복구 코드가 계정 접근 복원에 도움이 된다는 설명과 'Create recovery code'를 선택하는 절차를 포함한다.",
          "owner_role": "콘텐츠 담당",
          "retest": "동일 원본의 FRAME-2 및 3.916667–7.916667초 그룹과 수정된 대안을 대조하고, 지정 페이지에서 실제 제공되는 본문인지 확인한다."
        },
        {
          "change": "Step 3을 복원하여 새 코드 생성 전에 이전 코드가 사용할 수 없게 된다는 경고를 전달하고, 그 뒤에 'Confirm new code' 선택 절차를 배치한다. 완료 단계의 결과 문구만으로 대신하지 않는다.",
          "owner_role": "콘텐츠 담당",
          "retest": "동일 원본의 FRAME-3 및 7.916667–11.916667초 그룹과 수정된 대안을 대조하여 경고 내용, 실행 전 위치 및 확인 대상을 확인한다."
        },
        {
          "change": "수정된 대안을 지정 페이지의 M-V에 연결된 실제 ALT-V 목적지에 반영하고 1–5단계의 순서를 유지한다. 충분한 텍스트 경로를 수정하는 경우 별도의 음성 경로까지 추가할 필요는 없다.",
          "owner_role": "콘텐츠 담당 및 웹 개발 담당",
          "retest": "동일 페이지 초기 상태에서 대상 목록과 대안 연결을 다시 확인하고, 원본 SHA-256 및 대안의 새 판본을 기록한 뒤 0–19.916667초 전체의 필요한 정보와 실제 대안 본문을 재비교한다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "topic": "플레이어 및 다른 WCAG 성공 기준",
      "status": "not_evaluated",
      "reason": "키보드 조작, 자막, 포커스 및 다른 성공 기준은 이번 범위에서 검사하지 않았으며 1.2.1 실패 근거에 포함하지 않았다."
    }
  ],
  "next_checks": [
    {
      "action": "수정된 ALT-V의 실제 제공 본문을 다시 수집하고, 동일 원본의 5개 화면 전체와 단계 순서 및 실행 전 경고를 재점검한다.",
      "condition": "외부 계정 조작이나 실제 복구 코드 수집 없이 동일한 기사 초기 상태에서 수행한다."
    }
  ]
}