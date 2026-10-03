---
title: "모델 버전을 올릴 때마다 인젝션 테스트를 다시 돌리는 이유: 게이트를 직접 짜봤다"
description: "LLM 파이프라인에 프롬프트 인젝션 회귀 스위트를 직접 돌렸다. 순진한 키워드 가드는 11건 중 2건, 구조적 가드는 11건 전부를 잡았고, 내가 저지른 리팩터링이 떨어뜨린 탐지까지 게이트가 집어냈다. 모델 버전을 올릴 때마다 다시 돌려야 하는 이유를 실측으로 정리했다."
pubDate: '2026-07-27'
heroImage: ../../../assets/blog/prompt-injection-regression-gate-model-updates/hero.png
tags:
  - security
  - llm
  - web-development
  - ci-cd
relatedPosts:
  - slug: icml-prompt-injection-academic-review
    score: 0.88
    reason:
      ko: "저 글이 '논문 PDF에 숨은 인젝션'이라는 공격면을 보여줬다면, 이 글은 그 공격을 내 파이프라인에서 CI로 막는 방어면을 다룬다. 공격을 봤으면 게이트도 봐야 한다."
      ja: "あちらが『論文PDFに潜む注入』という攻撃面を見せた回なら、こちらはその攻撃を自分のパイプラインでCI遮断する防御面。攻撃を見たならゲートも見るべき。"
      en: "That post showed the attack surface — injections hidden in paper PDFs. This one covers the defense surface: blocking those attacks in your own pipeline via CI. If you saw the attack, look at the gate too."
      zh: "那篇展示了攻击面——藏在论文 PDF 里的注入；这篇讲防御面：在自己的流水线里用 CI 拦住它。看过攻击，也该看看关卡。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.8
    reason:
      ko: "측정을 CI 게이트로 굳히는 절차의 원형이 저 글이다. 저기선 구조화 데이터였고 여기선 인젝션 방어인데, exit 1로 배포를 막는 뼈대는 같다."
      ja: "測定をCIゲートに固める手順の原型があちら。あちらは構造化データ、こちらは注入防御だが、exit 1でデプロイを止める骨格は同じ。"
      en: "The template for hardening a measurement into a CI gate lives there. There it was structured data, here it's injection defense, but the skeleton — block deploy on exit 1 — is identical."
      zh: "把测量固化成 CI 关卡的做法原型在那篇。那边是结构化数据，这边是注入防御，但用 exit 1 拦住部署的骨架一样。"
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.66
    reason:
      ko: "인젝션이 위험한 건 모델이 뒤에서 만질 수 있는 자원 때문이다. 저 글의 '비밀정보·MCP config 최소권한' 논의가 이 글의 방어를 완성하는 다른 절반이다."
      ja: "注入が危ういのはモデルが裏で触れる資源のせい。あちらの『機密・MCP config最小権限』の議論が、本稿の防御を完成させるもう半分。"
      en: "Injection is dangerous because of what the model can reach behind the scenes. That post's take on secrets and least-privilege MCP config is the other half that completes this defense."
      zh: "注入之所以危险，在于模型背后能触及的资源。那篇关于机密与 MCP 最小权限配置的讨论，是补全本文防御的另一半。"
  - slug: ai-reliability-engineer-centaur-pod-2026
    score: 0.55
    reason:
      ko: "이 게이트를 '누가, 언제, 왜 돌리나'까지 팀 프로세스로 굳히는 이야기가 저 글이다. 게이트는 스크립트가 아니라 운영 습관일 때 산다."
      ja: "このゲートを『誰が・いつ・なぜ回すか』までチームの運用に落とす話があちら。ゲートはスクリプトではなく運用習慣になって初めて生きる。"
      en: "That post is about hardening this gate into team process — who runs it, when, and why. A gate survives as an operating habit, not as a script."
      zh: "把这道关卡落到团队流程——谁跑、何时跑、为何跑——的讨论在那篇。关卡只有成为运维习惯才活得下来，而不是一段脚本。"
  - slug: webmcp-navigator-modelcontext-origin-trial-agent-tools-2026
    score: 0.5
    reason:
      ko: "에이전트가 페이지의 서드파티 스크립트와 한 판에서 돌 때 인젝션 표면이 커진다. 저 글의 툴 등록 경합이 이 글이 막으려는 신뢰 경계 문제와 이어진다."
      ja: "エージェントがページのサードパーティscriptと同じ土俵で動くと注入面が広がる。あちらのツール登録の競合が、本稿が守ろうとする信頼境界の問題につながる。"
      en: "When an agent runs on the same page as third-party scripts, the injection surface grows. That post's tool-registration race ties into the trust-boundary problem this one defends."
      zh: "当代理与页面上的第三方脚本同场运行，注入面就变大。那篇的工具注册竞争，正连着本文要守的信任边界问题。"
