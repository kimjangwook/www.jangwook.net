---
title: 규칙이 잘려도 에러는 나지 않는다 robots.txt와 AGENTS.md 219런 실측
description: 2026년 8월 17일 세 개의 robots.txt 파서와 두 코딩 에이전트 CLI를 219번 돌렸다. 규칙이 잘리거나 잘못 읽혀도 프로세스는 0으로 끝났고 차단 의도 10셀에서 ALLOWED나 UNDEFINED가 나왔다. 32 KiB 경계와 RFC 9309 사양의 구멍을 정리한다.
pubDate: '2026-08-17'
heroImage: '../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png'
tags:
  - robots-txt
  - agents-md
  - claude-code
  - codex
  - web-standards
  - ai-crawlers
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: AI 크롤러 제어에서 robots.txt와 llms.txt의 실제 동작 범위를 다룬 글이다. 이번 글은 파서 구현과 지시문 파일의 페일 오픈 특성을 실측으로 검증한다.
      ja: AIクローラー制御におけるrobots.txtとllms.txtの実際の動作範囲を扱った記事。本稿はパーサー実装と指示文ファイルのフェイルオープン特性を実測で検証する。
      en: Covers the operational boundaries of robots.txt and llms.txt in AI crawler control. This post measures parser implementations and fail-open behaviors of instruction files.
      zh: 探讨了AI爬虫控制中robots.txt与llms.txt的实际运行边界。本文进一步实测验证了解析器实现与指令文件的Fail-Open特性。
---

두 줄짜리 robots.txt에서 순서만 뒤집었다. `Disallow: /p` 다음에 `Allow: /p`를 두면 urllib.robotparser는 `https://example.test/page.html`에 DISALLOWED를 낸다. 순서를 바꾸면 ALLOWED다. 규칙 집합은 글자 하나 다르지 않다. protego와 robots-parser는 양쪽 다 ALLOWED로 답이 바뀌지 않았다.

2026년 8월 17일 세 파서 urllib, protego, robots-parser와 두 코딩 에이전트 CLI codex 0.147.0, claude 2.1.233을 샌드박스에서 219번 돌렸다. 219런 전부 exit code 0이었다. 차단 의도 33개 셀 중 10개에서 ALLOWED나 UNDEFINED가 나왔다. 34 KiB와 48 KiB 파일의 꼬리 캐너리는 0/6이었다.

저장소에 규칙을 올려두고 안심할 때 에이전트는 절반을 버린 채 작업한다. 파일에 쓴 규칙과 실제 집행 사이에는 아무런 확인 신호가 없다. robots meta가 head에 써도 body로 떨어지는 조건과 같은 층이다. 파서가 선언을 다른 자리에 두면 규칙이 없는 것과 같다.

```bash
# 같은 두 줄, 순서만 뒤집는다. urllib 의 답이 뒤집힌다
cd "$(mktemp -d)"
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /p' 'Allow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
printf '%s\n' 'User-agent: GPTBot' 'Allow: /p' 'Disallow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
```

## 줄 번호가 사양을 이기는 표준 라이브러리

`urllib.robotparser`는 11개 시나리오 중 5개만 사양과 일치했다. protego는 10개, robots-parser는 9개였다.

urllib 내부의 RuleLine은 문자열 접두사만 비교하고 `can_fetch`는 매칭되는 첫 줄에서 반환한다. 최장 일치와 타이브레이크가 들어설 자리가 없다. 사양은 더 많은 옥텟을 매칭한 규칙을 우선하고 길이가 같으면 Allow를 우선하도록 규정한다.

urllib은 RFC 9309 대신 파일 위쪽 줄 번호를 따른다. tie-disallow-first 0/3이 tie-allow-first에서 3/3으로 바뀐 이유다. 답을 정하는 것은 규칙의 옥텟 수가 아니라 파일에서의 줄 번호였다.

