{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K63/index.html",
    "states": [
      "도움말 문서의 초기 상태에서 제공된 매체와 연결된 대안",
      "가상 복구 코드 안내 영상의 다섯 정적 상태 및 그 순서, 0–19.916667초"
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "지정 상태 밖의 페이지와 전체 사이트 적합성",
      "플레이어 키보드 접근성, 자막 및 다른 WCAG 성공 기준",
      "외부 계정, 실제 로그인 및 복구 코드 생성·제출",
      "직접 영상 재생, 직접 청취 및 스크린 리더 사용",
      "평가 모델의 정확도 인증"
    ],
    "execution": "complete",
    "decision": "pass",
    "reason": "제공된 목록 수집 기록상 지정 범위의 대상은 M-V 하나이며, 사전 제작 영상 전용으로 분류된다. 전체 디코딩 프레임이 다섯 동일 프레임 그룹에 속한다는 OBS-V 기록과 각 그룹의 실제 PNG 첨부를 함께 확인했다. ALT-V의 실제 본문은 영상의 선행 조건, 목적, 단계별 선택 대상, 이전 코드 무효화 경고, 안전한 보관 안내, 예시의 성격 및 완료 결과를 순서대로 보존한다. 따라서 지정 범위에서 1.2.1의 충분한 텍스트 대안 경로를 확인했다. 이는 제공된 증거에 따른 범위 한정 판정이며 전체 사이트에 대한 인증이 아니다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K63",
      "kind": "페이지 수집 기록",
      "source": "지정된 로컬 HTML에 대한 Chromium 수집 기록",
      "collected_at": "2026-10-04T12:04:54.613330+00:00",
      "processed_ranges": [],
      "limitations": [
        "입력에 제공된 페이지 문맥, 목록 완전성 및 대안 목적지 열람 기록을 사용했다.",
        "평가자가 로컬 URL을 새로 열거나 DOM을 직접 수집하지 않았다.",
        "사용 가능한 입력은 제공된 텍스트와 PNG이며 추가 수집 도구는 없다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "원본 식별 및 트랙 확인 기록",
      "source": "local fixture assets/silent-guide.mp4",
      "version": "sha256:72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
      "duration": 19.916667,
      "processed_ranges": [],
      "limitations": [
        "제공된 ffprobe 기반 기록으로 영상 트랙만 있고 음성 트랙은 없음을 확인했다.",
        "원본 MP4를 평가자가 직접 재생하거나 디코딩하지 않았다.",
        "트랙 정보만으로 내용의 동등성을 판단하지 않고 OBS-V 및 실제 PNG를 별도로 사용했다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "원본에서 생성된 파생 관찰 기록",
      "source": "동일 SHA-256 원본의 ffmpeg 프레임 디코딩 및 framemd5 기록",
      "decoded_frames": 239,
      "fps": 12,
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
          "reason": "수집 기록상 전체 239개 디코딩 프레임이 다섯 동일 프레임 그룹으로 구성되고, 각 그룹의 대표 PNG를 실제로 확인했다."
        }
      ],
      "limitations": [
        "수집 도구는 Chromium, ffprobe, ffmpeg 및 independent faster-whisper base.en으로 기록되어 있으나, 이 대상의 내용 비교에는 프레임 기록과 PNG만 사용했다.",
        "전체 구간 확인은 이 통제된 정적 상태 영상에 한정된다. 임의의 영상에서 몇 장의 샘플만으로 전체 내용을 확인한 것으로 일반화하지 않는다.",
        "실제 계정 조작이나 버튼 클릭을 관찰한 기록이 아니라 안내 화면과 순서 전환의 기록이다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "source": "/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-1.png",
      "decoded_identical_frame_hash": "4469897e02e9eba4fb9e8aa47d512e2d",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-1"
          ],
          "reason": "첨부 이미지의 내용을 확인했으며 OBS-V가 이 그룹 전체의 프레임 동일성을 보장한다."
        }
      ],
      "limitations": [
        "시간 경계는 소수점 여섯 자리로 표시했다. 원기록의 3.9166666666666665초와의 차이는 반올림이다."
      ]
    },
    {
      "evidence_id": "FRAME-2",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "source": "/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-2.png",
      "decoded_identical_frame_hash": "3c7617fa1d66aab2c1363b5f757bdadb",
      "processed_ranges": [
        {
          "start_seconds": 3.916667,
          "end_seconds": 7.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-2"
          ],
          "reason": "첨부 이미지의 내용을 확인했으며 OBS-V가 이 그룹 전체의 프레임 동일성을 보장한다."
        }
      ],
      "limitations": [
        "시간 경계는 원기록을 소수점 여섯 자리로 반올림했다."
      ]
    },
    {
      "evidence_id": "FRAME-3",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "source": "/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-3.png",
      "decoded_identical_frame_hash": "3832866396798a5b8ed0daa49d9f6ae8",
      "processed_ranges": [
        {
          "start_seconds": 7.916667,
          "end_seconds": 11.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-3"
          ],
          "reason": "첨부 이미지의 내용을 확인했으며 OBS-V가 이 그룹 전체의 프레임 동일성을 보장한다."
        }
      ],
      "limitations": [
        "시간 경계는 원기록을 소수점 여섯 자리로 반올림했다."
      ]
    },
    {
      "evidence_id": "FRAME-4",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "source": "/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-4.png",
      "decoded_identical_frame_hash": "20dfe3cb91d6a0bfbb5af15634512f33",
      "processed_ranges": [
        {
          "start_seconds": 11.916667,
          "end_seconds": 15.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-4"
          ],
          "reason": "첨부 이미지의 내용을 확인했으며 OBS-V가 이 그룹 전체의 프레임 동일성을 보장한다."
        }
      ],
      "limitations": [
        "시간 경계는 원기록을 소수점 여섯 자리로 반올림했다."
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "source": "/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/observed-5.png",
      "decoded_identical_frame_hash": "fc7322ae5f966954a6774c4a0b7ba8b8",
      "processed_ranges": [
        {
          "start_seconds": 15.916667,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "OBS-V",
            "FRAME-5"
          ],
          "reason": "첨부 이미지의 내용을 확인했으며 OBS-V가 원본 끝까지 이 그룹의 프레임 동일성을 보장한다."
        }
      ],
      "limitations": [
        "그룹 끝의 원기록 19.916666666666668초와 원본 길이 19.916667초의 차이는 반올림이며 미검토 프레임을 뜻하지 않는다."
      ]
    },
    {
      "evidence_id": "ALT-V",
      "kind": "실제로 제공된 텍스트 대안",
      "source": "PAGE-K63의 M-V에 연결된 대안 목적지에서 수집된 본문",
      "version": "fixture-v1",
      "processed_ranges": [],
      "limitations": [
        "입력에 포함된 문단 2–6과 전체 대안 텍스트를 읽었다.",
        "대안 목적지의 별도 URL은 입력에 없다. 연결 관계와 실제 열람 여부는 PAGE-K63 및 ALT-V 수집 기록에 근거한다.",
        "ALT-V는 비교 대상이며 독립된 원본 관찰 근거로 사용하지 않았다."
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
      "original_version": "sha256:72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
      "duration": 19.916667,
      "execution": "complete",
      "decision": "pass",
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
            "end_seconds": 3.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-1"
            ],
            "reason": "同一 프레임 그룹 기록과 실제 PNG로 첫 화면의 문구, 선택 대상 및 단계 표시를 확인했다."
          },
          {
            "start_seconds": 3.916667,
            "end_seconds": 7.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-2"
            ],
            "reason": "동일 프레임 그룹 기록과 실제 PNG로 두 번째 화면의 목적 설명 및 선택 대상을 확인했다."
          },
          {
            "start_seconds": 7.916667,
            "end_seconds": 11.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-3"
            ],
            "reason": "동일 프레임 그룹 기록과 실제 PNG로 새 코드 생성 전 경고 및 확인 대상을 확인했다."
          },
          {
            "start_seconds": 11.916667,
            "end_seconds": 15.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-4"
            ],
            "reason": "동일 프레임 그룹 기록과 실제 PNG로 생성 상태, 보관 지시, 실제 코드 미표시 안내 및 저장 확인 대상을 확인했다."
          },
          {
            "start_seconds": 15.916667,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5"
            ],
            "reason": "동일 프레임 그룹 기록과 실제 PNG로 완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 복귀 대상을 원본 끝까지 확인했다."
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
            "PAGE-K63",
            "ALT-V"
          ],
          "actually_observed": true,
          "location": "PAGE-K63에서 M-V에 연결된 텍스트 대안의 문단 2–6",
          "version": "fixture-v1"
        }
      ],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "0–3.916667초, FRAME-1, 1/5",
          "original_information": "‘Account settings’ 화면은 복구 코드를 만들기 전에 로그인되어 있어야 한다고 안내하고 ‘Open Security’를 선택 대상으로 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2, Step 1",
          "alternative_information": "계정 설정에서 복구 코드 생성 전에 로그인해야 한다는 조건과 ‘Open Security’를 선택하라는 안내가 있다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본 이미지의 화면 제목, 선행 조건 문구 및 버튼 라벨을 대안의 첫 단계와 대조했다.",
          "interpretation": "진입 화면, 필요한 로그인 조건 및 다음 선택 대상이 동등하게 전달된다.",
          "user_impact": "영상 없이도 시작 조건과 첫 선택 대상을 알 수 있다."
        },
        {
          "unit_id": "U02",
          "original_location": "3.916667–7.916667초, FRAME-2, 2/5",
          "original_information": "‘Security’ 화면은 복구 코드가 계정 접근 복구에 도움이 된다고 설명하고 ‘Create recovery code’를 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 3, Step 2",
          "alternative_information": "보안 화면에서 복구 코드의 계정 접근 복구 목적을 설명하고 ‘Create recovery code’를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-2",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본의 목적 설명과 생성 선택 대상이 대안의 두 번째 단계에 있다.",
          "interpretation": "‘접근 복구에 도움이 된다’와 ‘접근을 복구한다’의 표현 차이는 이 안내 문맥에서 기능과 이용 목적의 실질적 차이를 만들지 않는다.",
          "user_impact": "복구 코드의 용도와 생성 단계로 진행할 대상을 동일하게 이해할 수 있다."
        },
        {
          "unit_id": "U03",
          "original_location": "7.916667–11.916667초, FRAME-3, 3/5",
          "original_information": "‘Before you continue’ 화면은 새 복구 코드를 만들면 이전 코드가 사용할 수 없게 된다고 경고하고 ‘Confirm new code’를 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 4, Step 3",
          "alternative_information": "계속하기 전 새 코드가 이전 코드를 사용할 수 없게 만든다는 경고와 ‘Confirm new code’를 선택하라는 안내가 있다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-3",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "이전 코드 무효화라는 결과와 새 코드 확인 선택 대상이 모두 보존된다.",
          "interpretation": "중요한 부정 정보와 생성 전 의사결정 순서가 대안에 포함된다.",
          "user_impact": "이전 코드가 계속 유효할 것이라고 오해하지 않고 새 코드 생성을 확인할 수 있다."
        },
        {
          "unit_id": "U04",
          "original_location": "11.916667–15.916667초, FRAME-4, 4/5",
          "original_information": "‘Recovery code created’ 화면은 코드를 안전한 곳에 저장하라고 지시한다. 이 예시에는 실제 코드가 표시되지 않는다고 명시하며 ‘I saved my code’를 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 5, Step 4",
          "alternative_information": "복구 코드 생성 상태, 안전한 보관 지시, 이 예시에는 실제 코드가 없다는 안내 및 ‘I saved my code’를 선택하라는 설명이 있다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-4",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "원본에 실제 복구 코드 값은 없으며 대안도 예시의 성격과 저장 확인 단계를 명시한다.",
          "interpretation": "보관 행동과 예시의 한계가 보존된다. 반복된 가상 예시 머리말을 그대로 복제하지 않아도 해당 단계의 설명이 필요한 문맥을 전달한다.",
          "user_impact": "보관 필요성을 이해하고, 실제 코드가 보이지 않는 것을 누락이나 실제 계정 처리로 오해하지 않을 수 있다."
        },
        {
          "unit_id": "U05",
          "original_location": "15.916667–19.916667초, FRAME-5, 5/5",
          "original_information": "‘Complete’ 화면은 새 복구 코드가 준비되었고 이전 코드는 더 이상 사용할 수 없다고 알리며 ‘Return to settings’를 제시한다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 6, Step 5",
          "alternative_information": "완료 상태, 새 코드 준비 및 이전 코드 사용 불가를 설명하고 ‘Return to settings’를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "ALT-V"
          ],
          "observation": "완료 결과와 이전 코드의 최종 상태 및 설정으로 돌아가는 선택 대상이 모두 대응한다.",
          "interpretation": "이용자가 알아야 할 최종 상태와 후속 선택이 동등하다.",
          "user_impact": "절차 완료 여부와 사용할 수 있는 코드의 상태를 동일하게 판단할 수 있다."
        },
        {
          "unit_id": "U06",
          "original_location": "0–19.916667초, FRAME-1부터 FRAME-5까지의 순서 및 1/5–5/5 표시",
          "original_information": "복구 코드 안내는 계정 설정, 보안, 계속하기 전 경고, 생성·보관, 완료의 다섯 상태를 이 순서로 보여 준다. 영상은 안내 화면의 전환이며 실제 계정 조작을 보여 주는 것은 아니다.",
          "alternative_id": "ALT-V",
          "alternative_location": "문단 2–6, Step 1–Step 5 전체",
          "alternative_information": "동일한 다섯 상태를 번호가 있는 단계로 제공하며 각 상태에서 선택할 대상을 명시한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-V",
            "FRAME-1",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "FRAME-5",
            "ALT-V"
          ],
          "observation": "원본의 단계 번호 및 화면 순서와 대안의 단계 번호 및 설명 순서가 일치한다.",
          "interpretation": "의미 있는 순서와 상태 변화가 보존된다. 정적 화면의 표시 시간이나 장식적 배치를 그대로 재현할 필요는 없다.",
          "user_impact": "영상 없이도 경고를 확인한 뒤 생성·보관·완료로 이어지는 절차를 이해할 수 있다."
        }
      ],
      "reason": "원본은 음소거된 동기화 매체가 아니라 음성 트랙이 없는 사전 제작 영상 전용이다. 예외 주장은 없으며 예외에 의존하지 않았다. 전체 원본의 필요한 내용을 동일 프레임 그룹 기록과 실제 이미지로 확인했고, 실제 제공된 ALT-V와 대조한 결과 의미 있는 누락이나 왜곡이 없다. 충분한 텍스트 대안 하나로 이 기준을 충족하므로 별도의 음성 대안을 추가로 요구하지 않는다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "현재 증거에서 필수 수정 사항은 없다. 원본을 변경할 때 로그인 조건, 이전 코드 무효화 경고, 안전한 보관, 실제 코드 미표시 안내 및 완료 결과를 ALT-V에도 함께 반영한다.",
          "owner_role": "콘텐츠 담당",
          "retest": "동일 페이지 초기 상태에서 변경된 원본의 전체 구간과 실제 연결된 대안 본문을 다시 비교한다. 정적 프레임 그룹 구조가 유지되지 않으면 현재의 전체 구간 확인 방법을 그대로 적용하지 않는다."
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
      "reason": "플레이어 키보드 조작과 다른 접근성 요구는 지정 범위 밖이며 이 판정에서 확인하지 않았다."
    }
  ],
  "next_checks": [
    {
      "action": "원본 또는 대안이 개정되면 원본 판본·트랙 구성·길이와 대안 연결 관계를 다시 확인하고 전체 내용을 재비교한다.",
      "reason": "현재 pass는 지정된 원본 SHA-256과 ALT-V fixture-v1에 한정된다."
    },
    {
      "action": "향후 영상에 의미 있는 음성이 추가되면 동기화 매체 여부를 재분류하고 관련 1.2.x 기준을 별도로 평가한다.",
      "reason": "현재 대상은 영상 전용이며 동기화 매체 기준의 충족 여부는 판단하지 않았다."
    }
  ]
}