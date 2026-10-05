{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K91/index.html",
    "states": [
      "기사 초기 상태: 제공된 페이지 수집 기록, 영상의 전체 정적 상태 시퀀스 및 연결된 음성 대안의 파생 관찰 기록을 평가"
    ],
    "media_ids": [
      "M-V"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "전체 사이트의 WCAG 적합성 및 모델 정확도 인증",
      "플레이어 키보드 조작, 자막 및 다른 WCAG 성공 기준",
      "외부 또는 실제 사용자 계정 조작",
      "직접 음성 청취, 연속 영상 재생 및 스크린 리더 사용",
      "제공 자료 밖의 추가 탐색·수집·폼 제출·소스 수정"
    ],
    "execution": "complete",
    "decision": "pass",
    "reason": "지정 범위의 목록은 PAGE-K91에서 완전한 것으로 기록되어 있으며, 적용 대상은 사전 제작 영상 전용 M-V 하나이다. 원본의 239개 디코딩 프레임이 다섯 동일 프레임 그룹으로 구성된다는 OBS-V와 실제 첨부 이미지 FRAME-1~FRAME-5를 함께 확인하여 전체 내용의 공백 없이 비교했다. 제공된 음성 대안 ALT-AD의 독립 ASR 기록 OBS-AD에는 사전 조건, 다섯 단계의 순서와 선택 대상, 기존 코드 무효화 경고, 안전한 저장, 실제 코드가 없는 예시라는 설명 및 완료 결과가 보존되어 있다. 영상 전용에는 충분한 음성 대안 경로 하나로 이 기준을 충족할 수 있으므로 별도 전사문 부재는 실패 사유가 아니다. 이 판정은 제공된 증거와 지정 상태에 한정한다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K91",
      "kind": "파생 페이지 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "Chromium으로 실제 로컬 HTML 및 대안 목적지를 읽었다는 제공된 수집 기록을 사용했다.",
        "수집 시각은 2026-10-04T12:04:54.613330+00:00이다.",
        "평가자가 URL을 새로 열거나 DOM·대안 링크를 직접 조작한 것은 아니다.",
        "목록의 완전성은 기사 초기 상태와 미디어·제공 대안 범위에만 적용한다."
      ]
    },
    {
      "evidence_id": "MEDIA-V",
      "kind": "원본 식별 및 트랙 검사 기록",
      "processed_ranges": [],
      "limitations": [
        "원본 위치는 local fixture assets/silent-guide.mp4이다.",
        "SHA-256: 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d.",
        "제공된 ffprobe 검사 기록은 영상 트랙만 있고 오디오 트랙은 없음을 확인한다.",
        "평가자가 MP4를 직접 재생하거나 ffprobe를 실행하지는 않았다."
      ]
    },
    {
      "evidence_id": "OBS-V",
      "kind": "원본 영상의 파생 전체 디코딩 및 동일 프레임 검증 기록",
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
          "reason": "ffmpeg 디코딩 및 framemd5 기록의 239개 프레임 전체가 첨부된 다섯 대표 PNG의 동일 프레임 그룹에 속한다."
        }
      ],
      "limitations": [
        "12 fps의 통제된 다섯 정적 상태 영상에 한해 대표 이미지와 전체 동일 프레임 기록을 결합했다.",
        "임의 영상의 일부 샘플 이미지로 전체 구간을 추정한 것이 아니다.",
        "실제 계정 조작은 없고 안내 화면과 순서 있는 상태 전환만 있다."
      ]
    },
    {
      "evidence_id": "FRAME-1",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 3.9166666666666665,
          "evidence_ids": [
            "FRAME-1",
            "OBS-V"
          ],
          "reason": "실제 첨부 이미지의 화면 문구와 버튼을 읽었으며 OBS-V가 해당 그룹 전체의 동일성을 보장한다."
        }
      ],
      "limitations": [
        "대표 이미지 한 장의 내용 관찰이며 구간 확장은 OBS-V의 동일 프레임 검증에 근거한다."
      ]
    },
    {
      "evidence_id": "FRAME-2",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 3.9166666666666665,
          "end_seconds": 7.916666666666667,
          "evidence_ids": [
            "FRAME-2",
            "OBS-V"
          ],
          "reason": "실제 첨부 이미지의 화면 문구와 버튼을 읽었으며 OBS-V가 해당 그룹 전체의 동일성을 보장한다."
        }
      ],
      "limitations": [
        "대표 이미지 한 장의 내용 관찰이며 구간 확장은 OBS-V의 동일 프레임 검증에 근거한다."
      ]
    },
    {
      "evidence_id": "FRAME-3",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 7.916666666666667,
          "end_seconds": 11.916666666666666,
          "evidence_ids": [
            "FRAME-3",
            "OBS-V"
          ],
          "reason": "실제 첨부 이미지의 경고와 버튼을 읽었으며 OBS-V가 해당 그룹 전체의 동일성을 보장한다."
        }
      ],
      "limitations": [
        "대표 이미지 한 장의 내용 관찰이며 구간 확장은 OBS-V의 동일 프레임 검증에 근거한다."
      ]
    },
    {
      "evidence_id": "FRAME-4",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 11.916666666666666,
          "end_seconds": 15.916666666666666,
          "evidence_ids": [
            "FRAME-4",
            "OBS-V"
          ],
          "reason": "실제 첨부 이미지의 저장 안내, 예시 설명 및 버튼을 읽었으며 OBS-V가 해당 그룹 전체의 동일성을 보장한다."
        }
      ],
      "limitations": [
        "대표 이미지 한 장의 내용 관찰이며 구간 확장은 OBS-V의 동일 프레임 검증에 근거한다."
      ]
    },
    {
      "evidence_id": "FRAME-5",
      "kind": "원본에서 추출된 파생 PNG 첨부",
      "processed_ranges": [
        {
          "start_seconds": 15.916666666666666,
          "end_seconds": 19.916667,
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "MEDIA-V"
          ],
          "reason": "실제 첨부 이미지의 완료 결과와 버튼을 읽었다. 동일 프레임 그룹 끝과 원본 길이의 소수 표기 차이는 반올림 차이로 처리했다."
        }
      ],
      "limitations": [
        "대표 이미지 한 장의 내용 관찰이며 구간 확장은 OBS-V의 동일 프레임 검증에 근거한다.",
        "그룹 끝 19.916666666666668초와 원본 길이 19.916667초의 표기 차이는 프레임 누락 근거가 아니다."
      ]
    },
    {
      "evidence_id": "ALT-AD",
      "kind": "실제 제공된 음성 대안의 식별 및 관찰 기록",
      "processed_ranges": [],
      "limitations": [
        "판본은 fixture-v1이고 파일은 video-audio-alternative.wav이다.",
        "SHA-256: 07649b74ad5ef6b570269def6e87803362bcf350a0dcba4663ebf55a35eb5943.",
        "길이는 36.167125초이다.",
        "제공 자료에는 actually_observed=true로 기록되어 있다. 평가자는 직접 청취하지 않고 OBS-AD로 내용을 비교했다.",
        "별도 텍스트 대안은 제공되지 않는다."
      ]
    },
    {
      "evidence_id": "OBS-AD",
      "kind": "음성 대안의 파생 독립 ASR 기록",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 36.167125,
          "evidence_ids": [
            "OBS-AD",
            "ALT-AD"
          ],
          "reason": "faster-whisper base.en, CPU int8로 실제 WAV 전체를 독립 처리한 기록이다. 제공된 발화 세그먼트는 0~36.04초에 걸쳐 있다."
        }
      ],
      "limitations": [
        "제작 대본이나 대안 텍스트를 ASR에 공급하지 않았고 초기 프롬프트도 사용하지 않았다는 기록에 근거한다.",
        "ASR 전사는 직접 청취가 아니며 단어 오인식이나 소리 누락 가능성이 있다.",
        "일반적인 비언어 소리 및 화자 분리 검증은 수행되지 않았다.",
        "제공 기록상 단일 합성 화자의 명료한 발화이며 의도된 정보성 비언어 소리는 없다.",
        "대안 음성의 처리 범위는 원본 영상 coverage에 합산하지 않는다."
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
      "original_version": "SHA-256: 72f45aeff3c1c26090c4c2e68e0ae5a33f9706d4a8807d939e47a54132db0e1d",
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
            "end_seconds": 3.9166666666666665,
            "evidence_ids": [
              "OBS-V",
              "FRAME-1"
            ],
            "reason": "전체 디코딩의 첫 동일 프레임 그룹과 실제 PNG를 대조하여 사전 조건 및 첫 선택 대상을 확인했다."
          },
          {
            "start_seconds": 3.9166666666666665,
            "end_seconds": 7.916666666666667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-2"
            ],
            "reason": "둘째 동일 프레임 그룹과 실제 PNG를 대조하여 복구 코드의 목적 및 생성 선택을 확인했다."
          },
          {
            "start_seconds": 7.916666666666667,
            "end_seconds": 11.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-3"
            ],
            "reason": "셋째 동일 프레임 그룹과 실제 PNG를 대조하여 이전 코드 무효화 경고 및 확인 선택을 확인했다."
          },
          {
            "start_seconds": 11.916666666666666,
            "end_seconds": 15.916666666666666,
            "evidence_ids": [
              "OBS-V",
              "FRAME-4"
            ],
            "reason": "넷째 동일 프레임 그룹과 실제 PNG를 대조하여 생성 상태, 안전한 저장, 실제 코드 없는 예시 및 저장 확인 선택을 확인했다."
          },
          {
            "start_seconds": 15.916666666666666,
            "end_seconds": 19.916667,
            "evidence_ids": [
              "OBS-V",
              "FRAME-5",
              "MEDIA-V"
            ],
            "reason": "마지막 동일 프레임 그룹과 실제 PNG를 대조하여 완료 결과 및 설정 복귀 선택을 확인했다. 원본 길이와 그룹 끝의 소수 반올림 차이는 실질적 공백이 아니다."
          }
        ],
        "unreviewed_ranges": [],
        "complete": true
      },
      "alternatives": [
        {
          "alternative_id": "ALT-AD",
          "kind": "audio",
          "relation_evidence_ids": [
            "PAGE-K91",
            "ALT-AD"
          ],
          "actually_observed": true,
          "location": "PAGE-K91에서 M-V에 연결된 대안; 제공 기록의 파일명 video-audio-alternative.wav",
          "version": "fixture-v1; SHA-256: 07649b74ad5ef6b570269def6e87803362bcf350a0dcba4663ebf55a35eb5943"
        }
      ],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "0~3.9166666666666665초, FRAME-1, 1/5",
          "original_information": "Account settings 화면은 복구 코드를 만들기 전에 로그인해야 한다고 안내하며 Open Security를 선택 대상으로 제시한다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 0~11.6초의 발화 세그먼트 중 Step 1 부분",
          "alternative_information": "1단계 계정 설정에서 복구 코드 생성 전에 로그인해야 한다는 조건과 Open Security 선택을 설명한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "첨부 이미지의 조건·화면 제목·버튼을 읽고 독립 ASR의 첫 단계 발화와 대조했다. ASR 세그먼트는 첫 단계와 둘째 단계 경계를 함께 포함한다.",
          "interpretation": "사전 조건과 다음 행동이 같은 의미로 보존되며 첫 단계라는 순서도 전달된다.",
          "user_impact": "로그인이 필요하다는 조건과 보안 화면으로 이동하는 선택을 동일하게 알 수 있다."
        },
        {
          "unit_id": "U02",
          "original_location": "3.9166666666666665~7.916666666666667초, FRAME-2, 2/5",
          "original_information": "Security 화면은 복구 코드가 계정 접근 복원에 도움이 된다고 설명하고 Create recovery code를 제시한다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 5.36~17.240000000000002초의 발화 세그먼트 중 Step 2 부분",
          "alternative_information": "2단계 Security에서 복구 코드가 계정 접근을 복원한다고 설명하고 Create recovery code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-2",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "원본의 목적 설명 및 생성 버튼이 ASR에 대응한다. 인용 범위는 인접 단계 일부도 포함하는 세그먼트 경계이다.",
          "interpretation": "이 안내 문맥에서 계정 접근 복원이라는 목적과 생성 행동이 보존된다.",
          "user_impact": "복구 코드의 용도와 생성 절차를 이해하는 데 필요한 정보 차이가 확인되지 않았다."
        },
        {
          "unit_id": "U03",
          "original_location": "7.916666666666667~11.916666666666666초, FRAME-3, 3/5",
          "original_information": "Before you continue 화면은 새 복구 코드를 만들면 이전 코드를 사용할 수 없게 된다고 경고하고 Confirm new code를 제시한다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 11.6~23.64초의 발화 세그먼트 중 Step 3 부분",
          "alternative_information": "3단계 Before you continue에서 새 코드가 이전 코드를 사용할 수 없게 만든다고 경고하고 Confirm new code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-3",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "이전 코드 무효화라는 부정적 결과와 확인 선택이 ASR에 명시되어 있다.",
          "interpretation": "사용자의 진행 판단에 중요한 경고가 확인 행동 앞에 보존된다.",
          "user_impact": "새 코드 생성으로 이전 코드가 무효화되는 결과를 알고 진행 여부를 판단할 수 있다."
        },
        {
          "unit_id": "U04",
          "original_location": "11.916666666666666~15.916666666666666초, FRAME-4, 4/5",
          "original_information": "Recovery code created 화면은 코드를 안전한 곳에 저장하라고 안내하고 이 예시는 실제 코드를 보여 주지 않는다고 명시한다. 선택 대상은 I saved my code이다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 17.240000000000002~33.4초의 발화 세그먼트 중 Step 4 부분",
          "alternative_information": "4단계 Recovery code created에서 안전하게 저장하라고 안내하고 이 예시에 실제 코드가 없다고 설명한 뒤 I saved my code를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-4",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "저장 지시, 실제 코드가 없다는 부정문 및 저장 확인 버튼의 의미가 모두 ASR에 나타난다.",
          "interpretation": "생성 후 해야 할 일과 예시의 한계가 보존된다. 원본에 실제 복구 코드가 표시되지 않으므로 대안에 코드 값을 추가할 필요가 없다.",
          "user_impact": "코드를 안전하게 보관해야 함을 알 수 있고 예시를 실제 발급 코드로 오해하지 않도록 하는 정보가 전달된다."
        },
        {
          "unit_id": "U05",
          "original_location": "15.916666666666666~19.916667초, FRAME-5, 5/5",
          "original_information": "Complete 화면은 새 복구 코드가 준비되었고 이전 코드는 더 이상 사용할 수 없다고 안내한다. 선택 대상은 Return to settings이다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 28.32~36.04초의 발화 세그먼트 중 Step 5 부분",
          "alternative_information": "5단계 Complete에서 새 코드가 준비되었고 이전 코드는 더 이상 사용할 수 없다고 설명하고 Return to settings를 선택하도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-5",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "완료 상태, 새 코드 준비, 이전 코드 사용 불가 및 설정 복귀 선택이 ASR에 대응한다.",
          "interpretation": "마지막 단계의 결과와 다음 선택이 보존된다.",
          "user_impact": "절차가 완료되었으며 이전 코드를 사용할 수 없다는 결과를 동일하게 이해할 수 있다."
        },
        {
          "unit_id": "U06",
          "original_location": "0~19.916667초, FRAME-1~FRAME-5의 공통 안내 문구와 1/5~5/5 상태 전환",
          "original_information": "공통 문구는 로컬 가상 계정 도움말 및 복구 코드 안내임을 표시한다. 화면은 계정 설정, 보안, 진행 전 경고, 코드 생성, 완료 순서로 전환하며 별도의 실제 계정 상호작용은 없다.",
          "alternative_id": "ALT-AD",
          "alternative_location": "OBS-AD 0~36.04초의 전체 발화; 예시 설명은 Step 4 부분",
          "alternative_information": "복구 코드 안내를 Step 1부터 Step 5까지 같은 순서로 설명하고 각 화면 제목과 선택 대상을 전달한다. 실제 코드를 보여 주지 않는 예시임을 설명한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "FRAME-1",
            "FRAME-2",
            "FRAME-3",
            "FRAME-4",
            "FRAME-5",
            "OBS-V",
            "ALT-AD",
            "OBS-AD"
          ],
          "observation": "공통 머리말은 그대로 낭독되지 않지만 복구 코드 안내라는 주제, 예시라는 문맥 및 다섯 단계의 순서가 전달된다. 상태 전환 사이에 추가 내용이 없다는 근거는 전체 동일 프레임 그룹 기록이다.",
          "interpretation": "이용 목적에 필요한 문맥과 절차의 순서·변화가 보존된다. 영상과 대안의 길이가 다르다는 사실만으로 동등성이 훼손되지는 않는다.",
          "user_impact": "가상 예시의 복구 코드 생성 절차를 같은 순서로 학습할 수 있으며 실제 계정 작업을 수행한 것으로 판단할 근거는 없다."
        }
      ],
      "reason": "원본은 플레이어가 음소거된 동기화 매체가 아니라 오디오 트랙이 없는 사전 제작 영상이다. 전체 프레임의 동일 그룹 검증과 다섯 실제 첨부 이미지로 필요한 원본 내용을 모두 확인했다. PAGE-K91은 M-V와 ALT-AD의 제공 관계를 기록하고, ALT-AD 및 OBS-AD는 실제 음성 파일의 판본과 독립 처리 내용을 제공한다. 단계별 필요한 정보는 음성 대안에 동등하게 전달된다. 기존 텍스트 대안 예외는 주장되지 않았으며 판정에 사용하지 않았다. 직접 청취나 일반적인 음향 검증을 수행한 것은 아니지만, 이 통제된 단일 화자 자료의 제공된 독립 ASR 및 제한 기록으로 필요한 발화 내용을 비교할 수 있었다. 별도 텍스트가 없다는 이유로 영상의 음성 대안에 이 기준을 재귀적으로 적용하지 않는다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "이 기준에 따른 필수 수정은 확인되지 않았다. 선택적 개선으로 현재 음성 설명과 동등한 단계별 텍스트를 추가할 수 있으나, 이는 이번 pass 판정의 최소 요구가 아니다.",
          "owner_role": "콘텐츠 담당",
          "retest": "텍스트를 추가하면 같은 페이지 상태에서 M-V 전체 다섯 상태의 조건·경고·선택·결과와 새 텍스트를 대조하고 대안 연결을 확인한다."
        },
        {
          "change": "원본 또는 음성 대안이 변경되면 두 파일의 판본 식별 정보를 갱신하고 단계별 의미 대응을 다시 확인한다.",
          "owner_role": "콘텐츠 및 미디어 제작 담당",
          "retest": "현재 조건에서는 원본 0~19.916667초와 대안 0~36.167125초를 각각 별도로 재검토한다. 변경된 판본은 새 전체 길이와 프레임·발화 기록을 사용하고, ASR이 모호한 부분은 허용된 직접 청취로 확인한다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "criterion": "별도 WCAG 검토",
      "observation": "플레이어 키보드 접근성, 컨트롤의 이름·역할 및 기타 인터페이스 요구사항은 이번 범위에서 평가하지 않았다.",
      "recommendation": "필요하면 별도 평가 범위를 설정한다. 이 결과를 다른 성공 기준의 충족 근거로 사용하지 않는다."
    },
    {
      "criterion": "다른 미디어 성공 기준",
      "observation": "현재 M-V는 영상 전용이다. 향후 원본에 음성이 추가되어 영상과 음성이 함께 있는 매체가 되면 분류와 적용 기준이 달라진다.",
      "recommendation": "변경 시 사전 제작 동기화 매체에 적용되는 1.2.2 및 1.2.3 등을 별도로 검토한다."
    }
  ],
  "next_checks": [
    "자료·페이지 상태가 유지되는 한 1.2.1 판정을 완료하기 위한 필수 추가 수집은 없다.",
    "실행 영수증의 모델명은 입력에 포함되지 않아 기록하지 않았다. 이번 평가에서 사용할 수 있었던 입력은 텍스트 기록과 실제 PNG 첨부이며 추가 수집 도구는 사용하지 않았다.",
    "확장 평가나 판본 변경 시 목록 수집 범위, 원본 분류, 대안 연결 및 전체 내용 대응을 다시 확인한다."
  ]
}