판정은 **not_applicable(검증된 본문 매체 대안 예외)**입니다. 제공된 독립 음성 전사·화자 및 경고음 처리 기록·전체 화면 구성 기록과 첨부 PNG를 본문 전체와 대조한 결과, 대사·중요한 경고음·화면 안내가 본문에 포함되어 있고, 영상이 본문의 매체 대안이라는 안내도 실제 페이지 기록에 명확히 표시되어 있습니다. 따라서 자막 트랙이 없다는 사실만으로 이 영상에 1.2.2 위반을 부여하지 않습니다. 이번 실행은 제공 자료와 PNG 검토이며, 평가자가 URL을 방문하거나 원본을 직접 청취·연속 재생한 것은 아닙니다.

```json
{
  "criterion": "1.2.2",
  "level": "A",
  "prompt_version": "0.1.0",
  "scope": {
    "url_and_state": "http://127.0.0.1:8944/cases/C09 — 제공된 실제 페이지 상태 기록 기준. 기사 본문과 교육 영상 M1만 평가하며 푸터 탐색은 제외.",
    "inventory_complete_within_scope": true,
    "execution": "run",
    "decision": "not_applicable",
    "reason": "범위 내 유일한 녹화 영상 M1은 본문에 없는 정보를 추가하지 않는 본문의 매체 대안이며, 그 사실이 실제 페이지에 명확히 표시되어 있어 1.2.2 예외가 성립한다."
  },
  "evidence_use": {
    "direct_audio_review": false,
    "direct_continuous_video_review": false,
    "used_evidence_ids": [
      "MEDIA-C09",
      "PAGE-C09",
      "SOURCE-ASR",
      "SOURCE-AUDIO",
      "SOURCE-SOUND",
      "SOURCE-VISUAL",
      "ENCODE-LINK",
      "DELIVERY-C09",
      "DISPLAY-C09-1",
      "DISPLAY-C09-2",
      "DISPLAY-C09-3"
    ],
    "derived_processing_and_limits": [
      "제공된 텍스트 기록과 실제 첨부 PNG 3개를 검토했다. 추가 브라우저·음성·영상 도구는 사용하지 않았다.",
      "MEDIA-C09, SOURCE-ASR, SOURCE-AUDIO, ENCODE-LINK의 원본 해시가 일치한다. SOURCE-ASR은 후보 자막이나 제작 대본을 입력하지 않은 독립 자동 전사이며, 단어 시각과 인식 내용에는 오차 가능성이 있다.",
      "SOURCE-AUDIO는 원본과 독립 음성 클립의 상관 분석으로 안내자·사용자 역할과 전체 클립 구간을 연결한다. 경고음의 발생 시각은 SOURCE-SOUND의 측정, 보안 확인 실패라는 의미는 PAGE-C09의 실제 안내에 근거한다.",
      "0.94–3.04초: 안내자의 보안 선택 지시가 PAGE-C09 본문과 일치한다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 본문을 읽는 이용자에게 해당 지시의 정보 손실은 확인되지 않았다.",
      "3.8–6.56초: 사용자의 이전 코드 폐기 가능 여부 질문이 화자와 함께 PAGE-C09에 포함된다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 본문에서 질문의 주체와 의미를 파악할 수 있다.",
      "7.71–11.18초: 안내자의 부정 답변과 새 복구 코드 저장 전 폐기 금지 조건이 PAGE-C09에 그대로 포함된다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 중요한 부정·조건의 정보 손실은 확인되지 않았다.",
      "12.2–12.4초 및 12.62–12.82초: 두 경고음과 보안 확인 실패의 의미가 PAGE-C09에 포함된다. 근거: SOURCE-SOUND, SOURCE-AUDIO, PAGE-C09. 본문을 읽는 이용자도 실패 신호의 횟수와 의미를 알 수 있다.",
      "16.47–19.0초: 보안 확인을 다시 완료한 뒤 발급을 확인하는 순서가 PAGE-C09와 일치한다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 작업 순서의 정보 손실은 확인되지 않았다.",
      "20.0–22.14초: 새 코드를 안전한 곳에 저장하는 지시가 PAGE-C09와 일치한다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 보관 지침의 정보 손실은 확인되지 않았다.",
      "22.76–26.02초: 새로 발급하면 이전 코드를 더 이상 사용할 수 없다는 조건과 부정 의미가 PAGE-C09에 포함된다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 이전 코드의 사용 불가 정보를 본문에서도 알 수 있다.",
      "27.45–29.08초: 발급 완료 화면 확인 지시가 PAGE-C09와 일치한다. 근거: SOURCE-ASR, SOURCE-AUDIO, PAGE-C09. 완료 확인 지시의 정보 손실은 확인되지 않았다.",
      "화면 구간 0–3.75, 3.75–7.35, 7.35–11.95, 11.95–16.17, 16.17–19.81, 19.81–27.05, 27.05–31.18초의 일곱 단계 제목·설명·버튼 문구가 PAGE-C09에 포함된다. 근거: SOURCE-VISUAL, ENCODE-LINK, DISPLAY-C09-1, DISPLAY-C09-2, DISPLAY-C09-3. 진행 표시 외 추가적인 안내 정보는 확인되지 않았다.",
      "전체 범위 확인은 모든 749프레임의 디코드 및 고정 화면 구성 검증과 전체 음성 트랙 처리 기록에 근거한다. 대표 PNG만으로 전체 범위를 추정한 것이 아니며, 이 통제된 고정 화면 영상에 한정된다.",
      "SOURCE-VISUAL의 일반적인 자막 큐 검토 문구는 C09의 자막 제공 증거로 사용하지 않았다. 실제 C09 기록인 DELIVERY-C09에는 트랙과 활성 큐가 없고, 첨부 PNG에는 단계 안내가 표시된다.",
      "본문 매체 대안 예외가 성립하므로 자막별 의미·시간 대응 비교는 수행하지 않았다. 본문과의 일치를 동기화 자막 제공 또는 자막 품질의 증거로 전용하지 않았다."
    ]
  },
  "media": [
    {
      "media_id": "M1",
      "classification": "대사와 정보성 이중 경고음이 포함된 사전 녹화 동기화 매체. 실제 무음 영상이나 음성 전용 매체가 아니다.",
      "classification_evidence_ids": [
        "MEDIA-C09",
        "SOURCE-ASR",
        "SOURCE-AUDIO",
        "SOURCE-SOUND",
        "SOURCE-VISUAL"
      ],
      "execution": "run",
      "decision": "not_applicable",
      "reason": "원본의 대사·화자·중요한 소리와 일곱 단계 화면 안내가 연결된 본문 전체에 포함되어 있다. 실제 표시 문구가 본문의 매체 대안임을 명시하므로 자막 요구의 예외로 처리한다.",
      "exception": {
        "claimed": true,
        "no_extra_information": true,
        "clearly_labeled": true,
        "verified": true,
        "evidence_ids": [
          "PAGE-C09",
          "SOURCE-ASR",
          "SOURCE-AUDIO",
          "SOURCE-SOUND",
          "SOURCE-VISUAL",
          "ENCODE-LINK",
          "DISPLAY-C09-1",
          "DISPLAY-C09-2",
          "DISPLAY-C09-3"
        ]
      },
      "caption_delivery": {
        "kind": "none",
        "actually_observed": true,
        "evidence_ids": [
          "PAGE-C09",
          "DELIVERY-C09",
          "SOURCE-VISUAL",
          "DISPLAY-C09-1",
          "DISPLAY-C09-2",
          "DISPLAY-C09-3"
        ]
      },
      "coverage": {
        "complete": true,
        "processed_ranges": [
          {
            "start_seconds": 0,
            "end_seconds": 31.208333,
            "evidence_ids": [
              "SOURCE-ASR",
              "SOURCE-AUDIO",
              "SOURCE-VISUAL",
              "ENCODE-LINK",
              "PAGE-C09",
              "DELIVERY-C09",
              "DISPLAY-C09-1",
              "DISPLAY-C09-2",
              "DISPLAY-C09-3"
            ],
            "reason": "본 예외 검증에 필요한 원본 정보와 표시 상태를 제공된 전체 처리 기록 및 고정 화면 검증으로 확인했다. 음성 트랙은 약 31.189초까지 전체 디코드되었고 영상은 31.208333초까지 모든 프레임이 처리되었다. 마지막 영상 구간은 전체 화면 구성 기록으로 확인했으며 직접 연속 재생한 범위가 아니다."
          }
        ],
        "unreviewed_ranges": []
      },
      "comparisons": [],
      "missing_evidence": [],
      "recommendations": []
    }
  ],
  "errors": [],
  "limits": [
    "이 판정은 제공된 C09 페이지 상태와 지정된 기사 본문·영상 M1에만 적용되며, 사이트 전체 적합성 인증이나 다른 성공 기준의 판정이 아니다.",
    "직접 청취와 연속 영상 재생은 수행하지 않았다. 자동 전사, 통제된 음성 출처 분석, 소리 측정, 전체 구성·프레임 처리 기록 및 첨부 PNG를 사용했다.",
    "자동 전사의 높은 인식 확률이나 오디오 상관값만으로 의미 정확성을 확정하지 않았다. 화자·경고음·화면 정보와 실제 본문을 함께 대조했으며, 예외 판정을 막는 해결되지 않은 정보 충돌은 확인되지 않았다.",
    "자막 트랙 부재 자체를 실패 근거로 삼지 않았다. 화면의 단계 안내와 정적인 본문도 완전한 동기화 자막으로 간주하지 않았다.",
    "영상·본문·대안 안내 문구가 변경되거나 본문에 없는 정보가 추가되면 예외를 다시 검증해야 한다."
  ]
}
```