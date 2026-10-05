{
  "criterion": "1.2.1",
  "level": "A",
  "prompt_version": "0.2.0",
  "scope": {
    "url": "file:///Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/cases/K42/index.html",
    "states": [
      "도움말 article의 초기 상태. 제공된 페이지 수집 기록, 원본 관찰 파생 기록 및 실제 텍스트 대안 본문을 검토함."
    ],
    "media_ids": [
      "M-A"
    ],
    "inventory_complete_within_scope": true,
    "exclusions": [
      "플레이어 키보드 조작, 자막 및 다른 WCAG 성공 기준",
      "외부 또는 실제 사용자 계정",
      "지정 상태 밖의 페이지와 전체 사이트 적합성",
      "직접 청취, 연속 재생, 스크린리더 사용 및 추가 자료 수집",
      "잡음, 다중 화자 및 의미 있는 비음성 소리가 포함된 콘텐츠에 대한 일반화"
    ],
    "execution": "complete",
    "decision": "pass",
    "reason": "지정 범위의 목록이 완전하다는 PAGE-K42 기록과 대상 목록에 따라 적용 대상은 사전 제작 음성 전용 M-A 한 개이다. 독립 ASR 및 통제된 단일 화자·발화 전용 원본의 전체 의미 검증 기록 OBS-A를 실제 제공된 ALT-A 본문과 비교했다. 로그인 전제조건, 조작 순서, 이전 코드 무효화 경고, 확인·보관 단계 및 완료 상태가 동등하게 전달된다. 판정은 제공된 고정 증거에 한정하며 전체 사이트 적합성이나 모델 정확도를 인증하지 않는다."
  },
  "input_used": [
    {
      "evidence_id": "PAGE-K42",
      "kind": "파생: 실제 페이지와 대안 목적지를 수집한 기록",
      "source": "지정된 로컬 index.html",
      "collection_method": "제공된 기록상 Chromium으로 실제 HTML을 파싱하고 모든 제공 대안 목적지 본문을 읽음",
      "collected_at": "2026-10-04T12:04:54.613330+00:00",
      "processed_ranges": [],
      "limitations": [
        "이번 평가는 입력에 포함된 수집 기록을 읽었으며 URL을 직접 열지 않았다.",
        "목록 완전성은 article 초기 상태의 미디어 내용과 제공 대안 범위에 한정된다."
      ]
    },
    {
      "evidence_id": "MEDIA-A",
      "kind": "원본 식별·분류 기록: 원본 파일 자체는 직접 처리하지 않음",
      "source": "local fixture assets/audio-guide.wav",
      "version": "sha256:dedf1311f1d36b44b20d8e6f509a8f4531460412d65ee8ce56ba51a30de9f4b5",
      "processed_ranges": [],
      "limitations": [
        "원본 길이는 19.06775초로 제공되었다.",
        "사전 제작, 음성 트랙만 존재, 합성 단일 화자, 발화 전용이며 의도된 정보성 비음성 소리나 다른 트랙이 없다는 분류 관찰 기록을 사용했다.",
        "이번 평가 환경은 텍스트와 PNG 입력만 지원하며 원본 WAV를 직접 듣거나 디코딩하지 않았다."
      ]
    },
    {
      "evidence_id": "OBS-A",
      "kind": "파생: 원본 WAV의 독립 ASR 및 통제된 원본 발화 검증 기록",
      "source": "audio-guide.wav",
      "version": "원본 sha256:dedf1311f1d36b44b20d8e6f509a8f4531460412d65ee8ce56ba51a30de9f4b5",
      "collection_method": "faster-whisper / base.en / CPU int8. 제작 대본, 대안 및 초기 프롬프트를 ASR에 제공하지 않은 독립 처리",
      "processed_ranges": [
        {
          "start_seconds": 0,
          "end_seconds": 19.06775,
          "evidence_ids": [
            "OBS-A"
          ],
          "reason": "기록된 ASR 전체 처리 범위. 발화 구간 표시는 0–8초와 8–19초이며, 전체 내용 확인은 별도로 제공된 coverage_complete 및 조건·부정어를 포함한 원본 발화의 의미 검증 기록에 근거한다."
        }
      ],
      "limitations": [
        "ASR는 직접 청취가 아닌 파생 증거이며 단어 오인식이나 소리 누락 가능성이 있다.",
        "일반적인 소리 사건 또는 화자 분리 검증 기록은 아니다.",
        "전체 내용 검증 근거는 명료한 합성 단일 화자의 발화 전용 통제 자료에 한정된다.",
        "개별 단어의 시간 정보가 없어 정보 단위의 위치는 제공된 두 발화 구간 수준으로만 표시한다."
      ]
    },
    {
      "evidence_id": "ALT-A",
      "kind": "대안: 실제 제공되는 텍스트 본문",
      "source": "PAGE-K42에서 M-A에 연결된 대안의 paragraph 1",
      "version": "fixture-v1",
      "processed_ranges": [],
      "limitations": [
        "제공된 actually_observed 기록과 전체 본문을 사용했다. 이번 평가에서 목적지를 새로 열지는 않았다.",
        "ALT-A는 비교 대상이며 독립적인 원본 관찰 증거로 사용하지 않았다."
      ]
    }
  ],
  "media": [
    {
      "media_id": "M-A",
      "classification": "prerecorded_audio_only",
      "classification_evidence_ids": [
        "MEDIA-A",
        "OBS-A"
      ],
      "original_version": "sha256:dedf1311f1d36b44b20d8e6f509a8f4531460412d65ee8ce56ba51a30de9f4b5",
      "duration": 19.06775,
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
            "end_seconds": 19.06775,
            "evidence_ids": [
              "MEDIA-A",
              "OBS-A"
            ],
            "reason": "원본 전체 ASR 처리 기록과 통제된 발화 전용 자료의 전체 의미 검증 기록이 함께 제공되었다. ASR 발화 구간의 마지막 표시는 19.0초지만, 전체 길이 19.06775초에 대한 coverage_complete와 모든 조건·부정어를 포함한 원본 발화 검증이 명시되어 있다. 따라서 마지막 시간 표기 차이를 내용 미검토 구간으로 보지 않는다. 이는 처리 길이 숫자만으로 전체 관찰을 추정한 것이 아니며 직접 청취를 뜻하지 않는다."
          }
        ],
        "unreviewed_ranges": [],
        "complete": true
      },
      "alternatives": [
        {
          "alternative_id": "ALT-A",
          "kind": "text",
          "relation_evidence_ids": [
            "PAGE-K42",
            "ALT-A"
          ],
          "actually_observed": true,
          "location": "PAGE-K42에서 M-A에 연결된 텍스트 대안, paragraph 1",
          "version": "fixture-v1"
        }
      ],
      "comparisons": [
        {
          "unit_id": "U01",
          "original_location": "OBS-A, 0–8초 발화 구간",
          "original_information": "복구 코드를 만들기 전에 로그인되어 있어야 한다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 첫 문장",
          "alternative_information": "“You must be signed in.”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "독립 ASR에는 생성 전 로그인 조건이 있고, 대안은 절차 안내보다 먼저 로그인 필수 조건을 제시한다.",
          "interpretation": "‘만들기 전에’라는 표현을 그대로 반복하지 않아도 필수 조건을 첫 단계 앞에 배치하여 같은 전제조건을 전달한다.",
          "user_impact": "로그인 필요 여부나 수행 시점에 의미 있는 차이가 없다."
        },
        {
          "unit_id": "U02",
          "original_location": "OBS-A, 0–8초 발화 구간",
          "original_information": "Account settings를 열고, 이어 Security를 열고, Create recovery code를 선택한다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 두 번째 문장",
          "alternative_information": "“Open Account settings, then Security, and select Create recovery code.”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "원본 관찰 기록과 대안 모두 동일한 세 조작 대상과 순서를 제시한다.",
          "interpretation": "목적지와 실행 순서가 보존된다.",
          "user_impact": "사용자가 따라야 할 경로나 순서에 차이가 없다."
        },
        {
          "unit_id": "U03",
          "original_location": "OBS-A, 8–19초 발화 구간의 경고",
          "original_information": "새 복구 코드를 만들면 이전 코드는 사용할 수 없게 된다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 세 번째 문장",
          "alternative_information": "“A new recovery code makes the previous one unusable.”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "새 코드 생성과 이전 코드 무효화의 관계가 대안에 명시되어 있다.",
          "interpretation": "사용자의 판단에 중요한 경고와 부정 의미가 보존된다.",
          "user_impact": "이전 코드를 계속 사용할 수 있다는 잘못된 판단을 유발하는 차이가 없다."
        },
        {
          "unit_id": "U04",
          "original_location": "OBS-A, 8–19초 발화 구간의 확인 단계",
          "original_information": "새 코드를 확인한다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 네 번째 문장의 “Confirm”",
          "alternative_information": "“Confirm, save the new code safely, and finish.”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "대안은 새 복구 코드에 관한 절차의 연속 문맥에서 확인을 지시한다.",
          "interpretation": "‘Confirm’에 목적어를 반복하지 않았지만 문맥상 확인 대상은 새 코드이며, 확인 단계가 보관 단계보다 앞에 유지된다.",
          "user_impact": "확인 대상이나 단계 순서에 의미 있는 차이가 없다."
        },
        {
          "unit_id": "U05",
          "original_location": "OBS-A, 8–19초 발화 구간의 보관 단계",
          "original_information": "새 코드를 안전한 장소에 보관한다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 네 번째 문장의 “save the new code safely”",
          "alternative_information": "새 코드를 안전하게 저장하고 절차를 마치도록 안내한다.",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "원본 관찰 기록의 안전한 장소에 보관하라는 안내가 대안에서는 안전하게 저장하라는 표현으로 제공된다.",
          "interpretation": "원본에 특정 보관 위치가 지정되어 있지 않으므로 안전한 보관이라는 의미가 동등하다. 추가된 ‘finish’는 구체적인 별도 조작 대상을 지시하거나 원본 절차를 왜곡하지 않는다.",
          "user_impact": "안전한 보관 필요성에 차이가 없으며 새로운 필수 조작을 추정할 근거는 없다."
        },
        {
          "unit_id": "U06",
          "original_location": "OBS-A, 8–19초 발화 구간의 완료 상태",
          "original_information": "새 복구 코드가 준비되었다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 마지막 문장 앞부분",
          "alternative_information": "“The new code is ready”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "원본 관찰 기록과 대안 모두 새 코드의 준비 완료 상태를 알린다.",
          "interpretation": "절차의 결과가 보존된다.",
          "user_impact": "새 코드가 준비되었는지에 관한 정보 차이가 없다."
        },
        {
          "unit_id": "U07",
          "original_location": "OBS-A, 8–19초 발화 구간의 마지막 안내",
          "original_information": "이전 복구 코드는 더 이상 사용할 수 없다.",
          "alternative_id": "ALT-A",
          "alternative_location": "paragraph 1, 마지막 문장 뒷부분",
          "alternative_information": "“the previous code can no longer be used.”",
          "relation": "equivalent",
          "evidence_ids": [
            "OBS-A",
            "ALT-A"
          ],
          "observation": "완료 후 이전 코드의 사용 불가 상태가 대안에도 명시되어 있다.",
          "interpretation": "마지막 상태 안내와 핵심 부정어가 보존된다.",
          "user_impact": "완료 후 어떤 코드를 사용할 수 있는지에 관한 판단 차이가 없다."
        }
      ],
      "reason": "M-A는 사전 제작 음성 전용 콘텐츠이고, 실제 제공된 ALT-A는 전체 필요한 정보를 시간순 절차와 결과 안내로 전달한다. 동등성은 대안의 존재나 파일명만이 아니라 독립 원본 ASR 및 통제된 전체 발화 검증 기록과 본문의 대조에 근거한다. 단일 화자·발화 전용이라는 분류 및 검증 기록상 별도로 보존해야 할 화자 변화나 정보성 소리는 없다. 기존 텍스트의 대안이라는 예외는 주장되지 않았고 적용하지 않았다.",
      "missing_evidence": [],
      "recommendations": [
        {
          "change": "이 기준의 충족을 위해 필요한 수정은 확인되지 않았다. 향후 원본의 로그인 조건, 단계, 무효화 경고 또는 완료 안내가 바뀌면 연결된 텍스트 대안도 함께 갱신한다.",
          "owner_role": "콘텐츠 담당자",
          "retest": "동일 페이지 초기 상태에서 M-A와 ALT-A의 연결 및 실제 본문을 다시 확인하고, 재점검 대상 원본의 전체 길이를 검증한다. 현재 판본을 재점검하는 경우 0–19.06775초의 전체 필요한 정보와 대안을 비교한다."
        }
      ]
    }
  ],
  "errors": [],
  "unreviewed_media": [],
  "other_checks": [
    {
      "criterion": "별도 WCAG 기준",
      "status": "이번 평가 범위 밖",
      "note": "플레이어의 키보드 접근성 등은 별도 평가가 필요하다. 해당 항목을 검사하거나 문제가 있다고 판정하지 않았으며 1.2.1 판정에 포함하지 않았다."
    }
  ],
  "next_checks": [
    {
      "condition": "원본, 대안, 페이지 연결 또는 대상 목록이 변경되는 경우",
      "action": "변경 판본의 식별 정보와 실제 대안 본문을 확보하여 동일 범위에서 다시 비교한다. 잡음, 여러 화자 또는 정보성 소리가 추가되면 ASR만으로 충분하다고 간주하지 말고 해당 정보를 확인할 수 있는 원본 관찰 증거를 보강한다."
    }
  ]
}