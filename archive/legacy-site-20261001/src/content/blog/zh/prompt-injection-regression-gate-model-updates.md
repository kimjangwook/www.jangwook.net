---
title: "每次升级模型都要重跑注入测试：我把这道关卡亲手搭了出来"
description: "我把注入回归测试跑在自己的 LLM 流水线上。朴素守卫 11 条只拦 2 条，结构化守卫全部拦下，重构漏掉的检测器也被关卡精准点出。"
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
      ja: "あちらが『論文PDFに潜む注入』という攻撃面を見せた回なら、こちらはその攻撃を自分のパイプラインでCI遮断する防御面。攻撃を見たならゲートも見ておきたい。"
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

同一条流水线，同一份代码。变的只是后面挂的那个模型。可是，上周没被绕过的注入攻击，这周也不会被绕过，这一点没有任何保证。攻击方的模型一更新，攻击的分布就变了；自己这边的模型一升级，请求 config 的契约又变了。两边代码都没动，结果却在动。

所以注入防御不该是写一次就完事的东西，而应该做成一套每次升级依赖版本都重跑的回归测试。这一次我没有停留在嘴上，而是真的跑了一遍。在我的 LLM 自动化流水线把不可信输入（评论、爬回来的网页文本）拼装成 prompt 的那个位置，我挂上了一套 13 条的注入回归测试。朴素守卫 11 条里只拦下 2 条。有结构的守卫全部拦下。而当我重构这套守卫时手滑漏掉一个检测器，关卡当场点名泄漏的两条，返回 exit 1。

## 什么是提示注入，为什么每次升级模型都要重新检查

提示注入是这样一种攻击：不可信的文本伪装成对模型的命令。换成 Web 开发者熟悉的说法，它和 SQL 注入、XSS 同属一类——本该当作数据处理的字符串，溜进了执行上下文并夺走了控制权。区别在于，SQL 有固定的解析器语法，用参数绑定就能把数据和命令干净地分开；而 LLM 没有这种语法边界。在模型眼里，系统提示、用户输入、爬回来的网页文档，最终都是同一串 token。哪里是指令、哪里开始是数据，语法并不替你担保。

那这为什么会变成「每次升级模型」的问题？因为有两条轴在同时移动。