```bash
# 와일드카드와 $ 를 문자 그대로 읽는지 본다
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /*.json$' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/api/data.json") else "DISALLOWED")'
python3 -m venv venv && ./venv/bin/pip install -q protego
./venv/bin/python -c 'from protego import Protego; r=Protego.parse(open("robots.txt").read()); print("ALLOWED" if r.can_fetch("https://example.test/api/data.json","GPTBot") else "DISALLOWED")'
```

## 크롤 딜레이 한 줄이 전역 차단을 지웠다

규칙 의미론 8개 시나리오에서 protego와 robots-parser는 24개 셀 전부 사양과 일치했다. 하지만 `empty-specific-group`에서는 세 파서가 만장일치로 ALLOWED를 냈다.

```bash
# 전용 그룹에 Crawl-delay 만 적으면 위의 전역 Disallow 가 사라진다. 세 파서가 만장일치로 ALLOWED
printf '%s\n' 'User-agent: *' 'Disallow: /' '' 'User-agent: GPTBot' 'Crawl-delay: 10' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/docs/page.html") else "DISALLOWED")'
```

파서 버그가 아니다. 사양 자체가 그렇게 규정한다. 전용 User-agent 그룹은 전역 그룹(*)과 결합되지 않는다. 그룹 안에 경로 규칙이 없으면 URI는 허용된다.

전체 사이트를 차단한 뒤 GPTBot 전용 그룹에 `Crawl-delay: 10`이나 주석만 덧붙이면 GPTBot에게서 전역 차단이 사라진다. 파서를 바꿔도 안 고쳐진다. [AI 크롤러를 robots.txt와 llms.txt로 나누어 제어하는 기록](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026/)이 있다. 선언을 나눠 써도 파서가 전용 그룹을 전면 허용으로 읽으면 그 선언은 도착하지 않는다.

```bash
# 상대 경로를 넘기면 robots-parser 는 undefined 를 돌려준다. falsy 로 읽으면 차단으로 오독한다
npm init -y >/dev/null && npm install robots-parser >/dev/null
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /blocked/' > robots.txt
node -e 'const fs=require("fs"),R=require("robots-parser");const r=R("https://example.test/robots.txt",fs.readFileSync("robots.txt","utf8"));console.log(r.isAllowed("/blocked/x.html","GPTBot"), r.isAllowed("https://example.test/blocked/x.html","GPTBot"))'
```

출력은 `undefined false`였다.

CI 테스트에서 `undefined`를 참 거짓의 거짓으로 평가하면 차단으로 오독한다.

## 32 KiB를 넘긴 순간 뒤쪽 지침이 잘려 나갔다

31 KiB 파일의 tail 캐너리는 6/6 출력됐다. 32 KiB를 넘자 결과가 쪼개졌다. 34022 B와 49022 B의 head는 6/6, 34023 B와 49023 B의 tail은 0/6이었다.

```bash
# AGENTS.md 끝에 캐너리를 붙이고 한도 위아래를 비교한다
cd "$(mktemp -d)"
yes 'Repo convention filler line used only to grow this document to a target byte size.' | head -c 34000 > body.txt
{ cat body.txt; printf '\nCANARY TOKEN: ZQCX34T\n'; } > AGENTS.md; rm body.txt; wc -c AGENTS.md
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' --skip-git-repo-check
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' -c project_doc_max_bytes=262144 --skip-git-repo-check
```

기본 한도에서 0/6으로 잘렸던 tail은 `project_doc_max_bytes`를 262144로 올리자 6/6으로 복귀했다. codex는 프로젝트 루트에서 작업 디렉터리로 내려오며 문서를 이어 붙이다가 누적 바이트가 기본 한도 32768 바이트에 닿는 순간 멈춘다.

