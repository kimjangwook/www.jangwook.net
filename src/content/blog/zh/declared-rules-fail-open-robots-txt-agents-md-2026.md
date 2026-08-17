---
title: '规则没有生效，为什么两边都当成通过了'
description: '我在两行 robots.txt 里调换顺序，urllib 的结果当场反转。把 34 KiB 的 AGENTS.md 喂给 Codex，文件后半截的测试标记变成 0 命中，终端没有报错。声明式规则解析失败时不会停下，只会假装规则不存在。'
pubDate: '2026-08-17'
heroImage: '../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png'
tags:
  - SEO
  - 爬虫
  - AI开发
  - 架构
  - Web开发
faq:
  - question: '为什么修改了 robots.txt 之后某些爬虫依然能抓取？'
    answer: '很多专有 User-agent 分组只写 Crawl-delay 或空行时，会脱离全局通配符的拦截规则。RFC 9309 规定，没有规则的分组默认放行，解析器都会判定为 ALLOWED。'
  - question: 'AGENTS.md 文件过大会发生什么？'
    answer: 'Codex 拼接规则文件时受 project_doc_max_bytes 默认 32768 字节的限制。超出上限，文件末尾的指令会被截断，过程仍返回状态码 0，不输出截断警告。'
  - question: '为什么不能完全依赖 urllib.robotparser 做测试？'
    answer: 'Python 内置的 urllib.robotparser 在实测 11 个场景中仅 5 个符合标准。它做路径前缀对比，命中第一行就返回，不支持最长匹配和通配符。'
  - question: '如何确保敏感资源不被爬虫或 AI 智能体误读？'
    answer: '敏感资源必须在服务端响应层通过身份认证或 HTTP 状态码拦截。robots.txt 与 AGENTS.md 是无约束请求协议，不能当访问控制屏障。'
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: robots.txt와 llms.txt의 선언 계층 차이를 다룬 글이다. 이번 글은 그 선언이 파서와 모델에 도달하지 못했을 때의 침묵 실패를 측정한다.
      ja: robots.txtとllms.txtの宣言層の違いを扱った記事だ。今回はその宣言がパーサーやモデルに届かないときのサイレントな失敗を測定した。
      en: That post covered the declaration layers of robots.txt and llms.txt. This one measures silent fail-open behaviors when declarations fail to reach parsers and models.
      zh: 那篇讲了 robots.txt 和 llms.txt 的声明层差异。这篇测量这些声明在没有送达解析器或模型时的静默失效。
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.84
    reason:
      ko: 지시문 파일이 프롬프트 컨텍스트에 어떻게 실리는지 다룬 글이다. 이번 글은 그 파일이 바이트 한도를 넘었을 때의 잘림과 확률적 망각을 다룬다.
      ja: 指示ファイルがプロンプトのコンテキストにどう載るかを扱った記事だ。今回はファイルがバイト上限を超えたときの切り捨てと確率的忘却を掘り下げた。
      en: That post analyzed how agent instruction files load into prompt contexts. This one examines clipping and probabilistic omission when files cross byte limits.
      zh: 那篇分析了智能体指令文件如何加载进提示词上下文。这篇进一步测量文件超出字节限制时的截断与概率性遗漏。
  - slug: robots-meta-head-body-parser-placement-2026
    score: 0.81
    reason:
      ko: HTML 파서가 head 요소를 닫으면서 메타 지시자가 사라지는 과정을 다뤘다. 이번 글은 파서의 경로 평가와 에이전트의 규칙 해석에서 일어나는 같은 형태의 실패를 다룬다.
      ja: HTMLパーサーがheadを閉じることでメタ指示が消える過程を追った。今回はパーサーのパス評価とエージェントのルール解釈で起きる同種の失敗を扱う。
      en: That post tracked how HTML parsers close the head and drop meta directives. This one addresses the same class of failure across path parsers and agent rule interpreters.
      zh: 那篇追踪了 HTML 解析器提前关闭 head 导致元指令失效的过程。这篇讨论路径解析器与智能体规则解释中发生的同类失效。
---

![robots.txt 与 AGENTS.md 在解析截断与规则失效时的对比矩阵](../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png)

## 调换两行顺序，返回值翻转

