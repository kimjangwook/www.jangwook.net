{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K79/index.html",
    "states": [
      "도움말 article의 초기 상태. 제공된 페이지 기록과 텍스트 대안 본문을 검토했으며, 원본 미디어 내용은 확인하지 못함."
    ],
    "media_ids": [
      "M-A"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "지정한 article 초기 상태 밖의 페이지와 콘텐츠",
      "플레이어 키보드 접근성, 자막 및 다른 WCAG 성공 기준",
      "외부 계정 및 실제 사용자 계정",
      "직접 청취, 연속 재생, 스크린 리더 사용 및 추가 자료 수집"
    ],
    "execution": "partial",
    "decision": "inconclusive",
    "reason": "제공된 PAGE-K79 기록에 따르면 지정 범위의 대상 목록은 완전하며 M-A와 ALT-A의 연결 및 대안 본문이 확인된다. 그러나 ERR-A에는 원본 디코딩 실패와 처리된 프레임·샘플이 없다는 기록이 있고, 독립된 원본 관찰 자료도 없다. 따라서 실제 매체 분류와 전체 원본에 대한 대안의 동등성을 확인할 수 없다. 확인된 실패는 없지만 충족이나 해당 없음으로 판정할 근거도 부족하다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K79",
      "kind": "파생: 페이지 수집 기록",
      "processed_ranges": [],
      "limitations": [
        "입력에 포함된 페이지 기록을 검토했다. 평가자가 로컬 URL을 직접 열거나 DOM을 다시 수집하지 않았다.",
        "기록상 Chromium으로 실제 로컬 HTML과 제공된 대안 목적지를 읽었으며, 목록 수집 범위는 article 초기 상태의 미디어와 대안으로 한정된다.",
        "수집 시각은 2026-10-04T12:04:54.613330+00:00이다."
      ]
    },
    {
      "evidence_id": "MEDIA-A",
      "kind": "원본 식별·메타데이터 기록",
      "processed_ranges": [],
      "limitations": [
        "원본 출처는 local fixture assets/corrupt.wav이다. 원본 파일 자체를 이 평가에서 열거나 청취하지 않았다.",
        "제공된 길이는 19.06775초이다. 성공한 디코딩으로 재확인한 길이는 아니다.",
        "제공된 SHA-256은 98cb16d40b9224eb55c638df4a817ae3fae4b8ae6ae36fd61116691a56e923d9이다.",
        "사전 제작 음성 전용으로 선언되어 있으나 실제 트랙 구성과 내용은 확인되지 않았다."
      ]
    },
    {
      "evidence_id": "ALT-A",
      "kind": "대안: 텍스트",
      "processed_ranges": [],
      "limitations": [
        "fixture-v1의 paragraph 1 전체 본문을 입력 자료에서 검토했다.",
        "실제 제공 및 열람 여부는 PAGE-K79와 ALT-A의 수집 기록에 근거한다. 평가자가 목적지를 직접 다시 열지는 않았다.",
        "원본에서 독립적으로 관찰한 자료가 아니므로 원본 내용이나 동등성을 입증하는 데 사용할 수 없다.",
        "시간 기반 대안이 아니므로 원본 coverage에 합산할 시간 구간이 없다."
      ]
    },
    {
      "evidence_id": "ERR-A",
      "kind": "파생: 원본 처리 오류 기록",
      "processed_ranges": [],
      "limitations": [
        "제공된 ffmpeg 실행 기록을 검토했으며 이 평가에서 ffmpeg를 다시 실행하지 않았다.",
        "종료 코드는 183이고 입력 데이터 오류로 파일을 열지 못했다.",
        "기록상 디코딩된 미디어 프레임이나 샘플은 없다.",
        "수집기 목록에 ffprobe와 faster-whisper base.en이 기재되어 있지만, 성공한 트랙 분석이나 ASR 결과는 제공되지 않았다."
      ]
    }
  ],
  "media": [
    {
      "media_id": "M-A",
      "classification": "unknown",
      "classification_evidence_ids": [
        "MEDIA-A",
        "ERR-A"
      ],
      "original_version": "제공된 SHA-256: 98cb16d40b9224eb55c638df4a817ae3fae4b8ae6ae36fd61116691a56e923d9; 출처: local fixture assets/corrupt.wav; 별도 판본명은 없음",
      "duration": 19.06775,
      "execution": "error",
      "decision": "inconclusive",
      "exception": {
        "claimed": false,
        "verified": false,
        "no_extra_information": null,
        "clearly_labeled": null,
        "evidence_ids": []
      },
      "coverage": {
        "processed_ranges": [],
        "unreviewed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 19.06775,
            "evidence_ids": [
              "MEDIA-A",
              "ERR-A"
            ],
            "reason": "제공된 길이를 기준으로 원본 전체가 미검토 상태이다. ffmpeg가 입력을 열지 못해 디코딩된 프레임·샘플이 없고, 독립된 원본 내용 관찰 기록도 없다. 끝 경계는 제공된 메타데이터에 근거하며 성공한 디코딩으로 재확인되지 않았다."
          }
        ],
        "complete": false
      },
      "alternatives": [
        {
          "alternative_id": "ALT-A",
          "kind": "text",
          "relation_evidence_ids": [
            "PAGE-K79",
            "ALT-A"
          ],
          "actually_observed": true,
          "location": "M-A에 연결된 텍스트 대안의 paragraph 1; 별도 목적지 URL은 제공되지 않음",
          "version": "fixture-v1"
        }
      ],
      "comparisons": [],
      "reason": "ALT-A 본문에는 로그인 전제조건, Account settings에서 Security로 이동해 Create recovery code를 선택하는 순서, 새 코드가 이전 코드를 무효화한다는 경고, 확인·안전한 저장·완료 및 결과 설명이 있다. 그러나 이는 대안에서만 확인한 내용이다. 원본에서 관찰한 정보 단위가 없어 대화·화자·의미 있는 소리·조건·순서·결과와 대안을 비교할 수 없으므로 comparisons는 비워 두었다. 디코딩 오류만으로 대안의 누락이나 왜곡을 단정하지 않으며, 대안 본문의 존재만으로 충족도 판정하지 않는다. 예외 주장은 없고, 원본과 기존 텍스트의 관계 역시 검증되지 않았다.",
      "missing_evidence": [
        "원본이 실제로 사전 제작 음성 전용인지 확인할 트랙 구성 및 콘텐츠 관찰 자료",
        "원본 전체의 발화, 화자, 이해에 필요한 소리와 정보 순서를 확인할 독립된 관찰 기록",
        "제공된 원본 길이와 전체 처리 범위를 성공한 디코딩으로 확인한 기록",
        "원본 정보 단위와 ALT-A paragraph 1을 연결한 동등성 비교 근거"
      ],
      "recommendations": [
        {
          "change": "assets/corrupt.wav의 손상 여부와 배포 파일을 확인하고, 의도한 원본을 디코딩 가능한 형태로 복원하거나 교체한다. 변경 전후 파일 식별값과 판본을 기록한다. 현재 증거만으로 특정 발화나 정보를 복원 대상으로 지정할 수는 없다.",
          "owner_role": "미디어 제작 담당 및 개발 담당",
          "retest": "같은 도움말 페이지의 초기 상태에서 실제 제공되는 파일을 확인하고, 전체 길이와 트랙 구성을 수집한다. 복원 파일이 새 판본이면 기존 해시와 구분한 뒤 처음부터 끝까지 다시 검토한다."
        },
        {
          "change": "원본을 확인한 후 ALT-A가 의미 있는 발화·화자·소리, 전제조건, 단계 순서, 경고와 완료 결과를 모두 동등하게 전달하는지 대조한다. 실제 누락이나 왜곡이 확인될 때 해당 부분을 수정한다.",
          "owner_role": "콘텐츠 담당 및 접근성 검토 담당",
          "retest": "확인된 원본 전체와 실제 제공되는 ALT-A의 최신 본문을 정보 단위별로 비교하고, 원본 위치·대안 문단·사용자에게 미치는 차이를 기록한다."
        }
      ]
    }
  ],
  "errors": [
    {
      "evidence_id": "ERR-A",
      "media_id": "M-A",
      "tool": "ffmpeg",
      "exit_code": 183,
      "error": "입력 데이터 오류(Invalid data found when processing input)로 /Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/assets/corrupt.wav 파일을 열지 못함.",
      "actual_processing": "디코딩된 미디어 프레임이나 샘플 없음.",
      "impact": "원본의 실제 분류 및 전체 내용 관찰이 차단되어 대안과의 동등성 판정이 불가능함."
    }
  ],
  "unreviewed_media": [
    {
      "media_id": "M-A",
      "evidence_ids": [
        "MEDIA-A",
        "ERR-A"
      ],
      "reason": "목록과 대안은 검토했으나 원본 내용은 전체 미검토 상태이다. 해당 대상은 media에도 판단 유보 및 오류 상태로 보존했다."
    }
  ],
  "other_checks": [
    {
      "check": "파일 손상 또는 재생 불가 문제",
      "reason": "ffmpeg 처리 실패는 확인되지만 브라우저 재생 실패나 사용자 경험은 직접 관찰하지 않았다. 파일 제공·재생 문제의 확인은 대안 동등성 평가와 구분한다."
    },
    {
      "check": "음성과 영상이 함께 있는 것으로 확인될 경우",
      "reason": "해당 미디어 유형에 적용되는 WCAG 1.2.2, 1.2.3, 1.2.5 등을 각 적용 조건에 따라 별도로 검토한다. 현재는 실제 구성이 확인되지 않았다."
    }
  ],
  "next_checks": [
    "현재 허용 범위에서는 추가 도구 실행이나 외부 열람을 하지 않는다. 디코딩 가능한 원본 및 독립된 전체 관찰 기록을 확보한 뒤 재평가한다.",
    "성공한 처리 구간과 실제 내용 관찰 구간을 각각 기록하고, 양쪽에서 확인되는 구간만 coverage.processed_ranges에 포함한다.",
    "원본 전체와 ALT-A의 실제 제공 본문을 비교한 후 지정 범위의 판정을 갱신한다. 재점검 결과도 전체 사이트의 적합성이나 모델 정확도 인증으로 확대하지 않는다."
  ]
}