파일째 버리는 것이 아니라 뒤쪽을 조용히 자른다. 실행 로그 120개에 `truncat` 문자열은 0건이었다. 같은 리포에서 두 CLI가 어떤 파일을 읽는지 잰 전편은 로드 여부였고, 이번 글은 로드된 파일의 어디까지가 살아남는지를 잰다.

## 한도가 없다는 말이 준수를 뜻하지는 않는다

claude 쪽 결과는 결정적이지 않았다. 31 KiB의 head와 tail은 2/6과 4/6, 34 KiB는 3/6과 1/6, 48 KiB는 0/6과 2/6이었다.

깨끗하게 잘린 것이 아니라 컨텍스트 안에서 확률적으로 지침을 놓쳤다. 49022 B 파일에서는 첫 줄 캐너리조차 6런 중 0번 짚었다.

CLI가 로드하지 않는 49024 B `NOTES.md` 통제 실험은 codex와 claude 모두 0/6이었다.

`CLAUDE.md`는 시스템 프롬프트가 아니라 사용자 메시지로 주입된다. 로드 실패가 아니라 로드된 컨텍스트를 모델이 다루지 못한 것이다.

## 단순한 설정 문제라는 반론

반론은 절반 맞다. `project_doc_max_bytes`를 262144로 늘리면 34k와 48k의 tail은 0/6에서 6/6으로 돌아왔다. protego를 쓰면 urllib이 어긋난 6개 셀 중 4개가 복구된다.

하지만 `empty-specific-group`의 3개 셀은 파서를 갈아치워도 안 고쳐진다. 세 파서가 사양대로 낸 전면 허용이다. claude는 전량 로드를 문서에 적어두었음에도 48 KiB 지침의 첫 줄을 0/6 읽었다.

두 사슬의 내부 인과는 다르다. 하나는 바이트 누적기이고 다른 하나는 사양의 부분집합 구현과 사양 자체의 규정이다. 둘이 공유하는 것은 실패가 일어났을 때 아무런 에러 없이 규칙이 없던 것처럼 통과하는 실패 방향이다.

## 실측의 한계

첫째, 실제 크롤러의 동작을 직접 검증하지는 않았다. GPTBot과 ClaudeBot의 내부 파서는 비공개다. 질의 호스트 example.test는 예약 도메인이고 robots.txt는 파일에서 직접 읽었다.

둘째, 2026년 8월 17일 macOS 단일 머신에서 측정했다. CPython 3.12.8의 urllib, protego 0.6.2, robots-parser 3.0.1, codex 0.147.0, claude 2.1.233과 gpt-5.6-luna, sonnet을 썼다. 파서는 결정적이라 같은 버전이면 같은 답을 내지만 모델 쪽 확률값은 달라질 수 있다.

셋째, codex의 중첩 AGENTS.md 누적 합산 축은 측정하지 않았다.

넷째, codex의 head 캐너리 3개 셀에서 마지막 한 글자가 빠진 채 출력된 현상의 원인을 밝히지 못했다.

## 내일 바꿀 다섯 가지

1. 차단 여부를 판단하기 전에 검증에 쓴 파서가 무엇인지 확인한다.

2. 특정 크롤러 전용 UA 그룹을 만들 때는 그 그룹 안에 Disallow를 반드시 다시 적는다. Crawl-delay나 주석만 있는 전용 그룹은 전면 허용이다.

3. 정말 막아야 하는 자원은 robots.txt가 아니라 서버 응답으로 차단한다.

4. `robots-parser` 반환값 검증 코드를 고친다. 상대 경로에서 돌아오는 `undefined`를 falsy로 묶어 차단으로 오독하지 않는다.

5. 에이전트 지시문 파일이 32 KiB를 넘으면 나누거나 한도를 올린다. 설정을 바꾼 뒤에는 파일 맨 끝에 캐너리 토큰을 넣고 답변에 찍히는지 직접 확인한다.

커밋했다고 규칙이 작동하지는 않는다. 침묵하는 통과를 믿지 않는다.