```bash
# 相同的两行，仅调换顺序，urllib 的结果发生翻转
cd "$(mktemp -d)"
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /p' 'Allow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
printf '%s\n' 'User-agent: GPTBot' 'Allow: /p' 'Disallow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
```

输出依次为 DISALLOWED、ALLOWED。

> If an "allow" rule and a "disallow" rule are equivalent, then the "allow" rule SHOULD be used.
> — [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.txt)

> The most specific match found MUST be used.  The most specific match is the match that has the most octets.
> — [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.txt)

标准要求相同权重用 allow、最长匹配；urllib 按前缀首行返回。

行号决定结果。`tie-disallow-first` 下 urllib 为 0/3，换成 `tie-allow-first` 后为 3/3。

## 专用分组写延迟，全局拦截蒸发

```bash
# 专用分组中只写 Crawl-delay，上方的全局 Disallow 会失效，三个解析器全给 ALLOWED
printf '%s\n' 'User-agent: *' 'Disallow: /' '' 'User-agent: GPTBot' 'Crawl-delay: 10' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/docs/page.html") else "DISALLOWED")'
```

> User agent specific groups and global groups (*) are not combined.
> — [Google Search Central Robots.txt Documentation](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)

> If no match is found amongst the rules in a group for a matching user-agent or there are no rules in the group, the URI is allowed.
> — [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.txt)

专有 UA 分组不与全局合并；无规则即放行。GPTBot 开组后，全局 `Disallow: /` 失效。

## 33 个测试矩阵里的静默放行

33 个单元每个跑 3 次，共 99 次。protego 10/11，robots-parser 9/11，urllib.robotparser 5/11。10 个原本期望拦截的单元给出 ALLOWED 或 UNDEFINED。

| 场景 | protego (0.6.2) | robots-parser (3.0.1) | urllib (CPython 3.12.8) | 期望判定 |
| --- | --- | --- | --- | --- |
| 基础放行对照 (control-plain) | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| 最长匹配优先 (longest-match-allow) | ALLOWED | ALLOWED | DISALLOWED | ALLOWED |
| 规则平局 disallow 在前 (tie-disallow-first) | ALLOWED | ALLOWED | DISALLOWED | ALLOWED |
| 规则平局 allow 在前 (tie-allow-first) | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| 重复分组合并 (duplicate-groups) | DISALLOWED | DISALLOWED | ALLOWED | DISALLOWED |
| 通配符与尾部锚定 (wildcard-dollar) | DISALLOWED | DISALLOWED | ALLOWED | DISALLOWED |
| 专有分组仅留延迟 (empty-specific-group) | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| UA 大小写混合 (ua-case-mismatch) | DISALLOWED | DISALLOWED | DISALLOWED | DISALLOWED |
| 完整 UA 标头匹配 (full-ua-string) | DISALLOWED | ALLOWED | ALLOWED | DISALLOWED |
| UTF-8 签名头部 (bom-prefix) | ALLOWED | DISALLOWED | ALLOWED | DISALLOWED |
| 相对路径与查询参数 (bare-path-query) | DISALLOWED | UNDEFINED | DISALLOWED | DISALLOWED |

规则语义 8 个场景里，protego 和 robots-parser 的 24 个单元全对；差异在输入边界。

```bash
# 测试通配符与尾部终止符的解析能力
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /*.json$' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/api/data.json") else "DISALLOWED")'
python3 -m venv venv && ./venv/bin/pip install -q protego
./venv/bin/python -c 'from protego import Protego; r=Protego.parse(open("robots.txt").read()); print("ALLOWED" if r.can_fetch("https://example.test/api/data.json","GPTBot") else "DISALLOWED")'
```

通配符测试中，urllib 输出 ALLOWED，把 `*`、`$` 当普通字符，漏拦截。

```bash
# 传入相对路径时 robots-parser 返回 undefined，被假值判断接收会误读为拦截
npm init -y >/dev/null && npm install robots-parser >/dev/null
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /blocked/' > robots.txt
node -e 'const fs=require("fs"),R=require("robots-parser");const r=R("https://example.test/robots.txt",fs.readFileSync("robots.txt","utf8"));console.log(r.isAllowed("/blocked/x.html","GPTBot"), r.isAllowed("https://example.test/blocked/x.html","GPTBot"))'
```

