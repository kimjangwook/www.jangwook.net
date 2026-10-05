{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K03/index.html",
    "states": [
      "도움말 문서의 초기 상태. 사용 목적은 가상 복구 코드 생성의 사전 조건, 단계, 경고와 완료 결과를 이해하는 것이다.",
      "제공된 페이지 수집 기록, 원본의 첫 화면·마지막 화면 파생 관찰 기록과 PNG 첨부, 텍스트 대안 본문을 검토했다."
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "전체 사이트 적합성 및 모델 정확도 인증",
      "플레이어 키보드 접근성, 자막 및 다른 WCAG 성공 기준",
      "외부 또는 실제 사용자 계정",
      "직접 음성·영상 처리, 연속 재생, 스크린 리더 사용 및 추가 자료 수집"
    ],
    "execution": "partial",
    "decision": "inconclusive",
    "reason": "지정 범위의 대상 목록과 사전 제작 영상 전용 분류, 실제 텍스트 대안 제공은 확인했다. 첫 화면과 마지막 화면의 핵심 안내는 대안과 동등하지만, 중간 화면과 전환 구간의 원본 관찰이 부족하다. 확인된 실패는 없으며 전체 원본의 필요한 정보가 보존됐는지 확인할 수 없어 충족 판정을 유보한다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K03",
      "kind": "페이지 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "제공된 수집 기록을 읽었다. 이 평가에서 로컬 HTML을 직접 열거나 링크를 다시 방문하지 않았다.",
        "수집 시각은 2026-10-04T12:04:54.613330+00:00이다.",
        "수집 기록상 Chromium으로 실제 HTML과 제공된 대안 목적지를 확인했으며, 목록 완전성은 문서 초기 상태의 지정 범위에 한정된다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "원본 식별·트랙·길이 기록",
      "processed_ranges": [],
      "limitations": [
        "원본은 assets/silent-guide.mp4이며 SHA-256은 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d이다.",
        "제공된 ffprobe 기록은 길이 19.916667초, 영상 트랙만 존재하고 음성 트랙은 없음을 보고한다.",
        "이 평가에서는 원본 MP4를 직접 디코딩하거나 재생하지 않았다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "원본에서 생성된 파생 프레임 관찰 기록",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 4,
          "evidence_ids": [
            "OBS-V"
          ],
          "reason": "수집 기록이 보고한 ffmpeg 프레임 처리 구간이다. 아래 media.coverage의 내용 확인 구간과 동일하지 않다."
        },
        {
          "start_seconds": 16,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V"
          ],
          "reason": "수집 기록이 보고한 ffmpeg 프레임 처리 구간이다. 동일 프레임 그룹과의 교집합만 내용 확인 근거로 사용했다."
        }
      ],
      "limitations": [
        "방법은 ffmpeg 프레임 디코딩과 framemd5이며, PNG는 해당 MP4에서 추출됐다고 기록되어 있다.",
        "fps는 12이고 decoded_frames는 null이다. 전체 디코딩 프레임 수는 확인되지 않았다.",
        "4초부터 16초까지의 디코딩 관찰 기록은 제공되지 않았다.",
        "처리 구간과 동일 프레임 그룹의 경계가 일치하지 않으므로 처리 구간 전체를 내용 확인 구간으로 사용하지 않았다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "파생 PNG 첨부 및 동일 프레임 그룹 기록",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.9166666666666665,
          "evidence_ids": [
            "OBS-V",
            "FRAME-1"
          ],
          "reason": "첨부 PNG의 내용을 확인했으며, 기록된 동일 프레임 그룹과 처리 구간의 교집합이다."
        }
      ],
      "limitations": [
        "출처 경로는 /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-1.png이다.",
        "동일 프레임 해시는 4469897e02e9eba4fb9e8aa47d512e2d이다.",
        "그룹 종료 이후의 프레임 지속 시간이나 다음 화면 전환은 추정하지 않았다."
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "파생 PNG 첨부 및 동일 프레임 그룹 기록",
      "processed_ranges": [
        {
          "start_seconds": 16,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-5"
          ],
          "reason": "첨부 PNG의 내용을 확인했으며, 기록된 동일 프레임 그룹·처리 구간·원본 길이의 교집합이다."
        }
      ],
      "limitations": [
        "출처 경로는 /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-5.png이다.",
        "동일 프레임 해시는 fc7322ae5f966954a6774c4a0b7ba8b8이다.",
        "그룹 시작 15.916666666666666초부터 처리 시작 16초까지는 충족 근거에서 제외했다.",
        "그룹 종료와 원본 길이의 소수점 차이는 시간 표기 반올림으로 취급했다."
      ]
    },
    {
      "evidence_id": "ALT-V",
      "kind": "실제 제공된 텍스트 대안",
      "processed_ranges": [],
      "limitations": [
        "제공된 fixture-v1 본문의 문단 2부터 6까지 모두 읽었다.",
        "실제 제공 여부와 M-V와의 연결은 PAGE-K03 및 ALT-V 기록에 근거한다.",
        "대안 본문을 중간 원본 화면의 독립된 관찰 근거로 사용하지 않았다.",
        "평가에 사용 가능한 입력은 텍스트와 PNG뿐이며 추가 수집 도구는 없다. 실행 영수증이나 실제 모델 식별 정보는 입력에 없어 모델 이름을 추정하지 않았다."
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
        "FRAME-5"
      ],
      "original_version": "assets/silent-guide.mp4 / SHA-256: 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
      "duration": 19.916667,
      "execution": "partial",
      "decision": "inconclusive",
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
            "reason": "독립적으로 추출된 첫 화면 PNG를 확인했다. 동일 프레임 그룹과 보고된 처리 구간이 모두 뒷받침하는 범위만 사용했다."
          },
          {
            "start_seconds": 16,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5",
              "MEDIA-V"
            ],
            "reason": "독립적으로 추출된 마지막 화면 PNG를 확인했다. 동일 프레임 그룹과 보고된 처리 구간의 교집합을 원본 끝까지 사용했다."
          }
        ],
        "unreviewed_ranges": [
          {
            "start_seconds": 3.9166666666666665,
            "end_seconds": 4,
            "evidence_ids": [
              "OBS-V",
              "FRAME-1"
            ],
            "reason": "처리 기록에는 포함되지만 동일 프레임 그룹의 기록된 종료 이후이다. 마지막 프레임 타임스탬프와 표시 지속 시간의 관계가 명시되지 않아 내용 확인 범위를 4초까지 늘리지 않았다."
          },
          {
            "start_seconds": 4,
            "end_seconds": 15.916666666666666,
            "evidence_ids": [
              "OBS-V"
            ],
            "reason": "중간 원본 구간의 디코딩 관찰 및 이미지가 제공되지 않았다. 대안의 단계 2~4를 원본 관찰로 대신할 수 없다."
          },
          {
            "start_seconds": 15.916666666666666,
            "end_seconds": 16,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5"
            ],
            "reason": "마지막 동일 프레임 그룹에는 포함되지만 보고된 처리 시작 이전이다. 서로 다른 두 기록의 교집합 밖이므로 내용 확인 근거에서 제외했다."
          }
        ],
        "complete": false
      },
      "alternatives": [
        {
          "alternative_id": "ALT-V",
          "kind": "text",
          "relation_evidence_ids": [
            "PAGE-K03",
            "ALT-V"
          ],
          "actually_observed": true,
          "location": "제공된 대안 본문의 문단 2~6, 단계 1~5",
          "version": "fixture-v1"
        }
      ],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "FRAME-1 / 0~3.9166666666666665초 / 1/5, Account settings",
          "original_information": "복구 코드 생성 전 로그인되어 있어야 한다는 사전 조건이 표시된다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2 / 단계 1",
          "alternative_information": "계정 설정에서 복구 코드 생성 전에 로그인해야 한다고 설명한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "첨부 첫 화면의 사전 조건과 실제 대안 문장을 비교했다.",
          "interpretation": "로그인이라는 선행 조건과 적용 시점이 보존된다.",
          "user_impact": "이 단계의 실행 가능 여부를 판단하는 정보 차이는 확인되지 않았다."
        },
        {
          "unit_id": "U02",
          "original_location": "FRAME-1 / 0~3.9166666666666665초 / Open Security",
          "original_information": "첫 단계의 선택 대상으로 Open Security가 표시된다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2 / 단계 1",
          "alternative_information": "Open Security를 선택하라고 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "ALT-V"
          ],
          "observation": "첫 화면의 선택 대상 명칭과 단계 1의 지시가 일치한다. 실제 클릭이나 화면 전환은 관찰하지 않았다.",
          "interpretation": "첫 단계의 대상과 행동 안내가 동등하다.",
          "user_impact": "확인된 선택 대상에 관한 정보 차이는 없다."
        },
        {
          "unit_id": "U03",
          "original_location": "중간 미검토 구간 / 단계 2에 대응하는 원본 위치 미확인",
          "original_information": "원본의 두 번째 화면 문구와 동작·전환은 확인하지 못했다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 3 / 단계 2",
          "alternative_information": "Security에서 복구 코드가 계정 접근을 복원한다고 설명하고 Create recovery code를 선택하도록 안내한다.",
          "relation": "uncertain",
          "evidence_ids": [
            "OBS-V",
            "ALT-V"
          ],
          "observation": "대안 문장은 확인했으나 이에 대응하는 원본 관찰은 없다.",
          "interpretation": "대안에 안내가 있다는 사실만으로 원본과의 동등성을 판단할 수 없다.",
          "user_impact": "기능 설명과 생성 시작 행동의 누락 또는 왜곡 여부가 미확인이다."
        },
        {
          "unit_id": "U04",
          "original_location": "중간 미검토 구간 / 단계 3에 대응하는 원본 위치 미확인",
          "original_information": "원본의 경고 문구, 조건 및 확인 행동은 확인하지 못했다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 4 / 단계 3",
          "alternative_information": "새 코드가 이전 코드를 사용할 수 없게 만든다고 경고하고 Confirm new code를 선택하도록 안내한다.",
          "relation": "uncertain",
          "evidence_ids": [
            "OBS-V",
            "ALT-V"
          ],
          "observation": "대안의 경고는 읽었으나 해당 중간 원본 화면을 관찰하지 못했다.",
          "interpretation": "경고의 내용과 제공 순서가 원본과 동등한지 확인이 필요하다.",
          "user_impact": "사용자가 생성 확정 전에 알아야 하는 조건이나 경고가 모두 보존됐는지 판단할 수 없다."
        },
        {
          "unit_id": "U05",
          "original_location": "중간 미검토 구간 / 단계 4에 대응하는 원본 위치 미확인",
          "original_information": "원본의 생성 결과, 보관 지시와 저장 확인 행동은 확인하지 못했다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 5 / 단계 4",
          "alternative_information": "Recovery code created에서 안전하게 보관하도록 안내하며 실제 코드가 표시되지 않는 예제라고 설명하고 I saved my code를 선택하도록 한다.",
          "relation": "uncertain",
          "evidence_ids": [
            "OBS-V",
            "ALT-V"
          ],
          "observation": "대안 본문은 확인했으나 해당 원본 화면의 독립된 관찰 자료가 없다.",
          "interpretation": "보관 안내와 결과·확인 행동의 동등성을 확정할 수 없다.",
          "user_impact": "안전한 보관과 다음 단계 진행에 필요한 정보가 완전하게 전달되는지는 미확인이다."
        },
        {
          "unit_id": "U06",
          "original_location": "FRAME-5 / 16~19.916667초 / 5/5, Complete",
          "original_information": "새 복구 코드가 준비됐고 이전 코드는 더 이상 사용할 수 없다고 표시된다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 6 / 단계 5",
          "alternative_information": "새 코드가 준비됐으며 이전 코드는 더 이상 사용할 수 없다고 설명한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "마지막 화면의 완료 결과와 이전 코드 사용 불가 문구를 대안과 비교했다.",
          "interpretation": "완료 상태와 중요한 부정 정보가 보존된다.",
          "user_impact": "사용할 수 있는 코드와 사용할 수 없는 코드를 구분하는 정보 차이는 확인되지 않았다."
        },
        {
          "unit_id": "U07",
          "original_location": "FRAME-5 / 16~19.916667초 / Return to settings",
          "original_information": "마지막 단계의 선택 대상으로 Return to settings가 표시된다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 6 / 단계 5",
          "alternative_information": "Return to settings를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "ALT-V"
          ],
          "observation": "마지막 화면의 선택 대상 명칭과 대안의 지시가 일치한다.",
          "interpretation": "완료 이후의 선택 대상 안내가 보존된다. 실제 선택 결과는 관찰하지 않았다.",
          "user_impact": "확인된 마지막 선택 대상에 관한 정보 차이는 없다."
        }
      ],
      "reason": "ffprobe 기반 기록에 따라 플레이어 음소거가 아닌 실제 음성 트랙 부재를 확인했으며, 기록된 고정 화면 시퀀스는 사전 제작 영상 전용에 해당한다. 텍스트 대안 한 경로가 실제 제공된다. 첫 단계와 완료 단계의 핵심 안내는 동등하지만 원본 중간 내용과 전환을 확인하지 못했으므로 pass도 fail도 확정할 수 없다. 기존 텍스트 대안 예외는 주장되지 않았다.",
      "missing_evidence": [
        "중간 화면의 문구, 대상, 동작, 순서, 상태 변화와 경고를 독립적으로 확인할 원본 파생 관찰 자료",
        "3.9166666666666665~4초 및 15.916666666666666~16초의 처리 구간·동일 프레임 그룹 경계 불일치를 해소할 기록",
        "첫 화면부터 마지막 화면까지 전체 원본의 필요한 정보가 모두 ALT-V에 보존되는지 확인할 수 있는 완전한 관찰 자료"
      ],
      "recommendations": [
        {
          "change": "현재는 입증된 콘텐츠 결함이 없으므로 특정 문구 수정을 확정하지 않는다. 먼저 동일 해시 원본의 전체 디코딩 기록과 화면별 관찰 자료를 확보하고 처리 구간과 동일 프레임 그룹의 경계를 정합하게 기록한다.",
          "owner_role": "평가·미디어 수집 담당",
          "retest": "동일 페이지 초기 상태에서 동일 해시의 M-V 전체 0~19.916667초와 ALT-V fixture-v1 전체를 재비교한다. 추가 수집은 별도 허용된 환경에서 수행하며 실제 계정이나 복구 코드는 수집하지 않는다."
        },
        {
          "change": "중간 원본을 확인한 뒤 ALT-V 문단 3~5의 기능 설명, 생성 전 경고, 보관 지시, 선택 대상 및 순서가 원본의 모든 의미 있는 정보와 동등한지 점검한다. 누락이나 왜곡이 확인될 경우 해당 원본 위치에 맞춰 텍스트 대안을 보완한다.",
          "owner_role": "콘텐츠 담당",
          "retest": "중간 단계뿐 아니라 사전 조건부터 완료 결과까지 전체 순서를 다시 대조한다. 충분한 텍스트 대안이 확인되면 이 기준을 위해 별도 음성 경로까지 요구하지 않는다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "check": "플레이어 키보드 접근성과 기타 미디어 관련 성공 기준",
      "status": "이 평가 범위에서 미검토",
      "reason": "1.2.1의 대안 동등성 판정과 분리한다. 이번 원본은 음성 트랙이 없는 영상 전용이며, 자막 부재를 이 기준의 실패로 처리하지 않았다."
    }
  ],
  "next_checks": [
    "별도 허용된 수집 환경에서 누락된 원본 구간의 독립된 관찰 자료를 확보한다.",
    "프레임 타임스탬프와 실제 표시 구간의 관계를 확인하여 coverage의 경계 불일치를 해소한다.",
    "원본 전체의 의미 있는 정보와 ALT-V를 대조한 뒤 동일 지정 범위의 판정을 갱신한다."
  ]
}