---
title: 'MCP 거버넌스 감사에서 성공 종료는 성공을 증명하지 않는다 — 15회 실행 전부 exit 0이었지만 측정은 실패했다'
description: '검증 파이프라인이 성공 신호를 보내도 실제로는 아무것도 측정하지 못했을 수 있다. 15회 실행이 전부 성공 종료 코드로 끝났지만, 결과 파일이 없거나 출력이 비어 있어 측정 자체가 실패한 사례를 보여준다.'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-audit-exit-code-zero-fail-open-harness-2026/hero.png
tags:
- MCP
- 거버넌스
- 검증
- 감사
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    ko: '''규칙이 잘려도 에러는 나지 않는다 robots.txt와 AGENTS.md 219런 실측''와 같은 문제를 다른 측정으로 다시 잰
      글이다.'
    ja: '「ルールが届かないとき処理は止まらず素通りする: robots.txtとAGENTS.mdの実測」と同じ問題を別の実測で捉え直した記事。'
    en: Revisits the same problem as 'robots.txt and AGENTS.md both fail open' with
      a different measurement.
    zh: 用另一组实测重新审视与《规则没有生效，为什么两边都当成通过了》相同的问题。
- slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
  score: 0.7
  reason:
    en: This piece on exit code 0 masking failed measurements forces a re-check of
      the earlier claim that harness choice drives the 28x cost gap.
    ko: 측정 실패를 성공으로 위장하는 exit code의 함정을 다룬 이번 글이, 하네스 선택이 비용 격차를 만든다는 기존 분석의 신뢰성을
      다시 검증하게 만든다.
    ja: 終了コード0が測定失敗を隠す問題を扱う本稿は、ハーネス選定がコスト差を生むという既存分析の信頼性を再検証させる。
    zh: 本文揭示退出码0掩盖测量失败的问题，促使你重新审视此前关于工具链选择导致28倍成本差异的结论。
---

## 성공 신호가 실제 결과를 증명하지 않을 수 있다

검증 파이프라인은 프로그램이 제대로 작동하는지 확인하는 절차다. 이 절차가 성공으로 끝났다는 신호를 우리는 그대로 믿는다. 하지만 성공 신호가 실제 결과를 증명하지 못할 때가 있다.

시험지에 답을 쓰지 않고 문제를 다 풀었다고 제출하는 학생을 떠올려 보자. 제출했다는 사실 자체는 분명하다. 하지만 그 제출이 시험을 봤다는 증거는 되지 못한다. 검증 파이프라인의 성공 신호도 마찬가지다. 성공으로 끝났다는 사실이 측정을 했다는 증거가 되지 못한다.

이번 실험에서 이 문제가 그대로 드러났다. 하네스 설정에서 MCP 서버 열거 자체는 성공했다. MCP는 프로그램이 다른 프로그램의 기능을 사용할 수 있게 해주는 연결 규칙이다. 184322바이트 크기의 claude.json 설정 파일에서 analytics-mcp 서버가 식별되었다. 이 서버는 stdio 방식과 pipx 기반 설치 구조로 확인되었다. 열거는 성공했다. 그런데 이후의 모든 측정이 실패했다.

## 열거는 성공했는데 왜 아무 플래그도 나오지 않았을까

15회 실행 모두 hits=0이라는 숫자가 나왔다. hits는 문제를 찾아낸 횟수를 가리킨다. 0이라는 것은 아무 문제도 찾지 못했다는 뜻이다. OWASP 기준으로 문제 발견 건수가 하나도 나오지 않았다. OWASP은 소프트웨어 보안 기준을 만드는 국제 단체다.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ko"><span class="lm-card__title">측정 절차</span><ol class="lm-card__steps"><li class="lm-card__text">단계 1. 하네스 설정 파일에서 연결된 MCP 서버 목록을 열거했다.</li><li class="lm-card__text">단계 2. 각 서버를 OWASP 기준의 설치 스키마 칸에 대입해 점수 매기기를 시도했다.</li><li class="lm-card__text">단계 3. 같은 방식으로 권한 범위 칸을 평가하려 했다.</li><li class="lm-card__text">단계 4. 업데이트 부재 칸은 원격 주소 근거 파일을 찾아 평가하려 했다.</li><li class="lm-card__text">단계 5. 마지막으로 전체 결과를 OWASP 기준표에 대응시켜 집계하려 했다.</li></ol></div>

설치 구조 평가 칸은 3회 실행되었다. 실행 결과는 exit 0, 0, 0이었다. exit 0은 프로그램이 성공적으로 끝났다는 종료 코드다. hits는 0/3이었다. 6376바이트 크기의 ref/owasp-mcp-readme.md 파일을 참조만 확인하고 점수 산출은 없었다. 권한 범위 평가 칸도 3회 실행되었다. exit 0, 0, 0이었고 hits는 0/3이었다. 이 칸의 출력은 아무것도 없었다. 업데이트 부재 평가 칸도 3회 실행되었다. exit 0, 0, 0이었고 hits는 0/3이었다. 크로스워크 집계 칸도 3회 실행되었다. exit 0, 0, 0이었고 hits는 0/3이었다.

모든 실행이 성공으로 끝났다. 그런데 아무것도 찾지 못했다. 이 숫자가 실제로 아무 문제가 없다는 뜻일 수도 있다. 다른 가능성도 있다. 측정 자체가 이루어지지 않았는데 0이라는 결과만 나왔을 수 있다.

## 파일 누락과 집계 실패가 성공 종료 코드와 함께 발생했다

스냅샷 단계에서 문제가 드러났다. 스냅샷은 특정 시점의 설정 상태를 그대로 저장해 두는 것이다. snapshot/.mcp.json 파일과 snapshot/claude.json 파일이 MISSING_FILE로 표시되었다. 파일이 없다는 뜻이다. NO_REMOTE_URL_FOUND라는 메시지도 출력되었다. 원격 서버 주소를 찾지 못했다는 뜻이다. 원격 URL 기반 평가의 근거 자체가 없었다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">기준표 집계</span><span class="lm-card__text">3회 모두 정상 종료됐지만 결과 파일이 없어 집계 도구가 파일을 열지 못하고 실패했다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">정상 종료 3/3</span></div><span class="lm-card__chip">플래그 0</span></div></div>

크로스워크 집계 셀에서도 문제가 발생했다. 크로스워크는 여러 평가 결과를 서로 교차해 종합하는 작업이다. jq: error: Could not open file results/c*.json: No such file or directory라는 오류가 출력되었다. jq는 JSON 파일을 다루는 도구다. 결과 파일이 없어서 열 수 없다는 오류다. exit code 0이었지만 결과 파일이 생성되지 않았다.

요리 재료가 없는데 요리가 끝났다고 말하는 것과 같다. 재료가 없으면 요리를 할 수 없다. 마찬가지로 파일이 없으면 집계를 할 수 없다. 그런데도 성공으로 끝났다.

## 성공 종료 코드와 실제 산출물 사이의 불일치가 반복 관찰된 이유

모든 셀이 exit code 0이었다. 그런데 hits가 전부 0이었다. c3 셀은 출력이 완전히 비어 있었다. c5 셀은 jq 파일 부재 오류를 냈다. 성공 종료 코드와 실제 산출물 사이의 불일치가 세 셀에서 반복 관찰되었다. c2, c3, c5가 그 셀들이다.

왜 이런 일이 반복됐을까. 셀 스크립트가 파일 생성과 종료 코드를 분리된 경로로 다루기 때문이다. 파일을 만드는 작업과 성공 여부를 알리는 작업이 서로 연결되어 있지 않다. 파일을 만들지 못해도 성공으로 끝날 수 있다. 스냅샷 단계가 실패해도 후속 셀이 중단 없이 진행되었다. 실패가 전파되지 않는 구조다.

c3 셀이 왜 출력까지 완전히 비웠는지는 정확히 알 수 없다. 파이프라인 코드가 없으면 인과를 단정할 수 없다. 다만 분명한 건 exit 0이 성공을 증명하지 않는다는 것이다. exit 0인데 출력이 비어 있거나 파일이 없다면, 그것은 성공이 아니라 측정 실패다.

## hits=0이 안전하다는 해석이 옳은 범위

hits=0이 안전하다는 해석이 있을 수 있다. 아무 문제도 찾지 못했으니 서버가 안전하다는 뜻이라는 해석이다. 이 해석이 옳은 범위가 있다. 스냅샷 파일이 존재하고 크로스워크가 정상 집계된 파이프라인에서는 이 해석이 성립한다.

하지만 이번 실험에서는 그 해석이 성립하지 않는다. 근거 파일이 MISSING_FILE로 표시되었다. 집계가 파일 부재로 실패했다. 이런 환경에서는 플래그 0과 측정 실패를 구분할 방법이 없다. 기대했던 최소 2개 칸에서 다수 플래그 여부를 판정할 수 없다. 측정이 실패했는지 서버가 실제로 안전한지 알 수 없다. 안전하다는 해석은 위험한 오판이 될 수 있다.

## 내일 자신의 파이프라인에서 exit 0인데 산출물이 없는 경우를 찾아보라

이제 당신이 할 일이 있다. 내일 자신의 검증 파이프라인을 열어보라. exit 0인데 산출물이 없는 경우를 의도적으로 하나 만들어 보라. 결과 파일이 실제로 생성되었는지 확인하라. 출력이 비어 있지 않은지 확인하라.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">모든 칸에서 플래그가 0이었고 집계도 실패해 어떤 서버가 어떤 칸에서 문제인지 이 실험으로는 판정할 수 없다.</p></div>

exit 0만으로 검증을 통과시키는 팀은 결과 파일이 실제로 생성되었는지, 출력이 비어 있지 않은지 먼저 확인하는 게이트를 추가하라. 이 게이트 하나로 측정 실패를 성공으로 둔갑시키는 구조를 막을 수 있다.

성공 신호를 믿기 전에 결과물을 확인하는 습관이 필요하다. 초록불이 켜졌다고 해서 실제로 측정이 되었다고 단정하지 말아야 한다.

## 이 글이 확인하지 못한 것

- OWASP 루브릭 기준의 실제 플래그 판정은 측정되지 못했다.
- 다른 하네스·다른 감사 스크립트에서 동일한 fail-open이 재현된다는 일반화는 이 글의 범위 밖이다.
- 이 판단이 틀릴 조건: 어떤 파이프라인에서 exit 0과 함께 결과 파일이 항상 존재하고 내용이 비어 있지 않다면, 그 파이프라인에는 fail-open이 없다.

## 참고 자료

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project) — OWASP
2. [Model Context Protocol documentation](https://modelcontextprotocol.io) — modelcontextprotocol.io
3. [Anthropic Claude Code documentation](https://docs.anthropic.com) — docs.anthropic.com
4. [Claude Code settings and configuration](https://code.claude.com) — code.claude.com