输出为 `undefined false`。把 `undefined` 当布尔值，会误判拦截。

> This will return `undefined` if the URL isn't valid for this robots.txt.
> — [robots-parser README](https://github.com/samclarke/robots-parser/blob/master/README.md)

## 32 KiB 后的安静截断

> Codex skips empty files and stops adding files once the combined size reaches the limit defined by `project_doc_max_bytes` (32 KiB by default).
> — [Codex Agent Configuration Documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

> Instructions truncated. Raise `project_doc_max_bytes` or split large files across nested directories to keep critical guidance intact.
> — [Codex Agent Configuration Documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

```bash
# 在 AGENTS.md 尾部附加金丝雀标记，对比默认配置与调大上限后的表现
cd "$(mktemp -d)"
yes 'Repo convention filler line used only to grow this document to a target byte size.' | head -c 34000 > body.txt
{ cat body.txt; printf '\nCANARY TOKEN: ZQCX34T\n'; } > AGENTS.md; rm body.txt; wc -c AGENTS.md
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' --skip-git-repo-check
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' -c project_doc_max_bytes=262144 --skip-git-repo-check
```

20 个单元各跑 6 次，共 120 次。

31023 字节（未超限）时，尾部金丝雀 6/6；34022、49022 字节时，头部仍为 6/6；34023、49023 字节时，尾部 0/6。

`project_doc_max_bytes` 从 32768 调到 262144 后，34k、48k 文件的尾部从 0/6 恢复到 6/6。

Codex 不是整份丢弃，而是在 32768 处停止。头部完好，尾部被切掉。120 份输出中 `truncat` 为 0 次，终端没有报错或警告。

> This limit applies only to `MEMORY.md`. CLAUDE.md files are loaded in full regardless of length, though shorter files produce better adherence.
> — [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory)

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory)

实测没有确定性截断墙，反而概率性遗漏。31k 头部 2/6、尾部 4/6；34k 头部 3/6、尾部 1/6；48k 头部 0/6、尾部 2/6。文件全量载入上下文，模型仍无法稳定提取深处指令。

## 声明与执行脱节

声明和执行规则的是两个独立进程，中间没有确认握手或强制中断的错误通道。

`robots.txt`、`AGENTS.md`、`CLAUDE.md`、`llms.txt` 中，解析器读错或上下文截断，消费进程退出码仍是 0。

反对意见是，robots.txt 只是参考建议，AGENTS.md 截断改配置就能解决，两者不该放一起。

反驳中的事实成立。`project_doc_max_bytes` 从 32768 改成 262144，尾部规则全找回；urllib 换成 protego，6 个失配单元修复 4 个。

但核心事实不变。专有 UA 分组仅留延迟时，三解析器按 RFC 放行，换解析器无效。Claude 没可调上限，文档虽说全量加载，48k 头部金丝雀仍 0/6。规范盲区或字节截断都不回传错误，系统继续放行。

## 明天要改的动作

确认解析库，别用 `urllib.robotparser`。

专有分组内重写 `Disallow`，不要只写 `Crawl-delay` 或注释。

敏感资源由服务端鉴权或 HTTP 状态码防御，robots.txt 不是安全边界。

`isAllowed` 区分 `true`、`false`、`undefined`，不要把相对路径的后者判成禁止。

指令文件接近 32 KiB 时拆分或提升 `project_doc_max_bytes`，再用末尾金丝雀确认模型能否复述。

## 这次测量的边界

只测开源解析库和本地环境，未向 GPTBot、ClaudeBot 或 PerplexityBot 发包。目标域名是保留域名 `example.test`，输入来自本地文件和标准输入。

固定版本为 CPython 3.12.8、protego 0.6.2、robots-parser 3.0.1、Codex 0.147.0（gpt-5.6-luna，effort low）、Claude 2.1.233（sonnet）；平台为 macOS 26.5.2、darwin 25.5.0。解析库确定，模型复述率会波动。

未测嵌套 AGENTS.md 累加体积。Claude 测试始终带有全局 `~/.claude/CLAUDE.md`（10951 字节）。