---

같은 파이프라인, 같은 코드다. 바뀐 건 뒤에 붙은 모델 하나다. 그런데 지난주에 잘 통과하던 인젝션 방어가 이번 주에도 통과한다는 보장은 어디에도 없다. 공격자 쪽 모델이 갱신되면 공격 분포가 바뀌고, 우리 쪽 모델을 올리면 요청 config 계약이 바뀐다. 둘 다 코드는 그대로인데 결과가 달라진다.

그래서 인젝션 방어를 한 번 짜고 끝낼 게 아니라, 의존성 버전을 올릴 때마다 다시 돌리는 회귀 테스트로 만들어야 한다고 본다. 이번에는 그 주장을 말로 하지 않고 실제로 돌려봤다. 내 LLM 자동화 파이프라인이 신뢰할 수 없는 입력(댓글, 크롤링해온 웹 텍스트)을 프롬프트로 조립하는 지점에, 13건짜리 인젝션 회귀 스위트를 붙였다. 순진한 가드는 11건 중 2건만 잡았다. 구조를 갖춘 가드는 전부 잡았다. 그리고 그 가드를 리팩터링하다 탐지기 하나를 실수로 떨어뜨리자, 게이트가 정확히 새어나간 2건을 집어 exit 1을 냈다.

## 프롬프트 인젝션이 무엇이고, 왜 모델을 올릴 때 다시 검사해야 하나

프롬프트 인젝션은 신뢰할 수 없는 텍스트가 모델에게 던지는 명령으로 둔갑하는 공격이다. 웹 개발자에게 익숙한 말로 옮기면 SQL 인젝션이나 XSS와 같은 계열이다. 데이터로 취급해야 할 문자열이 실행 맥락으로 흘러 들어가 통제를 빼앗는다. 차이는, SQL은 파서 문법이 고정돼 있어 파라미터 바인딩으로 데이터와 명령을 확실히 가를 수 있는 반면, LLM에는 그런 문법 경계가 없다는 점이다. 모델 입장에서 시스템 프롬프트, 사용자 입력, 크롤링해온 웹 문서는 결국 같은 토큰 열이다. 어디까지가 지시이고 어디부터가 데이터인지를 문법이 보장해주지 않는다.

이게 왜 "모델을 올릴 때마다"의 문제가 되는가. 두 축이 동시에 움직이기 때문이다.

