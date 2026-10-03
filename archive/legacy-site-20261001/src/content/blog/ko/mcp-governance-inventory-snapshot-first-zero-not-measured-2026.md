---
title: 'MCP 서버 리스크 점검은 결과 파일이 없으면 0점으로 기록된다 — 리스크 0과 측정 불가를 구분하는 규약이 먼저다'
description: '점검 도구가 성공이라고 말해도 결과 파일이 비어 있으면 그 0점은 리스크 없음이 아니라 측정 안 됨이다. 점수 도구 도입 전에 설정 파일 스냅샷과 셀별 결과 파일이 없으면 실패로 기록되는 저장 규약부터 만들어야 한다.'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-inventory-snapshot-first-zero-not-measured-2026/hero.png
tags:
- MCP
- 보안
- 거버넌스
- 리스크 점검
relatedPosts:
- slug: mcp-governance-audit-exit-code-zero-fail-open-harness-2026
  score: 0.7
  reason:
    ko: '''MCP 거버넌스 감사에서 exit code 0은 안전을 증명하지 않는다''와 같은 문제를 다른 측정으로 다시 잰 글이다.'
    ja: 「MCPガバナンス監査でexit code 0は安全性を証明しない」と同じ問題を別の実測で捉え直した記事。
    en: Revisits the same problem as 'Exit code 0 does not prove safety in MCP governance audits'
      with a different measurement.
    zh: 用另一组实测重新审视与《MCP治理审计中，退出码0不能证明安全性》相同的问题。
- slug: mcp-server-production-deployment-kubernetes-guide
  score: 0.7
  reason:
    en: If the deployment guide focuses on keeping servers alive, this article shows
      why a live server's score can still signal false safety.
    ko: 배포 가이드가 서버를 살리는 데 집중했다면, 이 글은 살아난 서버의 점수가 왜 거짓 안전을 부를 수 있는지 보여준다.
    ja: デプロイガイドがサーバーを生かすことに焦点を当てたなら、この記事は生きたサーバーのスコアがなぜ偽りの安全を招くかを示す。
    zh: 若部署指南专注于让服务器存活，本文则揭示存活服务器的评分为何仍可能带来虚假的安全感。
---

## 오늘 당신의 점검 도구는 성공이라고 말했지만 결과가 없었다

오늘 당신이 운영하는 시스템에 연결된 AI 도구들이 안전한지 점검하려고 감사 스크립트를 돌렸다. 화면에는 모든 항목이 성공으로 떴지만, 정작 점검 결과는 아무것도 남지 않았다. 이 상황은 식당 위생 점검을 나갔는데 점검표를 아무 데도 적지 않고 '점검 완료' 도장만 찍어 온 것과 같다. 점검관은 일을 마쳤다고 보고했지만, 정작 어떤 구역이 깨끗한지 더러운지 기록이 하나도 없다. 당신은 그 도장만 보고 식당이 안전하다고 믿어야 하는 처지가 된다.

이번 실험에서 정확히 그런 일이 벌어졌다. MCP 서버 리스크 점검 도구가 5개 셀을 3회씩, 총 15회 실행했다. 모든 실행이 exit code 0으로 끝났다. exit code 0은 프로그램이 오류 없이 정상 종료했다는 뜻이다. 그런데 정작 점검 결과로 산출된 플래그(hits)는 하나도 없었다. OWASP 기준으로 플래그가 하나도 없다는 것은 리스크가 0점이라는 뜻으로 읽힌다. 하지만 실제로는 점검 결과 파일이 아예 생성되지 않아서 측정 자체가 불가능했다. 성공으로 끝난 점검이 왜 아무 결과도 남기지 못했는지 보자.

감사 도구의 '성공' 표시가 실제 점검 완료를 뜻하지 않는다는 사실이 드러난다.

## 관측된 것은 서버 하나의 존재와 나머지 네 칸의 빈 결과

점검 도구가 실제로 무엇을 찾아냈는지 보자. 첫 번째 셀은 하네스 설정 파일에서 MCP 서버를 열거하는 작업이었다. 하네스는 AI 도구들이 실행되는 환경을 묶어 관리하는 틀이다. 184322바이트 크기의 claude.json 파일에서 stdio 타입 pipx 기반 analytics-mcp 서버가 열거되었다. stdio는 표준 입출력으로 통신하는 방식이고, pipx는 파이썬 프로그램을 격리된 환경에 설치하는 도구다. 이 파일에서 열거된 MCP 서버는 analytics-mcp 하나뿐이었다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c1-inventory-enumeration" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">서버 목록화</span><span class="lm-card__text">3회 실행 모두 정상 종료됐지만 플래그 없이 analytics-mcp 서버 하나의 설정 항목만 열거했다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">정상 종료 3/3</span></div><span class="lm-card__chip">플래그 0</span></div></div>

나머지 네 칸은 모두 빈 결과였다. 두 번째 셀은 설치 스키마 점수 산출이었는데, 참조 문서로 쓰일 OWASP MCP 리드미 파일은 6376바이트로 존재했지만 점수 산출은 확인되지 않았다. 세 번째 셀은 권한 범위 점수 산출이었는데, 출력이 완전히 비어서 어떤 서버에도 권한 점수가 부여되지 않았다. 네 번째 셀은 원격 URL 존재 여부로 업데이트 부재를 평가하는 작업이었고, 다섯 번째 셀은 OWASP 루브릭 크로스워크 집계였다. 이 다섯 셀 모두 hits=0/3, usable=3/3, exit 0,0,0으로 기록되었다. usable이 3/3이라는 것은 도구가 세 번 모두 실행 가능했다는 뜻이다. 하지만 hits가 0이라는 것은 플래그가 하나도 없다는 뜻이다.

점검 도구가 찾아낸 것은 서버 하나의 존재뿐이고, 나머지 평가는 전부 빈칸이었다.

## 결과가 비어 있던 이유는 평가 입력 파일이 없었기 때문이다

왜 결과가 비었는지 보자. 네 번째 셀의 평가에는 스냅샷 파일이 필요했다. 스냅샷은 특정 시점의 설정 상태를 그대로 복사해 둔 파일이다. 그런데 snapshot/.mcp.json과 snapshot/claude.json이 모두 MISSING_FILE로 표시되며 NO_REMOTE_URL_FOUND가 출력되었다. 파일이 없다는 뜻이고, 그래서 원격 URL을 찾지 못했다는 뜻이다. 이 상황은 요리 평가를 하는데 재료 목록과 레시피가 모두 없어서 어떤 요리인지조차 알 수 없는 것과 같다. 심사위원은 요리를 맛볼 수 없고, 그저 평가가 불가능하다고 기록할 수밖에 없다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c4-update-absence-remote" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">업데이트 부재</span><span class="lm-card__text">3회 모두 정상 종료됐지만 평가 근거 파일이 누락되어 원격 주소를 찾지 못했다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">정상 종료 3/3</span></div><span class="lm-card__chip">플래그 0</span></div></div>

다섯 번째 셀은 더 직접적인 실패를 보여주었다. jq라는 JSON 처리 도구가 results/c*.json 파일을 찾지 못했다. jq: error: Could not open file results/c*.json: No such file or directory라는 오류가 출력되었다. 이 셀은 앞선 셀들이 생성한 결과 파일을 모아서 OWASP 루브릭 기준으로 종합 점수를 내는 역할이었다. 그런데 결과 파일이 하나도 생성되지 않아서 집계할 재료 자체가 없었다. 모든 셀이 exit code 0으로 성공 종료했는데도 결과 파일이 하나도 생성되지 않은 것이다.

빈 결과의 원인은 평가 기준이 아니라 평가 입력 파일의 부재였다.

## 서버가 하나뿐이라 리스크 0이 정상이라는 반론이 옳은 범위

가장 강한 반론은 이렇다. 서버가 하나뿐인 소규모 환경이라 애초에 리스크 면이 작았고, hits=0은 정상 결과였다는 주장이다. 이 반론이 옳은 범위는 명백하다. 한 대의 머신에서 하루 동안 서버 하나만 대상으로 점검했다면, 리스크가 작게 나오는 것은 자연스럽다. 이번 실험은 단일 머신에 analytics-mcp 서버 하나만 있는 환경에서 1회 측정한 것이다. 그런 환경에서 리스크 0점이 나왔다고 해서 이상할 것은 없다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">기준표 집계</span><span class="lm-card__text">3회 모두 정상 종료됐지만 결과 파일이 없어 집계 도구가 파일을 열지 못하고 실패했다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">정상 종료 3/3</span></div><span class="lm-card__chip">플래그 0</span></div></div>

그러나 이 반론은 다섯 번째 셀의 실패를 설명하지 못한다. jq가 results/c*.json 파일을 찾지 못한 것은 '리스크가 0이라서 플래그가 없다'는 것과 완전히 다른 사건이다. 파일이 없어서 집계 자체가 실행되지 않았다는 것은 측정 불가를 뜻한다. 정상 0점은 측정이 완료된 뒤에 내려지는 판정이다. 측정이 실행되지 않았는데 0점이라고 기록하는 것은 점수를 조작하는 것과 같다. 반론이 성립하려면 결과 파일이 정상 생성된 상태에서 모든 셀이 hits 0으로 나오는 환경이 관측되어야 한다. 그런 관측은 아직 없다.

서버가 하나뿐이어도 집계 자체가 실패한 것은 정상 0점과 다르다.

## 결과 파일이 없으면 실패로 기록하는 규약을 먼저 만들 것

그렇다면 무엇을 바꿔야 할까. 리스크 점검 도구를 이미 돌리고 있는 팀은 오늘 점검 로그에서 exit code 0인데 결과 파일이 비어 있지 않은지 확인하고, 비어 있으면 '측정 불가'로 기록하라. 리스크 점검 도구를 도입하려는 팀은 점검 입력이 되는 설정 파일 스냅샷과 셀별 결과 파일이 '없으면 실패로 기록되는' 저장 규약을 먼저 만들어라. 처음 질문으로 돌아가면, 성공으로 끝난 점검이 왜 아무 결과도 남기지 못했는지 이제 답할 수 있다. 점검 도구는 성공 여부를 실행 종료 상태로만 판단했고, 결과 파일의 존재 여부는 판단 기준에 넣지 않았기 때문이다. 도구가 할 일을 다 했는지와 도구가 결과를 남겼는지는 서로 다른 문제다. 이번 실험에서는 전자만 확인되고 후자는 확인되지 않았다.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">모든 칸에서 플래그가 0이었고 집계도 실패해 어떤 서버가 어떤 칸에서 문제인지 이 실험으로는 판정할 수 없다.</p></div>

리스크 점수 도구를 도입하기 전에 점검 입력과 결과가 파일로 남는 규약부터 갖춰야 한다.

## 이 글이 확인하지 못한 것

- 스냅샷 파일이 왜 생성되지 않았는지 — 생성 단계가 없었는지, 경로가 달랐는지 — 는 측정하지 못했다.
- 이 실험은 단일 머신에 서버 하나뿐인 환경의 1회 측정이며, 원격 서버가 여러 대인 환경에는 적용되지 않는다.
- 이 판단이 틀리려면 결과 파일이 정상 생성된 상태에서도 모든 셀이 hits 0으로 나오는 환경이 관측되어야 한다.

## 참고 자료

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project) — OWASP
2. [Model Context Protocol documentation](https://modelcontextprotocol.io) — modelcontextprotocol.io
3. [Claude Code documentation — settings and MCP configuration](https://code.claude.com) — code.claude.com