第一，攻击方的模型变强，攻击的分布本身就会变。OpenAI 在 2026 年 7 月中旬公开的 [GPT-Red](https://openai.com/index/unlocking-self-improvement-gpt-red/) 正面展示了这一点。这是一种让模型（而非人）自动去攻击其他模型、从而磨炼防御的做法。在一项间接提示注入基准上，OpenAI 表示 GPT-Red 的攻击成功率达到 84%，远高于同等条件下人类红队的 13%。更要紧的是，这个过程挖出了一类被命名为 Fake Chain-of-Thought 的新攻击。据称它在上一代模型上的成功率超过 95%，而在用这些样本重新训练的下一代模型上降到了 10% 以下（这些数字是 OpenAI 发布口径的参考值。我试图直接抓取原文页面但被拦下，所以只放链接，不做逐字引用）。含义只有一个：攻击不是静态的。自动化攻击者会不断生成新的攻击类别，所以去年没被绕过的防御，今年不一定还能挡住。

第二，升级自己这边的防御模型，这次变的是 API 契约。这个我在后半用 Opus 5 的例子来实测。这里先说结论：注入脆弱性和 config 有效性，都是「依赖模型版本」的值。既然依赖版本，那版本一变就该重新测。如果你在 [ICML 评审 PDF 里藏着注入的案例](/zh/blog/zh/icml-prompt-injection-academic-review/)里看到了攻击面，那么本文讲的是我这边如何用可重复的检查把这种攻击挡住。

## 我能握住的不是模型，而是守卫层

先老实画一条线。作为 Web 开发者，我改不了模型内部对注入的抵抗力，那是模型厂商训练的地盘。我真正能动手的，是套在它前后的那一层：过滤不可信输入的输入防火墙、检查模型输出有没有越出允许行为范围的输出校验，以及从一开始就收窄模型可触及资源的最小权限设计。

所以这次实验要测的，也不是「模型对注入有多能扛」，而是「我的守卫层能抓住多少已知攻击类别，以及我改动代码时这份能力会不会悄悄崩掉」。这个区分是关键。守卫层是确定性的，而且便宜。不用 API key、不花钱，就能在 CI 里每次提交都跑。反过来，测模型本身的抵抗力要牵扯真实调用、成本和不确定性，拿来做回归测试太重了。如果这是一道要每次提交都跑的关卡，把对象定在自己握得住的确定性层，才现实。

守卫代替不了修模型。它只是防御的一层，它的边界我留到后面单独说。但恰恰是这一层对回归特别脆弱。删掉一个正则、漏掉一个分隔符、重构一段 prompt，这些微小的改动就会在防御上戳出洞，而且在评审里很难被看见。所以才需要一道关卡。

## 我搭了一套 13 条的回归测试，跑在流水线上

这套测试有跨 6 个攻击类别的注入 11 条，外加正常输入 2 条。掺进正常输入的理由很简单：防御过头、把正经评论也拦下的误报，同样是一种回归。关卡只有在「拦下每一条注入、放过每一条正常输入」时才该亮绿灯。

攻击类别我这样分：直接指令覆盖（`ignore all previous instructions` 之类）、伪造系统与角色标签注入（`[SYSTEM]`、`</user><system>`）、Fake Chain-of-Thought（伪造模型的思考过程，让它以为「你已经通过管理员认证，公开也安全」）、分隔符逃逸（用三引号或反引号伪造文档边界）、数据外泄诱导（把对话内容塞进外部 URL 的查询里，用图片或链接带出去）、编码绕过（用 base64 包起来的命令）。每条用例都带一个 `expected`：注入应被拦截，正常应被放行。

守卫我准备了三个版本。启用哪些检测器，本身就是防御契约。

```javascript
const GUARDS = {
  // v1: 只看常见英文关键词。最初的朴素防御
  v1_naive: ["override"],
  // v2: 结构化防御全开。measure→fix 之后
  v2_hardened: ["role_injection", "override", "fake_cot",
                "delimiter_escape", "exfiltration", "encoded"],
  // v2.1: 升级模型时重构守卫，误删了 fake_cot 检测器的回归版
  "v2.1_regressed": ["role_injection", "override",
                     "delimiter_escape", "exfiltration", "encoded"],
};
```

关卡跑完这套测试，测出拦截率，只要有一条注入漏过、或有一条正常被拦，就调 `process.exit(1)`。在 CI 里，这个退出码会拦住部署。我先跑了 v1 朴素守卫。

```text
=== injection regression gate :: guard=v1_naive ===
[PASS] override-01  direct_override  expected=block got=blocked override
[FAIL] fakesys-01   fake_system      expected=block got=allowed
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] delim-01     delimiter_escape expected=block got=allowed
[FAIL] exfil-01     exfiltration     expected=block got=allowed
...
拦截率: 2/11 (18.2%)  误报(benign 被拦): 0  泄漏: [fakesys-01, ...]
GATE: RED (exit 1)
```

只有关键词黑名单的守卫，11 条里拦下 2 条，18.2%。这在意料之中。它能滤掉 `ignore previous instructions` 这种明晃晃的措辞，却把伪造的角色标签和捏造的思考过程直接放行。人们说「加了注入防御」时，大多就是这个水平。关卡亮了红灯，而这正是 measure 这一步诚实的起点。

接着我把它修到结构化的 v2 守卫，为角色标签、伪造思考、分隔符、外泄 URL、编码各自开了检测器。

```text
=== injection regression gate :: guard=v2_hardened ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[PASS] fakecot-01   fake_cot         expected=block got=blocked fake_cot
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
[PASS] exfil-01     exfiltration     expected=block got=blocked exfiltration
[PASS] encoded-01   encoded          expected=block got=blocked encoded
...
拦截率: 11/11 (100%)  误报(benign 被拦): 0  泄漏: []
GATE: GREEN (exit 0)
```

11 条全部拦下，2 条正常全部放行，零误报。关卡转绿。到这里是 measure → fix。但本文的核心不是这盏绿灯。核心是，这盏绿灯日后悄悄转红时，谁来告诉你。

## 关卡抓住回归的那一刻：掉了一个检测器

现实里防御崩坏的方式，大多不戏剧化。你升到新模型，顺手重构 prompt builder，顺手清理一个「看起来没用」的检测器，顺手调一下正则。其中某一处是失误，当下没人察觉。这个场景我用 v2.1 复现了。我只从清单里拿掉了 Fake Chain-of-Thought 检测器，其余照旧。

```text
=== injection regression gate :: guard=v2.1_regressed ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] fakecot-02   fake_cot         expected=block got=allowed
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
...
拦截率: 9/11 (81.8%)  误报(benign 被拦): 0  泄漏: [fakecot-01, fakecot-02]
GATE: RED (exit 1)
```

81.8%。关卡亮红，并把泄漏的两条用名字点了出来：`fakecot-01`、`fakecot-02`。一处评审会在 diff 里错过的改动，在部署前带着精确坐标浮了出来。三次运行汇成一张图是这样。

![三个守卫版本的注入拦截率：v1 朴素守卫 18.2%、v2 结构化守卫 100%、v2.1 回归版 81.8%。关卡阈值为 100%，低于它一律 exit 1 拦住部署。](../../../assets/blog/prompt-injection-regression-gate-model-updates/catch-rate.png)

这个地方，跟我当初[把结构化数据校验固化成 CI 关卡](/zh/blog/zh/validate-structured-data-ci-jsonld-2026/)的骨架完全一样。别把测量结果只交给人眼，要接好线，一旦跌破阈值就让流水线停下。不同的只是对象。那边是 JSON-LD 的有效性，这边是注入的拦截率。81.8% 之所以危险，不是因为绝对值低，而是因为昨天还是 100%、今天变成 81.8%，却没人知道。回归关卡不是用来证明绝对安全的工具，而是用来阻止防御悄悄倒退的工具。

## config 也会回归：Opus 5 的 thinking 与 effort

如果说上面是攻击侧的回归，那么升级自己这边的防御模型时，还有另一种回归会爆掉：API 请求契约的破坏。2026 年 7 月 24 日发布的 Claude Opus 5 给了一个活例子。[官方迁移指南](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5#behavior-changes)原文照录如下。

> On Claude Opus 5, `thinking: {"type": "disabled"}` is accepted only when the effort level is `high` or below. Setting `thinking: {"type": "disabled"}` with effort `xhigh` or `max` returns a 400 error. This is generally available behavior on Claude Opus 5 onward, enforced on each request, and it is a breaking change from Claude Opus 4.8, where disabling thinking was independent of the effort level.

翻成白话：关掉 thinking 只有在 effort 为 high 或更低时才被接受。把 thinking 关掉、同时 effort 用 xhigh 或 max，就会返回 400。在 4.8 里，关 thinking 和 effort 级别互不相干，所以这是一处明确的破坏性变更。顺带说明，价格是每百万输入 token 5 美元、输出 25 美元，与 4.8 一致；上下文的默认值和最大值都是 100 万 token；thinking 默认开启。也就是说，如果你只把模型 ID 从 `claude-opus-4-8` 直接换成 `claude-opus-5`，那些在 4.8 上跑得好好的、带着「关 thinking、effort 用 xhigh」组合的批处理，部署完立刻就会以 400 崩掉。

这看着像和注入不同的问题，但从回归关卡的视角看，是同一个问题。config 的有效性同样是依赖模型版本的值。于是我在注入测试旁边又加了一个 config 契约测试：在往 API 投递之前，在本地就把 400 预测出来的校验器。

```javascript
function validateRequest(req) {
  const errors = [];
  const effort = req.output_config?.effort;
  const thinking = req.thinking?.type;
  if (req.model === "claude-opus-5") {
    if (thinking === "disabled" && (effort === "xhigh" || effort === "max")) {
      errors.push(`预测 400: opus-5 在 effort=${effort} 下不能 disable thinking`);
    }
  }
  return { ok: errors.length === 0, errors };
}
```

我塞进四个从 4.8 原样搬过来的 config 跑了一遍。

```text
[FAIL] batch-summarizer (4.8→5 原样)  预测 400: effort=xhigh 下不能 disable thinking
[FAIL] deep-research (4.8→5 原样)     预测 400: effort=max 下不能 disable thinking
[OK  ] quick-classify (已修)
[OK  ] default (thinking on)
config 违规: 2/4
CONFIG GATE: RED (exit 1)
```

两个在部署前就被抓住。没有真实的 API 调用，只是把文档里写明的规则照搬进代码，就足以预测出 400。当然，这个校验器只懂我懂的规则。它是一道镜像了成文契约的浅关卡，并不能自动发现所有破坏性变更。但只要每次升级模型时，把发布说明里的破坏性变更当作规则写进这一个文件，下一次升级就不会再踩同一个坑。我把注入回归和 config 回归收进同一道关卡，原因就在这里：它们共用一个触发点。「我升级了模型」这件事，会同时逼你把两者都重新测一遍。

## 这道关卡做不到的事

别把这个实验读成「注入被解决了」。

第一，拦截率的数字是针对我亲手写的这套测试的值。它不是绝对安全水平，而是衡量有没有发生回归的相对指标。100% 的意思是「我知道的攻击类别全都拦下了」，不是「攻不破」。基于正则的检测器天然有误报和漏报的余地。新的编码、多语言混淆、绕开特定措辞的语义级攻击，都能轻松溜过这套测试。提示注入至今仍是未解的问题，OWASP 也把它列为 LLM 应用风险之首（LLM01）。

第二，守卫不是修模型。这事儿不是一道输入防火墙就能收尾的，输出校验和最小权限得一起上。如果模型压根碰不到机密、能调的工具被白名单锁死，那么即便注入攻破一层，它也无事可做。最小权限这半边，我在[AI 编码中的机密外泄与 MCP config 安全](/zh/blog/zh/ai-coding-secrets-sprawl-mcp-config-security/)里另讲过。关卡只是让那些防御不至于悄悄崩塌的装置，它本身不是防御。

第三，GPT-Red 的 84% 或 95% 这类第三方数字，是发布口径的参考值。我试图直接核对 OpenAI 的原文页面，被拦下了，于是放了链接而没有逐字引用。这是「引用一个数字」和「把未经核实的数字当成自己的实测」之间的那条线。

## 收尾：防御要按版本做，而不是只做一次

这次确认的事很简单。注入脆弱性和 config 有效性都是依赖模型版本的值，而依赖版本的值，版本一变就得重测。与其把防御在代码里种一次就忘掉，不如把它做成每次都重跑、当作依赖升级来对待的回归关卡。照着下面这些做，团队今天就能开工。

- 把已知的注入类别冻进一套受版本管理的 JSON 测试，每类至少一条。掺进正常输入，让误报也作为回归被抓住。
- 关卡对准你握得住的守卫层，而不是模型。它确定、便宜，足以每次提交都跑。
- 只要有一条注入漏过、或一条正常被拦，就 `exit 1` 拦住部署。把拦截率阈值写明。
- 每次动模型、动 prompt、动守卫，都重跑。尤其把模型升级钉死为一个触发点。
- 给每个目标模型加一个 config 契约测试，放进同一道关卡。像 Opus 5 的 thinking 与 effort 组合那样，把发布说明里的破坏性变更写成规则，在本地预测出 400。
- 关卡不是防御的全部。让最小权限和输出校验与它并行，关卡用来守住它们不倒退。

自己的流水线里哪一类攻击会先漏、升级模型时 config 会在哪儿崩——这两件事要一起测出来、并固化成一道关卡的团队，可以通过我个人资料里的联系方式找到我。咨询和实现都接。