첫째, 공격 쪽 모델이 강해지면 공격 분포 자체가 바뀐다. OpenAI가 2026년 7월 중순 공개한 [GPT-Red](https://openai.com/index/unlocking-self-improvement-gpt-red/)가 이걸 정면으로 보여준다. 사람이 아니라 모델이 다른 모델을 자동으로 공격해 방어를 단련시키는 접근인데, 간접 프롬프트 인젝션 벤치마크에서 GPT-Red의 공격 성공률이 84%로, 같은 조건의 인간 레드팀 13%를 크게 앞섰다고 OpenAI는 밝혔다. 더 중요한 건 이 과정에서 Fake Chain-of-Thought라 이름 붙은 새로운 공격군이 발굴됐다는 대목이다. 이전 세대 모델에서는 성공률이 95%를 넘겼는데, 그 예제로 다시 훈련한 다음 세대에서는 10% 아래로 떨어졌다고 한다(수치는 OpenAI 발표 기준의 참고값이다. 나는 원문 페이지를 직접 긁으려다 접근이 막혀, 인용 대신 링크로만 남긴다). 핵심 함의는 하나다. 공격은 정적이지 않다. 자동화된 공격자가 새 공격군을 계속 생성하므로, 작년에 통과한 방어가 올해도 통과한다는 보장은 없다.

둘째, 방어 쪽 모델을 올리면 이번엔 API 계약이 바뀐다. 이건 뒤에서 Opus 5 사례로 실측한다. 지금은 결론만 말하면, 인젝션 취약성과 config 유효성이 둘 다 "모델 버전에 종속된 값"이라는 점이다. 종속된 값이라면 버전을 올릴 때 다시 재는 게 맞다. [ICML 심사 PDF에 숨은 인젝션 사례](/ko/blog/ko/icml-prompt-injection-academic-review/)에서 공격면을 봤다면, 이 글은 그 공격을 내 쪽에서 어떻게 반복 검사로 막는지를 다룬다.

## 내가 통제할 수 있는 건 모델이 아니라 가드 계층이다

여기서 정직하게 선을 하나 긋고 시작해야 한다. 웹 개발자인 나는 모델 내부의 인젝션 저항성을 바꿀 수 없다. 그건 모델 제공사의 훈련 영역이다. 내가 실제로 손댈 수 있는 건 그 앞뒤에 두는 계층이다. 신뢰할 수 없는 입력을 걸러내는 입력 방화벽, 모델 출력이 허용된 행동 범위를 벗어나지 않는지 보는 출력 검증, 그리고 애초에 모델이 만질 수 있는 자원을 좁히는 최소권한 설계다.

그래서 이번 실험이 재는 대상도 "모델이 인젝션에 얼마나 잘 버티나"가 아니다. "내 가드 계층이 알려진 공격군을 얼마나 잡아내나, 그리고 코드를 바꿨을 때 그 성능이 조용히 무너지지 않나"다. 이 구분이 중요하다. 가드 계층은 결정적이고 값싸다. API 키도 비용도 없이 CI에서 매번 돌릴 수 있다. 반대로 모델 자체의 저항성 측정은 실제 호출과 비용, 비결정성이 끼어 회귀 테스트로 쓰기엔 무겁다. 매 커밋마다 돌릴 게이트라면, 내가 통제하는 결정적 계층을 대상으로 삼는 편이 현실적이다.

가드가 모델 수정을 대신하지는 못한다. 이건 방어의 한 겹일 뿐이고, 뒤에서 한계를 따로 정리한다. 다만 이 한 겹이 회귀에 특히 취약하다. 정규식 하나 지우고, 델리미터 하나 빠뜨리고, 프롬프트를 리팩터링하는 사소한 변경이 방어에 구멍을 낸다. 그런 변경은 리뷰에서 눈에 잘 안 띈다. 그래서 게이트가 필요하다.

## 13건짜리 회귀 스위트를 짜서 파이프라인에 돌렸다

스위트는 6개 공격군에 걸쳐 인젝션 11건, 정상 입력 2건으로 짰다. 정상 입력을 섞은 이유는 단순하다. 방어가 과해져 멀쩡한 댓글까지 막아버리는 오탐도 회귀이기 때문이다. 게이트는 "인젝션을 다 잡고, 정상은 다 통과"할 때만 초록불이어야 한다.

공격군은 이렇게 나눴다. 직접 지시 덮어쓰기(`ignore all previous instructions` 류), 가짜 시스템/역할 태그 주입(`[SYSTEM]`, `</user><system>`), Fake Chain-of-Thought(모델의 사고 과정을 위조해 "이미 관리자 인증됐으니 공개해도 안전"이라고 속이는 수법), 델리미터 탈출(삼중 따옴표나 백틱으로 문서 경계를 위조), 데이터 유출 유도(대화 내용을 외부 URL 쿼리에 실어 이미지·링크로 내보내기), 인코딩 우회(base64로 감싼 명령). 각 케이스는 `expected`를 갖는다. 인젝션은 차단, 정상은 통과가 정답이다.

가드는 세 버전을 준비했다. 어느 탐지기를 켜느냐가 곧 방어 계약이다.

```javascript
const GUARDS = {
  // v1: 흔한 영어 키워드만. 최초의 순진한 방어
  v1_naive: ["override"],
  // v2: 구조적 방어 전부. measure→fix 이후
  v2_hardened: ["role_injection", "override", "fake_cot",
                "delimiter_escape", "exfiltration", "encoded"],
  // v2.1: 모델을 올리며 가드를 리팩터링하다 fake_cot 탐지를 실수로 드롭한 회귀본
  "v2.1_regressed": ["role_injection", "override",
                     "delimiter_escape", "exfiltration", "encoded"],
};
```

게이트는 스위트를 돌려 통과율을 재고, 인젝션이 하나라도 새거나 정상이 하나라도 막히면 `process.exit(1)`을 낸다. CI에서 이 exit 코드가 배포를 세운다. 먼저 v1 순진한 가드부터 돌렸다.

```text
=== injection regression gate :: guard=v1_naive ===
[PASS] override-01  direct_override  expected=block got=blocked override
[PASS] override-02  direct_override  expected=block got=blocked override
[FAIL] fakesys-01   fake_system      expected=block got=allowed
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] delim-01     delimiter_escape expected=block got=allowed
[FAIL] exfil-01     exfiltration     expected=block got=allowed
[FAIL] encoded-01   encoded          expected=block got=allowed
...
탐지율: 2/11 (18.2%)  오탐(benign 차단): 0  누출: [fakesys-01, ...]
GATE: RED (exit 1)
```

키워드 블록리스트만 있는 가드는 11건 중 2건, 18.2%만 잡았다. 예상한 결과이긴 하다. `ignore previous instructions` 같은 뻔한 문구는 걸러도, 가짜 역할 태그나 위조된 사고 과정은 그냥 통과시킨다. 흔히 "인젝션 방어 넣었다"고 할 때의 그 방어가 대개 이 수준이다. 게이트는 빨간불을 냈고, 이게 measure 단계의 정직한 출발점이다.

이제 구조적 가드 v2로 고쳤다. 역할 태그·위조 사고·델리미터·유출 URL·인코딩을 각각 탐지기로 나눠 켰다.

```text
=== injection regression gate :: guard=v2_hardened ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[PASS] fakecot-01   fake_cot         expected=block got=blocked fake_cot
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
[PASS] exfil-01     exfiltration     expected=block got=blocked exfiltration
[PASS] encoded-01   encoded          expected=block got=blocked encoded
...
탐지율: 11/11 (100%)  오탐(benign 차단): 0  누출: []
GATE: GREEN (exit 0)
```

11건 전부 차단, 정상 2건은 전부 통과, 오탐 0. 게이트가 초록불로 바뀌었다. 여기까지가 measure → fix다. 하지만 이 글의 핵심은 이 초록불이 아니다. 이 초록불이 나중에 조용히 빨간불로 돌아갈 때, 그걸 누가 알려주느냐다.

## 게이트가 회귀를 잡는 순간: 탐지기 하나를 떨어뜨렸더니

현실에서 방어가 무너지는 방식은 대체로 극적이지 않다. 새 모델로 올리면서 프롬프트 빌더를 리팩터링하고, 그 김에 "안 쓰는 것 같은" 탐지기를 정리하고, 정규식을 손본다. 그중 하나가 실수였다는 걸 그 순간엔 아무도 모른다. 이 시나리오를 v2.1로 재현했다. Fake Chain-of-Thought 탐지기 하나만 목록에서 뺐다. 나머지는 그대로다.

```text
=== injection regression gate :: guard=v2.1_regressed ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] fakecot-02   fake_cot         expected=block got=allowed
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
...
탐지율: 9/11 (81.8%)  오탐(benign 차단): 0  누출: [fakecot-01, fakecot-02]
GATE: RED (exit 1)
```

81.8%. 게이트가 빨간불을 내면서 새어나간 케이스 두 건을 이름으로 짚었다. `fakecot-01`, `fakecot-02`. 리뷰어가 diff에서 놓쳤을 변경이, 배포 전에 정확한 좌표로 드러났다. 세 실행을 한 장으로 정리하면 이렇다.

![세 가지 가드 버전의 인젝션 탐지율. v1 순진한 가드 18.2%, v2 구조적 가드 100%, v2.1 회귀본 81.8%. 게이트 임계값은 100%이며 그 아래는 모두 exit 1로 배포를 막는다.](../../../assets/blog/prompt-injection-regression-gate-model-updates/catch-rate.png)

바로 이 지점이 [구조화 데이터를 CI 게이트로 굳혔던 방식](/ko/blog/ko/validate-structured-data-ci-jsonld-2026/)과 정확히 같은 뼈대다. 측정 결과를 사람 눈에만 맡기지 않고, 임계값 아래로 떨어지면 파이프라인이 멈추게 배선한다. 다른 건 대상뿐이다. 저기선 JSON-LD 유효성이었고, 여기선 인젝션 탐지율이다. 81.8%가 위험한 이유는 절대 수치가 낮아서가 아니다. 어제 100%였다가 오늘 81.8%가 됐는데 아무도 모른다는 점이 위험하다. 회귀 게이트는 절대 보안을 증명하는 도구가 아니라, 방어가 조용히 후퇴하는 걸 막는 도구다.

## config도 회귀한다: Opus 5의 thinking과 effort

지금까지가 공격 쪽 회귀였다면, 방어 쪽 모델을 올릴 때 터지는 다른 종류의 회귀가 있다. API 요청 계약의 파손이다. 2026년 7월 24일 출시된 Claude Opus 5가 살아 있는 사례를 준다. [공식 마이그레이션 가이드](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5#behavior-changes)의 표현을 그대로 옮기면 이렇다.

> On Claude Opus 5, `thinking: {"type": "disabled"}` is accepted only when the effort level is `high` or below. Setting `thinking: {"type": "disabled"}` with effort `xhigh` or `max` returns a 400 error. This is generally available behavior on Claude Opus 5 onward, enforced on each request, and it is a breaking change from Claude Opus 4.8, where disabling thinking was independent of the effort level.

번역하면, thinking을 끈 상태는 effort가 high 이하일 때만 받아준다. xhigh나 max와 함께 thinking을 끄면 400을 돌려준다. 4.8에서는 thinking을 끄는 것과 effort 레벨이 서로 독립이었으니, 이건 명백한 파괴적 변경이다. 참고로 가격은 입력 100만 토큰당 5달러, 출력 25달러로 4.8과 같고, 컨텍스트는 기본이자 최대가 100만 토큰이며, thinking이 기본으로 켜져 있다. 즉 모델 ID만 `claude-opus-4-8`에서 `claude-opus-5`로 바꾸는 드롭인 교체를 하면, 4.8 시절 잘 돌던 "thinking 끄고 effort는 xhigh" 조합이 있던 배치 작업이 배포 직후 400으로 무너진다.

이건 인젝션과 다른 문제처럼 보이지만, 회귀 게이트라는 관점에서는 같은 문제다. config 유효성도 모델 버전에 종속된 값이다. 그래서 인젝션 스위트 옆에 config 계약 테스트를 하나 더 붙였다. API에 던지기 전에, 로컬에서 400을 미리 예측하는 검증기다.

```javascript
function validateRequest(req) {
  const errors = [];
  const effort = req.output_config?.effort;
  const thinking = req.thinking?.type;
  if (req.model === "claude-opus-5") {
    if (thinking === "disabled" && (effort === "xhigh" || effort === "max")) {
      errors.push(`400 예측: opus-5는 effort=${effort}에서 thinking:disabled 불가`);
    }
  }
  return { ok: errors.length === 0, errors };
}
```

4.8에서 그대로 넘어온 config 4개를 넣어 돌렸다.

```text
[FAIL] batch-summarizer (4.8→5 그대로)  400 예측: effort=xhigh에서 thinking:disabled 불가
[FAIL] deep-research (4.8→5 그대로)     400 예측: effort=max에서 thinking:disabled 불가
[OK  ] quick-classify (수정본)
[OK  ] default (thinking on)
config 위반: 2/4
CONFIG GATE: RED (exit 1)
```

두 건이 배포 전에 잡혔다. 실제 API를 호출하지 않고, 문서에 적힌 규칙을 그대로 코드로 옮긴 것만으로 400을 예측했다. 물론 이 검증기는 내가 아는 규칙만 안다. 문서에 명시된 계약을 미러링한 얕은 게이트이지, 모든 파괴적 변경을 자동으로 알아내진 못한다. 그래도 모델을 올릴 때마다 릴리스 노트의 breaking change를 이 파일 한 곳에 규칙으로 적어두면, 다음 버전 업에서 같은 함정을 반복하지 않는다. 인젝션 회귀와 config 회귀를 한 게이트로 묶는 이유가 여기 있다. 트리거가 같기 때문이다. "모델을 올렸다"가 둘 다를 다시 재게 만든다.

## 이 게이트가 하지 못하는 것

이 실험을 "인젝션을 풀었다"로 읽으면 안 된다.

첫째, 탐지율 수치는 내가 손으로 짠 스위트에 대한 값이다. 절대 보안 수준이 아니라 회귀 여부를 재는 상대 지표다. 100%는 "내가 아는 공격군을 다 잡았다"는 뜻이지 "안 뚫린다"는 뜻이 아니다. 정규식 기반 탐지기에는 원리적으로 오탐과 미탐의 여지가 있다. 새로운 인코딩, 다국어 난독화, 문구를 우회하는 의미 수준 공격은 얼마든지 이 스위트를 빠져나간다. 프롬프트 인젝션은 아직 미해결 문제이고, OWASP도 이걸 LLM 애플리케이션 최상위 위험(LLM01)으로 둔다.

둘째, 가드는 모델 수정이 아니다. 입력 방화벽 한 겹으로 끝낼 문제가 아니라, 출력 검증과 최소권한이 함께 가야 한다. 모델이 애초에 비밀정보에 손댈 수 없고, 호출할 수 있는 툴이 화이트리스트로 묶여 있으면, 인젝션이 한 겹을 뚫어도 할 수 있는 게 없다. 이 최소권한 쪽 절반은 [AI 코딩의 비밀정보 유출과 MCP config 보안](/ko/blog/ko/ai-coding-secrets-sprawl-mcp-config-security/)에서 따로 다뤘다. 게이트는 그 방어들이 조용히 무너지지 않게 지키는 장치일 뿐, 방어 그 자체는 아니다.

셋째, GPT-Red의 84%나 95% 같은 제3자 수치는 발표 기준의 참고값이다. 나는 OpenAI 원문 페이지를 직접 확인하려다 접근이 막혀 축자 인용 대신 링크로만 남겼다. 검증되지 않은 수치를 내 실측인 양 쓰지 않으려는 구분이다.

## 정리: 방어를 한 번이 아니라 매 버전마다

이번에 확인한 건 단순하다. 인젝션 취약성도 config 유효성도 모델 버전에 종속된 값이고, 종속된 값은 버전이 바뀌면 다시 재야 한다. 방어를 코드에 한 번 심고 잊는 대신, 의존성 버전 업과 같은 취급으로 매번 재실행하는 회귀 게이트로 만드는 게 이 글의 결론이다. 다음 항목만 지키면 팀에서 바로 시작할 수 있다.

- 알려진 인젝션 공격군을 공격군당 최소 1건씩, 버전 관리되는 JSON 스위트로 고정한다. 정상 입력도 섞어 오탐까지 회귀로 잡는다.
- 게이트 대상은 모델이 아니라 내가 통제하는 가드 계층으로 둔다. 결정적이고 값싸서 매 커밋에 돌릴 수 있다.
- 인젝션이 하나라도 새거나 정상이 하나라도 막히면 `exit 1`로 배포를 세운다. 통과율 임계값을 명시한다.
- 모델·프롬프트·가드를 건드릴 때마다 다시 돌린다. 특히 모델 버전 업은 트리거로 못 박는다.
- 대상 모델별 config 계약 테스트를 같은 게이트에 붙인다. Opus 5의 thinking·effort 조합처럼 릴리스 노트의 breaking change를 규칙으로 적어 400을 로컬에서 예측한다.
- 게이트는 방어의 전부가 아니다. 최소권한과 출력 검증을 함께 두고, 게이트는 그것들이 후퇴하지 않게 지키는 역할로 쓴다.

자기 파이프라인에서 어느 공격군이 먼저 새는지, 모델을 올렸을 때 config가 어디서 깨지는지 — 이 둘을 함께 재보고 게이트로 남기는 작업이 필요한 팀이라면 프로필의 연락 경로로 닿을 수 있다. 상담과 구현 모두 받는다.
